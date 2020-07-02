import requests
import time

url='http://api.openweathermap.org/data/2.5/forecast?q=Dublin,ie&units=metric&appid=62d8e38e8a3f439885a38dcff6e8e86d'

while True:
    text_page=requests.get(url)
    open('./forecast.json','wb').write(text_page.content)
    time.sleep(60*60)



 