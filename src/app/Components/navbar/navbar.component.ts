import { Component } from '@angular/core';
import { NotificationComponent } from "../notification/notification.component";

@Component({
  selector: 'app-navbar',
  imports: [NotificationComponent],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css'
})
export class NavbarComponent {


  constructor() {
    
  }


}
