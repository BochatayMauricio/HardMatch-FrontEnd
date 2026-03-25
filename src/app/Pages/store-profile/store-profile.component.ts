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

    this.productService.getProducts().subscribe({
      next: (allProducts) => {
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
