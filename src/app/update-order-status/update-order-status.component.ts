import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { LoginuserService } from '../login-user.service';
import { OrderService } from '../order.service';
import { environment } from 'src/environments/environment';
import AppRoutes from '../app.routes';
import Swal from 'sweetalert2';
import { FormControl, FormGroup, Validators } from '@angular/forms';
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
    email: string;
    phone_no: string;
    placed_at: string;
    confirmed_at: string;
    shipped_at: string;
    out_for_delivery_at: string;
    delivered_at: string;
    cancelled_at: string;
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

@Component({
  selector: 'app-update-order-status',
  templateUrl: './update-order-status.component.html',
  styleUrls: ['./update-order-status.component.css'],
  providers: [DatePipe]
})
export class UpdateOrderStatusComponent {
  orderDetails: any;
  orderId: any;
  currentStep: number = 0;
  cancelled: boolean = false;
  statusMap = new Map([
    ['pending', { title: 'Pending', index: 0 }],
    ['confirmed', { title: 'Confirmed', index: 1 }],
    ['shipped', { title: 'Shipped', index: 2 }],
    ['out for delivery', { title: 'Out For Delivery', index: 3 }],
    ['delivered', { title: 'Delivered', index: 4 }],
    ['cancelled', { title: 'Cancelled', index: 5 }],
  ]);

  updateOrderForm = new FormGroup({
    status: new FormControl('', Validators.required),
    dateTime: new FormControl(this.datePipe.transform(new Date(), 'medium'), Validators.required)
  });

  constructor(private http: HttpClient, private activatedRoute: ActivatedRoute, private router: Router, public authService: LoginuserService, private orderService: OrderService, private datePipe: DatePipe) {
  }

  ngOnInit(): void {
    this.orderDetails = null;
    this.currentStep = 0;

    const tokenVal = localStorage.getItem('token');
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${tokenVal}`
    });

    this.orderId = this.activatedRoute.snapshot.paramMap.get('id');
    this.http.get(environment.apiUrl + AppRoutes.ORDER + `/${this.orderId}`, { 'headers': headers })
      .subscribe({
        next: (response) => {
          this.orderDetails = (response as OrderResponse).order;
          this.orderService.setOrderDetails(this.orderDetails);
          if (this.orderDetails.status === 'cancelled') {
            this.cancelled = true;
          } else {
            this.currentStep = this.statusMap.get(this.orderDetails.status)?.index! + 1;
          }
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
  }

  onSubmit() {
    if(this.updateOrderForm.value.status === ''){
      Swal.fire(
        'Error',
        'No status is selected',
        'error'
      )
      return;
    }

    Swal.fire({
      icon: 'info',
      title: 'Loading',
      text: 'Please wait...',
      allowOutsideClick: false,
      showConfirmButton: false,
    });

    const requestBody = {
      status: this.updateOrderForm.value.status,
    }

    const tokenVal = localStorage.getItem('token');
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${tokenVal}`
    });

    this.http.patch(environment.apiUrl + AppRoutes.ORDER + `/${this.orderId}`, requestBody, { 'headers': headers })
      .subscribe({
        next: () => {
          Swal.fire(
            'Success',
            'Order Status Updated',
            'success'
          );
          this.router.navigate([`view-order/${this.orderId}`]);
        },
        error: (error) => {
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

  transformDateTime(dateInput: string | null) {
    if (!dateInput) {
      return dateInput;
    }
    const utcDate = new Date(dateInput);
    const timeZoneOffset = utcDate.getTimezoneOffset();
    const localDate = new Date(utcDate.getTime() - timeZoneOffset * 60000);
    return this.datePipe.transform(localDate, 'medium');
  }

  getActivatedRoute() {
    return this.activatedRoute;
  }
}
