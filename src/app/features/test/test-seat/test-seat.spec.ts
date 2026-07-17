import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TestSeat } from './test-seat';

describe('TestSeat', () => {
  let component: TestSeat;
  let fixture: ComponentFixture<TestSeat>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestSeat]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TestSeat);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
