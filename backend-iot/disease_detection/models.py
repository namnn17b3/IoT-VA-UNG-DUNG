from django.db import models
from authen.models import User

# Create your models here.

class Diseases(models.Model):
    class Meta:
        db_table = 'diseases'
        managed = False
    
    id = models.AutoField(primary_key=True, db_column='id', unique=True)
    tree = models.CharField(max_length=255, db_column='tree', null=False)
    disease = models.CharField(max_length=255, db_column='disease', null=False)
    treatment = models.CharField(max_length=2000, db_column='treatment', null=False)


class HistoryPredictDisease(models.Model):
    class Meta:
        db_table = 'history_predict_disease'
        managed = False
    
    id = models.AutoField(primary_key=True, db_column='id', unique=True)
    image = models.CharField(max_length=255, db_column='image', null=False)
    diseases = models.ForeignKey(Diseases, on_delete=models.CASCADE, db_column='disease_id', related_name='diseases')
    user = models.ForeignKey(User, on_delete=models.CASCADE, db_column='user_id', related_name='user')
    sent_at = sent_at = models.DateTimeField(db_column='sent_at', null=False, auto_now=True)
