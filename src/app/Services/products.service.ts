import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, map, catchError, of } from 'rxjs';
import { ToastrService } from 'ngx-toastr';
import { ProductI } from '../Interfaces/product.interface';
import {
  ResponseProduct,
  ResponseProductApi,
  ResponseProductFeature,
  ResponseProductFeatureValue,
} from '../Interfaces/response-product.interface';
import { BACKEND_API_URL } from '../../utils/constants';

@Injectable({
  providedIn: 'root',
})
export class ProductsService {
  private readonly apiUrl = `${BACKEND_API_URL}/products`;

  private favoritesIds = new BehaviorSubject<number[]>([]);
  favorites$ = this.favoritesIds.asObservable();

  constructor(
    private http: HttpClient,
    private toastr: ToastrService,
  ) {}

  private mapProductFromBackend(backendData: ResponseProduct): ProductI {
    const mappedListings = (backendData.listings || []).map((l) => ({
      id: l.id,
      storeId: l.store?.id || 1,
      storeName: l.store?.name || 'Tienda Oficial',
      // CAMBIO AQUÍ: Aseguramos que mapeamos el logo que viene del backend
      storeLogo: l.store?.logo || 'assets/default-store.svg', 
      urlAccess: l.urlAccess || '#',
      percentOff: Number(l.percentOff || 0),
      price: Number(l.priceTotal || backendData.price || 0)
    }));

    // Calculamos el precio final de bolsillo para poder comparar
    const getFinalPrice = (listing: any) => listing.price * (1 - (listing.percentOff / 100));

    // Buscamos la oferta que resulte en el MENOR precio final
    const bestListing = mappedListings.length > 0
      ? mappedListings.reduce((prev, curr) => (getFinalPrice(curr) < getFinalPrice(prev) ? curr : prev))
      : null;

    const rawFeatures = backendData.features || backendData.products_details || [];
    const backendBrand = typeof backendData.brand === 'string'
      ? backendData.brand
      : backendData.brand?.name;
    const backendCategory = typeof backendData.category === 'string'
      ? backendData.category
      : backendData.category?.name;

    return {
      id: backendData.id,
      name: backendData.name,
      image: backendData.imageUrl || 'assets/default-product.png',
      
      // EL CAMBIO CLAVE: Usamos el precio original de la tienda ganadora, no el genérico
      price: bestListing ? bestListing.price : (Number(backendData.price) || 0),

      brand: backendBrand || backendData.brandName || 'Genérica',
      category: backendCategory || backendData.categoryName || 'General',
      description: backendData.description || 'Sin descripción detallada.',

      caracteristics: this.parseFeatures(rawFeatures),

      urlAcces: bestListing ? bestListing.urlAccess : (backendData.urlAccess || '#'),
      offer: bestListing && bestListing.percentOff > 0 ? String(bestListing.percentOff) : undefined,
      storeId: bestListing ? bestListing.storeId : 1,
      storeName: bestListing ? bestListing.storeName : 'Tienda Oficial',

      listings: mappedListings,

      stock: backendData.stock || 0,
      ratings: backendData.ratings || 0,
      reviews: backendData.reviews || 0,
      freeShipping: !!backendData.freeShipping,
      createdAt: new Date(backendData.createdAt || Date.now()),
      updatedAt: new Date(backendData.updatedAt || Date.now())
    };
  }

  private parseFeatures(features: ResponseProductFeature[]): Record<string, ResponseProductFeatureValue> {
    if (!features || !Array.isArray(features)) {
      return {};
    }

    const result: Record<string, ResponseProductFeatureValue> = {};
    features.forEach((f) => {
      const key = f.keyword || f.nombre;
      const val = f.value || f.valor;

      if (key && val) {
        result[key] = val;
      }
    });
    return result;
  }

  getProducts(): Observable<ProductI[]> {
    return this.http.get<ResponseProductApi<ResponseProduct[]>>(this.apiUrl).pipe(
      map((response) => {
        if (response && response.success && response.data) {
          return response.data.map((item) => this.mapProductFromBackend(item));
        }
        return [];
      }),
      catchError((error) => {
        console.error('Error crítico al conectar con el backend:', error);
        this.toastr.error(
          'No pudimos obtener el listado de productos. Intenta nuevamente en unos minutos.',
          'Error al cargar productos',
        );
        return of([]);
      })
    );
  }

  getProductById(id: number): Observable<ProductI | null> {
    return this.http.get<ResponseProductApi<ResponseProduct>>(`${this.apiUrl}/${id}`).pipe(
      map((response) => {
        if (response && response.success && response.data) {
          return this.mapProductFromBackend(response.data);
        }
        return null;
      }),
      catchError((error) => {
        console.error(`Error al buscar producto ${id}:`, error);
        this.toastr.error(
          `No pudimos cargar el producto solicitado (ID: ${id}).`,
          'Error al buscar producto',
        );
        return of(null);
      })
    );
  }

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

