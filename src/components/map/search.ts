import { Component, Watch, Prop } from 'vue-property-decorator';
import * as search_ from './../../store/modules/searchStatesModule';
import store from '../../store';

import * as api from '@immosparrow/cockpit-api-v2';
import { setTimeout } from 'timers';
import MapComponent, { new_counter } from './index';
import mapboxgl, { Popup } from 'mapbox-gl';

import * as globalState from '../../store/modules/globalStatesModule';
import _ from 'underscore';
import Vue from 'vue';
import PopupMultipleObjectsComponent from './popup.multiple.objects';
import PopupMultipleAdsComponent from './popups/popup.multipleAds';
import * as turf from '@turf/turf';
import { cc } from './radius';
import PopupShapeComponent from './popup.shape';
import { PolygonGeoJsonOptions, PolygonPayloadOptions } from '@targomo/core/typings/api/payload';
import Tooltip from './tooltip';
import * as search from '../../store/modules/searchStatesModule';
let lastSelectedLocality1: any;
import { TargomoClient, SRID } from '@targomo/core';
const tgmClient = new TargomoClient('westcentraleurope', 'FBTLI0O1DTZNSIJQTU8R101440813');
import { getEmployeeContext } from '../../store/modules/authStatesModule';
import Worker from 'worker-loader!../../workers/intersectAreaMap';
import moment from 'moment';
import { formatPrice } from '../sharedFunctions';
import { safeVal } from '@immosparrow/cockpit-lib-core';
window['moment'] = moment;

// const simplify = require("simplify-geojson");
interface TravelTime {
  by: string; color: string; pointId: string; rushHour: boolean; rushHourStartTime: string; time: number;
}
interface Polygon {
  center: number[]; color: string; drawStyle: string; geom:{coordinates: []; type: string}; id: string; inifinite: boolean; name: string;
}
let someId = '_' + `${Math.random().toString(36).substr(2, 9)}`;
@Component({
  mixins: [],
  components: {},
})
export default class SearchMapComponent extends MapComponent {

  @Prop({ default: null })
  addressForTheMap: {geom: {coordinates: []; type: string}, id: string, color: string, radius?: number, geometry?: {type: string, geom: [number[]]}};
  @Prop({ default: null })
  addressForRemoveFromMap: {id: string; time: number};
  @Prop({ default: null })
  shapeForRemoveFromMap: {id: string; time: number};
  @Prop({ default: null })
  layerToRemoveById: {id: string; time: number};
  @Prop({ default: null })
  symbolLayerFromMap: {shape: Polygon; time: number};
  @Prop({ default: null })
  travelTimeData: TravelTime;
  @Prop({ default: false })
  setTravelPointValue: boolean;
  @Prop({ default: null })
  interactWithLayersOnMap: string;
  @Prop({ default: null })
  drawPolygonMode: {type: string; time: number};
  @Prop({ default: null })
  layerWithRadius: {id: string; radius: number; time: number; isShape: boolean; geom?: any};
  @Prop({ default: null })
  getViewPortModel: {time: number};
  @Prop({ default: null })
  resetMap: {time: number};
  @Prop({ default: null })
  viewPortForSearchMap: {id: string, color: string, name: string, polygon:[], show: boolean};
  @Prop({ default: null })
  mapInteraction: {val: boolean; time: number};
  @Prop({ default: false })
  mapToSearchArea: {val: boolean; time: number};
  @Prop({ default: null })
  searchArealLayersVisibility: {val: boolean; time: number};
  @Prop({ default: null })
  shapeToDrawOnMap: {geom: {coordinates: []; type: string}, id: string, color: string, name: string} = null;

  mapReady: boolean = false;
  interact: boolean = false;
  hoveredStateId: string = null;
  interactWith: string = '';
  interactWithPrev: string = '';
  interactWithSources:any = {
    po_localities: 'locality',
    po_communes: 'commune',
    po_cantons: 'canton',
    po_districts: 'district',
    po_market_regions: 'market_region',
    po_ms_regions: 'ms_region',
  };
  travelPolygons: any = [];
  showWorkspace = false;
  workspaceLoaded: Boolean;
  toDrawWorkspace: Array<any> = [];
  popups: Array<Popup> = [];
  val: Function = safeVal;
  popupsData: {
    longitude: number;
    latitude: number;
    ads: api.PubLightModel[];
  }[] = [];
  zoomLvl: number = 0;

  hoveredPopup:string = '';
  hoverPopupHtml: HTMLElement = null;
  activePopupHtml: HTMLElement = null;

  async beforeCreate() {
    this.workspaceLoaded = false;
    const context = await getEmployeeContext(store);
    const getAddressCordinate = (areas: api.GeoAreaAddressPart[]): Promise<api.GeoAddressPart[]> => {
      const ids: string[] = [];
      areas.forEach(i => ids.push(i.id));
      return api.$geo.getAddressParts(ids);
    };

    let agencyAddressRestrict: api.GeoAreaAddressPart[] = [];
    let workspaceAddressRestrict: api.GeoAreaAddressPart[] = [];
    if (context.agencyGeoRestriction) {
      agencyAddressRestrict = context.agencyGeoRestriction.addressParts ? context.agencyGeoRestriction.addressParts : [];
    }
    if (context.workspaceGeoRestriction) {
      workspaceAddressRestrict = context.workspaceGeoRestriction.addressParts ? context.workspaceGeoRestriction.addressParts : [];
    }

    if (agencyAddressRestrict.length && workspaceAddressRestrict.length) {
      const areasAgency = agencyAddressRestrict;
      const areasWorkspace = workspaceAddressRestrict;

      const dataAgency = getAddressCordinate(areasAgency);
      const data = getAddressCordinate(areasWorkspace);

      await Promise.all([dataAgency, data])
        .then((data) => {
          const worker = new Worker();
          worker.postMessage({ dataWorkspace: data[0], dataAgency: data[1] });

          worker.onmessage = ({ data }) => {
            // console.log(data);
            if (data && data.intersectRes) {
              this.toDrawWorkspace.push({
                id: '111111',
                geom: data.intersectRes.geometry,
                name: 'intersectAreas',
                color: '#d2d210',
                opacity: 0.6,
              });
            } else {
              this.workspaceLoaded = true;
            }
            worker.terminate();
          };
        });
    } else if (agencyAddressRestrict.length) {
      await getAddressCordinate(agencyAddressRestrict).then((data) => {
        for (let e = 0, s = data.length; e < s; e += 1) {
          this.toDrawWorkspace.push({
            id: '22222' + `${e}`,
            geom: data[e].geom,
            name: 'agancyArea' + `${e}`,
            color: '#d2d210',
            opacity: 0.6,
          });
        }
      });
    } else if (workspaceAddressRestrict.length) {
      await getAddressCordinate(workspaceAddressRestrict).then((data) => {
        for (let e = 0, s = data.length; e < s; e += 1) {
          this.toDrawWorkspace.push({
            id: '22222' + `${e}`,
            geom: data[e].geom,
            name: 'agancyArea' + `${e}`,
            color: '#d2d210',
            opacity: 0.6,
          });
        }
      });
    }
    this.workspaceLoaded = true;
  }

  async drawWorkSpace() {
    // get all native elements
    const features = this.map.queryRenderedFeatures({ filter:
    ['any',
      ['has', 'maritime'],
      ['has', 'admin_level'],
      ['has', 'name_de'],
      ['has', 'class']],
    });
    const lastElement = features.length ? features[0].layer.id : undefined;
    this.showWorkspace = !this.showWorkspace;
    if (this.showWorkspace) {
      this.drawShapesFromAddress(this.toDrawWorkspace, lastElement);
    } else {
      this.removeRestrictionShapesElements(this.toDrawWorkspace);
    }
  }

  destroyed() {
    // search.commitResetState(store);
    search.commitSearchingFor(store, new api.GeoSuggestion());
  }

  travelPoints: any = [];
  setTravelPoint(e: any) {

    this.travelPoints.push(1);

    const self = this;
    const lng: number = e.lngLat.lng;
    const lat: number = e.lngLat.lat;

      // let id: string = Math.random().toString();
    const id = 'onePoint';

    const c: string = self.get_color();

    try {
      this.map.removeLayer('onePoint');
      this.map.removeSource('onePoint');
    } catch  {
    }
    const up = {
      id,
      type: 'circle',
      source: {
        type: 'geojson',
        data: {
          type: 'FeatureCollection',

          features: [{
            type: 'Feature',
            geometry: {
              type: 'Point',
              coordinates: [lng, lat],
            },
          }],
        },
      },
      paint: {
        'circle-color': c,
        'circle-radius': 6,
        'circle-stroke-width': 1,
        'circle-stroke-color': '#fff',
      },
    };
    self.map.addLayer(up);

    someId = '_' + `${Math.random().toString(36).substr(2, 9)}`;
    self.$emit('travelPolygonPointCreated', {
      id: someId,
      color: c,
      geom: {
        coordinates: [lng, lat],
      },
    });

  }
  pointsAreNotInBounds: boolean[] = [];
  initialSearch: boolean = false;
  loadMap() {

    this.map.setPitch(0);

    this.addSearchResultsToMap();
    // this.show_draw_tools = true;
    const self = this;

    this.$root.$on('searchModuleResults', (searchModuleResults: any) => {
      this.searchModuleResults = searchModuleResults;
    });

    this.map.on('moveend', () => {
      if (self.captureViewport) {
        const c: string = self.get_random_color();
        const bounds = self.map.getBounds();
        const e = new mapboxgl.LngLatBounds(bounds._sw, bounds._ne);

        const polygon = [

          [e.getNorthWest().lng, e.getNorthWest().lat],
          [bounds._ne.lng, bounds._ne.lat],
          [e.getSouthEast().lng, e.getSouthEast().lat],
          [bounds._sw.lng, bounds._sw.lat],

          [e.getNorthWest().lng, e.getNorthWest().lat],

        ];

        const id = 'viewport_' + `${this.counter.next().toString()}`;

        self.$emit('addViewPortToSearchShapes', {
          id,
          polygon,
          name: 'Viewport',
          show: true,
          color: c,
        });
      }
    });
    this.map
      .on('click', () => {
        search.commitOpenedPopapDetailId(store, '');
        if (this.activePopupHtml) {
          self.$root.$emit('hide_object');
          self.$root.$emit('setPopupState', { type: 'active' });
        }
      })
      .on('touchstart', () => {
        search.commitOpenedPopapDetailId(store, '');
        if (this.activePopupHtml) {
          self.$root.$emit('hide_object');
          self.$root.$emit('setPopupState', { type: 'active' });
        }
      });
    this.map
      .on('click', 'unclustered-point', (e: any) => {
        this.clickOnUnclusteredPoint(e);
      })
      .on('touchstart', 'unclustered-point', (e: any) => {
        this.clickOnUnclusteredPoint(e);
      });

    // Change the cursor to a pointer when the mouse is over the places layer.
    this.map.on('mouseenter', 'unclustered-point', () => {
      this.map.getCanvas().style.cursor = 'pointer';
    });

    // Change it back to a pointer when it leaves.
    this.map.on('mouseleave', 'unclustered-point', () => {
      this.map.getCanvas().style.cursor = '';
    });

    this.$root.$on('highlight_marker', (addId: string) => {

      if (this.map && this.map.getSource('hoveredLayerData') !== undefined) {
        this.map.removeSource('hoveredLayerData');
        this.map.removeLayer('hoveredLayer');
        // this.map.getSource("hoveredLayerData").setData(ads);
      }

      let lastFeatureId: any;
      if (addId === '') {
        try {
          // self.map.setPaintProperty("unclustered-point", "circle-color", "#11b4da");
          // self.map.setPaintProperty("unclustered-point", "circle-radius", 6);
          lastFeatureId = '';
          this.map.removeSource('hoveredLayerData');
          this.map.removeLayer('hoveredLayer');
        } catch {}
        return;
      }
      const pixelSpaceBoundingBox = [this.map.project(this.map.getBounds().getNorthEast()),
        this.map.project(this.map.getBounds().getSouthWest())];

      const features =
        this.map.queryRenderedFeatures(pixelSpaceBoundingBox, {
          layers: ['unclustered-point'],
        });

      if (features.length > 0) {

        for (let i = 0, l = features.length; i < l; i += 1) {

          if (features[i].properties.itemId !== lastFeatureId) {

            if (features[i].properties.itemId === addId) {

              const ads = {
                type: 'geojson',
                data: {
                  type: 'FeatureCollection',
                  features: [features[i]],
                },
              };

              const up = {
                id: 'hoveredLayer',
                type: 'circle',
                source: 'hoveredLayerData',
                filter: ['!has', 'point_count'],
                paint: {
                  'circle-color': '#dd2117',
                  'circle-radius': 6,
                  'circle-stroke-width': 1,
                  'circle-stroke-color': '#fff',
                },
              };

              try {
                self.map.addSource('hoveredLayerData', ads);
                self.map.addLayer(up);
              } catch {
                self.map.removeSource('hoveredLayerData');
                self.map.removeLayer('hoveredLayer');

                setTimeout(() => { self.map.addSource('hoveredLayerData', ads); self.map.addLayer(up); }, 100);
              }
              lastFeatureId = features[i].properties.itemId;

            }
          }
        }
      }
    });

    this.$root.$on('remove_shape_from_address', (id: string) => {

      this.removeShapeFromAddress(id);

    });

    this.$root.$on('draw_shape_from_address', (shape: any) => {

      self.drawShapeFromAddress(shape);
      /*let self = this;

      let i = setInterval(function () {
        if (self.map.loaded()) {
          clearInterval(i);
        }
      }, 1);

      setTimeout(() => {
        self.drawShapeFromAddress(shape);
      }, parseInt(i.valueOf().toString()));*/

    });

    this.$root.$on('draw_shapes', (shapes: Array<any>) => {
      this.drawShapesFromAddress(shapes);
    });
    this.$root.$on('remove_shapes', (shapes?: Array<any>) => {
      if (shapes) {
        this.removeRestrictionShapesElements(shapes);
      }
    });

    this.$root.$on('setPopupState', ({ type, ads }: { type: 'hover' | 'active', ads?: api.PubLightModel, clean?: boolean  }) => {
      const className = type === 'hover' ? 'active' : 'active-item';

      // to make sure, that all active elements was hidden

      const allHover = Array.from(document.querySelectorAll('.mapboxgl-popup.active'));
      if (allHover.length) {
        for (const element of allHover) {
          element.classList.remove('active');
          if (this.zoomLvl <= 12) {
            this[`${type}PopupHtml`].style.display = 'none';
          }
        }
      }

      if (ads) {
        const { longitude, latitude } = ads.address.coordinates;
        if (this[`${type}PopupHtml`]) {
          this[`${type}PopupHtml`].classList.remove(className);
        }
        this[`${type}PopupHtml`] = document.getElementsByClassName(`popup-${longitude}-${latitude}`)[0] as HTMLElement;
        if (this[`${type}PopupHtml`]) {
          this[`${type}PopupHtml`].classList.add(className);
          if (this.zoomLvl <= 12) {
            this[`${type}PopupHtml`].style.display = 'block';
          }
        }
      } else {
        if (this[`${type}PopupHtml`]) {
          this[`${type}PopupHtml`].classList.remove(className);
          if (this.zoomLvl <= 12) {
            this[`${type}PopupHtml`].style.display = 'none';
          }
        }
      }
    });

    self.map.on('moveend', (a: any, b: any, c: any) => {

      const currentCenter = self.map.getCenter();
      const currentZoom = self.map.getZoom();
      // console.log(this.map.getSource('ads')._data.features);
      // return;
      let refresh = !!this.pointsAreNotInBounds.length;
      if (currentCenter !== self.lastCenter || currentZoom !== self.lastZoom) {

        self.lastCenter = currentCenter;
        self.lastZoom = currentZoom;

        if (self.searchModuleResults && self.searchModuleResults.items) {
          if (self.searchModuleResults.items.length) {

            const searchSidebar = document.querySelector('#sidebar-object-fixed-2');
            if (this.map.getSource('ads') !== undefined) {
              const bounds = this.map.getBounds();
              const e = new mapboxgl.LngLatBounds(bounds._sw, bounds._ne);

              const polygon = turf.polygon([[
                [e.getNorthWest().lng, e.getNorthWest().lat],
                [bounds._ne.lng, bounds._ne.lat],
                [e.getSouthEast().lng, e.getSouthEast().lat],
                [bounds._sw.lng, bounds._sw.lat],
                [e.getNorthWest().lng, e.getNorthWest().lat],
              ]]);
              this.pointsAreNotInBounds = [];
              for (let i = 0, l = this.map.getSource('ads')._data.features.length; i < l; i += 1) {
                const point = turf.point(this.map.getSource('ads')._data.features[i].geometry.coordinates);
                if (!turf.booleanPointInPolygon(point, polygon)) {
                  refresh = true;
                  this.pointsAreNotInBounds.push(false);
                }
                // points.push(this.map.getSource('ads')._data.features[i].geometry.coordinates);
              }
            }
            if (refresh || this.initialSearch) {
              this.initialSearch = false;

              try {
                if (searchSidebar.classList.contains('active')) {
                  if (this.map.getSource('ads') !== undefined) {
                    self.get_localities();
                    self.getAdsInViewport();
                  }
                }
              } catch (err) {
                self.getAdsInViewport();
              }
            }
          }
        }
      }
    });

  }

  clickOnUnclusteredPoint(e: any) {
    const self = this;
    if (this.map.getSource('hoveredLayerData') !== undefined) {
      this.map.removeSource('hoveredLayerData');
      this.map.removeLayer('hoveredLayer');
      // this.map.getSource("hoveredLayerData").setData(ads);
    }

    const id = e.features[0].properties.itemId;

    self.getClickedAd(id)
      .then((adInfo: api.PubModel) => {

        const { longitude, latitude } = adInfo.address.coordinates;
        if (self.activePopupHtml) {
          self.activePopupHtml.classList.remove('active-item');
        }
        self.activePopupHtml = document.getElementsByClassName(`popup-${longitude}-${latitude}`)[0] as HTMLElement;
        self.activePopupHtml.classList.add('active-item');
        search.commitOpenedPopapDetailId(store, '');

        self.$root.$emit('show_object', adInfo.id);
        self.popupObject.on('close', () => {

          self.$root.$emit('hide_object', adInfo.id);
        });
      });
  }

  onMouseMove(position: any) {

    const self = this;
    self.map.getCanvas().style.cursor = 'pointer';
    const fs = self.map.queryRenderedFeatures(position.point, { layers: [this.interactWith] });

    if (fs.length) {

      const f = fs[0];

      const lang = localStorage.getItem('lang');

      let name = f.properties['name_' + `${lang}`];
      if (lang === 'en') {
        name = f.properties['name_de'];
      }

      self.tooltip.remove();
      const popupComponent = new Vue({

        name: 'popup_tooltip_app',
        data: {
          tooltip: name,
        },
        components: {
          popUp: Tooltip,
        },
        methods: {
          closePopup() {
            self.tooltip.remove();
          },
        },
        parent: self,
        template: '<pop-up ref="popup_tooltip" v-bind:tooltip="tooltip" v-bind:closePopup="closePopup"/>',
      }).$mount();

      const coordinates = <mapboxgl.LngLatLike> [position.lngLat.lng, position.lngLat.lat];

      // Ensure that if the map is zoomed out such that multiple
      // copies of the feature are visible, the popup appears
      // over the copy being pointed to.
      while (Math.abs(position.lngLat.lng - coordinates[0]) > 180) {
        coordinates[0] += position.lngLat.lng > coordinates[0] ? 360 : -360;
      }

      // Need to be triggered somehow DO NOT REMOVE!
      setTimeout(() => {
        self.tooltip.setLngLat(coordinates)
          .setDOMContent(popupComponent.$el)
          .addTo(self.map);

      },         100);

      const a = self.map.querySourceFeatures('composite', {
        sourceLayer: this.interactWithSources[this.interactWith],
        filter: [
          '==', 'uniqueidentifier', f.properties.uniqueidentifier,
        ],
      });

      const geom: any = [];
      for (let i = 0, l = a.length; i < l; i += 1) {

        try {
          if (a[i].geometry.type === 'MultiPolygon') {

            for (let s = 0; s < a[i].geometry.coordinates.length; s += 1) {
              geom.push(turf.polygon(a[i].geometry.coordinates[s]));
            }
          } else {
            geom.push(turf.polygon(a[i].geometry.coordinates));
          }
        } catch (err) {
        }

      }

      if (geom.length) {

        const e = turf.union(...geom);

        if (`${f.properties.uniqueidentifier}` + '_ll' !== lastSelectedLocality1) {
          try {
            self.map.removeLayer(lastSelectedLocality1);
            self.map.removeSource(lastSelectedLocality1);

          } catch {
          }

          lastSelectedLocality1 = `${f.properties.uniqueidentifier}` + '_ll';
          this.map.addSource(lastSelectedLocality1, {
            type: 'geojson',
            data: e,
          });
          this.map.addLayer({
            id: lastSelectedLocality1,
            type: 'fill',
            source: lastSelectedLocality1,
            paint: {
              'fill-color': '#000',
              'fill-opacity': 0.4,
            },
          });
        }
      }

    }
  }

  onClick(e: any) {

    const self = this;
    const fs = self.map.queryRenderedFeatures(e.point, { layers: [this.interactWith] });

    if (fs.length) {

      const f = fs[0];

      const lang = localStorage.getItem('lang');

      let name = f.properties['name_' + `${lang}`];
      if (lang === 'en') {
        name = f.properties['name_de'];
      }
      // this.interact = false;

      /*console.log(f);
      this will not work
      The domain of the query includes all currently-loaded vector tiles and GeoJSON source tiles: this function does not check tiles outside the currently visible viewport.

      let features = self.map.querySourceFeatures("composite", {sourceLayer: f.layer["source-layer"]} );
      console.log(features);

      let geom: any = [];
      for (let s = 0; s < features.length; s++) {
        geom.push(turf.polygon(features[s].geometry.coordinates));
      }
      let e = turf.union(...geom);
      console.log(e);*/

      // we need to call api since coordinates are clipped if we use only f.features. clipped to a tile

      if (this.map.getSource(f.properties.uniqueidentifier) || this.map.getLayer(f.properties.uniqueidentifier)) {
        this.map.removeLayer(f.properties.uniqueidentifier);
        this.map.removeSource(f.properties.uniqueidentifier);
        this.$emit('addressFromMapRemove', {
          id: f.properties.uniqueidentifier,
          time: new Date().getTime(),
        });
        self.tooltip.remove();
      } else {

        self.tooltip.remove();
        const popupComponent = new Vue({

          name: 'popup_tooltip_app',
          data: {
            loader: true,
            tooltip: '',
          },
          components: {
            popUp: Tooltip,
          },
          methods: {
            closePopup() {
              self.tooltip.remove();
            },
          },
          parent: self,
          template: '<pop-up ref="popup_tooltip" v-bind:loader="loader" v-bind:tooltip="tooltip" v-bind:closePopup="closePopup"/>',
        }).$mount();

        const coordinates = <mapboxgl.LngLatLike> [e.lngLat.lng, e.lngLat.lat];

        // Ensure that if the map is zoomed out such that multiple
        // copies of the feature are visible, the popup appears
        // over the copy being pointed to.
        while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
          coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
        }

        // Need to be triggered somehow DO NOT REMOVE!
        setTimeout(() => {
          self.tooltip.setLngLat(coordinates)
            .setDOMContent(popupComponent.$el)
            .addTo(self.map);

        },         100);

        api.$geo.getAddressPart(f.properties.uniqueidentifier).then((data: any) => {
          self.tooltip.remove();
          const c = this.get_color();
          // this.interact = true;
          if (data) {
            /*if (this.map.getSource(f.properties.uniqueidentifier) || this.map.getLayer(f.properties.uniqueidentifier)) {
              this.map.removeLayer(f.properties.uniqueidentifier);
              this.map.removeSource(f.properties.uniqueidentifier);
              this.$root.$emit("address_removed", f.properties.uniqueidentifier);
              // self.fit_bounds();
            } else {*/
            if (this.map.getSource(f.properties.uniqueidentifier)) {
              return;
            }
            this.map.addSource(f.properties.uniqueidentifier, {
              type: 'geojson',
              data: data.geom,

            });

            const polygonLayer = {
              id: f.properties.uniqueidentifier,
              type: 'fill',
              source: f.properties.uniqueidentifier,
              paint: {
                'fill-color': c,
                'fill-opacity': 0.6,
              },
              properties: {
                type: 'withSourceId',
              },
            };
            self.searchAreasLayers.push(polygonLayer);
            this.map.addLayer(polygonLayer);

            const int = {

              po_cantons: 10,
              po_districts: 20,
              po_market_regions: 15,
              po_ms_regions: 18,
              po_localities: 50,
              po_communes: 30,

            };

            if (int[this.interactWith]) {
              const address = {
                name,
                id: f.properties.uniqueidentifier,
                color: c,
                type: int[this.interactWith],
                geom: data.geom,
                fromClick: true,
                time: new Date().getTime(),
              };
              // this.$root.$emit('address_created', address);
              this.$emit('addressFromMap', address);

            } /*else {
              const shape = {
                name,
                id: f.properties.uniqueidentifier,
                color: c,
                geom: e.geometry,
              };

              this.$root.$emit('shape_created', shape);
            }*/
          }
          // }

        });
      }

    }

  }

  /*get_color(): string {

    let color = this.colors()[Math.floor(Math.random() * this.colors().length)];

    if (this.colorsUsed.length === this.colors().length) {
      color =  '#' + `${Math.floor(Math.random() * 16777215).toString(16)}`;
    }

    if (this.colorsUsed.indexOf(color) === -1) {
      this.colorsUsed.push(color);

    } else {
      color =  '#' + `${Math.floor(Math.random() * 16777215).toString(16)}`;
      this.colorsUsed.push(color);
    }

    return color;

  }*/

  getAdsInViewport() {
    const mapBounds = this.map.getBounds();
    globalState.updateLoadingSearchResults(store, true);
    globalState.commitShowMapRightSidebar(store, true);
    // this.$root.$emit("map_change_size", "small");
    clearTimeout(this.timer);
    // Small delay
    const features = this.adsInBounds(mapBounds);
    this.timer = setTimeout(() => {
      this.getMultipleAds(features);
    },                      1000);
  }

  // Check if result items are in bounds of viewport
  adsInBounds(mapBounds: any) {
    const self = this;
    let notOnMap = true;
    let results: Array<object> = [];
    if (self.mapSearchResults && self.mapSearchResults.items) {
      self.mapSearchResults.items.forEach((item) => {
        // localityID or coordinates
        if (item.address.coordinates && item.address.quality >= 8) {
          if (item.address.coordinates.latitude > mapBounds._sw.lat && item.address.coordinates.latitude < mapBounds._ne.lat &&
            item.address.coordinates.longitude > mapBounds._sw.lng && item.address.coordinates.longitude < mapBounds._ne.lng) {
            results.push({
              id: item.id,
              coordinates: item.address.coordinates,
            });
          }
        } else { // if (self.localities.indexOf(item.address.localityId) !== -1) {
          results.push({
            id: item.id,
            coordinates: undefined,
          });
          notOnMap = false;
        }
      });
      if (self.initLoad && notOnMap) {
        results = this.getAllAds();
        self.initLoad = false;
      }
    }
    return results;
  }

  getAllAds() {

    const self = this;
    const results: Array<object> = [];
    if (self.mapSearchResults.items) {
      self.mapSearchResults.items.forEach((item) => {
        results.push({
          id: item.id,
          coordinates: item.address.coordinates,
        });
      });
    }
    return results;
  }

  async getMultipleAds(adsInViewport: Array<object>) {

    // this.$root.$emit('adsInViewport', adsInViewport);
    this.$emit('adsInViewport', adsInViewport);
    globalState.commitShowMapRightSidebar(store, true);
  }

  async getClickedAd(uniqueId: string) {
    const res: api.PubModel = await api.$publication(uniqueId).get();
    return res;
  }

  get_localities() {

    this.localities = [];
    const pixelSpaceBoundingBox = [this.map.project(this.map.getBounds().getNorthEast()),
      this.map.project(this.map.getBounds().getSouthWest())];

    const features =
      this.map.queryRenderedFeatures(pixelSpaceBoundingBox, {
        layers: ['po_localities'],
      });
    if (features.length > 0) {

      for (let i = 0, l = features.length; i < l; i += 1) {
        this.localities.push(features[i].properties.uniqueidentifier);
      }
    }
  }

  async getClusterData(clusterData: string[]) {
    const results: api.PubLightModel[] = await api.$pubs.getMultiple(clusterData);
    return results;
  }

  cleanPopups() {
    if (this.popups.length) {
      this.popups.forEach(popup => popup.remove());
    }
    this.popupsData = [];
    this.popups = [];
  }

  addSearchResultsToMap() {

    const self = this;
    const features: any = [];
    const featuresWithSameCoordinates: any = [];

    self.mapSearchResults = self.searchModuleResults;
    this.cleanPopups();

    if (self.mapSearchResults) {

      if (self.mapSearchResults.totalItemCount) {

        const groupedData = _.groupBy(self.mapSearchResults.items, (elem: any) => {
          if (elem.coordinates !== undefined) {
            return `${elem.coordinates.longitude}` + '_' + `${elem.coordinates.latitude}`; // here you can specify whichever key you want to check duplicates for
          }
        });

        for (const i in groupedData) {

          if (i.valueOf().indexOf('undefined') === -1 && groupedData[i].length > 1) {
            groupedData[i].forEach((item: api.PubLightModel) => {
              featuresWithSameCoordinates.push({
                type: 'Feature',
                geometry: {
                  type: 'Point',
                  coordinates: [item.address.coordinates.longitude, item.address.coordinates.latitude],
                },
                itemId: item.id,
                properties: {
                  icon: 'monument',
                  itemId: item.id,
                  active: item.trackingInfo.publicationInterval.isActive ? 'active' : 'notActive',
                },
              });
            });
          } else {
            groupedData[i].forEach((item: api.PubLightModel) => {
              if (item.address.coordinates && item.address.quality >= 8) {
                const { longitude, latitude } = item.address.coordinates;

                features.push({
                  type: 'Feature',
                  geometry: {
                    type: 'Point',
                    coordinates: [longitude, latitude],
                  },
                  itemId: item.id,
                  properties: {
                    longitude,
                    latitude,
                    icon: 'monument',
                    itemId: item.id,
                    active: item.trackingInfo.publicationInterval.isActive ? 'active' : 'notActive',
                  },
                });

                const findDuplication = this.popupsData.findIndex(x => x.longitude === longitude && x.latitude === latitude);

                if (findDuplication === -1) {
                  this.popupsData.push({
                    longitude,
                    latitude,
                    ads: [item],
                  });
                } else {
                  this.popupsData[findDuplication].ads.push(item);
                }
              } /*else {
                // just fore testing on active/inactive
                if (item.address.coordinates && item.address.quality < 8) {
                  features.push({
                    "type": "Feature",
                    "geometry": {
                      "type": "Point",
                      "coordinates": [item.address.coordinates.longitude, item.address.coordinates.latitude],
                    },
                    "itemId": item.id,
                    "properties": {
                      "icon": "monument",
                      "itemId": item.id,
                      "active": "notActive"
                    },
                  });
                }
              }*/

            });
            const generatePopup = (coordinate: [number, number], html: Vue) => {
              const popup = new mapboxgl.Popup({
                closeOnClick: false,
                closeButton: false,
                className: `custom-popup popup-${coordinate[0]}-${coordinate[1]}`,
              })
                .setLngLat(coordinate)
                .setDOMContent(html.$el);

              this.popups.push(popup);
            };

            if (this.popupsData.length) {
              this.popupsData.forEach((adsDotData) => {
                const html = new Vue({
                  name: 'popupWithSliderAds',
                  data: {
                    adsDotData,
                  },
                  components: {
                    popUp: PopupMultipleAdsComponent,
                  },
                  methods: {
                    openAds(adInfo: api.PubLightModel, hidePopup?: boolean) {

                      const { longitude, latitude } = adInfo.address.coordinates;
                      const coordinate = `${longitude}-${latitude}`;
                      if (hidePopup) {
                        search.commitOpenedPopapDetailId(store, '');
                      }

                      if (self.activePopupHtml) {
                        self.activePopupHtml.classList.remove('active-item');
                      }
                      self.activePopupHtml = document.getElementsByClassName(`popup-${longitude}-${latitude}`)[0] as HTMLElement;
                      self.activePopupHtml.classList.add('active-item');
                      self.$root.$emit('show_object', adInfo.id);
                    },
                    removeActive() {
                      self.$root.$emit('hide_object');
                      self.$root.$emit('setPopupState', { type: 'active' });
                    },
                  },
                  template: "<pop-up :adsInfo='adsDotData.ads' :openAds='openAds' :removeActive='removeActive'/>",
                }).$mount();

                generatePopup([adsDotData.longitude, adsDotData.latitude], html);
              });
            }
          }
        }
        this.zoomLvl = this.map.getZoom();

        const togglePopupsVision = () => {
          const popups = document.getElementsByClassName('custom-popup') as HTMLCollectionOf<HTMLElement>;
          const sendVal = this.zoomLvl >= 12 ? 'block' : 'none';
          if (popups.length && popups[0].style.display !== sendVal) {
            Array.from(popups).forEach(el => el.style.display = sendVal);
          }
        };

        if (this.popups.length) {
          this.popups.forEach((popup) => {
            popup.addTo(this.map);
          });
          togglePopupsVision();
        }

        this.map.on('zoom', () => {
          this.zoomLvl = this.map.getZoom();
          togglePopupsVision();
        });

        this.clusterSource = {
          type: 'geojson',
          data: {
            type: 'FeatureCollection',
            features: featuresWithSameCoordinates,

          },
          cluster: true,
          clusterMaxZoom: 21, // Max zoom to cluster points on
          clusterRadius: this.clusterRadius, // Radius of each cluster when clustering points (defaults to 50)
        };

        if (this.map.getSource('adsWithDuplicatedCoordinates') !== undefined) {
          this.map.getSource('adsWithDuplicatedCoordinates').setData(this.clusterSource);
        } else {

          this.map.addSource('adsWithDuplicatedCoordinates', this.clusterSource);
        }

        this.cluster = {
          id: 'cluster',
          type: 'circle',
          source: 'adsWithDuplicatedCoordinates',
          filter: ['has', 'point_count'],
          paint: {
            // Use step expressions (https://www.mapbox.com/mapbox-gl-js/style-spec/#expressions-step)
            // with three steps to implement three types of circles:
            //   * Pink hard, 20px circles when point count is less than 100
            //   * Yellow, 30px circles when point count is between 100 and 750
            //   * Green, 40px circles when point count is greater than or equal to 750
            'circle-color': [
              'step',
              ['get', 'point_count'],
              '#d61683',
              100,
              '#f1f075',
              750,
              '#bcf26c',
            ],
            'circle-radius': [
              'step',
              ['get', 'point_count'],
              20,
              100,
              30,
              750,
              40,
            ],
          },
        };
        if (self.map.getLayer('cluster') === undefined) {
          self.map.addLayer(this.cluster);
        }

        this.clusterSymbol = {
          id: 'cluster-count',
          type: 'symbol',
          source: 'adsWithDuplicatedCoordinates',
          filter: ['>=', 'point_count', 2],
          layout: {
            'text-field': '{point_count_abbreviated}',
            'text-font': ['DIN Offc Pro Medium', 'Arial Unicode MS Bold'],
            'text-size': 12,
          },
          paint: {
            'text-color': '#000000',
          },
        };
        if (self.map.getLayer('cluster-count') === undefined) {
          self.map.addLayer(this.clusterSymbol);
        }

        self.map
        .on('click', 'cluster', (e: any) => {
          this.clickOnCluster(e);
        })
        .on('touchstart', 'cluster', (e: any) => {
          this.clickOnCluster(e);
        });

        self.map.on('mouseenter', 'cluster', () => {
          self.map.getCanvas().style.cursor = 'pointer';
        });
        self.map.on('mouseleave', 'cluster', () => {
          self.map.getCanvas().style.cursor = '';
        });

        /*self.mapSearchResults.items.forEach(function (item) {
          // localityID or coordinates
          if (item.coordinates) {
            features.push({
              "type": "Feature",
              "geometry": {
                "type": "Point",
                "coordinates": [item.coordinates.longitude, item.coordinates.latitude],
              },
              "itemId": item.uniqueIdentifier,
              "properties": {
                "icon": "monument",
                "itemId": item.uniqueIdentifier
              },
            });
          }

        });*/

        const coordsMin = [Math.min.apply(Math, features.map((o: any) => {
          return o.geometry.coordinates[0];
        })), Math.min.apply(Math, features.map((o: any) => {
          return o.geometry.coordinates[1];
        }))];
        const coordsMax = [Math.max.apply(Math, features.map((o: any) => {
          return o.geometry.coordinates[0];
        })), Math.max.apply(Math, features.map((o: any) => {
          return o.geometry.coordinates[1];
        }))];
        try {
          self.map.fitBounds([coordsMin, coordsMax], { padding: 160, maxZoom: 15 });

        } catch {}

        // if there is not features quality is less then < 8 and no coordinates but map search results fire up
        // to populate ads not on map
        if (features.length === 0 && self.mapSearchResults.items.length > 0) {
          self.getAdsInViewport();
        } else {
          this.initialSearch = true;
        }

        self.map.on('mouseenter', 'unclustered-point', () => {
          self.map.getCanvas().style.cursor = 'pointer';
        });

        self.map.on('mouseleave', 'unclustered-point', () => {
          self.map.getCanvas().style.cursor = '';
        });

        try {

          const mousemove = (e:any) => {
            if (e.features.length > 0) {
              if (this.hoveredStateId) {
                this.map.setFeatureState({ source: 'ads', id: this.hoveredStateId }, { hover: false });
              }
              this.hoveredStateId = e.features[0].id;
              this.map.setFeatureState({ source: 'ads', id: this.hoveredStateId }, { hover: true });
            }
            this.map.getCanvas().style.cursor = 'pointer';
          };

          const mouseleave = () => {
            this.map.getCanvas().style.cursor = '';
            if (this.hoveredStateId) {
              this.map.setFeatureState({ source: 'ads', id: this.hoveredStateId }, { hover: false });
            }
            this.hoveredStateId =  null;
          };
          const ads = {
            type: 'geojson',
            data: {
              features,
              type: 'FeatureCollection',
            },
            cluster: true,
            clusterMaxZoom: 11, // Max zoom to cluster points on
            clusterRadius: this.clusterRadius, // Radius of each cluster when clustering points (defaults to 50)
          };

          if (this.map.getSource('ads') !== undefined) {
            this.map.getSource('ads').setData({features,
              type: 'FeatureCollection'});
          } else {
            this.map.addSource('ads', ads);
          }

          const adsCluster = {
            id: 'clusterAds',
            type: 'circle',
            source: 'ads',
            filter: ['has', 'point_count'],
            paint: {
              'circle-color': ['case',
                ['boolean', ['feature-state', 'hover'], false],
                '#1d86ce',
                '#51bbd6',
              ],
              'circle-radius': [
                'step',
                ['get', 'point_count'],
                20, 100,
                30, 750,
                40,
              ],
            },
          };

          if (self.map.getLayer('clusterAds')) {
            self.map.removeLayer('clusterAds');
          }

          this.map.on('mousemove', 'clusterAds', (e:any) => {
            mousemove(e);
          });

          this.map.on('mouseleave', 'clusterAds', () => {
            mouseleave();
          });

          self.map.addLayer(adsCluster);

          const adsSymbol = {
            id: 'clusterAds-count',
            type: 'symbol',
            source: 'ads',
            filter: ['has', 'point_count'],
            layout: {
              'text-field': '{point_count_abbreviated}',
              'text-font': ['DIN Offc Pro Medium', 'Arial Unicode MS Bold'],
              'text-size': 12,
            },
            paint: {
              'text-color': '#fafafa',
            },
          };

          if (self.map.getLayer('clusterAds-count')) {
            self.map.removeLayer('clusterAds-count');
          }

          self.map.addLayer(adsSymbol);

          this.map
            .on('click', 'clusterAds', (e: any) => {
              this.clickOnClusterAds(e);
            })
            .on('touchstart', 'clusterAds', (e: any) => {
              this.clickOnClusterAds(e);
            });

          const up = {
            id: 'unclustered-point',
            type: 'circle',
            source: 'ads',
            filter: ['!has', 'point_count'],
            minzoom: 12,
            paint: {
              'circle-color': [
                'match',
                ['get', 'active'],
                'active', '#11b4da',
                'notActive', '#999',
                /* other */ '#ccc',
              ],
              'circle-radius': 6,
              'circle-stroke-width': 1,
              'circle-stroke-color': '#fff',
            },
          };

          if (self.map.getLayer('unclustered-point')) {
            self.map.removeLayer('unclustered-point');
          }

          self.map.addLayer(up);

          this.map.on('mousemove', 'unclustered-point', (e:any) => {
            if (this.hoverPopupHtml) {
              this.hoverPopupHtml.classList.remove('active');
            }
            const { longitude, latitude } = e.features[0].properties;
            this.hoverPopupHtml = document.getElementsByClassName(`popup-${longitude}-${latitude}`)[0] as HTMLElement;
            this.hoverPopupHtml.classList.add('active');
          });

          this.map.on('mouseleave', 'unclustered-point', () => {
            this.hoverPopupHtml.classList.remove('active');
          });

          const unclusteredRoundPoint = {
            id: 'unclusteredRound-point',
            type: 'circle',
            source: 'ads',
            filter: ['!has', 'point_count'],
            maxzoom: 12,
            paint: {
              'circle-color': '#51bbd6',
              'circle-radius': 20,
            },
          };

          const unclusteredRoundPointHover = {
            id: 'unclusteredRound-pointHover',
            type: 'circle',
            source: 'ads',
            filter: ['==', 'itemId', ''],
            maxzoom: 12,
            paint: {
              'circle-color': '#1d86ce',
              'circle-radius': 20,
            },
          };

          this.map.on('mousemove', 'unclusteredRound-point', (e:any) => {
            this.map.setFilter('unclusteredRound-pointHover', ['==', 'itemId', e.features[0].properties.itemId]);
            this.map.getCanvas().style.cursor = 'pointer';
          });

          this.map.on('mouseleave', 'unclusteredRound-point', () => {
            this.map.setFilter('unclusteredRound-pointHover', ['==', 'itemId', '']);
            this.map.getCanvas().style.cursor = '';
          });

          if (self.map.getLayer('unclusteredRound-point')) {
            self.map.removeLayer('unclusteredRound-point');
            self.map.removeLayer('unclusteredRound-pointHover');
          }

          self.map.addLayer(unclusteredRoundPoint);
          self.map.addLayer(unclusteredRoundPointHover);

          const unclusteredRoundCount = {
            id: 'unclusteredRound-count',
            type: 'symbol',
            source: 'ads',
            filter: ['!has', 'point_count'],
            maxzoom: 12,
            layout: {
              'text-field': '1',
              'text-font': ['DIN Offc Pro Medium', 'Arial Unicode MS Bold'],
              'text-size': 12,
            },
            paint: {
              'text-color': '#fafafa',
            },
          };

          if (self.map.getLayer('unclusteredRound-count')) {
            self.map.removeLayer('unclusteredRound-count');
          }

          self.map.addLayer(unclusteredRoundCount);

          this.map
            .on('click', 'unclusteredRound-point', (e: any) => {
              this.clickOnUnclusteredRound(e);
            })
            .on('touchstart', 'unclusteredRound-point', (e: any) => {
              this.clickOnUnclusteredRound(e);
            });

          this.markers.push(up);
          this.markerSources.push(ads);
        } catch (err) {
        }
      }
    }
    // this.$root.$emit("hide_search_areas");
  }

  clickOnCluster(e: any) {
    const self = this;
    const features = self.map.queryRenderedFeatures(e.point, { layers: ['cluster'] });
    const coordinates = e.features[0].geometry.coordinates.slice();

    // Ensure that if the map is zoomed out such that multiple
    // copies of the feature are visible, the popup appears
    // over the copy being pointed to.
    while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
      coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
    }

    const clusterId = features[0].properties.cluster_id;
    const pointCount = features[0].properties.point_count;

    const clusterSource = this.map.getSource('adsWithDuplicatedCoordinates');

    clusterSource.getClusterLeaves(clusterId, pointCount, 0, function (err: any, aFeatures: any) {

      const ids = [];
      for (let i = 0, l = aFeatures.length; i < l; i += 1) {
        ids.push(aFeatures[i].itemId);
      }

      self.getClusterData(ids).then((data: Array<api.PubModel>) => {

        const popupComponent = new Vue({

          name: 'popup_objects_app',
          data: {
            adsInfo: data,
            adInfo: {},
          },
          components: {
            popUp: PopupMultipleObjectsComponent,
          },
          methods: {
            selectAddress(a: api.PubModel) {
              self.$root.$emit('show_object', a.id);
              this.adInfo = a;
            },
            closePopup() {
              self.popup.remove();
            },
          },
          parent: self,
          template: '<pop-up ref="popup_objects" v-bind:adsInfo="adsInfo" v-bind:closePopup="closePopup" :selectAddress="selectAddress" :uniqueIdentifier="adInfo.uniqueIdentifier"/>',
        }).$mount();

        // Need to be triggered somehow DO NOT REMOVE!
        setTimeout(() => {
          self.popup.setLngLat(coordinates)
            .setDOMContent(popupComponent.$el)
            .addTo(self.map);

        },         100);

      });

    });
  }

  clickOnClusterAds (e: any) {
    const features = this.map.queryRenderedFeatures(e.point, { layers: ['clusterAds'] });
    const clusterId = features[0].properties.cluster_id;
    this.map.getSource('ads').getClusterExpansionZoom(clusterId, (err: any, zoom: any) => {
      if (err) {
        return;
      }

      this.map.easeTo({
        zoom,
        center: features[0].geometry.coordinates,
      });
    });
  }

  clickOnUnclusteredRound (e: any) {
    const features = this.map.queryRenderedFeatures(e.point, { layers: ['unclusteredRound-point'] });
    this.map.easeTo({
      zoom: 13,
      center: features[0].geometry.coordinates,
    });
  }

  setCursors() {
    if (this.interactWithLayersOnMap === 'TravelTime') {
      this.map.on('dragstart', () => {
        this.map.getCanvas().style.cursor = 'grabbing';
      });
      this.map.on('dragend', () => {
        this.map.getCanvas().style.cursor = 'copy';
      });

      this.map.on('mousemove', () => {
        this.map.getCanvas().style.cursor = 'copy';
      });
    } else if (this.interactWithLayersOnMap === 'Radius' || this.interactWithLayersOnMap === 'ManualDraw') {

      this.map.on('dragstart', () => {
        this.map.getCanvas().style.cursor = 'grabbing';
      });

      this.map.on('dragend', () => {
        this.map.getCanvas().style.cursor = 'crosshair';
      });
      this.map.on('mousemove', () => {
        this.map.getCanvas().style.cursor = 'crosshair';
      });

    } else {

      if (this.map.getLayer('unclustered-point')) {
        this.map.on('mouseenter', 'unclustered-point', () => {
          this.map.getCanvas().style.cursor = 'pointer';
        });

        // Change it back to a pointer when it leaves.
        this.map.on('mouseleave', 'unclustered-point', () => {
          this.map.getCanvas().style.cursor = '';
        });
      } else {
        this.map.on('dragstart', () => {
          this.map.getCanvas().style.cursor = 'grabbing';
        });

        this.map.on('dragend', () => {
          this.map.getCanvas().style.cursor = '';
        });
        this.map.on('mousemove', () => {
          this.map.getCanvas().style.cursor = '';
        });
      }

    }
  }

  @Watch('showSearchMap')
  ae() {

    if (this.showSearchMap) {
      this.addSearchResultsToMap();
    }
  }

  @Watch('mapLoaded')
  ml() {
    if (this.mapLoaded) {
      if (this.mainSearchedAddress.name !== undefined) {
        const e = {
          id: this.mainSearchedAddress.uniqueIdentifier,
          geo: this.mainSearchedAddress.geom,
          name: this.mainSearchedAddress.name,
          color: this.mainSearchedAddress['bg_color'],
        };
        try {
          this.drawShapeFromAddress(e);
        } catch (err) {
        }
      }
      this.loadMap();
    }

  }

  created() {
    this.counter = new_counter(1);
  }

  @Watch('addressForTheMap')
  watchAddressesForTheMap() {

    const address = this.addressForTheMap;

    if (this.map.getSource(address.id)) {
      return;
    }

    const polygonLayer = {
      id: address.id,
      type: 'fill',
      source: {
        type: 'geojson',
        data: {
          type: 'Feature',
          geometry: address.geom,
        },
      },
      metadata: {},
      layout: {},
      paint: {
        'fill-color': address.color,
        'fill-opacity': 0.6,
        'fill-outline-color': '#000',
      },
    };

    if (address.radius) {
      // add layer with radius as well;
      const polygonLayer = {
        id: `${address.id}` + 'WithRadius',
        type: 'fill',
        source: {
          // "id": shapes[i].id,
          type: 'geojson',
          data: {
            type: 'Feature',
            geometry: address.geometry,
          },
        },
        layout: {},
        paint: {
          'fill-color': '#fafafa',
          'fill-opacity': 0.3,
          'fill-outline-color': '#000',
        },
      };
      this.map.addLayer(polygonLayer);
    }

    this.map.addLayer(polygonLayer);
    this.searchAreasLayers.push(polygonLayer);

    if (!this.shapeLayers.length) {
      this.fit_bounds();
    }
  }

  @Watch('addressForRemoveFromMap')
  watchAddressesForRemoveFromMap() {

    const address = this.addressForRemoveFromMap.id;

    if (this.map.getSource(address)) {
      // continue;
      this.map.removeLayer(address);
      this.map.removeSource(address);
    }

    // remove from search area layers
    for (let i = 0, l = this.searchAreasLayers.length; i < l; i += 1) {

      if (this.searchAreasLayers[i]) {
        if (this.searchAreasLayers[i].id === address) {
          this.searchAreasLayers.splice(i, 1);
        }
      }
    }
    if (!this.shapeLayers.length) {
      this.fit_bounds();
    }

  }
  @Watch('shapeForRemoveFromMap')
  watchShapeForRemoveFromMap() {

    if (this.map.getLayer(this.shapeForRemoveFromMap.id) || this.map.getSource(this.shapeForRemoveFromMap.id)) {

      if (this.map.getLayer('symbol_' + `${this.shapeForRemoveFromMap.id}`) || this.map.getSource('symbol_' + `${this.shapeForRemoveFromMap.id}`)) {
        this.map.removeLayer('symbol_' + `${this.shapeForRemoveFromMap.id}`);
        this.map.removeSource('symbol_' + `${this.shapeForRemoveFromMap.id}`);
      }

      this.map.removeLayer(this.shapeForRemoveFromMap.id);
      this.map.removeSource(this.shapeForRemoveFromMap.id);

      for (let i = 0, l = this.searchAreasLayers.length; i < l; i += 1) {

        if (this.searchAreasLayers[i]) {
          if (this.searchAreasLayers[i].id === this.shapeForRemoveFromMap.id) {
            this.searchAreasLayers.splice(i, 1);
          }
        }
      }
      for (let i = 0, l = this.shapeLayers.length; i < l; i += 1) {
        if (this.shapeLayers[i]) {
          if (this.shapeLayers[i].id === this.shapeForRemoveFromMap.id) {
            this.shapeLayers.splice(i, 1);
          }
        }
      }

      for (let i = 0, l = this.symbolLayers.length; i < l; i += 1) {
        if (this.symbolLayers[i]) {
          if (this.symbolLayers[i].id === this.shapeForRemoveFromMap.id) {
            this.symbolLayers.splice(i, 1);
          }
        }
      }

      if (!this.shapeLayers.length) {
        this.fit_bounds();
      }
    }
  }
  @Watch('symbolLayerFromMap')
  watchSymbolLayerFromMap() {
    try {
      this.map.removeLayer('symbol_' + `${this.symbolLayerFromMap.shape.id}`);
      this.map.removeSource('symbol_' + `${this.symbolLayerFromMap.shape.id}`);
      // remove from symbolLayers as well

      for (let i = 0, l = this.symbolLayers.length; i < l; i += 1) {
        if (this.symbolLayers[i]) {
          if (this.symbolLayers[i].id === this.symbolLayerFromMap.shape.id) {
            this.symbolLayers.splice(i, 1);
          }
        }
      }
    } catch {}
    setTimeout(() => {

      const symboLayer = {
        id: 'symbol_' + `${this.symbolLayerFromMap.shape.id}`,
        type: 'symbol',
        source: {
          type: 'geojson',
          data: {
            type: 'FeatureCollection',
            features: [{
              type: 'Feature',
              geometry: {
                type: 'Point',
                coordinates: this.symbolLayerFromMap.shape.center,
              },
            }],
          },
        },
        layout: {
          'text-field': this.symbolLayerFromMap.shape.name,
          'text-font': [
            'DIN Offc Pro Medium',
            'Arial Unicode MS Bold',
          ],
          'text-size': 12,
        },
      };
      this.map.addLayer(symboLayer);
      this.symbolLayers.push(symboLayer);
    },         300);
  }

  @Watch('travelTimeData')
  watchTravelTimeData() {
    // console.log(this.travelTimeData);

    search_.commitAddressLoading(store, true);

    const time: number = this.travelTimeData.time;
    const pointId: any = this.travelTimeData.pointId;
    const color: string = this.travelTimeData.color;

    const c = this.map.getSource('onePoint')._data.features[0].geometry.coordinates;

    const sources = [{
      lng: c[0],
      lat: c[1],
      id: pointId,
    }];

    const toSend: {
      travelType: string,
      travelEdgeWeights: number[],
      serializer: string
      srid: any,
      simplify: number,
      rushHour?: boolean,
      transitMaxTransfers?: number,
      transitFrameTime?: number,
      transitFrameDate?: number,
      buffer?: number,
      quadrantSegments?: number,
    } = {
      travelType: this.travelTimeData.by.toLowerCase(),                   // Either 'walk', 'bike', 'car' or 'transit'
      travelEdgeWeights: [time * 60],   // Array of distinct travel times in seconds
      serializer: 'geojson',
      srid: SRID.SRID_4326,
      simplify: 250, // 100m max is 500m on Douglas-Peucker,
      buffer: 0.0005,
      quadrantSegments: 4,
    };

    if (this.travelTimeData.rushHour) {
      toSend.rushHour = this.travelTimeData.rushHour;
    }
    if (this.travelTimeData.by.toLowerCase() === 'transit' && this.travelTimeData.rushHourStartTime) {
      toSend.transitMaxTransfers = 5;
      toSend.transitFrameTime = parseInt(this.travelTimeData.rushHourStartTime, 36);
      toSend.transitFrameDate = moment(new Date(), 'YYYYMMDD').format('YYYYMMDD');
    }

    tgmClient.polygons.fetch(sources, <PolygonGeoJsonOptions>toSend).then((a: any) => {
      this.addTravelPolygons(a.features, time, color, pointId);
      this.$emit('travelPolygonCreated', {
        geo: this.map.getSource(pointId)._data.features[0].geometry,
        id: someId,
      });

      search_.commitAddressLoading(store, false);
    });
  }

  @Watch('layerToRemoveById')
  watchLayerToRemoveById() {
    try {
      this.map.removeLayer(this.layerToRemoveById.id);
      this.map.removeSource(this.layerToRemoveById.id);
    } catch  {
    }
  }
  @Watch('setTravelPointValue')
  watchSetTravelPointValue() {
    if (this.setTravelPointValue) {
      this.map.on('click', this.setTravelPoint);
      this.map.on('touchstart', this.setTravelPoint);
    } else {
      this.map.getCanvas().style.cursor = '';
      this.map.off('click', this.setTravelPoint);
      this.map.off('touchstart', this.setTravelPoint);
    }
  }
  @Watch('interactWithLayersOnMap')
  watchInteractWithLayersOnMap() {

    this.captureViewport = false;
    if (this.interactWithLayersOnMap) {

      this.setCursors();
      if (this.interactWithSources[this.interactWithLayersOnMap]) {
        if (this.interactWithLayersOnMap !== this.interactWith) {

          if (this.interactWith !== '') {
            this.map.off('click', this.interactWith, this.onClick);
            this.map.off('touchstart', this.interactWith, this.onClick);
            this.map.off('mousemove', this.interactWith, this.onMouseMove);
          }

          this.interactWith = this.interactWithLayersOnMap;
          this.map.on('click', this.interactWith, this.onClick);
          this.map.on('touchstart', this.interactWith, this.onClick);
          this.map.on('mousemove', this.interactWith, this.onMouseMove);

          this.map.on('mouseleave', this.interactWith, () => {

            setTimeout(() => {
              this.tooltip.remove();
              this.map.getCanvas().style.cursor = '';
            },         100);

            try {
              this.map.removeLayer(lastSelectedLocality1);
              this.map.removeSource(lastSelectedLocality1);
              lastSelectedLocality1 = '';

            } catch {
            }
          });
        }
      } else {
        if (this.interactWith !== '') {
          this.map.off('click', this.interactWith, this.onClick);
          this.map.off('touchstart', this.interactWith, this.onClick);
          this.map.off('mousemove', this.interactWith, this.onMouseMove);
          this.interactWith = '';
        }
      }
      this.$forceUpdate();
    }
  }

  @Watch('drawPolygonMode')
  watchDrawPolygonMode() {
    if (this.drawPolygonMode.type !== '') {
      this.draw_shape(this.drawPolygonMode.type, true);
      this.currentDrawStyle = this.drawPolygonMode.type;
    }
  }
  @Watch('layerWithRadius')
  watchLayerWithRadius() {

    if (!this.layerWithRadius.isShape) {
      api.$geo.getAddressPart(this.layerWithRadius.id).then((data) => {

        const definedAreaCoordinates = {
          type: 'Feature',
          properties: {},
          geometry: {
            type: 'MultiPolygon',
            coordinates: data.geom.coordinates,
          },
        };

        const definedAreaBuffer = turf.buffer(<any> definedAreaCoordinates, this.layerWithRadius.radius, { units: 'meters' });
        this.$emit('layerWithRadiusUpdated', {
          time: new Date().getTime(),
          id: this.layerWithRadius.id,
          geometry: definedAreaBuffer.geometry,
        });

        if (this.map.getSource(`${this.layerWithRadius.id}` + 'WithRadius') !== undefined) {
          this.map.getSource(`${this.layerWithRadius.id}` + 'WithRadius').setData({
            type: 'Feature',
            geometry: definedAreaBuffer.geometry,
          });
          return;
        }
        const polygonLayer = {
          id: `${this.layerWithRadius.id}` + 'WithRadius',
          type: 'fill',
          source: {
            // "id": shapes[i].id,
            type: 'geojson',
            data: {
              type: 'Feature',
              geometry: definedAreaBuffer.geometry,
            },
          },
          layout: {},
          paint: {
            'fill-color': '#fafafa',
            'fill-opacity': 0.3,
            'fill-outline-color': '#000',
          },
        };
        this.map.addLayer(polygonLayer);
      });
    } else {
      const definedAreaCoordinates = {
        type: 'Feature',
        properties: {},
        geometry: {
          type: 'Polygon',
          coordinates: this.layerWithRadius.geom.coordinates,
        },
      };

      const definedAreaBuffer = turf.buffer(<any> definedAreaCoordinates, this.layerWithRadius.radius, { units: 'kilometres' });

      this.$emit('updateShapeGeometry', {
        geom: definedAreaBuffer.geometry,
        id: this.layerWithRadius.id,
      });

      if (this.map.getSource(`${this.layerWithRadius.id}` + 'WithRadius') !== undefined) {
        this.map.getSource(`${this.layerWithRadius.id}` + 'WithRadius').setData({
          type: 'Feature',
          geometry: definedAreaBuffer.geometry,
        });
        return;
      }
      const polygonLayer = {
        id: `${this.layerWithRadius.id}` + 'WithRadius',
        type: 'fill',
        source: {
          // "id": shapes[i].id,
          type: 'geojson',
          data: {
            type: 'Feature',
            geometry: definedAreaBuffer.geometry,
          },
        },
        layout: {},
        paint: {
          'fill-color': 'transparent',
          'fill-opacity': 1,
          'fill-outline-color': '#000',
        },
      };
      this.map.addLayer(polygonLayer);
    }

  }

  @Watch('viewPortForSearchMap')
  watchViewPortForSearchMap() {
    const l: any = {
      id: this.viewPortForSearchMap.id,
      type: 'fill',
      source: {
        type: 'geojson',
        data: {
          type: 'Feature',
          geometry: {
            type: 'Polygon',
            coordinates: [this.viewPortForSearchMap.polygon],
          },
        },
      },
      layout: {},
      paint: {
        'fill-color': this.viewPortForSearchMap.color,
        'fill-opacity': 0.3,
      },

    };
    this.map.addLayer(l);
    this.searchAreasLayers.push(l);
    // self.fit_bounds();

    this.$root.$emit('addSymbolLayer', this.viewPortForSearchMap);
  }

  @Watch('getViewPortModel')
  watchGetViewPortModel() {
    if (this.map) {
      const bounds = this.map.getBounds();
      const e = new mapboxgl.LngLatBounds(bounds._sw, bounds._ne);

      const polygon = [
        [e.getNorthWest().lng, e.getNorthWest().lat],
        [bounds._ne.lng, bounds._ne.lat],
        [e.getSouthEast().lng, e.getSouthEast().lat],
        [bounds._sw.lng, bounds._sw.lat],
        [e.getNorthWest().lng, e.getNorthWest().lat],
      ];

      const id = 'viewport_' + `${this.counter.next().toString()}`;
      this.$emit('addViewPortToSearchShapes', {
        id,
        polygon,
        name: 'Viewport',
        show: true,
        color: this.get_random_color(),
      });

      this.captureViewport = true;
    }
  }

  @Watch('resetMap')
  watchResetMap() {
    this.map.setStyle('mapbox://styles/ascarix/cjoe973rf8rf82rmi5fcykj8w');
    this.searchAreasLayers = [];
    this.shapeLayers = [];
    this.symbolLayers = [];
  }
  @Watch('mapInteraction')
  watchMapInteraction() {

    if (this.map) {
      if (this.mapInteraction.val) {
        if (this.interactWithLayersOnMap) {
          if (this.interactWithLayersOnMap === 'Radius' || this.interactWithLayersOnMap === 'ManualDraw') {
            if (this.draw) {
              this.map.addControl(this.draw);
              this.draw_shape(this.currentDrawStyle, true);
            }
          } else if (this.interactWithLayersOnMap === 'ViewPort') {
            this.captureViewport = true;
          } else {
            if (this.interactWithLayersOnMap === 'TravelTime') {
              this.map.on('click', this.setTravelPoint);
              this.map.on('touchstart', this.setTravelPoint);
            } else {
              this.map.on('click', this.interactWith, this.onClick);
              this.map.on('touchstart', this.interactWith, this.onClick);
              this.map.on('mousemove', this.interactWith, this.onMouseMove);
            }
          }

          // set default cursors
          this.setCursors();
        }
      } else {
        if (this.interactWithLayersOnMap) {
          if (this.interactWithLayersOnMap === 'Radius' || this.interactWithLayersOnMap === 'ManualDraw') {
            if (this.draw) {
              try {
                // this needs to be in try since mapbox is report error that does not exists
                this.map.removeControl(this.draw);
              } catch {
              }

            }
          } else if (this.interactWithLayersOnMap === 'ViewPort') {
            this.captureViewport = false;
          } else {
            if (this.interactWithLayersOnMap === 'TravelTime') {
              // console.log('iskljuci');
              this.map.off('click', this.setTravelPoint);
              this.map.off('touchstart', this.setTravelPoint);
            } else {
              this.map.off('click', this.interactWith, this.onClick);
              this.map.off('touchstart', this.interactWith, this.onClick);
              this.map.off('mousemove', this.interactWith, this.onMouseMove);
            }
          }

          this.map.on('dragstart', () => {
            this.map.getCanvas().style.cursor = 'grabbing';
          });

          this.map.on('dragend', () => {
            this.map.getCanvas().style.cursor = '';
          });
          this.map.on('mousemove', () => {
            this.map.getCanvas().style.cursor = '';
          });
        }
      }
    }
  }
  @Watch('searchArealLayersVisibility')
  watchSearchArealLayersVisibility() {
    // remove restricted area on search
    if (this.searchArealLayersVisibility.val) {
      this.showWorkspace = true;
    } else {
      this.showWorkspace = false;
    }
    if (this.showWorkspace) {
      this.drawWorkSpace();
    }

    if (this.searchArealLayersVisibility.val) {
      // if (this.openPopups.length) {
      //   this.openPopups.forEach(popup => popup.close());
      // }
      try {
        for (let i = 0, l = this.searchAreasLayers.length; i < l; i += 1) {

          try {
            this.map.setPaintProperty(this.searchAreasLayers[i]['id'], 'fill-color', this.searchAreasLayers[i].paint['fill-color']);
          } catch {
            // fill-extrusion-color
            this.map.setPaintProperty(this.searchAreasLayers[i]['id'], 'fill-extrusion-color', this.searchAreasLayers[i].paint['fill-extrusion-color']);
          }

        }

        for (let i = 0, l = this.symbolLayers.length; i < l; i += 1) {
          this.map.setLayoutProperty(this.symbolLayers[i]['id'], 'visibility', 'visible');
        }

      } catch {
      }

      this.map.setLayoutProperty('unclustered-point', 'visibility', 'none');
      this.map.setLayoutProperty('cluster', 'visibility', 'none');
      this.map.setLayoutProperty('cluster-count', 'visibility', 'none');

      this.map.setLayoutProperty('clusterAds', 'visibility', 'none');
      this.map.setLayoutProperty('clusterAds-count', 'visibility', 'none');
      this.map.setLayoutProperty('unclusteredRound-point', 'visibility', 'none');
      this.map.setLayoutProperty('unclusteredRound-pointHover', 'visibility', 'none');
      this.map.setLayoutProperty('unclusteredRound-count', 'visibility', 'none');

      const popups = document.getElementsByClassName('custom-popup');
      if (popups.length) {
        Array.from(popups).forEach(el => el.classList.add('hide'));
      }
    } else {
      try {
        for (let i = 0, l = this.searchAreasLayers.length; i < l; i += 1) {

          try {
            this.map.setPaintProperty(this.searchAreasLayers[i]['id'], 'fill-color', 'rgba(250,250,250,1)');
            if (this.searchAreasLayers[i]['id'].includes('drawnShape')) {
              this.map.setPaintProperty(this.searchAreasLayers[i]['id'], 'fill-color', 'rgba(250,250,250,0.3)');
            }
          } catch {
            // fill-extrusion-color
            this.map.setPaintProperty(this.searchAreasLayers[i]['id'], 'fill-extrusion-color', 'rgba(250,250,250,1)');
          }

        }
        if (this.map.getLayer('unclustered-point') === undefined) {
          try {
            this.map.addSource('ads', this.markerSources[0]);
            this.map.addLayer(this.markers[0]);
          } catch {}
        } else {
          this.map.setLayoutProperty('cluster', 'visibility', 'visible');
          this.map.setLayoutProperty('cluster-count', 'visibility', 'visible');

          this.map.setLayoutProperty('clusterAds', 'visibility', 'visible');
          this.map.setLayoutProperty('clusterAds-count', 'visibility', 'visible');
          this.map.setLayoutProperty('unclusteredRound-point', 'visibility', 'visible');
          this.map.setLayoutProperty('unclusteredRound-pointHover', 'visibility', 'visible');
          this.map.setLayoutProperty('unclusteredRound-count', 'visibility', 'visible');
        }
        const popups = document.getElementsByClassName('custom-popup');
        if (popups.length) {
          Array.from(popups).forEach(el => el.classList.remove('hide'));
        }
      } catch  {
      }
    }
  }
  @Watch('shapeToDrawOnMap')
  watchShapeToDrawOnMap() {
    this.cleanPopups();
    const polygonLayer = {
      id: this.shapeToDrawOnMap.id,
      type: 'fill',
      source: {
        type: 'geojson',
        data: {
          type: 'Feature',
          geometry: {
            type: this.shapeToDrawOnMap.geom.type ? this.shapeToDrawOnMap.geom.type : 'Polygon',
            coordinates: this.shapeToDrawOnMap.geom.coordinates,
          },
        },
      },

      metadata: {
        name: this.shapeToDrawOnMap.name,
      },
      layout: {},
      paint: {
        'fill-color': this.shapeToDrawOnMap.color,
        'fill-opacity': 0.6,
        'fill-outline-color': '#000',
      },
    };
    this.map.addLayer(polygonLayer);
    this.searchAreasLayers.push(polygonLayer);
    this.shapeLayers.unshift(polygonLayer);
  }

  @Watch('mapToSearchArea')
  watchMapToSearchArea() {
    if (this.mapToSearchArea.val) {
      setTimeout(() => { this.fit_bounds(true); }, 500);
    }
  }
}
