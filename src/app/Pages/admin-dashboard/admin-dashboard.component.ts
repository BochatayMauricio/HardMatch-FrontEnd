import { Component, AfterViewInit } from '@angular/core';
import { CommonModule, DatePipe, DecimalPipe } from '@angular/common';
import Chart from 'chart.js/auto';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, DatePipe, DecimalPipe],
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.css']
})
export class AdminDashboardComponent implements AfterViewInit {
  totalSources = 5;
  activeSources = 3;
  failedSources = 2;
  totalScrapedProducts = 45280;
  newProductsToday = 145;
  totalClicks = 1240;

  marketplaceStatus = [
    { 
      id: 1, 
      name: 'Frávega', 
      logo: 'https://www.producteca.com/wp-content/uploads/2019/10/logo-fravega.png', 
      lastUpdate: new Date(), 
      productCount: 12500, 
      totalClicks: 850, 
      avgVariation: 2.1, 
      priceDrop: true, 
      status: 'OK' 
    },
    { 
      id: 2, 
      name: 'Megatone', 
      logo: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSizIafuBFg-anhaMGLK9X7NQ8Wt4OGZy5eZg&s', 
      lastUpdate: new Date(new Date().getTime() - 1000 * 60 * 15),
      productCount: 8400, 
      totalClicks: 420, 
      avgVariation: 1.5, 
      priceDrop: false, 
      status: 'OK' 
    },
    { 
      id: 3, 
      name: 'Naldo', 
      logo: 'https://cuponesargentina.com.ar/wp-content/uploads/2025/05/logo-naldo.png', 
      lastUpdate: new Date(new Date().getTime() - 1000 * 60 * 5),
      productCount: 6200, 
      totalClicks: 315, 
      avgVariation: 0.8, 
      priceDrop: true, 
      status: 'OK' 
    },
    { 
      id: 4, 
      name: 'On City', 
      logo: 'https://migestion.oncity.com/assets/isotipo_large.png', 
      lastUpdate: new Date(new Date().getTime() - 1000 * 60 * 60 * 2),
      productCount: 9100, 
      totalClicks: 150, 
      avgVariation: 3.2, 
      priceDrop: false, 
      status: 'WARNING' 
    },
    { 
      id: 5, 
      name: 'Pardo', 
      logo: 'https://http2.mlstatic.com/D_NQ_NP_950425-MLA74959095381_032024-O.webp', 
      lastUpdate: new Date(new Date().getTime() - 1000 * 60 * 60 * 24),
      productCount: 4300, 
      totalClicks: 80, 
      avgVariation: 0.0, 
      priceDrop: false, 
      status: 'ERROR' 
    }
  ];

  constructor(
    private toastr: ToastrService
  ) {}

  syncAllSources() {
    this.toastr.warning(
    'Sincronizando el catálogo de todas las tiendas...',
    'Sincronización Iniciada'
    );
  }

  retestSource(id: number) { 
    const site = this.marketplaceStatus.find(s => s.id === id);
    this.toastr.warning(
        'Verificando conexión y selectores HTML para: ' + site?.name
      );
  }

  getStatusClass(status: string) {
    if(status === 'OK') return 'badge-ok';
    if(status === 'ERROR') return 'badge-error';
    return 'badge-warn';
  }

  ngAfterViewInit(): void {
    setTimeout(() => {
      this.initProductsChart();
      this.initTrafficChart();
    }, 100);
  }

  initProductsChart() {
    const ctx = document.getElementById('productsChart') as HTMLCanvasElement;
    
    const chartLabels = this.marketplaceStatus.map(site => site.name);
    const chartData = this.marketplaceStatus.map(site => site.productCount);

    new Chart(ctx, {
      type: 'doughnut', 
      data: {
        labels: chartLabels,
        datasets: [{
          data: chartData,
          backgroundColor: [
            '#7c3aed',
            '#ef4444',
            '#3b82f6',
            '#10b981',
            '#1e293b'
          ], 
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
            labels: {
              usePointStyle: true,
              padding: 20
            }
          } 
        }
      }
    });
  }

  initTrafficChart() {
    const ctx = document.getElementById('trafficChart') as HTMLCanvasElement;
    new Chart(ctx, {
      type: 'line', 
      data: {
        labels: ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'],
        datasets: [{
          label: 'Redirecciones a Tiendas',
          data: [150, 230, 180, 290, 200, 350, 410],
          borderColor: '#7c3aed',
          backgroundColor: 'rgba(124, 58, 237, 0.1)',
          fill: true,
          tension: 0.4,
          pointBackgroundColor: '#ffffff',
          pointBorderColor: '#7c3aed',
          pointBorderWidth: 2,
          pointRadius: 4,
          pointHoverRadius: 6
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: {
            beginAtZero: true,
            grid: {
              display: true,
              color: 'rgba(0,0,0,0.05)'
            }
          },
          x: {
            grid: {
              display: false
            }
          }
        },
        plugins: {
          legend: { display: false }
        }
      }
    });
  }
}

