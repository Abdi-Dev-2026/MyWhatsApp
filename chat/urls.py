from django.urls import path
from django.conf import settings
from django.conf.urls.static import static
from . import views

urlpatterns = [
    # 1. BOGGA HORE (LIST-KA SAAXIIBADA)
    path('', views.index, name='index'),
    
    # 2. AQOONSIGA IYO DIIWAANGELINTA (AUTH)
    path('signup/', views.signup, name='signup'),
    path('login/', views.user_login, name='login'),
    path('logout/', views.user_logout, name='logout'),
    
    # 3. RAADINTA DADKA IYO MAAMULKA SAAXIIBADA
    path('search/', views.search_contact, name='search_contact'),
    path('send-request/<str:system_id>/', views.send_request, name='send_request'),
    path('accept-request/<int:request_id>/', views.accept_request, name='accept_request'),
    path('reject-request/<int:request_id>/', views.reject_request, name='reject_request'),
    
    # 4. BOGGA SHEEKADA (CHAT ROOM)
    path('chat/<str:username>/', views.chat_room, name='chat_room'),

    # 5. BOGGA SETTINGS-KA IYO PROFILE-KA
    path('settings/', views.settings_page, name='settings'),
    path('profile/update/', views.update_profile, name='update_profile'),

    # 6. SHAQOOYINKA FARIIMAHA (DELETE & STAR)
    path('delete-message/<int:message_id>/', views.delete_message, name='delete_message'),
    path('toggle-star/', views.toggle_star_message, name='toggle_star'),
    path('starred-messages/', views.starred_messages, name='starred_messages'),
    
    # 7. SHAQADA STICKER-KA
    path('toggle-favorite-sticker/', views.toggle_favorite_sticker, name='toggle_favorite_sticker'),

    # 8. WADDOOYINKA STATUS-KA (SI BUUXDA LOO SAXAY)
    path('status/', views.status_list, name='status_list'),
    path('status/upload/', views.upload_status, name='upload_status'),
    path('reply-to-status/<int:status_id>/', views.reply_to_status, name='reply_to_status'),
    path('status/delete/<int:status_id>/', views.delete_status, name='delete_status'),
    path('status/viewed/<int:status_id>/', views.mark_status_as_viewed, name='mark_status_viewed'),

    # 9. GLOBAL BILLBOARD & QUIZ SYSTEM
    path('quiz/<int:quiz_id>/', views.quiz_page, name='quiz_page'),
    path('billboard/', views.billboard_view, name='billboard'),

    # 10. WICITAANKA (VIDEO & AUDIO CALLS)
    path('make-call/<str:username>/', views.make_call, name='make_call'),
    path('receive-call/', views.receive_call, name='receive_call'),
]

# --- SAXIDDA MEDIA-HA IYO STATIC-KA ---
# Tani waxay muhiim u tahay in sawirrada profile-ka iyo faylasha PWA (manifest, sw.js) la helo.
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)