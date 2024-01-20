from django.urls import path
from . import views

app_name = 'esp32'

urlpatterns = [
    path('data', view=views.DataDrive.as_view(), name='esp32-data'),
    path('data/export-excel', view=views.DataExportExcel.as_view(), name='data-esp32-export-excel')
]
