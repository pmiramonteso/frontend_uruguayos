/// <reference types="leaflet.markercluster" />
import { Component, OnInit, AfterViewInit, OnDestroy, ChangeDetectionStrategy } from '@angular/core';
import { Negocio } from '../../interface/negocio';
import { NegociosService } from '../../service/negocios.service';
import { FooterComponent } from '../footer/footer.component';
import type * as Leaflet from 'leaflet';

// Leaflet y leaflet.markercluster solo se descargan al entrar en /mapa (no en el resto de la web).
// El plugin se registra sobre la variable global L, que Leaflet crea al cargarse: hay que usar
// esa misma copia, porque el espacio de nombres ESM es otra instancia y no admite el plugin.
declare const L: typeof Leaflet;

async function cargarLeaflet(): Promise<void> {
  const global = globalThis as any;
  if (global.L?.markerClusterGroup) return;
  const leaflet: any = await import('leaflet');
  global.L = leaflet.default ?? { ...leaflet };
  await import('leaflet.markercluster');
}

const icono = (url: string, tamano: number, anclaY = tamano): Leaflet.Icon => L.icon({
  iconUrl: url,
  iconSize: [tamano, tamano],
  iconAnchor: [tamano / 2, anclaY],
  popupAnchor: [0, -anclaY],
});

@Component({
    selector: 'app-mapa',
    imports: [FooterComponent],
    templateUrl: './mapa.component.html',
    changeDetection: ChangeDetectionStrategy.Eager,
    styleUrl: './mapa.component.scss'
})
export class MapaComponent implements OnInit, AfterViewInit, OnDestroy {
  map: Leaflet.Map | null = null;
  markerClusterGroup: Leaflet.MarkerClusterGroup | null = null;
  negocios: Negocio[] = [];
  isAdmin: boolean = false;
  mostrarModal: boolean = false;
  negocioSeleccionado: Negocio | null = null;
  negociosFiltrados: Negocio[] = [];
  categorias: string[] = ['restaurante', 'tienda', 'servicio', 'panaderia'];
  categoriaSeleccionada: string | null = null;
  categoriasSeleccionadas: string[] = [];
  currentSelectedMarker: Leaflet.Marker | null = null;
  private destruido = false;

  // Se crean al cargar Leaflet (crearIconos)
  iconRestaurante!: Leaflet.Icon;
  iconPanaderia!: Leaflet.Icon;
  iconRestauranteSelected!: Leaflet.Icon;
  iconPanaderiaSelected!: Leaflet.Icon;
  iconUsuario!: Leaflet.Icon;

  constructor(private negociosService: NegociosService) {}

  checkRole(): void {
    const token = localStorage.getItem('token');
    if (token) {
      const payload = JSON.parse(atob(token.split('.')[1]));
      this.isAdmin = payload.role === 'admin';
    }
  }
  ngOnInit(): void {
    this.cargarNegocios();
  }

  async ngAfterViewInit(): Promise<void> {
    try {
      await cargarLeaflet();
    } catch (error) {
      console.error('No se ha podido cargar el mapa:', error);
      return;
    }
    // Si se ha salido de la página mientras se descargaba, ya no hay donde pintar el mapa
    if (this.destruido) return;

    this.crearIconos();
    this.iniciarMapa();
    this.obtenerUbicacionUsuario();
    // Los negocios pueden haber llegado antes que Leaflet: pintarlos ahora
    if (this.negocios.length) {
      this.filtrarPorCategorias();
    }
  }

  ngOnDestroy(): void {
    this.destruido = true;
    this.map?.remove();
  }

  private crearIconos(): void {
    this.iconRestaurante = icono('/assets/iconos/menu.png', 30);
    this.iconPanaderia = icono('/assets/iconos/panaderia.png', 30);
    this.iconRestauranteSelected = icono('/assets/iconos/menu.png', 40);
    this.iconPanaderiaSelected = icono('/assets/iconos/panaderia.png', 40);
    this.iconUsuario = icono('/assets/iconos/mi-ubicacion.png', 30, 15);
  }

  abrirModal(negocio: Negocio): void {
    this.negocioSeleccionado = negocio;
    this.mostrarModal = true;
    
    // Actualizar icono si existe un mapa
    if (this.map && this.markerClusterGroup) {
      // Restaurar icono anterior si existe
      if (this.currentSelectedMarker) {
        const anterior = this.negocios.find(n =>
          Number(n.latitud) === this.currentSelectedMarker?.getLatLng().lat &&
          Number(n.longitud) === this.currentSelectedMarker?.getLatLng().lng
        );
        this.currentSelectedMarker.setIcon(this.iconoPara(anterior?.categoria));
      }
      
      // Buscar y actualizar el icono del marcador correspondiente
      this.markerClusterGroup.getLayers().forEach((layer: any) => {
        if (layer instanceof L.Marker) {
          const markerLatLng = layer.getLatLng();
          if (negocio.latitud && negocio.longitud) {
            const negocioLatLng = L.latLng(+negocio.latitud, +negocio.longitud);
            
            if (markerLatLng.lat === negocioLatLng.lat && markerLatLng.lng === negocioLatLng.lng) {
              layer.setIcon(this.iconoPara(negocio.categoria, true));
              this.currentSelectedMarker = layer;
            }
          }
        }
      });
    }
  }

  // Las categorías sin icono propio (pizzeria, centro social, otros...) usan el de
  // restaurante, para que ningún negocio se quede fuera del mapa
  iconoPara(categoria: string | undefined, seleccionado = false): Leaflet.Icon {
    if (categoria === 'panaderia') {
      return seleccionado ? this.iconPanaderiaSelected : this.iconPanaderia;
    }
    return seleccionado ? this.iconRestauranteSelected : this.iconRestaurante;
  }

cerrarModal(): void {
  this.mostrarModal = false;
  this.negocioSeleccionado = null;
}

  iniciarMapa(): void {
    this.map = L.map('map', {
      worldCopyJump: false,
      maxBounds: L.latLngBounds(
        L.latLng(-90, -180),
        L.latLng(90, 180)
      ),
      minZoom: 3
    }).setView([40.4637, -3.7492], 7);

    if (this.map) {
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        noWrap: true,
        bounds: [[-90, -180], [90, 180]],
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      }).addTo(this.map);

      this.map.on('moveend', () => {
        this.actualizarNegociosCercanos();
      });
    } else {
      console.error('Error al inicializar el mapa');
    }
  }

  obtenerUbicacionUsuario(): void {
    if (!this.map) return;
    
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          
          // Centrar el mapa en la ubicación del usuario
          this.map?.setView([latitude, longitude], 10);
          
          // Añadir un marcador para la ubicación del usuario
          L.marker([latitude, longitude], {
            icon: this.iconUsuario
          }).addTo(this.map!)
            .bindPopup('Tu ubicación actual')
            .openPopup();
            
          // Actualizar negocios cercanos basados en la nueva ubicación
          this.actualizarNegociosCercanos();
        },
        (error) => {
          console.error('Error al obtener la ubicación:', error);
          // Usar ubicación predeterminada en caso de error
          this.usarUbicacionPredeterminada();
        },
        {
          enableHighAccuracy: true,
          timeout: 5000,
          maximumAge: 0
        }
      );
    } else {
      console.log('Geolocalización no disponible');
      this.usarUbicacionPredeterminada();
    }
  }

  usarUbicacionPredeterminada(): void {
    if (!this.map) return;
    
    const ubicacionesEspaña: { [key: string]: [number, number] } = {
      peninsula: [40.4637, -3.7492],
      canarias: [28.2916, -16.6291],
      baleares: [39.5696, 2.6502],
    };
    
    this.map.setView(ubicacionesEspaña['peninsula'], 7);
  }

  cargarNegocios(): void {
      this.negociosService.obtenerNegocios().subscribe((negocios: Negocio[]) => {
          this.negocios = negocios;
          this.agregaMarkers();
          this.actualizarFiltrados();
          }, (error) => {
        console.error('Error al cargar los negocios:', error);
      });
  }

  actualizarFiltrados(): void {
    this.negociosFiltrados = this.negocios.filter(
      (negocio) => !this.categoriaSeleccionada || negocio.categoria === this.categoriaSeleccionada
    );
  }

  toggleCategoriaSeleccionada(categoria: string, event: Event): void {
    const checked = (event.target as HTMLInputElement).checked;
  
    if (checked) {
      this.categoriasSeleccionadas.push(categoria);
    } else {
      this.categoriasSeleccionadas = this.categoriasSeleccionadas.filter(
        (c) => c !== categoria
      );
    }
    this.filtrarPorCategorias();
  }
  
  agregaMarkers(negocios: Negocio[] = this.negocios): void {
    if (!this.map) return;

    this.limpiarMarkers();
    
    this.markerClusterGroup = L.markerClusterGroup({
      disableClusteringAtZoom: 15,
      spiderfyOnMaxZoom: true,
      showCoverageOnHover: true,
      zoomToBoundsOnClick: true,
      maxClusterRadius: 50 
    });

    negocios.forEach((negocio) => {
      if (negocio.latitud && negocio.longitud) {
        const lat = +negocio.latitud;
        const lng = +negocio.longitud;

      if (!isNaN(lat) && !isNaN(lng)) {
        const marker = L.marker([lat, lng], { icon: this.iconoPara(negocio.categoria) });

        // Clic en el marcador: el mismo modal que al elegir el negocio en la lista
        // (abrirModal ya se encarga de resaltar el icono)
        marker.on('click', () => {
          this.irACard(negocio.id_negocio);
          this.abrirModal(negocio);
        });
        
        // Añadir el marcador al grupo de clusters
        if (this.markerClusterGroup) {
          this.markerClusterGroup.addLayer(marker);
        }
      } else {
        console.error('Coordenadas inválidas para el negocio:', negocio);
      }
    } else {
      console.error('Faltan coordenadas para el negocio:', negocio);
    }
  });
  
  if (this.markerClusterGroup) {
    this.map.addLayer(this.markerClusterGroup);
  }
}

  irACard(id_negocio: number): void {
    const cardElement = document.getElementById(`card-${id_negocio}`);
    if (cardElement) {
      cardElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      this.negocios.forEach((n) => (n.seleccionado = false));
      const negocio = this.negocios.find((n) => n.id_negocio === id_negocio);
      if (negocio) negocio.seleccionado = true;
    }
  }

  seleccionarNegocio(negocio: Negocio): void {
    if (!this.map) return;
    if (negocio.latitud && negocio.longitud) {
      const lat = +negocio.latitud;
      const lng = +negocio.longitud;
  
      if (!isNaN(lat) && !isNaN(lng)) {
        this.map.setView([lat, lng], 14);
  
        this.negocios.forEach((n) => (n.seleccionado = false));
        negocio.seleccionado = true;
      }
    } else {
      console.error('Coordenadas inválidas para el negocio:', negocio);
    }
  }

  calcularDistancia(lat1: number, lng1: number, lat2: number, lng2: number): number {
    const R = 6371;
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLng = (lng2 - lng1) * (Math.PI / 180);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLng / 2) * Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }
  
  actualizarNegociosCercanos(): void {
    if (!this.map) return;
    const centro = this.map.getCenter();
    const latCentro = centro.lat;
    const lngCentro = centro.lng;
  
    this.negocios.forEach((negocio) => {
      if (negocio.latitud && negocio.longitud) {
        negocio.distancia = this.calcularDistancia(
          latCentro,
          lngCentro,
          +negocio.latitud,
          +negocio.longitud
        );
      }
    });
    this.negocios.sort((a, b) => (a.distancia || 0) - (b.distancia || 0));
  }

  seleccionarCategoria(categoria: string | null): void {
    this.categoriaSeleccionada = categoria;
    this.actualizarFiltrados();
    this.filtrarPorCategorias();
  }

  filtrarPorCategorias(): void {
    if (this.categoriasSeleccionadas.length === 0) {
      this.agregaMarkers(); // Muestra todos los negocios
      return;
    }
  
    const negociosFiltrados = this.negocios.filter(
      negocio => this.categoriasSeleccionadas.includes(negocio.categoria)
    );
  
    this.limpiarMarkers();
    this.agregaMarkers(negociosFiltrados);
  }
  
  limpiarMarkers(): void {
    if (!this.map) return;
    
    if (this.markerClusterGroup) {
      this.map.removeLayer(this.markerClusterGroup);
      this.markerClusterGroup = null;
    }
    
    // Reiniciar marker seleccionado
    this.currentSelectedMarker = null;
  }
}