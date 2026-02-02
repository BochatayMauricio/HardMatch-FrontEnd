import { Component } from '@angular/core';
import { RouterOutlet, Router, NavigationEnd } from '@angular/router';
import { CommonModule } from '@angular/common';
import { NavbarComponent } from "./Components/navbar/navbar.component";
import { FooterComponent } from "./Components/footer/footer.component";

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, NavbarComponent, FooterComponent, CommonModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'hardmatch-frontend';
  showMainHeader: boolean = true;

  constructor(private router: Router) {
    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        const currentUrl = event.urlAfterRedirects;
        
        // Rutas donde NO queremos el bot ni el header
        const hiddenRoutes = ['/login', '/admin', '/perfil']; 
        const shouldHide = hiddenRoutes.some(route => currentUrl.includes(route));
        this.showMainHeader = !shouldHide;
        if (shouldHide) {
          document.body.classList.add('ocultar-bot');
        } else {
          document.body.classList.remove('ocultar-bot');
        }
      }
    });
  }
}