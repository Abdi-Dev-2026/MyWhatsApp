import os
from django.core.asgi import get_asgi_application
from channels.routing import ProtocolTypeRouter, URLRouter
from channels.auth import AuthMiddlewareStack
import chat.routing  # Hubi in folder-ka 'chat' uu dhex joogo 'routing.py'

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'whatsapp_backend.settings')

# ASGI application-ka wuxuu maamulaa labadaba HTTP iyo WebSocket
application = ProtocolTypeRouter({
    "http": get_asgi_application(),
    "websocket": AuthMiddlewareStack(
        URLRouter(
            chat.routing.websocket_urlpatterns
        )
    ),
})