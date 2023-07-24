import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { environment } from 'src/environments/environment';
import { RouterTestingModule } from '@angular/router/testing';
import { NO_ERRORS_SCHEMA, NgModule } from '@angular/core';
import { CalendarEvent, CalendarMonthViewComponent, CalendarMonthViewDay } from 'angular-calendar';
import { CalendarComponent } from './calendar.component';
import { HttpClient } from '@angular/common/http';
import { CalendarModule, DateAdapter } from 'angular-calendar';
import { adapterFactory } from 'angular-calendar/date-adapters/date-fns'
import { LoginComponent } from '../login/login.component';
import AppRoutes from '../app.routes';
import Swal from 'sweetalert2';
import { ActivatedRoute, Router } from '@angular/router';

describe('CalendarComponent', () => {
  let component: CalendarComponent;
  let fixture: ComponentFixture<CalendarComponent>;
  let httpTestingController: HttpTestingController;
  let httpClient: HttpClient;
  let router: Router;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [CalendarComponent, CalendarMonthViewComponent],
      imports: [RouterTestingModule.withRoutes([
        {
          path: 'login',
          component: LoginComponent
        }]), HttpClientTestingModule, CalendarModule.forRoot({
          provide: DateAdapter,
          useFactory: adapterFactory,
        }),],
      schemas: [NO_ERRORS_SCHEMA]
    })
      .compileComponents();

    fixture = TestBed.createComponent(CalendarComponent);
    component = fixture.componentInstance;
    httpTestingController = TestBed.inject(HttpTestingController);
    httpClient = TestBed.inject(HttpClient);
    router = TestBed.inject(Router);
    fixture.detectChanges();
  });

  it('should fetch the list of reactors', () => {
    const mockResponse = { reactors: ['reactor1', 'reactor2', 'reactor3'] };
    const req = httpTestingController.expectOne(`${environment.apiUrl}${AppRoutes.REACTOR}`);
    expect(req.request.method).toEqual('GET');
    req.flush(mockResponse);
    expect(component.reactors).toEqual(mockResponse.reactors);
  });

  it('should initialize component properties', () => {
    const startYear = 2001;
    const endYear = 2100;
    expect(component.years).toEqual(Array.from({ length: endYear - startYear + 1 }, (v, i) => startYear + i));
    expect(component.selectedReactor).toEqual('');
    expect(component.showOptions).toBeFalse();
    expect(component.viewDate.toISOString()).toEqual(component.viewDate.toISOString());
    expect(component.calendarView).toBeInstanceOf(CalendarMonthViewComponent);
  });

  it('should navigate to place-order when event is available', () => {
    const today = new Date();
    const event: CalendarEvent = {
      start: new Date(today.setDate(today.getDate() + 1)),
      title: 'Available',
    };
    const day: CalendarMonthViewDay<any> = {
      date: new Date(today.setDate(today.getDate() + 1)),
      events: [event],
      inMonth: true,
      badgeTotal: 0,
      day: 14,
      isPast: false,
      isToday: false,
      isFuture: true,
      isWeekend: false,
    };
    spyOn(component.getRouter(), 'navigate').and.stub();
    component.eventClicked(day);
    const eventDate = event.start.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }).replace(/ /g, '-');
    expect(component.getRouter().navigate).toHaveBeenCalledWith(['/place-order', component.selectedReactor, eventDate]);
  });

  it('should display error message when event title is not "Available"', () => {
    const today = new Date();
    const event: CalendarEvent = {
      start: new Date(today.setDate(today.getDate() + 1)),
      title: 'Not Available',
    };
    const day: CalendarMonthViewDay<any> = {
      date: new Date(today.setDate(today.getDate() + 1)),
      events: [event],
      inMonth: true,
      badgeTotal: 0,
      day: 14,
      isPast: true,
      isToday: false,
      isFuture: false,
      isWeekend: false,
    };
    spyOn(component.getRouter(), 'navigate').and.stub();
    spyOn(Swal, 'fire').and.stub();
    component.eventClicked(day);

    expect(Swal.fire).toHaveBeenCalledWith('Error', 'Please select an available date', 'error');
    expect(router.navigate).not.toHaveBeenCalled();
  });
  
  it('should show error if event date is in the past', () => {
    const event: CalendarEvent = {
      start: new Date('14-Jan-2023'),
      title: 'Available',
    };
    const day: CalendarMonthViewDay<any> = {
      date: new Date('14-Jan-2023'),
      events: [event],
      inMonth: true,
      badgeTotal: 0,
      day: 14,
      isPast: true,
      isToday: false,
      isFuture: false,
      isWeekend: false,
    };
    spyOn(component.getRouter(), 'navigate').and.stub();
    spyOn(Swal, 'fire').and.stub();
    component.eventClicked(day);
    expect(Swal.fire).toHaveBeenCalledWith('Error', `Injection Date must be greater than today.`, 'error');
    expect(component.getRouter().navigate).not.toHaveBeenCalled();
  });

  it('should return activated route', () => {
    const activatedRoute = component.getActivatedRoutes();
    expect(activatedRoute).toBeTruthy();
    expect(activatedRoute instanceof ActivatedRoute).toBeTrue();
  });

  it('should make a POST request and update viewDate and events', () => {
    const tokenVal = 'dummyToken';
    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${tokenVal}`
    };
    const response = {
      calendar: [
        {
          date: '2023-04-28',
          is_available: true
        },
        {
          date: '2023-04-29',
          is_available: false
        }
      ]
    };
    const body = {
      "reactor_name": "reactor1",
      "month": 4,
      "year": 2023
    };
    spyOn(localStorage, 'getItem').and.returnValue(tokenVal);
    component.selectedReactor = 'reactor1';
    component.month = '4';
    component.selectedYear = '2023';
    component.onSubmit();
    const req = httpTestingController.expectOne(environment.apiUrl + AppRoutes.CALENDAR);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(body);
    req.flush(response, { status: 200, statusText: 'Success' })
    const spyAlert = spyOn(Swal, 'fire');
    expect(localStorage.getItem).toHaveBeenCalledWith('token');
    expect(component.viewDate).toEqual(new Date(response.calendar[0]['date']));
  });

  it('should alert error when failed to find calendar for reactor', () => {
    component.selectedReactor = 'rector1';
    component.month = '4';
    component.selectedYear = '2023';
    component.onSubmit();
    const spyAlert = spyOn(Swal, 'fire');
    const mockResponse = {
      message: "Validation Failed",
      errors: {
        reactor_name: [
          "The reactor_name field is required."
        ]
      }
    };
    const req = httpTestingController.expectOne(environment.apiUrl + AppRoutes.CALENDAR);
    expect(req.request.method).toEqual('POST');
    req.flush(mockResponse, { status: 422, statusText: 'Unprocessable Content' });
    expect(spyAlert).toHaveBeenCalledWith('Error',
      "reactor_name: The reactor_name field is required.<br>",
      'error');
  });

  it('should logout if unauthorised person is accessing the calendar', () => {
    const tokenVal = 'dummyToken';
    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${tokenVal}`
    };
    const response = {
      calendar: [
        {
          date: '2023-04-28',
          is_available: true
        },
        {
          date: '2023-04-29',
          is_available: false
        }
      ]
    };
    const body = {
      "reactor_name": "reactor1",
      "month": 4,
      "year": 2023
    };
    spyOn(localStorage, 'getItem').and.returnValue(tokenVal);
    spyOn(component.getAuthService(),'logout');
    component.onSubmit();
    const req = httpTestingController.expectOne(environment.apiUrl + AppRoutes.CALENDAR);
    expect(req.request.method).toBe('POST');
    req.flush(response, { status: 401, statusText: 'Unauthorized' });
    expect(component.getAuthService().logout).toHaveBeenCalled();
  });

  it('should show error while accessing the calendar', () => {
    const tokenVal = 'dummyToken';
    const response = {
      message: 'errorMessage',
    };
    spyOn(localStorage, 'getItem').and.returnValue(tokenVal);
    spyOn(Swal,'fire');
    component.onSubmit();
    const req = httpTestingController.expectOne(environment.apiUrl + AppRoutes.CALENDAR);
    expect(req.request.method).toBe('POST');
    req.flush(response, { status: 400, statusText: 'Bad Request' });
    expect(Swal.fire).toHaveBeenCalledWith(
      'Error',
      'errorMessage',
      'error'
    );
  });

  it('should logout if unauthorised person is accessing the reactor list', () => {
    httpTestingController.expectOne(environment.apiUrl + AppRoutes.REACTOR);
    const tokenVal = 'dummyToken';
    const response = {
      message: 'errorMessage',
    };
    spyOn(localStorage, 'getItem').and.returnValue(tokenVal);
    spyOn(component.getAuthService(),'logout');
    component.ngOnInit();
    const req = httpTestingController.expectOne(environment.apiUrl + AppRoutes.REACTOR);
    expect(req.request.method).toBe('GET');
    req.flush(response, { status: 401, statusText: 'Unauthorized' });
    expect(component.getAuthService().logout).toHaveBeenCalled();
  });

  it('should show error while accessing the calendar', () => {
    httpTestingController.expectOne(environment.apiUrl + AppRoutes.REACTOR);
    const tokenVal = 'dummyToken';
    const response = {
      message: 'errorMessage',
    };
    spyOn(localStorage, 'getItem').and.returnValue(tokenVal);
    spyOn(Swal,'fire');
    component.ngOnInit();
    const req = httpTestingController.expectOne(environment.apiUrl + AppRoutes.REACTOR);
    expect(req.request.method).toBe('GET');
    req.flush(response, { status: 400, statusText: 'Bad Request' });
    expect(Swal.fire).toHaveBeenCalledWith(
      'Error',
      'errorMessage',
      'error'
    );
  });
});