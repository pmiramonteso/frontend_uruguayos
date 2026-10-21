import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { GraficosAdminComponent } from './graficos-admin.component';

describe('GraficosAdminComponent', () => {
  let component: GraficosAdminComponent;
  let fixture: ComponentFixture<GraficosAdminComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GraficosAdminComponent],
      providers: [provideRouter([])]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GraficosAdminComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
