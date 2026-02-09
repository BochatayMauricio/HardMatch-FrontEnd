import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { StoreService, StoreI } from '../../Services/stores.service';
import { ProductsServiceService } from '../../Services/products-service.service';
import { ProductI } from '../../Interfaces/product.interface';
import { CardComponent } from '../../Components/card/card.component';

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

  constructor(
    private route: ActivatedRoute,
    private storeService: StoreService,
    private productService: ProductsServiceService
  ) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const storeName = params.get('name');
      
      if (storeName) {
        this.store = this.storeService.getStoreByName(storeName);
        
        if (this.store) {
          this.loadStoreProducts(this.store.id);
        }
      }
    });
  }

  private loadStoreProducts(storeId: number): void {
    const allProducts = this.productService.getProducts();
    
    this.storeProducts = allProducts.filter(product => product.storeId === storeId);
  }
}