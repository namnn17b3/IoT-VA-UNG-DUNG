from channels.generic.websocket import AsyncWebsocketConsumer
import json
from .models import *
from datetime import datetime
import random
from channels.db import database_sync_to_async
import jwt
from authen.models import *

class Esp32Socket(AsyncWebsocketConsumer):
    async def connect(self):
        await self.accept()
        # await self.channel_layer.group_add(ROOM_NAME, self.channel_name)
        print(f'client {self.channel_name} connected ...')

    
    async def disconnect(self, message):
        await self.channel_layer.group_discard('user', self.channel_name)
        await self.channel_layer.group_discard('esp32', self.channel_name)
        
        print(f'client {self.channel_name} disconnect ...')

    
    async def receive(self, text_data):
        # self.send('ok bro')
        print(text_data)
        data: dict = json.loads(text_data)
        if data.get('from') not in ('esp32', 'user', 'admin'):
            print('authen failed!')
            return
        
        if data.get('from') == 'esp32':
            await self.handleMessageFromEsp32(data)
            return
        
        if data.get('from') == 'user':
            await self.handleMessageFromUser(data)
            return
        
        if data.get('from') == 'admin':
            await self.handleMessageFromAdmin(data)
            return
        
        # temperature = round(data.get('temperature'), 2) if data.get('temperature') != None else None
        # humidity = round(data.get('humidity')) if data.get('humidity') != None else None
        # lightValue = round(data.get('lightValue')) if data.get('lightValue') != None else None
        # earthMoisture = round(data.get('earthMoisture')) if data.get('earthMoisture') != None else None
        
        # print(temperature, humidity, lightValue, earthMoisture)
        # # self.save_to_db(temperature, humidity, lightValue, earthMoisture)
        
        # # Esp32Data.objects.create(
        # #     nhiet_do=temperature,
        # #     do_am_kk=humidity,
        # #     anh_sang=lightValue,
        # #     do_am_dat=earthMoisture,
        # #     sent_at=datetime.now()
        # # )
        
        # print('save to db successfully!')
        
        # for key in data:
        #     if data.get(key) == None:
        #         if key == 'temperature':
        #             data[key] = round(random.uniform(15, 40), 2)
        #         elif key == 'humidity':
        #             data[key] = round(random.uniform(20, 90), 2)
        #     elif key != 'sent_at' and key != 'authen':
        #         data[key] = round(data[key], 2)

        # # await self.save_esp2_data(data)
        
        # # self.send(text_data)
        # print(data)
        # await self.channel_layer.group_send(
        #     ROOM_NAME,
        #     {
        #         'type': 'send_to_client',
        #         'message': json.dumps(data)
        #     }
        # )
    
    
    async def handleMessageFromEsp32(self, data: dict):
        first = data.get('first')
        if first == 1:
            await self.channel_layer.group_add('esp32', self.channel_name)
            return
        
        temperature = round(data.get('temperature'), 2) if data.get('temperature') != None else None
        humidity = round(data.get('humidity')) if data.get('humidity') != None else None
        lightValue = round(data.get('lightValue')) if data.get('lightValue') != None else None
        earthMoisture = round(data.get('earthMoisture')) if data.get('earthMoisture') != None else None
        
        print(temperature, humidity, lightValue, earthMoisture)
        # self.save_to_db(temperature, humidity, lightValue, earthMoisture)
        
        # Esp32Data.objects.create(
        #     nhiet_do=temperature,
        #     do_am_kk=humidity,
        #     anh_sang=lightValue,
        #     do_am_dat=earthMoisture,
        #     sent_at=datetime.now()
        # )
        
        print('save to db successfully!')
        
        for key in data:
            if data.get(key) == None:
                if key == 'temperature':
                    data[key] = round(random.uniform(15, 40), 2)
                elif key == 'humidity':
                    data[key] = round(random.uniform(20, 90), 2)
            elif key != 'sent_at' and key != 'from':
                data[key] = round(data[key], 2)

        # await self.save_esp2_data(data)
        
        print(data)
        await self.channel_layer.group_send(
            'user',
            {
                'type': 'send_to_room',
                'message': json.dumps(data)
            }
        )
        # await self.send(text_data=json.dumps(data))
    
    
    @database_sync_to_async
    def save_esp2_data(self, data):
        Esp32Data.objects.create(
            nhiet_do=data['temperature'],
            do_am_kk=data['humidity'],
            anh_sang=data['lightValue'],
            do_am_dat=data['earthMoisture'],
            sent_at=datetime.now()
        )
    
    
    async def send_to_room(self, event):
        message = event.get('message')
        # print('line 70 consummers ' + message)
        
        await self.send(text_data=message)

    
    @database_sync_to_async
    def getUserFromToken(self, access_token):
        user_session = UserSession.objects.filter(access_token=access_token)
        if len(user_session) == 0:
            return None
        
        return user_session[0].id_user
    
    
    async def handleMessageFromUser(self, data: dict):
        access_token = data.get('token')
        if jwt.valid_token(access_token) == False:
            await self.channel_layer.group_send(
                'user',
                {
                    'type': 'send_to_room',
                    'message': json.dumps({
                        'message': 'UnAuthorize'
                    })
                }
            )
            return
        
        first = data.get('first')
        if first == 1:
            await self.channel_layer.group_add('user', self.channel_name)
            return
        
        f = open('mode.txt', 'r')
        maintenance_mode, led_auto_mode, pump_auto_mode = map(int, f.readline().split())
        f.close()
        
        if maintenance_mode == 1:
            await self.channel_layer.group_send(
                'user',
                {
                    'type': 'send_to_room',
                    'message': json.dumps({
                        'message': 'Hệ thống đang bảo trì!\nVui lòng thử lại sau'
                    })
                }
            )
            return
        
        user = await self.getUserFromToken(access_token)
        
        message = json.dumps({
            'from': 'user',
            'ledMode': data.get('ledMode') if user.bat_tat_led == True and led_auto_mode == 0 else 0,
            'pumpMode': data.get('pumpMode') if user.bat_tat_pump == True and pump_auto_mode == 0 else 0
        })
        
        if user.bat_tat_led == True and data.get('drive') == 'LED' and led_auto_mode == 1:
            await self.channel_layer.group_send(
                'user',
                {
                    'type': 'send_to_room',
                    'message': json.dumps({
                        'message': 'LED đang ở chế độ tự động'
                    })
                }
            )
            return
        
        if user.bat_tat_pump == True and data.get('drive') == 'PUMP' and pump_auto_mode == 1:
            await self.channel_layer.group_send(
                'user',
                {
                    'type': 'send_to_room',
                    'message': json.dumps({
                        'message': 'PUMP đang ở chế độ tự động'
                    })
                }
            )
            return
        
        if user.bat_tat_led == True and data.get('drive') == 'LED' and led_auto_mode == 0:
            await self.channel_layer.group_send(
                'esp32',
                {
                    'type': 'send_to_room',
                    'message': message
                }
            )
            return
        
        if user.bat_tat_pump == True and data.get('drive') == 'PUMP' and pump_auto_mode == 0:
            await self.channel_layer.group_send(
                'esp32',
                {
                    'type': 'send_to_room',
                    'message': message
                }
            )
            return
        
        if user.bat_tat_led == False and data.get('drive') == 'LED':
            await self.channel_layer.group_send(
                'user',
                {
                    'type': 'send_to_room',
                    'message': json.dumps({
                        'message': 'Bạn không có quyền sử dụng chức năng bật tắt LED'
                    })
                }
            )
            return
        
        if user.bat_tat_pump == False and data.get('drive') == 'PUMP':
            await self.channel_layer.group_send(
                'user',
                {
                    'type': 'send_to_room',
                    'message': json.dumps({
                        'message': 'Bạn không có quyền sử dụng chức năng bật tắt PUMP'
                    })
                }
            )
            return
    
    
    async def handleMessageFromAdmin(self, data: dict):
        access_token = data.get('token')
        if jwt.valid_token(access_token) == False:
            await self.channel_layer.group_send(
                'admin',
                {
                    'type': 'send_to_room',
                    'message': json.dumps({
                        'message': 'UnAuthorize'
                    })
                }
            )
            return
        
        f = open('mode.txt', 'r')
        maintenance_mode, led_auto_mode, pump_auto_mode = map(int, f.readline().split())
        f.close()
        
        first = data.get('first')
        if first == 1:
            await self.channel_layer.group_add('admin', self.channel_name)
            await self.channel_layer.group_send(
                'admin',
                {
                    'type': 'send_to_room',
                    'message': json.dumps({
                        'maintenanceMode': maintenance_mode,
                        'ledAutoMode': led_auto_mode,
                        'pumpAutoMode': pump_auto_mode
                    })
                }
            )
            return
        
        user = await self.getUserFromToken(access_token)
        if user.is_admin == False:
            await self.channel_layer.group_send(
                'admin',
                {
                    'type': 'send_to_room',
                    'message': json.dumps({
                        'message': 'Admin UnAuthorize'
                    })
                }
            )
            return
        
        maintenance_mode = data.get('maintenanceMode') if data.get('maintenanceMode') != None and data.get('maintenanceMode') in (0, 1) else maintenance_mode
        led_auto_mode = data.get('ledAutoMode') if data.get('ledAutoMode') != None and data.get('ledAutoMode') in (0, 1) else led_auto_mode
        pump_auto_mode = data.get('pumpAutoMode') if data.get('pumpAutoMode') != None and data.get('pumpAutoMode') in (0, 1) else pump_auto_mode
        
        led_auto_mode = led_auto_mode if maintenance_mode == 0 else 0
        pump_auto_mode = pump_auto_mode if maintenance_mode == 0 else 0
        
        f = open('mode.txt', 'w')
        f.write(f'{maintenance_mode} {led_auto_mode} {pump_auto_mode}')
        f.close()
        
        await self.channel_layer.group_send(
            'esp32',
            {
                'type': 'send_to_room',
                'message': json.dumps({
                    'from': 'admin',
                    'maintenanceMode': maintenance_mode,
                    'ledAutoMode': led_auto_mode,
                    'pumpAutoMode': pump_auto_mode
                })
            }
        )
