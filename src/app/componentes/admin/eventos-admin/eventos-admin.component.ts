import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { EventosService } from '../../../service/eventos.service';
import { Evento } from '../../../interface/evento';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { NotificacionesService } from '../../../service/notificaciones.service';
import { CommonModule } from '@angular/common';
type ColorKey = 'pastelVioleta' | 'pastelIndigo' | 'pastelBlue' | 'pastelGreen' | 'pastelYellow' | 'pastelOrange' | 'pastelRed';

@Component({
    selector: 'app-eventos-admin',
    imports: [ReactiveFormsModule, CommonModule],
    templateUrl: './eventos-admin.component.html',
    styleUrl: './eventos-admin.component.scss'
})
export class EventosAdminComponent implements OnInit {
  eventoForm!: FormGroup;
  eventos: Evento[] = [];
  mostrarFormularioEvento: boolean = false;
  eventoEditando: any = null;
  editando = false;
  agregando = false;
  evento: Partial<Evento> = {};
  selectedColor: ColorKey = 'pastelBlue';  
  selectedFile: File | null = null;

  constructor(private fb: FormBuilder, private eventosService: EventosService, private notificationService: NotificacionesService, private cdr: ChangeDetectorRef) {}
  ngOnInit(): void {
    this.eventoForm = this.fb.group({
      titulo: ['', Validators.required],
      descripcion: ['', Validators.required],
      fecha: ['', Validators.required],
      fecha_fin: [''],
      hora_inicio: ['', Validators.required],
      hora_fin: [''],
      color: ['#ffffff', Validators.required],
      entrada: ['', Validators.required],
      precio: [null, Validators.min(0)],
      ubicacion: ['', Validators.required]
    });
    this.eventoForm.get('entrada')?.valueChanges.subscribe(value => {
      this.togglePrecio(value);
    });
    this.obtenerEventos();
  }

  togglePrecio(entrada: string): void {
  const precioControl = this.eventoForm.get('precio');
  if (entrada === 'Pago') {
    precioControl?.setValidators([Validators.required, Validators.min(0)]);
  } else {
    precioControl?.clearValidators();
    precioControl?.reset();
  }
  precioControl?.updateValueAndValidity();
  }
  
  obtenerEventos() {
    this.eventosService.getEventos().subscribe((eventos) => {
      console.log('Eventos obtenidos:', eventos);
      this.eventos = eventos;
      this.cdr.detectChanges();
    }, error => {
      console.error('Error al obtener eventos', error);
    });
  }

  limpiarFormulario(): void {
    this.editando = false;
    this.agregando = false;
    this.eventoForm.reset();
    this.eventoEditando = null;
    this.mostrarFormularioEvento = false;
  }

  setColor(color: string): void {
    const colorHex = this.mapearColor(color || '#26c6da');
    this.eventoForm.get('color')?.setValue(colorHex);
  }

  private mapearColor(color: string): string {
    const colores: { [key: string]: string } = {
    '#ffca28': 'pastelYellow',
    '#ab47bc': 'pastelIndigo',
    '#26c6da': 'pastelBlue',
    '#26a69a': 'pastelGreen',
    '#ff7043': 'pastelOrange',
    '#ef5350': 'pastelRed',
    '#7d54c4': 'pastelVioleta',
    };
    if (Object.values(colores).includes(color)) {
      return color
    }
    return colores[color] || '#26c6da';
  }

  
  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files?.length) {
      this.selectedFile = input.files[0];
    }
  }

  agregarEvento() {
    this.mostrarFormularioEvento = !this.mostrarFormularioEvento;
    this.editando = false;
    this.agregando = true;

    if (this.evento.fecha) {
      this.evento.fecha = new Date(this.evento.fecha).toISOString().split('T')[0];
    } else {
      delete this.evento.fecha;
    }

    if (this.evento.fecha_fin) {
      this.evento.fecha_fin = new Date(this.evento.fecha_fin).toISOString().split('T')[0];
    } else {
      this.evento.fecha_fin = null;
    }

    if (this.evento.hora_inicio) {
      this.evento.hora_inicio = new Date(`1970-01-01T${this.evento.hora_inicio}`).toISOString().split('T')[1].slice(0, 5);
    } else {
      delete this.evento.hora_inicio;
    }

    if (this.evento.hora_fin) {
      this.evento.hora_fin = new Date(`1970-01-01T${this.evento.hora_fin}`).toISOString().split('T')[1].slice(0, 5);
    } else {
      this.evento.hora_fin = null;
    }
    if (this.eventoForm.valid) {
      const formValue = this.eventoForm.value;

      if (!['pastelVioleta', 'pastelIndigo', 'pastelBlue', 'pastelGreen', 'pastelYellow', 'pastelOrange', 'pastelRed'].includes(formValue.color)) {
        console.error('Color inválido:', formValue.color);
        return;
      }

    formValue.fecha = formValue.fecha ? new Date(formValue.fecha).toISOString().split('T')[0] : null;
    formValue.fecha_fin = formValue.fecha_fin ? new Date(formValue.fecha_fin).toISOString().split('T')[0] : null;

      if (formValue.entrada === 'Gratuito') {
        delete formValue.precio;
      }

    const formData = new FormData();
    Object.keys(formValue).forEach(key => {
      if (formValue[key] !== null) {
        formData.append(key, formValue[key]);
      }
    });

    // Añadir el archivo si está presente
    if (this.selectedFile) {
      formData.append('photo', this.selectedFile);
    }
      
      if (this.eventoEditando) {
        const eventoActualizado = { ...formValue, id_evento: this.eventoEditando.id_evento };
        console.log('Evento actualizado:', eventoActualizado);
        this.eventosService.actualizarEvento(eventoActualizado).subscribe({
          next: (response) => {
            this.notificationService.mostrarExito('Evento actualizado con éxito');
            this.limpiarFormulario();
            this.obtenerEventos();
          },
          error: (error) => {
            this.notificationService.mostrarError('Error al actualizar el evento');
              console.error(error);
          }
        });
      } else {
        this.eventosService.crearEvento(formData).subscribe({
          next: (response) => {
            this.notificationService.mostrarExito('Evento creado con éxito');
            this.limpiarFormulario();
            this.obtenerEventos();
          },
          error: (error) => {
            this.notificationService.mostrarError('Error al crear el evento');
            console.error('Error al crear evento:', error);
          }
        });
      }
    }
    this.obtenerEventos();
  }

  editarEvento(evento: Evento): void {
    this.editando = true;
    this.agregando = false;
  
    this.eventoEditando = evento;
    const colorName = this.mapearColor(evento.color || '#26c6da');

    this.eventoForm.setValue({
      titulo: evento.titulo || '',
      descripcion: evento.descripcion || '',
      fecha: evento.fecha ? new Date(evento.fecha).toISOString().split('T')[0] : '',
      fecha_fin: evento.fecha_fin ? new Date(evento.fecha_fin).toISOString().split('T')[0] : '',
      hora_inicio: evento.hora_inicio ? evento.hora_inicio.slice(0, 5) : '',
      hora_fin: evento.hora_fin ? evento.hora_fin.slice(0, 5) : '',
      color: evento.color || 'pastelBlue',
      entrada: evento.entrada || 'Gratuito',
      precio: evento.precio ?? null,
      ubicacion: evento.ubicacion || '',
    });
    this.mostrarFormularioEvento = true;
  }
  
  eliminarEvento(evento: Evento) {
    if (confirm('¿Estás seguro de que deseas eliminar este evento?')) {
    if (evento.id_evento) {
      this.eventosService.eliminarEvento(evento.id_evento).subscribe(() => {
        this.notificationService.mostrarExito('Evento eliminado con éxito');
        this.obtenerEventos();
      });
    } else {
      this.notificationService.mostrarError('No se pudo eliminar el evento');
      console.error("No se puede eliminar un evento sin ID");
    }
  }
}
}
