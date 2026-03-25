import { Component, OnInit } from '@angular/core';
import { NotificationComponent } from "../notification/notification.component";
import { Router, RouterLink } from '@angular/router';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { AuthService } from '../../Services/auth.service';
import { NotificationService } from '../../Services/notification.service';
import { UserI } from '../../Interfaces/user.interface';
import { StoreService } from '../../Services/stores.service'; 
import { StoreI } from '../../Interfaces/store.intefrace';
import { ToastrService } from 'ngx-toastr';
import { CategoriesService } from '../../Services/categories.service';
import { AsyncPipe } from '@angular/common';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [NotificationComponent, RouterLink, ReactiveFormsModule, AsyncPipe],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css'
})
export class NavbarComponent implements OnInit {

  searchQuery = new FormControl('');
  currentUser: UserI | null = null;
  hasUnreadNotifications$: Observable<boolean>;
  
  stores: StoreI[] = [];
  categories: string[] = [];

  constructor(
    private router: Router, 
    private authService: AuthService,
    private notificationService: NotificationService,
    private storeService: StoreService, 
    private categoriesService: CategoriesService,
    private toastr: ToastrService
  ) {
    this.hasUnreadNotifications$ = this.notificationService.hasUnread$.asObservable();
  }

  ngOnInit(): void {
    this.authService.getCurrentUser().subscribe(user => {
      this.currentUser = user;
    });

    this.storeService.getAllStores().subscribe({
      next: (storesData) => {
        this.stores = storesData;
      },
      error: (err) => {
        console.error('Error al cargar tiendas en la Navbar:', err);
      }
    });

    this.categoriesService.getCategoriesState().subscribe((categories) => {
      this.categories = categories.map((category) => category.name);
    });

    this.categoriesService.loadCategoriesIfNeeded().subscribe({
      error: (err) => {
        console.error('Error al cargar categorias en la Navbar:', err);
      },
    });
  }

  onSearch(): void {
    const query = this.searchQuery.value?.trim();
    if (query) {
      this.router.navigate(['/buscar', query]);
    }
    this.searchQuery.setValue('');
  }

  isAdminUser(): boolean {
    return this.authService.isAdmin();
  }

  logout(): void {
    this.toastr.warning('Sesión cerrada correctamente', 'Logout');
    this.authService.logout();
    this.currentUser = null;
    this.router.navigate(['/']);
  }
}

