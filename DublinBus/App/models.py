from django.db import models

# Create your models here.

class Stop(models.Model):
    stop_id = models.CharField(max_length=255, primary_key=True)
    stop_name = models.CharField(max_length=255)
    stop_lat = models.CharField(max_length=255)
    stop_lon = models.CharField(max_length=255)
    
    class Meta:
        db_table = "stops" 
    
    
class Route(models.Model):
    stop_id = models.CharField(max_length=255)
    stop_sequence = models.CharField(max_length=255)
    direction_id = models.CharField(max_length=255)
    route_id = models.CharField(max_length=255)
    
    class Meta:
        db_table = "route_relation" 
    