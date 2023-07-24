import { TestBed } from '@angular/core/testing';
import { ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router'; 
import { LoginuserService } from './login-user.service';
import { AuthGuard } from './auth.guard';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';

describe('AuthGuard', () => {
  let guard: AuthGuard;
  let loginUserService: LoginuserService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [AuthGuard,
        {provide: LoginuserService}
      ]
    });
    guard = TestBed.inject(AuthGuard);
    loginUserService = TestBed.inject(LoginuserService);
  });

  it('should be created', () => {
    expect(guard).toBeTruthy();
  });

  it('should allow access when user is logged in',() => {
    const route = {} as ActivatedRouteSnapshot;
    const state = {} as RouterStateSnapshot;

    localStorage.setItem('email', 'test@example.com');
    let withEmailresult = guard.canActivate(route, state);
    expect(withEmailresult).toBe(true);

    localStorage.removeItem('email');
    let withoutEmailresult = guard.canActivate(route, state);
    expect(withoutEmailresult).not.toBe(true);
  });
});
