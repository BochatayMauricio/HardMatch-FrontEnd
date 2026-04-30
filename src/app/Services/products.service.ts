import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { HttpParams } from '@angular/common/http'; // Asegurate de agregar este import arriba
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

export interface PaginatedResponse<T> {
  data: T[];
  totalItems: number;
  totalPages: number;
  currentPage: number;
  maxPrice?: number;
  brands?: string[];
}

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
    const getFinalPrice = (listing: any) => listing.price;

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

      ratings: backendData.ratings || 0,
      reviews: backendData.reviews || 0,
      freeShipping: !!backendData.freeShipping,
      createdAt: new Date(backendData.createdAt || Date.now()),
      updatedAt: new Date(backendData.updatedAt || Date.now())
    };
  }

  getTopDiscounts(page: number = 1, limit: number = 8): Observable<PaginatedResponse<ProductI>> {
    // Usamos el endpoint estático que creamos
    return this.http.get<any>(`${this.apiUrl}/top-discounts?page=${page}&limit=${limit}`).pipe(
      map((response) => {
        if (response && response.success && response.data) {
          return {
            ...response.data,
            // Reutilizamos tu excelente mapeo para que las cards sigan funcionando igual
            data: response.data.data.map((item: any) => this.mapProductFromBackend(item))
          };
        }
        return { data: [], totalItems: 0, totalPages: 0, currentPage: 1 };
      }),
      catchError((error) => {
        console.error('Error al cargar mejores descuentos:', error);
        return of({ data: [], totalItems: 0, totalPages: 0, currentPage: 1 });
      })
    );
  }

  getRecommended(page: number = 1, limit: number = 8): Observable<PaginatedResponse<ProductI>> {
    return this.http.get<any>(`${this.apiUrl}/recommended?page=${page}&limit=${limit}`).pipe(
      map((response) => {
        if (response && response.success && response.data) {
          return {
            ...response.data,
            data: response.data.data.map((item: any) => this.mapProductFromBackend(item))
          };
        }
        return { data: [], totalItems: 0, totalPages: 0, currentPage: 1 };
      }),
      catchError((error) => {
        console.error('Error al cargar recomendaciones:', error);
        return of({ data: [], totalItems: 0, totalPages: 0, currentPage: 1 });
      })
    );
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

  getProducts(page: number = 1, limit: number = 12, filters: any = {}): Observable<PaginatedResponse<ProductI>> {
    let params = new HttpParams()
      .set('page', page)
      .set('limit', limit);

    if (filters.search) params = params.set('search', filters.search);
    if (filters.minPrice !== undefined && filters.minPrice !== null) {
      params = params.set('minPrice', filters.minPrice.toString());
    }
    if (filters.maxPrice !== undefined && filters.maxPrice !== null) {
      params = params.set('maxPrice', filters.maxPrice.toString());
    }
    if (filters.brandName) params = params.set('brandName', filters.brandName);
    if (filters.sortBy) params = params.set('sortBy', filters.sortBy);
    
    // Si hay array de variantes de categoría, las mandamos unidas por coma
    if (filters.categoryNames && filters.categoryNames.length > 0) {
      params = params.set('categoryNames', filters.categoryNames.join(','));
    }

    return this.http.get<any>(this.apiUrl, { params }).pipe(
      map((response) => {
        if (response && response.success && response.data) {
          return {
            ...response.data,
            data: response.data.data.map((item: any) => this.mapProductFromBackend(item))
          };
        }
        return { data: [], totalItems: 0, totalPages: 0, currentPage: 1 };
      }),
      catchError((error) => {
        console.error('Error al buscar productos:', error);
        this.toastr.error('Error al cargar resultados de búsqueda.');
        return of({ data: [], totalItems: 0, totalPages: 0, currentPage: 1 });
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

