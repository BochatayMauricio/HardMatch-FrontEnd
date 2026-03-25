import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { CardComponent } from '../../Components/card/card.component';
import { FavoritesService } from '../../Services/favorites.service';
import { ProductsServiceService } from '../../Services/products-service.service';
import { ProductI } from '../../Interfaces/product.interface';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-user-favorites',
  standalone: true,
  imports: [CommonModule, CardComponent, RouterLink],
  templateUrl: './user-favorites.component.html',
  styleUrl: './user-favorites.component.css'
})
export class UserFavoritesComponent implements OnInit {
  allProducts: ProductI[] = [];
  favoriteProducts: ProductI[] = [];
  favoriteIds: number[] = [];
  
  isLoading: boolean = true;

  constructor(
    private favoritesService: FavoritesService,
    private productsService: ProductsServiceService
  ) {}

  ngOnInit(): void {
    // 1. Pedimos el catálogo de productos al backend
    this.productsService.getProducts().subscribe({
      next: (products) => {
        this.allProducts = products;
        this.updateFavoriteList(); // Actualizamos la lista con los datos que llegaron
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error al cargar productos en Favoritos:', err);
        this.isLoading = false;
      }
    });

    // 2. Nos suscribimos a los cambios de los IDs de favoritos
    // (Así, si borrás uno desde la tarjeta, desaparece instantáneamente)
    this.favoritesService.favorites$.subscribe(ids => {
      this.favoriteIds = ids;
      this.updateFavoriteList();
    });
  }

  // Función auxiliar para cruzar los IDs con el catálogo de productos
  private updateFavoriteList(): void {
    if (this.allProducts.length > 0) {
      this.favoriteProducts = this.allProducts.filter(product => 
        this.favoriteIds.includes(product.id!) // Cruzamos el ID del producto con el array de Favoritos
      );
    } else {
      this.favoriteProducts = [];
    }
  }

  clearAll() {
    if(confirm('¿Estás seguro de que quieres eliminar todos tus favoritos?')) {
      // Asumo que tu servicio sigue teniendo el método clearAll()
      // Si no lo tiene, podés hacer que setee el BehaviorSubject a un array vacío []
      this.favoritesService.clearAll(); 
    }
  }
}