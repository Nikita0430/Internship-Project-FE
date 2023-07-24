import { TestBed } from '@angular/core/testing';

import { ReactorCycleService } from './reactor-cycle.service';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';

describe('ReactorCycleService', () => {
  let service: ReactorCycleService;
  let httpTestingController: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [ReactorCycleService],
    });
    service = TestBed.inject(ReactorCycleService);
    httpTestingController = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTestingController.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should set reactor cycle details', () => {
    const reactorCycleDetails = {
      id: 1,
      cycle_name: "Cycle1",
      reactor_name: "Reactor1",
      mass: 100,
      target_start_date: "2023-05-23",
      expiration_date: "2023-0-24",
      is_enabled: true,
    };
    service.setReactorCycleDetails(reactorCycleDetails);
    expect(service.getReactorCycleDetails()).toEqual(reactorCycleDetails);
  });

  it('should return null when reactor cycle details have not been set', () => {
    const reactorCycleDetails = null;
    service.setReactorCycleDetails(reactorCycleDetails)
    expect(service.getReactorCycleDetails()).toBeNull();
  });
});
