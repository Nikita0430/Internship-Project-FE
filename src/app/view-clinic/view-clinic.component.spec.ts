import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { environment } from 'src/environments/environment';
import { RouterTestingModule } from '@angular/router/testing';
import Swal from 'sweetalert2';
import AppRoutes from '../app.routes';
import { HttpClient } from '@angular/common/http';
import { LoginComponent } from '../login/login.component';
import { ViewClinicComponent } from '../view-clinic/view-clinic.component';
import { ManageOrderComponent } from '../manage-order/manage-order.component';


describe('ViewClinicComponent', () => {
  let component: ViewClinicComponent;
  let fixture: ComponentFixture<ViewClinicComponent>;
  let httpTestingController: HttpTestingController;
  let httpClient: HttpClient;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ViewClinicComponent], imports: [RouterTestingModule.withRoutes([
        {
          path: 'login',
          component: LoginComponent
        },
        {
          path: 'manage-clinic',
          component: ManageOrderComponent
        }
      ]), HttpClientTestingModule, ReactiveFormsModule]
    }).compileComponents();

    fixture = TestBed.createComponent(ViewClinicComponent);
    component = fixture.componentInstance;
    component.getActivatedRoute().snapshot.params['id'] = 1;
    httpTestingController = TestBed.inject(HttpTestingController);
    httpClient = TestBed.inject(HttpClient);
    fixture.detectChanges();
  });

  afterEach(() => {
    httpTestingController.verify();
  })

  it('should create', () => {
    const clinicId = 1;
    const req = httpTestingController.expectOne(`${environment.apiUrl}${AppRoutes.CLINIC}/${clinicId}`);
    expect(req.request.method).toBe('GET');
    expect(component).toBeTruthy();
  });

  it('should fetch clinic details and display them', () => {
    const clinicResponse = {
      message: 'success',
      clinic: {
        id: 1,
        account_id: '1234',
        is_enabled: 1,
        name: 'Test Clinic',
        address: '123 Main St',
        city: 'Test City',
        state: 'TX',
        zipcode: '12345',
        user_id: 1
      }
    };

    const clinicId = 1;

    const req = httpTestingController.expectOne(`${environment.apiUrl}${AppRoutes.CLINIC}/${clinicId}`);
    expect(req.request.method).toBe('GET');
    req.flush(clinicResponse);
    expect(component.clinicDetails).toEqual(clinicResponse.clinic);
  });

  it('should show error message while fetching clinic', () => {
    spyOn(component.authService, 'logout');
    const clinicId = 1;
    const mockResponse = {
      message: "Unauthenticated"
    };
    const req = httpTestingController.expectOne(environment.apiUrl + AppRoutes.CLINIC + '/' + clinicId);
    expect(req.request.method).toBe('GET');
    req.flush(mockResponse, { status: 401, statusText: 'Unauthorized' });
    expect(component.authService.logout).toHaveBeenCalled();
  });

  it('should show error message while fetching clinic', () => {
    spyOn(Swal, 'fire');
    const clinicId = 1;
    const mockResponse = {
      message: "errorMessage"
    };
    const req = httpTestingController.expectOne(environment.apiUrl + AppRoutes.CLINIC + '/' + clinicId);
    expect(req.request.method).toBe('GET');
    req.flush(mockResponse, { status: 400, statusText: 'Bad Request' });
    expect(Swal.fire).toHaveBeenCalledWith('Error', 'errorMessage', 'error');
  });

  it('should navigate to update clinic page with correct clinic ID', () => {
    const spyNavigate = spyOn(component.getRouter(), 'navigate');
    const clinicId = 1;
    const req = httpTestingController.expectOne(environment.apiUrl + AppRoutes.CLINIC + '/' + clinicId);
    expect(req.request.method).toBe('GET');
    component.updateClinicDetails();
    expect(spyNavigate).toHaveBeenCalledWith(['/clinic', clinicId]);
  });

  it('should show a success message when the DELETE request is successful', () => {
    const clinicId = 1;
    const token = 'test-token';
    const mockResponse = {
      message: "clinic Deleted"
    };
    const spyAlert = spyOn(Swal, 'fire');
    httpTestingController.expectOne(environment.apiUrl + AppRoutes.CLINIC + '/' + clinicId);
    spyOn(localStorage, 'getItem').and.returnValue(token);
    component.deleteClinic();
    const req = httpTestingController.expectOne(environment.apiUrl + AppRoutes.CLINIC + '/' + clinicId);
    expect(req.request.method).toBe('DELETE');
    req.flush(mockResponse, { status: 200, statusText: 'Success' });
    expect(spyAlert).toHaveBeenCalledWith('Deleted');
  });

  it('should logout if unauthorized response in delete request', () => {
    const clinicId = 1;
    httpTestingController.expectOne(environment.apiUrl + AppRoutes.CLINIC + '/' + clinicId);
    const token = 'test-token';
    const mockResponse = {
      message: 'Unauthorized'
    };
    spyOn(component.authService,'logout');
    spyOn(localStorage, 'getItem').and.returnValue(token);

    component.deleteClinic();

    const req = httpTestingController.expectOne(environment.apiUrl + AppRoutes.CLINIC + '/' + clinicId);
    expect(req.request.method).toBe('DELETE');
    req.flush(mockResponse, { status: 401, statusText: 'Unauthorized' });
    expect(component.authService.logout).toHaveBeenCalled();
  });

  it('should show error response in delete request', () => {
    const clinicId = 1;
    httpTestingController.expectOne(environment.apiUrl + AppRoutes.CLINIC + '/' + clinicId);
    const token = 'test-token';
    const mockResponse = {
      message: 'errorMessage'
    };
    spyOn(Swal,'fire');
    spyOn(localStorage, 'getItem').and.returnValue(token);

    component.deleteClinic();

    const req = httpTestingController.expectOne(environment.apiUrl + AppRoutes.CLINIC + '/' + clinicId);
    expect(req.request.method).toBe('DELETE');
    req.flush(mockResponse, { status: 400, statusText: 'Bad Request' });
    expect(Swal.fire).toHaveBeenCalledWith(
      'Error',
      'errorMessage',
      'error'
    );
  });

  it('should update button text when the update status request is successful', () => {
    component.clinicDetails = {
      id: 1,
      account_id: '1234',
      is_enabled: 1,
      name: 'Test Clinic',
      address: '123 Main St',
      city: 'Test City',
      state: 'TX',
      zipcode: '12345',
      user_id: 1
    };

    const clinicId = 1;
    httpTestingController.expectOne(environment.apiUrl + AppRoutes.CLINIC + '/' + clinicId);
    const token = 'test-token';
    const mockResponse = {
      message: "Status Updated"
    };

    spyOn(localStorage, 'getItem').and.returnValue(token);
    component.enable_disable();

    const req = httpTestingController.expectOne(environment.apiUrl + AppRoutes.CLINIC + '/' + clinicId + '/status');
    req.flush(mockResponse, { status: 200, statusText: 'Success' });
    expect(component.clinicDetails.is_enabled).toBeFalse();
  });

  it('should show a error message when the update status request body is invalid', () => {
    component.clinicDetails = {
      id: 1,
      account_id: '1234',
      is_enabled: 1,
      name: 'Test Clinic',
      address: '123 Main St',
      city: 'Test City',
      state: 'TX',
      zipcode: '12345',
      user_id: 1
    };

    const clinicId = 1;
    httpTestingController.expectOne(environment.apiUrl + AppRoutes.CLINIC + '/' + clinicId);
    const token = 'test-token';
    const mockResponse = {
      message: "Validation Failed",
      errors: {
        is_enabled: [
          "The is_enabled field is required."
        ]
      }
    };
    const spyAlert = spyOn(Swal, 'fire');

    spyOn(localStorage, 'getItem').and.returnValue(token);
    component.enable_disable();

    const req = httpTestingController.expectOne(environment.apiUrl + AppRoutes.CLINIC + '/' + clinicId + '/status');
    req.flush(mockResponse, { status: 422, statusText: 'Unprocessable Content' });
    expect(component.clinicDetails.is_enabled).toEqual(1);
    expect(spyAlert).toHaveBeenCalledWith(
      'Error',
      `is_enabled: The is_enabled field is required.<br>`,
      'error');
  });

  it('should logout if unauthorized response in update status request', () => {
    component.clinicDetails = {
      id: 1,
      account_id: '1234',
      is_enabled: 1,
      name: 'Test Clinic',
      address: '123 Main St',
      city: 'Test City',
      state: 'TX',
      zipcode: '12345',
      user_id: 1,
    };

    const clinicId = 1;
    httpTestingController.expectOne(environment.apiUrl + AppRoutes.CLINIC + '/' + clinicId);
    const token = 'test-token';
    const mockResponse = {
      message: 'Unauthorized'
    };
    const spyNavigate = spyOn(component.getRouter(), 'navigate');
    const spyAlert = spyOn(Swal, 'fire');
    spyOn(localStorage, 'getItem').and.returnValue(token);
    component.enable_disable();
    const req = httpTestingController.expectOne(environment.apiUrl + AppRoutes.CLINIC + '/' + clinicId + '/status');
    req.flush(mockResponse, { status: 401, statusText: 'Unauthorized' });
    expect(spyAlert).toHaveBeenCalledWith(
      'Error',
      'Unauthorized',
      'error');
    expect(spyNavigate).toHaveBeenCalledWith(['/login']);
  });
});