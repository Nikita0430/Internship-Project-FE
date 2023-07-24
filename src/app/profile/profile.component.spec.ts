import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { ProfileComponent } from './profile.component';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import AppRoutes from '../app.routes';
import Swal from 'sweetalert2';
import { LoginuserService } from '../login-user.service';

describe('ProfileComponent', () => {
  let component: ProfileComponent;
  let fixture: ComponentFixture<ProfileComponent>;
  let httpTestingController: HttpTestingController;
  let httpClient: HttpClient;
  let authService: LoginuserService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ProfileComponent],
      imports: [ReactiveFormsModule, HttpClientTestingModule],
    })
      .compileComponents();

    fixture = TestBed.createComponent(ProfileComponent);
    component = fixture.componentInstance;
    httpTestingController = TestBed.inject(HttpTestingController);
    httpClient = TestBed.inject(HttpClient);
    fixture.detectChanges();
  });

  afterEach(() => {
    httpTestingController.verify();
  });

  it('should create', () => {
    const req = httpTestingController.expectOne(environment.apiUrl + AppRoutes.PROFILE);
    expect(req.request.method).toBe('GET');
    expect(component).toBeTruthy();
  });

  it('should initialize userForm with default values', () => {
    const req = httpTestingController.expectOne(environment.apiUrl + AppRoutes.PROFILE);
    expect(req.request.method).toBe('GET');
    expect(component).toBeTruthy();
    expect(component.userForm).toBeDefined();
    expect(component.userForm instanceof FormGroup).toBeTruthy();
    expect(component.userForm.contains('accountId')).toBe(true);
    expect(component.userForm.contains('name')).toBe(true);
    expect(component.userForm.contains('address')).toBe(true);
    expect(component.userForm.contains('city')).toBe(true);
    expect(component.userForm.contains('state')).toBe(true);
    expect(component.userForm.contains('zipcode')).toBe(true);
    expect(component.userForm.contains('newPassword')).toBe(true);
    expect(component.userForm.contains('confirmPassword')).toBe(true);
  });

  it('should fetch profile details and populate userForm', () => {
    const mockResponse = {
      profile: {
        account_id: 1,
        email: 'test@example.com',
        name: 'Test User',
        address: 'Address',
        city: 'City',
        state: 'State',
        zipcode: '12345',
      }
    };
    spyOn(localStorage, 'getItem').and.returnValue('mockToken');
    const req = httpTestingController.expectOne(environment.apiUrl + AppRoutes.PROFILE);
    expect(req.request.method).toBe('GET');
    req.flush(mockResponse);
    expect(component.profileDetails).toEqual(mockResponse.profile);
    expect(component.userForm.controls['accountId'].value).toEqual(mockResponse.profile.account_id);
    expect(component.userForm.controls['email'].value).toEqual(mockResponse.profile.email);
    expect(component.userForm.controls['state'].value).toEqual(mockResponse.profile.state);
    expect(component.userForm.controls['city'].value).toEqual(mockResponse.profile.city);
    expect(component.userForm.controls['address'].value).toEqual(mockResponse.profile.address);
    expect(component.userForm.controls['zipcode'].value).toEqual(mockResponse.profile.zipcode);
    expect(component.userForm.controls['name'].value).toEqual(mockResponse.profile.name);
  });

  it('should handle error when fetching profile details', () => {
    const mockErrorResponse = { message: 'Unauthorized' };
    const spyObj = spyOn(component.authService, 'logout');
    const req = httpTestingController.expectOne(environment.apiUrl + AppRoutes.PROFILE);
    expect(req.request.method).toBe('GET');
    req.flush(mockErrorResponse,{status: 401, statusText:'Unauthorized'})

    expect(spyObj).toHaveBeenCalled();
  });

  it('should reinitialize userForm on discardChanges', () => {
    const req = httpTestingController.expectOne(environment.apiUrl + AppRoutes.PROFILE);
    expect(req.request.method).toBe('GET');
    expect(component).toBeTruthy();
    const spyObj =spyOn(component, 'ngOnInit');
    component.discardChanges();
    expect(spyObj).toHaveBeenCalled();
  });

  it('should set isAttempted to true and set passwordMismatch error on submitForm when passwords do not match', () => {
    const req = httpTestingController.expectOne(environment.apiUrl + AppRoutes.PROFILE);
    expect(req.request.method).toBe('GET');
    component.userForm.setValue({
      accountId: '1',
      email: 'test@example.com',
      name: 'Test User',
      address: 'Address',
      city: 'City',
      state: 'State',
      zipcode: '12345',
      newPassword: 'password1',
      confirmPassword: 'password2'
    });

    component.submitForm();
    expect(component.isAttempted).toBeTruthy();
    expect(component.userForm.errors).toEqual({ passwordMismatch: true });
  });

  it('should return false on isFormValid when userForm is invalid', () => {
    const req = httpTestingController.expectOne(environment.apiUrl + AppRoutes.PROFILE);
    expect(req.request.method).toBe('GET');
    component.userForm.setValue({
      accountId: '',
      email: 'test@example.com',
      state: '',
      city: '',
      address: '',
      zipcode: '',
      name: '',
      newPassword: '',
      confirmPassword: ''
    });
    
    component.submitForm();
    expect(component.isFormValid()).toBeFalsy();
  });

  it('should set form errors when passwords do not match', () => {
    const req = httpTestingController.expectOne(environment.apiUrl + AppRoutes.PROFILE);
    expect(req.request.method).toBe('GET');
    component.userForm.patchValue({
      newPassword: 'password1',
      confirmPassword: 'password2'
    });

    component.submitForm();
    expect(component.userForm.errors).toEqual({ passwordMismatch: true });
  });

  it('should send a PUT request to update profile details and show success message on successful response', () => {
    const req1 = httpTestingController.expectOne(environment.apiUrl + AppRoutes.PROFILE);
    expect(req1.request.method).toBe('GET');
    const mockResponse = {
      success: true
    };
    spyOn(localStorage, 'getItem').and.returnValue('mockToken');
    spyOn(Swal, 'fire');

    component.userForm.setValue({
      accountId: '1',
      email: 'test@example.com',
      state: 'State',
      city: 'City',
      address: 'Address',
      zipcode: '12345',
      name: 'Test User',
      newPassword: 'password',
      confirmPassword: 'password'
    });

    component.submitForm();
    const req2 = httpTestingController.expectOne(environment.apiUrl + AppRoutes.PROFILE);
    expect(req2.request.method).toBe('PUT');
    expect(req2.request.body).toEqual({
      city: 'City',
      address: 'Address',
      state: 'State',
      zipcode: '12345',
      name: 'Test User',
      password: 'password'
    });

    req2.flush(mockResponse);
    expect(Swal.fire).toHaveBeenCalledWith(
      'Successful',
      'You have successfully updated your details!',
      'success'
    );
  });

  it('should logout on 401 response for update user details', () => {
    const req1 = httpTestingController.expectOne(environment.apiUrl + AppRoutes.PROFILE);
    expect(req1.request.method).toBe('GET');
    const mockResponse = {
      'message': 'Unauthenticated.'
    };
    const spyObj = spyOn(component.authService, 'logout');
    component.userForm.setValue({
      accountId: '1',
      email: 'test@example.com',
      state: 'State',
      city: 'City',
      address: 'Address',
      zipcode: '12345',
      name: 'Test User',
      newPassword: 'password',
      confirmPassword: 'password'
    });

    component.submitForm();
    const req2 = httpTestingController.expectOne(environment.apiUrl + AppRoutes.PROFILE);
    expect(req2.request.method).toBe('PUT');
    req2.flush(mockResponse, {status: 401, statusText: 'Unauthorized'});
    expect(spyObj).toHaveBeenCalled();
  });

  it('should show error for 422 response for update user details', () => {
    const req1 = httpTestingController.expectOne(environment.apiUrl + AppRoutes.PROFILE);
    expect(req1.request.method).toBe('GET');
    const mockResponse = {
      message: "Validation Failed",
      errors: {
        name: [
          "The name field is required."
        ]
      }
    };
    spyOn(Swal, 'fire');
    component.userForm.setValue({
      accountId: '1',
      email: 'test@example.com',
      state: 'State',
      city: 'City',
      address: 'Address',
      zipcode: '12345',
      name: 'Test User',
      newPassword: 'password',
      confirmPassword: 'password'
    });

    component.submitForm();
    const req2 = httpTestingController.expectOne(environment.apiUrl + AppRoutes.PROFILE);
    expect(req2.request.method).toBe('PUT');
    req2.flush(mockResponse, {status: 422, statusText: 'Unprocessable Entity'});
    expect(Swal.fire).toHaveBeenCalledWith(
      'Error',
      'name: The name field is required.<br>',
      'error'
    );
  });

  it('should show error for 400 response for update user details', () => {
    const req1 = httpTestingController.expectOne(environment.apiUrl + AppRoutes.PROFILE);
    expect(req1.request.method).toBe('GET');
    const mockResponse = {
      message: "Something went wrong",
    };
    spyOn(Swal, 'fire');
    component.userForm.setValue({
      accountId: '1',
      email: 'test@example.com',
      state: 'State',
      city: 'City',
      address: 'Address',
      zipcode: '12345',
      name: 'Test User',
      newPassword: 'password',
      confirmPassword: 'password'
    });

    component.submitForm();
    const req2 = httpTestingController.expectOne(environment.apiUrl + AppRoutes.PROFILE);
    expect(req2.request.method).toBe('PUT');
    req2.flush(mockResponse, {status: 400, statusText: 'Bad Request'});
    expect(Swal.fire).toHaveBeenCalledWith(
      'Error',
      'Something went wrong',
      'error'
    );
  });
  
});
