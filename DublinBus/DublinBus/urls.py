"""DublinBus URL Configuration

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/2.2/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path
from App import views

urlpatterns = [
    path('admin/', admin.site.urls),
    path('', views.index),
    path('timetable', views.timetable),
    path('dublin_airport', views.dublin_airport),
    path('get_stops/', views.get_stops),
    path('get_route_stop_relation',views.get_route_stop_relation),
    path('predict_time/<route_id>/<origin_stop_sequence>/<origin_stop_id>/<destination_stop_sequence>/<destination_stop_id>/<date>/<time>', views.predict_time),
    path('hello/', views.test),
    path('test/', views.test2)
]
