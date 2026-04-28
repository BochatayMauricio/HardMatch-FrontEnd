import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { StoreService } from '../../Services/stores.service';
import { ProductsService } from '../../Services/products.service';
import { ProductI } from '../../Interfaces/product.interface';
import { CardComponent } from '../../Components/card/card.component';
import { StoreI } from '../../Interfaces/store.intefrace';

@Component({
  selector: 'app-store-profile',
  standalone: true,
  imports: [CommonModule, RouterLink, CardComponent], 
  templateUrl: './store-profile.component.html',
  styleUrl: './store-profile.component.css'
})
export class StoreProfileComponent implements OnInit {
  
  store: StoreI | undefined;
  storeProducts: ProductI[] = [];
  isLoadingStore: boolean = true;
  isLoadingProducts: boolean = true;

  constructor(
    private route: ActivatedRoute,
    private storeService: StoreService,
    private productService: ProductsService
  ) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const storeName = params.get('name');
      
      if (storeName) {
        this.isLoadingStore = true;
        this.storeService.getStoreByName(storeName).subscribe({
          next: (storeData) => {
            this.store = storeData;
            this.isLoadingStore = false;

            if (this.store) {
              this.loadStoreProducts(this.store.id);
            } else {
              this.isLoadingProducts = false;
            }
          },
          error: (err) => {
            console.error('Error al obtener la tienda:', err);
            this.isLoadingStore = false;
            this.isLoadingProducts = false;
          }
        });
      }
    });
  }

  private loadStoreProducts(storeId: number): void {
    this.isLoadingProducts = true;

    // Llamamos directamente a nuestro nuevo método en el StoreService
    this.storeService.getProductsByStore(storeId).subscribe({
      next: (products) => {
        // El backend ya nos devolvió exactamente lo que la Card necesita
        this.storeProducts = products;
        this.isLoadingProducts = false;
        console.log(`Productos cargados para la tienda ${storeId}:`, this.storeProducts);
      },
      error: (err) => {
        console.error('Error al cargar los productos de la tienda:', err);
        this.isLoadingProducts = false;
      }
    });
  }
}
