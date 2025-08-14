from django.urls import path
from . import views

urlpatterns = [
    path('', views.mainpage, name='mainpage'),
    path('save-step/', views.save_step, name='save_step'),
    path('get-submission/<int:submission_id>/', views.get_submission_data, name='get_submission_data'),
]