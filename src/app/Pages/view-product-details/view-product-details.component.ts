import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ProductI } from '../../Interfaces/product.interface';
import { ProductsService } from '../../Services/products.service';
import { ComparativesService } from '../../Services/comparatives.service';
import { FavoritesService } from '../../Services/favorites.service';
import { StoreService } from '../../Services/stores.service';
import { AuthService } from '../../Services/auth.service';
import { UserI } from '../../Interfaces/user.interface';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-view-product-details',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './view-product-details.component.html',
  styleUrl: './view-product-details.component.css',
})
export class ViewProductDetailsComponent implements OnInit {
  product: ProductI | null = null;
  isFavorite = false;
  isInComparison = false;
  storeLogoUrl = 'assets/default-store.svg';
  storeName = '';

  currentUser: UserI | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private productsService: ProductsService,
    private comparativesService: ComparativesService,
    private favoritesService: FavoritesService,
    private storeService: StoreService,
    private authService: AuthService,
    private toastr: ToastrService,
  ) {}

  ngOnInit(): void {
    const productId = Number(this.route.snapshot.paramMap.get('id'));

    if (productId) {
      this.authService.getCurrentUser().subscribe((user) => {
        this.currentUser = user;
      });

      this.productsService.getProductById(productId).subscribe({
        next: (producto) => {
          if (!producto) {
            this.toastr.error('Producto no encontrado', 'Error');
            this.router.navigate(['/']);
            return;
          }

          this.product = producto;

          if (this.product.storeId) {
            this.storeService.getStoreById(this.product.storeId).subscribe({
              next: (store) => {
                if (store) {
                  this.storeLogoUrl = store.logo || 'assets/default-store.svg';
                  this.storeName = store.name || 'Tienda Oficial';
                }
              },
              error: (err) => {
                console.error('Error al cargar tienda real:', err);
                this.storeName = producto.storeName || 'Tienda Oficial';
              }
            });
          }

          this.favoritesService.favorites$.subscribe((favIds) => {
            this.isFavorite = favIds.includes(this.product!.id);
          });

          this.comparativesService.getProducts().subscribe((products) => {
            this.isInComparison = products.some((p) => p.id === this.product!.id);
          });
        },
        error: (err) => {
          console.error('Error al cargar del backend', err);
          this.toastr.error('Error de conexión con el servidor');
          this.router.navigate(['/']);
        }
      });
    }
  }

  getCharacteristics(): {
    key: string;
    value: string | number | boolean;
    icon: string;
  }[] {
    if (!this.product?.caracteristics) return [];

    const iconMap: Record<string, string> = {
      processor: 'memory',
      ram: 'developer_board',
      storage: 'hard_drive',
      screen: 'aspect_ratio',
      graphics: 'videogame_asset',
      battery: 'battery_charging_full',
      weight: 'scale',
      os: 'layers',
      camera: 'photo_camera',
      connectivity: 'wifi',
      dpi: 'mouse',
      buttons: 'ads_click',
      rgb: 'palette',
      sensor: 'sensors',
      polling: 'speed',
    };

    return Object.entries(this.product.caracteristics).map(([key, value]) => ({
      key: this.formatCharacteristicKey(key),
      value: typeof value === 'boolean' ? (value ? 'Sí' : 'No') : value,
      icon: iconMap[key] || 'settings',
    }));
  }

  formatCharacteristicKey(key: string): string {
    const keyMap: Record<string, string> = {
      processor: 'Procesador',
      ram: 'Memoria RAM',
      storage: 'Almacenamiento',
      screen: 'Pantalla',
      graphics: 'Gráficos',
      battery: 'Batería',
      weight: 'Peso',
      os: 'Sistema Operativo',
      camera: 'Cámara',
      connectivity: 'Conectividad',
      dpi: 'DPI',
      buttons: 'Botones',
      rgb: 'Iluminación RGB',
      sensor: 'Sensor',
      polling: 'Tasa de Polling',
    };

    return keyMap[key] || key.charAt(0).toUpperCase() + key.slice(1);
  }

  getDiscountedPrice(): number {
    if (!this.product) return 0;
    if (this.product.offer) {
      return this.product.price * (1 - Number(this.product.offer) / 100);
    }
    return this.product.price;
  }

  getSavings(): number {
    if (!this.product?.offer) return 0;
    return this.product.price - this.getDiscountedPrice();
  }

  getStars(): { icon: string; class: string }[] {
    const rawRating = this.product?.ratings || 0;
    const stars = [];

    const rating =
      rawRating % 1 !== 0 ? Math.floor(rawRating) + 0.5 : rawRating;

    for (let i = 1; i <= 5; i++) {
      if (rating >= i) {
        stars.push({ icon: 'star', class: 'star-filled' });
      } else if (rating >= i - 0.5) {
        stars.push({ icon: 'star_rate_half', class: 'star-filled' });
      } else {
        stars.push({ icon: 'star', class: 'star-empty' });
      }
    }
    return stars;
  }

  toggleFavorite(): void {
    if (!this.currentUser) {
      this.toastr.info(
        'Debes iniciar sesión para agregar favoritos',
        '¡Atención!',
      );
      return;
    }

    if (this.product) {
      this.favoritesService.toggleFavorite(this.product.id).subscribe({
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

  addToComparison(): void {
    if (!this.product) return;

    const result = this.comparativesService.addProduct(this.product);
    if (result.success) {
      this.isInComparison = true;
      this.toastr.success('Producto agregado a comparación', 'Comparar');
    } else {
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
  }

  removeFromComparison(): void {
    if (this.product) {
      this.comparativesService.removeProduct(this.product.id);
      this.isInComparison = false;
      this.toastr.info('Producto removido de comparación', 'Comparar');
    }
  }

  goToStore(): void {
    if (this.storeName) {
      this.router.navigate(['/stores', this.storeName]);
    }
  }

  goBack(): void {
    window.history.back();
  }

  visitProductUrl(): void {
    if (this.product?.urlAcces) {
      window.open(this.product.urlAcces, '_blank');
    }
  }
}

