import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { AppComponent } from './app.component';
import { HttpClientModule } from '@angular/common/http';
import { LoginuserService } from './login-user.service';
import { NotificationsComponent } from './notifications/notifications.component';

describe('AppComponent', () => {
  let component: AppComponent;
  let fixture: ComponentFixture<AppComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        RouterTestingModule, HttpClientModule, 
      ],
      declarations: [
        AppComponent,
        NotificationsComponent
      ],
      providers: [LoginuserService],
    }).compileComponents();

    fixture = TestBed.createComponent(AppComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the app', () => {
    expect(component).toBeTruthy();
  });

  it(`should have as title 'webociti'`, () => {
    expect(component.title).toEqual('webociti');
  });

  it('should get login service', () => {
    expect(component.getLoginService()).toBeInstanceOf(LoginuserService);
  })
});
