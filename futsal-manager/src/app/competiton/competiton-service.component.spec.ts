import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CompetitonServiceComponent } from './competiton-service.component';

describe('CompetitonServiceComponent', () => {
  let component: CompetitonServiceComponent;
  let fixture: ComponentFixture<CompetitonServiceComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CompetitonServiceComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CompetitonServiceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
