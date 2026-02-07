import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router'; // <--- 1. IMPORTA ESTO
import { NavbarLoginComponent } from './navbar-login.component';

describe('NavbarLoginComponent', () => {
  let component: NavbarLoginComponent;
  let fixture: ComponentFixture<NavbarLoginComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NavbarLoginComponent],
      providers: [ provideRouter([]) ] // <--- 2. AGREGA ESTO
    })
    .compileComponents();

    fixture = TestBed.createComponent(NavbarLoginComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});