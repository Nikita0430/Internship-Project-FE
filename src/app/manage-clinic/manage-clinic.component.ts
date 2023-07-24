import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Component } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Router } from '@angular/router';
import { environment } from 'src/environments/environment';
import AppRoutes from '../app.routes';
import { LoginuserService } from '../login-user.service';
import Swal from 'sweetalert2';

interface Clinic {
  id: number;
  email: string;
  password: string;
  name: string;
  address: string;
  city: string;
  state: string;
  zipcode: string;
}
interface Link {
  url: string;
  label: string;
  active: boolean;

}
@Component({
  selector: 'app-manage-clinic',
  templateUrl: './manage-clinic.component.html',
  styleUrls: ['./manage-clinic.component.css']
})
export class ManageclinicComponent {
  name = new FormControl('');
  link = document.createElement('a');

  clinics: Clinic[];
  currentPage: number;
  lastPage: number;
  prevPageUrl: string;
  nextPageUrl: string;
  links: Link[];
  sortBy: string;
  sortOrder: string;

  constructor(private http: HttpClient, private authService: LoginuserService, private router: Router) {
    this.clinics = [];
    this.currentPage = 1;
    this.lastPage = 1;
    this.prevPageUrl = '';
    this.nextPageUrl = '';
    this.links = [];
    this.sortBy = '';
    this.sortOrder = '';
  }

  ngOnInit(): void {
    this.getList();
  }

  download() {
    const tokenVal = localStorage.getItem('token');
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${tokenVal}`
    });
    let params = new HttpParams();
    if (this.name.value !== '') {
      params = params.set('name', this.name.value!);
    }

    if (this.sortBy !== '') {
      params = params.set('sort_by', this.sortBy);
    }
    if (this.sortOrder !== '') {
      params = params.set('sort_order', this.sortOrder);
    }

    this.http.get(environment.apiUrl + AppRoutes.CLINIC + '/download', { 'headers': headers, responseType: 'blob', 'params': params })
      .subscribe({
        next: (response: any) => {
          const downloadUrl = window.URL.createObjectURL(response);
          this.link.href = downloadUrl;
          this.link.download = 'Clinics.csv';
          this.link.target = '_blank';
          this.link.click();
        },
        error: (error) => {
          if (error.status === 401) {
            this.authService.logout();
          }
        }
      });
  }

  sortList(sortBy: string, sortOrder: string) {
    this.sortBy = sortBy;
    this.sortOrder = sortOrder;
    this.getList();
  }

  resetList() {
    this.name.setValue('');
    this.sortBy = '';
    this.sortOrder = '';
    this.getList();
  }

  getList() {
    this.goToPage(environment.apiUrl + AppRoutes.CLINIC);
  }

  goToPage(pageUrl: string) {
    const tokenVal = localStorage.getItem('token');
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${tokenVal}`
    });

    let params = new HttpParams();
    if (this.name.value !== '') {
      params = params.set('name', this.name.value!);
    }
    if (this.sortBy !== '') {
      params = params.set('sort_by', this.sortBy);
    }
    if (this.sortOrder !== '') {
      params = params.set('sort_order', this.sortOrder);
    }

    this.http.get(pageUrl, { 'headers': headers, 'params': params })
      .subscribe({
        next: (response: any) => {
          this.clinics = response.clinics.data;
          this.currentPage = response.clinics.current_page;
          this.lastPage = response.clinics.last_page;
          this.prevPageUrl = response.clinics.prev_page_url;
          this.nextPageUrl = response.clinics.next_page_url;
          this.links = response.clinics.links;
        },
        error: (error) => {
          if (error.status === 404) {
            this.clinics = [];
            this.currentPage = 1;
            this.lastPage = 1;
            this.prevPageUrl = '';
            this.nextPageUrl = '';
            this.links = [];
            Swal.fire(
              'Error',
              'No Matching Records Found',
              'error'
            );
          } else if (error.status === 401) {
            this.authService.logout();
          }
        }
      });
  }
}
