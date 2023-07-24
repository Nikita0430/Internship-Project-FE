import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component } from '@angular/core';
import { FormGroup, FormControl } from '@angular/forms';
import { Router , ActivatedRoute} from '@angular/router';
import Swal from 'sweetalert2';
import { environment } from 'src/environments/environment';
import AppRoutes from '../app.routes';
import { ClinicService } from '../clinic.service';
import { ClinicFormComponent } from '../clinic-form/clinic-form.component';
import { LoginuserService } from '../login-user.service';

interface ClinicResponse {
  message: string;
  clinic: {
    id: number;
    account_id: string;
    is_enabled: boolean;
    name: string;
    address: string;
    city: string;
    state: string;
    zipcode: string;
    user_id: number;
  }
}

@Component({
  selector: 'app-viewclinic',
  templateUrl: './view-clinic.component.html',
  styleUrls: ['./view-clinic.component.css']
})
export class ViewClinicComponent {
  clinicDetails: any;
  clinicId: any;
  constructor(private http: HttpClient,private activatedRoute:ActivatedRoute, private router: Router, private clinicService: ClinicService, public authService: LoginuserService) { }

  ngOnInit():void {
    const tokenVal = localStorage.getItem('token');
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${tokenVal}`
    });

    this.clinicId = this.activatedRoute.snapshot.paramMap.get('id');
    this.http.get(environment.apiUrl + AppRoutes.CLINIC + `/${this.clinicId}`, { 'headers': headers })
    .subscribe({
      next: (response) => {
        this.clinicDetails = (response as ClinicResponse).clinic;
        this.clinicDetails.is_enabled = this.clinicDetails.is_enabled;
        this.clinicService.setClinicDetails(this.clinicDetails);
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
          this.clinicDetails = null;
          this.clinicService.setClinicDetails(this.clinicDetails);
        }
      }
    });
  }

  updateClinicDetails() {
    this.router.navigate(['/clinic',this.clinicId]);
  }

  deleteClinic() {
    const Id = this.clinicId;
    const tokenVal = localStorage.getItem('token');
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${tokenVal}`
    });
    this.http.delete(environment.apiUrl + AppRoutes.CLINIC + '/' + Id, { 'headers': headers })
      .subscribe({
        next: (response) => {
          Swal.fire(
            'Deleted'
          );
          this.clinicDetails = null;
          this.clinicService.setClinicDetails(this.clinicDetails);
          this.router.navigate(['/manage-clinic']);
        },
        error: (error) => {
          if(error.status === 401) {
            this.authService.logout();
          } else{
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
    const id = this.clinicId;
    const tokenVal = localStorage.getItem('token');
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${tokenVal}`
    });
    const status = !this.clinicDetails.is_enabled
    const body = {
      "is_enabled": status
    }
    this.http.patch(environment.apiUrl + AppRoutes.CLINIC + '/' + id + '/status',body, { 'headers': headers })
      .subscribe({
        next: (response) => {
          this.clinicDetails.is_enabled = !this.clinicDetails.is_enabled;
          this.clinicService.setClinicDetails(this.clinicDetails);
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
            Swal.fire(
              'Error',
              error.error.message,
              'error'
            );
            localStorage.clear();
            this.router.navigate(['/login']);
          }
        }
      });
  }

  getRouter(){
    return this.router;
  }
  getActivatedRoute(){
    return this.activatedRoute ;
  }
}
