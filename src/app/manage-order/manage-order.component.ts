import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { environment } from 'src/environments/environment';
import AppRoutes from '../app.routes';
import Swal from 'sweetalert2';
import { LoginuserService } from '../login-user.service';
import { FormControl } from '@angular/forms';
import { DatePipe } from '@angular/common';

interface Link {
  url: string;
  label: string;
  active: boolean;
}

@Component({
  selector: 'app-manage-order',
  templateUrl: './manage-order.component.html',
  styleUrls: ['./manage-order.component.css'],
  providers: [DatePipe]
})
export class ManageOrderComponent {
  link = document.createElement('a');
  search = new FormControl('');
  isAdmin: boolean = true;
  orderList:any = [];
  currentPage: number;
  lastPage: number;
  prevPageUrl: string;
  nextPageUrl: string;
  links: Link[];
  sortBy: string;
  sortOrder: string;
  selectedOrders: number[] = [];
  selectedOrdersStatus: string[] = [];
  selectedStatus = new FormControl('');
  status: string[] = ['pending', 'confirmed', 'shipped', 'out for delivery', 'delivered', 'cancelled'];
  statusMap = new Map([
    ['pending', { title: 'Pending', index: 0 }],
    ['confirmed', { title: 'Confirmed', index: 1 }],
    ['shipped', { title: 'Shipped', index: 2 }],
    ['out for delivery', { title: 'Out For Delivery', index: 3 }],
    ['delivered', { title: 'Delivered', index: 4 }],
    ['cancelled', { title: 'Cancelled', index: 5 }],
  ]);

  constructor(private http: HttpClient, public authService: LoginuserService, private router: Router, private datePipe: DatePipe) {
    this.orderList = [];
    this.currentPage = 1;
    this.lastPage = 1;
    this.prevPageUrl = '';
    this.nextPageUrl = '';
    this.links = [];
    this.sortBy = '';
    this.sortOrder = '';
  }

  ngOnInit(): void {
    this.getList();
  }

  download() {
    const tokenVal = localStorage.getItem('token');
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${tokenVal}`
    });
    let params = new HttpParams();
    if (this.search.value !== '') {
      params = params.set('search', this.search.value!);
    }
    if (this.sortBy !== '') {
      params = params.set('sort_by', this.sortBy);
    }
    if (this.sortOrder !== '') {
      params = params.set('sort_order', this.sortOrder);
    }

    this.http.get(environment.apiUrl + AppRoutes.ORDER + '/download', { 'headers': headers, responseType: 'blob', 'params': params })
      .subscribe({
        next: (response: any) => {
          const downloadUrl = window.URL.createObjectURL(response);
          this.link.href = downloadUrl;
          this.link.download = 'orders.csv';
          this.link.target = '_blank';
          this.link.click();
        },
        error: (error) => {
          if (error.status === 401) {
            this.authService.logout();
          }
        }
      });
  }

  sortList(sortBy: string, sortOrder: string) {
    this.sortBy = sortBy;
    this.sortOrder = sortOrder;
    this.getList();
  }

  resetList() {
    this.search.setValue('');
    this.sortBy = '';
    this.sortOrder = '';
    this.getList();
    this.disSelectAll();
    this.selectedStatus.setValue('');
  }

  getList() {
    this.goToPage(environment.apiUrl + AppRoutes.ORDER);
  }

  goToPage(pageUrl: string) {
    const tokenVal = localStorage.getItem('token');
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${tokenVal}`
    });

    let params = new HttpParams();
    if (this.search.value !== '') {
      params = params.set('search', this.search.value!);
    }
    if (this.sortBy !== '') {
      params = params.set('sort_by', this.sortBy);
    }
    if (this.sortOrder !== '') {
      params = params.set('sort_order', this.sortOrder);
    }

    this.http.get(pageUrl, { 'headers': headers, 'params': params })
      .subscribe({
        next: (response: any) => {
          this.orderList = response.orders.data;
          this.currentPage = response.orders.current_page;
          this.lastPage = response.orders.last_page;
          this.prevPageUrl = response.orders.prev_page_url;
          this.nextPageUrl = response.orders.next_page_url;
          this.links = response.orders.links;
        },
        error: (error) => {
          if (error.status === 404) {
            this.orderList = [];
            this.currentPage = 1;
            this.lastPage = 1;
            this.prevPageUrl = '';
            this.nextPageUrl = '';
            this.links = [];
            Swal.fire(
              'Error',
              'No Matching Records Found',
              'error'
            );
          } else if (error.status === 401) {
            this.authService.logout();
          }
        }
      });
  }

  updateOrderStatus() {
    if(this.selectedStatus.value === ''){
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

    const tokenVal = localStorage.getItem('token');
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${tokenVal}`
    });

    const requestBody = {
      'orders': this.selectedOrders,
      'status': this.selectedStatus.value
    }

    this.http.patch(environment.apiUrl + AppRoutes.ORDER + '/bulk', requestBody, { 'headers': headers })
      .subscribe({
        next: (response: any) => {
          this.selectedStatus.setValue('pending');
          this.disSelectAll();
          Swal.fire(
            'Success',
            'Status Updated',
            'success'
          );
          this.getList();
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
          } else if (error.status == 401) {
            this.authService.logout();
          } else {
            this.selectedStatus.setValue('pending');
            this.disSelectAll();
            Swal.fire(
              'Error',
              error.error.message,
              'error'
            );
          } 
        }
      });
  }

  updateSelectedOrders(id: number) {
    if (!this.selectedOrders.includes(id) && this.selectedOrders.length < 10) {
      const orderIndex = this.orderList.findIndex((order:any) => order.order_id === id);
      this.selectedOrders.push(id);
      const status = this.orderList[orderIndex]!.status;
      this.selectedOrdersStatus.push(status);
    } else {
      const index = this.selectedOrders.indexOf(id);
      if (index !== -1) {
        this.selectedOrders.splice(index, 1);
        this.selectedOrdersStatus.splice(index, 1);
      }
    }
  }

  isSelectionValid(status: string){
    for(let stat of this.selectedOrdersStatus){
      if (this.statusMap.get(status)?.index! <= this.statusMap.get(stat)?.index! || this.statusMap.get(stat)?.index===4) {
        if(status === this.selectedStatus.value) {
          this.selectedStatus.setValue('');
        }
        return true;
      }
    }
    return false;
  }

  disSelectAll() {
    this.selectedOrders = [];
  }

  transformDate(date: Date | string) {
    return this.datePipe.transform(date, 'mediumDate');
  }
}
