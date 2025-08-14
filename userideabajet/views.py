from django.shortcuts import render, redirect
from django.contrib import messages
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
from adminideabajet.models import Lokasi, Elemen1, Elemen2, Elemen3, Elemen4, Elemen5, Elemen6, Elemen7, Elemen8, Aset
from .models import UserInfo, ElemenUtama, Cadangan
import json
from django.core.serializers.json import DjangoJSONEncoder

# Create your views here.
def mainpage(request):
    # Get or create submission session
    submission_id = request.session.get('submission_id')
    submission_data = None
    
    if submission_id:
        try:
            submission = UserInfo.objects.get(id=submission_id)
            submission_data = {
                'step1': {
                    'name': submission.name,
                    'email': submission.email,
                    'jantina': submission.jantina,
                    'bangsa': submission.bangsa,
                    'umur': submission.umur,
                    'job': submission.job,
                    'zon': submission.zon,
                },
                'step2': [],
                'step3': {'cad': ''}
            }
            
            # Get step 2 data
            keutamaan_list = ElemenUtama.objects.filter(demografik=submission)
            for k in keutamaan_list:
                submission_data['step2'].append({
                    'elemen': k.elemen,
                    'pilihan': k.pilihan,
                    'lokasi': k.lokasi,
                    'butiran': k.butiran
                })
            
            # Get step 3 data
            try:
                cadangan = Cadangan.objects.get(demografik=submission)
                submission_data['step3']['cad'] = cadangan.cad
            except Cadangan.DoesNotExist:
                pass
                
        except UserInfo.DoesNotExist:
            request.session.pop('submission_id', None)
    
    context = {
        'lokasi_data': Lokasi.objects.all(),
        'e1_data': Elemen1.objects.all(),
        'e2_data': Elemen2.objects.all(),
        'e3_data': Elemen3.objects.all(),
        'e4_data': Elemen4.objects.all(),
        'e5_data': Elemen5.objects.all(),
        'e6_data': Elemen6.objects.all(),
        'e7_data': Elemen7.objects.all(),
        'e8_data': Elemen8.objects.all(),
        'aset_data': Aset.objects.all(),
        'submission_data': submission_data,
        'submission_data_json': json.dumps(submission_data, cls=DjangoJSONEncoder) if submission_data else 'null',
    }
    return render(request, 'mainpage.html', context)


@csrf_exempt
@require_http_methods(["POST"])
def save_step(request):
    try:
        data = json.loads(request.body)
        step = data.get('step')
        
        if step == 1:
            # Save or update Step1 data
            submission_id = request.session.get('submission_id')
            if submission_id:
                try:
                    submission = UserInfo.objects.get(id=submission_id)
                except UserInfo.DoesNotExist:
                    submission = UserInfo()
            else:
                submission = UserInfo()
            
            submission.name = data.get('name', '')
            submission.email = data.get('email', '')
            submission.jantina = data.get('jantina', '')
            submission.bangsa = data.get('bangsa', '')
            submission.umur = data.get('umur', '')
            submission.job = data.get('job', '')
            submission.zon = data.get('zon', '')
            submission.save()
            
            request.session['submission_id'] = submission.id
            
            return JsonResponse({'success': True, 'message': 'Step 1 data saved successfully'})
        
        elif step == 2:
            # Save Step2 data (ElemenKeutamaan)
            submission_id = request.session.get('submission_id')
            if not submission_id:
                return JsonResponse({'success': False, 'message': 'No submission found'})
            
            try:
                submission = UserInfo.objects.get(id=submission_id)
            except UserInfo.DoesNotExist:
                return JsonResponse({'success': False, 'message': 'Submission not found'})
            
            # Clear existing step 2 data
            ElemenUtama.objects.filter(demografik=submission).delete()
            
            # Save new step 2 data
            keutamaan_data = data.get('keutamaan', [])
            for item in keutamaan_data:
                ElemenUtama.objects.create(
                    demografik=submission,
                    elemen=item.get('elemen'),
                    pilihan=item.get('pilihan', ''),
                    lokasi=item.get('lokasi', ''),
                    butiran=item.get('butiran', '')
                )
            
            return JsonResponse({'success': True, 'message': 'Step 2 data saved successfully'})
        
        elif step == 3:
            # Save Step3 data (Cadangan)
            submission_id = request.session.get('submission_id')
            if not submission_id:
                return JsonResponse({'success': False, 'message': 'No submission found'})
            
            try:
                submission = UserInfo.objects.get(id=submission_id)
            except UserInfo.DoesNotExist:
                return JsonResponse({'success': False, 'message': 'Submission not found'})
            
            # Save or update cadangan
            cadangan, created = Cadangan.objects.get_or_create(
                demografik=submission,
                defaults={'cad': data.get('cad', '')}
            )
            if not created:
                cadangan.cad = data.get('cad', '')
                cadangan.save()
            
            # Clear session since form is complete
            request.session.pop('submission_id', None)
            
            return JsonResponse({'success': True, 'message': 'Form completed successfully'})
        
        else:
            return JsonResponse({'success': False, 'message': 'Invalid step'})
            
    except json.JSONDecodeError:
        return JsonResponse({'success': False, 'message': 'Invalid JSON data'})
    except Exception as e:
        return JsonResponse({'success': False, 'message': f'Error saving data: {str(e)}'})


@csrf_exempt
@require_http_methods(["GET"])
def get_submission_data(request, submission_id):
    try:
        submission = UserInfo.objects.get(id=submission_id)
        
        # Prepare submission data
        data = {
            'step1': {
                'name': submission.name,
                'email': submission.email,
                'jantina': submission.jantina,
                'bangsa': submission.bangsa,
                'umur': submission.umur,
                'job': submission.job,
                'zon': submission.zon,
            },
            'step2': [],
            'step3': {'cad': ''}
        }
        
        # Get step 2 data
        keutamaan_list = ElemenUtama.objects.filter(demografik=submission)
        for k in keutamaan_list:
            data['step2'].append({
                'elemen': k.elemen,
                'pilihan': k.pilihan,
                'lokasi': k.lokasi,
                'butiran': k.butiran
            })
        
        # Get step 3 data
        try:
            cadangan = Cadangan.objects.get(demografik=submission)
            data['step3']['cad'] = cadangan.cad
        except Cadangan.DoesNotExist:
            pass
        
        return JsonResponse({
            'success': True,
            'submission': data
        })
        
    except UserInfo.DoesNotExist:
        return JsonResponse({'success': False, 'message': 'Submission not found'})
    except Exception as e:
        return JsonResponse({'success': False, 'message': f'Error retrieving data: {str(e)}'})
