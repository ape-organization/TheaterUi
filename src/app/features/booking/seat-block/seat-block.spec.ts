import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SeatBlock } from './seat-block';

describe('SeatBlock', () => {
  let component: SeatBlock;
  let fixture: ComponentFixture<SeatBlock>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SeatBlock]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SeatBlock);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
