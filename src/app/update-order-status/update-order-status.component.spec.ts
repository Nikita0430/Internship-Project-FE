import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UpdateOrderStatusComponent } from './update-order-status.component';
import { ReactiveFormsModule } from '@angular/forms';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { ActivatedRoute, convertToParamMap } from '@angular/router';
import { environment } from 'src/environments/environment';
import AppRoutes from '../app.routes';
import { HttpClient } from '@angular/common/http';
import { RouterTestingModule } from '@angular/router/testing';
import { LoginComponent } from '../login/login.component';
import Swal from 'sweetalert2';
import { ViewOrderComponent } from '../view-order/view-order.component';

describe('UpdateOrderStatusComponent', () => {
  let component: UpdateOrderStatusComponent;
  let fixture: ComponentFixture<UpdateOrderStatusComponent>;
  let httpTestingController: HttpTestingController;
  let httpClient: HttpClient;
  const orderId = 1;



  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [UpdateOrderStatusComponent],
      imports: [RouterTestingModule.withRoutes([
        {
          path: 'view-order/1',
          component: ViewOrderComponent
        }
      ]), HttpClientTestingModule, ReactiveFormsModule],
    }).compileComponents();

    fixture = TestBed.createComponent(UpdateOrderStatusComponent);
    component = fixture.componentInstance;
    component.getActivatedRoute().snapshot.params['id'] = orderId;
    httpTestingController = TestBed.inject(HttpTestingController);
    httpClient = TestBed.inject(HttpClient);
    fixture.detectChanges();
  });

  afterEach(() => {
    httpTestingController.verify();
  });

  it('should get correct order details on init', () => {
    expect(component).toBeTruthy();

    const mockResponse = {
      message: "Order Found",
      order: {
        order_id: 1,
        placed_at: "2023-05-03T11:03:36.386Z",
        confirmed_at: "2023-05-03T11:03:36.386Z",
        shipped_at: "",
        out_for_delivery_at: "",
        delivered_at: "",
        cancelled_at: "",
        status: "confirmed"
      }
    };
    const req = httpTestingController.expectOne(`${environment.apiUrl}${AppRoutes.ORDER}/${orderId}`);
    expect(req.request.method).toBe('GET');
    req.flush(mockResponse);
    expect(component.orderDetails).toEqual(mockResponse.order);
    expect(component.currentStep).toEqual(2);
  });

  it('should set "cancelled" to true if the order status is "cancelled"', () => {
    const mockResponse = {
      message: "Order Found",
      order: {
        order_id: 1,
        placed_at: "2023-05-03T11:03:36.386Z",
        confirmed_at: "2023-05-03T11:03:36.386Z",
        shipped_at: "",
        out_for_delivery_at: "",
        delivered_at: "",
        cancelled_at: "",
        status: "cancelled"
      }
    };

    const req = httpTestingController.expectOne(`${environment.apiUrl}${AppRoutes.ORDER}/${orderId}`);
    expect(req.request.method).toBe('GET');
    req.flush(mockResponse);
    expect(component.orderDetails).toEqual(mockResponse.order);
    expect(component.currentStep).toEqual(0);
  });

  it('should get error on incorrect id param', () => {
    const mockResponse = {
      message: 'Order Not Found'
    };
    const req = httpTestingController.expectOne(`${environment.apiUrl}${AppRoutes.ORDER}/${orderId}`);
    expect(req.request.method).toBe('GET');
    req.flush(mockResponse, { status: 404, statusText: 'Order Not Found' });
    expect(component.orderDetails).toEqual(null);
    expect(component.currentStep).toEqual(0);
  });

  it('should logout for 401 error while fetching order details', () => {
    const mockResponse = {
      message: 'Unauthenticated'
    };
    spyOn(component.authService, 'logout');
    const req = httpTestingController.expectOne(`${environment.apiUrl}${AppRoutes.ORDER}/${orderId}`);
    expect(req.request.method).toBe('GET');
    req.flush(mockResponse, { status: 401, statusText: 'Unauthorized' });
    expect(component.authService.logout).toHaveBeenCalled();
  });

  it('should get success response on update status button click', () => {
    spyOn(localStorage, 'getItem').and.returnValue('my-token');

    const mockResponse1 = {
      message: "Order Found",
      order: {
        order_id: 1,
        placed_at: "2023-05-03T11:03:36.386Z",
        confirmed_at: "2023-05-03T11:03:36.386Z",
        shipped_at: "",
        out_for_delivery_at: "",
        delivered_at: "",
        cancelled_at: "",
        status: "confirmed"
      }
    };
    const req1 = httpTestingController.expectOne(`${environment.apiUrl}${AppRoutes.ORDER}/${orderId}`);
    expect(req1.request.method).toEqual('GET');
    req1.flush(mockResponse1);

    const spySwal = spyOn(Swal, 'fire');
    component.updateOrderForm.setValue({
      status: 'confirmed',
      dateTime: component.transformDateTime(new Date().toDateString())
    });
    const mockResponse2 = { message: 'success' };
    component.onSubmit();
    const req2 = httpTestingController.expectOne(`${environment.apiUrl}${AppRoutes.ORDER}/${orderId}`);
    expect(req2.request.method).toEqual('PATCH');
    req2.flush(mockResponse2);

    expect(spySwal).toHaveBeenCalledWith(
      'Success',
      'Order Status Updated',
      'success'
    );
  });

  it('should display error message error response', () => {
    spyOn(localStorage, 'getItem').and.returnValue('my-token');

    const mockResponse1 = {
      message: "Order Found",
      order: {
        order_id: 1,
        placed_at: "2023-05-03T11:03:36.386Z",
        confirmed_at: "2023-05-03T11:03:36.386Z",
        shipped_at: "",
        out_for_delivery_at: "",
        delivered_at: "",
        cancelled_at: "",
        status: "confirmed"
      }
    };
    const req1 = httpTestingController.expectOne(`${environment.apiUrl}${AppRoutes.ORDER}/${orderId}`);
    expect(req1.request.method).toEqual('GET');
    req1.flush(mockResponse1);

    const spySwal = spyOn(Swal, 'fire');
    component.updateOrderForm.setValue({
      status: 'confirmed',
      dateTime: component.transformDateTime(new Date().toDateString())
    });
    const mockResponse2 = { message: 'error' };
    component.onSubmit();
    const req2 = httpTestingController.expectOne(`${environment.apiUrl}${AppRoutes.ORDER}/${orderId}`);
    expect(req2.request.method).toEqual('PATCH');
    req2.flush(mockResponse2, { status: 400, statusText: 'Bad Request' });

    expect(spySwal).toHaveBeenCalledWith(
      'Error',
      mockResponse2.message,
      'error'
    );
  });

  it('should logout on unauthenticated error response', () => {
    spyOn(localStorage, 'getItem').and.returnValue('my-token');

    const mockResponse1 = {
      message: "Order Found",
      order: {
        order_id: 1,
        placed_at: "2023-05-03T11:03:36.386Z",
        confirmed_at: "2023-05-03T11:03:36.386Z",
        shipped_at: "",
        out_for_delivery_at: "",
        delivered_at: "",
        cancelled_at: "",
        status: "confirmed"
      }
    };
    const req1 = httpTestingController.expectOne(`${environment.apiUrl}${AppRoutes.ORDER}/${orderId}`);
    expect(req1.request.method).toEqual('GET');
    req1.flush(mockResponse1);

    const spyLogin = spyOn(component.authService, 'logout').and.callFake(() => { });
    component.updateOrderForm.setValue({
      status: 'confirmed',
      dateTime: component.transformDateTime(new Date().toDateString())
    });
    const mockResponse2 = { message: 'error' };
    component.onSubmit();
    const req2 = httpTestingController.expectOne(`${environment.apiUrl}${AppRoutes.ORDER}/${orderId}`);
    expect(req2.request.method).toEqual('PATCH');
    req2.flush(mockResponse2, { status: 401, statusText: 'Unauthenticated' });
    expect(spyLogin).toHaveBeenCalled();
  });

  it('should show message on unprocessable content error response', () => {
    spyOn(localStorage, 'getItem').and.returnValue('my-token');

    const mockResponse1 = {
      message: "Order Found",
      order: {
        order_id: 1,
        placed_at: "2023-05-03T11:03:36.386Z",
        confirmed_at: "2023-05-03T11:03:36.386Z",
        shipped_at: "",
        out_for_delivery_at: "",
        delivered_at: "",
        cancelled_at: "",
        status: "confirmed"
      }
    };
    const req1 = httpTestingController.expectOne(`${environment.apiUrl}${AppRoutes.ORDER}/${orderId}`);
    expect(req1.request.method).toEqual('GET');
    req1.flush(mockResponse1);

    const spySwal = spyOn(Swal, 'fire');
    component.updateOrderForm.setValue({
      status: 'confirmed',
      dateTime: component.transformDateTime(new Date().toDateString())
    });
    const mockResponse2 = {
      message: "Validation Failed",
      errors: {
        status: [
          "The status field is required."
        ]
      }
    };
    component.onSubmit();
    const req2 = httpTestingController.expectOne(`${environment.apiUrl}${AppRoutes.ORDER}/${orderId}`);
    expect(req2.request.method).toEqual('PATCH');
    req2.flush(mockResponse2, { status: 422, statusText: 'Unprocessable Entity' });
    expect(spySwal).toHaveBeenCalledWith(
      'Error',
      `status: The status field is required.<br>`,
      'error');
  });

  it('should not call the update status api when no status is selected', () => {
    spyOn(localStorage, 'getItem').and.returnValue('my-token');

    const mockResponse1 = {
      message: "Order Found",
      order: {
        order_id: 1,
        placed_at: "2023-05-03T11:03:36.386Z",
        confirmed_at: "2023-05-03T11:03:36.386Z",
        shipped_at: "",
        out_for_delivery_at: "",
        delivered_at: "",
        cancelled_at: "",
        status: "confirmed"
      }
    };
    const req1 = httpTestingController.expectOne(`${environment.apiUrl}${AppRoutes.ORDER}/${orderId}`);
    expect(req1.request.method).toEqual('GET');
    req1.flush(mockResponse1);

    const spySwal = spyOn(Swal, 'fire');
    component.updateOrderForm.setValue({
      status: '',
      dateTime: component.transformDateTime(new Date().toDateString())
    });
    component.onSubmit();
    const req2 = httpTestingController.expectNone(`${environment.apiUrl}${AppRoutes.ORDER}/${orderId}`);
    expect(spySwal).toHaveBeenCalledWith(
      'Error',
      'No status is selected',
      'error'
    );
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
