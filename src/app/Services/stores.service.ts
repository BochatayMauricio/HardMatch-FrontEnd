import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { StoreI } from '../Interfaces/store.intefrace';

@Injectable({
  providedIn: 'root'
})
export class StoreService {
  private apiUrl = 'http://localhost:3000/api/stores'; // Ajusta a tu ruta de backend

  constructor(private http: HttpClient) {}

  // Ahora devuelve un Observable con los datos reales
  getStoreById(id: number): Observable<StoreI> {
    return this.http.get<any>(`${this.apiUrl}/${id}`).pipe(
      map(res => {
        // Si el backend devuelve un objeto con 'data', lo extraemos
        return res.data ? res.data : res;
      })
    );
  }

  // Opcional: Para la página de marcas/tiendas
  getAllStores(): Observable<StoreI[]> {
    return this.http.get<any>(this.apiUrl).pipe(
      map(res => res.data || res)
    );
  }

  getStoreByName(name: string): Observable<StoreI | undefined> {
    return this.getAllStores().pipe(
      map(stores => {
        // Buscamos la tienda ignorando mayúsculas, minúsculas y espacios
        // para que las URLs como /stores/Tienda%20Oficial no fallen
        const storeNameParam = decodeURIComponent(name).toLowerCase().trim();
        
        return stores.find(
          store => store.name.toLowerCase().trim() === storeNameParam
        );
      })
    );
  }
}