import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { LoginuserService } from './login-user.service';
import { HttpHeaders } from '@angular/common/http';
import { throwError, catchError } from 'rxjs';
import { environment } from 'src/environments/environment';
import AppRoutes from './app.routes';
import { HttpErrorResponse } from '@angular/common/http';
import { Token } from '@angular/compiler';

describe('LoginuserService', () => {
  let service: LoginuserService;
  let httpTestingController: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [LoginuserService],
    });
    service = TestBed.inject(LoginuserService);
    httpTestingController = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTestingController.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should login successfully and store to local storage', () => {
    const email = 'test@example.com';
    const password = 'testpass';
    const rememberme = false;
    const response = {
      user: { email: 'test@example.com', role: 'admin' },
      token: 'token',
    };

    service.login(email, password, rememberme).subscribe();

    const req = httpTestingController.expectOne(environment.apiUrl + AppRoutes.LOGIN);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ email, password, remember_me: rememberme });
    req.flush(response);
    expect(localStorage.getItem('email')).toEqual(email);
    expect(localStorage.getItem('token')).toEqual(response.token);
    expect(localStorage.getItem('role')).toEqual(response.user.role);
  });

  it('should login successfully as clinic and store to local storage', () => {
    const email = 'clinic@example.com';
    const password = 'clinicpass';
    const rememberme = false;
    const response = {
      user: { email: 'clinic@example.com', role: 'clinic', clinic: { name: 'clinicName' } },
      token: 'token',
    };

    service.login(email, password, rememberme).subscribe();

    const req = httpTestingController.expectOne(environment.apiUrl + AppRoutes.LOGIN);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ email, password, remember_me: rememberme });
    req.flush(response);
    expect(localStorage.getItem('email')).toEqual(email);
    expect(localStorage.getItem('token')).toEqual(response.token);
    expect(localStorage.getItem('role')).toEqual(response.user.role);
    expect(localStorage.getItem('username')).toEqual(response.user.clinic.name);
  });

  it('should throw an error on login fail', () => {
    const email = 'test@test.com';
    const password = 'testpassword';
    const rememberme = false;
    const errorResponse = { message: 'Unauthorized' };

    service.login(email, password, rememberme).pipe(
      catchError((err) => {
        const errorObj = new Error(err);
        return throwError(() => errorObj);
      })
    ).subscribe({
      next: () => { },
      error: (err) => expect(err).toEqual(err)
    });

    const req = httpTestingController.expectOne(environment.apiUrl + AppRoutes.LOGIN);
    expect(req.request.method).toEqual('POST');
    req.flush(errorResponse, { status: 401, statusText: 'Unauthorized' });
  });

  it('should logout of the account successfully', () => {
    const tokenVal = "token";
    const expectedHeaders = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${tokenVal}`
    });
    const mockResponse = { message: "Logged Out" };
    const spyNavigate = spyOn(service.getRouter(), 'navigate');

    service.logout();
    const req = httpTestingController.expectOne(environment.apiUrl + AppRoutes.LOGOUT);
    expect(req.request.method).toEqual('POST');

    req.flush(mockResponse, { status: 200, statusText: 'Success' });

    expect(localStorage.getItem('email')).toBeNull();
    expect(spyNavigate).toHaveBeenCalledWith(['/login']);
  });

  it('should logout of the account successfully for error response', () => {
    const tokenVal = "token"
    const expectedHeaders = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${tokenVal}`
    });
    const mockResponse = { message: "Unauthenticated" };
    const spyNavigate = spyOn(service.getRouter(), 'navigate');

    service.logout();
    const req = httpTestingController.expectOne(environment.apiUrl + AppRoutes.LOGOUT);
    expect(req.request.method).toEqual('POST');

    req.flush(mockResponse, { status: 401, statusText: 'Unauthorized' });

    expect(localStorage.getItem('email')).toBeNull();
    expect(spyNavigate).toHaveBeenCalledWith(['/login']);
  });

  it('should return username', () => {
    localStorage.setItem('username', 'userName');
    const username = service.getLoggedInUsername();
    expect(username).toEqual('userName');
  });
});
