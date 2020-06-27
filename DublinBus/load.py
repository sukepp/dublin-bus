from django.shortcuts import render
from django.http import HttpResponse
from django.db import connection
import json

def f():
    cursor = connection.cursor()
    sql=""" CREATE TABLE IF NOT EXISTS stops (
       
        stop_id VARCHAR(256), 
        stop_name VARCHAR(256), 
        stop_lat VARCHAR(256),
        stop_lon VARCHAR(256)
        )
    
    """

    cursor.execute(sql)
    
    f=open(r"./static_data/stops.json", "r")
    out = f.read()
    f.close()
    tmp = json.dumps(out)
    tmp = json.loads(out)
    num = len(tmp)
    
    i=0
    while i < num:
        route_id = tmp[i]['stop_id']
        stop_name = tmp[i]['stop_name']
        stop_lat = tmp[i]['stop_lat']
        stop_lon = tmp[i]['stop_lon']
        
        value = (route_id, stop_name, stop_lat, stop_lon)
        cursor.execute("insert into stops values(value)")
f()
    
