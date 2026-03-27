import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, map, catchError, of } from 'rxjs';
import { ProductI } from '../Interfaces/product.interface';

@Injectable({
  providedIn: 'root',
})
export class ProductsServiceService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:3000/api/products'; // Ajusta tu puerto si es necesario

  private favoritesIds = new BehaviorSubject<number[]>([]);
  favorites$ = this.favoritesIds.asObservable();

  constructor() {}

  /**
   * EL ADAPTADOR: Transforma la respuesta de Sequelize a ProductI
   */
  private mapProductFromBackend(backendData: any): ProductI {
    // 1. Mapeamos TODAS las ofertas (a prueba de cambios de nombres en el backend)
    const mappedListings = (backendData.listings || []).map((l: any) => ({
      id: l.id,
      storeId: l.store?.id || 1,
      storeName: l.store?.name || 'Tienda Oficial',
      storeLogo: l.store?.logo || 'assets/default-store.png',
      // Agregamos los nuevos campos del banner por si los necesitas en la vista
      storeBanner: l.store?.banner,
      storeDescription: l.store?.description,
      storeLocation: l.store?.location,
      urlAccess: l.urlAccess || '#',
      // Soportamos percentOff (camelCase) o percent_off (snake_case)
      percentOff: Number(l.percentOff || l.percent_off || 0),
      // Soportamos priceTotal, price_total, o si no hay oferta, caemos al precio base
      price: Number(l.priceTotal || l.price_total || backendData.price || 0)
    }));

    // 2. Buscamos la MEJOR OFERTA (la que tenga mayor descuento) para el Home
    let bestListing = null;
    if (mappedListings.length > 0) {
      bestListing = mappedListings.reduce((prev: any, curr: any) => {
        return (curr.percentOff > prev.percentOff) ? curr : prev;
      });
    }

    // 3. Capturamos las características vengan como vengan
    const rawFeatures = backendData.features || backendData.products_details || [];

    return {
      id: backendData.id,
      name: backendData.name,
      image: backendData.urlAccess || 'assets/default-product.png',
      price: Number(backendData.price) || 0,
      
      // Soportamos si la marca/categoría viene como objeto {name: 'Intel'} o como string 'Intel'
      brand: backendData.brand?.name || backendData.brandName || backendData.brand || 'Genérica',
      category: backendData.category?.name || backendData.categoryName || backendData.category || 'General',
      description: backendData.description || 'Sin descripción detallada.',
      
      caracteristics: this.parseFeatures(rawFeatures),

      // Datos de la MEJOR oferta (Para la Card del Home)
      urlAcces: bestListing ? bestListing.urlAccess : (backendData.urlAccess || '#'), // (Respeto tu typo 'urlAcces')
      offer: bestListing && bestListing.percentOff > 0 ? String(bestListing.percentOff) : undefined,
      storeId: bestListing ? bestListing.storeId : 1,
      storeName: bestListing ? bestListing.storeName : 'Tienda Oficial',
      
      // Guardamos el historial completo de ofertas para la vista de Detalles
      listings: mappedListings,

      stock: backendData.stock || 0,
      ratings: backendData.ratings || 0,
      reviews: backendData.reviews || 0,
      freeShipping: !!backendData.freeShipping,
      createdAt: new Date(backendData.createdAt || Date.now()),
      updatedAt: new Date(backendData.updatedAt || Date.now())
    };
  }

  /**
   * Convierte el array de features a un objeto clave-valor
   */
  private parseFeatures(features: any[]): any {
    if (!features || !Array.isArray(features)) {
      return {};
    }
    
    const result: any = {};
    features.forEach(f => {
      // Soportamos la estructura nueva (keyword/value) o la vieja (nombre/valor)
      const key = f.keyword || f.nombre;
      const val = f.value || f.valor;
      
      if (key && val) {
        result[key] = val;
      }
    });
    return result;
  }

  /**
   * Obtener todos los productos
   */
  getProducts(): Observable<ProductI[]> {
    return this.http.get<any>(this.apiUrl).pipe(
      map(response => {
        // Asegúrate de que aquí haya un && y no una coma (,)
        if (response && response.success && response.data) {
          return response.data.map((item: any) => this.mapProductFromBackend(item));
        }
        return [];
      }),
      catchError(error => {
        console.error('Error crítico al conectar con el backend:', error);
        return of([]); 
      })
    );
  }

  /**
   * Obtener producto por ID
   */
  getProductById(id: number): Observable<ProductI | null> {
    return this.http.get<any>(`${this.apiUrl}/${id}`).pipe(
      map(response => {
        // Asegúrate de que aquí haya un && y no una coma (,)
        if (response && response.success && response.data) {
          return this.mapProductFromBackend(response.data);
        }
        return null;
      }),
      catchError(error => {
        console.error(`Error al buscar producto ${id}:`, error);
        return of(null);
      })
    );
  }

  // --- MÉTODOS DE FAVORITOS ---
  toggleFavorite(productId: number): void {
    const currentIds = this.favoritesIds.value;
    if (currentIds.includes(productId)) {
      this.favoritesIds.next(currentIds.filter((id) => id !== productId));
    } else {
      this.favoritesIds.next([...currentIds, productId]);
    }
  }

  isFavorite(productId: number): boolean {
    return this.favoritesIds.value.includes(productId);
  }
}