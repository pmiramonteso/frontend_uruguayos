import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NegociosAdminComponent } from './negocios-admin.component';

describe('NegociosAdminComponent', () => {
  let component: NegociosAdminComponent;
  let fixture: ComponentFixture<NegociosAdminComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NegociosAdminComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NegociosAdminComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
