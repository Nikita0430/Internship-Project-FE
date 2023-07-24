import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { environment } from 'src/environments/environment';
import AppRoutes from '../app.routes';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-change-password',
  templateUrl: './change-password.component.html',
  styleUrls: ['./change-password.component.css']
})
export class ChangepasswordComponent {
  token!: string;
  isAttempted: boolean = false;

  ChangePass = new FormGroup({
    password: new FormControl('', Validators.required)

  });
  constructor(public http: HttpClient, private router: Router, private route: ActivatedRoute) {
    route.params.subscribe({
      next: (params: any) => { this.token = params['token']; }
    });
  };

  changepass() {
    if(!this.isFormValid()){
      return;
    }

    const body = {
      "token": this.token,
      "password": this.ChangePass.value.password
    }

    this.http.post(environment.apiUrl + AppRoutes.CHANGE_PASS, body)
    .subscribe({
      next: (response: any) => {
        Swal.fire(
          'Success',
          'Password Changed Successfully!',
          'success'
        )

        this.router.navigate(['/login']);
      },
      error: (err: any) => {
        Swal.fire(
          'Error',
          err.error.message,
          'error'
        )
      }
    });
  }

  getRouter() {
    return this.router;
  }

  isFormValid(){
    return this.ChangePass.valid;
  }
}
