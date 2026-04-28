import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BACKEND_API_URL } from '../../utils/constants';

@Injectable({
  providedIn: 'root'
})
export class SearchLoggerService {

  private readonly apiUrl = `${BACKEND_API_URL}/queries`;

  constructor(private http: HttpClient) {}

  logSearch(term: string, productId: number | null = null): void {
    const cleanTerm = term?.trim();
    if (!cleanTerm || cleanTerm.length < 2) return;

    // Hacemos el POST de forma silenciosa (no retornamos el Observable al componente)
    this.http.post(this.apiUrl, { 
      search: cleanTerm, 
      idProduct: productId 
    }).subscribe({
      // Si falla (ej: sin internet), no le mostramos error al usuario, es solo una métrica
      error: (err) => console.warn('Métrica de búsqueda no registrada', err)
    });
  }
}