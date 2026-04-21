// src/app/Components/notification/notification.component.ts
import { Component, OnInit } from '@angular/core';
import { NotificationI } from '../../Interfaces/notification.interface';
import { DatePipe, CommonModule } from '@angular/common';
import { NotificationService } from '../../Services/notification.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-notification',
  standalone: true,
  imports: [DatePipe, CommonModule],
  templateUrl: './notification.component.html',
  styleUrl: './notification.component.css'
})
export class NotificationComponent implements OnInit {

  showRead: boolean = false;
  titleButton: string = "Mostrar todas";
  notifications: NotificationI[] = [];

  constructor(public notificationService: NotificationService, private router: Router) {}

  ngOnInit(): void {
    // 1. Mandamos a pedir las notificaciones reales al backend
    this.notificationService.fetchNotifications();

    // 2. Nos suscribimos a los cambios
    this.notificationService.notifications$.subscribe(data => {
      this.notifications = data;
    });
  }

  markAsRead(id: number): void {
    this.notificationService.markAsRead(id);
  }

  toggleShowRead(): void {
    this.showRead = !this.showRead;
    this.titleButton = this.showRead ? "Mostrar no leídas" : "Mostrar todas";
  }

  markAllAsRead(): void {
    this.notificationService.markAllAsRead();
  }

  onNotificationClick(notification: NotificationI): void {
    // 1. Si no está leída, la marcamos como leída en segundo plano
    if (!notification.isRead) {
      this.markAsRead(notification.id);
    }

    // 2. Si tiene una URL, lo redirigimos
    if (notification.actionUrl) {
      // Chequeamos si es una URL externa (http) o una ruta interna de Angular (/producto/11)
      if (notification.actionUrl.startsWith('http')) {
        window.open(notification.actionUrl, '_blank'); // Abre en pestaña nueva
      } else {
        this.router.navigate([notification.actionUrl]); // Navega internamente
        // Opcional: podés cerrar el menú desplegable de notificaciones acá si querés
      }
    }
  }
}