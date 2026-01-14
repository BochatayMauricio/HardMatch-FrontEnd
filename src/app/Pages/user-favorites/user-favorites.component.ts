import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
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

  constructor(private favoritesService: FavoritesService) {}

  ngOnInit(): void {
    // Al suscribirnos, la lista se actualizará automáticamente 
    // incluso si eliminamos un producto desde dentro de la Card
    this.favoritesService.favorites$.subscribe(products => {
      this.favoriteProducts = products;
    });
  }

  clearAll() {
    if(confirm('¿Estás seguro de que quieres eliminar todos tus favoritos?')) {
      this.favoritesService.clearAll();
    }
  }
}