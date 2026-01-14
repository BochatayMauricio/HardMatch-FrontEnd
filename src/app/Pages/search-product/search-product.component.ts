import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CardComponent } from '../../Components/card/card.component';
import { ProductI } from '../../Interfaces/product.interface';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-search-product',
  imports: [CardComponent, CommonModule, FormsModule],
  templateUrl: './search-product.component.html',
  styleUrl: './search-product.component.css'
})
export class SearchProductComponent implements OnInit {

  allProducts: ProductI[] = [
    {
      id: 1,
      name: "Lenovo IdeaPad 3 15\" Ryzen 5 - 8GB RAM - 512GB SSD",
      urlAcces: "https://articulo.mercadolibre.com.ar/MLA-EXAMPLE-lenovo-ideapad-3-15",
      price: 289999,
      brand: "Lenovo",
      image: "https://http2.mlstatic.com/D_NQ_NP_787248-MLA92579076657_092025-O.webp",
      description: "Notebook 15.6\" Full HD, procesador AMD Ryzen 5, 8GB DDR4, SSD 512GB, Windows 11 Home.",
      category: "notebook",
      offer: "10",
      stock: 10,
      createdAt: new Date("2025-09-10T09:30:00Z"),
      updatedAt: new Date("2025-09-20T14:10:00Z")
    },
    {
      id: 2,
      name: "HP 15s Intel Core i3 11ª Gen - 8GB - 256GB SSD",
      urlAcces: "https://articulo.mercadolibre.com.ar/MLA-EXAMPLE-hp-15s-core-i3",
      price: 199750,
      brand: "HP",
      image: "https://http2.mlstatic.com/D_NQ_NP_787248-MLA92579076657_092025-O.webp",
      description: "Compacta, ideal para estudio y oficina. Pantalla 15.6\", SSD NVMe, batería de larga duración.",
      category: "notebook",
      stock: 5,
      createdAt: new Date("2025-08-22T12:00:00Z"),
      updatedAt: new Date("2025-09-02T08:45:00Z")
    },
    {
      id: 3,
      name: "Apple MacBook Air M2 13\" - 8GB RAM - 256GB",
      urlAcces: "https://articulo.mercadolibre.com.ar/MLA-EXAMPLE-macbook-air-m2",
      price: 559999,
      brand: "Apple",
      image: "https://http2.mlstatic.com/D_NQ_NP_787248-MLA92579076657_092025-O.webp",
      description: "MacBook Air con chip M2, hasta 18 horas de batería, carcasa ultradelgada, macOS Ventura.",
      category: "notebook",
      stock: 3,
      offer: "20",
      createdAt: new Date("2025-07-30T07:20:00Z"),
      updatedAt: new Date("2025-09-18T11:00:00Z")
    },
    {
      id: 4,
      name: "Samsung Galaxy Tab S8 FE 10.5\" - 64GB",
      urlAcces: "https://articulo.mercadolibre.com.ar/MLA-EXAMPLE-galaxy-tab-s8-fe",
      price: 159990,
      brand: "Samsung",
      image: "https://http2.mlstatic.com/D_NQ_NP_787248-MLA92579076657_092025-O.webp",
      description: "Tablet 10.5\", Android, 64GB, ideal para multimedia y productividad ligera.",
      category: "tablet",
      stock: 7,
      createdAt: new Date("2025-09-01T15:00:00Z"),
      updatedAt: new Date("2025-09-21T09:30:00Z")
    },
    {
      id: 5,
      name: "Apple iPad (9ª gen) 10.2\" - 64GB",
      urlAcces: "https://articulo.mercadolibre.com.ar/MLA-EXAMPLE-ipad-9gen",
      price: 189990,
      brand: "Apple",
      image: "https://http2.mlstatic.com/D_NQ_NP_787248-MLA92579076657_092025-O.webp",
      description: "iPad 10.2\" con iPadOS, perfecto para estudio, lectura y apps creativas.",
      category: "tablet",
      stock: 4,
      createdAt: new Date("2025-06-12T10:10:00Z"),
      updatedAt: new Date("2025-09-19T13:25:00Z")
    },
    {
      id: 6,
      name: "Logitech M190 - Mouse inalámbrico",
      urlAcces: "https://articulo.mercadolibre.com.ar/MLA-EXAMPLE-logitech-m190",
      price: 5499,
      brand: "Logitech",
      image: "https://http2.mlstatic.com/D_NQ_NP_787248-MLA92579076657_092025-O.webp",
      description: "Mouse inalámbrico con receptor USB, diseño cómodo y batería de larga duración.",
      category: "mouse",
      stock: 15,
      createdAt: new Date("2025-09-15T18:00:00Z"),
      updatedAt: new Date("2025-09-16T08:00:00Z")
    },
    {
      id: 7,
      name: "Logitech MX Master 3 - Mouse inalámbrico profesional",
      urlAcces: "https://articulo.mercadolibre.com.ar/MLA-EXAMPLE-logitech-mx-master-3",
      price: 47999,
      brand: "Logitech",
      image: "https://http2.mlstatic.com/D_NQ_NP_787248-MLA92579076657_092025-O.webp",
      description: "Mouse ergonómico premium con scroll electromagnético MagSpeed, hasta 4000 DPI.",
      category: "mouse",
      stock: 8,
      createdAt: new Date("2025-09-10T14:30:00Z"),
      updatedAt: new Date("2025-09-22T16:45:00Z")
    },
    {
      id: 8,
      name: "Dell Alienware AW3423DW 34\" Curved Gaming Monitor",
      urlAcces: "https://articulo.mercadolibre.com.ar/MLA-EXAMPLE-alienware-aw3423dw",
      price: 899999,
      brand: "Dell",
      image: "https://http2.mlstatic.com/D_NQ_NP_787248-MLA92579076657_092025-O.webp",
      description: "Monitor curvo 34\" QD-OLED, 175Hz, 0.1ms, NVIDIA G-SYNC Ultimate, ideal para gaming.",
      category: "monitores",
      stock: 2,
      offer: "15",
      createdAt: new Date("2025-08-15T09:00:00Z"),
      updatedAt: new Date("2025-09-20T10:20:00Z")
    }
  ];

  filteredProducts: ProductI[] = [];
  
  searchTerm: string = '';
  categoryParam: string = '';

  brands: string[] = [];
  selectedBrand: string = '';
  
  minPrice: number = 0;
  maxPrice: number = 1000000;
  priceRange: number = 1000000;

  sortBy: string = '';

  constructor(private route: ActivatedRoute) {}

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.categoryParam = params['category'] || '';
      this.searchTerm = params['search'] || '';
      
      this.extractBrands();
      this.applyFilters();
    });
  }

  extractBrands(): void {
    const brandSet = new Set<string>();
    this.allProducts.forEach(product => brandSet.add(product.brand));
    this.brands = Array.from(brandSet).sort();
  }

  applyFilters(): void {
    this.filteredProducts = this.allProducts.filter(product => {
      
      const matchesCategory = !this.categoryParam || 
        product.category.toLowerCase().includes(this.categoryParam.toLowerCase());
      
      const matchesSearch = !this.searchTerm || 
        product.name.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        product.description.toLowerCase().includes(this.searchTerm.toLowerCase());
      
      const matchesBrand = !this.selectedBrand || product.brand === this.selectedBrand;
      
      const matchesPrice = product.price >= this.minPrice && product.price <= this.priceRange;

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
