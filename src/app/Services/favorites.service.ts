import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class FavoritesService {
  // Inicializamos el BehaviorSubject leyendo lo que haya en el LocalStorage
  private favoritesSubject = new BehaviorSubject<number[]>(this.loadFavorites());
  favorites$ = this.favoritesSubject.asObservable();

  constructor() {}

  // Lee de LocalStorage (Si no hay nada, devuelve un array vacío [])
  private loadFavorites(): number[] {
    const stored = localStorage.getItem('user_favorites');
    return stored ? JSON.parse(stored) : [];
  }

  // Agrega o quita un ID del array
  toggleFavorite(productId: number): void {
    const currentFavorites = this.favoritesSubject.getValue();
    
    if (currentFavorites.includes(productId)) {
      // Si el ID ya está, lo quitamos (Filtramos todos menos ese)
      const updated = currentFavorites.filter(id => id !== productId);
      this.updateAndSave(updated);
    } else {
      // LA SOLUCIÓN AL BUG: Agregamos el nuevo ID manteniendo los que ya estaban
      const updated = [...currentFavorites, productId];
      this.updateAndSave(updated);
    }
  }

  // Vacía la lista por completo
  clearAll(): void {
    this.updateAndSave([]);
  }

  // Actualiza el observable y guarda en LocalStorage para no perderlos al recargar la página
  private updateAndSave(favorites: number[]): void {
    this.favoritesSubject.next(favorites);
    localStorage.setItem('user_favorites', JSON.stringify(favorites));
  }
}