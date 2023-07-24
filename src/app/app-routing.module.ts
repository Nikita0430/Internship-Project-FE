import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { ForgetpasswordComponent } from './forget-password/forget-password.component';
import { ChangepasswordComponent } from './change-password/change-password.component';
import { ViewClinicComponent } from './view-clinic/view-clinic.component';
import { ManageclinicComponent } from './manage-clinic/manage-clinic.component';
import { AuthGuard } from './auth.guard';
import { ClinicFormComponent } from './clinic-form/clinic-form.component';
import { CalendarComponent } from './calendar/calendar.component';
import { ManageReactorCycleComponent } from './manage-reactor-cycle/manage-reactor-cycle.component';
import { ViewReactorCycleComponent } from './view-reactor-cycle/view-reactor-cycle.component';
import { ReactorCycleFormComponent } from './reactor-cycle-form/reactor-cycle-form.component';
import { PlaceOrderComponent } from './place-order/place-order.component';
import { ManageOrderComponent } from './manage-order/manage-order.component';
import { ViewOrderComponent } from './view-order/view-order.component';
import { UpdateOrderStatusComponent } from './update-order-status/update-order-status.component';
import { NotificationsComponent } from './notifications/notifications.component';
import { ProfileComponent } from './profile/profile.component';
import { AdminGuard } from './admin.guard';
import { GuestGuard } from './guest.guard';


const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent, canActivate: [GuestGuard] },
  { path: 'forget-password', component: ForgetpasswordComponent, canActivate: [GuestGuard] },
  { path: 'change-password/:token', component: ChangepasswordComponent, canActivate: [GuestGuard] },
  { path: 'manage-clinic', component: ManageclinicComponent, canActivate: [AuthGuard, AdminGuard] },
  { path: 'view-clinic/:id', component: ViewClinicComponent, canActivate: [AuthGuard, AdminGuard] },
  { path: 'clinic', component: ClinicFormComponent, canActivate: [AuthGuard, AdminGuard] },
  { path: 'clinic/:id', component: ClinicFormComponent, canActivate: [AuthGuard, AdminGuard] },
  { path: 'manage-reactor-cycle', component: ManageReactorCycleComponent, canActivate: [AuthGuard, AdminGuard] },
  { path: 'view-reactor-cycle/:id', component: ViewReactorCycleComponent, canActivate: [AuthGuard, AdminGuard] },
  { path: 'reactor-cycle', component: ReactorCycleFormComponent, canActivate: [AuthGuard, AdminGuard] },
  { path: 'reactor-cycle/:id', component: ReactorCycleFormComponent, canActivate: [AuthGuard, AdminGuard] },
  { path: 'calendar', component: CalendarComponent, canActivate: [AuthGuard] },
  { path: 'place-order/:reactor-name/:eventDate', component: PlaceOrderComponent, canActivate: [AuthGuard] },
  { path: 'manage-order', component: ManageOrderComponent, canActivate: [AuthGuard] },
  { path: 'view-order/:id', component: ViewOrderComponent, canActivate: [AuthGuard] },
  { path: 'notifications', component: NotificationsComponent, canActivate: [AuthGuard]},
  { path: 'update-order-status/:id', component: UpdateOrderStatusComponent, canActivate: [AuthGuard, AdminGuard]},
  { path: 'profile', component: ProfileComponent, canActivate: [AuthGuard]},
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }