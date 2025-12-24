import { Component, Input } from '@angular/core';
import { ProductI } from '../../Interfaces/product.interface';
import { ProductsServiceService } from '../../Services/products-service.service';

@Component({
  selector: 'app-card',
  imports: [],
  templateUrl: './card.component.html',
  styleUrl: './card.component.css'
})
export class CardComponent {

  @Input() product!: any;

  constructor(public productService: ProductsServiceService) {}

  toggleFav(event: Event) {
    event.preventDefault();
    event.stopPropagation(); // Evita que el click dispare otros eventos de la card
    this.productService.toggleFavorite(this.product.id);
  }
}
