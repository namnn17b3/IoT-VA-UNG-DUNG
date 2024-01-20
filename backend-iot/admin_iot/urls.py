from django.urls import path
from . import views

app_name = 'admin_iot'

urlpatterns = [
    path('crud-user', view=views.CrudUser.as_view(),name='crud-user'),
    path('update-user', view=views.UpdateUser.as_view(),name='crud-user'),
    path('export-users', view=views.ExportExcelUserData.as_view(),name='export-users'),
    path('iot-mode', view=views.IoTMode.as_view(),name='iot-mode'),
]
