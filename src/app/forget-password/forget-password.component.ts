import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { FormControl, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router} from '@angular/router';
import { environment } from 'src/environments/environment';
import AppRoutes from '../app.routes';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-forget-password',
  templateUrl: './forget-password.component.html',
  styleUrls: ['./forget-password.component.css']
})

export class ForgetpasswordComponent {
  isAttempted: boolean=false;
  FrgtPass = new FormGroup({
      email : new FormControl('', [Validators.required,Validators.email])
  });

  constructor(public http:HttpClient, private router: Router){ };
  
  frgtpass(){
    this.isAttempted=true;

    if(!this.isFormValid()){
      return;
    }

    Swal.fire({
      icon: 'info',
      title: 'Loading',
      text: 'Please wait...',
      allowOutsideClick: false,
      showConfirmButton: false,
    });

    const body={
      "email" : this.FrgtPass.value.email
    }
    
    return this.http.post(environment.apiUrl+AppRoutes.FORGOT_PASS,body)
    .subscribe({
      next: (response:any) => {
        Swal.fire('Success', 'Check Your Email.');
        this.router.navigate(['/login']);
        
      },
      error:(err:any) => {
        Swal.fire('Error', 'Invalid Email');
      }
    });
  }

  isFormValid(){
    return this.FrgtPass.valid;
  }
}
