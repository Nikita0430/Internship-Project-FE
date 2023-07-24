import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component } from '@angular/core';
import { ViewChild } from '@angular/core';
import { CalendarMonthViewComponent, CalendarMonthViewDay } from 'angular-calendar';
import { environment } from 'src/environments/environment';
import { CalendarEvent } from 'angular-calendar';
import { ActivatedRoute, Router } from '@angular/router';
import Swal from 'sweetalert2';
import AppRoutes from '../app.routes';
import { MonthViewDay } from 'calendar-utils';
import { LoginuserService } from '../login-user.service';

interface MyCalendarEvent extends CalendarEvent {
  is_available: boolean;
  date: Date;
  isAvailable: boolean;
}
@Component({
  selector: 'app-calendar',
  templateUrl: './calendar.component.html',
  styleUrls: ['./calendar.component.css']
})
export class CalendarComponent {
  selectedReactor: string;
  showOptions: boolean;
  reactors!: string[];
  events: MyCalendarEvent[] = [];

  month: string = (new Date().getMonth() + 1).toString();
  selectedYear: string = new Date().getFullYear().toString();
  years: number[];
  viewClinicId: any;

  ngOnInit(): void {
    const tokenVal = localStorage.getItem('token');
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${tokenVal}`
    });
    this.http.get(environment.apiUrl + AppRoutes.REACTOR, { 'headers': headers })
      .subscribe({
        next: (response: any) => {
          this.reactors = response.reactors;
          this.selectedReactor = this.reactors[0];
          this.onSubmit();
        },
        error: (error: any) => {
          if (error.status === 401) {
            this.authService.logout();
          } else {
            Swal.fire(
              'Error',
              error.error.message,
              'error'
            );
          }
        }
      });
  };

  @ViewChild('calendarView') calendarView!: CalendarMonthViewComponent;
  viewDate: Date = new Date();

  constructor(private http: HttpClient, private activatedRoute: ActivatedRoute, private router: Router, private authService: LoginuserService) {
    const startYear = 2001;
    const endYear = 2100;
    this.years = Array.from({ length: endYear - startYear + 1 }, (v, i) => startYear + i);
    this.selectedReactor = '';
    this.showOptions = false;
  }

  eventClicked(day: CalendarMonthViewDay): void {
    let event = day.events[0];
    const eventDate = event.start.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }).replace(/ /g, '-');
    const today = new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }).replace(/ /g, '-');
    
    if (event.start <= new Date()) {
      Swal.fire('Error', `Injection Date must be greater than today.`, 'error');
    } else if (event.title === 'Available') {
      this.router.navigate(['/place-order', this.selectedReactor, eventDate]);
    } else {
      Swal.fire('Error', `Please select an available date`, 'error');
    }
  }

  onSubmit() {
    const tokenVal = localStorage.getItem('token');
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${tokenVal}`
    });
    const body = {
      "reactor_name": this.selectedReactor,
      "month": parseInt(this.month),
      "year": parseInt(this.selectedYear)
    };
    this.http.post(environment.apiUrl + AppRoutes.CALENDAR, body, { 'headers': headers })
      .subscribe({
        next: (response: any) => {
          this.viewDate = new Date(response.calendar[0]['date']);
          this.events = response.calendar.map((item: any) => {
            return {
              start: new Date(item.date),
              title: item.is_available ? 'Available' : 'Not Available',
              isAvailable: item.is_available,
            };
          });
        },
        error: (error: any) => {
          if (error.error && error.error.errors) {
            let errorMessages = '';
            for (const key of Object.keys(error.error.errors)) {
              errorMessages += `${key}: ${error.error.errors[key]}<br>`;
            }
            Swal.fire(
              'Error',
              errorMessages,
              'error'
            );
          } else if (error.status === 401) {
            this.authService.logout();
          } else {
            Swal.fire(
              'Error',
              error.error.message,
              'error'
            );
          }
        }
      });
  }

  getActivatedRoutes() {
    return this.activatedRoute;
  }

  getRouter() {
    return this.router;
  }

  getAuthService() {
    return this.authService;
  }
}