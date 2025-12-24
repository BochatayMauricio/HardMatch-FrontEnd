import { CommonModule, CurrencyPipe } from '@angular/common';
import { AfterViewInit, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import Chart from 'chart.js/auto';


@Component({
  selector: 'app-admin-dashboard',
  imports: [CommonModule, CurrencyPipe],
  templateUrl: './admin-dashboard.component.html',
  styleUrl: './admin-dashboard.component.css'
})
export class AdminDashboardComponent implements OnInit, AfterViewInit {
 // Referencias a los elementos <canvas> en el HTML
  @ViewChild('salesChart') salesChartRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('categoryChart') categoryChartRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('stockChart') stockChartRef!: ElementRef<HTMLCanvasElement>;

  // INSTANCIAS DE LOS GRÁFICOS
  salesChart: Chart | null = null;
  categoryChart: Chart | null = null;
  stockChart: Chart | null = null;

  // KPIs Globales
  totalRevenue = 1450890.50;
  activeOrders = 24;
  totalCustomers = 156;
  conversionRate = 3.8;

  // Datos para el gráfico de Ventas Mensuales (ficticios)
  monthlySalesData = {
    labels: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'],
    datasets: [{
      label: 'Ventas Mensuales (ARS)',
      data: [350000, 420000, 380000, 500000, 450000, 550000, 600000, 580000, 700000, 750000, 800000, 950000],
      backgroundColor: 'rgba(124, 58, 237, 0.6)', // var(--primary-color)
      borderColor: 'rgba(124, 58, 237, 1)',
      borderWidth: 1,
      tension: 0.3, // Curva suave para líneas
      fill: false
    }]
  };

  // Datos para el gráfico de Ventas por Categoría (ficticios)
  categorySalesData = {
    labels: ['Notebooks', 'Monitores', 'Periféricos', 'Almacenamiento', 'Accesorios'],
    datasets: [{
      label: 'Ventas por Categoría',
      data: [4500000, 2500000, 1800000, 1200000, 800000],
      backgroundColor: [
        'rgba(124, 58, 237, 0.7)', // Primary Color
        'rgba(99, 102, 241, 0.7)', // Complementary
        'rgba(167, 139, 250, 0.7)', // Lighter Primary
        'rgba(129, 140, 248, 0.7)', // Another light blue-purple
        'rgba(196, 181, 253, 0.7)' // Even lighter
      ],
      hoverOffset: 4
    }]
  };

  // Datos para el gráfico de Estado de Stock (ficticios)
  stockStatusData = {
    labels: ['En Stock', 'Bajo Stock', 'Agotado'],
    datasets: [{
      label: 'Estado de Stock',
      data: [70, 20, 10], // Porcentaje o número de productos
      backgroundColor: [
        'rgba(16, 185, 129, 0.7)', // Verde (In Stock)
        'rgba(251, 191, 36, 0.7)', // Amarillo (Low Stock)
        'rgba(239, 68, 68, 0.7)'   // Rojo (Out of Stock)
      ],
      hoverOffset: 4
    }]
  };

  // Rendimiento de Productos (Tabla, se mantiene igual)
  productsPerformance: any[] = [
    { id: 1, name: 'Lenovo IdeaPad 3', category: 'Notebook', unitsSold: 45, revenue: 13049955, stock: 10 },
    { id: 2, name: 'Monitor Samsung 27"', category: 'Monitores', unitsSold: 12, revenue: 1800000, stock: 5 },
    { id: 3, name: 'Teclado HyperX', category: 'Periféricos', unitsSold: 88, revenue: 2200000, stock: 20 }
  ];

  constructor() { }

  ngOnInit(): void { }

  // Renderiza los gráficos después de que la vista se ha inicializado
  ngAfterViewInit(): void {
    this.createSalesChart();
    this.createCategorySalesChart();
    this.createStockStatusChart();
  }

  createSalesChart(): void {
    const ctx = this.salesChartRef.nativeElement.getContext('2d');
    if (ctx) {
      this.salesChart = new Chart(ctx, {
        type: 'line', // Gráfico de línea
        data: this.monthlySalesData,
        options: {
          responsive: true,
          maintainAspectRatio: false, // Permite controlar el tamaño del gráfico
          scales: {
            y: {
              beginAtZero: true,
              ticks: {
                callback: (value:any) => `$${this.formatNumber(value as number)}`
              }
            }
          },
          plugins: {
            title: {
              display: true,
              text: 'Ventas Mensuales (Últimos 12 Meses)',
              font: {
                size: 16
              }
            }
          }
        }
      });
    }
  }

  createCategorySalesChart(): void {
    const ctx = this.categoryChartRef.nativeElement.getContext('2d');
    if (ctx) {
      this.categoryChart = new Chart(ctx, {
        type: 'doughnut', // Gráfico de dona
        data: this.categorySalesData,
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            title: {
              display: true,
              text: 'Ingresos por Categoría',
              font: {
                size: 16
              }
            }
          }
        }
      });
    }
  }

  createStockStatusChart(): void {
    const ctx = this.stockChartRef.nativeElement.getContext('2d');
    if (ctx) {
      this.stockChart = new Chart(ctx, {
        type: 'bar', // Gráfico de barras
        data: this.stockStatusData,
        options: {
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            y: {
              beginAtZero: true,
              ticks: {
                callback: (value:any) => `${value}%` // Si los datos son porcentajes
              }
            }
          },
          plugins: {
            title: {
              display: true,
              text: 'Distribución de Productos por Estado de Stock',
              font: {
                size: 16
              }
            },
            legend: {
              display: false // No necesitamos leyenda para una sola barra o para estos datos
            }
          }
        }
      });
    }
  }

  // Helper para formato de números grandes en los ticks
  formatNumber(value: number): string {
    if (value >= 1000000) return (value / 1000000).toFixed(1) + 'M';
    if (value >= 1000) return (value / 1000).toFixed(0) + 'K';
    return value.toString();
  }

  // Clase para el estado de stock en la tabla (se mantiene igual)
  getStockClass(stock: number): string {
    if (stock <= 5 && stock > 0) return 'badge-stock-low';
    if (stock === 0) return 'badge-stock-out';
    return 'badge-stock-ok';
  }

  getStockStatusText(stock: number): string {
    if (stock <= 5 && stock > 0) return 'Crítico';
    if (stock === 0) return 'Agotado';
    return 'Saludable';
  }
}
