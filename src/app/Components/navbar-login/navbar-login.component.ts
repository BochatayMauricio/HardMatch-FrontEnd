import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-navbar-login',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './navbar-login.component.html',
  styleUrl: './navbar-login.component.css'
})
export class NavbarLoginComponent {
}