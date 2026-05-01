import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { BACKEND_API_URL } from '../../utils/constants';

export interface ScraperParams {
  queries: string[];
  maxPages?: number;
}

@Injectable({
  providedIn: 'root'
})
export class ScraperService {
  private readonly apiUrl = `${BACKEND_API_URL}/products`; // Ajustá a tu ruta real en Node

  constructor(private http: HttpClient) {}

  // Sincronización Global
  syncAllStores(params: ScraperParams): Observable<any> {
    return this.http.post(`${this.apiUrl}/sync-from-scraper`, params);
  }

  // Sincronizaciones Individuales
  syncMercadoLibre(params: ScraperParams): Observable<any> {
    return this.http.post(`${this.apiUrl}/sync-from-mercadolibre`, params);
  }

  syncCompraGamer(params: ScraperParams): Observable<any> {
    return this.http.post(`${this.apiUrl}/sync-from-compragamer`, params);
  }

  syncVenex(params: ScraperParams): Observable<any> {
    return this.http.post(`${this.apiUrl}/sync-from-venex`, params);
  }

  syncFravega(params: ScraperParams): Observable<any> {
    return this.http.post(`${this.apiUrl}/sync-from-fravega`, params);
  }
}