import { Component, OnInit } from '@angular/core';
import { Chart, registerables } from 'chart.js';
import { GraficosService } from '../../../service/graficos.service';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FooterComponent } from '../../footer/footer.component';

Chart.register(...registerables);

@Component({
    selector: 'app-graficos-admin',
    imports: [CommonModule, FooterComponent, RouterModule],
    templateUrl: './graficos-admin.component.html',
    styleUrls: ['./graficos-admin.component.scss']
})
export class GraficosAdminComponent implements OnInit {
  aniosDisponibles: number[] = [];
  datosGrafico: any = {};
  graficoActual: any;

  constructor(private graficosService: GraficosService) {}

  ngOnInit(): void {
    this.cargarDatos();
  }

  cargarDatos() {
    this.graficosService.getGrafico1().subscribe((datos) => {
      this.generarGraficoBarras(datos);
    });

    this.graficosService.getGrafico3().subscribe((datos) => {
      this.generarGraficoLineas(datos);
    });

 this.graficosService.getGrafico4().subscribe((datos) => {
      this.datosGrafico = datos.reduce((result: any, item: any) => {
        result[item.anio] = item;
        return result;
      }, {});

      this.aniosDisponibles = Object.keys(this.datosGrafico).map(Number);
      if (this.aniosDisponibles.length > 0) {
        this.cambiarAnio(this.aniosDisponibles[0]);
      }
    });
  }

  generarGraficoBarras(datos: any) {
    if (!datos || !datos.labels || !datos.values) {
      console.error('Datos inválidos para el gráfico de barras:', datos);
      return;
    }

      const ctx = document.getElementById('graficoBarras') as HTMLCanvasElement;
      new Chart(ctx, {
        type: 'bar',
        data: {
          labels: datos.labels,
        datasets: [
          {
            label: 'Total emigrantes en España',
            data: datos.values.total_emigrantes_españa,
            backgroundColor: 'rgba(75, 192, 192, 0.6)',
          },
          {
            label: 'Nacionalidad Extranjera',
            data: datos.values.nacionalidad_extranjera,
            backgroundColor: 'rgba(255, 99, 132, 0.6)',
          },
          {
            label: 'Nacionalidad Española',
            data: datos.values.nacionalidad_española,
            backgroundColor: 'rgba(54, 162, 235, 0.6)',
          },
          ],
        },
      });
    }

  generarGraficoLineas(datos: any) {
    new Chart('graficoLineas', {
      type: 'line',
      data: {
        labels: datos.labels,
        datasets: [
          {
            label: 'Emigrantes en el mundo',
            data: datos.values,
            borderColor: 'rgba(54, 162, 235, 1)',
            backgroundColor: 'rgba(54, 162, 235, 0.2)',
            fill: true,
          },
        ],
      },
      options: {
        scales: {
          y: {
            beginAtZero: true,
          },
        },
      },
    });
  }

  cambiarAnio(anioSeleccionado: number) {
    const datos = this.datosGrafico[anioSeleccionado];

    if (this.graficoActual) {
      this.graficoActual.destroy();
    }

    const ctx = document.getElementById('graficoTorta') as HTMLCanvasElement;
    this.graficoActual = new Chart(ctx, {
      type: 'pie',
      data: {
        labels: datos.labels,
        datasets: [
          {
            label: `Emigrantes por país en ${anioSeleccionado}`,
            data: datos.values,
            backgroundColor: [
              'rgba(255, 99, 132, 0.2)',
              'rgba(54, 162, 235, 0.2)',
              'rgba(255, 206, 86, 0.2)',
              'rgba(75, 192, 192, 0.2)',
              'rgba(153, 102, 255, 0.2)',
              'rgba(255, 159, 64, 0.2)',
              'rgba(201, 203, 207, 0.2)',
              'rgba(99, 255, 132, 0.2)',
              'rgba(160, 160, 160, 0.2)',
              'rgba(255, 102, 204, 0.2)',
              'rgba(102, 204, 255, 0.2)',
              'rgba(204, 255, 102, 0.2)',
              'rgba(255, 204, 102, 0.2)',
              'rgba(255, 102, 102, 0.2)',
              'rgba(102, 255, 204, 0.2)',
              'rgba(204, 102, 255, 0.2)',
              'rgba(102, 255, 102, 0.2)',
              'rgba(255, 153, 153, 0.2)',
              'rgba(153, 255, 255, 0.2)',
              'rgba(204, 153, 255, 0.2)',
            ],
            borderColor: [
              'rgba(255, 99, 132, 0.2)',
              'rgba(54, 162, 235, 0.2)',
              'rgba(255, 206, 86, 0.2)',
              'rgba(75, 192, 192, 0.2)',
              'rgba(153, 102, 255, 0.2)',
              'rgba(255, 159, 64, 0.2)',
              'rgba(201, 203, 207, 0.2)',
              'rgba(99, 255, 132, 0.2)',
              'rgba(160, 160, 160, 0.2)',
              'rgba(255, 102, 204, 0.2)',
              'rgba(102, 204, 255, 0.2)',
              'rgba(204, 255, 102, 0.2)',
              'rgba(255, 204, 102, 0.2)',
              'rgba(255, 102, 102, 0.2)',
              'rgba(102, 255, 204, 0.2)',
              'rgba(204, 102, 255, 0.2)',
              'rgba(102, 255, 102, 0.2)',
              'rgba(255, 153, 153, 0.2)',
              'rgba(153, 255, 255, 0.2)',
              'rgba(204, 153, 255, 0.2)',
            ],
            borderWidth: 1,
          },
        ],
      },
      options: {responsive: true,
        plugins: {
          legend: {
            position: 'top',
            labels: {
              boxWidth: 12,
              padding: 20,
            },
          },
          tooltip: {
            callbacks: {
              label: function (tooltipItem) {
                return tooltipItem.label + ': ' + tooltipItem.raw + ' personas'; 
              },
            },
          },
        },
        layout: {
          padding: {
            left: 10,
            right: 10,
            top: 10,
            bottom: 10,
          },
        },
        aspectRatio: 1,
      },
    });

}
}