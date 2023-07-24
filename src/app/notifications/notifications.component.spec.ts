import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NotificationsComponent } from './notifications.component';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { environment } from 'src/environments/environment';
import AppRoutes from '../app.routes';
import { LoginuserService } from '../login-user.service';
import { Router } from '@angular/router';
import { NotificationService } from '../notification.service';
import { of, throwError } from 'rxjs';
import { HttpClient } from '@angular/common/http';

describe('NotificationsComponent', () => {
  let component: NotificationsComponent;
  let fixture: ComponentFixture<NotificationsComponent>;
  let httpTestingController: HttpTestingController;
  let authService: LoginuserService;
  let notificationService: NotificationService;
  let httpClient: HttpClient;
  let router: Router;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [NotificationsComponent],
      imports: [HttpClientTestingModule],
    })
      .compileComponents();

    fixture = TestBed.createComponent(NotificationsComponent);
    component = fixture.componentInstance;
    authService = TestBed.inject(LoginuserService);
    httpTestingController = TestBed.inject(HttpTestingController);
    notificationService = TestBed.inject(NotificationService);
    httpClient = TestBed.inject(HttpClient);
    router = TestBed.inject(Router);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should navigate to order details page with correct orderId', () => {
    const spyObj = spyOn(router, 'navigate');
    const orderId = 123;
    component.navigateToOrderDetails(orderId);
    expect(spyObj).toHaveBeenCalledWith([`/view-order/${orderId}`]);
  });

  it('should retrieve notifications from the server on initialization', () => {
    const notifications = [
      { title: 'Notification 1', description: 'Description 1', time: '2023-05-11T12:00:00Z' },
      { title: 'Notification 2', description: 'Description 2', time: '2023-05-11T11:00:00Z' }
    ];
    spyOn(notificationService, 'getNotifications').and.returnValue(of({
      unread_count: notifications.length,
      notifications: notifications
    }));
    localStorage.setItem('role', 'clinic');
    component.ngOnInit();
    expect(notificationService.getNotifications).toHaveBeenCalled();
    expect(component.notifications).toEqual(notifications.reverse());
    expect(component.unreadCount).toEqual(notifications.length);
  });

  it('should set notifications to an empty array if an error occurs', () => {
    const error = { message: 'Error fetching notifications' };
    spyOn(notificationService, 'getNotifications').and.returnValue(throwError(error));
    component.ngOnInit();
    expect(component.notifications).toEqual([]);
  });

  it('should handle error when PATCH request fails', () => {
    const httpSpy = spyOn(TestBed.inject(HttpClient), 'patch').and.returnValue(throwError('error'));
    const component = fixture.componentInstance;
    component.openNotification();
    expect(httpSpy).toHaveBeenCalled();
    expect(component.isVisible).toBe(true);
  });
  
  it('should toggle isVisible when called', () => {
    localStorage.setItem('token', 'my-token');
    const httpSpy = spyOn(httpClient, 'patch').and.returnValue(of(null));
    expect(component.isVisible).toBe(false);
    component.openNotification();
    expect(httpSpy).toHaveBeenCalledWith(environment.apiUrl + AppRoutes.NOTIFICATION, null, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer my-token'
      }
    });
    expect(component.isVisible).toBe(true);
    component.openNotification();
    expect(httpSpy).toHaveBeenCalledWith(environment.apiUrl + AppRoutes.NOTIFICATION, null, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer my-token'
      }
    });
    expect(component.isVisible).toBe(false);
  });

  it('should set isVisible to false when clicked outside elementRef', () => {
    const mockElementRef = { nativeElement: document.createElement('div') };
    const mockEvent = { target: document.createElement('div') };
    spyOn(mockElementRef.nativeElement, 'contains').and.returnValue(false);
    component.elementRef = mockElementRef;
    component.onClick(mockEvent.target as HTMLElement);
    expect(component.isVisible).toBe(false);
  });

  it('should not call getNotifications if user is admin', () => {
    localStorage.setItem('role', 'admin');
    spyOn(component.getService(), 'getNotifications');
    component.ngOnInit();
    expect(component.getService().getNotifications).not.toHaveBeenCalled();
  });
});
