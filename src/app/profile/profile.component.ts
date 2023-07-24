import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component } from '@angular/core';
import { LoginuserService } from '../login-user.service';
import { Router } from '@angular/router';
import { environment } from 'src/environments/environment';
import AppRoutes from '../app.routes';
import Swal from 'sweetalert2';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

interface ProfileResponse {
  message: string;
  profile: {
    email: string;
    account_id: string;
    name: string;
    address: string;
    city: string;
    state: string;
    zipcode: string;
  }
}

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent {
  isAttempted: boolean = false;
  profileDetails: any;
  userId: any;
  userForm!: FormGroup;
  user: any = {};
  clinicId: any;

  constructor(public http: HttpClient, private router: Router, public authService: LoginuserService, private formBuilder: FormBuilder) { }

  ngOnInit() {
    this.userForm = this.formBuilder.group({
      accountId: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      state: ['', Validators.required],
      city: ['', Validators.required],
      address: ['', Validators.required],
      zipcode: ['', Validators.required],
      name: ['', Validators.required],
      newPassword: [''],
      confirmPassword: [''],
    });

    const tokenVal = localStorage.getItem('token');
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${tokenVal}`
    });

    this.http.get(environment.apiUrl + AppRoutes.PROFILE, { 'headers': headers })
      .subscribe({
        next: (response) => {
          this.profileDetails = (response as ProfileResponse).profile
          this.userForm.patchValue({
            accountId: this.profileDetails.account_id,
            email: this.profileDetails.email,
            state: this.profileDetails.state,
            city: this.profileDetails.city,
            address: this.profileDetails.address,
            zipcode: this.profileDetails.zipcode,
            name: this.profileDetails.name,
          })
        },
        error: (error) => {
          if (error.status == 401) {
            this.authService.logout();
          }
        }
      });
  }

  discardChanges(){
    this.ngOnInit();
  }

  tokenVal = localStorage.getItem('token');
  headers = new HttpHeaders({
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${this.tokenVal}`
  });

  submitForm() {
    this.isAttempted = true;
    if (this.userForm.value.newPassword !== this.userForm.value.confirmPassword) {
      this.userForm.setErrors({passwordMismatch: true});
    }

    if(!this.isFormValid()){
      return;
    }

    var body: any = {
      city: this.userForm.value.city,
      address: this.userForm.value.address,
      state: this.userForm.value.state,
      zipcode: this.userForm.value.zipcode,
      name: this.userForm.value.name,
    }
    if (this.userForm.value.confirmPassword) {
      body['password'] = this.userForm.value.confirmPassword;
    }
    this.http.put(environment.apiUrl + AppRoutes.PROFILE, body, { 'headers': this.headers })
      .subscribe({
        next: (response) => {
          Swal.fire(
            'Successful',
            'You have successfully updated your details!',
            'success'
          );
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
            Swal.fire(
              'Error',
              error.error.message,
              'error'
            );
          }
        }
      });
  }

  isFormValid(){
    return this.userForm.valid;
  }
}
