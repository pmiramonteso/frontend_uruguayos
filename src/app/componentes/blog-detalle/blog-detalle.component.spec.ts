import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BlogDetalleComponent } from './blog-detalle.component';

describe('BlogDetalleComponent', () => {
  let component: BlogDetalleComponent;
  let fixture: ComponentFixture<BlogDetalleComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BlogDetalleComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BlogDetalleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
