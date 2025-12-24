import { Injectable } from '@angular/core';
import { UserI } from '../Interfaces/user.interface';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private usersLoguedPrototype: UserI[] = [
    {
      id: 1,
      name: 'Juan',
      surname: 'Pérez',
      email: 'juanperez@gmail.com',
      password: '123',
      username: 'juanperez',
      role: 'Usuario'
    },
    {
      id: 2,
      name: 'María',
      surname: 'Gómez',
      email: 'mariagomez@gmail.com',
      password: 'maria123',
      username: 'mariagomez',
      role: 'Administrador'
    }
  ]

  currentUser = new BehaviorSubject<UserI | null>(null);

  constructor() { 
    localStorage.setItem('users', JSON.stringify(this.usersLoguedPrototype));
  }

  getCurrentUser(): Observable<UserI | null> {
    // Lógica para obtener el usuario actual
    return this.currentUser.asObservable();
  }

  isAuthenticated(): boolean {
    // Lógica para verificar si el usuario está autenticado
    return true;
  }

  login(email: string, password: string): Promise<UserI|null> {
    // Lógica para iniciar sesión
    const usersLoguedStorage = localStorage.getItem('users');
    if (usersLoguedStorage) {
      this.usersLoguedPrototype = JSON.parse(usersLoguedStorage);
    }
    const user = this.usersLoguedPrototype.find(u => u.email === email && u.password === password);
    if (user) {
      this.currentUser.next(user);
      return Promise.resolve(user);
    }
    return Promise.resolve(null);
  }

  register(newUser: UserI): Promise<UserI> {
    // Lógica para registrar un nuevo usuario
    const usersLoguedStorage = localStorage.getItem('users');
    if (usersLoguedStorage) {
      this.usersLoguedPrototype = JSON.parse(usersLoguedStorage);
    }
    newUser.id = this.usersLoguedPrototype.length + 1;
    this.usersLoguedPrototype.push(newUser);
    localStorage.setItem('users', JSON.stringify(this.usersLoguedPrototype));
    this.currentUser.next(newUser);
    return Promise.resolve(newUser);
  }

  logout(): void {
    // Lógica para cerrar sesión
    this.currentUser.next(null);
  }
}
