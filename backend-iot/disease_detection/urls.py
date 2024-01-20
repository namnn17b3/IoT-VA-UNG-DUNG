from django.urls import path
from . import views

app_name = 'disease_detection'

urlpatterns = [
    path('', view=views.DiseaseDetection.as_view(), name='detect'),
    path('history-predict-disease', view=views.HistoryPredictDiseaseView.as_view(), name='history-predict-disease'),
    path('history-predict-disease/export-excel', view=views.HistoryPredictDiseaseDataExportExcel.as_view(), name='history-predict-disease-export-excel'),
]
