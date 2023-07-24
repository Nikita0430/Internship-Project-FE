import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class ClinicService {
  clinicDetails: any;

  constructor(private http: HttpClient, private router:Router) { }

  setClinicDetails(clinicDetails: any){
    this.clinicDetails = clinicDetails;
  }

  getClinicDetails(){
    return this.clinicDetails;
  }
}
