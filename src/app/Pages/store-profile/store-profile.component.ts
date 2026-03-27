import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { StoreService } from '../../Services/stores.service';
import { ProductsServiceService } from '../../Services/products-service.service';
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
    private productService: ProductsServiceService
  ) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const storeName = params.get('name');
      
      if (storeName) {
        this.isLoadingStore = true;
        // 1. Obtenemos la tienda de la BD por su nombre
        this.storeService.getStoreByName(storeName).subscribe({
          next: (storeData) => {
            this.store = storeData;
            this.isLoadingStore = false;

            if (this.store) {
              // 2. Si la tienda existe, cargamos sus productos usando su ID real
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
    
    // Filtramos los productos que pertenezcan a esta tienda
    this.productService.getProducts().subscribe({
      next: (allProducts) => {
        // IMPORTANTE: Un producto ahora puede estar en varias tiendas (listings).
        // Filtramos si el "best listing" o cualquiera de sus listings es de esta tienda.
        this.storeProducts = allProducts.filter(product => 
          product.storeId === storeId || 
          product.listings?.some(l => l.storeId === storeId)
        );
        this.isLoadingProducts = false;
      },
      error: (err) => {
        console.error('Error al cargar productos:', err);
        this.isLoadingProducts = false;
      }
    });
  }
}