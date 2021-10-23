import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ManualOverrideRouteComponent } from './manual-override-route.component';

describe('ManualOverrideRouteComponent', () => {
  let component: ManualOverrideRouteComponent;
  let fixture: ComponentFixture<ManualOverrideRouteComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ManualOverrideRouteComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ManualOverrideRouteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
