from django.db import models
from django.contrib.auth.models import User
from django.utils import timezone
from datetime import timedelta

# ==========================================
# 1. GLOBAL BILLBOARD (ADMIN SYSTEM)
# ==========================================
class GlobalBillboard(models.Model):
    CONTENT_TYPES = (
        ('image', 'Sawir'),
        ('video', 'Muuqaal'),
        ('audio', 'Cod'),
        ('quiz', 'Su’aalo Quiz ah'),
        ('document', 'PDF ama Buug'),
    )
    title = models.CharField(max_length=200)
    content_type = models.CharField(max_length=10, choices=CONTENT_TYPES)
    file = models.FileField(upload_to='billboard/', null=True, blank=True)
    link = models.URLField(null=True, blank=True) 
    text_content = models.TextField(null=True, blank=True) 
    is_active = models.BooleanField(default=True) 
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.title} ({self.get_content_type_display()})"

# ==========================================
# 2. QUIZ QUESTIONS SYSTEM
# ==========================================
class QuizQuestion(models.Model):
    billboard = models.ForeignKey(GlobalBillboard, on_delete=models.CASCADE, related_name='questions')
    question_text = models.CharField(max_length=500)
    option1 = models.CharField(max_length=200)
    option2 = models.CharField(max_length=200)
    option3 = models.CharField(max_length=200)
    option4 = models.CharField(max_length=200)
    correct_option = models.IntegerField(help_text="Gali 1, 2, 3 ama 4 (Jawaabta saxda ah)")

    def __str__(self):
        return self.question_text

# ==========================================
# 3. USER PROFILE (Nidaamka A0, B1, B2 oo Sax ah)
# ==========================================
class Profile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    full_name = models.CharField(max_length=255, help_text="Magaca saddexan ee qofka")
    
    # System ID: Sida B15, A20 (Waa inuu unique yahay)
    system_id = models.CharField(max_length=20, unique=True, null=True, blank=True)
    
    # DARJOOYINKA (BADGES):
    # 0 = A0 (Owner/Admin) -> Calan + Xiddig Dahab ah
    # 1 = B1 (VIP) -> Calan + Xiddig Cad
    # 2 = B2 (Verified) -> Calan Kaliya
    # 3 = User Caadi ah (Default) -> Wax calan ah malaha
    badge_type = models.IntegerField(default=3) 
    
    image = models.ImageField(upload_to='profile_pics/', default='default.jpg')
    about = models.CharField(max_length=200, default="Hey there! I am using WhatsApp.")
    
    # Maareynta 6-da bilood
    last_login_date = models.DateTimeField(default=timezone.now)
    is_account_active = models.BooleanField(default=True)

    def __str__(self):
        status = "User"
        if self.badge_type == 0: status = "A0 (Owner)"
        elif self.badge_type == 1: status = "B1 (VIP)"
        elif self.badge_type == 2: status = "B2 (Verified)"
        return f"{self.full_name} ({self.system_id}) - [{status}]"

    @property
    def is_expired(self):
        """Hubinta haddii 180 maalmood laga joogo login-kii u dambeeyay"""
        return timezone.now() > self.last_login_date + timedelta(days=180)

# ==========================================
# 4. STATUS SYSTEM
# ==========================================
class Status(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='statuses')
    text_content = models.TextField(max_length=500, blank=True, null=True)
    image = models.ImageField(upload_to='status_images/', blank=True, null=True)
    video = models.FileField(upload_to='status_videos/', blank=True, null=True)
    bg_color = models.CharField(max_length=7, default="#075e54") 
    created_at = models.DateTimeField(auto_now_add=True)

    @property
    def is_active(self):
        return timezone.now() < self.created_at + timedelta(hours=24)

    def __str__(self):
        return f"{self.user.username} - Status ({self.created_at})"

    class Meta:
        verbose_name_plural = "Statuses"

# ==========================================
# 5. MESSAGE SYSTEM (Dhamaystiran)
# ==========================================
class Message(models.Model):
    sender = models.ForeignKey(User, on_delete=models.CASCADE, related_name='sent_messages')
    receiver = models.ForeignKey(User, on_delete=models.CASCADE, related_name='received_messages')
    reply_to = models.ForeignKey('self', on_delete=models.SET_NULL, null=True, blank=True, related_name='replies')
    
    status_reply = models.ForeignKey(Status, on_delete=models.SET_NULL, null=True, blank=True, related_name='status_messages')
    is_status_reply = models.BooleanField(default=False)
    
    reaction = models.CharField(max_length=20, null=True, blank=True) 
    is_love_reaction = models.BooleanField(default=False) 

    message = models.TextField(blank=True, null=True)
    image = models.ImageField(upload_to='chat_images/', blank=True, null=True)
    video = models.FileField(upload_to='chat_videos/', blank=True, null=True)
    document = models.FileField(upload_to='chat_docs/', blank=True, null=True)
    voice_note = models.FileField(upload_to='chat_audio/', blank=True, null=True)
    is_sticker = models.BooleanField(default=False) 
    
    starred_by = models.ManyToManyField(User, related_name="starred_messages", blank=True)
    is_deleted_everyone = models.BooleanField(default=False) 
    deleted_by_users = models.ManyToManyField(User, blank=True, related_name='deleted_messages_list')
    timestamp = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.sender.username} -> {self.receiver.username}"

# ==========================================
# 6. OTHER MODELS
# ==========================================
class ContactRequest(models.Model):
    from_user = models.ForeignKey(User, related_name='sent_requests', on_delete=models.CASCADE)
    to_system_id = models.CharField(max_length=20) 
    status = models.CharField(max_length=20, default='pending')

    def __str__(self):
        return f"From {self.from_user.username} to ID: {self.to_system_id}"

class FavoriteSticker(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='favorite_stickers')
    image_url = models.URLField() 
    created_at = models.DateTimeField(auto_now_add=True)

class StatusView(models.Model):
    status = models.ForeignKey(Status, on_delete=models.CASCADE, related_name='views')
    viewer = models.ForeignKey(User, on_delete=models.CASCADE)
    viewed_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('status', 'viewer')