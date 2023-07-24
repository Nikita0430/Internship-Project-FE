import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ManageReactorCycleComponent } from './manage-reactor-cycle.component';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { environment } from 'src/environments/environment';
import AppRoutes from '../app.routes';
import { LoginuserService } from '../login-user.service';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';

describe('ManageReactorCycleComponent', () => {
  let component: ManageReactorCycleComponent;
  let fixture: ComponentFixture<ManageReactorCycleComponent>;
  let httpTestingController: HttpTestingController;
  let authService: LoginuserService;
  let router: Router;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ManageReactorCycleComponent ],
      imports: [ HttpClientTestingModule, ReactiveFormsModule ], 
    })
    .compileComponents();

    fixture = TestBed.createComponent(ManageReactorCycleComponent);
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
    expect(component.goToPage).toHaveBeenCalledWith(environment.apiUrl + AppRoutes.REACTOR_CYCLE);
  });

  it('should call goToPage with correct URL on getList', () => {
    spyOn(component, 'goToPage');
    component.getList();
    expect(component.goToPage).toHaveBeenCalledWith(environment.apiUrl + AppRoutes.REACTOR_CYCLE);
  });

  it('should set ReactorCycle data and pagination info on successful API response', () => {
    const mockResponse = {
      'reactor-cycles': {
        'data': [{
          'id': 1,
          'cycle_name': 'Cycle 1',
          'reactor_name': 'Reactor 1',
          'mass': 10,
          'target_start_date': '2023-01-01',
          'expiration_date': '2023-12-31',
          'is_enabled': true
        }],
        'current_page': 1,
        'last_page': 1,
        'prev_page_url': '',
        'next_page_url': '',
        'links': []
      }
    };
    component.name.setValue('Cycle 1');

    const req = httpTestingController.expectOne(environment.apiUrl + AppRoutes.REACTOR_CYCLE);
    expect(req.request.method).toEqual('GET');
    req.flush(mockResponse);

    component.goToPage(environment.apiUrl + AppRoutes.REACTOR_CYCLE);

    expect(component.reactorCycles.length).toBe(1);
    expect(component.currentPage).toBe(1);
    expect(component.lastPage).toBe(1);
    expect(component.prevPageUrl).toBe('');
    expect(component.nextPageUrl).toBe('');
    expect(component.links.length).toBe(0);
  });

  it('should call API with correct URL when sortBy and sortOrder are provided', () => {
    const mockResponse = {
      'reactor-cycles': {
        'data': [{
          'id': 1,
          'cycle_name': 'Cycle 1',
          'reactor_name': 'Reactor 1',
          'mass': 10,
          'target_start_date': '2023-01-01',
          'expiration_date': '2023-12-31',
          'is_enabled': true
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

    const req = httpTestingController.expectOne(environment.apiUrl + AppRoutes.REACTOR_CYCLE);
    expect(req.request.method).toEqual('GET');
    req.flush(mockResponse);
  });

  it('should handle 401 unauthorized error response', () => {
    spyOn(authService, 'logout');
    
    const url = environment.apiUrl + AppRoutes.REACTOR_CYCLE;
    const req = httpTestingController.expectOne(url);
    expect(req.request.method).toEqual('GET');
    req.flush('', { status: 401, statusText: 'Unauthorized' });
    
    expect(authService.logout).toHaveBeenCalled();
  });

  it('should handle 404 not found error response', () => {
    spyOn(Swal, 'fire');
    
    const url = environment.apiUrl + AppRoutes.REACTOR_CYCLE;
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
    component.name.setValue('testSearch');
    component.sortBy = 'testSortBy';
    component.sortOrder = 'testSortOrder';
    component.resetList();
    expect(component.name.value).toEqual('');
    expect(component.sortBy).toEqual('');
    expect(component.sortOrder).toEqual('');
  });

  it('should make popup visibility true and call getArchivedList', () => {
    spyOn(component,'getArchivedList').and.callFake(()=>{});
    component.openArchivedReactorCyclesPopup();
    expect(component.showArchivedReactorCyclesPopup).toBe(true);
    expect(component.getArchivedList).toHaveBeenCalled();
  });

  it('should call goToArchivePage on getArchivedList', () => {
    spyOn(component,'goToArchivedPage').and.callFake(()=>{});
    component.getArchivedList();
    expect(component.goToArchivedPage).toHaveBeenCalled();
  });

  it('should call goToArchivedPage and set search bar Archived Name to empty on resetArchivedList', () => {
    spyOn(component,'goToArchivedPage').and.callFake(()=>{});
    component.resetArchivedList();
    expect(component.archivedName.value).toBe('');
    expect(component.goToArchivedPage).toHaveBeenCalled();
  });

  it('should set showPopup to false and reset archived related properties on closePopup', () => {
    component.showArchivedReactorCyclesPopup = true;
    component.archivedReactorCycles = [{
      'id': 1,
      'cycle_name': 'Cycle 1',
      'reactor_name': 'Reactor 1',
      'mass': 10,
      'target_start_date': '2023-01-01',
      'expiration_date': '2023-12-31',
      'is_enabled': true
    }];
    component.archivedName.setValue('TestName');

    component.closePopup();
    expect(component.archivedReactorCycles).toEqual([]);
    expect(component.archivedCurrentPage).toBe(1);
    expect(component.archivedLinks).toEqual([]);
    expect(component.archivedName.value).toBe('');
    expect(component.showArchivedReactorCyclesPopup).toBe(false);
  });

  it('should set ArchivedReactorCycle data and pagination info on successful API response', () => {
    const req1 = httpTestingController.expectOne(environment.apiUrl + AppRoutes.REACTOR_CYCLE);
    expect(req1.request.method).toEqual('GET');

    const mockResponse = {
      'reactor-cycles': {
        'data': [{
          'id': 1,
          'cycle_name': 'Cycle 1',
          'reactor_name': 'Reactor 1',
          'mass': 10,
          'target_start_date': '2023-01-01',
          'expiration_date': '2023-12-31',
          'is_enabled': true
        }],
        'current_page': 1,
        'links': []
      }
    };
    component.archivedName.setValue('Cycle');
    
    component.goToArchivedPage(environment.apiUrl + AppRoutes.REACTOR_CYCLE + '/archived');

    const req = httpTestingController.expectOne(environment.apiUrl + AppRoutes.REACTOR_CYCLE + '/archived?name=Cycle');
    expect(req.request.method).toEqual('GET');
    req.flush(mockResponse);

    expect(component.archivedReactorCycles.length).toBe(1);
    expect(component.archivedCurrentPage).toBe(1);
  });

  it('should handle 401 unauthorized error response on goToArchivedPage', () => {
    const mockErrorResponse = {
      message: 'Unauthorized'
    };

    spyOn(authService, 'logout').and.callFake(()=>{});

    component.goToArchivedPage(environment.apiUrl + AppRoutes.REACTOR_CYCLE + '/archived');

    const req = httpTestingController.expectOne(environment.apiUrl + AppRoutes.REACTOR_CYCLE + '/archived');
    expect(req.request.method).toEqual('GET');
    req.flush(mockErrorResponse, { status: 401, statusText: 'Unauthorized' });
    
    expect(authService.logout).toHaveBeenCalled();
  });

  it('should handle 404 not found error response on goToArchivedPage', () => {
    const mockErrorResponse = {
      message: 'Not Found'
    };

    spyOn(Swal, 'fire');

    component.goToArchivedPage(environment.apiUrl + AppRoutes.REACTOR_CYCLE + '/archived');

    const req = httpTestingController.expectOne(environment.apiUrl + AppRoutes.REACTOR_CYCLE + '/archived');
    expect(req.request.method).toEqual('GET');
    req.flush(mockErrorResponse, { status: 404, statusText: 'Not Found' });
    
    expect(Swal.fire).toHaveBeenCalledWith('Error', 'No Matching Records Found', 'error');
  });
});
