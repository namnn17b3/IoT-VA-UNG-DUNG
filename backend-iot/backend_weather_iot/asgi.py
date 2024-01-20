import os
from channels.auth import AuthMiddlewareStack
from channels.routing import ProtocolTypeRouter, URLRouter
from django.core.asgi import get_asgi_application
from authen import routing as authen_routing
from esp32 import routing as esp32_routing

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend_weather_iot.settings')

application = ProtocolTypeRouter({
    "http": get_asgi_application(),
    "websocket": AuthMiddlewareStack(
        URLRouter(
            authen_routing.websocket_urlpatterns +
            esp32_routing.websocket_urlpatterns
        )
    ),
})
