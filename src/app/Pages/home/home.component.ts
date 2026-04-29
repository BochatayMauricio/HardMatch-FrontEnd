import { Component, OnInit } from '@angular/core';
import { CarruselComponent } from "../../Components/carrusel/carrusel.component";
import { CardComponent } from "../../Components/card/card.component";
import { ProductI } from '../../Interfaces/product.interface';
import { ProductsService } from '../../Services/products.service';
import { AuthService } from '../../Services/auth.service';
import { DatePipe, CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CarruselComponent, CardComponent, RouterLink, CommonModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent implements OnInit {
  // Estado para Mejores Descuentos
  discountedProducts: ProductI[] = [];
  discountsPage: number = 1;
  discountsTotalPages: number = 1;
  discountsVisiblePages: number[] = []; // <-- Array para los 5 números
  isLoadingDiscounts: boolean = true;

  // Estado para Recomendados
  productosRecomendados: ProductI[] = [];
  recommendedPage: number = 1;
  recommendedTotalPages: number = 1;
  recommendedVisiblePages: number[] = [];
  isLoadingRecommended: boolean = true;

  isLoggedIn = false;

  popularCategories = [
    { 
      name: 'Notebooks', 
      image: 'https://omnitech.ar/wp-content/uploads/2025/03/macbook-air-m1.webp', 
      route: ['/categoria/notebooks'],
    },
    { 
      name: 'Procesadores', 
      image: 'https://www.profesionalreview.com/wp-content/uploads/2023/10/j1p-Intel-Core-i9-14900K-h3z-Review-12.png', 
      route: ['/categoria/procesadores'], 
    },
    { 
      name: 'Monitores', 
      image: 'https://images.fravega.com/f500/39f1d52ecda3b99857b58a44d18959e2.png', 
      route: ['/categoria/monitores'],
    },
    { 
      name: 'Mouses', 
      image: 'https://www.gamerspoint.com.ar/wp-content/uploads/MOUSE-REDRAGON-IMPACT.png', 
      route: '/categoria/mouse' 
    },
    { 
      name: 'Memorias RAM', 
      image: 'https://www.venex.com.ar/products_images/1729175241_d35g_2000x2000_1_black.png', 
      route: '/categoria/Memorias RAM' 
    },
    { 
      name: 'Placas de Video', 
      image: 'https://www.comeros.com.ar/wp-content/uploads/2025/06/Placa-de-Video-ASUS-Dual-GeForce-RTX-5060-8GB-GDDR7-a.png', 
      route: '/categoria//Placas de Video' 
    },
    { 
      name: 'Auriculares', 
      image: 'https://theapplewiki.com/images/applewiki/thumb/d/d9/AirPods_Max.png/300px-AirPods_Max.png', 
      route: '/categoria/auriculares' 
    },
    { 
      name: 'Tablets', 
      image: 'https://mobilequilla.com/wp-content/uploads/2025/04/IPADS-MINI-11-TH-256.png', 
      route: '/categoria/tablets' 
    }
  ];
  
  constructor(
    private productService: ProductsService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    // Primero verificamos la sesión, porque el límite de descuentos depende de esto
    this.authService.getCurrentUser().subscribe(user => {
      this.isLoggedIn = !!user;
      
      // AHORA que sabemos si está logueado o no, cargamos los descuentos
      this.loadTopDiscounts(1);

      // Y si está logueado, cargamos sus recomendaciones
      if (this.isLoggedIn) {
        this.loadRecommendations(1);
      } else {
        this.isLoadingRecommended = false;
      }
    });
  }

  // --- LÓGICA DE MEJORES DESCUENTOS ---
  loadTopDiscounts(page: number): void {
    this.isLoadingDiscounts = true;
    
    // Límite dinámico: 8 si está logueado, 16 si es invitado
    const limit = this.isLoggedIn ? 8 : 16;

    this.productService.getTopDiscounts(page, limit).subscribe({ 
      next: (res) => {
        this.discountedProducts = res.data;
        this.discountsPage = res.currentPage;
        this.discountsTotalPages = res.totalPages;
        
        // Calculamos los 5 numeritos a mostrar
        this.discountsVisiblePages = this.calculateVisiblePages(this.discountsPage, this.discountsTotalPages);
        
        this.isLoadingDiscounts = false;
      },
      error: (err) => {
        console.error('Error cargando descuentos:', err);
        this.isLoadingDiscounts = false;
      }
    });
  }

  // Función matemática para sacar hasta 5 números centrados en la página actual
  calculateVisiblePages(current: number, total: number): number[] {
    if (total <= 5) {
      return Array.from({ length: total }, (_, i) => i + 1);
    }
    
    let start = Math.max(1, current - 2);
    let end = Math.min(total, current + 2);

    if (current <= 2) {
      end = 5;
    } else if (current >= total - 1) {
      start = total - 4;
    }

    return Array.from({ length: end - start + 1 }, (_, i) => start + i);
  }

  // --- LÓGICA DE RECOMENDADOS (Mantenemos igual por ahora, límite 4 u 8 según prefieras) ---
  // --- LÓGICA DE RECOMENDADOS ---
  loadRecommendations(page: number): void {
    this.isLoadingRecommended = true;
    this.productService.getRecommended(page, 4).subscribe({ 
      next: (res) => {
        this.productosRecomendados = res.data;
        this.recommendedPage = res.currentPage;
        this.recommendedTotalPages = res.totalPages;
        
        // Calculamos los 5 numeritos a mostrar para las recomendaciones
        this.recommendedVisiblePages = this.calculateVisiblePages(this.recommendedPage, this.recommendedTotalPages);
        
        this.isLoadingRecommended = false;
      },
      error: (err) => {
        console.error('Error cargando recomendaciones:', err);
        this.isLoadingRecommended = false;
      }
    });
  }

  nextRecommendedPage(): void {
    if (this.recommendedPage < this.recommendedTotalPages) {
      this.loadRecommendations(this.recommendedPage + 1);
    }
  }

  prevRecommendedPage(): void {
    if (this.recommendedPage > 1) {
      this.loadRecommendations(this.recommendedPage - 1);
    }
  }
}