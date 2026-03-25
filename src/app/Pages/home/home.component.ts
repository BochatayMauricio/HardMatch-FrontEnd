import { Component, OnInit } from '@angular/core';
import { CarruselComponent } from "../../Components/carrusel/carrusel.component";
import { CardComponent } from "../../Components/card/card.component";
import { ProductI } from '../../Interfaces/product.interface';
import { ProductsService } from '../../Services/products.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CarruselComponent, CardComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent implements OnInit {
  products: ProductI[] = [];
  discountedProducts: ProductI[] = [];
  categories: string[] = [];
  isLoading: boolean = true;
  
  constructor(
    private productService: ProductsService
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
