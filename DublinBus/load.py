from django.shortcuts import render
from django.http import HttpResponse
from django.db import connection
import json

def load_stops():
    cursor = connection.cursor()
    cursor.execute("DROP TABLE IF EXISTS stops")
    
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
   
    tmp = json.loads(out)
    num = len(tmp)
    
    i=0
    while i < num:
        route_id = tmp[i]['stop_id']
        stop_name = tmp[i]['stop_name']
        stop_lat = tmp[i]['stop_lat']
        stop_lon = tmp[i]['stop_lon']
        
        value = (route_id, stop_name, stop_lat, stop_lon)
        sql='insert into stops values ("%s","%s","%s","%s");'
        print(sql)
        
        cursor.execute(sql % value)
        i+=1
        
def load_route():
    cursor = connection.cursor()
    cursor.execute("DROP TABLE IF EXISTS route_relation")
    
    sql=""" CREATE TABLE IF NOT EXISTS route_relation (
       
        direction_id VARCHAR(256), 
        route_id VARCHAR(256), 
        stop_sequence VARCHAR(256),
        stop_id VARCHAR(256)
        )
    
    """
    
    cursor.execute(sql)
    
    f=open(r"./static_data/route_relation.json", "r")
    out = f.read()
    f.close()
   
    tmp = json.loads(out)
    num = len(tmp)
    
    i=0
    while i < num:
        direction_id = tmp[i]['stop_id']
        route_id = tmp[i]['route_id']
        stop_sequence = tmp[i]['stop_sequence']
        stop_id = tmp[i]['stop_id']
        
        value = (direction_id, route_id, stop_sequence, stop_id)
        sql='insert into route_relation values ("%s","%s","%s","%s");'
        print(sql)
        
        cursor.execute(sql % value)
        i+=1
    
    
    
#load_stops()
load_route()
    
