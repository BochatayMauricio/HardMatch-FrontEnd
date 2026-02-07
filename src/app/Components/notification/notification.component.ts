import { Component, OnInit } from '@angular/core';
import { NotificationI } from '../../Interfaces/notification.interface';
import { DatePipe, UpperCasePipe, CommonModule } from '@angular/common';
import { NotificationService } from '../../Services/notification.service';

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

  constructor(public notificationService: NotificationService) {}

  ngOnInit(): void {
    const initialData: NotificationI[] = [
      {
        id: 1,
        title: "Nuevo mensaje de soporte",
        explanation: "Tu solicitud de soporte ha sido respondida. Revisa tu bandeja de entrada para más detalles.",
        isRead: true,
        userId: 123,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 2,
        title: "Oferta especial en notebooks",
        explanation: "Aprovecha un 15% de descuento en todas las notebooks hasta fin de mes.",
        isRead: true,
        userId: 123,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 3,
        title: "Actualización de seguridad",
        explanation: "Hemos implementado nuevas medidas de seguridad para proteger tu cuenta.",
        isRead: false,
        userId: 123,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 4,
        title: "Recordatorio de carrito abandonado",
        explanation: "Tienes artículos en tu carrito esperando ser comprados. ¡No te los pierdas!",
        isRead: false,
        userId: 123,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];

    this.notificationService.setNotifications(initialData);

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
}