import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component, ElementRef, HostListener } from '@angular/core';
import { environment } from 'src/environments/environment';
import { LoginuserService } from '../login-user.service';
import { Subscription } from 'rxjs';
import { NotificationService } from '../notification.service';
import { Router } from '@angular/router';
import AppRoutes from '../app.routes';

interface notification {
  title: string;
  description: string;
  time: string;
}

@Component({
  selector: 'app-notifications',
  templateUrl: './notifications.component.html',
  styleUrls: ['./notifications.component.css']
})
export class NotificationsComponent {
  notifications: any = [];
  public subscription!: Subscription;
  isVisible: boolean = false;
  unreadCount: number = 0;

  constructor(private http: HttpClient, public router : Router , public authService: LoginuserService, private notificationService: NotificationService, public elementRef: ElementRef) { }

  ngOnInit(): void {
    if(localStorage.getItem('role') === 'admin') {
      return;
    }
    this.subscription = this.notificationService.getNotifications()
      .subscribe({
        next: (response: any) => {
          this.unreadCount = response.unread_count;
          this.notifications = response.notifications.reverse();
        },
        error: (error: any) => { }
      });
  }

  navigateToOrderDetails(orderId: number) {
    this.isVisible= false;
    this.router.navigate([`/view-order/${orderId}`]);
  }

  openNotification() {
    const tokenVal = localStorage.getItem('token');
    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${tokenVal}`
    };
    this.http.patch(environment.apiUrl + AppRoutes.NOTIFICATION, null, { 'headers': headers })
      .subscribe({
        next: (response: any) => {
        },
        error: (error: any) => { }
      });
      
    this.isVisible = !this.isVisible;
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
  }

  @HostListener('document:click', ['$event.target'])
  onClick(target: HTMLElement) {
    const isClickedInside = this.elementRef.nativeElement.contains(target);
    if (!isClickedInside) {
      this.isVisible = false;
    }
  }

  getService(){
    return this.notificationService;
  }
}