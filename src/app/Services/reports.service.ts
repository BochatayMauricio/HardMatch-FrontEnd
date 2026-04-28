import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { BACKEND_API_URL } from '../../utils/constants';

@Injectable({
  providedIn: 'root'
})
export class AdminReportService {
    private readonly apiUrl = `${BACKEND_API_URL}/admin/reports`;

  constructor(private http: HttpClient) {}

  // Métodos que ya tenías en el back:
  
  getScraperStats(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/scraper-stats`).pipe(map(res => res.data));
  }

  getGeneralStats(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/general-stats`).pipe(map(res => res.data));
  }

  getTopProducts(limit: number = 5): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/top-favorites?limit=${limit}`).pipe(map(res => res.data));
  }

  getTopSearches(limit: number = 5): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/top-searches?limit=${limit}`).pipe(map(res => res.data));
  }

  triggerScraper(): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/admin/scraper/run`, {});
  }

  getMarketplaceStatuses(): Observable<any[]> {
  return this.http.get<any>(`${this.apiUrl}/marketplace-status`).pipe(
    map(res => res.data)
  );
  }

  getTrafficData(): Observable<number[]> {
    return this.http.get<number[]>(`${this.apiUrl}/weekly-traffic`); 
  }
}