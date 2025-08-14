from django.urls import path
from . import views

urlpatterns = [
    path("", views.login, name="login"),
    #path('dashboard/', views.dashboard, name='dashboard'),
    path('main/', views.unified_view, name='unified_view'),
    path('logout/', views.logout, name='logout'),
    
    # Edit URLs
    path('edit_aset/<int:asetid>/', views.edit_aset, name='edit_aset'),
    path('edit_lokasi/<int:lid>/', views.edit_lokasi, name='edit_lokasi'),
    path('edit_e1/<int:e1id>/', views.edit_e1, name='edit_e1'),
    path('edit_e2/<int:e2id>/', views.edit_e2, name='edit_e2'),
    path('edit_e3/<int:e3id>/', views.edit_e3, name='edit_e3'),
    path('edit_e4/<int:e4id>/', views.edit_e4, name='edit_e4'),
    path('edit_e5/<int:e5id>/', views.edit_e5, name='edit_e5'),
    path('edit_e6/<int:e6id>/', views.edit_e6, name='edit_e6'),
    path('edit_e7/<int:e7id>/', views.edit_e7, name='edit_e7'),
    path('edit_e8/<int:e8id>/', views.edit_e8, name='edit_e8'),
    
    # Delete URLs
    path('delete_aset/<int:asetid>/', views.delete_aset, name='delete_aset'),
    path('delete_lokasi/<int:lid>/', views.delete_lokasi, name='delete_lokasi'),
    path('delete_e1/<int:e1id>/', views.delete_e1, name='delete_e1'),
    path('delete_e2/<int:e2id>/', views.delete_e2, name='delete_e2'),
    path('delete_e3/<int:e3id>/', views.delete_e3, name='delete_e3'),
    path('delete_e4/<int:e4id>/', views.delete_e4, name='delete_e4'),
    path('delete_e5/<int:e5id>/', views.delete_e5, name='delete_e5'),
    path('delete_e6/<int:e6id>/', views.delete_e6, name='delete_e6'),
    path('delete_e7/<int:e7id>/', views.delete_e7, name='delete_e7'),
    path('delete_e8/<int:e8id>/', views.delete_e8, name='delete_e8'),
]