import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { MapaComponent } from './mapa.component';

describe('MapaComponent', () => {
  let component: MapaComponent;
  let fixture: ComponentFixture<MapaComponent>;

  // En la app, Leaflet y markercluster se cargan como scripts globales (angular.json);
  // en los tests no, así que se registran aquí sobre una L global modificable
  beforeAll(async () => {
    (globalThis as any).L = { ...(await import('leaflet')) };
    await import('leaflet.markercluster');
  });

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MapaComponent],
      providers: [provideRouter([])]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MapaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
