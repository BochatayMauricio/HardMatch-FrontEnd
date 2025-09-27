import { Component, Input } from '@angular/core';
import { ProductI } from '../../Interfaces/product.interface';

@Component({
  selector: 'app-card',
  imports: [],
  templateUrl: './card.component.html',
  styleUrl: './card.component.css'
})
export class CardComponent {

  @Input() product!: ProductI;

}
