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

  constructor(
    private route: ActivatedRoute,
    private productService: ProductsServiceService,
  ) {
    this.allProducts = this.productService.getProducts();
    console.log(this.allProducts);
  }

  ngOnInit(): void {
    this.route.params.subscribe((params) => {
      this.categoryParam = params['category'] || '';
      this.searchTerm = params['search'] || '';

      this.extractBrands();
      this.applyFilters();
    });
  }

  extractBrands(): void {
    const brandSet = new Set<string>();
    this.allProducts.forEach((product) => brandSet.add(product.brand));
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
          (variant) =>
            productCatLower.includes(variant) ||
            variant.includes(productCatLower),
        );
      }

      const matchesSearch =
        !this.searchTerm ||
        product.name.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        product.description
          .toLowerCase()
          .includes(this.searchTerm.toLowerCase());

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
    this.priceRange = 1000000;
    this.sortBy = '';
    this.applyFilters();
  }
}
