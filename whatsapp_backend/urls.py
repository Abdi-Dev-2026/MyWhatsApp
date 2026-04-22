from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    # 1. Bogga Admin-ka
    path('admin/', admin.site.urls),
    
    # 2. Ku xiridda URL-yada App-kaaga (Chat)
    path('', include('chat.urls')),
] 

# 3. Oggolaanshaha Static iyo Media Files (Habka ugu dhammaystiran)
# Waxaan ku daray isku xirka STATIC_ROOT iyo MEDIA_ROOT labadaba
if settings.DEBUG:
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
else:
    # Xitaa haddii DEBUG ay False tahay, halkan ayaa ka caawinaya tijaabada meelaha qaarkood
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)