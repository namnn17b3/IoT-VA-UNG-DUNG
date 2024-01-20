import cv2
import os
import numpy as np
import base64
from channels.generic.websocket import AsyncWebsocketConsumer
from datetime import datetime

img_user_folder = os.path.join('authen', 'img_user')
face_detector = cv2.CascadeClassifier(os.path.join('haarcascade_frontalface_default.xml'))

class RegisterFace(AsyncWebsocketConsumer):
    async def connect(self):
        await self.accept()
        print(f'client {self.channel_name} {self.channel_layer} connected ...')

    async def disconnect(self, message):
        print('client disconnect ...')

    async def receive(self, text_data):
        # Extract the base64 encoded binary data from the input string
        base64_data = text_data.split(",")[1]
        # Decode the base64 data to bytes
        image_bytes = base64.b64decode(base64_data)
        
        # Convert the bytes to numpy array
        image_array = np.frombuffer(image_bytes, dtype=np.uint8)
        
        user_folder = 'user_1'
        if not os.path.exists(os.path.join(img_user_folder, user_folder)):
            os.makedirs(os.path.join(img_user_folder, user_folder))
        
        # Decode the numpy array as an image using OpenCV
        image = cv2.imdecode(image_array, cv2.IMREAD_COLOR)
        gray = cv2.flip(cv2.cvtColor(image, cv2.COLOR_BGR2GRAY), 1)
        faces = face_detector.detectMultiScale(gray, 1.3, 5)
        
        for (x, y, w, h) in faces:
            cv2.rectangle(image, (x, y), (x + w, y + h), (255, 0, 0), 2)
            image_filename = os.path.join(img_user_folder, user_folder, user_folder + '_' + str(datetime.now().timestamp() * 1000) + '.jpg')
            # print(image_filename)
            cv2.imwrite(image_filename, gray[y:y+h, x:x+w])
        
        cv2.destroyAllWindows()

class RecognizeFace(AsyncWebsocketConsumer):
    async def connect(self):
        await self.accept()
        print(f'client {self.channel_name} {self.channel_layer} connected ...')

    async def disconnect(self, message):
        print('client disconnect ...')
    
    async def recognize_face(self, event):
        pass

    async def receive(self, text_data):
        recognizer = cv2.face.LBPHFaceRecognizer.create()
        recognizer.read(os.path.join('authen', 'training', 'user_1.yaml'))
        faceCascade = cv2.CascadeClassifier(os.path.join('haarcascade_frontalface_default.xml'))
        # Extract the base64 encoded binary data from the input string
        base64_data = text_data.split(",")[1]
        # Decode the base64 data to bytes
        image_bytes = base64.b64decode(base64_data)
        
        # Convert the bytes to numpy array
        image_array = np.frombuffer(image_bytes, dtype=np.uint8)
        image = cv2.imdecode(image_array, cv2.IMREAD_COLOR)
        gray = cv2.flip(cv2.cvtColor(image, cv2.COLOR_BGR2GRAY), 1)
        # print(gray)
        faces = faceCascade.detectMultiScale(
            gray,
            scaleFactor=1.3,
            minNeighbors=5,
        )
        # print(faces)
        for (x, y, w, h) in faces:
            cv2.rectangle(image, (x, y), (x + w, y + h), (0, 255, 0), 2)
            id, confidence = recognizer.predict(gray[y:y+h, x:x+w])
            print(id, confidence)
        
        cv2.destroyAllWindows()
