import { Component } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { ActivatedRoute, Router } from '@angular/router';
import Swal from 'sweetalert2';
import { environment } from 'src/environments/environment';
import AppRoutes from '../app.routes';
import { ReactorCycleService } from '../reactor-cycle.service';
import { LoginuserService } from '../login-user.service';

interface ReactorCycleResponse {
  message: string;
  reactor_cycle: {
    id: number;
    cycle_name: string;
    reactor_name:string;
    mass: string;
    target_start_date: string;
    expiration_date: string;
    is_enabled: boolean;
  }
}
@Component({
  selector: 'app-view-reactor-cycle',
  templateUrl: './view-reactor-cycle.component.html',
  styleUrls: ['./view-reactor-cycle.component.css']
})
export class ViewReactorCycleComponent {
  reactorCycleDetails: any;
  reactorCycleId!: string;

  constructor(private http: HttpClient, private router: Router, private reactorCycleService: ReactorCycleService, private route: ActivatedRoute, public authService: LoginuserService) {

  }

  ngOnInit(): void {
    const tokenVal = localStorage.getItem('token');
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${tokenVal}`
    });

    this.reactorCycleId = this.route.snapshot.params['id'];

    this.http.get(environment.apiUrl + AppRoutes.REACTOR_CYCLE+ `/${this.reactorCycleId}`, { 'headers': headers })
    .subscribe({
      next: (response) => {
        this.reactorCycleDetails = (response as ReactorCycleResponse).reactor_cycle;
        this.reactorCycleDetails.is_enabled = this.reactorCycleDetails.is_enabled;
        this.reactorCycleService.setReactorCycleDetails(this.reactorCycleDetails);
      },
      error: (error) => {
        if(error.status === 401) {
          this.authService.logout();
        } else {
          Swal.fire(
            'Error',
            error.error.message,
            'error'
          );
          this.reactorCycleDetails = null;
          this.reactorCycleService.setReactorCycleDetails(this.reactorCycleDetails);
        }
      }
    });
  }

  updateReactorCycleDetails() {
    this.router.navigate(['/reactor-cycle', this.reactorCycleId]);
  }

  deleteReactorCycle() {
    const tokenVal = localStorage.getItem('token');
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${tokenVal}`
    });
    this.http.delete(environment.apiUrl + AppRoutes.REACTOR_CYCLE + '/' + this.reactorCycleId, { 'headers': headers })
      .subscribe({
        next: (response) => {
          Swal.fire(
            'Deleted',
            'The reactor cycle is deleted.',
            'success'
          );
          this.reactorCycleDetails = null;
          this.reactorCycleService.setReactorCycleDetails(this.reactorCycleDetails);
          this.router.navigate(['/manage-reactor-cycle']);
        },
        error: (error) => {
          if(error.status === 401) {
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

  enable_disable() {
    const tokenVal = localStorage.getItem('token');
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${tokenVal}`
    });
    const body = {
      "is_enabled": !this.reactorCycleDetails.is_enabled
    }
    this.http.patch(environment.apiUrl + AppRoutes.REACTOR_CYCLE + '/' + this.reactorCycleId + '/status',body, { 'headers': headers })
    .subscribe({
      next: (response) => {  
        this.reactorCycleDetails.is_enabled = !this.reactorCycleDetails.is_enabled;
        this.reactorCycleService.setReactorCycleDetails(this.reactorCycleDetails);
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
        }
        else {
          if(error.status === 401) {
            this.authService.logout();
          } else {
            Swal.fire(
              'Error',
              error.error.message,
              'error'
            );
          }
        }
      }
    });
  }

  getRouter(){
    return this.router;
  }

  getActivatedRoute(){
    return this.route;
  }
}