import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class FavoritesService {
  private storageKey = 'my_favorites';
  private favoritesSubject = new BehaviorSubject<any[]>(this.getStoredFavorites());
  
  favorites$ = this.favoritesSubject.asObservable();

  private getStoredFavorites(): any[] {
    const data = localStorage.getItem(this.storageKey);
    return data ? JSON.parse(data) : [];
  }

  toggleFavorite(product: any) {
    let current = this.getStoredFavorites();
    const index = current.findIndex((p: any) => p.id === product.id);

    if (index > -1) {
      current.splice(index, 1);
    } else {
      current.push(product);
    }

    this.updateStorage(current);
  }

  // Método para vaciar toda la lista
  clearAll() {
    this.updateStorage([]);
  }

  private updateStorage(favorites: any[]) {
    localStorage.setItem(this.storageKey, JSON.stringify(favorites));
    this.favoritesSubject.next(favorites);
  }
}