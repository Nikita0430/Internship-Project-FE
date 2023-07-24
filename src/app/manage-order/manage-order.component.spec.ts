import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClient, HttpParams } from '@angular/common/http';

import { ManageOrderComponent } from './manage-order.component';
import { environment } from 'src/environments/environment';
import AppRoutes from '../app.routes';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { LoginuserService } from '../login-user.service';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';

describe('ManageOrderComponent', () => {
  let component: ManageOrderComponent;
  let fixture: ComponentFixture<ManageOrderComponent>;
  let authService: LoginuserService;
  let router: Router;
  let httpTestingController: HttpTestingController;
  let httpMock: HttpClient;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ManageOrderComponent],
      imports: [HttpClientTestingModule, ReactiveFormsModule],

    })
      .compileComponents();

    fixture = TestBed.createComponent(ManageOrderComponent);
    authService = TestBed.inject(LoginuserService);
    router = TestBed.inject(Router);
    httpTestingController = TestBed.inject(HttpTestingController);
    httpMock = TestBed.inject(HttpClient);
    component = fixture.componentInstance;
    fixture.detectChanges()
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should download file with correct parameters', () => {
    component.sortBy = 'date';
    component.sortOrder = 'asc';
    component.search.setValue('Fido');
    component.download();
    const req = httpTestingController.expectOne(environment.apiUrl + AppRoutes.ORDER + '/download?search=Fido&sort_by=date&sort_order=asc');
    expect(req.request.method).toBe('GET');
    const mockResponse = new Blob(['csv data'], { type: 'text/csv' });
    req.flush(mockResponse);
    expect(component.link.download).toBe('orders.csv');
    expect(component.link.target).toBe('_blank');
  });

  it('should logout when server returns 401, when export button is clicked', () => {
    spyOn(authService , 'logout');
    component.download();
    const req = httpTestingController.expectOne(environment.apiUrl + AppRoutes.ORDER + '/download');
    req.flush(new Blob([JSON.stringify({
      message: 'Unauthenticated'
    })]), { status: 401, statusText: 'Unauthenticated' });
    expect(authService.logout).toHaveBeenCalled();
  });

  it('should call goToPage with correct URL on getByName', () => {
    spyOn(component, 'goToPage');
    component.getList();
    expect(component.goToPage).toHaveBeenCalledWith(environment.apiUrl + AppRoutes.ORDER);
  });

  it('should call API with correct URL when dogName is provided', () => {
    const mockResponse = {
      'orders': {
        'data': [{
          "order_id": 1,
          "clinic_id": 1,
          "clinic_name": "Clinic1",
          "account_id": "C000001",
          "address": "address1",
          "city": "city1",
          "state": "state1",
          "zipcode": "300000",
          "reactor_id": 1,
          "reactor_name": "Reactor1",
          "email": "order@example.com",
          "phone_no": "1234567890",
          "placed_at": "2023-05-02 11:10:31",
          "shipped_at": "2023-05-03 11:10:31",
          "delivered_at": null,
          "out_for_delivery_at": null,
          "injection_date": "2023-05-03",
          "dogName": "Tom",
          "dogBreed": "labrador",
          "dog_age": 17,
          "dog_weight": 20,
          "dog_gender": "male",
          "no_of_elbows": 3,
          "total_dosage": 4.5,
          "status": "placed"
        }],
        'current_page': 1,
        'last_page': 1,
        'prev_page_url': '',
        'next_page_url': '',
        'links': []
      }
    };
    component.search.setValue('Buddy');
    component.goToPage(environment.apiUrl + AppRoutes.ORDER);
    const req = httpTestingController.expectOne(environment.apiUrl + AppRoutes.ORDER);
    expect(req.request.method).toEqual('GET');
    req.flush(mockResponse);
  });

  it('should call API with correct URL when dogBreed is provided', () => {
    const mockResponse = {
      'orders': {
        'data': [{
          "order_id": 1,
          "clinic_id": 1,
          "clinic_name": "Clinic1",
          "account_id": "C000001",
          "address": "address1",
          "city": "city1",
          "state": "state1",
          "zipcode": "300000",
          "reactor_id": 1,
          "reactor_name": "Reactor1",
          "email": "order@example.com",
          "phone_no": "1234567890",
          "placed_at": "2023-05-02 11:10:31",
          "shipped_at": "2023-05-03 11:10:31",
          "delivered_at": null,
          "out_for_delivery_at": null,
          "injection_date": "2023-05-03",
          "dogName": "Tom",
          "dogBreed": "labrador",
          "dog_age": 17,
          "dog_weight": 20,
          "dog_gender": "male",
          "no_of_elbows": 3,
          "total_dosage": 4.5,
          "status": "placed"
        }],
        'current_page': 1,
        'last_page': 1,
        'prev_page_url': '',
        'next_page_url': '',
        'links': []
      }
    };
    component.search.setValue('Labrador');
    component.goToPage(environment.apiUrl + AppRoutes.ORDER);
    const req = httpTestingController.expectOne(environment.apiUrl + AppRoutes.ORDER);
    expect(req.request.method).toEqual('GET');
    req.flush(mockResponse);
  });

  it('should call API with correct URL when sortBy and sortOrder are provided', () => {
    const mockResponse = {
      'orders': {
        'data': [{
          "order_id": 1,
          "clinic_id": 1,
          "clinic_name": "Clinic1",
          "account_id": "C000001",
          "address": "address1",
          "city": "city1",
          "state": "state1",
          "zipcode": "300000",
          "reactor_id": 1,
          "reactor_name": "Reactor1",
          "email": "order@example.com",
          "phone_no": "1234567890",
          "placed_at": "2023-05-02 11:10:31",
          "shipped_at": "2023-05-03 11:10:31",
          "delivered_at": null,
          "out_for_delivery_at": null,
          "injection_date": "2023-05-03",
          "dogName": "Tom",
          "dogBreed": "labrador",
          "dog_age": 17,
          "dog_weight": 20,
          "dog_gender": "male",
          "no_of_elbows": 3,
          "total_dosage": 4.5,
          "status": "placed"
        }],
        'current_page': 1,
        'last_page': 1,
        'prev_page_url': '',
        'next_page_url': '',
        'links': []
      }
    };
    const sortBy = 'clinic_name';
    const sortOrder = 'desc';
    component.sortList(sortBy, sortOrder);
    const req = httpTestingController.expectOne(environment.apiUrl + AppRoutes.ORDER);
    expect(req.request.method).toEqual('GET');
    req.flush(mockResponse);
  });
   
  it('should set Order data and pagination info on successful API response', () => {
    const mockResponse = {
      'orders': {
        'data': [{
          "order_id": 1,
          "clinic_id": 1,
          "clinic_name": "Clinic1",
          "account_id": "C000001",
          "address": "address1",
          "city": "city1",
          "state": "state1",
          "zipcode": "300000",
          "reactor_id": 1,
          "reactor_name": "Reactor1",
          "email": "order@example.com",
          "phone_no": "1234567890",
          "placed_at": "2023-05-02 11:10:31",
          "shipped_at": "2023-05-03 11:10:31",
          "delivered_at": null,
          "out_for_delivery_at": null,
          "injection_date": "2023-05-03",
          "dogName": "Tom",
          "dogBreed": "labrador",
          "dog_age": 17,
          "dog_weight": 20,
          "dog_gender": "male",
          "no_of_elbows": 3,
          "total_dosage": 4.5,
          "status": "placed"
        }],
        'current_page': 1,
        'last_page': 1,
        'prev_page_url': '',
        'next_page_url': '',
        'links': []
      }
    };
    const req = httpTestingController.expectOne(environment.apiUrl + AppRoutes.ORDER);
    expect(req.request.method).toEqual('GET');
    req.flush(mockResponse);
    component.goToPage(environment.apiUrl + AppRoutes.ORDER);
    expect(component.orderList.length).toBe(1);
    expect(component.currentPage).toBe(1);
    expect(component.lastPage).toBe(1);
    expect(component.prevPageUrl).toBe('');
    expect(component.nextPageUrl).toBe('');
    expect(component.links.length).toBe(0);
  });

  it('should handle 401 unauthorized error response', () => {
    spyOn(authService, 'logout');
    const url = environment.apiUrl + AppRoutes.ORDER;
    const req = httpTestingController.expectOne(url);
    expect(req.request.method).toEqual('GET');
    req.flush('', { status: 401, statusText: 'Unauthorized' });
    expect(authService.logout).toHaveBeenCalled();
  });

  it('should handle 404 not found error response', () => {
    spyOn(Swal, 'fire');
    const url = environment.apiUrl + AppRoutes.ORDER;
    const req = httpTestingController.expectOne(url);
    expect(req.request.method).toEqual('GET');
    req.flush('', { status: 404, statusText: 'Not Found' });
    expect(Swal.fire).toHaveBeenCalledWith('Error', 'No Matching Records Found', 'error');
  });

  it('should transform date', () => {
    const date = '2023-04-10'
    const res = component.transformDate(date);
    expect(res).toEqual('Apr 10, 2023');
  });

  it('should reset search and sort properties', () => {
    component.search.setValue('testSearch');
    component.sortBy = 'testSortBy';
    component.sortOrder = 'testSortOrder';
    component.resetList();
    expect(component.search.value).toEqual('');
    expect(component.sortBy).toEqual('');
    expect(component.sortOrder).toEqual('');
  });

  it('should show response on update status success', () => {
    component.selectedStatus.setValue('confirmed');
    component.selectedOrders = [1, 2];

    component.updateOrderStatus();

    const spySwal = spyOn(Swal,'fire');
    spyOn(component,'getList').and.callFake(() => {});
    const req = httpTestingController.expectOne(environment.apiUrl + AppRoutes.ORDER + '/bulk');
    expect(req.request.method).toEqual('PATCH');
    req.flush({
      'message': 'Status Updated',
    });
    expect(spySwal).toHaveBeenCalledWith('Success', 'Status Updated', 'success');
  });

  it('should show error on update status 422 response', () => {
    component.selectedStatus.setValue('InvalidStatus');
    component.selectedOrders = [1, 2];

    component.updateOrderStatus();

    const spySwal = spyOn(Swal,'fire');
    spyOn(component,'getList').and.callFake(() => {});
    const req = httpTestingController.expectOne(environment.apiUrl + AppRoutes.ORDER + '/bulk');
    expect(req.request.method).toEqual('PATCH');
    req.flush({
      message: "Validation Failed",
      errors: {
        status: [
          "The status field is required."
        ]
      },
    }, {status: 422, statusText: 'Unprocessable Entity'});
    expect(spySwal).toHaveBeenCalledWith(
      'Error',
      'status: The status field is required.<br>',
      'error'
    );
  });

  it('should show error on update status 400 response', () => {
    component.selectedStatus.setValue('InvalidStatus');
    component.selectedOrders = [1, 2];

    component.updateOrderStatus();

    const spySwal = spyOn(Swal,'fire');
    spyOn(component,'getList').and.callFake(() => {});
    const req = httpTestingController.expectOne(environment.apiUrl + AppRoutes.ORDER + '/bulk');
    expect(req.request.method).toEqual('PATCH');
    req.flush({
      message: "Cannot Revert Status",
    }, {status: 400, statusText: 'Bad Request'});
    expect(spySwal).toHaveBeenCalledWith(
      'Error',
      'Cannot Revert Status',
      'error'
    );
  });

  it('should show error on update status 401 response', () => {
    component.selectedStatus.setValue('InvalidStatus');
    component.selectedOrders = [1, 2];

    component.updateOrderStatus();

    const spyLogin = spyOn(component.authService,'logout').and.callFake(() => {});
    spyOn(component,'getList').and.callFake(() => {});
    const req = httpTestingController.expectOne(environment.apiUrl + AppRoutes.ORDER + '/bulk');
    expect(req.request.method).toEqual('PATCH');
    req.flush({
      message: "Unauthenticated",
    }, {status: 401, statusText: 'Unauthorized'});
    expect(spyLogin).toHaveBeenCalled();
  });

  it('should not call update api when no status is selected', () => {
    component.selectedStatus.setValue('');
    spyOn(Swal, 'fire');
    component.updateOrderStatus();
    expect(Swal.fire).toHaveBeenCalledWith(
      'Error',
      'No status is selected',
      'error'
    );
    httpTestingController.expectNone(environment.apiUrl + AppRoutes.ORDER + '/bulk');
  });

  it('should add id to selectedOrders', () => {
    component.selectedOrders = [1, 2];
    component.orderList = [
      {
        order_id: 1,
        status: 'pending'
      },
      {
        order_id: 2,
        status: 'pending'
      },
      {
        order_id: 3,
        status: 'pending'
      }
    ]
    component.updateSelectedOrders(3);
    expect(component.selectedOrders).toEqual([1, 2, 3]);
  });

  it('should remove id to selectedOrders', () => {
    component.selectedOrders = [1, 2];
    component.updateSelectedOrders(2);
    expect(component.selectedOrders).toEqual([1]);
  });

  it('should return true if the status is valid', () => {
    component.selectedOrdersStatus = ['pending', 'shipped', 'shipped'];
    expect(component.isSelectionValid('out for delivery')).toBe(false);
    expect(component.selectedStatus.value).toBe('');
  });

  it('should return false if the status is invalid', () => {
    component.selectedOrdersStatus = ['pending', 'shipped', 'delivered'];
    expect(component.isSelectionValid('confirmed')).toBe(true);
    expect(component.selectedStatus.value).toBe('');
  });

  it('should clear the selectedStatus if it matches the status being checked', () => {
    component.selectedOrdersStatus = ['pending', 'shipped', 'delivered'];
    component.selectedStatus.setValue('shipped');
    component.isSelectionValid('shipped');
    expect(component.selectedStatus.value).toBe('');
  });
});
