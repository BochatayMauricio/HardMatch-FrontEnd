import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HomeComponent } from '../home/home.component';

// import { PurchaseI } from '../core/models/purchase.interface'; 
// import { UserService } from '../core/services/user.service';

const STATIC_PRODUCTS = [
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
  }
];

// --- MOCK DE COMPRAS VINCULADAS (Con precios ajustados a oferta) ---
const STATIC_PURCHASES = [
    {
        id: 201, date: new Date('2025-11-25T14:30:00'), totalAmount: 260999.10, status: 'Completada',
        items: [{ productId: 1, quantity: 1 }]
    },
    {
        id: 202, date: new Date('2025-10-15T10:10:00'), totalAmount: 197500.00, status: 'Completada',
        items: [{ productId: 2, quantity: 1 }, { productId: 3, quantity: 2 }]
    },
    {
        id: 203, date: new Date('2025-09-01T20:00:00'), totalAmount: 20200.00, status: 'Pendiente',
        items: [{ productId: 4, quantity: 2 }, { productId: 5, quantity: 1 }]
    },
    {
        id: 204, date: new Date('2025-07-04T12:45:00'), totalAmount: 265999.10, status: 'Cancelada',
        items: [{ productId: 1, quantity: 1 }, { productId: 4, quantity: 1 }]
    },
];


@Component({
  selector: 'app-user-purchases',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './user-purchases.component.html',
  styleUrls: ['./user-purchases.component.css']
})
export class UserPurchasesComponent implements OnInit {

 purchases: any[] = []; // Almacena las compras con el campo 'totalAmount' calculado
  private products: any[] = STATIC_PRODUCTS;
  
  selectedPurchase: any | null = null; // Controla la visibilidad del desplegable/modal de detalle

  constructor() { }

  ngOnInit(): void {
    // 1. Al iniciar, procesamos las compras para calcular el total
    this.purchases = STATIC_PURCHASES.map(purchase => {
      const calculatedTotal = this.calculateTotalAmount(purchase.items);
      return {
        ...purchase,
        totalAmount: calculatedTotal // Agregamos el total calculado
      };
    });
  }

  // MÉTODO CLAVE: Calcula el monto total de la orden
  private calculateTotalAmount(items: any[]): number {
    let total = 0;
    
    for (const item of items) {
      const product = this.products.find(p => p.id === item.productId);
      
      if (product) {
        // Aplicamos la oferta sobre el precio base
        const offerPct = parseFloat(product.offer || '0') / 100;
        const finalPriceUnit = product.price * (1 - offerPct);
        total += finalPriceUnit * item.quantity;
      }
    }
    // Usamos toFixed(2) para manejar la precisión de moneda
    return parseFloat(total.toFixed(2));
  }
  
  // Busca el nombre del producto por su ID
  getProductName(productId: number): string {
    const product = this.products.find(p => p.id === productId);
    return product ? product.name : 'Producto Desconocido';
  }

  // Prepara el resumen de productos para la lista principal
  getOrderProductNames(purchaseItems: any[]): string {
    const names = purchaseItems.map(item => this.getProductName(item.productId));
    if (names.length > 2) {
      return `${names.slice(0, 2).join(', ')} y ${names.length - 2} más.`;
    }
    return names.join(', ');
  }

  // Muestra el detalle de una compra específica (y abre el desplegable)
  viewDetails(purchase: any): void {
    const detailedItems = purchase.items.map((item: any) => {
      const productData = this.products.find(p => p.id === item.productId);
      
      if (!productData) {
        return { name: 'Producto Desconocido', quantity: item.quantity, lineTotal: 0 };
      }

      // Cálculo del precio final unitario de la línea
      const offerUsed = parseFloat(productData.offer || '0');
      const finalPriceUnit = productData.price * (1 - (offerUsed / 100));
      
      return {
        ...productData, // Trae id, name, image, price, brand, offer, etc.
        quantity: item.quantity,
        priceAtPurchase: finalPriceUnit,
        lineTotal: finalPriceUnit * item.quantity,
        offerUsed: offerUsed
      };
    });

    this.selectedPurchase = { ...purchase, detailedItems };
  }

  // Cierra el desplegable
  closeDetails(): void {
    this.selectedPurchase = null;
  }

  trackByPurchaseId(index: number, purchase: any): number {
    return purchase.id;
  }
}