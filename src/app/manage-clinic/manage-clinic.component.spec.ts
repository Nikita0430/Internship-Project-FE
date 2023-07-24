import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { environment } from 'src/environments/environment';
import AppRoutes from '../app.routes';
import { LoginuserService } from '../login-user.service';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
import { ManageclinicComponent } from './manage-clinic.component';
import { HttpHeaders } from '@angular/common/http';

describe('ManageclinicComponent', () => {
  let component: ManageclinicComponent;
  let fixture: ComponentFixture<ManageclinicComponent>;
  let httpTestingController: HttpTestingController;
  let authService: LoginuserService;
  let router: Router;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ManageclinicComponent ],
      imports: [ HttpClientTestingModule, ReactiveFormsModule ], 
    })
    .compileComponents();

    fixture = TestBed.createComponent(ManageclinicComponent);
    authService = TestBed.inject(LoginuserService);
    router = TestBed.inject(Router);
    httpTestingController = TestBed.inject(HttpTestingController);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should call goToPage on component initialization', () => {
    spyOn(component, 'goToPage');
    component.ngOnInit();
    expect(component.goToPage).toHaveBeenCalledWith(environment.apiUrl + AppRoutes.CLINIC);
  });

  it('should download file with correct parameters', () => {
    component.sortBy = 'clinic_name';
    component.sortOrder = 'desc';
    component.name.setValue('ClinicName')

    component.download();
    const req = httpTestingController.expectOne(environment.apiUrl + AppRoutes.CLINIC + '/download?name=ClinicName&sort_by=clinic_name&sort_order=desc');
    expect(req.request.method).toBe('GET');
    const mockResponse = new Blob(['csv data'], { type: 'text/csv' });
    req.flush(mockResponse);
    expect(component.link.download).toBe('Clinics.csv');
    expect(component.link.target).toBe('_blank');
  });

  it('should call logout when server returns 401 when export button is clicked', () => {
    spyOn(authService , 'logout');
    component.download();
    const req = httpTestingController.expectOne(environment.apiUrl + AppRoutes.CLINIC + '/download');
    req.flush(new Blob([JSON.stringify({
      message: 'Unauthenticated'
    })]), { status: 401, statusText: 'Unauthenticated' });
    expect(authService.logout).toHaveBeenCalled();
  });

  it('should call goToPage with correct URL on getList', () => {
    spyOn(component, 'goToPage');
    component.getList();
    expect(component.goToPage).toHaveBeenCalledWith(environment.apiUrl + AppRoutes.CLINIC);
  });

  it('should set ReactorCycle data and pagination info on successful API response', () => {
    const mockResponse = {
      'clinics': {
        'data': [{
          "id": 1,
          "email": "test@example.com",
          "password": "testpass",
          "name": "testName",
          "address": "testAddress",
          "city": "testCity",
          "state": "testState",
          "zipcode": "testZipcode",
        }],
        'current_page': 1,
        'last_page': 1,
        'prev_page_url': '',
        'next_page_url': '',
        'links': []
      }
    };
    component.name.setValue('Clinic1');
    const req = httpTestingController.expectOne(environment.apiUrl + AppRoutes.CLINIC);
    expect(req.request.method).toEqual('GET');
    req.flush(mockResponse);
    component.goToPage(environment.apiUrl + AppRoutes.CLINIC);
    expect(component.clinics.length).toBe(1);
    expect(component.currentPage).toBe(1);
    expect(component.lastPage).toBe(1);
    expect(component.prevPageUrl).toBe('');
    expect(component.nextPageUrl).toBe('');
    expect(component.links.length).toBe(0);
  });

  it('should call API with correct URL when sortBy and sortOrder are provided', () => {
    const mockResponse = {
      'clinics': {
        'data': [{
          "id": 1,
          "email": "test@example.com",
          "password": "testpass",
          "name": "testName",
          "address": "testAddress",
          "city": "testCity",
          "state": "testState",
          "zipcode": "testZipcode",
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
    const req = httpTestingController.expectOne(environment.apiUrl + AppRoutes.CLINIC);
    expect(req.request.method).toEqual('GET');
    req.flush(mockResponse);
  });

  it('should handle 401 unauthorized error response', () => {
    spyOn(authService, 'logout');
    const url = environment.apiUrl + AppRoutes.CLINIC;
    const req = httpTestingController.expectOne(url);
    expect(req.request.method).toEqual('GET');
    req.flush('', { status: 401, statusText: 'Unauthorized' });
    expect(authService.logout).toHaveBeenCalled();
  });

  it('should handle 404 not found error response', () => {
    spyOn(Swal, 'fire');
    const url = environment.apiUrl + AppRoutes.CLINIC;
    const req = httpTestingController.expectOne(url);
    expect(req.request.method).toEqual('GET');
    req.flush('', { status: 404, statusText: 'Not Found' });
    expect(Swal.fire).toHaveBeenCalledWith('Error', 'No Matching Records Found', 'error');
  });

  it('should reset search and sort properties', () => {
    component.name.setValue('testSearch');
    component.sortBy = 'testSortBy';
    component.sortOrder = 'testSortOrder';
    component.resetList();
    expect(component.name.value).toEqual('');
    expect(component.sortBy).toEqual('');
    expect(component.sortOrder).toEqual('');
  });
});
