import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { OrderService } from '../order.service';
import { HttpParams } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { LoginuserService } from '../login-user.service';
import AppRoutes from '../app.routes';
import Swal from 'sweetalert2';
import { DatePipe } from '@angular/common';

interface OrderResponse {
  message: string;
  order: {
    order_id: number;
    clinic_id: number;
    clinic_name: string;
    account_id: string;
    address: string;
    city: string;
    state: string;
    zipcode: string;
    reactor_id: number;
    reactor_name: string;
    reactor_cycle_id: number;
    email: string;
    phone_no: string;
    placed_at: string;
    shipped_at: string;
    out_for_delivery_at: string;
    delivered_at: string;
    injection_date: string;
    dog_name: string;
    dog_breed: string;
    dog_age: number;
    dog_weight: number;
    dog_gender: string;
    no_of_elbows: number;
    total_dosage: number;
    status: string;
  };
}

interface ReactorCycle {
  id: number;
  expiration_date: string;
  is_enabled: boolean
  mass: number;
  name: string;
  reactor_id: number;
  target_start_date: string;
}

@Component({
  selector: 'app-view-order',
  templateUrl: './view-order.component.html',
  styleUrls: ['./view-order.component.css'],
  providers: [DatePipe]
})
export class ViewOrderComponent {
  orderDetails: any;
  orderId: any;
  currentStep: number = 0;
  reactorCycleList: ReactorCycle[] = [];
  reactorCycleID!: number;
  cancelled: boolean = false;
  statusMap = new Map([
    ['pending', { title: 'Pending', index: 0 }],
    ['confirmed', { title: 'Confirmed', index: 1 }],
    ['shipped', { title: 'Shipped', index: 2 }],
    ['out for delivery', { title: 'Out For Delivery', index: 3 }],
    ['delivered', { title: 'Delivered', index: 4 }],
    ['cancelled', { title: 'Cancelled', index: 5 }],
  ]);

  constructor(private http: HttpClient, private activatedRoute: ActivatedRoute, private router: Router, public authService: LoginuserService, public orderService: OrderService, private datePipe: DatePipe) { }

  ngOnInit(): void {
    const tokenVal = localStorage.getItem('token');
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${tokenVal}`
    });

    this.activatedRoute.params.subscribe(params => {
      this.orderId = params['id'];
      this.http.get(environment.apiUrl + AppRoutes.ORDER + `/${this.orderId}`, { 'headers': headers })
        .subscribe({
          next: (response) => {
            this.orderDetails = (response as OrderResponse).order;
            this.orderService.setOrderDetails(this.orderDetails);
            this.reactorCycleID = this.orderDetails.reactor_cycle_id;
            if (this.orderDetails.status === 'cancelled') {
              this.cancelled = true;
            } else {
              this.currentStep = this.statusMap.get(this.orderDetails.status)?.index! + 1;
            }

            this.getReactorCycle();
          },
          error: (error) => {
            if (error.status === 401) {
              this.authService.logout();
            } else {
              Swal.fire(
                'Error',
                error.error.message,
                'error'
              );
              this.orderDetails = null;
              this.orderService.setOrderDetails(this.orderDetails);
            }
          }
        });
    });
  }

  getReactorCycle() {
    const tokenVal = localStorage.getItem('token');
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${tokenVal}`
    });
    let params = new HttpParams();
    params = params.set('reactor_name', this.orderDetails.reactor_name);
    params = params.set('injection_date', this.orderDetails.injection_date);
    params = params.set('order_id', this.orderDetails.order_id);

    this.http.get(environment.apiUrl + AppRoutes.REACTOR_CYCLE + '/avail', { 'params': params, 'headers': headers })
      .subscribe({
        next: (response: any) => {
          this.reactorCycleList = response['reactor-cycles'];
        },
        error: (error: any) => {
          if (error.status === 400) {
            Swal.fire(
              'Error'
            );
          } else if (error.status === 401) {
            this.authService.logout();
          }
        }
      });
  }

  transformDate(date: string) {
    return this.datePipe.transform(date, 'mediumDate');
  }

  transformDateTime(dateInput: string | null) {
    if (!dateInput) {
      return dateInput;
    }
    const utcDate = new Date(dateInput);
    const timeZoneOffset = utcDate.getTimezoneOffset();
    const localDate = new Date(utcDate.getTime() - timeZoneOffset * 60000);
    return this.datePipe.transform(localDate, 'medium');
  }
}