import { Component, Input } from '@angular/core';
import { ProductI } from '../../Interfaces/product.interface';
<<<<<<< HEAD
import { ProductsServiceService } from '../../Services/products-service.service';
=======
import { ComparativesService } from '../../Services/comparatives.service';
import { ToastrService } from 'ngx-toastr';
>>>>>>> origin/dev-Mauricio

@Component({
  selector: 'app-card',
  imports: [],
  templateUrl: './card.component.html',
  styleUrl: './card.component.css'
})
export class CardComponent{

  @Input() product!: any;

<<<<<<< HEAD
  constructor(public productService: ProductsServiceService) {}

  toggleFav(event: Event) {
    event.preventDefault();
    event.stopPropagation(); // Evita que el click dispare otros eventos de la card
    this.productService.toggleFavorite(this.product.id);
  }
=======
  isInComparativeList: boolean = false;

  constructor(
    private comparativesService: ComparativesService,
    private toastr: ToastrService
  ) {
   
  }

  ngOnInit(): void {
    this.comparativesService.getProducts().subscribe(products => {
      this.isInComparativeList = products.some(p => p.id === this.product.id);
    });
  }
  
  addToCompare(product: ProductI): void {
    const added = this.comparativesService.addProduct(product);
    if (added){
      this.isInComparativeList = true;
      return;
    }
    this.isInComparativeList = false;
    this.toastr.warning('Solo puedes comparar hasta 3 productos a la vez', 'Límite alcanzado');
  }

  deleteProductFromCompare(productId: number): void {
    this.comparativesService.removeProduct(productId);
    this.isInComparativeList = false;
  }

>>>>>>> origin/dev-Mauricio
}
