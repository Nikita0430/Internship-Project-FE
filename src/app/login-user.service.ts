import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { catchError, tap, throwError } from 'rxjs';
import { environment } from 'src/environments/environment';
import Routes from './app.routes';
import AppRoutes from './app.routes';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class LoginuserService {
  constructor(private http:HttpClient, private router:Router) { }

  login(email:string , password:string, rememberme:boolean){
    const body={
      "email" : email,
      "password" : password,
      "remember_me" : rememberme
    }

    return this.http.post(environment.apiUrl + AppRoutes.LOGIN,body)
    .pipe(
      tap((response: any) => {
        localStorage.setItem('email',response.user.email);
        localStorage.setItem('token', response.token);
        localStorage.setItem('role', response.user.role);
        localStorage.setItem('username', response.user.clinic?.name ? response.user.clinic.name : 'Admin');
      })
    );
  }

  getLoggedInUsername(){
    return localStorage.getItem('username')!;
  }

  isLoggedIn(){
    if(localStorage.getItem('email')){
      return true;
    } else {
      return false;
    }
  }

  isAdmin(){
    if(localStorage.getItem('role') === 'admin'){
      return true;
    } else {
      return false;
    }
  }

  logout() {
    const tokenVal = localStorage.getItem('token');
    
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${tokenVal}`
    });
    localStorage.clear();

    this.http.post(environment.apiUrl + AppRoutes.LOGOUT, {'headers': headers})
    .subscribe({
      next: (response) => {
        this.router.navigate(['/login']);
      },
      error: (err: any) => {
        this.router.navigate(['/login']);
      }
    });
  }

  getRouter(){
    return this.router;
  }
}
