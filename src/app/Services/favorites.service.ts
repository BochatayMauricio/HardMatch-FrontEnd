import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class FavoritesService {
private readonly STORAGE_KEY = 'user_favorites';

  // Inicializamos el BehaviorSubject con lo que haya en LocalStorage o un array vacío
  private favoritesIds = new BehaviorSubject<number[]>(this.loadFromStorage());
  favorites$ = this.favoritesIds.asObservable();

  constructor() {}

  // Carga los datos guardados al arrancar
  private loadFromStorage(): number[] {
    const saved = localStorage.getItem(this.STORAGE_KEY);
    return saved ? JSON.parse(saved) : [];
  }

  // Guarda los datos en LocalStorage
  private saveToStorage(ids: number[]): void {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(ids));
  }

  toggleFavorite(productId: number): void {
    const currentIds = this.favoritesIds.value;
    let updatedIds: number[];

    if (currentIds.includes(productId)) {
      updatedIds = currentIds.filter(id => id !== productId);
    } else {
      updatedIds = [...currentIds, productId];
    }

    // Actualizamos el estado de la app y el almacenamiento físico
    this.favoritesIds.next(updatedIds);
    this.saveToStorage(updatedIds);
  }

  isFavorite(productId: number): boolean {
    return this.favoritesIds.value.includes(productId);
  }

  // Bonus: Método para vaciar todo
  clearAll(): void {
    this.favoritesIds.next([]);
    localStorage.removeItem(this.STORAGE_KEY);
  }
}
