import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { CardComponent } from '../../Components/card/card.component';
import { FavoritesService } from '../../Services/favorites.service';
import { ProductsService } from '../../Services/products.service';
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
    private productsService: ProductsService
  ) {}

  ngOnInit(): void {
    this.favoritesService.refreshFavorites().subscribe();

    this.productsService.getProducts().subscribe({
      next: (products) => {
        this.allProducts = products;
        this.updateFavoriteList();
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error al cargar productos en Favoritos:', err);
        this.isLoading = false;
      }
    });

    this.favoritesService.favorites$.subscribe(ids => {
      this.favoriteIds = ids;
      this.updateFavoriteList();
    });
  }

  private updateFavoriteList(): void {
    if (this.allProducts.length > 0) {
      this.favoriteProducts = this.allProducts.filter(product => 
        this.favoriteIds.includes(product.id!)
      );
    } else {
      this.favoriteProducts = [];
    }
  }

  clearAll() {
    if(confirm('¿Estás seguro de que quieres eliminar todos tus favoritos?')) {
      this.favoritesService.clearAll().subscribe({
        error: () => {
          console.error('No se pudo vaciar la lista de favoritos');
        }
      });
    }
  }
}

