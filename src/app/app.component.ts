import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { LoginuserService } from './login-user.service';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import AppRoutes from './app.routes';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'webociti';

  constructor(private http: HttpClient, private loginService: LoginuserService, private router: Router) { }

  getLoginService() {
    return this.loginService;
  }
}
