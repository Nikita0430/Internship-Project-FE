import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { environment } from 'src/environments/environment';
import { RouterTestingModule  } from '@angular/router/testing';
import Swal from 'sweetalert2';
import AppRoutes from '../app.routes';
import { HttpClient } from '@angular/common/http';
import { LoginComponent } from '../login/login.component';
import { ViewReactorCycleComponent } from './view-reactor-cycle.component';
import { ManageReactorCycleComponent } from '../manage-reactor-cycle/manage-reactor-cycle.component';


describe('ViewReactorCycleComponent', () => {
  let component: ViewReactorCycleComponent;
  let fixture: ComponentFixture<ViewReactorCycleComponent>;
  let httpTestingController: HttpTestingController;
  let httpClient: HttpClient;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ViewReactorCycleComponent], imports: [RouterTestingModule.withRoutes([
        {
          path: 'login',
          component: LoginComponent
        },
        {
          path: 'manage-reactor-cycle',
          component: ManageReactorCycleComponent
        }
      ]), HttpClientTestingModule, ReactiveFormsModule]
    }).compileComponents();

    fixture = TestBed.createComponent(ViewReactorCycleComponent);
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
    const reactorCycleId = 1;
    const req = httpTestingController.expectOne(`${environment.apiUrl}${AppRoutes.REACTOR_CYCLE}/${reactorCycleId}`);
    expect(req.request.method).toBe('GET');
    expect(component).toBeTruthy();
  });

  it('should fetch reactor cycle details and display them', () => {
    const reactorCycleResponse = {
      message: 'success',
      reactor_cycle: {
        id: 1,
        cycle_name: "Cycle1",
        reactor_name: "Reactor1",
        mass: 100,
        target_start_date: "2023-05-23",
        expiration_date: "2023-0-24",
        is_enabled: true,
      }
    };

    const reactorCycleId = 1;

    const req = httpTestingController.expectOne(`${environment.apiUrl}${AppRoutes.REACTOR_CYCLE}/${reactorCycleId}`);
    expect(req.request.method).toBe('GET');

    req.flush(reactorCycleResponse);

    expect(component.reactorCycleDetails).toEqual(reactorCycleResponse.reactor_cycle);
  });

  it('should show error message when clinic not found', () => {
    const spyAlert = spyOn(Swal, 'fire');
    const reactorCycleId = 1;
    const mockResponse = {
      message: "Reactor Cycle Not Found"
    };
    const req = httpTestingController.expectOne(environment.apiUrl + AppRoutes.REACTOR_CYCLE + '/' + reactorCycleId);
    expect(req.request.method).toBe('GET');
    req.flush(mockResponse, { status: 404, statusText: 'Error: Not Found' });
    expect(spyAlert).toHaveBeenCalledWith('Error','Reactor Cycle Not Found','error');
  });

  it('should logout when unauthenticated message while fetching reactor cycle details', () => {
    const spyAlert = spyOn(component.authService, 'logout');
    const reactorCycleId = 1;
    const mockResponse = {
      message: "Unauthenticated"
    };
    const req = httpTestingController.expectOne(environment.apiUrl + AppRoutes.REACTOR_CYCLE + '/' + reactorCycleId);
    expect(req.request.method).toBe('GET');
    req.flush(mockResponse, { status: 401, statusText: 'Unauthorized' });
    expect(component.authService.logout).toHaveBeenCalled();
  });

  it('should navigate to update reactor cycle page with correct reactor cycle ID', () => {
    const spyNavigate = spyOn(component.getRouter(),'navigate');
    const reactorCycleId = 1;
    const req = httpTestingController.expectOne(environment.apiUrl + AppRoutes.REACTOR_CYCLE + '/' + reactorCycleId);
    expect(req.request.method).toBe('GET');
    component.updateReactorCycleDetails();
    expect(spyNavigate).toHaveBeenCalledWith(['/reactor-cycle', reactorCycleId]);
  });

  it('should show a success message when the DELETE request is successful', () => {
    const reactorCycleId = 1;
    const token = 'test-token';
    const mockResponse = {
      message: "Reactor Cycle Deleted"
    };
    const spyAlert = spyOn(Swal, 'fire');
    httpTestingController.expectOne(environment.apiUrl + AppRoutes.REACTOR_CYCLE + '/' + reactorCycleId);
    spyOn(localStorage, 'getItem').and.returnValue(token);
    component.deleteReactorCycle();
    const req = httpTestingController.expectOne(environment.apiUrl + AppRoutes.REACTOR_CYCLE + '/' + reactorCycleId);
    expect(req.request.method).toBe('DELETE');
    req.flush(mockResponse, { status: 200, statusText: 'Success' });
    expect(spyAlert).toHaveBeenCalledWith('Deleted',
    'The reactor cycle is deleted.',
    'success');
  });

  it('should logout if unauthorized response in delete request', () => {
    const reactorCycleId = 1;
    httpTestingController.expectOne(environment.apiUrl + AppRoutes.REACTOR_CYCLE + '/' + reactorCycleId);
    const token = 'test-token';
    const mockResponse = {
      message: 'Unauthorized'
    };
    spyOn(component.authService, 'logout');
    spyOn(localStorage, 'getItem').and.returnValue(token);

    component.deleteReactorCycle();

    const req = httpTestingController.expectOne(environment.apiUrl + AppRoutes.REACTOR_CYCLE + '/' + reactorCycleId);
    expect(req.request.method).toBe('DELETE');
    req.flush(mockResponse, { status: 401, statusText: 'Unauthorized' });
    expect(component.authService.logout).toHaveBeenCalled();
  });

  it('should show error response in delete request', () => {
    const reactorCycleId = 1;
    httpTestingController.expectOne(environment.apiUrl + AppRoutes.REACTOR_CYCLE + '/' + reactorCycleId);
    const token = 'test-token';
    const mockResponse = {
      message: 'errorMessage'
    };
    spyOn(Swal,'fire');
    spyOn(localStorage, 'getItem').and.returnValue(token);

    component.deleteReactorCycle();

    const req = httpTestingController.expectOne(environment.apiUrl + AppRoutes.REACTOR_CYCLE + '/' + reactorCycleId);
    expect(req.request.method).toBe('DELETE');
    req.flush(mockResponse, { status: 400, statusText: 'Bad Request' });
    expect(Swal.fire).toHaveBeenCalledWith(
      'Error',
      'errorMessage',
      'error'
    );
  });

  it('should update button text when the update status request is successful', () => {
    component.reactorCycleDetails = {
      id: 1,
      cycle_name: "Cycle1",
      reactor_name: "Reactor1",
      mass: 100,
      target_start_date: "2023-05-23",
      expiration_date: "2023-0-24",
      is_enabled: true,
    };

    const reactorCycleId = 1;
    httpTestingController.expectOne(environment.apiUrl + AppRoutes.REACTOR_CYCLE + '/' + reactorCycleId);
    const token = 'test-token';
    const mockResponse = {
      message: "Status Updated"
    };

    spyOn(localStorage, 'getItem').and.returnValue(token);
    component.enable_disable();

    const req = httpTestingController.expectOne(environment.apiUrl + AppRoutes.REACTOR_CYCLE + '/' + reactorCycleId + '/status');
    req.flush(mockResponse, { status: 200, statusText: 'Success' });
    expect(component.reactorCycleDetails.is_enabled).toBeFalse();
  });

  it('should show a error message when the update status request body is invalid', () => {
    component.reactorCycleDetails = {
      id: 1,
      cycle_name: "Cycle1",
      reactor_name: "Reactor1",
      mass: 100,
      target_start_date: "2023-05-23",
      expiration_date: "2023-0-24",
      is_enabled: true,
    };

    const reactorCycleId = 1;
    httpTestingController.expectOne(environment.apiUrl + AppRoutes.REACTOR_CYCLE + '/' + reactorCycleId);
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

    const req = httpTestingController.expectOne(environment.apiUrl + AppRoutes.REACTOR_CYCLE + '/' + reactorCycleId + '/status');
    req.flush(mockResponse, { status: 422, statusText: 'Unprocessable Content' });
    expect(component.reactorCycleDetails.is_enabled).toBeTrue();
    expect(spyAlert).toHaveBeenCalledWith(
      'Error',
      `is_enabled: The is_enabled field is required.<br>`,
      'error');
  });

  it('should logout if unauthorized response in update status request', () => {
    component.reactorCycleDetails = {
      id: 1,
      cycle_name: "Cycle1",
      reactor_name: "Reactor1",
      mass: 100,
      target_start_date: "2023-05-23",
      expiration_date: "2023-0-24",
      is_enabled: true,
    };

    const reactorCycleId = 1;
    httpTestingController.expectOne(environment.apiUrl + AppRoutes.REACTOR_CYCLE + '/' + reactorCycleId);
    const token = 'test-token';
    const mockResponse = {
      message: 'Unauthorized'
    };
    spyOn(component.authService, 'logout');
    spyOn(localStorage, 'getItem').and.returnValue(token);

    component.enable_disable();

    const req = httpTestingController.expectOne(environment.apiUrl + AppRoutes.REACTOR_CYCLE + '/' + reactorCycleId + '/status');
    req.flush(mockResponse, { status: 401, statusText: 'Unauthorized' });
    expect(component.authService.logout).toHaveBeenCalled();
  });

  it('should show error response in update status request', () => {
    component.reactorCycleDetails = {
      id: 1,
      cycle_name: "Cycle1",
      reactor_name: "Reactor1",
      mass: 100,
      target_start_date: "2023-05-23",
      expiration_date: "2023-0-24",
      is_enabled: true,
    };

    const reactorCycleId = 1;
    httpTestingController.expectOne(environment.apiUrl + AppRoutes.REACTOR_CYCLE + '/' + reactorCycleId);
    const token = 'test-token';
    const mockResponse = {
      message: 'errorMessage'
    };
    spyOn(Swal,'fire');
    spyOn(localStorage, 'getItem').and.returnValue(token);

    component.enable_disable();

    const req = httpTestingController.expectOne(environment.apiUrl + AppRoutes.REACTOR_CYCLE + '/' + reactorCycleId + '/status');
    req.flush(mockResponse, { status: 400, statusText: 'Bad Request' });
    expect(Swal.fire).toHaveBeenCalledWith(
      'Error',
      'errorMessage',
      'error'
    );
  });
});
