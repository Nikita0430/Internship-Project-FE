import { Component } from '@angular/core';
import { AbstractControl, FormBuilder, FormControl, FormGroup, ValidatorFn, Validators } from '@angular/forms';
import { ActivatedRoute, Router} from '@angular/router';
import { ReactorCycleService } from '../reactor-cycle.service';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import AppRoutes from '../app.routes';
import Swal from 'sweetalert2';
import { LoginuserService } from '../login-user.service';

@Component({
  selector: 'app-reactor-cycle-form',
  templateUrl: './reactor-cycle-form.component.html',
  styleUrls: ['./reactor-cycle-form.component.css']
})
export class ReactorCycleFormComponent {
  isAttempted: boolean = false;
  reactorCycleForm!: FormGroup;
  reactorCycleId!: number;
  reactorCycleDetails: any;
  today: string = new Date().toISOString().split('T')[0];

  constructor(
    private formBuilder: FormBuilder,
    private route: ActivatedRoute,
    private reactorCycleService: ReactorCycleService,
    public http: HttpClient,
    private router: Router,
    public authService: LoginuserService
  ){
    this.reactorCycleForm = this.formBuilder.group({
      cycle_name: new FormControl('', Validators.required),
      reactor_name: new FormControl('', Validators.required),
      mass: new FormControl(0, Validators.required),
      target_start_date: new FormControl('', Validators.required),
      expiration_date: new FormControl('', Validators.required),
    }, {
        validator: this.startDateBeforeExpirationDateValidator(),
    });
  }

  ngOnInit(){
    this.reactorCycleId = this.route.snapshot.params['id'];
    if(this.reactorCycleId){
      this.reactorCycleDetails = this.reactorCycleService.getReactorCycleDetails();
    } else {
      this.reactorCycleDetails = {
        cycle_name: '',
        reactor_name: '',
        mass: 0,
        target_start_date: '',
        expiration_date: ''
      };
      this.reactorCycleService.setReactorCycleDetails(null);
    }
  }

  onSubmit() {
    this.isAttempted = true;
    if(!this.isFormValid()){
      return;
    }
    if(this.reactorCycleId){
      this.updateReactorCycle();
    } else {
      this.createReactorCycle();
    }
  }

  createReactorCycle() {
    const reactorCycleDetails = {
      cycle_name: this.reactorCycleForm.get('cycle_name')?.value,
      reactor_name: this.reactorCycleForm.get('reactor_name')?.value,
      mass: this.reactorCycleForm.get('mass')?.value,
      target_start_date: this.reactorCycleForm.get('target_start_date')?.value,
      expiration_date: this.reactorCycleForm.get('expiration_date')?.value
    }
    const tokenVal = localStorage.getItem('token');
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${tokenVal}`
    });

    this.http.post(environment.apiUrl + AppRoutes.REACTOR_CYCLE, reactorCycleDetails, { 'headers': headers})
    .subscribe({
      next: (response) => {
        Swal.fire(
          'Successful',
          'You have successfully added a new reactor-cycle!',
          'success'
        );
        this.router.navigate(['/manage-reactor-cycle']);
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
        else if (error.status === 401) {
          this.authService.logout();
        } else {
          Swal.fire(
            'Error',
            error.error.message,
            'error'
          );
        }
      }
    })
  }

  updateReactorCycle() {
    const reactorCycleDetails = {
      cycle_name: this.reactorCycleForm.get('cycle_name')?.value,
      reactor_name: this.reactorCycleForm.get('reactor_name')?.value,
      mass: this.reactorCycleForm.get('mass')?.value,
      target_start_date: this.reactorCycleForm.get('target_start_date')?.value,
      expiration_date: this.reactorCycleForm.get('expiration_date')?.value
    }

    const tokenVal = localStorage.getItem('token');
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${tokenVal}`
    });

    this.http.put(environment.apiUrl + AppRoutes.REACTOR_CYCLE + `/${this.reactorCycleId}`, reactorCycleDetails, { 'headers': headers})
    .subscribe({
      next: (response) => {
        Swal.fire(
          'Successful',
          'You have successfully updated the reactor cycle!',
          'success'
        )
        this.router.navigate(['/view-reactor-cycle',this.reactorCycleId]);
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
        else if (error.status === 401) {
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

  startDateBeforeExpirationDateValidator(): ValidatorFn {
    return (control: AbstractControl): { [key: string]: any } | null => {
      const startDate = control.get('target_start_date')?.value;
      const expirationDate = control.get('expiration_date')?.value;
      
      if (startDate && expirationDate && startDate >= expirationDate) {
        return { 'startDateBeforeExpirationDate': true };
      }
      
      return null;
    };
  }

  getRouter(){
    return this.router;
  }

  getActivatedRoute(){
    return this.route;
  }

  getReactorCycleService(){
    return this.reactorCycleService;
  }

  isFormValid(){
    return this.reactorCycleForm.valid;
  }
}
