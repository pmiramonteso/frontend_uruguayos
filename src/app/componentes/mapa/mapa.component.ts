import { Component, OnInit, AfterViewInit } from '@angular/core';
import { Negocio } from '../../interface/negocio';
import { NegociosService } from '../../service/negocios.service';
import { FooterComponent } from '../footer/footer.component';

import * as L from 'leaflet';
import 'leaflet.markercluster';
declare module 'leaflet' {
  namespace markerClusterGroup {
  }
  function markerClusterGroup(options?: any): L.MarkerClusterGroup;
}

@Component({
    selector: 'app-mapa',
    imports: [FooterComponent],
    templateUrl: './mapa.component.html',
    styleUrl: './mapa.component.scss'
})
export class MapaComponent implements OnInit, AfterViewInit {
  map: L.Map | null = null;
  markerClusterGroup: L.MarkerClusterGroup | null = null;
  negocios: Negocio[] = [];
  isAdmin: boolean = false;
  mostrarModal: boolean = false;
  negocioSeleccionado: Negocio | null = null;
  negociosFiltrados: Negocio[] = [];
  categorias: string[] = ['restaurante', 'tienda', 'servicio', 'panaderia'];
  categoriaSeleccionada: string | null = null;
  categoriasSeleccionadas: string[] = [];
  currentSelectedMarker: L.Marker | null = null;
  iconRestaurante = L.icon({
    iconUrl: '/assets/iconos/menu.png',
    iconSize: [30, 30], 
    iconAnchor: [15, 30],
    popupAnchor: [0, -30],
  });

  iconPanaderia = L.icon({
    iconUrl: '/assets/iconos/panaderia.png',
    iconSize: [30, 30], 
    iconAnchor: [15, 30],
    popupAnchor: [0, -30],
  });

  iconRestauranteSelected = L.icon({
    iconUrl: '/assets/iconos/menu.png',
    iconSize: [40, 40],
    iconAnchor: [20, 40],
    popupAnchor: [0, -40],
  });

  iconPanaderiaSelected = L.icon({
    iconUrl: '/assets/iconos/panaderia.png',
    iconSize: [40, 40],
    iconAnchor: [20, 40],
    popupAnchor: [0, -40],
  });

  iconUsuario = L.icon({
    iconUrl: '/assets/iconos/mi-ubicacion.png',
    iconSize: [30, 30],
    iconAnchor: [15, 15],
    popupAnchor: [0, -15],
  });

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

  ngAfterViewInit(): void {
    this.iniciarMapa();
    this.obtenerUbicacionUsuario();
  }

  abrirModal(negocio: Negocio): void {
    this.negocioSeleccionado = negocio;
    this.mostrarModal = true;
    
    // Actualizar icono si existe un mapa
    if (this.map && this.markerClusterGroup) {
      // Restaurar icono anterior si existe
      if (this.currentSelectedMarker) {
        const categoria = this.negocios.find(n => 
          n.latitud == this.currentSelectedMarker?.getLatLng().lat.toString() && 
          n.longitud == this.currentSelectedMarker?.getLatLng().lng.toString()
        )?.categoria;
        
        if (categoria === 'restaurante') {
          this.currentSelectedMarker.setIcon(this.iconRestaurante);
        } else if (categoria === 'panaderia') {
          this.currentSelectedMarker.setIcon(this.iconPanaderia);
        }
      }
      
      // Buscar y actualizar el icono del marcador correspondiente
      this.markerClusterGroup.getLayers().forEach((layer: any) => {
        if (layer instanceof L.Marker) {
          const markerLatLng = layer.getLatLng();
          if (negocio.latitud && negocio.longitud) {
            const negocioLatLng = L.latLng(+negocio.latitud, +negocio.longitud);
            
            if (markerLatLng.lat === negocioLatLng.lat && markerLatLng.lng === negocioLatLng.lng) {
              // Determina qué icono seleccionado usar
              if (negocio.categoria === 'restaurante') {
                layer.setIcon(this.iconRestauranteSelected);
              } else if (negocio.categoria === 'panaderia') {
                layer.setIcon(this.iconPanaderiaSelected);
              }
              this.currentSelectedMarker = layer;
            }
          }
        }
      });
    }
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
          this.añadirMarkers();
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
  
  añadirMarkers(negocios: Negocio[] = this.negocios): void {
    if (!this.map) return;

    this.limpiarMarkers();
    
    this.markerClusterGroup = L.markerClusterGroup({
      disableClusteringAtZoom: 15,
      spiderfyOnMaxZoom: true,
      showCoverageOnHover: true,
      zoomToBoundsOnClick: true,
      maxClusterRadius: (zoom: number) => 50 
    });

    negocios.forEach((negocio) => {
      if (negocio.latitud && negocio.longitud && negocio.categoria) {
        const lat = +negocio.latitud;
        const lng = +negocio.longitud;

      if (!isNaN(lat) && !isNaN(lng)) {
        let markerIcon;

        switch (negocio.categoria) {
          case 'restaurante':
            markerIcon = this.iconRestaurante;
            break;
          case 'panaderia':
            markerIcon = this.iconPanaderia;
            break;
          default:
            console.warn(`Categoría desconocida para el negocio: ${negocio.categoria}`);
             return;
             }

        const marker = L.marker([lat, lng], { icon: markerIcon });
        marker.bindPopup(`
          <strong>${negocio.nombre}</strong><br>
          ${negocio.direccion}<br>
          <button class="btn-ver-mas">Ver más</button>
        `);
        
        marker.on('popupopen', (e) => {
          // Añadir evento al botón dentro del popup
          if (this.markerClusterGroup) {
            const btn = document.querySelector('.btn-ver-mas');
          if (btn) {
            btn.addEventListener('click', () => {
              this.seleccionarNegocio(negocio);
              this.irACard(negocio.id_negocio);
              this.abrirModal(negocio);
              marker.closePopup();
            });
          }
        }
        });
        
        // Añadir el evento click al marcador
        marker.on('click', () => {
          // Restaurar icono anterior si existe
          if (this.currentSelectedMarker) {
            const prevCategoria = this.negocios.find(n => 
              n.latitud == this.currentSelectedMarker?.getLatLng().lat.toString() && 
              n.longitud == this.currentSelectedMarker?.getLatLng().lng.toString()
            )?.categoria;
            
            if (prevCategoria === 'restaurante') {
              this.currentSelectedMarker.setIcon(this.iconRestaurante);
            } else if (prevCategoria === 'panaderia') {
              this.currentSelectedMarker.setIcon(this.iconPanaderia);
            }
          }

          // Establecer el nuevo icono seleccionado
          if (negocio.categoria === 'restaurante') {
            marker.setIcon(this.iconRestauranteSelected);
          } else if (negocio.categoria === 'panaderia') {
            marker.setIcon(this.iconPanaderiaSelected);
          }

          this.currentSelectedMarker = marker;
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
      this.añadirMarkers(); // Muestra todos los negocios
      return;
    }
  
    const negociosFiltrados = this.negocios.filter(
      negocio => this.categoriasSeleccionadas.includes(negocio.categoria)
    );
  
    this.limpiarMarkers();
    this.añadirMarkers(negociosFiltrados);
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