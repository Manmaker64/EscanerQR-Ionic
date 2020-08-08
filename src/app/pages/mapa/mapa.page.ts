import { Component, OnInit, AfterViewInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { environment } from '../../../environments/environment';

import * as mapboxgl from 'mapbox-gl';

@Component({
  selector: 'app-mapa',
  templateUrl: './mapa.page.html',
  styleUrls: ['./mapa.page.scss'],
})
export class MapaPage implements OnInit, AfterViewInit {

  public lat: number;
  public lng: number;

  constructor( private route: ActivatedRoute ) {}

  ngOnInit() {
    this.getGeo();
  }

  ngAfterViewInit() {
    this.cargarMapas();
  }

  getGeo() {
    let geo: any = this.route.snapshot.paramMap.get('geo');

    geo = geo.substr(4);
    geo = geo.split(',');
    this.lat = Number(geo[0]);
    this.lng = Number (geo[1]);

    console.log(this.lat, this.lng);
  }

  cargarMapas() {
    // Instanciar mapbox para asignarle el token
    const mapbox = ( mapboxgl as typeof mapboxgl );
    mapbox.accessToken = environment.apiKeyMapbox;

    // Crear instancia del mapa
    const map = new mapboxgl.Map({
      style: 'mapbox://styles/mapbox/light-v10',
      center: [this.lng, this.lat],
      zoom: 15.5,
      pitch: 45,
      bearing: -17.6,
      container: 'map',
      antialias: true
    });

    // Cargar edificios en 3D
    map.on('load', () => {
      map.resize();

      // Posicionar un marcador en las coordenadas del post
      new mapboxgl.Marker()
                  .setLngLat([ this.lng, this.lat ])
                  .addTo( map );

      // Inserta la capa debajo de cualquier capa de símbolo
      const layers = map.getStyle().layers;

      let labelLayerId: string;
      for ( const layer of layers ) {
        if (layer.type === 'symbol' && layer.layout['text-field']) {
          labelLayerId = layer.id;
          break;
        }
      }

      map.addLayer({
        id: '3d-buildings',
        source: 'composite',
        'source-layer': 'building',
        filter: ['==', 'extrude', 'true'],
        type: 'fill-extrusion',
        minzoom: 15,
        paint: {
          'fill-extrusion-color': '#aaa',

          /* Usa 'interpolate' para agregar un efecto de transición suave
          a los edificios, a medida que el usuario se acerca */
          'fill-extrusion-height': [
            'interpolate',
            ['linear'],
            ['zoom'],
            15,
            0,
            15.05,
            ['get', 'height']
          ],
          'fill-extrusion-base': [
            'interpolate',
            ['linear'],
            ['zoom'],
            15,
            0,
            15.05,
            ['get', 'min_height']
          ],
          'fill-extrusion-opacity': 0.6
        }
      }, labelLayerId );
    });
  }
}
