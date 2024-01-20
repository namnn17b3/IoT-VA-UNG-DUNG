from django.db import models

# Create your models here.

class User(models.Model):
    class Meta:
        db_table = 'users'
        managed = False
    
    id = models.AutoField(primary_key=True, db_column='id', unique=True)
    email = models.CharField(max_length=255, unique=True, db_column='email')
    username = models.CharField(max_length=255, db_column='username')
    password = models.CharField(max_length=255, db_column='password')
    phone = models.CharField(max_length=255, db_column='phone')
    is_admin = models.BooleanField(default=False, db_column='is_admin', null=False)
    avatar = models.CharField(max_length=255, default='default.jpg', db_column='avatar')
    doan_benh = models.BooleanField(default=True, db_column='doan_benh', null=False)
    xem_export_lich_su_doan_benh = models.BooleanField(default=True, db_column='xem_export_lich_su_doan_benh', null=False)
    xem_export_du_lieu_moi_truong = models.BooleanField(default=True, db_column='xem_export_du_lieu_moi_truong', null=False)
    bat_tat_led = models.BooleanField(default=True, db_column='bat_tat_led', null=False)
    bat_tat_pump = models.BooleanField(default=True, db_column='bat_tat_pump', null=False)
    
    def __str__(self) -> str:
        return self.email


class UserSession(models.Model):
    class Meta:
        db_table = 'user_session'
        managed = False
    
    access_token = models.CharField(max_length=500, unique=True, db_column='access_token')
    id_user = models.OneToOneField(User, on_delete=models.CASCADE, db_column='id_user', related_name='session', primary_key=True)
    
    def __str__(self) -> str:
        return self.access_token
