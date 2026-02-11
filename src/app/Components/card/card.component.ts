import { Component, inject, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common'; 
import { ProductI } from '../../Interfaces/product.interface';
import { ComparativesService } from '../../Services/comparatives.service';
import { ToastrService } from 'ngx-toastr';
import { FavoritesService } from '../../Services/favorites.service';
import { Router, RouterLink } from '@angular/router';
import { StoreService } from '../../Services/stores.service';
import { AuthService } from '../../Services/auth.service'; // <--- 1. Importar AuthService
import { UserI } from '../../Interfaces/user.interface';   // <--- 1. Importar UserI

@Component({
  selector: 'app-card',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './card.component.html',
  styleUrl: './card.component.css',
})
export class CardComponent implements OnInit {
  @Input() product!: ProductI;
  @Input() isInComparativeList: boolean = false;
  @Input() showDeleteButton: boolean = false;

  isFav: boolean = false;
  
  // Variable para controlar el usuario
  currentUser: UserI | null = null; // <--- 2. Variable de estado

  storeLogoUrl: string = 'assets/default-store.png';
  storeName: string = '';

  private favService = inject(FavoritesService);
  private storeService = inject(StoreService);
  private authService = inject(AuthService); // <--- 3. Inyectar AuthService
  private router = inject(Router);

  constructor(
    private comparativesService: ComparativesService,
    private toastr: ToastrService,
  ) {}

  ngOnInit(): void {
    // <--- 4. Suscribirse al usuario actual
    this.authService.getCurrentUser().subscribe(user => {
      this.currentUser = user;
    });

    this.comparativesService.getProducts().subscribe((products) => {
      this.isInComparativeList = products.some((p) => p.id === this.product.id);
    });

    this.favService.favorites$.subscribe((favs) => {
      this.isFav = favs.some((p) => p.id === this.product.id);
    });

    if (this.product.storeId) {
      const store = this.storeService.getStoreById(this.product.storeId);
      if (store) {
        this.storeLogoUrl = store.logo;
        this.storeName = store.name;
      }
    }
  }

  addToCompare(product: ProductI): void {
    const result = this.comparativesService.addProduct(product);
    if (result.success) {
      this.isInComparativeList = true;
      return;
    }

    this.isInComparativeList = false;

    switch (result.errorType) {
      case 'category':
        this.toastr.error(result.message, 'Categoría diferente');
        break;
      case 'limit':
        this.toastr.warning(result.message, 'Límite alcanzado');
        break;
      case 'duplicate':
        this.toastr.info(result.message, 'Ya agregado');
        break;
      default:
        this.toastr.warning(result.message, 'No se pudo agregar');
    }
  }

  seeDetails(product: ProductI): void {
    this.router.navigate(['/producto', product.id]);
  }

  deleteProductFromCompare(productId: number): void {
    this.comparativesService.removeProduct(productId);
    this.isInComparativeList = false;
  }

  toggleFavorite() {
    // <--- 5. Verificación de seguridad
    if (!this.currentUser) {
      this.toastr.info('Debes iniciar sesión para agregar favoritos', '¡Atención!');
      return;
    }

    this.favService.toggleFavorite(this.product);
    
    // Feedback visual (Opcional, igual que en el detalle)
    if (!this.isFav) { // Como el toggle es rápido, aquí chequeamos la inversión
       this.toastr.success('Producto agregado a favoritos', '¡Éxito!');
    }
  }
}