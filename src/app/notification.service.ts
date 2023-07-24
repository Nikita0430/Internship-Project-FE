import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, interval } from 'rxjs';
import { startWith, switchMap } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import AppRoutes from './app.routes';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {

  constructor(private http:HttpClient) { }

  getNotifications(): Observable<any> {
    return interval(5000).pipe(
      startWith(0),
      switchMap(() => {
        const tokenVal = localStorage.getItem('token');
        const headers = new HttpHeaders({
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${tokenVal}`
        });
        return this.http.get(environment.apiUrl + AppRoutes.NOTIFICATION, {'headers': headers});
      })
    );
  }
}
