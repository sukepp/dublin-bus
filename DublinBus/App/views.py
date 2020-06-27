from django.shortcuts import render
from django.http import HttpResponse
from django.db import connection


# Create your views here.

def index(request):
    return render(request, "App/home.html");

def hello(request):
    cursor = connection.cursor()
    cursor.execute('SELECT * FROM stops')
    rows= cursor.fetchall()
    return HttpResponse(rows)
