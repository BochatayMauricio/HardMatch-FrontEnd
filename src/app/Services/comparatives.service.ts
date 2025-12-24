import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { ProductI } from '../Interfaces/product.interface';
import { StorageService } from './storage.service';

@Injectable({
  providedIn: 'root',
})
export class ComparativesService {
  products = new BehaviorSubject<ProductI[]>([]);
  
  constructor(private storageService: StorageService) {}

  addProduct(product: ProductI): boolean {
    const currentProducts = this.products.getValue();
    if(currentProducts.length == 3){
      return false;
    }
    if (!currentProducts.find(p => p.id === product.id)) {
      this.products.next([...currentProducts, product]);
    }
    this.storageService.setItem('comparativeProducts', this.products.getValue());
    return true;
  }

  removeProduct(productId: number): void {
    const currentProducts = this.products.getValue();
    const updatedProducts = currentProducts.filter(p => p.id !== productId);
    this.products.next(updatedProducts);
    this.storageService.setItem('comparativeProducts', updatedProducts);
  }

  clearProducts(): void {
    this.products.next([]);
    this.storageService.removeItem('comparativeProducts');
  }

  getProducts() {
    const storedProducts = this.storageService.getItem('comparativeProducts');
    if (storedProducts) {
      this.products.next(storedProducts);
    }
    return this.products.asObservable();
  }
}
