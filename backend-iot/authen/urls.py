from django.urls import path
from . import views

app_name = 'authen'

urlpatterns = [
    path('test-socket', view=views.index, name='index'),
    path('login', view=views.Login.as_view(), name='login'),
    path('me', view=views.Me.as_view(), name='me'),
    path('refresh-token', view=views.RefreshToken.as_view(), name='refresh-token'),
    path('register', view=views.Register.as_view(), name='register'),
    path('missing-password', view=views.MissingPassword.as_view(), name='missing-password'),
    path('logout', view=views.Logout.as_view(), name='logout'),
    path('change-password', view=views.ChangePassWord.as_view(), name='change-password'),
    path('update-info', view=views.UpdateInfo.as_view(), name='update-info'),
]
