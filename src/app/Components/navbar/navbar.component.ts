import { Component, OnInit } from '@angular/core';
import { NotificationComponent } from "../notification/notification.component";
import { UpperCasePipe } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { AuthService } from '../../Services/auth.service';
import { NotificationService } from '../../Services/notification.service';
import { UserI } from '../../Interfaces/user.interface';
import { StoreService, StoreI } from '../../Services/stores.service'; 

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
    private storeService: StoreService
  ) {
    this.authService.getCurrentUser().subscribe(user => {
      this.currentUser = user;
    });
  }

  ngOnInit(): void {
    this.notificationService.hasUnread$.subscribe(hasUnread => {
      this.hasUnreadNotifications = hasUnread;
    });

    this.stores = this.storeService.getStores();
  }

  onSearch(): void {
    const query = this.searchQuery.value?.trim();
    if (query) {
      this.router.navigate(['/buscar', query]);
    }
    this.searchQuery.setValue('');
  }

  logout(): void {
    this.authService.logout();
    this.currentUser = null;
    this.router.navigate(['/']);
  }
}