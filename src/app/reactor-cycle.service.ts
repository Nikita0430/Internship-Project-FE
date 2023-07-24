import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ReactorCycleService {
  reactorCycleDetails: any;

  constructor() { }

  setReactorCycleDetails(reactorCycleDetails:any){
    this.reactorCycleDetails = reactorCycleDetails;
  }

  getReactorCycleDetails(){
    return this.reactorCycleDetails;
  }
}
