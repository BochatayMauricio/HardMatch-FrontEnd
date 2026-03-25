import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { ResponseStore } from '../Interfaces/response-store.interface';
import { StoreI } from '../Interfaces/store.intefrace';
import { BACKEND_API_URL } from '../../utils/constants';

@Injectable({
  providedIn: 'root'
})
export class StoreService {
  private readonly apiUrl = `${BACKEND_API_URL}/stores`;

  constructor(private http: HttpClient) {}

  getStoreById(id: number): Observable<StoreI> {
    return this.http.get<ResponseStore<StoreI> | StoreI>(`${this.apiUrl}/${id}`).pipe(
      map((res) => this.extractData(res))
    );
  }

  getAllStores(): Observable<StoreI[]> {
    return this.http.get<ResponseStore<StoreI[]> | StoreI[]>(this.apiUrl).pipe(
      map((res) => this.extractData(res))
    );
  }

  getStoreByName(name: string): Observable<StoreI | undefined> {
    return this.getAllStores().pipe(
      map((stores) => {
        const storeNameParam = decodeURIComponent(name).toLowerCase().trim();

        return stores.find(
          (store) => store.name.toLowerCase().trim() === storeNameParam
        );
      })
    );
  }

  private extractData<T>(response: ResponseStore<T> | T): T {
    if (response && typeof response === 'object' && 'data' in response) {
      return (response as ResponseStore<T>).data;
    }
    return response as T;
  }
}
