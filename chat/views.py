import re
import json
from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.auth.models import User
from django.contrib.auth import authenticate, login, logout
from django.db import models 
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.contrib.auth.decorators import login_required
from django.utils import timezone
from datetime import timedelta
from itertools import groupby

# Soo dhoweynta Models-ka iyo Forms-ka
from .models import Profile, Message, ContactRequest, FavoriteSticker, Status, StatusView, GlobalBillboard
from .forms import StatusForm

# ==========================================
# 1. LOGIC-GA GENERATE ID (B0 - ZZ1000)
# ==========================================
def increment_prefix(prefix):
    if prefix == "": return "B"
    last_char = prefix[-1]
    if last_char == 'Z':
        return increment_prefix(prefix[:-1]) + 'A'
    return prefix[:-1] + chr(ord(last_char) + 1)

def get_next_system_id():
    last_profile = Profile.objects.filter(system_id__regex=r'^[B-Z]').order_by('-id').first()
    if not last_profile or not last_profile.system_id:
        return "B0"
    match = re.match(r"([A-Z]+)([0-9]+)", last_profile.system_id)
    if not match:
        return "B0"
    prefix, number = match.groups()
    number = int(number)
    if number < 1000:
        return f"{prefix}{number + 1}"
    else:
        return f"{increment_prefix(prefix)}0"

# ==========================================
# 2. BOGGA HORE (HOME PAGE)
# ==========================================
@login_required
def index(request):
    profile = getattr(request.user, 'profile', None)
    my_id = profile.system_id if profile else None
    if profile:
        profile.last_login_date = timezone.now()
        profile.save()
    if my_id:
        pending_requests = ContactRequest.objects.filter(to_system_id=my_id, status='pending')
        accepted_requests = ContactRequest.objects.filter(
            (models.Q(from_user=request.user) | models.Q(to_system_id=my_id)),
            status='accepted'
        )
    else:
        pending_requests = []
        accepted_requests = []
    
    friends = []
    for req in accepted_requests:
        if req.from_user == request.user:
            friend_profile = Profile.objects.filter(system_id=req.to_system_id).first()
            if friend_profile:
                friends.append(friend_profile.user)
        else:
            friends.append(req.from_user)
            
    billboard_items = GlobalBillboard.objects.filter(is_active=True).order_by('-created_at')
    return render(request, 'index.html', {
        'requests': pending_requests,
        'friends': list(set(friends)), 
        'billboard_items': billboard_items,
        'profile': profile
    })

# ==========================================
# 3. AUTH (SIGNUP, LOGIN, LOGOUT)
# ==========================================
def signup(request):
    if request.method == 'POST':
        full_name = request.POST.get('full_name')
        p = request.POST.get('password')
        new_id = get_next_system_id()
        new_user = User.objects.create_user(username=new_id, password=p)
        # Halkan waxaan ku darnay magaca oo loo qaybiyay first/last
        name_parts = full_name.split(' ', 1)
        new_user.first_name = name_parts[0]
        if len(name_parts) > 1:
            new_user.last_name = name_parts[1]
        new_user.save()
        
        Profile.objects.create(user=new_user, full_name=full_name, system_id=new_id, last_login_date=timezone.now())
        return render(request, 'register_success.html', {'new_id': new_id}) 
    return render(request, 'signup.html')

def user_login(request):
    if request.method == 'POST':
        sid = request.POST.get('system_id')
        p = request.POST.get('password')
        user = authenticate(request, username=sid, password=p)
        if user:
            login(request, user)
            profile = user.profile
            profile.last_login_date = timezone.now()
            profile.save()
            return redirect('index')
        return render(request, 'login.html', {'error': 'ID-ga ama Password-ka waa khalad'})
    return render(request, 'login.html')

def user_logout(request):
    logout(request)
    return redirect('login')

# ==========================================
# 4. CHAT ROOM & MESSAGES
# ==========================================
@login_required
def chat_room(request, username):
    other_user = get_object_or_404(User, username=username)
    messages = Message.objects.filter(
        (models.Q(sender=request.user) & models.Q(receiver=other_user)) |
        (models.Q(sender=other_user) & models.Q(receiver=request.user))
    ).exclude(deleted_by_users=request.user).order_by('timestamp')
    fav_stickers = FavoriteSticker.objects.filter(user=request.user)
    target_msg_id = request.GET.get('msg_id')
    
    if request.method == 'POST':
        msg_text = request.POST.get('message')
        msg_image = request.FILES.get('image')
        msg_video = request.FILES.get('video')
        msg_doc = request.FILES.get('document')
        msg_audio = request.FILES.get('voice_note')
        is_sticker_sent = request.POST.get('is_sticker') == 'true'
        reply_id = request.POST.get('reply_to_id')
        reply_to_obj = Message.objects.filter(id=reply_id).first() if reply_id else None
        
        if any([msg_text, msg_image, msg_video, msg_doc, msg_audio, is_sticker_sent]):
            Message.objects.create(
                sender=request.user, receiver=other_user, message=msg_text,
                image=msg_image, video=msg_video, document=msg_doc,
                voice_note=msg_audio, is_sticker=is_sticker_sent, reply_to=reply_to_obj 
            )
            return redirect('chat_room', username=username)
            
    return render(request, 'chat_room.html', {
        'other_user': other_user, 'messages': messages,
        'fav_stickers': fav_stickers, 'target_msg_id': target_msg_id
    })

# ==========================================
# 5. STATUS SYSTEM
# ==========================================
@login_required
def upload_status(request):
    if request.method == 'POST':
        form = StatusForm(request.POST, request.FILES)
        if form.is_valid():
            status = form.save(commit=False)
            status.user = request.user
            status.save()
            return redirect('status_list')
    else:
        form = StatusForm()
    return render(request, 'upload_status.html', {'form': form})

@login_required
def status_list(request):
    time_threshold = timezone.now() - timedelta(hours=24)
    profile = getattr(request.user, 'profile', None)
    my_id = profile.system_id if profile else None
    
    accepted_requests = ContactRequest.objects.filter(
        (models.Q(from_user=request.user) | models.Q(to_system_id=my_id)), status='accepted'
    )
    
    friend_ids = []
    for req in accepted_requests:
        if req.from_user == request.user:
            friend_profile = Profile.objects.filter(system_id=req.to_system_id).first()
            if friend_profile: friend_ids.append(friend_profile.user.id)
        else:
            friend_ids.append(req.from_user.id)
            
    active_statuses = Status.objects.filter(user_id__in=friend_ids, created_at__gte=time_threshold).order_by('user', 'created_at')
    grouped_statuses = []
    for user, statuses in groupby(active_statuses, key=lambda x: x.user):
        statuses_list = list(statuses)
        grouped_statuses.append({'user': user, 'last_status': statuses_list[-1], 'all_statuses': statuses_list, 'count': len(statuses_list)})
    
    my_status_query = Status.objects.filter(user=request.user, created_at__gte=time_threshold).order_by('created_at')
    my_status_group = None
    if my_status_query.exists():
        my_list = list(my_status_query)
        my_status_group = {'all_statuses': my_list, 'last_status': my_list[-1], 'count': len(my_list)}
        
    return render(request, 'status_page.html', {'grouped_statuses': grouped_statuses, 'my_status_group': my_status_group})

@login_required
def mark_status_as_viewed(request, status_id):
    status = get_object_or_404(Status, id=status_id)
    if status.user != request.user:
        StatusView.objects.get_or_create(status=status, viewer=request.user)
    return JsonResponse({'status': 'viewed'})

@login_required
def delete_status(request, status_id):
    status = get_object_or_404(Status, id=status_id, user=request.user)
    status.delete()
    return redirect('status_list')

@login_required
@csrf_exempt
def reply_to_status(request, status_id):
    status = get_object_or_404(Status, id=status_id)
    if request.method == 'POST':
        msg_text = request.POST.get('message')
        Message.objects.create(sender=request.user, receiver=status.user, message=msg_text, status_reply=status, is_status_reply=True)
        return JsonResponse({'status': 'success'})
    return JsonResponse({'status': 'error'}, status=400)

# ==========================================
# 6. CONTACTS & SEARCH (SAXIDDA SYSTEM ID)
# ==========================================
@login_required
def search_contact(request):
    if request.method == 'POST':
        # Waxaan ka dhignay 'target_id' si uu ula mid noqdo HTML-ka
        sid = request.POST.get('target_id', '').strip()
        profile = Profile.objects.filter(system_id__iexact=sid).first()
        
        if profile:
            if profile.user == request.user:
                 return render(request, 'search_results.html', {'error': 'Isma raadin kartid'})
            return render(request, 'search_results.html', {'found_user': profile})
        
        return render(request, 'search_result.html', {'error': 'ID-gan lama helin'})
    return render(request, 'search_contact.html')

@login_required
def send_request(request, system_id):
    """ Dirista codsiga saaxiibtinimo iyadoo la isticmaalayo System ID """
    ContactRequest.objects.get_or_create(from_user=request.user, to_system_id=system_id, status='pending')
    return redirect('index')

@login_required
def accept_request(request, request_id):
    c_request = get_object_or_404(ContactRequest, id=request_id)
    profile = getattr(request.user, 'profile', None)
    if profile and c_request.to_system_id == profile.system_id:
        c_request.status = 'accepted'
        c_request.save()
    return redirect('index')

@login_required
def reject_request(request, request_id):
    c_request = get_object_or_404(ContactRequest, id=request_id)
    profile = getattr(request.user, 'profile', None)
    if profile and c_request.to_system_id == profile.system_id:
        c_request.delete()
    return redirect('index')

# ==========================================
# 7. PROFILE & SETTINGS
# ==========================================
@login_required
def settings_page(request):
    profile, created = Profile.objects.get_or_create(user=request.user)
    if request.method == 'POST':
        profile.full_name = request.POST.get('full_name', profile.full_name)
        profile.about = request.POST.get('about', profile.about)
        if request.FILES.get('profile_image'):
            profile.profile_pic = request.FILES.get('profile_image')
        profile.save()
        return redirect('index')
    return render(request, 'settings.html', {'profile': profile})

@login_required
def update_profile(request):
    return settings_page(request)

# ==========================================
# 8. ADDITIONAL FUNCTIONS (Star, Delete, Sticker)
# ==========================================
@csrf_exempt
@login_required
def toggle_star_message(request):
    if request.method == 'POST':
        msg_id = request.POST.get('message_id')
        if msg_id:
            msg = get_object_or_404(Message, id=msg_id)
            if request.user in msg.starred_by.all():
                msg.starred_by.remove(request.user)
                return JsonResponse({'status': 'success', 'starred': False})
            else:
                msg.starred_by.add(request.user)
                return JsonResponse({'status': 'success', 'starred': True})
    return JsonResponse({'status': 'error'}, status=400)

@login_required
def starred_messages(request):
    fav_messages = request.user.starred_messages.all().select_related('sender', 'receiver').order_by('-timestamp')
    return render(request, 'starred_messages.html', {'favorites': [{'message': m} for m in fav_messages]})

@csrf_exempt
@login_required
def delete_message(request, message_id):
    if request.method == 'POST':
        msg = get_object_or_404(Message, id=message_id)
        delete_type = request.POST.get('delete_type') 
        if delete_type == 'everyone' and msg.sender == request.user:
            msg.is_deleted_everyone = True
            msg.message = "Fariintan waa la tirtiray"
            msg.image = None; msg.video = None; msg.document = None; msg.voice_note = None; msg.is_sticker = False
        else:
            msg.deleted_by_users.add(request.user)
        msg.save()
        return JsonResponse({'status': 'success'})
    return JsonResponse({'status': 'error'}, status=400)

@csrf_exempt
@login_required
def toggle_favorite_sticker(request):
    if request.method == 'POST':
        url = request.POST.get('image_url')
        sticker, created = FavoriteSticker.objects.get_or_create(user=request.user, image_url=url)
        if not created: 
            sticker.delete()
            return JsonResponse({'status': 'removed'})
        return JsonResponse({'status': 'added'})
    return JsonResponse({'status': 'error'}, status=400)

# ==========================================
# 9. BILLBOARD, QUIZ & CALLS
# ==========================================
@login_required
def billboard_view(request):
    items = GlobalBillboard.objects.filter(is_active=True).order_by('-created_at')
    return render(request, 'billboard.html', {'items': items})

@login_required
def quiz_page(request, quiz_id):
    quiz = get_object_or_404(GlobalBillboard, id=quiz_id)
    return render(request, 'quiz_page.html', {'quiz': quiz, 'questions': quiz.questions.all()})

@login_required
def make_call(request, username):
    return render(request, 'call.html', {'other_user': username, 'type': 'calling'})

@login_required
def receive_call(request):
    return render(request, 'call.html', {'type': 'receiving'})