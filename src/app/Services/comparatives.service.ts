import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { ProductI } from '../Interfaces/product.interface';

export interface AddProductResult {
  success: boolean;
  message: string;
  errorType?: 'limit' | 'duplicate' | 'category';
}

@Injectable({
  providedIn: 'root',
})
export class ComparativesService {
  private _products = new BehaviorSubject<ProductI[]>([]);
  public products$: Observable<ProductI[]> = this._products.asObservable();

  private readonly MAX_PRODUCTS = 3;

  constructor() {}

  currentProductsValue(): ProductI[] {
    return this._products.getValue();
  }

  getProducts(): Observable<ProductI[]> {
    return this.products$;
  }

  /**
   * Obtiene la categoría actual de la comparación (si hay productos)
   */
  getCurrentCategory(): string | null {
    const current = this.currentProductsValue();
    return current.length > 0 ? current[0].category : null;
  }

  /**
   * Valida si un producto puede ser agregado a la comparación
   */
  canAddProduct(product: ProductI): AddProductResult {
    const current = this.currentProductsValue();

    // Validación de límite
    if (current.length >= this.MAX_PRODUCTS) {
      return {
        success: false,
        message: `Límite de comparación alcanzado (${this.MAX_PRODUCTS} productos)`,
        errorType: 'limit',
      };
    }

    // Validación de duplicados
    const exists = current.some((p) => p.id === product.id);
    if (exists) {
      return {
        success: false,
        message: 'Este producto ya está en la comparación',
        errorType: 'duplicate',
      };
    }

    // Validación de categoría
    const currentCategory = this.getCurrentCategory();
    if (currentCategory && product.category !== currentCategory) {
      return {
        success: false,
        message: `Solo puedes comparar productos de la misma categoría. Categoría actual: ${this.getCategoryLabel(currentCategory)}`,
        errorType: 'category',
      };
    }

    return {
      success: true,
      message: 'Producto agregado a la comparación',
    };
  }

  /**
   * Agrega un producto a la comparación con validación completa
   */
  addProduct(product: ProductI): AddProductResult {
    const validation = this.canAddProduct(product);

    if (!validation.success) {
      console.warn(validation.message);
      return validation;
    }

    const current = this.currentProductsValue();
    this._products.next([...current, product]);

    return validation;
  }

  /**
   * Remueve un producto de la comparación
   */
  removeProduct(productId: number): void {
    const updated = this.currentProductsValue().filter(
      (p) => p.id !== productId,
    );
    this._products.next(updated);
  }

  /**
   * Limpia todos los productos de la comparación
   */
  clearProducts(): void {
    this._products.next([]);
  }

  /**
   * Verifica si un producto está en la comparación
   */
  isProductInComparison(productId: number): boolean {
    return this.currentProductsValue().some((p) => p.id === productId);
  }

  /**
   * Obtiene el número de productos en la comparación
   */
  getProductCount(): number {
    return this.currentProductsValue().length;
  }

  /**
   * Obtiene el límite máximo de productos
   */
  getMaxProducts(): number {
    return this.MAX_PRODUCTS;
  }

  /**
   * Obtiene una etiqueta legible para la categoría
   */
  private getCategoryLabel(category: string): string {
    const labels: { [key: string]: string } = {
      notebook: 'Notebooks',
      tablet: 'Tablets',
      mouse: 'Mouse',
    };
    return labels[category] || category;
  }
}
