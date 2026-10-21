import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { PresentacionComponent } from './presentacion.component';

describe('PresentacionComponent', () => {
  let component: PresentacionComponent;
  let fixture: ComponentFixture<PresentacionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PresentacionComponent],
      providers: [provideRouter([])]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PresentacionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
