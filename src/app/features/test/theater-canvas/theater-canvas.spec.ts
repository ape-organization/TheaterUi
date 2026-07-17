import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TheaterCanvas } from './theater-canvas';

describe('TheaterCanvas', () => {
  let component: TheaterCanvas;
  let fixture: ComponentFixture<TheaterCanvas>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TheaterCanvas]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TheaterCanvas);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
