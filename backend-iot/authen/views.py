from django.shortcuts import render
from django.http import HttpRequest, HttpResponse
import json
from .models import *
import jwt
from datetime import datetime
from security import Bcrypt
from backend_weather_iot.base_view import BaseView
from backend_weather_iot.settings import AVATAR_USER_DIR
import re
from django.core.mail import send_mail
import random
from backend_weather_iot.settings import EMAIL_HOST_USER
from django.core.files.storage import default_storage


def index(request: HttpRequest):
    return render(request, 'authen/index.html')


def getUserFromToken(accessToken: str) -> User:
        user_session = UserSession.objects.filter(access_token=accessToken)
        if len(user_session) == 0:
            return None
        
        return user_session[0].id_user


def valid(regex: str, sample: str) -> bool:
    if sample == None:
        return False

    result = re.findall(regex, sample)
    if len(result) != 1:
        return False
    
    return result[0] == sample


class MissingPassword(BaseView):
    def post(self, request: HttpRequest):
        missingPasswordDTO: dict = json.loads(request.body)
        email = missingPasswordDTO.get('email')
        user = User.objects.filter(email=email)
        if len(user) == 0:
            res = json.dumps({
                "statusCode": 400,
                "message": "Email is not exist!"
            })
            return HttpResponse(res, content_type='application/json', status=400)
        
        user = user[0]
        characters = 'qwertyuiopasdfghjklzxcvbnmQWERTYUIOPASDFGHJKLZXCVBNM1234567890@#$%^&+='
        newPassword = ''
        for i in range(8):
            newPassword += random.choice(characters)
        
        user.password = Bcrypt.hashpw(newPassword)
        user.save()
        send_mail(
            'Mật khẩu mới từ N17-IoT PTIT',
            f'Mật khẩu mới của bạn là: {newPassword}\nHãy đăng nhập vào hệ thống và đổi lại mật khẩu nhé!',
            EMAIL_HOST_USER,
            [email]
        )
        
        res = json.dumps({
            "statusCode": 200,
            "message": "Sent new password successfully!"
        })
        return HttpResponse(res, content_type='application/json', status=200)


class Logout(BaseView):
    def get(self, request: HttpRequest):
        if request.headers.get('Authorization') == None:
            res = json.dumps({
                "statusCode": 401,
                "message": "Unauthorize!"
            })
            return HttpResponse(res, content_type='application/json', status=401)
        
        accessToken = request.headers.get('Authorization').split(' ')[1]
        session = UserSession.objects.filter(access_token=accessToken)
        if len(session) == 0:
            res = json.dumps({
                "statusCode": 400,
                "message": "Invalid Token!"
            })
            return HttpResponse(res, content_type='application/json', status=400)
        
        session = session[0]
        session.delete()
        res = json.dumps({
            "statusCode": 200,
            "message": "Logout successfully!"
        })
        return HttpResponse(res, content_type='application/json', status=200)


class Register(BaseView):
    def post(self, request: HttpRequest):
        registerDTO: dict = json.loads(request.body)
        regexEmail = r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,7}\b'
        regexPassword = r'^(?=.*[A-Z])(?=.*[a-z])(?=.*[@#$%^&+=!])(?=.*[0-9]).{8,}$'
        regexPhone = r'^0\d{9,9}$'
        if valid(regexEmail, registerDTO.get('email')) == False:
            res = json.dumps({
                "statusCode": 400,
                "message": "Wrong Email Format!"
            })
            return HttpResponse(res, content_type='application/json', status=400)

        if valid(regexPhone, registerDTO.get('phone')) == False:
            res = json.dumps({
                "statusCode": 400,
                "message": "Wrong Phone number Format!"
            })
            return HttpResponse(res, content_type='application/json', status=400)

        if valid(regexPassword, registerDTO.get('password')) == False:
            res = json.dumps({
                "statusCode": 400,
                "message": "Wrong Password Format!"
            })
            return HttpResponse(res, content_type='application/json', status=400)
        
        if registerDTO.get('password') != registerDTO.get('confirm-password'):
            res = json.dumps({
                "statusCode": 400,
                "message": "Confirm password doesn't match the password!"
            })
            return HttpResponse(res, content_type='application/json', status=400)
        
        user = User.objects.filter(email=registerDTO.get('email'))
        if len(user) == 1:
            res = json.dumps({
                "statusCode": 400,
                "message": "Email already exists!"
            })
            return HttpResponse(res, content_type='application/json', status=400)
        
        user = User(
            email=registerDTO.get('email'),
            password=Bcrypt.hashpw(registerDTO.get('password')),
            username=registerDTO.get('username'),
            phone=registerDTO.get('phone'),
            is_admin=False
        )
        user.save()
        
        payload = {
            "sub": user.id,
            "email": user.email,
            "phone": user.phone,
            "username": user.username,
            "iat": round(datetime.now().timestamp()),
            "admin": user.is_admin
        }
        access_token = jwt.generate_token(payload)
        UserSession.objects.create(access_token=access_token, id_user=user)
        res = json.dumps({ "accessToken": access_token })
        return HttpResponse(content=res, content_type='application/json', status=201)


class Login(BaseView):
    def post(self, request: HttpRequest):
        loginDTO = json.loads(request.body)
        user = User.objects.filter(email=loginDTO['email'])
        if len(user) > 0:
            user = user[0]
            if Bcrypt.checkpw(loginDTO['password'], user.password) == True:
                user_session = UserSession.objects.filter(id_user=user.id)
                if len(user_session) > 0:
                    res = json.dumps({
                        "statusCode": 401,
                        "message": "Account is being logged somewhere else"
                    })
                    return HttpResponse(res, content_type='application/json', status=401)
                
                payload = {
                    "sub": user.id,
                    "email": user.email,
                    "username": user.username,
                    "iat": round(datetime.now().timestamp()),
                    "admin": user.is_admin
                }
                access_token = jwt.generate_token(payload)
                UserSession.objects.create(access_token=access_token, id_user=user)
                res = json.dumps({ "accessToken": access_token })
                return HttpResponse(content=res, content_type='application/json', status=200)
            else:
                res = json.dumps({ "statusCode": 401, "message": 'Password is incorrect' })
                return HttpResponse(content=res, content_type='application/json', status=401)
        else:
            res = json.dumps({ "statusCode": 401, "message": 'Email is not exist' })
            return HttpResponse(content=res, content_type='application/json', status=401)


class Me(BaseView):
    def get(self, request: HttpRequest):
        if request.headers.get('Authorization') == None:
            res = json.dumps({
                "statusCode": 401,
                "message": "Unauthorize!"
            })
            return HttpResponse(res, content_type='application/json', status=401)
        
        accessToken = request.headers.get('Authorization').split(' ')[1]
        
        if jwt.valid_token(accessToken) == False:
            return HttpResponse(json.dumps({
                "statusCode": 401,
                "message": "Invalid Token"
            }), content_type='application/json', status=401)
        
        user = getUserFromToken(accessToken)
        if user == None:
            return HttpResponse(json.dumps({
                "statusCode": 401,
                "message": "Information of Token is not correct"
            }), content_type='application/json', status=401)
        
        user_response = {
            "username": user.username,
            "email": user.email,
            "isAdmin": user.is_admin,
            "phone": user.phone,
            "avatar": user.avatar
        }
        return HttpResponse(json.dumps(user_response), content_type='application/json', status=200)


class RefreshToken(BaseView):
    def get(self, request: HttpRequest):
        accessToken: str = request.headers.get('Authorization').split(' ')[1]
        header, payload, signature = accessToken.split('.')
        signature_correct = jwt.hmacSha256(f'{header}.{payload}')
        if signature != signature_correct:
            return HttpResponse(json.dumps({
                "statusCode": 401,
                "message": "Invalid Token"
            }), content_type='application/json', status=401)
        
        user = getUserFromToken(accessToken)
        if user == None:
            return HttpResponse(json.dumps({
                "statusCode": 401,
                "message": "Information of Token is not correct"
            }), content_type='application/json', status=401)
        
        payload = {
            "sub": user.id,
            "email": user.email,
            "username": user.username,
            "iat": round(datetime.now().timestamp()),
            "admin": user.is_admin
        }
        access_token = jwt.generate_token(payload)
        UserSession.objects.update(access_token=access_token, id_user=user)
        res = json.dumps({ "accessToken": access_token })
        return HttpResponse(content=res, content_type='application/json', status=200)


class ChangePassWord(BaseView):
    def post(self, request: HttpRequest):
        if request.headers.get('Authorization') == None:
            res = json.dumps({
                "statusCode": 401,
                "message": "Unauthorize!"
            })
            return HttpResponse(res, content_type='application/json', status=401)
        
        accessToken = request.headers.get('Authorization').split(' ')[1]
        if jwt.valid_token(access_token=accessToken) == False:
            res = json.dumps({
                "statusCode": 401,
                "message": "Unauthorized"
            })
            return HttpResponse(res, content_type='application/json', status=401)
        
        user: User = getUserFromToken(accessToken=accessToken)
        if user == None:
            res = json.dumps({
                "statusCode": 401,
                "message": "Unauthorized"
            })
            return HttpResponse(res, content_type='application/json', status=401)
        
        dto: dict = json.loads(request.body)
        current_password = dto.get('currentPassword') if dto.get('currentPassword') != None else ''
        new_password = dto.get('newPassword') if dto.get('newPassword') != None else ''
        confirm_password = dto.get('confirmPassword') if dto.get('confirmPassword') != None else ''
        regexPassword = r'^(?=.*[A-Z])(?=.*[a-z])(?=.*[@#$%^&+=!])(?=.*[0-9]).{8,}$'

        if Bcrypt.checkpw(current_password, user.password) == False:
            res = json.dumps({
                "statusCode": 400,
                "message": "Current password incorrect"
            })
            return HttpResponse(res, content_type='application/json', status=400)
        
        if valid(regexPassword, new_password) == False:
            res = json.dumps({
                "statusCode": 400,
                "message": "Wrong Password Format!"
            })
            return HttpResponse(res, content_type='application/json', status=400)
        
        if new_password != confirm_password:
            res = json.dumps({
                "statusCode": 400,
                "message": "Confirm password incorrect"
            })
            return HttpResponse(res, content_type='application/json', status=400)
        
        user.password = Bcrypt.hashpw(new_password)
        user.save()
        
        res = json.dumps({
            "statusCode": 201,
            "message": "Change password successfully"
        })
        return HttpResponse(res, content_type='application/json', status=201)


class UpdateInfo(BaseView):
    def post(self, request: HttpRequest):
        if request.headers.get('Authorization') == None:
            res = json.dumps({
                "statusCode": 401,
                "message": "Unauthorize!"
            })
            return HttpResponse(res, content_type='application/json', status=401)
        
        access_token = request.headers.get('Authorization').split(' ')[1]
        if jwt.valid_token(access_token) == False:
            res = json.dumps({
                "statusCode": 401,
                "message": "Unauthorize!"
            })
            return HttpResponse(res, content_type='application/json', status=401)
        
        try:
            updateDTO: dict = json.loads(request.POST.get('jsonData'))
        except Exception as error:
            res = json.dumps({
                "statusCode": 400,
                "message": f"Error: {error}"
            })
            return HttpResponse(res, content_type='application/json', status=400)
        
        user = User.objects.filter(email=updateDTO.get('email'))
        if len(user) == 0:
            res = json.dumps({
                "statusCode": 401,
                "message": "Email not exsist!"
            })
            return HttpResponse(res, content_type='application/json', status=401)
        
        user = user[0]
        avatar = request.FILES.get('avatar')
        if avatar != None:
            user.avatar = f'{user.id}.jpg'
            avatar_path = AVATAR_USER_DIR + f'{user.id}.jpg'
            writer = default_storage.open(avatar_path, 'wb')
            for chunk in avatar.chunks():
                writer.write(chunk)
        
        regexPhone = r'^0\d{9,9}$'
        if valid(regexPhone, updateDTO.get('phone')) == False:
            res = json.dumps({
                "statusCode": 400,
                "message": "Wrong Phone number Format!"
            })
            return HttpResponse(res, content_type='application/json', status=400)
        
        user.username = updateDTO.get('username')
        user.phone = updateDTO.get('phone')
        user.save()
        
        res = json.dumps({
            "statusCode": 201,
            "message": "Update info successfully!"
        })
        return HttpResponse(res, content_type='application/json', status=201)
