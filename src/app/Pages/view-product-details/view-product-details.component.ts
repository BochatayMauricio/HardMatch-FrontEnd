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
import { ListingService } from '../../Services/listing.service';

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
    private listingService: ListingService
  ) {}

  ngOnInit(): void {
  const productId = Number(this.route.snapshot.paramMap.get('id'));
  const selectedStoreId = this.route.snapshot.queryParamMap.get('store'); // Capturamos la tienda de la URL

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

        // 1. Asignamos el producto base
        this.product = producto;

        // 2. LÓGICA DE TIENDA ESPECÍFICA: 
        // Si venimos de una tienda específica, sobreescribimos los datos del producto
        if (selectedStoreId && this.product.listings) {
          const storeIdNum = parseInt(selectedStoreId, 10);
          const specificListing = this.product.listings.find(l => l.storeId === storeIdNum);

          if (specificListing) {
            // Actualizamos el precio y el storeId para que el resto del componente use estos datos
            this.product.price = specificListing.price;
            this.product.storeId = specificListing.storeId; 
            // Si el listing tiene una URL propia para el botón "Ir a la tienda":
            // this.product.urlAccess = specificListing.url; 
          }
        }

        if (selectedStoreId && this.product.listings) {
          const storeIdNum = parseInt(selectedStoreId, 10);
          const specificListing = this.product.listings.find(l => l.storeId === storeIdNum);

          if (specificListing) {
            this.product.price = specificListing.price;
            this.product.storeId = specificListing.storeId;
            
            // ✨ LA CLAVE: Pisamos 'offer' con el porcentaje de ESTA oferta específica
            // (Asumiendo que el backend te lo manda como percent_off o similar en el listing)
            this.product.offer = String(specificListing.percentOff); 
          }
        }

        // 3. Tu lógica original sigue igual (ahora usará el storeId actualizado)
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

      // Usamos el 'offer' que ya fue actualizado en el ngOnInit
      const discount = this.product.offer ? Number(this.product.offer) : 0;

      if (discount > 0) {
        const discountedPrice = this.product.price * (1 - discount / 100);
        return Math.round(discountedPrice);
      }

      // Si no hay descuento para esta tienda, devolvemos el precio de esta tienda
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

  onGoToStore(listingId: number | undefined, urlAccess: string): void {
    console.log('Intentando ir a la tienda con URL:', urlAccess, 'y listingId:', listingId);
    if (!urlAccess) return;
    
    // 1. Abrimos la pestaña
    window.open(urlAccess, '_blank');
    
    // 2. Solo registramos la métrica si tenemos un ID válido
    if (listingId !== undefined) {
      this.listingService.registerListingClick(listingId).subscribe({
        next: (res) => console.log('✅ [Métrica] Clic registrado en BD:', res),
        error: (err) => console.error('❌ [Métrica] Falló el registro del clic:', err)
      });
    }
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
      // 1. Redirigimos al usuario a la tienda principal de inmediato (UX)
      window.open(this.product.urlAcces, '_blank');
      
      // 2. Estructura de control: Buscar la mejor oferta (el precio más bajo)
      let mainListingId: number | undefined = undefined;

      if (this.product.listings && this.product.listings.length > 0) {
        
        const bestListing = this.product.listings.reduce((ofertaAnterior, ofertaActual) => {
          
          // Calculamos el precio real (con descuento) de la oferta anterior
          const precioAnterior = ofertaAnterior.percentOff > 0 
            ? ofertaAnterior.price * (1 - ofertaAnterior.percentOff / 100) 
            : ofertaAnterior.price;
            
          // Calculamos el precio real (con descuento) de la oferta actual
          const precioActual = ofertaActual.percentOff > 0 
            ? ofertaActual.price * (1 - ofertaActual.percentOff / 100) 
            : ofertaActual.price;

          // Comparamos: si la actual es más barata, nos quedamos con la actual. Si no, mantenemos la anterior.
          return (precioActual < precioAnterior) ? ofertaActual : ofertaAnterior;
        });

        // Una vez que el reduce termina, le extraemos el ID al ganador
        mainListingId = bestListing.id;
      }

      // 3. Si encontramos un ID válido, disparamos el registro en la BD
      if (mainListingId !== undefined) {
        this.listingService.registerListingClick(mainListingId).subscribe({
          next: () => console.log(`✅ [Métrica Principal] Clic registrado para la mejor oferta (ID: ${mainListingId})`),
          error: (err) => console.error('❌ [Métrica] Falló el registro:', err)
        });
      }
    }
  }
}

