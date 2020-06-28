from django.shortcuts import render
from django.http import HttpResponse
from django.db import connection
import json


# Create your views here.

def index(request):
    return render(request, "App/home.html");

def hello(request):
    
    cursor = connection.cursor()
    cursor.execute('SELECT * FROM stops')
    
    rows= cursor.fetchall()
    
    return HttpResponse(rows)

def get_stops(request):
    
    cursor = connection.cursor()
    cursor.execute('SELECT * FROM stops')
    
    row_headers=[x[0] for x in cursor.description]
    rows= cursor.fetchall()
    cursor.close
    print(rows)
    
    stop_data=[]
    json_stops={'stops': stop_data}
    
    for row in rows:
        stop_data.append(dict(zip(row_headers,row)))
    
    
    return HttpResponse(json.dumps(json_stops))

def get_route_stop_relation(request):
    
    cursor = connection.cursor()
    cursor.execute('SELECT * FROM route_relation')
    
    #row_headers=[x[0] for x in cursor.description]
    #print(row_headers)
    rows=cursor.fetchall()

    r_temp=''  #route temp
    d_temp=-1  #direction temp
    routes={}
    
    for row in rows:
        
        if row[1] != r_temp:
            r_temp=row[1]
            routes[r_temp] = {}
            
        if row[0] != d_temp:
            d_temp=row[0]
            stops=[]
            routes[r_temp][d_temp]= stops

        stops.append({'stop_id':row[3]})
         
    return HttpResponse(json.dumps(routes))


def predict_time(request, route_id, origin_stop, destination_stop_id, date, time):
    pass
    
    
    
    
