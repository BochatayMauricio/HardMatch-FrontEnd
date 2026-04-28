import { Component, OnInit } from '@angular/core';
import { CarruselComponent } from "../../Components/carrusel/carrusel.component";
import { CardComponent } from "../../Components/card/card.component";
import { ProductI } from '../../Interfaces/product.interface';
import { ProductsService } from '../../Services/products.service';
import { AuthService } from '../../Services/auth.service';
import { RecommendationService } from '../../Services/recomendation.service';
import { DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CarruselComponent, CardComponent, DatePipe, RouterLink],
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
