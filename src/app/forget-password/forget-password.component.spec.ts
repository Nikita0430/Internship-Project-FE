import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { ForgetpasswordComponent } from './forget-password.component'
import { LoginComponent } from '../login/login.component';
import { RouterTestingModule } from '@angular/router/testing';
import { environment } from 'src/environments/environment';
import AppRoutes from '../app.routes';
import Swal from 'sweetalert2';
import { of } from 'rxjs';

describe('ForgetpasswordComponent', () => {
  let component: ForgetpasswordComponent;
  let fixture: ComponentFixture<ForgetpasswordComponent>;
  let httpTestingController: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RouterTestingModule.withRoutes([
        {
          path: 'login',
          component: LoginComponent
        }
      ]), ReactiveFormsModule, HttpClientTestingModule],
      declarations: [ForgetpasswordComponent]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ForgetpasswordComponent);
    component = fixture.componentInstance;
    httpTestingController = TestBed.inject(HttpTestingController);
    fixture.detectChanges();
  });

  afterEach(() => {
    httpTestingController.verify();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should make API call when form is submitted with valid email', () => {
    const mockResponse = { message: 'Check Your Email.' };
    const email = 'test@example.com';
    const spyAlert =  spyOn(Swal, 'fire');
    component.FrgtPass.controls['email'].setValue(email);
    component.frgtpass();
    const req = httpTestingController.expectOne(environment.apiUrl+AppRoutes.FORGOT_PASS);
    expect(req.request.method).toEqual('POST');
    expect(req.request.body).toEqual({ email });
    req.flush(mockResponse);
    expect(spyAlert).toHaveBeenCalledWith('Success', 'Check Your Email.');
  });

  it('should show error message when API call fails', () => {
    const mockErrorResponse = { message: 'Invalid Email' };
    const email = 'invalid-email';
    const spyAlert = spyOn(Swal, 'fire');
    component.FrgtPass.controls['email'].setValue(email);
    spyOn(component, 'isFormValid').and.returnValue(true);
    component.frgtpass();
    const req = httpTestingController.expectOne(environment.apiUrl+AppRoutes.FORGOT_PASS);
    expect(req.request.method).toEqual('POST');
    expect(req.request.body).toEqual({ email });
    req.flush(mockErrorResponse, { status: 400, statusText: 'Bad Request' });
    expect(spyAlert).toHaveBeenCalledWith('Error', 'Invalid Email');
  });

  it('should not call http.post when isFormValid returns false', () => {
    spyOn(component.http, 'post').and.returnValue(of({}));
    component.isFormValid = () => false;
    component.frgtpass();
    expect(component.http.post).not.toHaveBeenCalled();
  });

  it('should return false for invalid form', () => {
    const result = component.isFormValid();
    expect(result).toBe(false);
  });
});