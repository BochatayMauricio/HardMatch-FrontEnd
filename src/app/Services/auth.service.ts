import { Injectable } from '@angular/core';
import { UserI, UserRegisterI } from '../Interfaces/user.interface';
import { BehaviorSubject, firstValueFrom, Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { ResponseAuth } from '../Interfaces/response.interface';
import { BACKEND_API_URL } from '../../utils/constants';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private readonly apiUrl = `${BACKEND_API_URL}/auth`;

  currentUser = new BehaviorSubject<UserI | null>(null);

  constructor(private http: HttpClient) { 
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      this.currentUser.next(JSON.parse(storedUser));
    }
  }

  getCurrentUser(): Observable<UserI | null> {
    return this.currentUser.asObservable();
  }

  getCurrentUserValue(): UserI | null {
    return this.currentUser.value;
  }

  hasRole(expectedRoles: string[]): boolean {
    const user = this.getCurrentUserValue();
    if (!user?.role) {
      return false;
    }

    const normalizedUserRole = user.role.trim().toLowerCase();
    return expectedRoles.some((role) => role.trim().toLowerCase() === normalizedUserRole);
  }

  isAdmin(): boolean {
    return this.hasRole(['ADMIN', 'administrador']);
  }

  isAuthenticated(): boolean {
    return !!localStorage.getItem('token');
  }

  async login(email: string, password: string): Promise<UserI|null> {
    try {
      const response = await firstValueFrom(
        this.http.post<ResponseAuth>(`${this.apiUrl}/login`, { email, password })
      );

      if (response.success && response.data) {
        const { user, token } = response.data;

        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));
        
        this.currentUser.next(user);
        return user;
      }
      return null;
    } catch (error) {
      throw error;
    }
  }

  async register(newUser: UserRegisterI): Promise<UserI> {
    try {
      const response = await firstValueFrom(
        this.http.post<ResponseAuth>(`${this.apiUrl}/register`, newUser)
      );

      if (response.success && response.data) {
        const { user, token } = response.data;

        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));
        
        this.currentUser.next(user);
        return user;
      }
      throw new Error('Error en el registro');
    } catch (error) {
      throw error;
    }
  }

  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    this.currentUser.next(null);
  }
}
