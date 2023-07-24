import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { ActivatedRoute, Router, RouterLink, Params} from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';
import { ChangepasswordComponent } from './change-password.component';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { LoginComponent } from '../login/login.component';
import { RouterTestingModule } from '@angular/router/testing';
import { environment } from 'src/environments/environment';
import { FormControl,FormGroup,Validators } from '@angular/forms';
import AppRoutes from '../app.routes';
import { Token } from '@angular/compiler';
import Swal from 'sweetalert2';

describe('ChangepasswordComponent', () => {
  let component: ChangepasswordComponent;
  let fixture: ComponentFixture<ChangepasswordComponent>;
  let router: Router;
  let activatedRoute: ActivatedRoute;
  let httpTestingController: HttpTestingController;



  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ChangepasswordComponent ],
      imports: [RouterTestingModule.withRoutes([
        {
          path: 'login',
          component: LoginComponent
        }
      ]), ReactiveFormsModule, HttpClientTestingModule],

      providers: [
        { provide: ActivatedRoute, useValue: { params: new BehaviorSubject({ token: 'test_token' }) } }
      ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ChangepasswordComponent);
    component = fixture.componentInstance;
    router = component.getRouter();
    activatedRoute = TestBed.inject(ActivatedRoute);
    httpTestingController = TestBed.inject(HttpTestingController);
    
    activatedRoute.params = of({token: 'test_token'}) as Observable<Params>;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should navigate to login on successful password change', () => {
    const navigateSpy = spyOn(component.getRouter(), 'navigate');
    component.token = 'testToken';
    component.ChangePass.setValue({
    password: 'testpass',
    });
    component.changepass();
    const req = httpTestingController.expectOne(environment.apiUrl+AppRoutes.CHANGE_PASS);
    expect(req.request.method).toEqual('POST');
    req.flush({
      "message": "Password Updated, Please Login"
    }); 
    expect(navigateSpy).toHaveBeenCalledWith(['/login']);
  });

  it('should show alert on invalid link', () => {
    const mockResponse = { message: 'Link Invalid' };
    const password = 'testpass';
    const token = 'test_token';
    const spyAlert = spyOn(Swal, 'fire');
    component.ChangePass.controls['password'].setValue(password);
    component.changepass();
    const req = httpTestingController.expectOne(environment.apiUrl+AppRoutes.CHANGE_PASS);
    expect(req.request.method).toEqual('POST');
    expect(req.request.body).toEqual({ password, token });
    req.flush(mockResponse, { status: 400, statusText: 'Bad Request' });
    expect(spyAlert).toHaveBeenCalledWith(
      'Error',
      mockResponse.message,
      'error'
    );
  });

  it('should not call http.post when isFormValid returns false', () => {
    spyOn(component.http, 'post').and.returnValue(of({}));
    component.isFormValid = () => false;
    component.changepass();
    expect(component.http.post).not.toHaveBeenCalled();
  });

  it('should return false for invalid form', () => {
    const result = component.isFormValid();
    expect(result).toBe(false);
  });
})
