import { Component, inject, Input } from '@angular/core';
import { ProductI } from '../../Interfaces/product.interface';
import { ComparativesService } from '../../Services/comparatives.service';
import { ToastrService } from 'ngx-toastr';
import { FavoritesService } from '../../Services/favorites.service';

@Component({
  selector: 'app-card',
  imports: [],
  templateUrl: './card.component.html',
  styleUrl: './card.component.css'
})
export class CardComponent{

  @Input() product!: ProductI;
  @Input() isInComparativeList: boolean = false;
  @Input() showDeleteButton: boolean = false;

  isFav: boolean = false;
  private favService = inject(FavoritesService);

  constructor(
    private comparativesService: ComparativesService,
    private toastr: ToastrService
  ) {
   
  }

  ngOnInit(): void {
    this.comparativesService.getProducts().subscribe(products => {
      this.isInComparativeList = products.some(p => p.id === this.product.id);
    });
    this.favService.favorites$.subscribe(favs => {
      this.isFav = favs.some(p => p.id === this.product.id);
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

  toggleFavorite() {
    this.favService.toggleFavorite(this.product);
  }

}