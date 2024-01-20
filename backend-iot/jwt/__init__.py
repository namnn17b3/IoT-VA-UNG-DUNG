from base64 import urlsafe_b64encode, urlsafe_b64decode
from hashlib import sha256
import hmac
import json
from datetime import datetime
from backend_weather_iot.settings import JWT_EXPIRES, JWT_HEADER, JWT_SECRET_KEY

# string.encode(encoding) ~ bytes(string, encoding)
# encodeing: 'utf-8', 'ascii'


def base64UrlEncode(data: str) -> str:
    data = data.encode('utf-8')
    return urlsafe_b64encode(data).rstrip(b'=').decode('utf-8')


def base64UrlDecode(base64Url: str) -> str:
    base64Url = base64Url.encode('utf-8')
    padding = b'=' * (4 - (len(base64Url) % 4))

    return urlsafe_b64decode(base64Url + padding).decode('utf-8')


def hmacSha256(message: str) -> str:
    message_bytes = message.encode('utf-8')
    hmac_sha256_bytes = hmac.new(key=JWT_SECRET_KEY.encode('utf-8'), msg=message_bytes, digestmod=sha256).digest()
    base64_str = urlsafe_b64encode(hmac_sha256_bytes).rstrip(b'=').decode('utf-8')
    return base64_str


def generate_token(payload: dict) -> str:
    base64UrlEncodeHeader = base64UrlEncode(json.dumps(JWT_HEADER))
    base64UrlEncodePayload = base64UrlEncode(json.dumps(payload))
    base64UrlEncodeSignature = hmacSha256(f'{base64UrlEncodeHeader}.{base64UrlEncodePayload}')
    access_token = f'{base64UrlEncodeHeader}.{base64UrlEncodePayload}.{base64UrlEncodeSignature}'
    return access_token


def valid_token(access_token: str) -> bool:
    try:
        header, payload, signature = access_token.split('.')
        signature_correct = hmacSha256(f'{header}.{payload}')
        if signature != signature_correct:
            return False
        
        payload = json.loads(base64UrlDecode(payload))
        if round(datetime.now().timestamp()) - payload['iat'] > JWT_EXPIRES:
            return False
    except:
        return False
    
    return True
