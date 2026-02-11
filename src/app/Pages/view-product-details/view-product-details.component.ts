import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ProductI } from '../../Interfaces/product.interface';
import { ProductsServiceService } from '../../Services/products-service.service';
import { ComparativesService } from '../../Services/comparatives.service';
import { FavoritesService } from '../../Services/favorites.service';
import { StoreService } from '../../Services/stores.service';
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
  storeLogoUrl = 'assets/default-store.png';
  storeName = '';

  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private productsService = inject(ProductsServiceService);
  private comparativesService = inject(ComparativesService);
  private favoritesService = inject(FavoritesService);
  private storeService = inject(StoreService);
  private toastr = inject(ToastrService);

  ngOnInit(): void {
    const productId = Number(this.route.snapshot.paramMap.get('id'));

    if (productId) {
      this.product = this.productsService.getProductById(productId);

      if (!this.product) {
        this.toastr.error('Producto no encontrado', 'Error');
        this.router.navigate(['/']);
        return;
      }

      // Check favorite status
      this.favoritesService.favorites$.subscribe((favs) => {
        this.isFavorite = favs.some((p) => p.id === this.product?.id);
      });

      // Check comparison status
      this.comparativesService.getProducts().subscribe((products) => {
        this.isInComparison = products.some((p) => p.id === this.product?.id);
      });

      // Load store info
      if (this.product.storeId) {
        const store = this.storeService.getStoreById(this.product.storeId);
        if (store) {
          this.storeLogoUrl = store.logo;
          this.storeName = store.name;
        }
      }
    }
  }

  getCharacteristics(): { key: string; value: string | number | boolean; icon: string }[] {
    if (!this.product?.caracteristics) return [];

    // Diccionario de iconos según la especificación
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
      // Si no encuentra icono específico, usa 'settings' por defecto
      icon: iconMap[key] || 'settings' 
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
    const rating = (rawRating % 1 !== 0) ? Math.floor(rawRating) + 0.5 : rawRating;
    for (let i = 1; i <= 5; i++) {
      if (rating >= i) {
        stars.push({ icon: 'star', class: 'star-filled' });
      } else if (rating >= i - 0.5) {
        stars.push({ icon: 'star_half', class: 'star-filled' });
      } else {
        stars.push({ icon: 'star', class: 'star-empty' });
      }
    }
    return stars;
  }

  toggleFavorite(): void {
    if (this.product) {
      this.favoritesService.toggleFavorite(this.product);
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