import { Component, OnInit } from '@angular/core';
import { NotificationComponent } from "../notification/notification.component";
import { UpperCasePipe } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { AuthService } from '../../Services/auth.service';
import { NotificationService } from '../../Services/notification.service';
import { UserI } from '../../Interfaces/user.interface';
import { StoreService } from '../../Services/stores.service'; 
import { StoreI } from '../../Interfaces/store.intefrace'; // (Mantuve el nombre de tu archivo exacto)
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [NotificationComponent, UpperCasePipe, RouterLink, ReactiveFormsModule],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css'
})
export class NavbarComponent implements OnInit {

  searchQuery = new FormControl('');
  currentUser: UserI | null = null;
  hasUnreadNotifications: boolean = false;
  
  stores: StoreI[] = [];

  categories: string[] = [
    "Notebooks",
    "PCs de Escritorio",
    "Componentes",
    "Monitores",
    "Gaming",
    "Almacenamiento",
    "Perifericos",
    "Redes",
    "Impresoras",
    "Accesorios"
  ];

  constructor(
    private router: Router, 
    private authService: AuthService,
    private notificationService: NotificationService,
    private storeService: StoreService, 
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    // 1. Suscripción al usuario
    this.authService.getCurrentUser().subscribe(user => {
      this.currentUser = user;
    });

    // 2. Suscripción a notificaciones
    this.notificationService.hasUnread$.subscribe(hasUnread => {
      this.hasUnreadNotifications = hasUnread;
    });

    // 3. Suscripción asíncrona a la base de datos de Tiendas
    this.storeService.getAllStores().subscribe({
      next: (storesData) => {
        this.stores = storesData;
        console.log(this.stores); // Verificar que las tiendas se cargaron correctamente
      },
      error: (err) => {
        console.error('Error al cargar tiendas en la Navbar:', err);
      }
    });
  }

  onSearch(): void {
    const query = this.searchQuery.value?.trim();
    if (query) {
      this.router.navigate(['/buscar', query]);
    }
    this.searchQuery.setValue('');
  }

  logout(): void {
    this.toastr.warning('Sesión cerrada correctamente', 'Logout');
    this.authService.logout();
    this.currentUser = null;
    this.router.navigate(['/']);
  }
}