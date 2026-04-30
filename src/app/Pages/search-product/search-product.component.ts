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
  filteredProducts: ProductI[] = [];
  
  currentPage: number = 1;
  totalPages: number = 1;
  visiblePages: number[] = [];
  
  searchTerm: string = '';
  categoryParam: string = '';
  
  // Marcas Dinámicas
  brands: string[] = [];
  selectedBrand: string = '';
  
  // Precios Manuales
  minPriceInput: number | null = null;
  maxPriceInput: number | null = null;
  // Precios Visuales (Para el HTML con puntos)
  minPriceDisplay: string = '';
  maxPriceDisplay: string = '';
  
  // Dato Informativo
  absoluteMaxPrice: number = 0; 
  
  sortBy: string = '';
  isLoading: boolean = true;

  constructor(
    private route: ActivatedRoute,
    private productService: ProductsService,
    private searchLogger: SearchLoggerService
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe((params) => {
      this.categoryParam = params['category'] || '';
      this.searchTerm = params['search'] || '';
      
      this.loadData(1);
    });
  }

  loadData(page: number = 1): void {
    this.isLoading = true;
    this.currentPage = page;

    // Tomamos los valores exactos que ingresó el usuario
    const filters: any = {
      search: this.searchTerm,
      brandName: this.selectedBrand,
      minPrice: this.minPriceInput != null ? this.minPriceInput : undefined,
      maxPrice: this.maxPriceInput != null ? this.maxPriceInput : undefined,
      sortBy: this.sortBy
    };

    if (this.categoryParam) {
      const paramLower = this.categoryParam.toLowerCase();
      filters.categoryNames = CATEGORY_MAP[paramLower] || [paramLower];
    }

    this.productService.getProducts(this.currentPage, 12, filters).subscribe({
      next: (res) => {
        this.filteredProducts = res.data;
        this.totalPages = res.totalPages;
        this.visiblePages = this.calculateVisiblePages(this.currentPage, this.totalPages);
        
        // Guardamos las marcas que nos devuelve el backend
        if (res.brands && res.brands.length > 0 && this.brands.length === 0) {
            // Solo pisamos las marcas si no las habíamos cargado antes, 
            // para no perderlas al filtrar por precio.
            this.brands = res.brands;
        }

        if (res.maxPrice) {
          this.absoluteMaxPrice = res.maxPrice;
        }
        
        if (this.searchTerm && this.currentPage === 1) {
          this.logFoundProducts(this.searchTerm, this.filteredProducts);
        }
        
        this.isLoading = false;
        window.scrollTo({ top: 0, behavior: 'smooth' });
      },
      error: () => this.isLoading = false
    });
  }
  
  onPriceChange(value: string, type: 'min' | 'max'): void {
    // 1. Borramos cualquier letra o punto viejo para quedarnos solo con los números crudos
    const rawString = value.replace(/\D/g, '');
    const num = rawString ? parseInt(rawString, 10) : null;

    // 2. Le agregamos un punto cada 3 caracteres usando una expresión regular
    const formatted = num !== null ? num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".") : '';

    // 3. Guardamos el texto formateado para la vista, y el número real para el backend
    if (type === 'min') {
      this.minPriceInput = num;
      this.minPriceDisplay = formatted;
    } else {
      this.maxPriceInput = num;
      this.maxPriceDisplay = formatted;
    }
  }

  applyFilters(): void {
    this.loadData(1); 
  }

  resetFilters(): void {
    this.selectedBrand = '';
    this.minPriceInput = null;
    this.maxPriceInput = null;
    this.minPriceDisplay = '';
    this.maxPriceDisplay = '';
    this.sortBy = '';
    this.loadData(1);
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.loadData(page);
    }
  }

  calculateVisiblePages(current: number, total: number): number[] {
    if (total <= 5) return Array.from({ length: total }, (_, i) => i + 1);
    let start = Math.max(1, current - 2);
    let end = Math.min(total, current + 2);
    if (current <= 2) end = 5;
    else if (current >= total - 1) start = total - 4;
    return Array.from({ length: end - start + 1 }, (_, i) => start + i);
  }

  private logFoundProducts(query: string, products: ProductI[]): void {
    if (!products || products.length === 0) return;
    const topProduct = products[0];
    if (topProduct && topProduct.id) {
      this.searchLogger.logSearch(query, topProduct.id);
    }
  }
}