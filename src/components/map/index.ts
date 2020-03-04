import { Component, Watch } from 'vue-property-decorator';
import template from './TheMapbox.vue';
import mapboxgl from 'mapbox-gl';
import MapBox from 'mapbox-gl-vue';
import Base from './../base';

require('mapbox-gl/dist/mapbox-gl.css');

const geojsonExtent = require('geojson-extent');
import '@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css';
import ColorPicker from './../shared/color_picker';
import * as api from '@immosparrow/cockpit-api-v2';

import * as globalState from '../../store/modules/globalStatesModule';
import modal from './../modal';
import { setTimeout } from 'timers';
import polylabel from 'polylabel';
import RadiusMode, { cc } from './radius';
import { setIsMapLoaded } from '@/store/modules/map';
import store from '@store';
import { EventBus } from '../../EventBus';
import Vue from 'vue';
import PopupPoi from './popup.poi';
const mapboxDraw = require('@mapbox/mapbox-gl-draw');
const linearOffset = Math.round(Math.sqrt(0.5 * Math.pow(5, 2)));
let poisPopups = {};
export interface Counter {
  next(): number;
}
/* eslint-disable no-param-reassign */
export function new_counter(init = 0): Counter {
  return {
    // tslint:disable-next-line
    next: () => ++init,
  };
}
/* eslint-enable */

// export const counter = new_counter(1);

@Component({
  mixins: [template],
  components: {
    MapBox,
    ColorPicker,
    modal,

  },
})
export default class MapComponent extends Base {
  activePopupHtml: HTMLElement = null;
  clickedStateId: number = null;
  mapLayerIds: string[] = [];
  counter: Counter = null;
  startIdForMapShapesAndViewports: number = 1;
  satelliteView: boolean = false;
  lastCenter: any = null;
  lastZoom: any = null;
  currentDrawStyle: string = '';
  shapeNames: Array<Object> = [];
  map: any = undefined;
  colorsUsed: Array<string> = [];
  // markers: Array<mapboxgl.Marker> = [];
  draw: any = null;
  infiniteDraw: boolean = false;
  captureViewport: boolean = false;
  draws: any = [];
  d2: boolean = true;
  d3: boolean = false;
  showDrawTools: boolean = false;
  mapLoaded: boolean = false;
  mapStyleLoaded: boolean = false;
  mapSearchResults: api.ISearchResult<api.IPubLightModel> = null;
  symbolLayers: Array<any> = [];
  searchAreasLayers: Array<any> = [];
  shapeLayers: Array<any> = [];
  markers: Array<any> = [];
  cluster: object;
  clusterSource: object;
  clusterSymbol: object;
  clusterRadius: number = 50;
  markerSources: Array<any> = [];
  sources: Array<object> = [];
  localities: Array<string> = [];
  shapeNameEditFinished: boolean = false;
  shapeName: string = '';
  mapSize: string = 'big';

  popup: mapboxgl.Popup = new mapboxgl.Popup();
  tooltip: mapboxgl.Popup = new mapboxgl.Popup({
    anchor: 'bottom-left',
    offset: [linearOffset, -linearOffset],
    closeButton: false,
  });
  popupObject: mapboxgl.Popup = new mapboxgl.Popup();
  popupMarketRadar: mapboxgl.Popup = new mapboxgl.Popup({
    closeButton: false,
    closeOnClick: false,
    // offset: 30
  });
  currentMapLayerStyle: string = 'av';
  currentMapStyle: string = 'mapbox://styles/ascarix/cjoe973rf8rf82rmi5fcykj8w';
  layersForHover: Array<string> = [];
  layersForHover3d: Array<string> = [];
  layersForHoverSatellite: Array<string> = [];

  // Layers demo, delete when implemented
  layersPanelActive: boolean = false;
  layerPanelSelectedMode: boolean = false;
  layerNoise: boolean = false;
  layerResidentioalZones: boolean = false;
  //

  timer: any = null;
  initLoad: boolean = false;
  bearning: number = 0;
  mapInitialized(map: mapboxgl.Map) {

    map.setCenter([8.2275, 46.8182]);
    map.panTo([8.2275, 46.8182]);

    map.setZoom(7.5);
    map.setBearing(-17.6);
    map.resetNorth();

  }

  zoom_in() {
    const zoomLevel = this.map.getZoom();
    if (zoomLevel < 22) {
      this.map.flyTo({ zoom: zoomLevel + 0.5 });
    }
  }

  zoom_out() {
    const zoomLevel = this.map.getZoom();
    if (zoomLevel > 1) {
      this.map.flyTo({ zoom: zoomLevel - 0.5 });
    }
  }

  // map on leaving error if draw exists - workaround, actual mapobox bug
  beforeDestroy() {
    if (this.mapLoaded) {
      this.map.removeControl(this.draw);
      this.map.remove();
    }
  }

  north() {
    this.map.resetNorth();
  }
  loaded(map: any) {

    /*
    * Mapbox events
    * 'touchstart', 'touchend', 'touchmove', 'touchcancel',
    'mouseout', 'mousedown', 'mouseup', 'mousemove',
    'click', 'dblclick', 'contextmenu',
    'dragstart', 'drag', 'dragend',
    'movestart', 'move', 'moveend',
    'zoomstart', 'zoom', 'zoomend',
    'rotatestart', 'rotate', 'rotateend',
    'pitchstart', 'pitch', 'pitchend',
    'boxzoomstart', 'boxzoomend', 'boxzoomcancel'
    * */
    const self = this;
    window['mp'] = map;

    this.map = map;
    this.initLoad = true;
    this.mapLoaded = true;
    this.$root.$emit('map_is_loaded', true);
    this.$emit('mapIsLoaded', true);
    setIsMapLoaded(store, true);

    this.lastCenter = this.map.getCenter();
    this.lastZoom = this.map.getZoom();

    this.map.on('rotate', () => {
      this.bearning = this.map.getBearing();
    });

    this.$root.$on('fitBounds', () => {
      this.fit_bounds(true);
    });
    this.$root.$on('infiniteDrawOff', () => {
      this.infiniteDraw = false;
      this.currentDrawStyle = '';
      this.delete_draw();
    });
    this.$root.$on('removeLayerById', (id: string) => {
      try {
        this.map.removeLayer(id);
        this.map.removeLayer('symbol' + `${id}`);
        this.map.removeLayer('symbol_' + `${id}`);
        this.map.removeSource('symbol_' + `${id}`);
        this.map.removeSource(id);
      } catch { }
    });

    /*this.$root.$on('show_search_areas', () => {

      try {
        for (let i = 0, l = self.searchAreasLayers.length; i < l; i += 1) {

          // self.map.setPaintProperty(self.searchAreasLayers[i]['id'], 'fill-color', self.searchAreasLayers[i].paint['fill-color']);

          try {
            self.map.setPaintProperty(self.searchAreasLayers[i]['id'], 'fill-color', self.searchAreasLayers[i].paint['fill-color']);
          } catch {
            // fill-extrusion-color
            self.map.setPaintProperty(self.searchAreasLayers[i]['id'], 'fill-extrusion-color', self.searchAreasLayers[i].paint['fill-extrusion-color']);
          }

        }

        for (let i = 0, l = self.symbolLayers.length; i < l; i += 1) {

          self.map.setLayoutProperty(self.symbolLayers[i]['id'], 'visibility', 'visible');

        }

      } catch {
      }

      self.map.setLayoutProperty('unclustered-point', 'visibility', 'none');
      self.map.setLayoutProperty('cluster', 'visibility', 'none');
      self.map.setLayoutProperty('cluster-count', 'visibility', 'none');
    });*/

    this.$root.$on('hide_map_points', () => {
      try {
        self.map.setLayoutProperty('unclustered-point', 'visibility', 'none');
        self.map.setLayoutProperty('cluster', 'visibility', 'none');
        self.map.setLayoutProperty('cluster-count', 'visibility', 'none');
      } catch (err) { }
    });

    this.$root.$on('show_map_points', () => {
      try {
        self.map.setLayoutProperty('unclustered-point', 'visibility', 'visible');
        self.map.setLayoutProperty('cluster', 'visibility', 'visible');
        self.map.setLayoutProperty('cluster-count', 'visibility', 'visible');
      } catch (err) { }
    });

    /*this.$root.$on('hide_search_areas', () => {
      for (let i = 0, l = self.searchAreasLayers.length; i < l; i += 1) {

        console.log(self.searchAreasLayers[i]);

      }
      try {
        for (let i = 0, l = self.searchAreasLayers.length; i < l; i += 1) {

          try {
            self.map.setPaintProperty(self.searchAreasLayers[i]['id'], 'fill-color', '#fafafa');
          } catch {
            // fill-extrusion-color
            self.map.setPaintProperty(self.searchAreasLayers[i]['id'], 'fill-extrusion-color', '#fafafa');
          }

        }
        if (self.map.getLayer('unclustered-point') === undefined) {
          try {
            self.map.addSource('ads', self.markerSources[0]);
            self.map.addLayer(self.markers[0]);
          } catch {}
        } else {
          self.map.setLayoutProperty('unclustered-point', 'visibility', 'visible');
          self.map.setLayoutProperty('cluster', 'visibility', 'visible');
          self.map.setLayoutProperty('cluster-count', 'visibility', 'visible');
        }
      } catch (err) {
        console.log(err);
      }

    });*/

    this.$root.$on('shape_removed', (id: string) => {

      this.removeShape(id);

    });

    self.map.on('draw.create', this.updateArea);
    self.map.on('draw.modechange', (mode: any) => {
      if (this.infiniteDraw) {
        if (mode.mode === 'simple_select') {
          this.draw_shape(this.currentDrawStyle, true);
        }
      }
    });
    const draw = new mapboxDraw({
      displayControlsDefault: false,
      styles: this.get_map_draw_styles,
      modes: Object.assign({
        draw_radius: RadiusMode,
      }, mapboxDraw.modes),
    });

    self.map.addControl(draw);
    this.draw = draw;
    this.draws.push(draw);

    /*self.map.on('draw.actionable', (e:any) => {
      if (this.draw) {
        if (e.actions.trash) {
          this.draw_shape(this.currentDrawStyle, true);
        }
      }
    });*/

    for (const i in this.map.getStyle().metadata['mapbox:groups']) {

      if (this.map.getStyle().metadata['mapbox:groups'][i].name === 'av') {
        for (let e = 0, l = this.map.getStyle().layers.length; e < l; e += 1) {

          try {
            if (this.map.getStyle().layers[e].metadata['mapbox:group'] === i) {
              this.layersForHover.push(this.map.getStyle().layers[e].id);
            }
          } catch { }

        }
      }

      if (this.map.getStyle().metadata['mapbox:groups'][i].name === 'av3d') {
        for (let e = 0, l = this.map.getStyle().layers.length; e < l; e += 1) {

          try {
            if (this.map.getStyle().layers[e].metadata['mapbox:group'] === i) {
              this.layersForHover3d.push(this.map.getStyle().layers[e].id);
            }
          } catch { }

        }
      }

      if (this.map.getStyle().metadata['mapbox:groups'][i].name === 'av-satelite') {
        for (let e = 0, l = this.map.getStyle().layers.length; e < l; e += 1) {

          try {
            if (this.map.getStyle().layers[e].metadata['mapbox:group'] === i) {
              this.layersForHoverSatellite.push(this.map.getStyle().layers[e].id);
            }
          } catch { }

        }
      }

    }

    this.map.on('moveend', (e: any) => {
      if (self.captureViewport) {
        const bounds = self.map.getBounds();
        const e = new mapboxgl.LngLatBounds(bounds._sw, bounds._ne);

        const polygon = [

          [e.getNorthWest().lng, e.getNorthWest().lat],
          [bounds._ne.lng, bounds._ne.lat],
          [e.getSouthEast().lng, e.getSouthEast().lat],
          [bounds._sw.lng, bounds._sw.lat],

          [e.getNorthWest().lng, e.getNorthWest().lat],

        ];

        self.$root.$emit('showViewPort', {
          polygon,
          id: Math.random().toString(),
          name: 'Viewport',
          show: true,
        });
      }
    });

    this.map.on('mousemove', 'pois', (e: any) => {
      if (this.clickedStateId !== e.features[0].id) {
        EventBus.$emit('map:highlightPoi', e.features[0].properties.itemId);
        EventBus.$emit('map:hasHighlightPoi', e.features[0].properties.itemId);
      }
    });
    this.map.on('mouseout', 'pois', (e: any) => {
      EventBus.$emit('map:highlightPoi', null);
      EventBus.$emit('map:hasHighlightPoi', null);
      this.clickedStateId = null;
    });

  }

  set_style(val: string, newStyle: string) {

    if (this.currentMapLayerStyle !== val) {

      this.currentMapLayerStyle = val;

      if (val === 'av') {
        this.map.setPitch(0);
        this.map.setBearing(0);
        this.d3 = false;
        this.d2 = true;
        this.satelliteView = false;
        this.map.setLayoutProperty('satellite', 'visibility', 'none');

      } else {

        if (val === 'av3d') {
          this.map.setPitch(45);
          this.map.setBearing(-17.5);
          this.satelliteView = false;
          this.map.setLayoutProperty('satellite', 'visibility', 'none');
          // this.map.dragRotate.enable();
          // this.map.touchZoomRotate.enable();

          this.d3 = true;
          this.d2 = false;
        } else {
          this.d3 = false;
          this.d2 = false;
          this.satelliteView = true;

          this.map.setPitch(0);
          this.map.setBearing(0);
          this.map.setLayoutProperty('satellite', 'visibility', 'visible');

        }

      }

      if (val === 'av') {

        // this.map.setLayoutProperty("av3d", "visibility", "none");
        for (let i = 0, l = this.layersForHover3d.length; i < l; i += 1) {
          this.map.setLayoutProperty(this.layersForHover3d[i], 'visibility', 'none');
        }

        for (let i = 0, l = this.layersForHoverSatellite.length; i < l; i += 1) {
          this.map.setLayoutProperty(this.layersForHoverSatellite[i], 'visibility', 'none');
        }

        for (let i = 0, l = this.layersForHover.length; i < l; i += 1) {
          this.map.setLayoutProperty(this.layersForHover[i], 'visibility', 'visible');
        }

      } else {

        if (val === 'av3d') {
          for (let i = 0, l = this.layersForHover.length; i < l; i += 1) {
            this.map.setLayoutProperty(this.layersForHover[i], 'visibility', 'none');
          }
          for (let i = 0, l = this.layersForHoverSatellite.length; i < l; i += 1) {
            this.map.setLayoutProperty(this.layersForHoverSatellite[i], 'visibility', 'none');
          }
          for (let i = 0, l = this.layersForHover3d.length; i < l; i += 1) {
            this.map.setLayoutProperty(this.layersForHover3d[i], 'visibility', 'visible');
          }

        } else {
          // satellite

          for (let i = 0, l = this.layersForHover.length; i < l; i += 1) {
            this.map.setLayoutProperty(this.layersForHover[i], 'visibility', 'none');
          }

          for (let i = 0, l = this.layersForHover3d.length; i < l; i += 1) {
            this.map.setLayoutProperty(this.layersForHover3d[i], 'visibility', 'none');
          }

          for (let i = 0, l = this.layersForHoverSatellite.length; i < l; i += 1) {
            this.map.setLayoutProperty(this.layersForHoverSatellite[i], 'visibility', 'visible');
            this.map.setPaintProperty(this.layersForHoverSatellite[i], 'fill-outline-color', '#fff');
            this.map.setPaintProperty(this.layersForHoverSatellite[i], 'fill-opacity', 0.4);
          }
        }

        // this.map.setLayoutProperty("av", "visibility", "none");
      }
      // }, parseInt(inter.toString()));

      /*let visibility = this.map.getLayoutProperty(val, "visibility");

      if (visibility == "visible") {
        this.map.setLayoutProperty(val, "visibility", "none");
      } else {
        // this.className = 'active';
        this.map.setLayoutProperty(val, "visibility", "visible");
      }*/
    }
  }

  created() {
    EventBus.$on('map:addPoisToMap', this.addPoisToMap);
    EventBus.$on('map:highlightPoi', this.highlightPoi);
    EventBus.$on('map:removePois', this.removePoisFromMap);
    this.counter = new_counter(this.startIdForMapShapesAndViewports);
    const self = this;

    this.$root.$on('removeRestrictionShapes', () => {
      this.removeRestrictionShapes();
    });
    this.$root.$on('reset_map', () => {
      this.set_style('av', 'mapbox://styles/ascarix/cjoe973rf8rf82rmi5fcykj8w');

      this.map.setCenter([8.2275, 46.8182]);
      this.map.panTo([8.2275, 46.8182]);

      this.map.setZoom(7.5);
    });

    this.$root.$on('remove_all_markers_from_search', () => {

      try {
        if (this.map.getSource('ads') !== undefined) {
          this.map.removeLayer('unclustered-point');
          this.map.removeLayer('cluster-count');
          this.map.removeLayer('clusters');
          this.map.removeLayer('cluster');
          this.map.removeSource('ads');
          this.map.removeSource('adsWithDuplicatedCoordinates');
          this.mapSearchResults = null;
          // do not turn this of since on remove markers does not mean that user has deleted all search params
          // this.searchAreasLayers = [];
          this.markerSources = [];
          this.markers = [];

        } else {
        }
      } catch (err) {
      }

    });

    this.$root.$on('map_change_size', (value: string) => {

      const mapDiv = document.getElementById('map');
      const mapCanvas = document.getElementsByClassName('mapboxgl-canvas')[0];

      if (self.map !== undefined) {
        /*let i = setInterval(function () {
          if (self.map.loaded()) {
            clearInterval(i);
          }
        }, 1);*/
        // setTimeout(function () {
        // self.map.getCanvas().width = "100%";

        if (mapDiv) {
          self.mapSize = value;
          // let size = window.getComputedStyle(mapDiv).width;
          if (value === 'small') {

            mapDiv.style.width = 'calc(100% - 450px)';
            // mapCanvas.setAttribute("width", "calc(100% - 650px)");
          } else {
            mapDiv.style.width = '100%';
            // mapCanvas["style"].width = "100%";

          }

          self.map.resize();
        }
        // }, parseInt(i.valueOf().toString()));
      }

    });

    this.$root.$on('show_draw_tools', (show: boolean) => {
      this.showDrawTools = show;
    });

    this.$root.$on('localityUniqueIdentifier', (localityUniqueIdentifier: string) => {
      this.localities = [];
      const pixelSpaceBoundingBox = [
        this.map.project(this.map.getBounds().getNorthEast()),
        this.map.project(this.map.getBounds().getSouthWest()),
      ];
      const features = this.map.queryRenderedFeatures(pixelSpaceBoundingBox, { layers: ['po_localities'] });
      if (features.length > 0) {
        for (let i = 0, l = features.length; i < l; i += 1) {
          if (localityUniqueIdentifier !== '') {
            if (features[i].properties.uniqueidentifier === localityUniqueIdentifier) {
              self.map.setPaintProperty(
                'po_localities', 'fill-color',
                [
                  'case',
                  ['==', ['get', 'uniqueidentifier'], localityUniqueIdentifier],
                  '#dd3e33', 'transparent',
                ],
              );
            }
          } else {
            self.map.setPaintProperty('po_localities', 'fill-color', 'transparent');
          }
        }
      }
    });

  }

  draw_shape(type: string, infinite?: boolean) {

    try {
      this.draw.changeMode(type);
    } catch  {
    }
    this.infiniteDraw = infinite;
  }

  delete_draw() {

    try {
      this.draws[0].deleteAll();
    } catch { }
    /*for (let i = 0, l = this.draws.length; i < l; i += 1) {

      try {
        this.draws[i].delete(this.draws[i].getSelected().features[0].id);
      } catch (err) {
        console.log(err);
      }
    }*/
  }

  setColor(color: string) {
    this.$refs.colorpicker.defaultColor = color;
    this.$refs.colorpicker.showAllColors = false;
  }

  fit_bounds(everything?: boolean) {
    try {
      if (this.searchAreasLayers.length) {
        const geoLayers = {
          type: 'FeatureCollection',
          features: <any>[],
        };

        for (let i = 0, l = this.searchAreasLayers.length; i < l; i += 1) {

          if (everything) {
            // PLASE DO NOT REMOVE THIS IF ONCE WE NEED IT, THIS FIT BOUNDS FOR ALL OF THE GEO TYPES
            if (this.searchAreasLayers[i].properties) {
              // for clicked Layers
              if (this.searchAreasLayers[i].properties.type === 'withSourceId') {
                const s: any = this.map.getSource(this.searchAreasLayers[i].id);
                geoLayers['features'].push({
                  type: 'Feature',
                  properties: {
                    id: new Date().toString(),
                  },
                  geometry: {
                    type: s._data.type,
                    // if must be here since circles use map source (typeof this.searchAreasLayers[i]["source"] == "string") and you got circle
                    coordinates:
                      s._data.coordinates,
                  },
                });

              } else {
                // for travel polygons
                try {
                  geoLayers['features'].push(this.map.getSource(this.searchAreasLayers[i].source)._data.features);
                } catch {
                  // geo_layers['features'].push(this.map.getSource(this.searchAreasLayers[i].id)._data);

                  geoLayers['features'].push({
                    type: 'Feature',
                    properties: {
                      id: this.searchAreasLayers[i].id,
                    },
                    geometry: {
                      type: 'Polygon',
                      // if must be here since circles use map source (typeof this.searchAreasLayers[i]["source"] == "string") and you got circle
                      coordinates: <any>(this.searchAreasLayers[i]['source'].data.geometry === undefined) ?
                        this.searchAreasLayers[i]['source'].data.features[0].geometry.coordinates :
                        this.searchAreasLayers[i]['source'].data.geometry.coordinates,
                    },
                  });
                }
                // geo_layers['features'].push(this.map.getSource(this.searchAreasLayers[i].source)._data.features);
              }
            } else {
              geoLayers['features'].push({
                type: 'Feature',
                properties: {
                  id: new Date().toString(),
                },
                geometry: {
                  type: 'Polygon',
                  // if must be here since circles use map source (typeof this.searchAreasLayers[i]["source"] == "string") and you got circle
                  coordinates: <any>(this.searchAreasLayers[i]['source'].data.geometry === undefined) ?
                    this.searchAreasLayers[i]['source'].data.features[0].geometry.coordinates :
                    this.searchAreasLayers[i]['source'].data.geometry.coordinates,
                },
              });
            }
          }
          // THIS WILL ONLY FIT BOUNDS FOR DRAW AND AUTOCOMPLETE
          if (!this.searchAreasLayers[i].properties) {
            geoLayers['features'].push({
              type: 'Feature',
              properties: {
                id: new Date().toString(),
              },
              geometry: {
                type: 'Polygon',
                // if must be here since circles use map source (typeof this.searchAreasLayers[i]["source"] == "string") and you got circle
                coordinates: <any>(this.searchAreasLayers[i]['source'].data.geometry === undefined) ?
                  this.searchAreasLayers[i]['source'].data.features[0].geometry.coordinates :
                  this.searchAreasLayers[i]['source'].data.geometry.coordinates,
              },
            });
          }
        }

        if (this.$router['history'].current.path === '/search' || this.$router['history'].current.path === '/market-radar/ads') {
          this.map.fitBounds(geojsonExtent(geoLayers), {
            padding: 160,
          });
        } else {
          this.map.fitBounds(geojsonExtent(geoLayers));
        }

      } else {
        this.map.setCenter([8.2275, 46.8182]);
        this.map.panTo([8.2275, 46.8182]);
        this.map.setZoom(7.5);
      }
    } catch  {
    }

  }

  removeRestrictionShapesElements(elementsToRemove: Array<any>) {
    if (elementsToRemove) {
      elementsToRemove.forEach((el) => {
        const { id } = el;
        try {
          this.map.removeLayer(id);
          this.map.removeLayer('symbol_' + `${id}`);
          this.map.removeSource(id);
        } catch { }
      });
    }
  }

  removeRestrictionShapes() {

    try {
      for (let i = 0, l = this.searchAreasLayers.length; i < l; i += 1) {

        if (this.searchAreasLayers[i].properties.restriction) {
          // this.removeShapeFromAddress(this.searchAreasLayers[i].id);
          this.map.removeLayer(this.searchAreasLayers[i].id);
          this.map.removeLayer('symbol_' + `${this.searchAreasLayers[i].id}`);
          this.map.removeSource(this.searchAreasLayers[i].id);
          this.searchAreasLayers.splice(i, 1);
        }
      }
    } catch { }

    this.fit_bounds();
  }

  drawShapesFromAddress(shapes: any, drawBefore?: string) {
    // let self = this;
    // if (self.map != undefined) {
    for (let i = 0, l = shapes.length; i < l; i += 1) {
      try {
        this.map.removeSource(shapes[i].id);
      } catch { }
    }
    try {
      for (let i = 0, l = shapes.length; i < l; i += 1) {
        const polygonLayer = {
          id: shapes[i].id,
          type: 'fill',
          source: {
            // "id": shapes[i].id,
            type: 'geojson',
            data: {
              type: 'Feature',
              geometry: {
                type: shapes[i].geom ? shapes[i].geom.type : shapes[i].geo.type,
                coordinates: shapes[i].geom ? shapes[i].geom.coordinates : shapes[i].geo.coordinates,
              },
            },
          },
          metadata: {
            name: shapes[i].name,
          },
          properties: {
            color: shapes[i].color,
            restriction: shapes[i].opacity ? true : false,
          },
          layout: {},
          paint: {
            'fill-color': shapes[i].color,
            'fill-opacity': shapes[i].opacity ? shapes[i].opacity : 0.6,
            'fill-outline-color': '#000',
          },
        };
        this.map.addLayer(polygonLayer, drawBefore);

        const t = shapes[i].geom ? shapes[i].geom.type : shapes[i].geo.type;
        if (t === 'Polygon' || t === 'MultiPolygon') {
          const symbolLayer = {
            id: 'symbol_' + `${shapes[i].id}`,
            type: 'symbol',
            source: shapes[i].name,
            layout: {
              'text-field': shapes[i].name,
              'text-font': [
                'DIN Offc Pro Medium',
                'Arial Unicode MS Bold',
              ],
              'text-size': 12,
            },
          };
          this.map.addLayer(symbolLayer, drawBefore);
          this.symbolLayers.push(symbolLayer);
        }

        this.searchAreasLayers.push(polygonLayer);
      }

      // }
    } catch { }

  }
  drawShapeFromAddress(shape: any) {
    try {
      const self = this;
      if (self.map !== undefined) {

        const polygonLayer = {
          id: shape.id,
          type: 'fill',
          source: {
            type: 'geojson',
            data: {
              type: 'Feature',
              geometry: {
                type: shape.geom ? shape.geom.type : shape.geo.type,
                coordinates: shape.geom ? shape.geom.coordinates : shape.geo.coordinates,
              },
            },
          },
          metadata: {
            name: shape.name,
          },
          layout: {},
          paint: {
            'fill-color': shape.color,
            'fill-opacity': 0.6,
            'fill-outline-color': '#000',
          },
        };
        self.map.addLayer(polygonLayer);
        self.searchAreasLayers.push(polygonLayer);

        if (shape.fitBounds) {
          self.fit_bounds();
        }

        const t = shape.geom ? shape.geom.type : shape.geo.type;
        if (t === 'Polygon') {
          const symbolLayer = {
            id: 'symbol_' + `${shape.id}`,
            type: 'symbol',
            source: shape.name,
            layout: {
              'text-field': shape.name,
              'text-font': [
                'DIN Offc Pro Medium',
                'Arial Unicode MS Bold',
              ],
              'text-size': 12,
            },
          };
          this.map.addLayer(symbolLayer);
          this.symbolLayers.push(symbolLayer);
        }

      }
    } catch  {
    }

  }

  removeShapeFromAddress(id: string) {

    try {
      this.map.removeLayer(id);
      this.map.removeLayer('symbol_' + `${id}`);
      this.map.removeSource(id);
      let found = null;
      for (let i = 0, l = this.searchAreasLayers.length; i < l; i += 1) {

        if (this.searchAreasLayers[i] !== undefined) {
          if (this.searchAreasLayers[i].id === id) {
            found = this.searchAreasLayers[i];
            this.searchAreasLayers.splice(i, 1);
          }
        }
      }
      // console.log(this.searchAreasLayers);

      if (this.searchAreasLayers.length === 0) {
        // remove all results
        this.$root.$emit('remove_all_markers_from_search');
        this.$root.$emit('remove_all_results');
        this.mapSearchResults = null;
        this.searchAreasLayers = [];

      }

    } catch { }

  }

  removeShape(id: string) {
    try {
      if (this.map.getLayer(id)) {
        this.map.removeLayer(id);
      }
    } catch { }
    try {
      this.map.removeSource(id);
    } catch { }
    // not all layers has symbols
    try {
      this.map.removeLayer('symbol_' + `${id}`);
    } catch {
    }

    for (let i = 0, l = this.searchAreasLayers.length; i < l; i += 1) {

      if (this.searchAreasLayers[i] !== undefined) {
        if (this.searchAreasLayers[i].id === id) {
          this.searchAreasLayers.splice(i, 1);
        }
      }
    }

    // this.fit_bounds();

  }

  get_color(): string {

    let color = this.colors()[Math.floor(Math.random() * this.colors().length)];

    if (this.colorsUsed.length === this.colors().length) {
      color = '#' + `${Math.floor(Math.random() * 16777215).toString(16)}`;
    }

    if (this.colorsUsed.indexOf(color) === -1) {
      this.colorsUsed.push(color);

    } else {
      color = '#' + `${Math.floor(Math.random() * 16777215).toString(16)}`;
      this.colorsUsed.push(color);
    }

    return color;

  }

  updateArea(e: any) {

    const self = this;

    const shapeName = this.shapeName;

    const id = 'drawnShape_' + `${this.counter.next().toString()}`;

    if (e['features'][0]['properties']['radius'] !== undefined) {

      const source = cc([e['features'][0].geometry.coordinates[0], e['features'][0].geometry.coordinates[1]],
        e['features'][0]['properties']['radius'] / 1000);

      const c = this.get_color();
      const circleLayer = {
        id,
        source,
        type: 'fill',
        layout: {},
        paint: {
          'fill-color': c,
          'fill-opacity': 0.6,
          'fill-outline-color': '#000',
        },
      };
      this.searchAreasLayers.push(circleLayer);
      this.map.addLayer(circleLayer);

      const shape = {
        id,
        name: shapeName,
        color: c,
        center: [e['features'][0].geometry.coordinates[0], e['features'][0].geometry.coordinates[1]],
        geom: {
          type: 'polygon',
          coordinates: source['data']['features'][0]['geometry']['coordinates'],
        },
      };

      setTimeout(() => {
        self.delete_draw();
      }, 100);

      this.map.on('mouseenter', id, () => {
        self.map.getCanvas().style.cursor = 'pointer';
      });

      // Change it back to a pointer when it leaves.
      this.map.on('mouseleave', id, () => {
        self.map.getCanvas().style.cursor = '';
      });

      shape['infinite'] = this.infiniteDraw;
      shape['drawStyle'] = this.currentDrawStyle;
      this.$root.$emit('shape_created', shape);
      this.shapeLayers.unshift(shape);
      this.$emit('circleCreated', shape);

    } else {
      const c = this.get_color();
      const p = polylabel(e['features'][0].geometry.coordinates, 1.0);
      const shape = {
        id,
        name: shapeName,
        color: c,
        center: p,
        geom: {
          type: 'polygon',
          coordinates: e['features'][0].geometry.coordinates,
        },
      };

      const polygonLayer = {
        id,
        type: 'fill',
        source: {
          type: 'geojson',
          data: {
            type: 'Feature',
            geometry: {
              type: 'Polygon',
              coordinates: e['features'][0].geometry.coordinates,
            },
          },
        },

        metadata: {
          name: shapeName,
        },
        layout: {},
        paint: {
          'fill-color': c,
          'fill-opacity': 0.6,
          'fill-outline-color': '#000',
        },
      };
      this.map.addLayer(polygonLayer);

      this.searchAreasLayers.push(polygonLayer);

      setTimeout(() => {
        self.delete_draw();
        this.$emit('polygonCreated', shape);
      }, 100);

      this.map.on('mouseenter', id, () => {
        self.map.getCanvas().style.cursor = 'pointer';
      });

      // Change it back to a pointer when it leaves.
      this.map.on('mouseleave', id, () => {
        self.map.getCanvas().style.cursor = '';
      });
      shape['infinite'] = this.infiniteDraw;
      shape['drawStyle'] = this.currentDrawStyle;

    }
    this.shapeNameEditFinished = false;
    try {
      const searchSidebar = document.querySelector('#side-overlay');
      searchSidebar.classList.add('active');
      globalState.commitSetSearchSidebar(this.$store, true);
    } catch { }
    // this.fit_bounds();
  }

  closePopup(shape: any) {

    if (shape.name === '') {

      this.map.removeLayer(shape.id);
    }
    this.shapeName = '';
    this.popup.remove();
  }

  addTravelPolygons(polygon: any, time: number, color: string, id: string, before?: string) {
    this.mapLayerIds.push(id);
    try {

      if (this.map.getSource(id)) {
        this.map.getSource(id).setData({
          type: 'FeatureCollection',
          features: polygon,
        });
      } else {
        this.map.addSource(id, {
          type: 'geojson',
          data: {
            type: 'FeatureCollection',
            features: polygon,
          },
        });
      }

      if (!this.map.getLayer(id)) {

        const e = {
          id,
          type: 'fill-extrusion',
          source: id,
          layout: {},
          paint: {

            'fill-extrusion-base': 0,
            'fill-extrusion-height': 0,
            'fill-extrusion-color': color,
            'fill-extrusion-opacity': 0.6,
          },
          properties: {
            type: 'travelPolygon',
          },
        };
        if (before) {
          this.map.addLayer(e, this.layersForHover[0]);
        } else {
          this.map.addLayer(e);
        }

        this.searchAreasLayers.push(e);

      }
    } catch {
    }

  }

  @Watch('searchAreasLayers')
  watchSearchAreasLayers() {
    if (!this.searchAreasLayers.length) {
      // this.mapInitialized(this.map);
      this.map.setCenter([8.2275, 46.8182]);
      this.map.panTo([8.2275, 46.8182]);

      this.map.setZoom(7.5);
      this.map.setBearing(0);
    }
  }

  /*
  * popups start
  * */
  generatePopup(coordinate: [number, number], html: Vue) {
    const popup = new mapboxgl.Popup({
      closeOnClick: false,
      closeButton: false,
      className: `custom-popup popup-${coordinate[0]}-${coordinate[1]}`,
    })
      .setLngLat(coordinate)
      .setDOMContent(html.$el);
    return popup;
  }
  generatePopupHtmlForPois(o: api.PoiLightModel, fakeId: number): Vue {
    const self = this;
    return new Vue({
      name: 'popupPoi',
      data: {
        poi: o,
        // fakeId is from loop
        fakeId: fakeId + 1,
      },
      components: {
        poi: PopupPoi,
      },
      methods: {
        /*openAds(adInfo: api.PoiLightModel, hidePopup?: boolean) {

          const { longitude, latitude } = adInfo.coordinates;
          const coordinate = `${longitude}-${latitude}`;
          if (hidePopup) {
            search.commitOpenedPopapDetailId(store, '');
          }
          EventBus.$emit('map:highlight', adInfo.name);
        },
        removeActive() {
          // this.$root.$emit('hide_object');
          this.$root.$emit('setPopupState', { type: 'active' });
        },*/
      },
      template: "<poi :poi='poi' :fakeId='fakeId'/>",
    });
  }
  /*
  * popups end
  * */

  /*
    points of interests start
   */
  poisPopups: mapboxgl.Popup[] = [];
  addPoisToMap(pois: api.PoiLightModel[]) {

    const points = [];
    this.removePoisFromMap();

    if (pois.length) {
      for (let i = 0, l = pois.length; i < l; i += 1) {
        points.push({
          id: i,
          type: 'Feature',
          geometry: {
            type: 'Point',
            coordinates: [pois[i].coordinates.longitude, pois[i].coordinates.latitude],
          },
          itemId: i,
          properties: {
            icon: 'monument',
            itemId: i,
            clicked: false,
          },
        });
        const html = this.generatePopupHtmlForPois(pois[i], i).$mount();
        const popup = this.generatePopup([pois[i].coordinates.longitude, pois[i].coordinates.latitude], html);
        poisPopups[i] = popup;
        popup.addTo(this.map);
      }

      const clusterSource = {
        type: 'geojson',
        data: {
          type: 'FeatureCollection',
          features: points,
        },
        cluster: true,
        clusterMaxZoom: 11, // Max zoom to cluster points on
        clusterRadius: this.clusterRadius, // Radius of each cluster when clustering points (defaults to 50)
      };

      if (this.map.getSource('pois') !== undefined) {
        this.map.getSource('pois').setData(clusterSource);
      } else {
        this.map.addSource('pois', clusterSource);
      }

      const coordsMin = [Math.min.apply(Math, points.map((o: any) => {
        return o.geometry.coordinates[0];
      })), Math.min.apply(Math, points.map((o: any) => {
        return o.geometry.coordinates[1];
      }))];
      const coordsMax = [Math.max.apply(Math, points.map((o: any) => {
        return o.geometry.coordinates[0];
      })), Math.max.apply(Math, points.map((o: any) => {
        return o.geometry.coordinates[1];
      }))];
      this.map.fitBounds([coordsMin, coordsMax], { padding: 120 });

      const colorExpressionPoint = [
        'case',
        ['==', ['feature-state', 'clicked'], true], '#ff2b14',
        '#33b54a',
      ];

      const up = {
        id: 'pois',
        type: 'circle',
        source: 'pois',
        filter: ['!has', 'point_count'],
        paint: {
          'circle-color': colorExpressionPoint,
          'circle-radius': 6,
          'circle-stroke-width': 1,
          'circle-stroke-color': '#2da142',
        },
      };

      this.map.addLayer(up);

      if (this.poisPopups.length) {
        for (let i = 0, l = this.poisPopups.length; i < l; i += 1) {
          this.poisPopups[i].addTo(this.map);
        }
      }
    }
  }

  removePoisFromMap() {
    if (Object.keys(poisPopups).length) {
      for (const e in poisPopups) {
        poisPopups[e].remove();
      }
    }
    // we do try catch so we dont have to check if exists
    try {
      this.map.removeLayer('pois');
      this.map.removeSource('pois');
    } catch {}
    poisPopups = {};
  }
  highlightPoi(adId?: number) {
    if (Object.keys(poisPopups).length) {
      for (const e in poisPopups) {
        poisPopups[e]._content.classList.remove('active-item');
        poisPopups[e]._content.parentNode.classList.remove('withZ5');
      }
      this.map.setFeatureState({ source: 'pois', id: this.clickedStateId }, { clicked: false });
      this.clickedStateId = null;
      const features = this.map.querySourceFeatures('pois');
      for (const e in poisPopups) {
        poisPopups[e]._content.classList.remove('active-item');
        poisPopups[e]._content.parentNode.classList.remove('withZ5');
      }
      for (let i = 0; i < features.length; i += 1) {
        const props = features[i].properties;
        const id = props.itemId;
        if (id === adId) {
          this.clickedStateId = features[i].id;
          this.map.setFeatureState({ source: 'pois', id: this.clickedStateId }, { clicked: true });
          poisPopups[id]._content.classList.add('active-item');
          poisPopups[id]._content.parentNode.classList.add('withZ5');
        }
      }
    }
  }
  /*
    points of interests end
   */

}
