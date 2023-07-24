import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HttpClientModule } from '@angular/common/http';
import { LoginComponent } from './login/login.component';
import { ForgetpasswordComponent } from './forget-password/forget-password.component';
import { ChangepasswordComponent } from './change-password/change-password.component';
import { ViewClinicComponent } from './view-clinic/view-clinic.component';
import { ManageclinicComponent } from './manage-clinic/manage-clinic.component';
import { ClinicFormComponent } from './clinic-form/clinic-form.component';
import { CalendarComponent } from './calendar/calendar.component';
import { CalendarModule, DateAdapter, CalendarMonthViewComponent } from 'angular-calendar';
import { APP_BASE_HREF, CommonModule } from '@angular/common';
import { adapterFactory } from 'angular-calendar/date-adapters/date-fns'
import { ManageReactorCycleComponent } from './manage-reactor-cycle/manage-reactor-cycle.component';
import { ViewReactorCycleComponent } from './view-reactor-cycle/view-reactor-cycle.component';
import { ReactorCycleFormComponent } from './reactor-cycle-form/reactor-cycle-form.component';
import { PlaceOrderComponent } from './place-order/place-order.component';
import { ManageOrderComponent } from './manage-order/manage-order.component';
import { ViewOrderComponent } from './view-order/view-order.component';
import { UpdateOrderStatusComponent } from './update-order-status/update-order-status.component';
import { NotificationsComponent } from './notifications/notifications.component';
import { ProfileComponent } from './profile/profile.component';

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    ForgetpasswordComponent,
    ChangepasswordComponent,
    ManageclinicComponent,
    ViewClinicComponent,
    ClinicFormComponent,
    CalendarComponent,
    ManageReactorCycleComponent,
    ViewReactorCycleComponent,
    ReactorCycleFormComponent,
    PlaceOrderComponent,
    ManageOrderComponent,
    ViewOrderComponent,
    NotificationsComponent,
    UpdateOrderStatusComponent,
    ProfileComponent,
  ],

  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    CommonModule,
    CalendarModule.forRoot({
      provide: DateAdapter,
      useFactory: adapterFactory,
    })
  ],

  providers: [
    {
      provide: CalendarMonthViewComponent,
      useValue: { cellModifier: () => {} }
    }
  ],
  bootstrap: [AppComponent],
  
})
export class AppModule { }
