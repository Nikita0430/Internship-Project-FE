import { TestBed } from '@angular/core/testing';

import { GuestGuard } from './guest.guard';
import { ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { LoginuserService } from './login-user.service';

describe('GuestGuard', () => {
  let guard: GuestGuard;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [GuestGuard,
        {provide: LoginuserService}
      ]
    });
    guard = TestBed.inject(GuestGuard);
  });

  it('should be created', () => {
    expect(guard).toBeTruthy();
  });

  it('should allow access when user is not logged in',() => {
    const route = {} as ActivatedRouteSnapshot;
    const state = {} as RouterStateSnapshot;

    localStorage.setItem('email', 'test@example.com');
    let withEmailresult = guard.canActivate(route, state);
    expect(withEmailresult).not.toBe(true);

    localStorage.removeItem('email');
    let withoutEmailresult = guard.canActivate(route, state);
    expect(withoutEmailresult).toBe(true);
  });
});
