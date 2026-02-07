import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { NotificationI } from '../Interfaces/notification.interface';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  // Guardamos las notificaciones aquí
  private notificationsSubject = new BehaviorSubject<NotificationI[]>([]);
  notifications$ = this.notificationsSubject.asObservable();

  // Observable que dice si hay alguna sin leer
  hasUnread$ = new BehaviorSubject<boolean>(false);

  setNotifications(notifications: NotificationI[]) {
    this.notificationsSubject.next(notifications);
    this.updateUnreadStatus(notifications);
  }

  markAsRead(id: number) {
    const current = this.notificationsSubject.value;
    const updated = current.map(n => n.id === id ? { ...n, isRead: true } : n);
    this.setNotifications(updated);
  }

  private updateUnreadStatus(notifications: NotificationI[]) {
    const hasUnread = notifications.some(n => !n.isRead);
    this.hasUnread$.next(hasUnread);
  }

  markAllAsRead() {
    const current = this.notificationsSubject.value;
    const updated = current.map(n => ({ ...n, isRead: true, updatedAt: new Date() }));
    this.setNotifications(updated);
  }
}