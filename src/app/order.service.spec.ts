import { TestBed } from '@angular/core/testing';
import { OrderService } from './order.service';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';

describe('OrderService', () => {
  let service: OrderService;
  let httpTestingController: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [OrderService],
    });
    service = TestBed.inject(OrderService);
    httpTestingController = TestBed.inject(HttpTestingController);

  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });


  it('should set order details', () => {
    const orderDetails = {
      order: {
        order_id: 1,
        clinic_id: 456,
        clinic_name: "ClinicName",
        account_id: "C000456",
        address: "Address Line 1",
        city: "City",
        state: "State",
        zipcode: "12345",
        reactor_id: 123,
        reactor_name: "Reactor1",
        email: "user@example.com",
        phone_no: "555-123-4567",
        placed_at: "2023-05-03T11:03:36.386Z",
        shipped_at: "2023-05-03T11:03:36.386Z",
        out_for_delivery_at: "2023-05-03T11:03:36.386Z",
        delivered_at: "2023-05-03T11:03:36.386Z",
        injection_date: "2023-05-03",
        dog_name: "Fido",
        dog_breed: "Golden Retriever",
        dog_age: 5,
        dog_weight: 70.5,
        dog_gender: "male",
        no_of_elbows: 2,
        total_dosage: 10,
        status: "placed",
    }
  };
    service.setOrderDetails(orderDetails);
    expect(service.orderDetails).toEqual(orderDetails);
  });

  it('should return null when reactor cycle details have not been set', () => {
    const orderDetails = null;
    service.setOrderDetails(orderDetails)
    expect(service.getOrderDetails()).toBeNull();
  });
});
