import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ViewOrderComponent } from './view-order.component';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { ActivatedRoute } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { OrderService } from '../order.service';
import { environment } from 'src/environments/environment';
import { RouterTestingModule } from '@angular/router/testing';
import { LoginComponent } from '../login/login.component';
import { LoginuserService } from '../login-user.service';
import { of } from 'rxjs';
import AppRoutes from '../app.routes';
import Swal from 'sweetalert2';

describe('ViewOrderComponent', () => {
  let component: ViewOrderComponent;
  let fixture: ComponentFixture<ViewOrderComponent>;
  let httpTestingController: HttpTestingController;
  let httpClient: HttpClient;
  let orderService: OrderService;
  const orderId = 1;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ViewOrderComponent], imports: [RouterTestingModule.withRoutes([
        {
          path: 'login',
          component: LoginComponent
        }, {
          path: 'view-order/:id',
          component: ViewOrderComponent
        }
      ]), HttpClientTestingModule, ReactiveFormsModule],
      providers: [OrderService, LoginuserService, { provide: ActivatedRoute, useValue: { params: of({ id: orderId }) } }]
    }).compileComponents();

    fixture = TestBed.createComponent(ViewOrderComponent);
    component = fixture.componentInstance;
    httpTestingController = TestBed.inject(HttpTestingController);
    httpClient = TestBed.inject(HttpClient);
    orderService = TestBed.inject(OrderService);
    fixture.detectChanges();

  });

  afterEach(() => {
    httpTestingController.verify();
  });

  it('should create', () => {
    const req = httpTestingController.expectOne(environment.apiUrl + AppRoutes.ORDER + `/${orderId}`);
    expect(req.request.method).toBe('GET');
    expect(component).toBeTruthy();
  });

  it('should fetch order details and display them', () => {
    const orderResponse = {
      message: "Order Found",
      order: {
        order_id: 1,
        clinic_id: 456,
        clinic_name: "ClinicName",
        account_id: "C000456",
        address: "Address Line 1",
        city: "City",
        state: "State",
        zipcode: "12345",
        reactor_id: 123,
        reactor_name: "Reactor1",
        reactor_cycle_id: 35,
        email: "user@example.com",
        phone_no: "555-123-4567",
        placed_at: "2023-05-03T11:03:36.386Z",
        shipped_at: "2023-05-03T11:03:36.386Z",
        out_for_delivery_at: "2023-05-03T11:03:36.386Z",
        delivered_at: "2023-05-03T11:03:36.386Z",
        injection_date: "2023-05-03",
        dog_name: "Fido",
        dog_breed: "Golden Retriever",
        dog_age: 5,
        dog_weight: 70.5,
        dog_gender: "male",
        no_of_elbows: 2,
        total_dosage: 10,
        status: "placed"
      }
    };
    spyOn(component, 'getReactorCycle').and.callFake(() => { });
    const req = httpTestingController.expectOne(`${environment.apiUrl}${AppRoutes.ORDER}/${orderId}`);
    expect(req.request.method).toBe('GET');
    req.flush(orderResponse);
    expect(component.orderDetails).toEqual(orderResponse.order);
  });

  it('should fetch order details and display them', () => {
    const orderResponse = {
      message: "Order Found",
      order: {
        order_id: 1,
        clinic_id: 456,
        clinic_name: "ClinicName",
        account_id: "C000456",
        address: "Address Line 1",
        city: "City",
        state: "State",
        zipcode: "12345",
        reactor_id: 123,
        reactor_name: "Reactor1",
        reactor_cycle_id: 35,
        email: "user@example.com",
        phone_no: "555-123-4567",
        placed_at: "2023-05-03T11:03:36.386Z",
        shipped_at: "2023-05-03T11:03:36.386Z",
        out_for_delivery_at: "2023-05-03T11:03:36.386Z",
        delivered_at: "2023-05-03T11:03:36.386Z",
        injection_date: "2023-05-03",
        dog_name: "Fido",
        dog_breed: "Golden Retriever",
        dog_age: 5,
        dog_weight: 70.5,
        dog_gender: "male",
        no_of_elbows: 2,
        total_dosage: 10,
        status: "cancelled",
      }
    };
    spyOn(component, 'getReactorCycle').and.callFake(() => { });
    const req = httpTestingController.expectOne(`${environment.apiUrl}${AppRoutes.ORDER}/${orderId}`);
    expect(req.request.method).toBe('GET');
    req.flush(orderResponse);
    expect(component.orderDetails).toEqual(orderResponse.order);
  });

  it('should populate reactorCycleList on successful API response', () => {
    const mockOrderResponse = {
      order: {
        reactor_name: 'Sample Reactor',
        injection_date: '2023-05-15',
        order_id: 1
      }
    };
    const mockReactorCycleResponse = {
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
    const getOrderReq = httpTestingController.expectOne(`${environment.apiUrl}${AppRoutes.ORDER}/${orderId}`);
    expect(getOrderReq.request.method).toBe('GET');
    getOrderReq.flush(mockOrderResponse);
    expect(component.orderDetails).toEqual(mockOrderResponse.order);
    const getReactorCycleReq = httpTestingController.expectOne(`${environment.apiUrl}reactor-cycles/avail?reactor_name=Sample%20Reactor&injection_date=2023-05-15&order_id=1`);
    expect(getReactorCycleReq.request.method).toBe('GET');
    expect(getReactorCycleReq.request.params.get('reactor_name')).toBe(component.orderDetails.reactor_name);
    expect(getReactorCycleReq.request.params.get('injection_date')).toBe(component.orderDetails.injection_date);
    getReactorCycleReq.flush(mockReactorCycleResponse);
    expect(component.reactorCycleList).toEqual(mockReactorCycleResponse['reactor-cycles']);
  });

  it('should show error message on 400 status code', () => {
    const mockOrderResponse = {
      order: {
        reactor_name: 'Sample Reactor',
        injection_date: '2023-05-15',
        order_id: 1
      }
    };
    const mockErrorResponse = { message: 'Missing required query parameter(s)' };
    spyOn(localStorage, 'getItem').and.returnValue('sample_token');
    spyOn(Swal, 'fire');
    const getOrderReq = httpTestingController.expectOne(`${environment.apiUrl}${AppRoutes.ORDER}/${orderId}`);
    getOrderReq.flush(mockOrderResponse);
    const getReactorCycleReq = httpTestingController.expectOne(`${environment.apiUrl}${AppRoutes.REACTOR_CYCLE}/avail?reactor_name=Sample%20Reactor&injection_date=2023-05-15&order_id=1`);
    getReactorCycleReq.flush(mockErrorResponse, { status: 400, statusText: 'Bad Request' });
    expect(Swal.fire).toHaveBeenCalledWith('Error');
    expect(component.orderDetails).toEqual(mockOrderResponse.order);
    expect(component.reactorCycleList).toEqual([]);
  });

  it('should handle 401 not found error response while fetching reactor_cycle_list', () => {
    const mockOrderResponse = {
      order: {
        reactor_name: 'Sample Reactor',
        injection_date: '2023-05-15',
        order_id: 1
      }
    };
    const mockErrorResponse = { message: 'Missing required query parameter(s)' };
    const spyLogin = spyOn(component.authService, 'logout').and.callFake(() => { });
    const getOrderReq = httpTestingController.expectOne(`${environment.apiUrl}${AppRoutes.ORDER}/${orderId}`);
    getOrderReq.flush(mockOrderResponse);
    const getReactorCycleReq = httpTestingController.expectOne(`${environment.apiUrl}${AppRoutes.REACTOR_CYCLE}/avail?reactor_name=Sample%20Reactor&injection_date=2023-05-15&order_id=1`);
    getReactorCycleReq.flush(mockErrorResponse, { status: 401, statusText: 'Unauthorized' });
    expect(spyLogin).toHaveBeenCalled();
  });

  it('should show error message when order not found', () => {
    const spyAlert = spyOn(Swal, 'fire');
    const mockResponse = {
      message: "order Not Found"
    };
    const req = httpTestingController.expectOne(environment.apiUrl + AppRoutes.ORDER + '/' + orderId);
    expect(req.request.method).toBe('GET');
    req.flush(mockResponse, { status: 404, statusText: 'Error: Not Found' });
    expect(spyAlert).toHaveBeenCalledWith('Error', 'order Not Found', 'error');
  });

  it('should logout when unauthenticated response while fetching order', () => {
    spyOn(component.authService, 'logout');
    const mockResponse = {
      message: "Unauthenticated"
    };
    const req = httpTestingController.expectOne(environment.apiUrl + AppRoutes.ORDER + '/' + orderId);
    expect(req.request.method).toBe('GET');
    req.flush(mockResponse, { status: 401, statusText: 'Unauthorized' });
    expect(component.authService.logout).toHaveBeenCalled();
  });

  it('should transform date', () => {
    const req = httpTestingController.expectOne(environment.apiUrl + AppRoutes.ORDER + `/${orderId}`);
    expect(req.request.method).toBe('GET');

    const date = '2023-04-10'
    const res = component.transformDate(date);
    expect(typeof (res)).toBe('string');
  });

  it('should transform date time', () => {
    const req = httpTestingController.expectOne(environment.apiUrl + AppRoutes.ORDER + `/${orderId}`);
    expect(req.request.method).toBe('GET');

    const date = '2023-04-10 12:30:00'
    const res = component.transformDateTime(date);
    expect(typeof (res)).toBe('string');
  });

  it('should return same when date time is null', () => {
    const req = httpTestingController.expectOne(environment.apiUrl + AppRoutes.ORDER + `/${orderId}`);
    expect(req.request.method).toBe('GET');

    const date = null;
    const res = component.transformDateTime(date);
    expect(res).toBe(null);
  });
});