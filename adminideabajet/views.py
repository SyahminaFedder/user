from django.shortcuts import render, redirect
from django.contrib import messages
from django.urls import reverse
from django.http import HttpResponseRedirect
from . models import Admin, Elemen1, Lokasi, Elemen2, Elemen3, Elemen4, Elemen5, Elemen6, Elemen7, Elemen8, Aset
# Create your views here.

def login(request):
    if request.method == 'POST':
        adminid = request.POST.get('id')
        password = request.POST.get('password')

        try:
            admin = Admin.objects.get(adminid=adminid, password=password)
            request.session['id'] = admin.adminid  # simpan dalam session
            request.session['message'] = 'Login berjaya!'
            return HttpResponseRedirect(f"{reverse('unified_view')}?section=dashboard")  # redirect to main dashboard
        except Admin.DoesNotExist:
            return render(request, 'login.html', {'message': 'Invalid Admin ID or Password',})
    return render (request,"login.html")



def unified_view(request):
    """Unified view that handles all sections in one template"""
    section = request.GET.get('section', 'dashboard')
    
    if request.method == 'POST':
        # Handle form submissions for different sections
        if 'aset' in request.POST:
            listaset = request.POST.get('aset')
            elemen5_id = request.POST.get('elemen5_id')
            if listaset:
                aset = Aset.objects.create(list_aset=listaset)
                if elemen5_id:
                    try:
                        elemen5 = Elemen5.objects.get(e5id=elemen5_id)
                        aset.elemen5 = elemen5
                        aset.save()
                    except Elemen5.DoesNotExist:
                        pass
        elif 'list_lokasi' in request.POST:
            listloc = request.POST.get('list_lokasi')
            if listloc:
                Lokasi.objects.create(list_lokasi=listloc)
        elif 'e1' in request.POST:
            liste1 = request.POST.get('e1')
            if liste1:
                Elemen1.objects.create(e1=liste1)
        elif 'e2' in request.POST:
            liste2 = request.POST.get('e2')
            if liste2:
                Elemen2.objects.create(e2=liste2)
        elif 'e3' in request.POST:
            liste3 = request.POST.get('e3')
            if liste3:
                Elemen3.objects.create(e3=liste3)
        elif 'e4' in request.POST:
            liste4 = request.POST.get('e4')
            if liste4:
                Elemen4.objects.create(e4=liste4)
        elif 'e5' in request.POST:
            liste5 = request.POST.get('e5')
            if liste5:
                Elemen5.objects.create(e5=liste5)
        elif 'e6' in request.POST:
            liste6 = request.POST.get('e6')
            if liste6:
                Elemen6.objects.create(e6=liste6)
        elif 'e7' in request.POST:
            liste7 = request.POST.get('e7')
            if liste7:
                Elemen7.objects.create(e7=liste7)
        elif 'e8' in request.POST:
            liste8 = request.POST.get('e8')
            if liste8:
                Elemen8.objects.create(e8=liste8)

        return redirect('unified_view')
    
    message = request.session.pop('message', None)
    
    # Get admin data from session
    admin = None
    if 'id' in request.session:
        try:
            admin = Admin.objects.get(adminid=request.session['id'])
        except Admin.DoesNotExist:
            pass
    
    # Gather all data
    # Group aset data by elemen5
    aset_by_elemen5 = {}
    for elemen5 in Elemen5.objects.all():
        aset_list = Aset.objects.filter(elemen5=elemen5)
        if aset_list.exists():
            aset_by_elemen5[elemen5] = aset_list
    
    # Get aset without elemen5 (for backward compatibility)
    aset_without_elemen5 = Aset.objects.filter(elemen5__isnull=True)
    
    context = {
        'admin': admin,  # Pass admin data to template
        'aset_by_elemen5': aset_by_elemen5,
        'aset_without_elemen5': aset_without_elemen5,
        'aset_data': Aset.objects.all().order_by('elemen5__e5', 'list_aset'),  # Order by elemen5 then by aset name
        'lokasi_data': Lokasi.objects.all(),
        'e1_data': Elemen1.objects.all(),
        'e2_data': Elemen2.objects.all(),
        'e3_data': Elemen3.objects.all(),
        'e4_data': Elemen4.objects.all(),
        'e5_data': Elemen5.objects.all(),
        'e6_data': Elemen6.objects.all(),
        'e7_data': Elemen7.objects.all(),
        'e8_data': Elemen8.objects.all(),
        'message': message,
        'current_section': section,
    }
    
    return render(request, 'admin.html', context)

def logout(request):
    if request.method == 'POST':
        try:
            request.session['message'] = 'Logout berjaya!'
            del request.session['id'] 
        except KeyError:
            pass 
        return redirect('login')
    else:
        # Handle GET requests as well
        try:
            request.session['message'] = 'Logout berjaya!'
            del request.session['id'] 
        except KeyError:
            pass 
        return redirect('login')

# Edit views
def edit_aset(request, asetid):
    if request.method == 'POST':
        aset = Aset.objects.get(asetid=asetid)
        aset_value = request.POST.get('aset')
        elemen5_id = request.POST.get('elemen5_id')
        
        if aset_value:  # Only update if value is not empty
            aset.list_aset = aset_value
            aset.save()
        
        # Handle elemen5 update
        if elemen5_id:
            try:
                elemen5 = Elemen5.objects.get(e5id=elemen5_id)
                aset.elemen5 = elemen5
                aset.save()
            except Elemen5.DoesNotExist:
                pass
        elif elemen5_id == '':  # Empty string means no elemen5 selected
            aset.elemen5 = None
            aset.save()
            
        section = request.POST.get('section', 'dashboard')
        return HttpResponseRedirect(f"{reverse('unified_view')}?section={section}")
    return redirect('unified_view')

def edit_lokasi(request, lid):
    if request.method == 'POST':
        lokasi = Lokasi.objects.get(lid=lid)
        lokasi_value = request.POST.get('list_lokasi')
        if lokasi_value:  # Only update if value is not empty
            lokasi.list_lokasi = lokasi_value
            lokasi.save()
        section = request.POST.get('section', 'dashboard')
        return HttpResponseRedirect(f"{reverse('unified_view')}?section={section}")
    return redirect('unified_view')

def edit_e1(request, e1id):
    if request.method == 'POST':
        e1 = Elemen1.objects.get(e1id=e1id)
        e1_value = request.POST.get('e1')
        if e1_value:  # Only update if value is not empty
            e1.e1 = e1_value
            e1.save()
        section = request.POST.get('section', 'dashboard')
        return HttpResponseRedirect(f"{reverse('unified_view')}?section={section}")
    return redirect('unified_view')

def edit_e2(request, e2id):
    if request.method == 'POST':
        e2 = Elemen2.objects.get(e2id=e2id)
        e2_value = request.POST.get('e2')
        if e2_value:  # Only update if value is not empty
            e2.e2 = e2_value
            e2.save()
        section = request.POST.get('section', 'dashboard')
        return HttpResponseRedirect(f"{reverse('unified_view')}?section={section}")
    return redirect('unified_view')

def edit_e3(request, e3id):
    if request.method == 'POST':
        e3 = Elemen3.objects.get(e3id=e3id)
        e3_value = request.POST.get('e3')
        if e3_value:  # Only update if value is not empty
            e3.e3 = e3_value
            e3.save()
        section = request.POST.get('section', 'dashboard')
        return HttpResponseRedirect(f"{reverse('unified_view')}?section={section}")
    return redirect('unified_view')

def edit_e4(request, e4id):
    if request.method == 'POST':
        e4 = Elemen4.objects.get(e4id=e4id)
        e4_value = request.POST.get('e4')
        if e4_value:  # Only update if value is not empty
            e4.e4 = e4_value
            e4.save()
        section = request.POST.get('section', 'dashboard')
        return HttpResponseRedirect(f"{reverse('unified_view')}?section={section}")
    return redirect('unified_view')

def edit_e5(request, e5id):
    if request.method == 'POST':
        e5 = Elemen5.objects.get(e5id=e5id)
        e5_value = request.POST.get('e5')
        if e5_value:  # Only update if value is not empty
            e5.e5 = e5_value
            e5.save()
        section = request.POST.get('section', 'dashboard')
        return HttpResponseRedirect(f"{reverse('unified_view')}?section={section}")
    return redirect('unified_view')

def edit_e6(request, e6id):
    if request.method == 'POST':
        e6 = Elemen6.objects.get(e6id=e6id)
        e6_value = request.POST.get('e6')
        if e6_value:  # Only update if value is not empty
            e6.e6 = e6_value
            e6.save()
        section = request.POST.get('section', 'dashboard')
        return HttpResponseRedirect(f"{reverse('unified_view')}?section={section}")
    return redirect('unified_view')

def edit_e7(request, e7id):
    if request.method == 'POST':
        e7 = Elemen7.objects.get(e7id=e7id)
        e7_value = request.POST.get('e7')
        if e7_value:  # Only update if value is not empty
            e7.e7 = e7_value
            e7.save()
        section = request.POST.get('section', 'dashboard')
        return HttpResponseRedirect(f"{reverse('unified_view')}?section={section}")
    return redirect('unified_view')

def edit_e8(request, e8id):
    if request.method == 'POST':
        e8 = Elemen8.objects.get(e8id=e8id)
        e8_value = request.POST.get('e8')
        if e8_value:  # Only update if value is not empty
            e8.e8 = e8_value
            e8.save()
        section = request.POST.get('section', 'dashboard')
        return HttpResponseRedirect(f"{reverse('unified_view')}?section={section}")
    return redirect('unified_view')

# Delete views
def delete_aset(request, asetid):
    if request.method == 'POST':
        aset = Aset.objects.get(asetid=asetid)
        aset.delete()
        section = request.POST.get('section', 'dashboard')
        return HttpResponseRedirect(f"{reverse('unified_view')}?section={section}")
    return redirect('unified_view')

def delete_lokasi(request, lid):
    if request.method == 'POST':
        lokasi = Lokasi.objects.get(lid=lid)
        lokasi.delete()
        section = request.POST.get('section', 'dashboard')
        return HttpResponseRedirect(f"{reverse('unified_view')}?section={section}")
    return redirect('unified_view')

def delete_e1(request, e1id):
    if request.method == 'POST':
        e1 = Elemen1.objects.get(e1id=e1id)
        e1.delete()
        section = request.POST.get('section', 'dashboard')
        return HttpResponseRedirect(f"{reverse('unified_view')}?section={section}")
    return redirect('unified_view')

def delete_e2(request, e2id):
    if request.method == 'POST':
        e2 = Elemen2.objects.get(e2id=e2id)
        e2.delete()
        section = request.POST.get('section', 'dashboard')
        return HttpResponseRedirect(f"{reverse('unified_view')}?section={section}")
    return redirect('unified_view')

def delete_e3(request, e3id):
    if request.method == 'POST':
        e3 = Elemen3.objects.get(e3id=e3id)
        e3.delete()
        section = request.POST.get('section', 'dashboard')
        return HttpResponseRedirect(f"{reverse('unified_view')}?section={section}")
    return redirect('unified_view')

def delete_e4(request, e4id):
    if request.method == 'POST':
        e4 = Elemen4.objects.get(e4id=e4id)
        e4.delete()
        section = request.POST.get('section', 'dashboard')
        return HttpResponseRedirect(f"{reverse('unified_view')}?section={section}")
    return redirect('unified_view')

def delete_e5(request, e5id):
    if request.method == 'POST':
        e5 = Elemen5.objects.get(e5id=e5id)
        e5.delete()
        section = request.POST.get('section', 'dashboard')
        return HttpResponseRedirect(f"{reverse('unified_view')}?section={section}")
    return redirect('unified_view')

def delete_e6(request, e6id):
    if request.method == 'POST':
        e6 = Elemen6.objects.get(e6id=e6id)
        e6.delete()
        section = request.POST.get('section', 'dashboard')
        return HttpResponseRedirect(f"{reverse('unified_view')}?section={section}")
    return redirect('unified_view')

def delete_e7(request, e7id):
    if request.method == 'POST':
        e7 = Elemen7.objects.get(e7id=e7id)
        e7.delete()
        section = request.POST.get('section', 'dashboard')
        return HttpResponseRedirect(f"{reverse('unified_view')}?section={section}")
    return redirect('unified_view')

def delete_e8(request, e8id):
    if request.method == 'POST':
        e8 = Elemen8.objects.get(e8id=e8id)
        e8.delete()
        section = request.POST.get('section', 'dashboard')
        return HttpResponseRedirect(f"{reverse('unified_view')}?section={section}")
    return redirect('unified_view')  