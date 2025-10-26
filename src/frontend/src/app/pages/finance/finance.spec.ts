import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Finance } from './finance';

describe('Finance', () => {
  let component: Finance;
  let fixture: ComponentFixture<Finance>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Finance]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Finance);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
