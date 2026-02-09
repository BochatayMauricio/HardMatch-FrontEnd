import { Component, inject, Input, OnInit } from '@angular/core';
import { ProductI } from '../../Interfaces/product.interface';
import { ComparativesService } from '../../Services/comparatives.service';
import { ToastrService } from 'ngx-toastr';
import { FavoritesService } from '../../Services/favorites.service';
import { RouterLink } from '@angular/router';
import { StoreService } from '../../Services/stores.service';

@Component({
  selector: 'app-card',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './card.component.html',
  styleUrl: './card.component.css',
})
export class CardComponent implements OnInit {
  @Input() product!: ProductI;
  @Input() isInComparativeList: boolean = false;
  @Input() showDeleteButton: boolean = false;

  isFav: boolean = false;
  
  storeLogoUrl: string = 'assets/default-store.png'; 
  storeName: string = '';

  private favService = inject(FavoritesService);
  private storeService = inject(StoreService);

  constructor(
    private comparativesService: ComparativesService,
    private toastr: ToastrService,
  ) {}

  ngOnInit(): void {
    this.comparativesService.getProducts().subscribe((products) => {
      this.isInComparativeList = products.some((p) => p.id === this.product.id);
    });

    this.favService.favorites$.subscribe((favs) => {
      this.isFav = favs.some((p) => p.id === this.product.id);
    });

    if (this.product.storeId) {
      const store = this.storeService.getStoreById(this.product.storeId);
      if (store) {
        this.storeLogoUrl = store.logo;
        this.storeName = store.name;
      }
    }
  }

  addToCompare(product: ProductI): void {
    const added = this.comparativesService.addProduct(product);
    if (added) {
      this.isInComparativeList = true;
      return;
    }
    this.isInComparativeList = false;
    this.toastr.warning(
      'Solo puedes comparar hasta 3 productos a la vez',
      'Límite alcanzado',
    );
  }

  seeDetails(product: ProductI): void {
    this.toastr.info(
      `Detalles de ${product.name} (ID: ${product.id})`,
      'Aca iria una nueva pagina con toda la info del producto',
    );
  }

  deleteProductFromCompare(productId: number): void {
    this.comparativesService.removeProduct(productId);
    this.isInComparativeList = false;
  }

  toggleFavorite() {
    this.favService.toggleFavorite(this.product);
  }
}