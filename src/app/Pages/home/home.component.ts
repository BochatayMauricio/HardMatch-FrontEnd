import { Component, OnInit } from '@angular/core';
import { CarruselComponent } from "../../Components/carrusel/carrusel.component";
import { CardComponent } from "../../Components/card/card.component";
import { ProductI } from '../../Interfaces/product.interface';
import { ProductsServiceService } from '../../Services/products-service.service';


@Component({
  selector: 'app-home',
  imports: [CarruselComponent, CardComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent{
  products: ProductI[] = [];
  
  constructor(
    private productService: ProductsServiceService
  ) {
    this.extractCategories();
    this.products = this.productService.getProducts();
  }

  private extractCategories(): string[] {
    const categorySet = new Set<string>();
    this.products.forEach(product => categorySet.add(product.category));
    return Array.from(categorySet);
  }

}
