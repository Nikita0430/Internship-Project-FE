import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { NotificationService } from './notification.service';
import { environment } from 'src/environments/environment';
import AppRoutes from './app.routes';

describe('NotificationService', () => {
  let service: NotificationService;
  let httpTestingController: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [NotificationService],
    });
    service = TestBed.inject(NotificationService);
    httpTestingController = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTestingController.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should get notifications every 5 seconds', () => {
    const mockResponse = { notifications: [] };

    service.getNotifications().subscribe(response => {
      expect(response).toEqual(mockResponse);
    });

    const req = httpTestingController.expectOne(environment.apiUrl + AppRoutes.NOTIFICATION);
    expect(req.request.method).toEqual('GET');
    req.flush(mockResponse);
    httpTestingController.verify();

    // wait 5 seconds and make sure another request is made
    setTimeout(() => {
      const req2 = httpTestingController.expectOne(environment.apiUrl + AppRoutes.NOTIFICATION);
      expect(req2.request.method).toEqual('GET');
      req2.flush(mockResponse);
      httpTestingController.verify();
    }, 5000);
  });
});
