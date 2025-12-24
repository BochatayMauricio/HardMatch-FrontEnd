import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ProductsServiceService } from '../../Services/products-service.service';
import { CardComponent } from '../../Components/card/card.component';
import { FavoritesService } from '../../Services/favorites.service';

@Component({
  selector: 'app-user-favorites',
  imports: [CommonModule, CardComponent],
  templateUrl: './user-favorites.component.html',
  styleUrl: './user-favorites.component.css'
})
export class UserFavoritesComponent implements OnInit {
 favoriteProducts: any[] = [];

  constructor(
    private favoritesService: FavoritesService,
    private productService: ProductsServiceService
  ) {}

  ngOnInit(): void {
    this.favoritesService.favorites$.subscribe(ids => {
      const allProducts = this.productService.getProducts();
      this.favoriteProducts = allProducts.filter(p => ids.includes(p.id));
    });
  }

  clearAll() {
    if(confirm('¿Estás seguro de que quieres eliminar todos tus favoritos?')) {
      this.favoritesService.clearAll();
    }
  }
}
