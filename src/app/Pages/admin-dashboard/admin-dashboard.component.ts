import { Component, OnInit, AfterViewInit } from '@angular/core';
import { CommonModule, DatePipe, DecimalPipe } from '@angular/common';
import Chart from 'chart.js/auto';
import { ToastrService } from 'ngx-toastr';
import { AdminReportService } from '../../Services/reports.service';
import { ScraperService, ScraperParams } from '../../Services/scraper.service';
import { FormsModule } from '@angular/forms';
import { Subscription, interval } from 'rxjs'; // 💡 IMPORTAMOS RXJS

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, DatePipe, DecimalPipe, FormsModule],
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.css']
})
export class AdminDashboardComponent implements OnInit {
  // KPIs Superiores (Métricas del Scraper)
  private targetCategories: string[] = [
    "notebook", "tablet", "monitor", "mouse", 
    "procesador", "placa de video", "memoria ram", "auriculares"
  ];
  isSyncing: boolean = false;
  totalSources = 0;
  activeSources = 0;
  failedSources = 0;
  totalScrapedProducts = 0;
  newProductsToday = 0;
  totalClicks = 0;
  availableQueries: string[] = [
    "notebook", "tablet", "monitor", "mouse", 
    "procesador", "placa de video", "memoria ram", "auriculares"
  ];
  
  maxPages: number = 1;
  activeScraper: string | null = null;
  statusMessage: string = '';
  isSuccess: boolean = false;

  // Estado de Marketplaces (Tabla Principal)
  marketplaceStatus: any[] = [];

  // Reportes de BI (Secciones Inferiores)
  generalStats: any = {};
  topProducts: any[] = [];
  topSearches: any[] = [];

  // Referencias a instancias de gráficos para poder destruirlos/actualizarlos
  private productsChart: any;
  private trafficChart: any;
  private pollingSubscription?: Subscription;

  constructor(
    private toastr: ToastrService,
    private adminReportService: AdminReportService,
    private scraperService: ScraperService
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
        if (this.marketplaceStatus.some(s => s.status?.includes('Procesando'))) {
          this.startPolling();
        }
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

  startPolling(): void {
    if (this.pollingSubscription) return;

    console.log("Iniciando Polling (Modo Radar Activado 📡)");
    
    // Consulta cada 5 segundos
    this.pollingSubscription = interval(5000).subscribe(() => {
      this.adminReportService.getMarketplaceStatuses().subscribe({
        next: (newStoresData) => {
          let isAnyoneProcessing = false;

          newStoresData.forEach((newStore: any) => {
            const existingStore = this.marketplaceStatus.find(s => s.id === newStore.id);
            if (existingStore) {
              
              // 💡 DETECTAMOS EL CAMBIO A ONLINE
              if (existingStore.status?.includes('Procesando') && newStore.status === 'Online') {
                this.toastr.success(`¡${existingStore.name} finalizó la sincronización!`, 'Scraping Completo');
              }
              
              existingStore.status = newStore.status || 'Online';
              existingStore.lastUpdate = newStore.lastUpdate || newStore.updatedAt;
              existingStore.productCount = newStore.productCount;
            }

            if (newStore.status?.includes('Procesando')) {
              isAnyoneProcessing = true;
            }
          });

          // Actualizamos el gráfico si cambiaron las cantidades
          this.initProductsChart();

          if (!isAnyoneProcessing) {
            console.log("Todos los scrapers finalizaron. Deteniendo Polling.");
            this.stopPolling();
            // Actualizamos los KPIs principales ya que terminamos
            this.loadAllData();
          }
        },
        error: (err) => console.error("Error en polling:", err)
      });
    });
  }

  stopPolling(): void {
    if (this.pollingSubscription) {
      this.pollingSubscription.unsubscribe();
      this.pollingSubscription = undefined;
    }
  }

  /**
   * Ejecuta el proceso de scraping simulado (Mock)
   */
  syncAllSources(): void {
    if (this.isSyncing) return; // Evita doble click

    this.isSyncing = true;

    // Armamos el payload con el array completo
    const payload: ScraperParams = {
      queries: this.targetCategories,
      maxPages: 1 // o la cantidad de páginas por defecto que quieras scrapear
    };

    // Llamamos al servicio general
    this.scraperService.syncAllStores(payload).subscribe({
      next: (response) => {
        this.isSyncing = false;
        // Podés usar una librería bonita como SweetAlert en lugar de un alert feo
        this.toastr.success('Sincronización global iniciada en segundo plano.', 'En proceso');
        this.marketplaceStatus.forEach(site => site.status = 'Procesando...');
        this.startPolling();
        
        // Acá podrías llamar a un this.loadDashboardData() para actualizar los KPIs
      },
      error: (error) => {
        this.isSyncing = false;
        console.error("Error en sincronización:", error);
        alert(`Error al sincronizar: ${error.error?.message || 'Revisa la conexión con el servidor'}`);
      }
    });
  }

  retestSource(id: number): void {
    const site = this.marketplaceStatus.find(s => s.id === id);
    
    if (!site) {
      this.toastr.error('No se encontró la información de la tienda.');
      return;
    }

    // 1. Avisamos que estamos enviando la orden al servidor
    this.toastr.info(`Conectando con el servidor para ${site.name}...`, 'Iniciando');
    
    const previousStatus = site.status;
    site.status = 'Conectando...';

    const payload: ScraperParams = {
      queries: this.targetCategories,
      maxPages: 1
    };

    let request$;
    const storeName = site.name.toLowerCase();
    
    if (storeName.includes('mercado')) {
      request$ = this.scraperService.syncMercadoLibre(payload);
    } else if (storeName.includes('gamer')) {
      request$ = this.scraperService.syncCompraGamer(payload);
    } else if (storeName.includes('venex')) {
      request$ = this.scraperService.syncVenex(payload);
    } else if (storeName.includes('fravega')) {
      request$ = this.scraperService.syncFravega(payload);
    } else {
      this.toastr.error(`No hay un scraper configurado para ${site.name}`);
      site.status = previousStatus;
      return;
    }

    request$.subscribe({
      next: (response: any) => {
        this.toastr.success(response.message || `Scraping de ${site.name} corriendo en segundo plano.`, 'Orden Recibida');
        site.status = 'Procesando...'; 
        this.startPolling();
      },
      error: (error) => {
        console.error(`Error enviando orden a ${site.name}:`, error);
        this.toastr.error(`No se pudo iniciar el scraping en ${site.name}.`, 'Error de conexión');
        site.status = 'Warning';
      }
    });
  }

  getStatusClass(status: string): string {
    if (!status) return 'badge-warn';
    const s = status.toUpperCase();
    if (s.includes('ONLINE') || s.includes('OK')) return 'badge-ok';
    if (s.includes('ERROR')) return 'badge-error';
    return 'badge-warn'; // Procesando o Warning quedan amarillo/azul
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

  runScraper(store: 'ALL' | 'ML' | 'CG' | 'VENEX' | 'FRAVEGA'): void {
    this.activeScraper = store;
    this.showMessage(`Iniciando scraping del catálogo completo en ${store}... Esto tomará varios minutos.`, true, true);

    // 💡 ACÁ ESTÁ LA MAGIA: Enviamos siempre el arreglo completo
    const payload = { 
      queries: this.availableQueries, 
      maxPages: this.maxPages 
    };

    let request$;

    switch (store) {
      case 'ALL': request$ = this.scraperService.syncAllStores(payload); break;
      case 'ML': request$ = this.scraperService.syncMercadoLibre(payload); break;
      case 'CG': request$ = this.scraperService.syncCompraGamer(payload); break;
      case 'VENEX': request$ = this.scraperService.syncVenex(payload); break;
      case 'FRAVEGA': request$ = this.scraperService.syncFravega(payload); break;
    }

    request$.subscribe({
      next: () => {
        this.activeScraper = null;
        this.showMessage(`¡Éxito! Catálogo base actualizado correctamente en ${store}.`, true);
      },
      error: (err) => {
        this.activeScraper = null;
        this.showMessage(`Error en ${store}: ${err.error?.message || 'Error desconocido'}`, false);
      }
    });
  }

  private showMessage(msg: string, isSuccess: boolean, isLoading: boolean = false): void {
    this.statusMessage = msg;
    this.isSuccess = isSuccess;
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