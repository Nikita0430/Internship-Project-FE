import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { environment } from 'src/environments/environment';
import { RouterTestingModule } from '@angular/router/testing';
import { ReactorCycleFormComponent } from './reactor-cycle-form.component';
import { ClinicService } from '../clinic.service';
import { of } from 'rxjs';
import Swal from 'sweetalert2';
import AppRoutes from '../app.routes';
import { ViewReactorCycleComponent } from '../view-reactor-cycle/view-reactor-cycle.component';
import { ManageReactorCycleComponent } from '../manage-reactor-cycle/manage-reactor-cycle.component';

describe('ReactorCycleFormComponent', () => {
  let component: ReactorCycleFormComponent;
  let fixture: ComponentFixture<ReactorCycleFormComponent>;
  let httpTestingController: HttpTestingController;
  let service = ClinicService

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ReactorCycleFormComponent],
      imports: [RouterTestingModule.withRoutes([
        {
          path: 'manage-reactor-cycle',
          component: ViewReactorCycleComponent
        }
      ]), HttpClientTestingModule, ReactiveFormsModule], 
      providers: [
        {
          provide: ClinicService,
          useValue: {
            addClinicDetails: () => of({ message: 'success' }),
            getClinicDetails: () => of({
              clinic: {
                id: 1,
                account_id: 'C000001',
                is_enabled: true,
                name: 'Test Name',
                address: 'Test Address',
                city: 'Test City',
                state: 'Test State',
                zipcode: '123456',
                user_id: 1
              }
            })
          }
        }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ReactorCycleFormComponent);
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

  it('should initialize reactorCycleForm with required fields', () => {
    component.ngOnInit();
    expect(component.reactorCycleForm.contains('cycle_name')).toBe(true);
    expect(component.reactorCycleForm.contains('reactor_name')).toBe(true);
    expect(component.reactorCycleForm.contains('mass')).toBe(true);
    expect(component.reactorCycleForm.contains('target_start_date')).toBe(true);
    expect(component.reactorCycleForm.contains('expiration_date')).toBe(true);
  });

  it('should give success when reactor cycle is added', () => {
    const spyAlert = spyOn(Swal, 'fire');
    component.reactorCycleForm.setValue({
      cycle_name: "Cycle1",
      reactor_name: "Reactor1",
      mass: 100,
      target_start_date: "2023-05-23",
      expiration_date: "2023-05-24",
    });
    const mockResponse = { message: "Successful" };
    spyOn(component.getRouter(),'navigate');
    component.onSubmit();
    const req = httpTestingController.expectOne(environment.apiUrl + AppRoutes.REACTOR_CYCLE);
    expect(req.request.method).toEqual('POST');
    req.flush(mockResponse);
    expect(spyAlert).toHaveBeenCalledWith('Successful',
      'You have successfully added a new reactor-cycle!',
      'success');
    expect(component.getRouter().navigate).toHaveBeenCalledWith(['/manage-reactor-cycle']);
  });

  it('should alert error when failed to add reactor cycle', () => {
    component.reactorCycleForm.setValue({
      cycle_name: "Cycle1",
      reactor_name: "Reactor1",
      mass: 100,
      target_start_date: "2023-05-23",
      expiration_date: "2023-05-24",
    });
    component.createReactorCycle();
    const spyAlert = spyOn(Swal, 'fire');
    const mockResponse = {
      message: "Validation Failed",
      errors: {
        cycle_name: [
          "The cycle_name field is required."
        ]
      }
    };
    const req = httpTestingController.expectOne(environment.apiUrl + AppRoutes.REACTOR_CYCLE);
    expect(req.request.method).toEqual('POST');
    req.flush(mockResponse, { status: 422, statusText: 'Unprocessable Content' });
    expect(spyAlert).toHaveBeenCalledWith('Error',
      "cycle_name: The cycle_name field is required.<br>",
      'error');
  });

  it('should logout when unauthorized to add reactor cycle', () => {
    component.reactorCycleForm.setValue({
      cycle_name: "Cycle1",
      reactor_name: "Reactor1",
      mass: 100,
      target_start_date: "2023-05-23",
      expiration_date: "2023-05-24",
    });
    component.createReactorCycle();
    spyOn(component.authService,'logout');
    const mockResponse = {
      message: "Unauthorized",
    };
    const req = httpTestingController.expectOne(environment.apiUrl + AppRoutes.REACTOR_CYCLE);
    expect(req.request.method).toEqual('POST');
    req.flush(mockResponse, { status: 401, statusText: 'Unauthorized' });
    expect(component.authService.logout).toHaveBeenCalled();
  });

  it('should show error for add reactor cycle', () => {
    component.reactorCycleForm.setValue({
      cycle_name: "Cycle1",
      reactor_name: "Reactor1",
      mass: 100,
      target_start_date: "2023-05-23",
      expiration_date: "2023-05-24",
    });
    spyOn(Swal,'fire');
    component.createReactorCycle();
    const mockResponse = {
      message: "errorMessage",
    };
    const req = httpTestingController.expectOne(environment.apiUrl + AppRoutes.REACTOR_CYCLE);
    expect(req.request.method).toEqual('POST');
    req.flush(mockResponse, { status: 400, statusText: 'Bad request' });
    expect(Swal.fire).toHaveBeenCalledWith(
      'Error',
      'errorMessage',
      'error'
    );
  });

  it('should have a form with the expected controls', () => {
    component.reactorCycleDetails = {
      id: 1,
      cycle_name: "Cycle1",
      reactor_name: "Reactor1",
      mass: 100,
      target_start_date: "2023-05-23",
      expiration_date: "2023-05-24",
      is_enabled: true,
    }

    expect(component.reactorCycleForm.contains('cycle_name')).toBe(true);
    expect(component.reactorCycleForm.contains('reactor_name')).toBe(true);
    expect(component.reactorCycleForm.contains('mass')).toBe(true);
    expect(component.reactorCycleForm.contains('target_start_date')).toBe(true);
    expect(component.reactorCycleForm.contains('expiration_date')).toBe(true);
  });

  it('should call updateReactorCycle if reactorCycleId exists', () => {
    component.getActivatedRoute().snapshot.params['id'] = 1;
    component.reactorCycleId = 1;
    const spyUpdate = spyOn(component, 'updateReactorCycle');
    spyOn(component, 'isFormValid').and.returnValue(true);
    component.onSubmit();
    expect(spyUpdate).toHaveBeenCalled();
  });

  it('should get reactor cycle details if reactorCycleId is present', () => {
    const spyDetails = spyOn(component.getReactorCycleService(), 'getReactorCycleDetails');
    component.getActivatedRoute().snapshot.params['id'] = 1;
    component.ngOnInit();
    component.reactorCycleDetails = {
      id: 1,
      cycle_name: "Cycle1",
      reactor_name: "Reactor1",
      mass: 100,
      target_start_date: "2023-05-23",
      expiration_date: "2023-05-24",
      is_enabled: true,
    }
    expect(spyDetails).toHaveBeenCalled();
  });

  it('should submit the form when the submit button is clicked', () => {
    const spyAlert = spyOn(Swal, 'fire');
    const spyNavigate = spyOn(component.getRouter(),'navigate');
    const reactorCycleId = 1;
    component.reactorCycleId = reactorCycleId;
    component.reactorCycleForm.setValue({
      cycle_name: "Cycle1",
      reactor_name: "Reactor1",
      mass: 100,
      target_start_date: "2023-05-23",
      expiration_date: "2023-05-24",
    });
    component.onSubmit();
    const req = httpTestingController.expectOne(environment.apiUrl + AppRoutes.REACTOR_CYCLE + '/' + reactorCycleId);
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual({
      cycle_name: "Cycle1",
      reactor_name: "Reactor1",
      mass: 100,
      target_start_date: "2023-05-23",
      expiration_date: "2023-05-24",
    })
    const mockResponse = { message: "Successful" };
    req.flush(mockResponse);
    expect(spyAlert).toHaveBeenCalledWith('Successful',
      'You have successfully updated the reactor cycle!',
      'success'
    );
    expect(spyNavigate).toHaveBeenCalledOnceWith(['/view-reactor-cycle',reactorCycleId]);
  });

  it('should alert error when failed to update recator cycle', () => {
    const reactorCycleId = 1;
    component.reactorCycleId = reactorCycleId;
    component.reactorCycleForm.setValue({
      cycle_name: "Cycle1",
      reactor_name: "Reactor1",
      mass: 100,
      target_start_date: "2023-05-23",
      expiration_date: "2023-04-24",
    });
    component.updateReactorCycle();
    const spyAlert = spyOn(Swal, 'fire');
    const mockResponse = {
      message: "Validation Failed",
      errors: {
        expiration_date: [
          "The expiration date should be after target start date"
        ]
      }
    };
    const req = httpTestingController.expectOne(environment.apiUrl + AppRoutes.REACTOR_CYCLE + '/' + reactorCycleId);
    expect(req.request.method).toEqual('PUT');
    req.flush(mockResponse, { status: 422, statusText: 'Unprocessable Content' });
    expect(spyAlert).toHaveBeenCalledWith(
      'Error',
      `expiration_date: The expiration date should be after target start date<br>`,
      'error');
  });

  it('should logout if unauthorized response for update reactor cycle', () => {
    const reactorCycleId = 1;
    component.reactorCycleId = reactorCycleId;
    const token = 'test-token';
    const mockResponse = {
      message: 'Unauthorized'
    };
    spyOn(component.authService,'logout');
    spyOn(localStorage, 'getItem').and.returnValue(token);

    component.updateReactorCycle();

    const req = httpTestingController.expectOne(environment.apiUrl + AppRoutes.REACTOR_CYCLE + '/' + reactorCycleId);
    expect(req.request.method).toBe('PUT');
    req.flush(mockResponse, { status: 401, statusText: 'Unauthorized' });
    expect(component.authService.logout).toHaveBeenCalled();
  });

  it('should show error for update reactor cycle', () => {
    const reactorCycleId = 1;
    component.reactorCycleId = reactorCycleId;
    const token = 'test-token';
    const mockResponse = {
      message: 'errorMessage'
    };
    spyOn(Swal,'fire');
    spyOn(localStorage, 'getItem').and.returnValue(token);

    component.updateReactorCycle();

    const req = httpTestingController.expectOne(environment.apiUrl + AppRoutes.REACTOR_CYCLE + '/' + reactorCycleId);
    expect(req.request.method).toBe('PUT');
    req.flush(mockResponse, { status: 400, statusText: 'Bad Request' });
    expect(Swal.fire).toHaveBeenCalledWith(
      'Error',
      'errorMessage',
      'error'
    );
  });

  it('should not call http.post when isFormValid returns false', () => {
    spyOn(component.http, 'post').and.returnValue(of({}));
    component.isFormValid = () => false;
    component.onSubmit();
    expect(component.http.post).not.toHaveBeenCalled();
  });

  it('should return false for invalid form', () => {
    const result = component.isFormValid();
    expect(result).toBe(false);
  });
});