import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CardComponent } from '../../Components/card/card.component';
import { ProductI } from '../../Interfaces/product.interface';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProductsService } from '../../Services/products.service';
import { CATEGORY_MAP } from '../../../utils/normalization';
import { SearchLoggerService } from '../../Services/query.service';

@Component({
  selector: 'app-search-product',
  standalone: true,
  imports: [CardComponent, CommonModule, FormsModule],
  templateUrl: './search-product.component.html',
  styleUrl: './search-product.component.css',
})
export class SearchProductComponent implements OnInit {
  allProducts: ProductI[] = [];
  filteredProducts: ProductI[] = [];

  searchTerm: string = '';
  categoryParam: string = '';

  brands: string[] = [];
  selectedBrand: string = '';

  minPrice: number = 0;
  maxPrice: number = 1000000;
  priceRange: number = 1000000;

  sortBy: string = '';
  isLoading: boolean = true;

  constructor(
    private route: ActivatedRoute,
    private productService: ProductsService,
    private searchLogger: SearchLoggerService
  ) {}

  ngOnInit(): void {
    this.productService.getProducts().subscribe({
      next: (products) => {
        this.allProducts = products;
        
        this.extractBrands();

        if (this.allProducts.length > 0) {
          const maxProductPrice = Math.max(...this.allProducts.map(p => p.price));
          this.maxPrice = Math.ceil(maxProductPrice);
          this.priceRange = this.maxPrice;
        }

        this.route.params.subscribe((params) => {
          this.categoryParam = params['category'] || '';
          this.searchTerm = params['search'] || '';
          this.applyFilters();
          if (this.searchTerm) {
            this.logFoundProducts(this.searchTerm, this.filteredProducts);
          }
          this.isLoading = false;
        });
      },
      error: (err) => {
        console.error('Error al cargar productos en Search:', err);
        this.isLoading = false;
      }
    });

  }

  private logFoundProducts(query: string, products: ProductI[]): void {
    if (!products || products.length === 0) return;

    // Cortamos el array para no saturar la base de datos
    const topProduct = products.slice(0, 1);
    
    // Suponiendo que tu ProductI tiene un campo 'id' (o ajustalo si se llama de otra forma)
    topProduct.forEach(prod => {
      // Usamos el id, asumiendo que está definido en ProductI
      if (prod.id) {
        this.searchLogger.logSearch(query, prod.id);
      }
    });
  }

  extractBrands(): void {
    const brandSet = new Set<string>();
    this.allProducts.forEach((product) => {
      if(product.brand) brandSet.add(product.brand);
    });
    this.brands = Array.from(brandSet).sort();
  }

  applyFilters(): void {
    this.filteredProducts = this.allProducts.filter((product) => {
      let matchesCategory = true;
      if (this.categoryParam) {
        const paramLower = this.categoryParam.toLowerCase();
        const productCatLower = product.category.toLowerCase();

        const allowedVariants = CATEGORY_MAP[paramLower] || [paramLower];
        matchesCategory = allowedVariants.some(
          (variant: string) =>
            productCatLower.includes(variant) ||
            variant.includes(productCatLower),
        );
      }

      const matchesSearch =
        !this.searchTerm ||
        product.name.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        product.description.toLowerCase().includes(this.searchTerm.toLowerCase());

      const matchesBrand =
        !this.selectedBrand || product.brand === this.selectedBrand;
      const matchesPrice =
        product.price >= this.minPrice && product.price <= this.priceRange;

      return matchesCategory && matchesSearch && matchesBrand && matchesPrice;
    });

    this.sortProducts();
  }

  sortProducts(): void {
    if (this.sortBy === 'price-asc') {
      this.filteredProducts.sort((a, b) => a.price - b.price);
    } else if (this.sortBy === 'price-desc') {
      this.filteredProducts.sort((a, b) => b.price - a.price);
    } else if (this.sortBy === 'name') {
      this.filteredProducts.sort((a, b) => a.name.localeCompare(b.name));
    }
  }

  resetFilters(): void {
    this.selectedBrand = '';
    this.minPrice = 0;
    this.priceRange = this.maxPrice;
    this.sortBy = '';
    this.applyFilters();
  }
}
