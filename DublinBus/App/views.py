from django.shortcuts import render
from django.http import HttpResponse
from django.http.response import JsonResponse
from .models import Stop, Route
import json
import time as _time
import requests
import joblib
import sys
import traceback
import xgboost
import pandas as pd


# from sklearn.externals import joblib


# Create your views here.

def index(request):
    return render(request, "App/home.html");


def timetable(request):
    return render(request, "App/timetable.html");


def dublin_airport(request):
    return render(request, "App/dublin_airport.html");


def get_stops(request):
    result = {}
    stops = list(Stop.objects.values())
    result["stops"] = stops

    return JsonResponse(result)


def get_route_stop_relation(request):
    routes = sum(list(Route.objects.values_list("route_id").distinct()), ())
    result = {}
    for route in routes:
        result[route] = {}
        direction_0 = list(Route.objects.filter(route_id=route, direction_id='0').values("stop_id"))
        direction_1 = list(Route.objects.filter(route_id=route, direction_id='1').values("stop_id"))

        if direction_0:
            result[route]['0'] = direction_0
        if direction_1:
            result[route]['1'] = direction_1

    return JsonResponse(result)


def predict_time(request, route_id, origin_stop_sequence, origin_stop_id, destination_stop_sequence,
                 destination_stop_id, date, time):
    date_time = date + ' ' + time
    # struct_time entered
    struct_date_time = _time.strptime(date_time, '%Y-%m-%d %H:%M')

    wday = int(_time.strftime('%w', struct_date_time))
    second = struct_date_time.tm_hour * 3600 + struct_date_time.tm_min * 60

    # time stamp entered
    timestamp = _time.mktime(struct_date_time)

    f = open('./forecast.json')
    text_page = f.read()
    f.close()
    tmp = json.loads(text_page)['list']

    num = len(tmp)
    i = 0

    while i < num:
        # struct time of forecast
        struct_dt = _time.strptime(tmp[i]["dt_txt"], '%Y-%m-%d %H:%M:%S')

        # time stamp of forecast
        dt_stamp = _time.mktime(struct_dt)

        if timestamp < dt_stamp:
            break
        i += 1

    if i > 0:
        i -= 1

    temp = tmp[i]['main']['temp']
    feels_like = tmp[i]['main']['feels_like']
    pressure = tmp[i]['main']['pressure']
    humidity = tmp[i]['main']['humidity']
    wind_speed = tmp[i]['wind']['speed']
    wind_deg = tmp[i]['wind']['deg']
    coulds_all = tmp[i]['clouds']['all']
    weather_id = tmp[i]['weather'][0]['id']
    weather_main = tmp[i]['weather'][0]['main']

    weather = ['Clear', 'Mist', 'Fog', 'Smoke', 'Clouds', 'Drizzle', 'Rain', 'Snow']
    weather_main = weather.index(weather_main)

    order_features = [wday, second, origin_stop_id]
    # print("order_feature:",order_features)

    rfc = joblib.load('./models/predictOrder.joblib')
    order = int(rfc.predict([order_features])[0])
    # print("order:", order)

    origin_features = pd.DataFrame([[int(origin_stop_id), wday, int(origin_stop_sequence), order, temp, feels_like,
                                     pressure, humidity, wind_speed, wind_deg, coulds_all, weather_id, weather_main]])
    destination_features = pd.DataFrame([[int(destination_stop_id), wday, int(destination_stop_sequence), order, temp,
                                          feels_like, pressure, humidity, wind_speed, wind_deg, coulds_all, weather_id,
                                          weather_main]])
    destination_features.columns = origin_features.columns = ['STOPPOINTID', 'DAYOFWEEK', 'PROGRNUMBER', 'ORDER',
                                                              'temp', 'feels_like', 'pressure', 'humidity',
                                                              'wind_speed', 'wind_deg', 'clouds_all', 'weather_id',
                                                              'weather_main']
    # print("destination_features:",destination_features)

    try:
        rfc = joblib.load('./models/Model_%s.joblib' % route_id)

        pre_origin = rfc.predict(origin_features)[0]
        pre_destination = rfc.predict(destination_features)[0]

        prediction_time = abs(int((pre_destination - pre_origin) / 60))

        del rfc

    except:
        print(traceback.format_exc())

    return HttpResponse(json.dumps({"prediction_time": prediction_time}))


def test(request):
    result = {}
    stops = list(Stop.objects.values())
    result["stops"] = stops

    return JsonResponse(result)
