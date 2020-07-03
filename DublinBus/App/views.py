from django.shortcuts import render
from django.http import HttpResponse
from django.db import connection
import json
import time as _time
import requests
import joblib
#from sklearn.externals import joblib


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
            d_temp=-1 #  Initialize direction
            
        if row[0] != d_temp:
            d_temp=row[0]
            stops=[]
            routes[r_temp][d_temp]= stops

        stops.append({'stop_id':row[3]})
         
    return HttpResponse(json.dumps(routes))


def predict_time(request, route_id, origin_stop_sequence, origin_stop_id, destination_stop_sequence, destination_stop_id, date, time):
    
    
    date_time = date +' ' + time
    #struct_time entered
    struct_date_time= _time.strptime(date_time, '%Y-%m-%d %H:%M') 
    
    wday = _time.strftime('%w',struct_date_time)
    second = struct_date_time.tm_hour*3600 + struct_date_time.tm_min*60
    
    
    #time stamp entered
    timestamp=_time.mktime(struct_date_time)

    f = open('./forecast.json')
    text_page=f.read()
    f.close()
    tmp = json.loads(text_page)['list']
    
    num = len(tmp)
    i=0
    
    while i < num:
        #struct time of forecast
        struct_dt=_time.strptime(tmp[i]["dt_txt"],'%Y-%m-%d %H:%M:%S')
        
        #time stamp of forecast
        dt_stamp=_time.mktime(struct_dt)
        
        if timestamp < dt_stamp:
            break
        i+=1
    
    if i >0:
        i-=1
    
    temp = tmp[i]['main']['temp']
    feels_like = tmp[i]['main']['feels_like']
    pressure = tmp[i]['main']['pressure']
    humidity = tmp[i]['main']['humidity']
    wind_speed = tmp[i]['wind']['speed']
    wind_deg = tmp[i]['wind']['deg']
    coulds_all = tmp[i]['clouds']['all']
    weather_id = tmp[i]['weather'][0]['id']
    weather_main = tmp[i]['weather'][0]['main']
    
    weather=['Clear', 'Mist','Fog','Smoke', 'Clouds', 'Drizzle', 'Rain', 'Snow']
    weather_main= weather.index(weather_main)
    
    order_features=[wday, second, origin_stop_id]
    #print("order_feature:",order_features)
    
    rfc=joblib.load('./models/predictOrder.joblib')
    order=int(rfc.predict([order_features])[0])
    #print("order:", order)
    
    origin_features = [origin_stop_id, wday, origin_stop_sequence, order, temp, feels_like, pressure, humidity, wind_speed, wind_deg, coulds_all, weather_id, weather_main]
    destination_features = [destination_stop_id, wday, destination_stop_sequence, order, temp, feels_like, pressure, humidity, wind_speed, wind_deg, coulds_all, weather_id,weather_main]
    
    #print("destination_features:",destination_features)
    rfc = joblib.load('./models/Model_for_47_1.joblib')
    
    pre_origin = rfc.predict([origin_features])[0]
    pre_destination = rfc.predict([destination_features])[0]
    
    
    prediction_time = abs(int((pre_destination - pre_origin)/60))
    
    
    return HttpResponse(json.dumps({"prediction_time":prediction_time}))


    
    
    
    
