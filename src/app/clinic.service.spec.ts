import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { ClinicService } from './clinic.service';

describe('ClinicService', () => {
  let service: ClinicService;
  let httpTestingController: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [ClinicService],
    });
    service = TestBed.inject(ClinicService);
    httpTestingController = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTestingController.verify();
  });


  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should set clinic details', () => {
    const clinicDetails = { name: "testClinic",
    address: "testAddress",
    city: "testCity",
    state: "testState",
    zipcode: "testZipcode", };
    service.setClinicDetails(clinicDetails);
    expect(service.getClinicDetails()).toEqual(clinicDetails);
  });

  it('should return null when clinic details have not been set', () => {
    const clinicDetails = null;
    service.setClinicDetails(clinicDetails)
    expect(service.getClinicDetails()).toBeNull();
  });
});
