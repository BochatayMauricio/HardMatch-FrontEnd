import { Component, OnInit } from '@angular/core';
import { CarruselComponent } from "../../Components/carrusel/carrusel.component";
import { CardComponent } from "../../Components/card/card.component";
import { ProductI } from '../../Interfaces/product.interface';
import { ProductsServiceService } from '../../Services/products-service.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CarruselComponent, CardComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent implements OnInit {
  products: ProductI[] = [];
  discountedProducts: ProductI[] = []; // Array exclusivo para la sección de descuentos
  categories: string[] = [];
  isLoading: boolean = true; // Para mostrar un loader mientras llegan los datos
  
  constructor(
    private productService: ProductsServiceService
  ) {}

  ngOnInit(): void {
    // Al iniciar, nos suscribimos al backend
    this.productService.getProducts().subscribe({
      next: (data) => {
        this.products = data;
        
        // Filtramos solo los que tienen alguna oferta para la sección "Los mejores descuentos"
        this.discountedProducts = data.filter(p => p.offer && Number(p.offer) > 0);
        
        this.categories = this.extractCategories();
        this.isLoading = false; // Ya llegaron los datos, apagamos el loader
      },
      error: (err) => {
        console.error('Error al cargar productos en Home:', err);
        this.isLoading = false;
      }
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