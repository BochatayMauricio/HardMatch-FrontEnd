import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CardComponent } from '../../Components/card/card.component';
import { ProductI } from '../../Interfaces/product.interface';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProductsServiceService } from '../../Services/products-service.service';
import { CATEGORY_MAP } from '../../../utils/normalization';

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
  isLoading: boolean = true; // Control de estado de carga

  constructor(
    private route: ActivatedRoute,
    private productService: ProductsServiceService,
  ) {}

  ngOnInit(): void {
    // 1. Primero nos suscribimos para obtener los productos de la BD
    this.productService.getProducts().subscribe({
      next: (products) => {
        this.allProducts = products;
        
        // 2. Extraemos las marcas dinámicamente
        this.extractBrands();

        // 3. Ajustamos el precio máximo dinámicamente según el producto más caro
        if (this.allProducts.length > 0) {
          const maxProductPrice = Math.max(...this.allProducts.map(p => p.price));
          this.maxPrice = Math.ceil(maxProductPrice);
          this.priceRange = this.maxPrice; // Seteamos el slider al tope inicial
        }

        // 4. Una vez que tenemos los datos, escuchamos los parámetros de la URL
        this.route.params.subscribe((params) => {
          this.categoryParam = params['category'] || '';
          this.searchTerm = params['search'] || '';
          
          this.applyFilters();
          this.isLoading = false; // Apagamos el loader
        });
      },
      error: (err) => {
        console.error('Error al cargar productos en Search:', err);
        this.isLoading = false;
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
    this.priceRange = this.maxPrice; // Volvemos al máximo dinámico real
    this.sortBy = '';
    this.applyFilters();
  }
}