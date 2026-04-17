import { Component } from '@angular/core';
import {
  RouterOutlet,
  Router,
  NavigationEnd,
  RouterLinkWithHref,
} from '@angular/router';
import { CommonModule } from '@angular/common';
import { NavbarComponent } from './Components/navbar/navbar.component';
import { FooterComponent } from './Components/footer/footer.component';
import { ComparativesService } from './Services/comparatives.service';
import { map, Observable } from 'rxjs';
import { ChatWidgetComponent } from './Components/chatbot-widget/chatbot-widget.component';

@Component({
  selector: 'app-root',
  imports: [
    RouterOutlet,
    NavbarComponent,
    FooterComponent,
    CommonModule,
    RouterLinkWithHref,
    ChatWidgetComponent,
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent {
  title = 'hardmatch-frontend';
  showMainHeader: boolean = true;
  showFloatingButton: boolean = true;
  productCount$: Observable<number>;

  constructor(
    private router: Router,
    private comparativeService: ComparativesService,
  ) {
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        const currentUrl = event.urlAfterRedirects;

        const hiddenRoutes = ['/login'];
        const shouldHide = hiddenRoutes.some((route) =>
          currentUrl.includes(route),
        );
        this.showMainHeader = !shouldHide;
        this.showFloatingButton = !currentUrl.includes('/comparativas');
        if (shouldHide) {
          document.body.classList.add('ocultar-bot');
        } else {
          document.body.classList.remove('ocultar-bot');
        }
      }
    });
    this.productCount$ = this.comparativeService.products$.pipe(
      map((products) => products.length),
    );
  }

  goToComparison(): void {
    this.router.navigate(['/comparar']);
  }
}
