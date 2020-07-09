from App.models import Stop,Route
import json
def load_route():
    f=open(r"./static_data/route_relation.json", "r")
    out = f.read()
    f.close()
    
    tmp = json.loads(out)
    num = len(tmp)
    i=0
    while i < num:
        direction_id = tmp[i]['direction_id']
        route_id = tmp[i]['route_id']
        stop_sequence = tmp[i]['stop_sequence']
        stop_id = tmp[i]['stop_id']
        print("Insert",direction_id,route_id,stop_sequence,stop_id)
        
        route=Route(direction_id=direction_id,route_id=route_id,stop_sequence=stop_sequence,stop_id=stop_id)
        route.save()
        i+=1
        
    print("Load route: Finished!")

def load_stop():
    f=open(r"./static_data/stops.json", "r")
    out = f.read()
    f.close()
   
    tmp = json.loads(out)
    num = len(tmp)
    
    i=0
    while i < num:
        stop_id = tmp[i]['stop_id']
        stop_name = tmp[i]['stop_name']
        stop_lat = tmp[i]['stop_lat']
        stop_lon = tmp[i]['stop_lon']
        print("Insert",stop_id,stop_name,stop_lat,stop_lon)
        
        stop=Stop(stop_id=stop_id,stop_name=stop_name,stop_lat=stop_lat,stop_lon=stop_lon)
        stop.save()

        i+=1
        
    print("Load stop: Finished!")
    
    
    
load_stop()    
load_route()
