import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { BACKEND_API_URL } from '../../utils/constants';

@Injectable({
  providedIn: 'root'
})
export class RecommendationService {
  private readonly apiUrl = `${BACKEND_API_URL}/recommendations`;

  constructor(private http: HttpClient) {}

  getMyRecommendations(): Observable<any[]> {
    // Apuntamos al endpoint que armamos en recomendation.routes.ts
    return this.http.get<any>(`${this.apiUrl}/my-recommendations`).pipe(
      map(res => res.data)
    );
  }
}