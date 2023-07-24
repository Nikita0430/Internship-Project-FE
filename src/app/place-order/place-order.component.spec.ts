import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { FormBuilder, FormControl, ReactiveFormsModule } from '@angular/forms';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { ActivatedRoute, convertToParamMap } from '@angular/router';
import { PlaceOrderComponent } from './place-order.component';
import { HttpHeaders } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { LoginComponent } from '../login/login.component';
import { of } from 'rxjs';
import AppRoutes from '../app.routes';
import Swal from 'sweetalert2';
import { ManageOrderComponent } from '../manage-order/manage-order.component';

describe('PlaceOrderComponent', () => {
  let component: PlaceOrderComponent;
  let fixture: ComponentFixture<PlaceOrderComponent>;
  let httpTestingController: HttpTestingController;
  const today = (new Date()).toISOString().substring(0, 10);
  const tomorrowDate = new Date();
  tomorrowDate.setDate(tomorrowDate.getDate() + 1);
  const tomorrow = tomorrowDate.toISOString().substring(0, 10);
  const injectionDate = new Date(Date.parse('2023-05-05'));
  injectionDate.setDate(injectionDate.getDate() + 1);

  beforeEach(async () => {
    const mockActivatedRoute = {
      snapshot: {
        paramMap: convertToParamMap({ 'eventDate': (new Date(Date.parse('2023-05-05'))).toISOString().substring(0, 10), 'reactor-name': 'Reactor1' })
      }
    };
    await TestBed.configureTestingModule({
      declarations: [PlaceOrderComponent],
      imports: [
        ReactiveFormsModule,
        HttpClientTestingModule,
        RouterTestingModule.withRoutes([
          {
            path: 'login',
            component: LoginComponent
          },
          {
            path: 'manage-order',
            component: ManageOrderComponent
          }
        ])
      ],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: mockActivatedRoute
        }
      ]
    })
      .compileComponents();

    fixture = TestBed.createComponent(PlaceOrderComponent);
    component = fixture.componentInstance;
    httpTestingController = TestBed.inject(HttpTestingController);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize the form', () => {
    expect(component.placeOrderForm).toBeDefined();
    expect(component.placeOrderForm.controls['account']).toBeDefined();
    expect(component.placeOrderForm.controls['clinicName']).toBeDefined();
    expect(component.placeOrderForm.controls['address']).toBeDefined();
    expect(component.placeOrderForm.controls['city']).toBeDefined();
    expect(component.placeOrderForm.controls['state']).toBeDefined();
    expect(component.placeOrderForm.controls['zipcode']).toBeDefined();
    expect(component.placeOrderForm.controls['email']).toBeDefined();
    expect(component.placeOrderForm.controls['phone']).toBeDefined();
    expect(component.placeOrderForm.controls['orderDate']).toBeDefined();
    expect(component.placeOrderForm.controls['shippingDate']).toBeDefined();
    expect(component.placeOrderForm.controls['dosagePerElbow']).toBeDefined();
    expect(component.placeOrderForm.controls['totalDosage']).toBeDefined();
    expect(component.placeOrderForm.controls['injectionDate']).toBeDefined();
    expect(component.placeOrderForm.controls['dogName']).toBeDefined();
    expect(component.placeOrderForm.controls['dogAge']).toBeDefined();
    expect(component.placeOrderForm.controls['dogBreed']).toBeDefined();
    expect(component.placeOrderForm.controls['dogWeight']).toBeDefined();
    expect(component.placeOrderForm.controls['dogGender']).toBeDefined();
    expect(component.placeOrderForm.controls['numberOfElbow']).toBeDefined();
  });

  it('should set the reactor field', () => {
    expect(component.selectedReactor).toEqual('Reactor1');
  });

  it('should set reactor_cycle_list on successful response', () => {
    const mockResponse = {
      'reactor-cycles': [
        {
          id: 1,
          is_enabled: true,
          mass: 40,
          name: 'reactorCycle1',
          reactor_id: 1,
          target_start_date: '15-04-2023',
          expiration_date: '30-05-2023',
        },
        {
          id: 2,
          is_enabled: true,
          mass: 40,
          name: 'reactorCycle2',
          reactor_id: 1,
          target_start_date: '15-04-2023',
          expiration_date: '30-05-2023',
        }
      ]
    };
    const req = httpTestingController.expectOne(environment.apiUrl + AppRoutes.REACTOR_CYCLE + '/avail' + `?reactor_name=Reactor1&injection_date=2023-05-06`);
    expect(req.request.method).toBe('GET');
    req.flush(mockResponse);
    expect(component.reactorCycleList).toEqual(mockResponse['reactor-cycles']);
  });

  it('should handle 400 not found error response while fetching reactor_cycle_list', () => {
    const spyAlert = spyOn(Swal, 'fire')
    const mockResponse = {
      message: 'Missing required query parameter(s)'
    };
    const req = httpTestingController.expectOne(environment.apiUrl + AppRoutes.REACTOR_CYCLE +`/avail`+`?reactor_name=Reactor1&injection_date=2023-05-06`);
    expect(req.request.method).toEqual('GET');
    req.flush(mockResponse, { status: 400, statusText: 'Missing required query parameter(s)' });
    expect(spyAlert).toHaveBeenCalledWith(
      'Error',
      'Missing required query parameter(s)',
      'error'
    )
  });

  it('should handle 401 not found error response while fetching reactor_cycle_list', () => {
    const mockResponse = {
      message: 'Unauthorized'
    };
    const req = httpTestingController.expectOne(environment.apiUrl + AppRoutes.REACTOR_CYCLE +`/avail`+`?reactor_name=Reactor1&injection_date=2023-05-06`);
    expect(req.request.method).toEqual('GET');
    req.flush(mockResponse, { status: 401, statusText: 'Unauthorized' });
  });


  it('should calculate total dosage correctly', () => {
    component.placeOrderForm.patchValue({ numberOfElbow: 3, dosagePerElbow: 2 });
    component.calculateTotalDosage();
    expect(component.placeOrderForm.value.totalDosage).toEqual('6.00');
  });

  it('should set total dosage to empty string if number of elbow or dosage per elbow is not set', () => {
    component.placeOrderForm.patchValue({ numberOfElbow: '', dosagePerElbow: '' });
    component.calculateTotalDosage();
    expect(component.placeOrderForm.value.totalDosage).toEqual('');
  });

  it('should set isAdmin to false and call clinicDetails when role is clinic', () => {
    spyOn(component, 'clinicDetails');
    spyOn(localStorage, 'getItem').and.returnValue('clinic');
    component.ngOnInit();
    expect(component.isAdmin).toBe(false);
    expect(component.clinicDetails).toHaveBeenCalled();
  });

  it('should return undefined if isAdmin is false and clinicName is not empty', () => {
    component.isAdmin = false;
    component.placeOrderForm.value.clinicName = 'test Clinic';
    const result = component.clinicDetails();
    expect(result).toBeUndefined();
  });
  
  it('should fetch clinic details and populate the clinic details in the form', () => {
    component.isAdmin = true
    component.clinics = ['Clinic1', 'Clinic2'];
    const clinicName = 'testClinic';
    const role = 'clinic';
    component.placeOrderForm.patchValue({
      clinicName: 'testClinic'
    });
    const clinic = {
      id: 123,
      account_id: 'C000006',
      name: 'testClinic',
      address: 'testAddress',
      city: 'testCity',
      state: 'testState',
      zipcode: '12345',
      email: 'myclinic@example.com',
    };
    spyOn(localStorage, 'getItem').and.callFake(
      (key) => {
        switch (key) {
          case 'token':
            return 'my-token';
          case 'role':
            return 'admin';
          default:
            return null;
        }
      }
    );
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization: `Bearer my-token`,
    });
    httpTestingController.expectOne(environment.apiUrl + AppRoutes.REACTOR_CYCLE +`/avail`+`?reactor_name=Reactor1&injection_date=2023-05-06`);
    component.clinicDetails();
    const req = httpTestingController.expectOne(`${environment.apiUrl}${AppRoutes.CLINIC}/name/${clinicName}`);    
    expect(req.request.method).toBe('GET');
    expect(req.request.method).toBe('GET');
    req.flush({ clinic });
    expect(component.placeOrderForm.value).toEqual({
      account: clinic.account_id,
      address: clinic.address,
      city: clinic.city,
      state: clinic.state,
      zipcode: clinic.zipcode,
      email: clinic.email,
      clinicName: clinic.name,
      orderDate: today,
      shippingDate: tomorrow,
      dosagePerElbow: '',
      totalDosage: '',
      injectionDate: injectionDate.toISOString().substring(0, 10),
      dogName: '',
      phone: '',
      dogAge: '',
      dogBreed: '',
      dogWeight: '',
      dogGender: '',
      numberOfElbow: '',
    });
  });

  it('should handle 401 error when fetching clinic details', () => {
    const clinicName = 'MyClinic';
    const errorResponse = { message: 'Something went wrong' };
    spyOn(localStorage, 'getItem').and.returnValue('my-token');
    spyOn(component.authService, 'logout');
    component.placeOrderForm.patchValue({ clinicName });
    component.clinicDetails();
    const req = httpTestingController.expectOne(`${environment.apiUrl}${AppRoutes.CLINIC}/name/${clinicName}`);
    expect(req.request.method).toBe('GET');
    req.flush(errorResponse, { status: 401, statusText: 'Unauthorized' });
    expect(component.authService.logout).toHaveBeenCalled();
  });

  it('should handle error when fetching clinic details', () => {
    const clinicName = 'MyClinic';
    const errorResponse = { message: 'Something went wrong' };
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization: `Bearer my-token`,
    });
    spyOn(localStorage, 'getItem').and.returnValue('my-token');
    component.placeOrderForm.patchValue({ clinicName });
    component.clinicDetails();
    const req = httpTestingController.expectOne(`${environment.apiUrl}${AppRoutes.CLINIC}/name/${clinicName}`);
    expect(req.request.method).toBe('GET');
    req.flush(errorResponse, { status: 404, statusText: 'Not Found' });
    expect(component.placeOrderForm.value.clinicName).toEqual(clinicName);
  });

  it('should submit the form and reset it on success', fakeAsync(() => {
    spyOn(localStorage, 'getItem').and.returnValue('my-token');
    component.placeOrderForm.setValue({
      clinicName: 'My Clinic',
      account: '',
      email: 'test@example.com',
      phone: '1234567890',
      orderDate: '',
      shippingDate: '',
      address: '',
      totalDosage: '',
      city: '',
      state: '',
      zipcode: '',
      injectionDate: '2023-05-01',
      dogName: 'Test Dog',
      dogBreed: 'Test Breed',
      dogAge: '3',
      dogWeight: '50',
      dogGender: 'Male',
      numberOfElbow: '2',
      dosagePerElbow: '10',
    });

    const orderDetails = {
      clinic_id: component.clinicId,
      account: '',
      email: 'test@example.com',
      phone_no: '1234567890',
      date: '',
      orderDate: '',
      shippingDate: '',
      totalDosage: '',
      address: '',
      city: '',
      state: '',
      zipcode: '',
      reactorName: 'Test Reactor',
      injection_date: '2023-05-01',
      dog_name: 'Test Dog',
      dog_breed: 'Test Breed',
      dog_age: '3',
      dog_weight: '50',
      dog_gender: 'Male',
      no_of_elbows: '2',
      dosage_per_elbow: '10'
    };

    const responseMock = { message: 'success' };
    const headers = { 'Authorization': 'Bearer my-token', 'Content-Type': 'application/json' };
    spyOn(Swal, 'fire').and.stub();
    spyOn(component, 'isFormValid').and.returnValue(true);
    spyOn(component.getRouter(),'navigate');
    component.selectedReactorCycle=1,
    component.onSubmit();
    const req = httpTestingController.expectOne(environment.apiUrl + AppRoutes.ORDER);
    expect(req.request.method).toEqual('POST');
    expect(req.request.headers.get('Authorization')).toEqual(headers.Authorization);
    expect(req.request.headers.get('Content-Type')).toEqual(headers['Content-Type']);
    req.flush(responseMock);
    tick();
    expect(Swal.fire).toHaveBeenCalledWith('Successful', 'You have successfully placed your order!', 'success');
    expect(component.getRouter().navigate).toHaveBeenCalledWith(['/manage-order']);
  }));


  it('should handle error response', () => {
    component.placeOrderForm.setValue({
      clinicName: 'My Clinic',
      account: '',
      email: 'test@example.com',
      phone: '1234567890',
      orderDate: '',
      shippingDate: '',
      totalDosage: '',
      address: '',
      city: '',
      state: '',
      zipcode: '',
      injectionDate: '2023-05-01',
      dogName: 'Test Dog',
      dogBreed: 'Test Breed',
      dogAge: '3',
      dogWeight: '50',
      dogGender: 'Male',
      numberOfElbow: '2',
      dosagePerElbow: '10'
    });
    spyOn(component, 'isFormValid').and.returnValue(true);
    component.selectedReactorCycle=1,
    component.onSubmit();
    const spyAlert = spyOn(Swal, 'fire');
    const mockResponse = {
      message: "Validation Failed",
      errors: {
        email: [
          "The email field is required."
        ]
      }
    };
    const req = httpTestingController.expectOne(environment.apiUrl + AppRoutes.ORDER);
    expect(req.request.method).toEqual('POST');
    req.flush(mockResponse, { status: 422, statusText: 'Unprocessable Content' });
    expect(spyAlert).toHaveBeenCalledWith(
      'Error',
      `email: The email field is required.<br>`);
  });

  it('should handle 400 not found error response', () => {
    const spyAlert = spyOn(Swal, 'fire')
    const token = 'test-token';
    const mockResponse = {
      message: 'Bad request'
    };

    spyOn(component, 'isFormValid').and.returnValue(true);
    component.selectedReactorCycle=1,
    component.onSubmit();
    const req = httpTestingController.expectOne(environment.apiUrl + AppRoutes.ORDER);
    expect(req.request.method).toEqual('POST');
    req.flush(mockResponse, { status: 400, statusText: 'Bad Request' });
    expect(spyAlert).toHaveBeenCalledWith(
      'Error',
      'Bad request',
      'error'
    )
  });

  it('should handle 401 not found error response', () => {
    const token = 'test-token';
    const mockResponse = {
      message: 'Unauthorized'
    };
    spyOn(component, 'isFormValid').and.returnValue(true);
    component.selectedReactorCycle=1,
    component.onSubmit();
    const req = httpTestingController.expectOne(environment.apiUrl + AppRoutes.ORDER);
    expect(req.request.method).toEqual('POST');
    req.flush(mockResponse, { status: 401, statusText: 'Unauthorized' });
  });

  it('should not call http.post when isFormValid returns false', () => {
    spyOn(component.http, 'post').and.returnValue(of({}));
    component.isFormValid = () => false;
    component.selectedReactorCycle=1,
    component.onSubmit();
    expect(component.http.post).not.toHaveBeenCalled();
  });

  it('should return false for invalid form', () => {
    const result = component.isFormValid();
    expect(result).toBe(false);
  });

  it('should show error if form is valid and selectReactorCycle is null', () => {
    spyOn(component.http, 'post').and.returnValue(of({}));
    spyOn(Swal,'fire');
    component.isFormValid = () => true;
    component.onSubmit();
    expect(Swal.fire).toHaveBeenCalledWith(
      'Error',
      'Please select a Reactor Cycle',
      'error'
    );
    expect(component.http.post).not.toHaveBeenCalled();
  });

  it('should transform date', () => {
    const date = '2023-04-10'
    const res = component.transformDate(date);
    expect(res).toEqual('Apr 10, 2023');
  });

  it('should fetch clinic names as dropdown menu in place order form', () =>{
    httpTestingController.expectOne(environment.apiUrl + AppRoutes.CLINIC + '/dropdown');
    const mockResponse = ['Clinic 1', 'Clinic 2', 'Clinic 3'];
    component.ngOnInit();
    const req = httpTestingController.expectOne(environment.apiUrl + AppRoutes.CLINIC + '/dropdown');
    expect(req.request.method).toBe('GET');
    req.flush(mockResponse);
    expect(component.clinics).toEqual(mockResponse);
  });

});
