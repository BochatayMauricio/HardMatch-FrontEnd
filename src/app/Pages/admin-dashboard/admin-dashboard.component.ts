import { Component, OnInit, AfterViewInit } from '@angular/core';
import { CommonModule, DatePipe, DecimalPipe } from '@angular/common';
import Chart from 'chart.js/auto';
import { ToastrService } from 'ngx-toastr';
import { AdminReportService } from '../../Services/reports.service';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, DatePipe, DecimalPipe],
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.css']
})
export class AdminDashboardComponent implements OnInit {
  // KPIs Superiores (Métricas del Scraper)
  totalSources = 0;
  activeSources = 0;
  failedSources = 0;
  totalScrapedProducts = 0;
  newProductsToday = 0;
  totalClicks = 0;

  // Estado de Marketplaces (Tabla Principal)
  marketplaceStatus: any[] = [];

  // Reportes de BI (Secciones Inferiores)
  generalStats: any = {};
  topProducts: any[] = [];
  topSearches: any[] = [];

  // Referencias a instancias de gráficos para poder destruirlos/actualizarlos
  private productsChart: any;
  private trafficChart: any;

  constructor(
    private toastr: ToastrService,
    private adminReportService: AdminReportService
  ) {}

  ngOnInit(): void {
    this.loadAllData();
    this.adminReportService.getTrafficData().subscribe({
      next: (data: number[]) => {
        // Una vez que llegan los números, dibujamos la gráfica
        this.initTrafficChart(data);
      },
      error: (err) => console.error("Error cargando tráfico", err)
    });
  }

  /**
   * Carga masiva de datos desde el servicio de reportes
   */
  loadAllData(): void {
    // 1. Estadísticas de salud del Scraper y Clicks
    this.adminReportService.getScraperStats().subscribe({
      next: (data) => {
        if (data) {
          this.totalSources = data.totalSources;
          this.activeSources = data.activeSources;
          this.failedSources = data.failedSources;
          this.totalScrapedProducts = data.totalScrapedProducts;
          this.newProductsToday = data.newProductsToday;
          this.totalClicks = data.totalClicks;
        }
      },
      error: () => console.error('Error al cargar métricas de scraper')
    });

    // 2. Estado detallado de cada Marketplace para la tabla y el gráfico de torta
    this.adminReportService.getMarketplaceStatuses().subscribe({
      next: (data) => {
        this.marketplaceStatus = data;
        // Una vez que tenemos las tiendas, inicializamos o actualizamos el gráfico
        this.initProductsChart();
      },
      error: () => this.toastr.error('Error al sincronizar estados de tiendas')
    });

    // 3. Estadísticas generales de la plataforma (Usuarios, Favoritos, etc.)
    this.adminReportService.getGeneralStats().subscribe({
      next: (report) => this.generalStats = report.data,
      error: () => console.error('Error al cargar estadísticas generales')
    });

    // 4. Top de productos más buscados y favoritos
    this.adminReportService.getTopProducts(5).subscribe({
      next: (report) => this.topProducts = report.data,
      error: () => console.error('Error al cargar top de productos')
    });

    this.adminReportService.getTopSearches(5).subscribe({
      next: (report) => this.topSearches = report.data,
      error: () => console.error('Error al cargar top de búsquedas')
    });
  }

  /**
   * Ejecuta el proceso de scraping simulado (Mock)
   */
  syncAllSources(): void {
    this.toastr.info('Iniciando comunicación con el motor de scraping...', 'Sincronizando');

    this.adminReportService.triggerScraper().subscribe({
      next: (res) => {
        this.toastr.success(res.message, 'Proceso Iniciado');
        // Opcional: Recargar datos después de un tiempo
        setTimeout(() => this.loadAllData(), 3000);
      },
      error: () => this.toastr.error('No se pudo establecer conexión con el scraper')
    });
  }

  retestSource(id: number): void {
    const site = this.marketplaceStatus.find(s => s.id === id);
    this.toastr.warning(`Verificando selectores HTML y conectividad para ${site?.name}`);
    // Aquí podrías llamar a un endpoint de "test-individual" en el futuro
  }

  getStatusClass(status: string): string {
    const classes: Record<string, string> = {
      'OK': 'badge-ok',
      'ERROR': 'badge-error',
      'WARNING': 'badge-warn'
    };
    return classes[status] || 'badge-warn';
  }

  initProductsChart(): void {
    if (!this.marketplaceStatus.length) return;

    const ctx = document.getElementById('productsChart') as HTMLCanvasElement;
    if (!ctx) return;

    // Si el gráfico ya existe, lo destruimos para evitar duplicados al recargar datos
    if (this.productsChart) this.productsChart.destroy();

    const chartLabels = this.marketplaceStatus.map(site => site.name);
    const chartData = this.marketplaceStatus.map(site => site.productCount);

    this.productsChart = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: chartLabels,
        datasets: [{
          data: chartData,
          backgroundColor: ['#7c3aed', '#ef4444', '#3b82f6', '#10b981', '#1e293b'],
          borderWidth: 0,
          hoverOffset: 4
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'right',
            labels: { usePointStyle: true, padding: 20 }
          }
        }
      }
    });
  }

  initTrafficChart(trafficData: number[]): void {
    const ctx = document.getElementById('trafficChart') as HTMLCanvasElement;
    if (!ctx || this.trafficChart) return;

    this.trafficChart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'],
        datasets: [{
          label: 'Redirecciones a Tiendas',
          data: trafficData,
          borderColor: '#7c3aed',
          backgroundColor: 'rgba(124, 58, 237, 0.1)',
          fill: true,
          tension: 0.4,
          pointBackgroundColor: '#ffffff',
          pointBorderColor: '#7c3aed',
          pointBorderWidth: 2,
          pointRadius: 4
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: { beginAtZero: true, grid: { color: 'rgba(0,0,0,0.05)' } },
          x: { grid: { display: false } }
        },
        plugins: { legend: { display: false } }
      }
    });
  }
}