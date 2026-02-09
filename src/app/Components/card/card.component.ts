import { Component, inject, Input, OnInit } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common'; // <-- Importar CommonModule o DecimalPipe
import { ProductI } from '../../Interfaces/product.interface';
import { ComparativesService } from '../../Services/comparatives.service';
import { ToastrService } from 'ngx-toastr';
import { FavoritesService } from '../../Services/favorites.service';
import { RouterLink } from '@angular/router';
import { StoreService } from '../../Services/stores.service';

@Component({
  selector: 'app-card',
  standalone: true,
  // Añadimos CommonModule aquí para habilitar los Pipes (number, date, etc.)
  imports: [CommonModule, RouterLink], 
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
    const result = this.comparativesService.addProduct(product);
    if (result.success) {
      this.isInComparativeList = true;
      return;
    }

    this.isInComparativeList = false;

    switch (result.errorType) {
      case 'category':
        this.toastr.error(result.message, 'Categoría diferente');
        break;
      case 'limit':
        this.toastr.warning(result.message, 'Límite alcanzado');
        break;
      case 'duplicate':
        this.toastr.info(result.message, 'Ya agregado');
        break;
      default:
        this.toastr.warning(result.message, 'No se pudo agregar');
    }
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