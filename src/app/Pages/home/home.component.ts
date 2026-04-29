import { Component, OnInit } from '@angular/core';
import { CarruselComponent } from "../../Components/carrusel/carrusel.component";
import { CardComponent } from "../../Components/card/card.component";
import { ProductI } from '../../Interfaces/product.interface';
import { ProductsService } from '../../Services/products.service';
import { AuthService } from '../../Services/auth.service';
import { RecommendationService } from '../../Services/recomendation.service';
import { DatePipe, CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CarruselComponent, CardComponent, DatePipe, RouterLink, CommonModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent implements OnInit {
  products: ProductI[] = [];
  discountedProducts: ProductI[] = [];
  categories: string[] = [];
  isLoading: boolean = true;
  recommendations: any[] = [];
  productosRecomendados: ProductI[] = [];
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
    private recommendationService: RecommendationService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.productService.getProducts().subscribe({
      next: (data) => {
        this.products = data;
        
        this.discountedProducts = data.filter(p => p.offer && Number(p.offer) > 0);
        
        this.categories = this.extractCategories();
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error al cargar productos en Home:', err);
        this.isLoading = false;
      }
    });
    this.authService.getCurrentUser().subscribe(user => {
      this.isLoggedIn = !!user;
      if (this.isLoggedIn) {
        this.loadRecommendations();
      }
    });
  }

  loadRecommendations(): void {
    this.recommendationService.getMyRecommendations().subscribe({
      next: (data) => {
        this.recommendations = data;

        for (let prod of this.products) {
          for (let rec of this.recommendations) {
            if (prod.id === rec.product.id) {
              this.productosRecomendados.push(prod);
            }
          }
        }
        
      },
      error: (err) => console.error('Error al cargar recomendaciones:', err)
    });
  }

  private extractCategories(): string[] {
    const categorySet = new Set<string>();
    this.products.forEach(product => {
      if (product.category) {
        categorySet.add(product.category);
      }
    });
    return Array.from(categorySet);
  }
}
