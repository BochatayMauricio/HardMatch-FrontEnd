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

  storeLogoUrl: string = 'assets/default-store.png';
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
    // 1. Suscribirse al usuario actual
    this.authService.getCurrentUser().subscribe((user) => {
      this.currentUser = user;
    });

    // 2. Comprobar Comparativas
    this.comparativesService.getProducts().subscribe((products) => {
      this.isInComparativeList = products.some((p) => p.id === this.product.id);
    });

    // 3. Comprobar Favoritos (Ajustado para array de IDs)
    this.favService.favorites$.subscribe((favIds) => {
      this.isFav = favIds.includes(this.product.id);
    });

    // 4. Lógica eficiente para cargar la tienda sin saturar el Backend
    this.storeName = this.product.storeName || 'Tienda Oficial';
    
    // Buscamos el logo directamente en la oferta que mapeamos en el servicio
    if (this.product.listings && this.product.listings.length > 0) {
      const mainListing = this.product.listings.find(l => l.storeId === this.product.storeId);
      if (mainListing && mainListing.storeLogo) {
        this.storeLogoUrl = mainListing.storeLogo;
      }
    } else if (this.product.storeId) {
      // Fallback: Si por alguna razón no hay listings, le pedimos asíncronamente al servicio
      this.storeService.getStoreById(this.product.storeId).subscribe({
        next: (store) => {
          if (store) {
            this.storeLogoUrl = store.logo || this.storeLogoUrl;
            this.storeName = store.name || this.storeName;
          }
        }
      });
    }
  }

  // 5. Getter para evitar errores matemáticos en el HTML
  get finalPrice(): number {
    if (!this.product.offer) {
      return this.product.price;
    }
    const discount = parseFloat(this.product.offer);
    return this.product.price * (1 - (discount / 100));
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
    this.router.navigate(['/producto', product.id]);
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

    // 6. Pasamos solo el ID al servicio
    this.favService.toggleFavorite(this.product.id);

    if (!this.isFav) {
      this.toastr.success('Producto agregado a favoritos', '¡Éxito!');
    }
  }
}