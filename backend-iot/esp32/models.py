from django.db import models

# Create your models here.

class Esp32Data(models.Model):
    class Meta:
        db_table = 'esp32_data'
        managed = False
    
    id = models.AutoField(primary_key=True, db_column='id', unique=True)
    nhiet_do = models.FloatField(db_column='nhiet_do')
    do_am_kk = models.FloatField(db_column='do_am_kk')
    anh_sang = models.FloatField(db_column='anh_sang')
    do_am_dat = models.FloatField(db_column='do_am_dat')
    sent_at = models.DateTimeField(db_column='sent_at', null=False, auto_now=True)
