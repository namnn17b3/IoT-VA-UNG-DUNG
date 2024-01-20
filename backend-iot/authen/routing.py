from django.urls import re_path
from . import consumers

websocket_urlpatterns = [
    re_path(r'register-face', consumers.RegisterFace.as_asgi()),
    re_path(r'recognize-face', consumers.RecognizeFace.as_asgi())
]
