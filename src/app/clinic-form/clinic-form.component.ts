import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Component, ElementRef, HostListener } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { environment } from 'src/environments/environment';
import AppRoutes from '../app.routes';
import Swal from 'sweetalert2';
import { ClinicService } from '../clinic.service';
import { LoginuserService } from '../login-user.service';

@Component({
  selector: 'app-clinic-form',
  templateUrl: './clinic-form.component.html',
  styleUrls: ['./clinic-form.component.css']
})
export class ClinicFormComponent {
  isAttempted: boolean = false;
  clinicForm!: FormGroup;
  clinicId!: any;
  clinicDetails: any;
  places: any[] = [];
  autoCompleteVisible: boolean = false;

  constructor(
    public route: ActivatedRoute,
    private formBuilder: FormBuilder,
    public http: HttpClient,
    private router: Router,
    public elementRef: ElementRef,
    public clinicService: ClinicService,
    public authService: LoginuserService) { }

  ngOnInit() {
    this.clinicForm = this.formBuilder.group({
      name: new FormControl('', Validators.required),
      address: new FormControl('', Validators.required),
      city: new FormControl('', Validators.required),
      state: new FormControl('', Validators.required),
      zipcode: new FormControl('', Validators.required),
    });
    this.clinicId = this.route.snapshot.params['id'];
    if (this.clinicId) {
      this.clinicDetails = this.clinicService.getClinicDetails();
    } else {
      this.clinicDetails = {
        email: '',
        password: '',
        name: '',
        address: '',
        city: '',
        state: '',
        zipcode: ''
      };
      this.clinicService.setClinicDetails(null);
      this.clinicForm.addControl('email', this.formBuilder.control('', [Validators.email, Validators.required]));
      this.clinicForm.addControl('password', this.formBuilder.control('', [Validators.required]));
    }
  }

  clinics() {
    this.isAttempted = true;
    if (!this.isFormValid()) {
      return;
    }

    if (this.clinicId) {
      this.updateClinic();
    } else {
      this.createClinic();
    }
  }

  createClinic() {
    const clinicDetails = {
      email: this.clinicForm.value.email,
      password: this.clinicForm.value.password,
      name: this.clinicForm.value.name,
      address: this.clinicForm.value.address,
      city: this.clinicForm.value.city,
      state: this.clinicForm.value.state,
      zipcode: this.clinicForm.value.zipcode,
    }
    const tokenVal = localStorage.getItem('token');
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${tokenVal}`
    });


    this.http.post(environment.apiUrl + AppRoutes.CLINIC, clinicDetails, { 'headers': headers })
      .subscribe({
        next: (response) => {
          Swal.fire(
            'Successful',
            'You have successfully added a new clinic!',
            'success'
          );
          this.router.navigate(['/manage-clinic']);
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
          } else if (error.status === 401) {
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

  updateClinic() {
    const clinicDetails = {
      "name": this.clinicForm.value.name,
      "address": this.clinicForm.value.address,
      "city": this.clinicForm.value.city,
      "state": this.clinicForm.value.state,
      "zipcode": this.clinicForm.value.zipcode,
    }
    const tokenVal = localStorage.getItem('token');
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${tokenVal}`
    });

    this.http.put(environment.apiUrl + AppRoutes.CLINIC + `/${this.clinicId}`, clinicDetails, { 'headers': headers })
      .subscribe({
        next: (response) => {
          Swal.fire(
            'Successful',
            'You have successfully updated the clinic!',
            'success'
          )
          this.clinicForm.reset();
          this.router.navigate(['/view-clinic/' + this.clinicId]);
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

  searchPlaces() {
    let address = this.clinicForm.get('address')?.value;
    if (address.trim() === '') {
      this.places = [];
      return;
    }

    setTimeout(() => {
      if (address === this.clinicForm.value.address) {
        const tokenVal = localStorage.getItem('token');
        const headers = new HttpHeaders({
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${tokenVal}`
        });

        let params = new HttpParams();
        params = params.set('query', this.clinicForm.value.address);
        
        this.http.get(environment.apiUrl + AppRoutes.LOCATIONS, {headers, params})
          .subscribe({
            next: (response: any) => {
              this.autoCompleteVisible = true;
              this.places = response.data;
            },
            error: (error) => {
              this.autoCompleteVisible = false;
            }
          })
      }
    }, 500);
  }

  selectPlace(place: any) {
    this.clinicForm.patchValue({
      city: place.county,
      state: place.region,
      zipcode: place.postal_code
    });
    this.places = [];
    this.autoCompleteVisible = false;
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    const autocompleteElement = this.elementRef.nativeElement.querySelector('.autocomplete-list');

    if (autocompleteElement && !autocompleteElement.contains(event.target)) {
      this.autoCompleteVisible = false;
    }
  }

  getRouter() {
    return this.router;
  }

  getActivatedRoute() {
    return this.route;
  }

  isFormValid() {
    return this.clinicForm.valid;
  }
}
