import { Component, OnInit, ChangeDetectorRef, ChangeDetectionStrategy } from '@angular/core';
import { EventosService } from '../../../service/eventos.service';
import { Evento } from '../../../interface/evento';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { NotificacionesService } from '../../../service/notificaciones.service';

type ColorKey = 'pastelVioleta' | 'pastelIndigo' | 'pastelBlue' | 'pastelGreen' | 'pastelYellow' | 'pastelOrange' | 'pastelRed';

@Component({
    selector: 'app-eventos-admin',
    imports: [ReactiveFormsModule],
    templateUrl: './eventos-admin.component.html',
    changeDetection: ChangeDetectionStrategy.Eager,
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
  // Clases completas para que Tailwind las genere
  colores: { nombre: ColorKey, clase: string }[] = [
    { nombre: 'pastelVioleta', clase: 'bg-pastelVioleta' },
    { nombre: 'pastelIndigo', clase: 'bg-pastelIndigo' },
    { nombre: 'pastelBlue', clase: 'bg-pastelBlue' },
    { nombre: 'pastelGreen', clase: 'bg-pastelGreen' },
    { nombre: 'pastelYellow', clase: 'bg-pastelYellow' },
    { nombre: 'pastelOrange', clase: 'bg-pastelOrange' },
    { nombre: 'pastelRed', clase: 'bg-pastelRed' },
  ];
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
      color: ['pastelBlue', Validators.required],
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
    this.eventoForm.reset({ color: 'pastelBlue' });
    this.eventoEditando = null;
    this.selectedFile = null;
    this.mostrarFormularioEvento = false;
  }

  nuevoEvento(): void {
    this.limpiarFormulario();
    this.agregando = true;
    this.mostrarFormularioEvento = true;
  }

  private mensajeError(error: any, porDefecto: string): string {
    return error?.error?.errors?.[0]?.msg || error?.error?.message || porDefecto;
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

  guardarEvento() {
    if (this.eventoForm.invalid) {
      this.eventoForm.markAllAsTouched();
      this.notificationService.mostrarError('Rellena todos los campos obligatorios');
      return;
    }

    const formValue = this.eventoForm.value;

    if (!['pastelVioleta', 'pastelIndigo', 'pastelBlue', 'pastelGreen', 'pastelYellow', 'pastelOrange', 'pastelRed'].includes(formValue.color)) {
      this.notificationService.mostrarError('Elige un color para el evento');
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

    // Si falla, el formulario queda abierto con los datos para poder corregirlos
    if (this.eventoEditando) {
      const eventoActualizado = { ...formValue, id_evento: this.eventoEditando.id_evento };
      this.eventosService.actualizarEvento(eventoActualizado).subscribe({
        next: () => {
          this.notificationService.mostrarExito('Evento actualizado con éxito');
          this.limpiarFormulario();
          this.obtenerEventos();
        },
        error: (error) => {
          this.notificationService.mostrarError(this.mensajeError(error, 'Error al actualizar el evento'));
          console.error(error);
        }
      });
    } else {
      this.eventosService.crearEvento(formData).subscribe({
        next: () => {
          this.notificationService.mostrarExito('Evento creado con éxito');
          this.limpiarFormulario();
          this.obtenerEventos();
        },
        error: (error) => {
          this.notificationService.mostrarError(this.mensajeError(error, 'Error al crear el evento'));
          console.error('Error al crear evento:', error);
        }
      });
    }
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
