import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, catchError, forkJoin, map, Observable, of } from 'rxjs';
import { BACKEND_API_URL } from '../../utils/constants';
import {
  ResponseFavoriteDelete,
  ResponseFavoriteList,
  ResponseFavoriteOne,
} from '../Interfaces/response-favorite.interface';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class FavoritesService {
  private readonly apiUrl = `${BACKEND_API_URL}/favorites`;
  private favoritesSubject = new BehaviorSubject<number[]>([]);
  favorites$ = this.favoritesSubject.asObservable();

  constructor(
    private http: HttpClient,
    private authService: AuthService,
  ) {
    this.authService.getCurrentUser().subscribe((user) => {
      if (user) {
        this.refreshFavorites().subscribe();
      } else {
        this.favoritesSubject.next([]);
      }
    });
  }

  refreshFavorites(): Observable<number[]> {
    if (!this.authService.isAuthenticated()) {
      this.favoritesSubject.next([]);
      return of([]);
    }

    return this.http
      .get<ResponseFavoriteList>(this.apiUrl)
      .pipe(
        map((response) => (response.data ?? []).map((fav) => fav.idProduct)),
        map((ids) => {
          this.favoritesSubject.next(ids);
          return ids;
        }),
        catchError(() => {
          this.favoritesSubject.next([]);
          return of([]);
        })
      );
  }

  toggleFavorite(productId: number): Observable<boolean> {
    const currentFavorites = this.favoritesSubject.getValue();

    if (currentFavorites.includes(productId)) {
      return this.removeFavorite(productId).pipe(map(() => false));
    }

    return this.addFavorite(productId).pipe(map(() => true));
  }

  private addFavorite(productId: number): Observable<ResponseFavoriteOne> {
    return this.http
      .post<ResponseFavoriteOne>(
        this.apiUrl,
        { idProduct: productId }
      )
      .pipe(
        map((response) => {
          const currentIds = this.favoritesSubject.value;
          if (!currentIds.includes(productId)) {
            this.favoritesSubject.next([...currentIds, productId]);
          }
          return response;
        })
      );
  }

  removeFavorite(productId: number): Observable<ResponseFavoriteDelete> {
    return this.http
      .delete<ResponseFavoriteDelete>(`${this.apiUrl}/${productId}`)
      .pipe(
        map((response) => {
          const updated = this.favoritesSubject.value.filter((id) => id !== productId);
          this.favoritesSubject.next(updated);
          return response;
        })
      );
  }

  clearAll(): Observable<void> {
    const currentFavorites = this.favoritesSubject.value;
    if (currentFavorites.length === 0) {
      return of(void 0);
    }

    return forkJoin(currentFavorites.map((id) => this.removeFavorite(id))).pipe(
      map(() => void 0)
    );
  }
}
