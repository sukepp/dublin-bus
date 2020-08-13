# COMP47360 Research Practicum: Dublin Bus Journey Time Prediction System

## Introduction
This is the repository for summer project of group 14: The Dream Team.

## Prerequisites
- Git
- Anaconda

## Installation
- Clone the git repository
```
git clone https://github.com/FreddieNIU/Research-Practicum.git
```
- Change into the Research-Practicum directory
```
cd Research-Practicum
```
- (Optional) Create a virtual environment using conda
```
conda create -n DublinBus python=3.7
```
- (Optional) Activate the environment created in the previous step
```
conda activate DublinBus
```
- Install the required python libraries using pip
```
pip install -r requirements.txt
```

## Running the Application
- Migrations
```
cd ./Research-Practicum/DublinBus
python manage.py runserver
manage.py makemigrations
manage.py migrate
```
- Import static data
```
python manage.py shell
import load.py
exit
```
- Get weather forecast information
```
python forecast.py
```
- Start the Django backend
```
python manage.py runserver
```

## Contributions
- Jiaqi Guo
- Siang-Teng Jiang
- Yingjie Niu
- Peisong Han
