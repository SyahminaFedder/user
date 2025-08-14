from django.db import models

# Create your models here.
class Admin(models.Model):
    adminid = models.CharField(max_length=10, primary_key=True)
    password = models.CharField(max_length=20)
    name = models.TextField()

class Lokasi(models.Model):
    lid = models.AutoField(primary_key=True)
    list_lokasi = models.CharField(max_length=255)

class Aset(models.Model):
    asetid = models.AutoField(primary_key=True)
    list_aset = models.CharField(max_length=255)
    elemen5 = models.ForeignKey('Elemen5', on_delete=models.CASCADE, null=True, blank=True)

class Elemen1(models.Model):
    e1id = models.AutoField(primary_key=True)
    e1 = models.TextField()

class Elemen2(models.Model):
    e2id = models.AutoField(primary_key=True)
    e2 = models.TextField()

class Elemen3(models.Model):
    e3id = models.AutoField(primary_key=True)
    e3 = models.TextField()

class Elemen4(models.Model):
    e4id = models.AutoField(primary_key=True)
    e4 = models.TextField()

class Elemen5(models.Model):
    e5id = models.AutoField(primary_key=True)
    e5 = models.TextField()

class Elemen6(models.Model):
    e6id = models.AutoField(primary_key=True)
    e6 = models.TextField()

class Elemen7(models.Model):
    e7id = models.AutoField(primary_key=True)
    e7 = models.TextField()

class Elemen8(models.Model):
    e8id = models.AutoField(primary_key=True)
    e8 = models.TextField()