import { TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { LoginuserService } from '../login-user.service';
import { LoginComponent } from './login.component';
import { of, throwError } from 'rxjs';
import { HttpClientModule } from '@angular/common/http';
import Swal from 'sweetalert2';


describe('LoginComponent', () => {
  let component: LoginComponent;
  let lService: LoginuserService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HttpClientModule, ReactiveFormsModule, RouterTestingModule],
      declarations: [LoginComponent],
      providers: [LoginuserService],
    }).compileComponents();
  });

  beforeEach(() => {
    lService = TestBed.inject(LoginuserService);
    component = TestBed.createComponent(LoginComponent).componentInstance;
  });

  it('should set isAttempted to true', () => {
    component.LoginForm.setValue({
      email: 'test@example.com',
      password: 'password',
      rem_me: true,
    });
    component.loginUser();
    expect(component.isAttempted).toBeTrue();
  });

  it('should navigate to the dashboard on successful login', () => {
    spyOn(lService, 'login').and.returnValue(of({}));
    spyOn(component.getRoute(), 'navigate');
    component.LoginForm.setValue({
      email: 'test@example.com',
      password: 'password',
      rem_me: true,
    });
    component.loginUser();
    expect(component.getRoute().navigate).toHaveBeenCalledWith(['/calendar']);
  });

  it('should display an error message on failed login', () => {
    spyOn(lService, 'login').and.returnValue(throwError(()=>'Unauthorized'));
    const spyAlert = spyOn(Swal, 'fire');
    component.LoginForm.setValue({
      email: 'test@example.com',
      password: 'pas',
      rem_me: true,
    });
    component.loginUser();
    expect(spyAlert).toHaveBeenCalledWith('Error', 'Login Failed');
  });

  it('should not call login when isFormValid returns false', () => {
    spyOn(component.aservice, 'login').and.returnValue(of({}));
    component.isFormValid = () => false;
    component.loginUser();
    expect(component.aservice.login).not.toHaveBeenCalled();
  });

  it('should return false for invalid form', () => {
    const result = component.isFormValid();
    expect(result).toBe(false);
  });
});
