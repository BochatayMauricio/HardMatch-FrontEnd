import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { UserI } from '../Interfaces/user.interface';
// Ajustá la ruta de tu constante si es diferente
import { BACKEND_API_URL } from '../../utils/constants'; 

@Injectable({
  providedIn: 'root'
})
export class UserService {
  // Ajustá esta ruta base según cómo esté en tu backend (ej. /api/users)
  private readonly apiUrl = `${BACKEND_API_URL}/users`;

  constructor(private http: HttpClient) {}

  updateProfile(userData: Partial<UserI>): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/modify-profile`, userData);
  }

  updatePassword(passwordData: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/change-password`, passwordData);
  }
}