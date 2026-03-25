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

  getCurrentCategory(): string | null {
    const current = this.currentProductsValue();
    return current.length > 0 ? current[0].category : null;
  }

  canAddProduct(product: ProductI): AddProductResult {
    const current = this.currentProductsValue();

    if (current.length >= this.MAX_PRODUCTS) {
      return {
        success: false,
        message: `Límite de comparación alcanzado (${this.MAX_PRODUCTS} productos)`,
        errorType: 'limit',
      };
    }

    const exists = current.some((p) => p.id === product.id);
    if (exists) {
      return {
        success: false,
        message: 'Este producto ya está en la comparación',
        errorType: 'duplicate',
      };
    }

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

  removeProduct(productId: number): void {
    const updated = this.currentProductsValue().filter(
      (p) => p.id !== productId,
    );
    this._products.next(updated);
  }

  clearProducts(): void {
    this._products.next([]);
  }

  isProductInComparison(productId: number): boolean {
    return this.currentProductsValue().some((p) => p.id === productId);
  }

  getProductCount(): number {
    return this.currentProductsValue().length;
  }

  getMaxProducts(): number {
    return this.MAX_PRODUCTS;
  }

  private getCategoryLabel(category: string): string {
    const labels: { [key: string]: string } = {
      notebook: 'Notebooks',
      tablet: 'Tablets',
      mouse: 'Mouse',
    };
    return labels[category] || category;
  }
}

