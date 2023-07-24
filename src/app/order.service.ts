import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class OrderService {
  orderDetails: any;

  constructor(private http: HttpClient, private router:Router) { }

  setOrderDetails(orderDetails: any){
    this.orderDetails = orderDetails;
  }

  getOrderDetails(){
    return this.orderDetails;
  }
}
