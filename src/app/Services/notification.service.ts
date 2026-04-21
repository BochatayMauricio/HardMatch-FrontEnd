// src/app/Services/notification.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { NotificationI } from '../Interfaces/notification.interface';
import { BACKEND_API_URL } from '../../utils/constants';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private readonly apiUrl = `${BACKEND_API_URL}/notifications`;

  private notificationsSubject = new BehaviorSubject<NotificationI[]>([]);
  public notifications$ = this.notificationsSubject.asObservable();

  private hasUnreadSubject = new BehaviorSubject<boolean>(false);
  public hasUnread$ = this.hasUnreadSubject.asObservable();

  constructor(private http: HttpClient) {}

  // 1. Cargar desde la base de datos
  fetchNotifications(): void {
    this.http.get<{success: boolean, data: NotificationI[]}>(this.apiUrl).subscribe({
      next: (res) => {
        if (res.success) {
          this.notificationsSubject.next(res.data);
          this.updateUnreadStatus(res.data);
        }
      },
      error: (err) => console.error("Error cargando notificaciones", err)
    });
  }

  // 2. Marcar una como leída
  markAsRead(id: number): void {
    this.http.put(`${this.apiUrl}/${id}/read`, {}).subscribe(() => {
      // Actualizamos el estado local sin tener que recargar todo de la BD
      const current = this.notificationsSubject.value;
      const updated = current.map(n => n.id === id ? { ...n, isRead: true } : n);
      this.notificationsSubject.next(updated);
      this.updateUnreadStatus(updated);
    });
  }

  // 3. Marcar todas como leídas
  markAllAsRead(): void {
    this.http.put(`${this.apiUrl}/read-all`, {}).subscribe(() => {
      const current = this.notificationsSubject.value;
      const updated = current.map(n => ({ ...n, isRead: true }));
      this.notificationsSubject.next(updated);
      this.updateUnreadStatus(updated);
    });
  }

  private updateUnreadStatus(notifications: NotificationI[]): void {
    const hasUnread = notifications.some(n => !n.isRead);
    this.hasUnreadSubject.next(hasUnread);
  }
}