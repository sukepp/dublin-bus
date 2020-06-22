from django.shortcuts import render
from django.http import HttpResponse


# Create your views here.

def index(request):
    return render(request, "App/home.html");

def hello(request):
    return HttpResponse("Hello world!")
