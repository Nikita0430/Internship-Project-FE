import { Component } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { environment } from 'src/environments/environment';
import { LoginuserService } from '../login-user.service';
import AppRoutes from '../app.routes';
import Swal from 'sweetalert2';
import { DatePipe } from '@angular/common';

interface ReactorCycle {
  id: number;
  expiration_date: string;
  is_enabled: boolean
  mass: number;
  name: string;
  reactor_id: number;
  target_start_date: string;
}
@Component({
  selector: 'app-place-order',
  templateUrl: './place-order.component.html',
  styleUrls: ['./place-order.component.css'],
  providers: [DatePipe]
})

export class PlaceOrderComponent {
  isAttempted: boolean = false;
  isClinicValid: boolean = true;
  placeOrderForm!: FormGroup;
  clinicId!: string;
  selectedReactor!: any;
  injectionDate!: string;
  isAdmin: boolean = true;
  selectedReactorCycle!: number;
  reactorCycleList: ReactorCycle[] = [];
  clinics: string[] = [];

  constructor(public http: HttpClient, public authService: LoginuserService, public route: ActivatedRoute, private formBuilder: FormBuilder, private router: Router, private datePipe: DatePipe) { };

  ngOnInit() {
    this.selectedReactor = this.route.snapshot.paramMap.get('reactor-name');
    var eventDate = new Date(Date.parse(this.route.snapshot.paramMap.get('eventDate')!));
    eventDate.setDate(eventDate.getDate() + 1);
    this.injectionDate = eventDate.toISOString().substring(0, 10);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    this.placeOrderForm = this.formBuilder.group({
      account: new FormControl('', Validators.required),
      clinicName: new FormControl('', Validators.required),
      address: new FormControl('', Validators.required),
      city: new FormControl('', Validators.required),
      state: new FormControl('', Validators.required),
      zipcode: new FormControl('', Validators.required),
      email: new FormControl('', [Validators.required, Validators.email]),
      phone: new FormControl('', Validators.required),
      orderDate: new FormControl(today.toISOString().substring(0, 10), Validators.required),
      shippingDate: new FormControl(tomorrow.toISOString().substring(0, 10), Validators.required),
      dosagePerElbow: new FormControl('', Validators.required),
      totalDosage: new FormControl('', Validators.required),
      injectionDate: new FormControl(this.injectionDate, Validators.required),
      dogName: new FormControl('', Validators.required),
      dogAge: new FormControl('', Validators.required),
      dogBreed: new FormControl('', Validators.required),
      dogWeight: new FormControl('', Validators.required),
      dogGender: new FormControl('', Validators.required),
      numberOfElbow: new FormControl('', Validators.required),
    });

    const tokenVal = localStorage.getItem('token');
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${tokenVal}`
    });

    let params = new HttpParams();
    params = params.set('reactor_name', this.selectedReactor);
    params = params.set('injection_date', this.injectionDate);

    this.http.get(environment.apiUrl + AppRoutes.REACTOR_CYCLE + '/avail', { 'params': params, 'headers': headers })
      .subscribe({
        next: (response: any) => {
          this.reactorCycleList = response['reactor-cycles'];
        },
        error: (error: any) => {
          if (error.status === 400) {
            Swal.fire(
              'Error',
              error.error.message,
              'error'
            );
          } else if (error.status === 401) {
            this.authService.logout();
          }
        }
      })


    if (localStorage.getItem("role") === "clinic") {
      this.isAdmin = false;
      this.clinicDetails();
    }

    this.http.get(environment.apiUrl + AppRoutes.CLINIC + `/dropdown`, { 'headers': headers })
      .subscribe({
        next: (response: any) => {
          this.clinics = response;
        }
      });
  };

  calculateTotalDosage() {
    if (this.placeOrderForm.value.numberOfElbow !== '' && this.placeOrderForm.value.dosagePerElbow !== '') {
      const totalDosage = this.placeOrderForm.value.numberOfElbow * this.placeOrderForm.value.dosagePerElbow;
      this.placeOrderForm.patchValue({
        totalDosage: totalDosage.toFixed(2) 
      });
    } else {
      this.placeOrderForm.patchValue({
        totalDosage: ''
      });
    }
  }



  clinicDetails() {
    if (!this.isAdmin && this.placeOrderForm.value.clinicName != '') {
      return;
    }
    const tokenVal = localStorage.getItem('token');
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${tokenVal}`
    });

    const clinicName = this.placeOrderForm.value.clinicName;
    this.http.get(environment.apiUrl + AppRoutes.CLINIC + '/name' + `/${clinicName}`, { headers })
      .subscribe({
        next: (response: any) => {
          this.clinicId = response.clinic.id;
          this.placeOrderForm.patchValue({
            clinicName: response.clinic.name,
            account: response.clinic.account_id,
            address: response.clinic.address,
            city: response.clinic.city,
            state: response.clinic.state,
            zipcode: response.clinic.zipcode,
            email: response.clinic.email,
          });
          this.isClinicValid = true;
        },
        error: (error: any) => {
          if (error.status === 401) {
            this.authService.logout();
          }
          this.isClinicValid = false;
        },
      })
  };

  onSubmit() {
    this.isAttempted = true;
    if (!this.isFormValid()) {
      return;
    }

    if(!this.selectedReactorCycle) {
      Swal.fire(
        'Error',
        'Please select a Reactor Cycle',
        'error'
      );
      return;
    }

    const orderDetails = {
      clinic_id: this.clinicId,
      email: this.placeOrderForm.value.email,
      phone_no: this.placeOrderForm.value.phone,
      injection_date: this.placeOrderForm.value.injectionDate,
      dog_name: this.placeOrderForm.value.dogName,
      dog_breed: this.placeOrderForm.value.dogBreed,
      dog_age: this.placeOrderForm.value.dogAge,
      dog_weight: this.placeOrderForm.value.dogWeight,
      dog_gender: this.placeOrderForm.value.dogGender,
      reactor_name: this.selectedReactor,
      reactor_cycle_id: this.selectedReactorCycle,
      no_of_elbows: this.placeOrderForm.value.numberOfElbow,
      dosage_per_elbow: this.placeOrderForm.value.dosagePerElbow,
    }

    const tokenVal = localStorage.getItem('token');
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${tokenVal}`
    });

    this.http.post(environment.apiUrl + AppRoutes.ORDER, orderDetails, { 'headers': headers })
      .subscribe({
        next: (response) => {
          Swal.fire(
            'Successful',
            'You have successfully placed your order!',
            'success'
          );
          this.router.navigate(['/manage-order']);
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
            );
          } else if (error.status === 400) {
            Swal.fire(
              'Error',
              error.error.message,
              'error'
            );
          } else if (error.status === 401) {
            this.authService.logout();
          }
        }
      });
  }

  isFormValid() {
    return this.placeOrderForm.valid;
  }

  transformDate(date: Date | string) {
    return this.datePipe.transform(date, 'mediumDate');
  }

  getRouter() {
    return this.router;
  }
}
