import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { ProductI } from '../Interfaces/product.interface';

@Injectable({
  providedIn: 'root',
})
export class ComparativesService {
  private _products = new BehaviorSubject<ProductI[]>([]);
  public products$: Observable<ProductI[]> = this._products.asObservable();

  constructor() {}

  currentProductsValue(): ProductI[] {
    return this._products.getValue();
  }

  getProducts(): Observable<ProductI[]> {
    return this.products$;
  }

  addProduct(product: ProductI): boolean {
    const current = this.currentProductsValue();

    // Validación de límite
    if (current.length >= 3) {
      console.warn('Límite de comparación alcanzado (3 productos)');
      return false;
    }

    // Validación de duplicados
    const exists = current.some((p) => p.id === product.id);
    if (exists) {
      return false;
    }

    // Emitimos el nuevo estado
    this._products.next([...current, product]);
    return true;
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
}
