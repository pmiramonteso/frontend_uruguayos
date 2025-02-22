import { CommonModule } from '@angular/common';
import { Component, OnInit, AfterViewInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { EventosService } from '../../service/eventos.service';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import { FullCalendarModule, FullCalendarComponent } from '@fullcalendar/angular';
import { CalendarOptions } from '@fullcalendar/core';
import { FooterComponent } from '../footer/footer.component';
import esLocale from '@fullcalendar/core/locales/es';
import { environment } from '../../environments/environment';

@Component({
    selector: 'app-calendario',
    imports: [CommonModule, FullCalendarModule, FooterComponent ],
    templateUrl: './calendario.component.html',
    styleUrl: './calendario.component.scss'
})

export class CalendarioComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('calendar') calendarComponent!: FullCalendarComponent;
  eventos: any[] = [];
  eventoSeleccionado: any = null;
  defaultImageUrl: string = 'assets/img/default-blog.jpg';
  private resizeListener: () => void;
  proximosEventos: any[] = [];
  eventosVisibles: number = 10;
  hayMasEventos: boolean = false;

  calendarOptions: CalendarOptions = {
    locale: esLocale, 
    initialView: 'dayGridMonth',
    headerToolbar: false,
    footerToolbar: false,
    plugins: [dayGridPlugin, interactionPlugin],
    events: this.eventos,
    eventClick: this.mostrarModal.bind(this),
    showNonCurrentDates: false,
    fixedWeekCount: false,
    eventContent: this.renderEventContent.bind(this),
    eventDidMount: this.handleEventMount.bind(this)
};

  constructor(private eventosService: EventosService) {
    this.resizeListener = () => this.ajustarCalendarioResponsivo();
    this.obtenerEventos();
    this.eventosService.getEventosActualizados().subscribe(() => {
      this.obtenerEventos();
    });
  }

  ngOnInit() {
    this.ajustarCalendarioResponsivo();
    window.addEventListener('resize', this.resizeListener);
  }
  
  ngAfterViewInit() {
    if (this.calendarComponent) {
      this.configurarControlesPersonalizados();
      this.actualizarTitulo();
    } else {
      console.error('Componente calendario no inicializado');
    }
  }

  private renderEventContent(eventInfo: any) {
    return {
      html: `
        <div class="event-content">
          <div class="event-title">${eventInfo.event.title}</div>
        </div>
      `
    };
  }

  private handleEventMount(info: any) {
    info.el.classList.add('custom-calendar-event');
  }

  private configurarControlesPersonalizados() {
    const calendarApi = this.calendarComponent.getApi();
    
    const prevButton = document.getElementById('btn-prev');
    const nextButton = document.getElementById('btn-next');
    const todayButton = document.getElementById('btn-today');
    const monthButton = document.getElementById('btn-month');
    const weekButton = document.getElementById('btn-week');
    const dayButton = document.getElementById('btn-day');

    if (prevButton) {
      prevButton.addEventListener('click', () => {
        calendarApi.prev();
        this.actualizarTitulo();
      });
    }
    
    if (nextButton) {
      nextButton.addEventListener('click', () => {
        calendarApi.next();
        this.actualizarTitulo();
      });
    }
    
    if (todayButton) {
      todayButton.addEventListener('click', () => {
        calendarApi.today();
        this.actualizarTitulo();
      });
    }

    if (monthButton) {
      monthButton.addEventListener('click', () => {
        calendarApi.changeView('dayGridMonth');
        this.actualizarBotonesVista('btn-month');
      });
    }
    
    if (weekButton) {
      weekButton.addEventListener('click', () => {
        calendarApi.changeView('dayGridWeek');
        this.actualizarBotonesVista('btn-week');
      });
    }
    
    if (dayButton) {
      dayButton.addEventListener('click', () => {
        calendarApi.changeView('dayGridDay');
        this.actualizarBotonesVista('btn-day');
      });
    }
  }
  
  private actualizarTitulo() {
    if (!this.calendarComponent) return;
    
    const calendarApi = this.calendarComponent.getApi();
    const currentDate = calendarApi.getDate();
    
    const month = currentDate.toLocaleString('es', { month: 'long' });
    const year = currentDate.getFullYear();
    const capitalizedMonth = month.charAt(0).toUpperCase() + month.slice(1);
    
    const tituloElement = document.getElementById('calendario-titulo');
    if (tituloElement) {
      tituloElement.textContent = `${capitalizedMonth} ${year}`;
    }
  }
  
  private actualizarBotonesVista(activeId: string) {
    document.querySelectorAll('.view-btn').forEach(btn => {
      btn.classList.remove('active', 'bg-teal-500', 'text-white');
      btn.classList.add('hover:bg-teal-100');
    });
    
    const activeBtn = document.getElementById(activeId);
    if (activeBtn) {
      activeBtn.classList.add('active', 'bg-teal-500', 'text-white');
      activeBtn.classList.remove('hover:bg-teal-100');
    }
  }

  private ajustarCalendarioResponsivo() {
    const calendar = this.calendarComponent?.getApi();
    if (calendar) {
      calendar.updateSize();
    }
  }
  ngOnDestroy() {
    window.removeEventListener('resize', this.resizeListener);
    
    const buttons = ['btn-prev', 'btn-next', 'btn-today', 'btn-month', 'btn-week', 'btn-day'];
    buttons.forEach(id => {
      const button = document.getElementById(id);
      if (button) {
        button.replaceWith(button.cloneNode(true));
      }
    });
  }

  private mapearColor(color: string): string {
    const colores: { [key: string]: string } = {
      pastelYellow: '#ffca28',
      pastelIndigo: '#ab47bc',
      pastelBlue: '#26c6da',
      pastelGreen: '#26a69a',
      pastelOrange: '#ff7043',
      pastelRed: '#ef5350',
      pastelVioleta: '#7d54c4',
    };
    return colores[color] || '#a0c1e1';
  }

  obtenerEventos() {
    this.eventosService.getEventos().subscribe((data) => {
      this.eventos = data.map(evento => {
        const colorValido = this.mapearColor(evento.color || '#0000FF');

        const eventoFormateado = {
        titulo: evento.titulo,
        fecha: evento.fecha,
        fecha_fin: evento.fecha_fin,
        descripcion: evento.descripcion,
        hora_inicio: evento.hora_inicio,
        hora_fin: evento.hora_fin,
        color: evento.color,
        entrada: evento.entrada,
        precio: evento.precio,
        ubicacion: evento.ubicacion,
        photo: evento.photo ?  `${environment.endpoint}assets/img/${evento.photo}` : this.defaultImageUrl,

        // Formato de FullCalendar
        title: evento.titulo,
        start: evento.fecha,
        end: evento.fecha_fin,
        backgroundColor: colorValido,
        textColor: '#ffffff',
        className: 'custom-calendar-event'
      };
      return eventoFormateado;
    });
      this.calendarOptions.events = this.eventos.map(evento => ({
        title: evento.title,
        start: evento.start,
        end: evento.end,
        backgroundColor: evento.backgroundColor,
        textColor: '#ffffff',
        className: 'custom-calendar-event'
      }));
      this.calcularProximosEventos();
    });
  }

  private calcularProximosEventos() {
    const hoy = new Date();
    // Filtra eventos futuros por fecha
    this.proximosEventos = this.eventos
      .filter(evento => new Date(evento.fecha) >= hoy)
      .sort((a, b) => new Date(a.fecha).getTime() - new Date(b.fecha).getTime());
    
    // Verifico si hay más de 10 eventos
    this.hayMasEventos = this.proximosEventos.length > this.eventosVisibles;
  }

  verMasEventos() {
    this.eventosVisibles += 10;
    this.hayMasEventos = this.proximosEventos.length > this.eventosVisibles;
  }

  mostrarModal(info: any) {
    const evento = this.eventos.find(e => e.title === info.event.title);
    this.eventoSeleccionado = evento;
  }
  seleccionarEvento(evento: any) {
    this.eventoSeleccionado = evento;
  }
  cerrarModal() {
    this.eventoSeleccionado = null;
  }
}
