import { Injectable } from '@angular/core';
import { UserI } from '../Interfaces/user.interface';
import { BehaviorSubject, firstValueFrom, Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { AuthBackendResponse } from '../Interfaces/response.interface';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  // private apiUrl= process.env.API_URL;
  private apiUrl = 'http://localhost:3000/api/auth'; 

  currentUser = new BehaviorSubject<UserI | null>(null);

  constructor(private http: HttpClient) { 
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      this.currentUser.next(JSON.parse(storedUser));
    }
  }

  getCurrentUser(): Observable<UserI | null> {
    // Lógica para obtener el usuario actual
    return this.currentUser.asObservable();
  }

  isAuthenticated(): boolean {
    // Lógica para verificar si el usuario está autenticado
    return !!localStorage.getItem('token');
  }

  async login(email: string, password: string): Promise<UserI|null> {
    try {
      // Hacemos el POST al backend
      const response = await firstValueFrom(
        this.http.post<AuthBackendResponse>(`${this.apiUrl}/login`, { email, password })
      );

      if (response.success && response.data) {
        const { user, token } = response.data;
        
        // Guardamos el JWT para las futuras peticiones seguras
        localStorage.setItem('token', token);
        // Guardamos el usuario para mantener la sesión al recargar la página
        localStorage.setItem('user', JSON.stringify(user));
        
        this.currentUser.next(user);
        return user;
      }
      return null;
    } catch (error) {
      console.error('Error en el login:', error);
      throw error; // Lanzamos el error para que el componente (ej. login.component.ts) lo maneje y muestre un mensaje
    }
  }

  async register(newUser: UserI): Promise<UserI> {try {
      const response = await firstValueFrom(
        this.http.post<AuthBackendResponse>(`${this.apiUrl}/register`, newUser)
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
      console.error('Error al registrar usuario:', error);
      throw error;
    }
  }

  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    this.currentUser.next(null);
  }
}
