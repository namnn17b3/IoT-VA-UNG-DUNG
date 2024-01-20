import cv2
import numpy as np
from PIL import Image
import os


def getImagesAndLabels(path):
    detector = cv2.CascadeClassifier(os.path.join('haarcascade_frontalface_default.xml'))
    imagePaths = [os.path.join(path, f) for f in os.listdir(path)]
    faceSamples = []
    ids = []
    
    for imagePath in imagePaths:
        PIL_img = Image.open(imagePath).convert('L') # convert it to grayscale
        img_numpy = np.array(PIL_img, 'uint8')
        
        id = int(os.path.split(imagePath)[-1].split('_')[1])
        faces = detector.detectMultiScale(img_numpy)
        
        for (x, y, w, h) in faces:
            faceSamples.append(img_numpy[y:y+h, x:x+w])
            ids.append(id)
        
    return faceSamples, ids


def trainingFaceId(path):
    recognizer = cv2.face.LBPHFaceRecognizer.create()
    faces, ids = getImagesAndLabels(path)
    recognizer.train(faces, np.array(ids))
    recognizer.write(os.path.join('authen', 'training', 'user_1.yaml'))

print(os.path.join('authen', 'img_user', 'user_1'))
trainingFaceId(os.path.join('authen', 'img_user', 'user_1'))
