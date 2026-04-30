import { Component, inject, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProductI } from '../../Interfaces/product.interface';
import { ComparativesService } from '../../Services/comparatives.service';
import { ToastrService } from 'ngx-toastr';
import { FavoritesService } from '../../Services/favorites.service';
import { Router, RouterLink } from '@angular/router';
import { StoreService } from '../../Services/stores.service';
import { AuthService } from '../../Services/auth.service'; 
import { UserI } from '../../Interfaces/user.interface'; 

@Component({
  selector: 'app-card',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './card.component.html',
  styleUrl: './card.component.css',
})
export class CardComponent implements OnInit {
  @Input() product!: ProductI;
  @Input() isInComparativeList: boolean = false;
  @Input() showDeleteButton: boolean = false;

  isFav: boolean = false;
  currentUser: UserI | null = null; 

  storeLogoUrl: string = 'assets/default-store.svg';
  storeName: string = '';

  constructor(
    private comparativesService: ComparativesService,
    private toastr: ToastrService,
    private favService: FavoritesService,
    private storeService: StoreService,
    private authService: AuthService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    console.log('Datos del producto:', this.product)
    this.authService.getCurrentUser().subscribe((user) => {
      this.currentUser = user;
    });

    this.comparativesService.getProducts().subscribe((products) => {
      this.isInComparativeList = products.some((p) => p.id === this.product.id);
    });

    this.favService.favorites$.subscribe((favIds) => {
      this.isFav = favIds.includes(this.product.id);
    });

    this.storeName = this.product.storeName || 'Tienda Oficial';

    // Buscamos el listing que corresponde a la tienda del producto
    const mainListing = this.product.listings?.find(l => l.storeId === this.product.storeId);

    if (mainListing) {
      // Intentamos sacar el logo del listing (que ya debería venir del service)
      this.storeLogoUrl = mainListing.storeLogo || this.storeLogoUrl;
      this.storeName = mainListing.storeName || this.storeName;
    } 

    // Plan B: Si aún no tenemos logo y hay un storeId, llamamos al servicio de tiendas
    if (this.storeLogoUrl === 'assets/default-store.svg' && this.product.storeId) {
      this.storeService.getStoreById(this.product.storeId).subscribe({
        next: (store) => {
          if (store && store.logo) {
            this.storeLogoUrl = store.logo;
            this.storeName = store.name || this.storeName;
          }
        }
      });
    }
  }

  get finalPrice(): number {
    if (!this.product.offer) {
      return this.product.price;
    }
    const discount = parseFloat(this.product.offer);
    return Math.round(this.product.price * (1 + (discount / 100)));
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
    this.router.navigate(['/producto', product.id], { 
      queryParams: { store: product.storeId } 
    });
  }

  deleteProductFromCompare(productId: number): void {
    this.comparativesService.removeProduct(productId);
    this.isInComparativeList = false;
  }

  toggleFavorite() {
    if (!this.currentUser) {
      this.toastr.info(
        'Debes iniciar sesión para agregar favoritos',
        '¡Atención!',
      );
      return;
    }

    this.favService.toggleFavorite(this.product.id).subscribe({
      next: (wasAdded) => {
        if (wasAdded) {
          this.toastr.success('Producto agregado a favoritos', '¡Éxito!');
        } else {
          this.toastr.info('Producto eliminado de favoritos');
        }
      },
      error: () => {
        this.toastr.error('No se pudo actualizar favoritos', 'Error');
      },
    });
  }
}