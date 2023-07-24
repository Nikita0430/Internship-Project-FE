import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Component } from '@angular/core';
import { FormControl } from '@angular/forms';
import { environment } from 'src/environments/environment';
import AppRoutes from '../app.routes';
import Swal from 'sweetalert2';
import { LoginuserService } from '../login-user.service';
import { Router } from '@angular/router';
import { DatePipe } from '@angular/common';

interface ReactorCycle {
    id: number;
    cycle_name: string;
    reactor_name: string;
    mass: number;
    target_start_date: string;
    expiration_date: string;
    is_enabled: boolean;
}

interface Link {
  url: string;
  label: string;
  active: boolean;
}

@Component({
  selector: 'app-manage-reactor-cycle',
  templateUrl: './manage-reactor-cycle.component.html',
  styleUrls: ['./manage-reactor-cycle.component.css'],
  providers: [DatePipe]
})
export class ManageReactorCycleComponent {
  name = new FormControl('');

  reactorCycles: ReactorCycle[];
  currentPage: number;
  lastPage: number;
  prevPageUrl: string;
  nextPageUrl: string;
  links: Link[];
  sortBy: string;
  sortOrder: string;

  showArchivedReactorCyclesPopup: boolean = false;
  archivedName = new FormControl('');
  archivedReactorCycles: ReactorCycle[];
  archivedCurrentPage: number;
  archivedLinks: Link[];

  constructor(private http: HttpClient, private authService: LoginuserService, private router: Router, private datePipe: DatePipe){
    this.reactorCycles = [];
    this.currentPage = 1;
    this.lastPage = 1;
    this.prevPageUrl = '';
    this.nextPageUrl = '';
    this.links = [];
    this.sortBy = '';
    this.sortOrder = '';

    this.archivedReactorCycles = [];
    this.archivedCurrentPage = 1;
    this.archivedLinks = [];
  }

  ngOnInit(): void {
    this.getList();
  }

  sortList(sortBy: string, sortOrder: string){
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

  getList(){
    this.goToPage(environment.apiUrl + AppRoutes.REACTOR_CYCLE);
  }

  goToPage(pageUrl: string) {
    const tokenVal = localStorage.getItem('token');
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${tokenVal}`
    });

    let params = new HttpParams();
    if(this.name.value!==''){
      params = params.set('name', this.name.value!);
    }
    if (this.sortBy !== '') {
      params = params.set('sort_by', this.sortBy);
    }
    if (this.sortOrder !== '') {
      params = params.set('sort_order', this.sortOrder);
    }

    this.http.get(pageUrl, { 'headers': headers, 'params': params})
    .subscribe({
      next: (response: any) => {
        this.reactorCycles = response['reactor-cycles'].data;
        this.currentPage = response['reactor-cycles'].current_page;
        this.lastPage = response['reactor-cycles'].last_page;
        this.prevPageUrl = response['reactor-cycles'].prev_page_url;
        this.nextPageUrl = response['reactor-cycles'].next_page_url;
        this.links = response['reactor-cycles'].links;
      },
      error: (error) => {
        if(error.status==404)
        {
          this.reactorCycles = [];
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
        } else if(error.status==401){
          this.authService.logout();
        }
      }
    });
  }

  openArchivedReactorCyclesPopup() {
    this.showArchivedReactorCyclesPopup = true;
    this.getArchivedList();
  }

  getArchivedList() {
    this.goToArchivedPage(environment.apiUrl + AppRoutes.REACTOR_CYCLE + '/archived');
  }
  
  resetArchivedList() {
    this.archivedName.setValue('');
    this.goToArchivedPage(environment.apiUrl + AppRoutes.REACTOR_CYCLE + '/archived');
  }
  
  goToArchivedPage(pageUrl: string) {
    const tokenVal = localStorage.getItem('token');
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${tokenVal}`
    });
  
    let params = new HttpParams();
    if (this.archivedName.value !== '') {
      params = params.set('name', this.archivedName.value!);
    }
  
    this.http.get(pageUrl, { 'headers': headers, 'params': params })
      .subscribe({
        next: (response: any) => {
          this.archivedReactorCycles = response['reactor-cycles'].data;
          this.archivedCurrentPage = response['reactor-cycles'].current_page;
          this.archivedLinks = response['reactor-cycles'].links;
        },
        error: (error: any) => {
          if(error.status==404)
          {
            this.archivedReactorCycles = [];
            this.archivedCurrentPage = 1;
            this.archivedLinks = [];
            Swal.fire(
              'Error',
              'No Matching Records Found',
              'error'
            );
          } else if(error.status==401){
            this.authService.logout();
          }
        }
      });
  }

  closePopup() {
    this.archivedReactorCycles = [];
    this.archivedCurrentPage = 1;
    this.archivedLinks = [];
    this.showArchivedReactorCyclesPopup = false;
    this.archivedName.setValue('');
  }

  transformDate(date: Date | string) {
    return this.datePipe.transform(date, 'mediumDate');
  }
}
