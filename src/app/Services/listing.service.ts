import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { BACKEND_API_URL } from '../../utils/constants';

@Injectable({
  providedIn: 'root'
})
export class ListingService {
  private readonly apiUrl = `${BACKEND_API_URL}/listings`;
  constructor(private http: HttpClient) { }

  registerListingClick(listingId: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/${listingId}/click`, {});
  }
}