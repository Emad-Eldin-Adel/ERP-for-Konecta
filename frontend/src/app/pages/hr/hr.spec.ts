import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Hr } from './hr';

describe('Hr', () => {
  let component: Hr;
  let fixture: ComponentFixture<Hr>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Hr]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Hr);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
