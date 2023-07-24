import { Component } from '@angular/core';
import { FormControl,FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { LoginuserService } from '../login-user.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})

export class LoginComponent {
  isAttempted: boolean=false;
  constructor(public aservice: LoginuserService, private router: Router){ };
  LoginForm=new FormGroup({
    email: new FormControl('', [Validators.email,Validators.required]),
    password: new FormControl('', Validators.required),
    rem_me: new FormControl()
  })

  loginUser(){
    this.isAttempted=true;

    if(!this.isFormValid()){
      return;
    }

    this.aservice.login(this.LoginForm.value.email!, this.LoginForm.value.password!, this.LoginForm.value.rem_me)
    .subscribe({
      next: (response:any) => {
        this.router.navigate(["/calendar"]);
      },
      error : (err:any) => {
        Swal.fire("Error", "Login Failed");
      }
    });
  } 

  getRoute(){
    return this.router;
  }
  
  isFormValid(){
    return this.LoginForm.valid;
  }
}

