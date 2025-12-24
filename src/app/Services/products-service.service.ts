import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { ProductI } from '../Interfaces/product.interface';

@Injectable({
  providedIn: 'root'
})
export class ProductsServiceService {
  private products: ProductI[] = [
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
    description: "Mouse avanzado para productividad, rueda MagSpeed, múltiples dispositivos y alta precisión.",
    category: "mouse",
    stock: 6,
    createdAt: new Date("2025-05-05T09:00:00Z"),
    updatedAt: new Date("2025-09-12T16:40:00Z")
  },
  {
    id: 8,
    name: "Redragon M602 - Mouse Gamer RGB",
    urlAcces: "https://articulo.mercadolibre.com.ar/MLA-EXAMPLE-redragon-m602",
    price: 12499,
    brand: "Redragon",
    image: "https://http2.mlstatic.com/D_NQ_NP_787248-MLA92579076657_092025-O.webp",
    description: "Mouse gaming 7200 DPI, peso ajustable, iluminación RGB y botones programables.",
    category: "mouse",
    stock: 8,
    offer: "15",
    createdAt: new Date("2025-04-22T11:45:00Z"),
    updatedAt: new Date("2025-09-10T10:00:00Z")
  },
  {
    id: 9,
    name: "Xiaomi Pad 5 11\" - 128GB",
    urlAcces: "https://articulo.mercadolibre.com.ar/MLA-EXAMPLE-xiaomi-pad-5",
    price: 139990,
    brand: "Xiaomi",
    image: "https://http2.mlstatic.com/D_NQ_NP_787248-MLA92579076657_092025-O.webp",
    description: "Tablet 11\", pantalla 120Hz, ideal para consumo y productividad con teclado opcional.",
    category: "tablet",
    stock: 9,
    createdAt: new Date("2025-08-03T14:30:00Z"),
    updatedAt: new Date("2025-09-15T09:00:00Z")
  },
  {
    id: 10,
    name: "Acer Aspire 5 14\" Intel Core i5 - 8GB - 512GB",
    urlAcces: "https://articulo.mercadolibre.com.ar/MLA-EXAMPLE-acer-aspire-5",
    price: 249999,
    brand: "Acer",
    image: "https://http2.mlstatic.com/D_NQ_NP_787248-MLA92579076657_092025-O.webp",
    description: "Ultrabook 14\" con buen rendimiento para trabajo y estudio, SSD NVMe y diseño liviano.",
    category: "notebook",
    stock: 12,
    createdAt: new Date("2025-07-18T08:00:00Z"),
    updatedAt: new Date("2025-09-01T12:00:00Z")
  },
  {
    id: 11,
    name: "ASUS Vivobook 15\" Ryzen 7 - 16GB - 1TB SSD",
    urlAcces: "https://articulo.mercadolibre.com.ar/MLA-EXAMPLE-asus-vivobook-ryzen7",
    price: 369990,
    brand: "Asus",
    image: "https://http2.mlstatic.com/D_NQ_NP_787248-MLA92579076657_092025-O.webp",
    description: "Notebook para multitasking pesado, 16GB RAM y gran capacidad de almacenamiento.",
    category: "notebook",
    stock: 4,
    createdAt: new Date("2025-03-10T10:00:00Z"),
    updatedAt: new Date("2025-09-14T17:20:00Z")
  },
  {
    id: 12,
    name: "Microsoft Surface Go 3 - Tablet con teclado (opcional)",
    urlAcces: "https://articulo.mercadolibre.com.ar/MLA-EXAMPLE-surface-go-3",
    price: 179990,
    brand: "Microsoft",
    image: "https://http2.mlstatic.com/D_NQ_NP_787248-MLA92579076657_092025-O.webp",
    description: "Tablet 10.5\" con Windows, buena para movilidad y aplicaciones de oficina ligeras.",
    category: "tablet",
    stock: 5,
    createdAt: new Date("2025-02-27T09:00:00Z"),
    updatedAt: new Date("2025-09-05T10:30:00Z")
  }
  ];
getProducts() {
    return this.products;
  }
// Usamos BehaviorSubject para que cualquier componente sepa la lista actual al suscribirse
  private favoritesIds = new BehaviorSubject<number[]>([]);
  favorites$ = this.favoritesIds.asObservable();

  constructor() {}

  toggleFavorite(productId: number): void {
    const currentIds = this.favoritesIds.value;
    if (currentIds.includes(productId)) {
      // Si ya está, lo filtramos (quitar)
      this.favoritesIds.next(currentIds.filter(id => id !== productId));
    } else {
      // Si no está, lo agregamos
      this.favoritesIds.next([...currentIds, productId]);
    }
  }

  isFavorite(productId: number): boolean {
    return this.favoritesIds.value.includes(productId);
  }
}
