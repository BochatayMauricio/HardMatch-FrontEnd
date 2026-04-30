import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { CardComponent } from '../../Components/card/card.component';
import { FavoritesService } from '../../Services/favorites.service';
import { ProductsService } from '../../Services/products.service';
import { ProductI } from '../../Interfaces/product.interface';
import { RouterLink } from '@angular/router';
import { forkJoin, of } from 'rxjs'; // <-- Agregamos RxJS
import { catchError } from 'rxjs/operators'; // <-- Agregamos RxJS

@Component({
  selector: 'app-user-favorites',
  standalone: true,
  imports: [CommonModule, CardComponent, RouterLink],
  templateUrl: './user-favorites.component.html',
  styleUrl: './user-favorites.component.css'
})
export class UserFavoritesComponent implements OnInit {
  // Eliminamos allProducts porque ya no necesitamos todo el catálogo
  favoriteProducts: ProductI[] = [];
  favoriteIds: number[] = [];
  
  isLoading: boolean = true;

  constructor(
    private favoritesService: FavoritesService,
    private productsService: ProductsService
  ) {}

  ngOnInit(): void {
    this.favoritesService.refreshFavorites().subscribe();

    // Reaccionamos automáticamente a los cambios en la lista de IDs
    this.favoritesService.favorites$.subscribe(ids => {
      this.favoriteIds = ids;
      this.loadFavoriteProducts();
    });
  }

  private loadFavoriteProducts(): void {
    // Si no tiene favoritos, vaciamos la lista y cortamos
    if (this.favoriteIds.length === 0) {
      this.favoriteProducts = [];
      this.isLoading = false;
      return;
    }

    this.isLoading = true;

    // Armamos un array de peticiones (solo buscando los IDs que nos interesan)
    const productRequests = this.favoriteIds.map(id => 
      this.productsService.getProductById(id).pipe(
        // Si un producto fue borrado (404), atajamos el error y devolvemos null
        // para que no se rompa la carga de los demás favoritos
        catchError(() => of(null)) 
      )
    );

    // forkJoin ejecuta todas las peticiones en paralelo
    forkJoin(productRequests).subscribe({
      next: (results) => {
        // Filtramos los nulos (productos que ya no existen) y guardamos
        this.favoriteProducts = results.filter(product => product !== null) as ProductI[];
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error crítico al cargar los productos favoritos:', err);
        this.isLoading = false;
      }
    });
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