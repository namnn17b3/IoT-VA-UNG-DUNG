from django.http import HttpRequest, HttpResponse
import json
from django.views import View

class BaseView(View):
    res = json.dumps({
        "statusCode": 405,
        "message": "Method is not allowed"
    })
    
    
    def get(self, request: HttpRequest):
        return HttpResponse(content=self.res, content_type='application/json', status=405)
    
    
    def post(self, request: HttpRequest):
        return HttpResponse(content=self.res, content_type='application/json', status=405)
    
    
    def put(self, request: HttpRequest):
        return HttpResponse(content=self.res, content_type='application/json', status=405)
    
    
    def patch(self, request: HttpRequest):
        return HttpResponse(content=self.res, content_type='application/json', status=405)
    
    
    def update(self, request: HttpRequest):
        return HttpResponse(content=self.res, content_type='application/json', status=405)
    
    
    def delete(self, request: HttpRequest):
        return HttpResponse(content=self.res, content_type='application/json', status=405)
