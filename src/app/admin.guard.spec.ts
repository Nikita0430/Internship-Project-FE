import { TestBed } from '@angular/core/testing';
import { AdminGuard } from './admin.guard';
import { ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { AuthGuard } from './auth.guard';
import { LoginuserService } from './login-user.service';

describe('AdminGuard', () => {
  let guard: AdminGuard;
  let loginUserService: LoginuserService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [AuthGuard,
        {provide: LoginuserService}
      ]
    });
    guard = TestBed.inject(AdminGuard);
    loginUserService = TestBed.inject(LoginuserService);
  });

  it('should be created', () => {
    expect(guard).toBeTruthy();
  });

  it('should allow access only to admin',() => {
    const route = {} as ActivatedRouteSnapshot;
    const state = {} as RouterStateSnapshot;

    localStorage.setItem('role', 'admin');
    let adminResult = guard.canActivate(route, state);
    expect(adminResult).toBe(true);

    localStorage.setItem('role', 'clinic');
    let clinicResult = guard.canActivate(route, state);
    expect(clinicResult).not.toBe(true);
  });
});
