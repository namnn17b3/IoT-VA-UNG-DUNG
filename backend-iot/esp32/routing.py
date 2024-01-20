from django.urls import re_path
from . import consumers

websocket_urlpatterns = [
    re_path(r'esp32/websocket', consumers.Esp32Socket.as_asgi()),
]