import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { ReactiveFormsModule, FormBuilder } from '@angular/forms';
import { environment } from 'src/environments/environment';
import { ManageclinicComponent } from '../manage-clinic/manage-clinic.component';
import { RouterTestingModule } from '@angular/router/testing';
import { ClinicFormComponent } from './clinic-form.component';
import { ClinicService } from '../clinic.service';
import { ViewClinicComponent } from '../view-clinic/view-clinic.component';
import { of } from 'rxjs';
import Swal from 'sweetalert2';
import AppRoutes from '../app.routes';
import { By } from '@angular/platform-browser';
import { ElementRef } from '@angular/core';
class MockElementRef extends ElementRef {
  constructor() {
    super(null);
  }
}

describe('ClinicFormComponent', () => {
  let component: ClinicFormComponent;
  let fixture: ComponentFixture<ClinicFormComponent>;
  let httpTestingController: HttpTestingController;
  let formBuilder: FormBuilder;
  let service = ClinicService

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ClinicFormComponent],
      imports: [RouterTestingModule.withRoutes([

        {
          path: 'manage-clinic',
          component: ManageclinicComponent
        }, {
          path: 'view-clinic/1',
          component: ViewClinicComponent
        }
      ]), HttpClientTestingModule, ReactiveFormsModule],

    })
      .compileComponents();
    const mockActivatedRoute = {
      params: of({ clinicId: 1 }),
    };

    fixture = TestBed.createComponent(ClinicFormComponent);
    component = fixture.componentInstance;
    formBuilder = TestBed.inject(FormBuilder);
    component.clinicForm = formBuilder.group({
      address: ''
    });
    httpTestingController = TestBed.inject(HttpTestingController);
    fixture.detectChanges();
  });

  afterEach(() => {
    httpTestingController.verify();
  })

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should clear places array and return early when address is empty', () => {
    component.places = ['Place 1', 'Place 2'];
    component.searchPlaces();
    expect(component.places).toEqual([]);
  });

  it('should not clear places array when address has a value', () => {
    component.places = ['Place 1', 'Place 2'];
    component.clinicForm.get('address')?.setValue('Some address');
    component.searchPlaces();
    expect(component.places).toEqual(['Place 1', 'Place 2']);
  });

  it('should make an HTTP GET request when address matches', fakeAsync(() => {
    component.clinicForm.get('address')?.setValue('Some address');
    component.searchPlaces();
    tick(1000);
    const req = httpTestingController.expectOne(
      `${environment.apiUrl}${AppRoutes.LOCATIONS}?query=Some%20address`
    );
    expect(req.request.method).toBe('GET');
    req.flush({ data: ['Place 1', 'Place 2'] });

    expect(component.autoCompleteVisible).toBe(true);
    expect(component.places).toEqual(['Place 1', 'Place 2']);
  }));

  it('should handle error when position stack API call fails', fakeAsync(() => {
    component.clinicForm.get('address')?.setValue('Some address');
    component.searchPlaces();
    tick(1000);
    const req = httpTestingController.expectOne(
      `${environment.apiUrl}${AppRoutes.LOCATIONS}?query=Some%20address`
    );
    expect(req.request.method).toBe('GET');
    req.error(new ErrorEvent('API error'));
    expect(component.autoCompleteVisible).toBe(false);
  }));

  it('should update form values and clear places and visibility', () => {
    const place = {
      county: 'Some County',
      region: 'Some State',
      postal_code: '12345'
    };
    component.selectPlace(place);
    expect(component.clinicForm.value.city).toEqual('Some County');
    expect(component.clinicForm.value.state).toEqual('Some State');
    expect(component.clinicForm.value.zipcode).toEqual('12345');
    expect(component.places).toEqual([]);
    expect(component.autoCompleteVisible).toBe(false);
  });

  it('should initialize clinicForm with required fields', () => {
    component.ngOnInit();
    expect(component.clinicForm.contains('name')).toBe(true);
    expect(component.clinicForm.contains('address')).toBe(true);
    expect(component.clinicForm.contains('city')).toBe(true);
    expect(component.clinicForm.contains('state')).toBe(true);
    expect(component.clinicForm.contains('zipcode')).toBe(true);
  });

  it('should submit the form when the submit button is clicked', () => {
    const spyAlert = spyOn(Swal, 'fire');
    component.clinicForm.setValue({
      email: "test123@example.com",
      password: "password",
      name: "testClinic",
      address: "testAddress",
      city: "testCity",
      state: "testState",
      zipcode: "testZipcode",
    });
    const mockResponse = { message: "Successful" };
    spyOn(component.getRouter(),'navigate');
    component.clinics();
    const req = httpTestingController.expectOne(environment.apiUrl + AppRoutes.CLINIC);
    expect(req.request.method).toEqual('POST');
    req.flush(mockResponse);
    expect(spyAlert).toHaveBeenCalledWith('Successful',
      'You have successfully added a new clinic!',
      'success');
    expect(component.getRouter().navigate).toHaveBeenCalledWith(['/manage-clinic']);
  });

  it('should alert error when failed to add clinic details', () => {
    component.clinicForm.setValue({
      email: "test123@example.com",
      password: "password",
      name: "testClinic",
      address: "testAddress",
      city: "testCity",
      state: "testState",
      zipcode: "testZipcode",
    });
    component.clinics();
    const spyAlert = spyOn(Swal, 'fire');
    const mockResponse = {
      message: "Validation Failed",
      errors: {
        email: [
          "The email has already been taken."
        ]
      }
    };
    const req = httpTestingController.expectOne(environment.apiUrl + AppRoutes.CLINIC);
    expect(req.request.method).toEqual('POST');
    req.flush(mockResponse, { status: 422, statusText: 'Unprocessable Content' });
    expect(spyAlert).toHaveBeenCalledWith('Error',
      "email: The email has already been taken.<br>",
      'error');
  });

  it('should logout when unauthorized to add clinic details', () => {
    const navigateSpy = spyOn(component.getRouter(), 'navigate');
    component.clinicForm.setValue({
      email: "test123@example.com",
      password: "password",
      name: "testClinic",
      address: "testAddress",
      city: "testCity",
      state: "testState",
      zipcode: "testZipcode",
    });
    component.clinics();
    const spyLogout = spyOn(component.authService, 'logout');
    const mockResponse = {
      message: "Unauthorized",
    };
    const req = httpTestingController.expectOne(environment.apiUrl + AppRoutes.CLINIC);
    expect(req.request.method).toEqual('POST');
    req.flush(mockResponse, { status: 401, statusText: 'Unauthorized' });
    expect(spyLogout).toHaveBeenCalled();
  });

  it('should show error add clinic details', () => {
    const navigateSpy = spyOn(component.getRouter(), 'navigate');
    component.clinicForm.setValue({
      email: "test123@example.com",
      password: "password",
      name: "testClinic",
      address: "testAddress",
      city: "testCity",
      state: "testState",
      zipcode: "testZipcode",
    });
    component.clinics();
    const spyAlert = spyOn(Swal, 'fire');
    const mockResponse = {
      message: "errorMessage",
    };
    const req = httpTestingController.expectOne(environment.apiUrl + AppRoutes.CLINIC);
    expect(req.request.method).toEqual('POST');
    req.flush(mockResponse, { status: 400, statusText: 'BadRequest' });
    expect(spyAlert).toHaveBeenCalledWith(
      'Error',
      'errorMessage',
      'error'
    );
  });

  it('should have a form with the expected controls', () => {
    component.clinicDetails = {
      clinic: {
        id: 1,
        account_id: "C000001",
        is_enabled: true,
        name: "Test Name",
        address: "Test Address",
        city: "Test City",
        state: "Test State",
        zipcode: "123456",
        user_id: 1,
      }
    }
    expect(component.clinicForm.contains('name')).toBe(true);
    expect(component.clinicForm.contains('address')).toBe(true);
    expect(component.clinicForm.contains('city')).toBe(true);
    expect(component.clinicForm.contains('state')).toBe(true);
    expect(component.clinicForm.contains('zipcode')).toBe(true);
  });

  it('should call updateClinic if clinicId exists', () => {
    component.clinicId = 1;
    component.clinicForm.setValue({
      email: 'test@example.com',
      password: 'password',
      name: "testClinic",
      address: "testAddress",
      city: "testCity",
      state: "testState",
      zipcode: "testZipcode",
    });
    spyOn(component, 'updateClinic');
    component.clinics();
    expect(component.updateClinic).toHaveBeenCalled();
  });

  it('should call createClinic if clinicId does not exist', () => {
    component.clinicId = null;
    component.clinicForm.setValue({
      email: 'test@example.com',
      password: 'password',
      name: "testClinic",
      address: "testAddress",
      city: "testCity",
      state: "testState",
      zipcode: "testZipcode",
    });
    spyOn(component, 'createClinic');
    component.clinics();
    expect(component.createClinic).toHaveBeenCalled();
  });

  it('should get clinic details if clinicId is present', () => {
    const mockClinicDetails = {
      email: 'test@example.com',
      password: 'password',
      name: "testClinic",
      address: "testAddress",
      city: "testCity",
      state: "testState",
      zipcode: "123456",
    };
    spyOn(component.clinicService, 'getClinicDetails');
    component.clinicId = 1;
    component.getActivatedRoute().snapshot.params['id'] = 1;
    component.ngOnInit();
    component.clinicDetails = {
      email: 'test@example.com',
      password: 'password',
      name: "testClinic",
      address: "testAddress",
      city: "testCity",
      state: "testState",
      zipcode: "123456",
    }
    expect(component.clinicDetails).toEqual(mockClinicDetails);
    expect(component.clinicService.getClinicDetails).toHaveBeenCalled();
  });

  it('should update clinic details when the submit button is clicked', () => {
    const spyAlert = spyOn(Swal, 'fire');
    const clinicID = 1;
    component.clinicId = clinicID;
    component.clinicForm.setValue({
      email: 'test@example.com',
      password: 'password',
      name: "testClinic",
      address: "testAddress",
      city: "testCity",
      state: "testState",
      zipcode: "testZipcode",
    });
    component.clinics();
    const req = httpTestingController.expectOne(environment.apiUrl + AppRoutes.CLINIC + '/' + clinicID);
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual({
      name: "testClinic",
      address: "testAddress",
      city: "testCity",
      state: "testState",
      zipcode: "testZipcode",
    })
    const mockResponse = { message: "Successful" };
    req.flush(mockResponse);
    expect(spyAlert).toHaveBeenCalledWith('Successful',
      'You have successfully updated the clinic!',
      'success'
    );
  });

  it('should alert error when failed to update clinic details', () => {
    const clinicID = 1;
    component.clinicId = clinicID;
    component.clinicForm.setValue({
      email: 'test@example.com',
      password: 'password',
      name: "testClinic",
      address: "testAddress",
      city: "testCity",
      state: "testState",
      zipcode: "testZipcode",
    });
    component.updateClinic();
    const spyAlert = spyOn(Swal, 'fire');
    const mockResponse = {
      message: "Validation Failed",
      errors: {
        email: [
          "The email field is required."
        ]
      }
    };
    const req = httpTestingController.expectOne(environment.apiUrl + AppRoutes.CLINIC + '/' + clinicID);
    expect(req.request.method).toEqual('PUT');
    req.flush(mockResponse, { status: 422, statusText: 'Unprocessable Content' });
    expect(spyAlert).toHaveBeenCalledWith(
      'Error',
      `email: The email field is required.<br>`,
      'error');
  });


  it('should logout if unauthorized response in update request', () => {
    const clinicID = 1;
    component.clinicId = clinicID;
    const token = 'test-token';
    const mockResponse = {
      message: 'Unauthorized'
    };
    spyOn(localStorage, 'getItem').and.returnValue(token);
    const spyLogout = spyOn(component.authService, 'logout');
    component.updateClinic();
    const req = httpTestingController.expectOne(environment.apiUrl + AppRoutes.CLINIC + '/' + clinicID);
    expect(req.request.method).toBe('PUT');
    req.flush(mockResponse, { status: 401, statusText: 'Unauthorized' });
    expect(spyLogout).toHaveBeenCalled();
  });

  it('should show error in update request', () => {
    const clinicID = 1;
    component.clinicId = clinicID;
    const token = 'test-token';
    const mockResponse = {
      message: 'errorMessage'
    };
    spyOn(localStorage, 'getItem').and.returnValue(token);
    const spyAlert = spyOn(Swal, 'fire');
    component.updateClinic();
    const req = httpTestingController.expectOne(environment.apiUrl + AppRoutes.CLINIC + '/' + clinicID);
    expect(req.request.method).toBe('PUT');
    req.flush(mockResponse, { status: 400, statusText: 'Bad Request' });
    expect(spyAlert).toHaveBeenCalledWith(
      'Error',
      'errorMessage',
      'error'
    );
  });

  it('should not call http.post when isFormValid returns false', () => {
    spyOn(component.http, 'post').and.returnValue(of({}));
    component.isFormValid = () => false;
    component.clinics();
    expect(component.http.post).not.toHaveBeenCalled();
  });

  it('should return false for invalid form', () => {
    const result = component.isFormValid();
    expect(result).toBe(false);
  });

  it('should hide autocomplete dropdown when clicking outside', fakeAsync(() => {
    component.autoCompleteVisible = true;
    const mockAutocompleteElement = document.createElement('div');
    const mockEvent = new MouseEvent('click');
    const nativeElement = fixture.nativeElement;
    spyOn(nativeElement, 'querySelector').and.returnValue(mockAutocompleteElement);
    spyOn(mockAutocompleteElement, 'contains').and.returnValue(false);
    component.onDocumentClick(mockEvent);

    expect(component.autoCompleteVisible).toBe(false);
  }));

  it('should not hide autocomplete dropdown when clicking inside', fakeAsync(() => {
    component.autoCompleteVisible = true;
    const mockAutocompleteElement = document.createElement('div');
    const mockEvent = new MouseEvent('click');
    const nativeElement = fixture.nativeElement;
    spyOn(nativeElement, 'querySelector').and.returnValue(mockAutocompleteElement);
    spyOn(mockAutocompleteElement, 'contains').and.returnValue(true);
    component.onDocumentClick(mockEvent);

    expect(component.autoCompleteVisible).toBe(true);
  }));

});
