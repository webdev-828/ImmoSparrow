import { Component, Watch } from 'vue-property-decorator';
import { setTimeout } from 'timers';
import MapComponent from './index';
import mapboxgl from 'mapbox-gl';
import Vue from 'vue';
import Tooltip from './tooltip';
import * as turf from '@turf/turf';
let lastSelectedLocality1: any;

@Component({
  mixins: [],
  components: {

  },
})
export default class AgencyMapComponent extends MapComponent {

  interact: boolean = false;
  interactWith: string = '';
  interactWithSources: object = {
    po_localities: 'locality',
    po_communes: 'commune',
    po_cantons: 'canton',
    po_districts: 'district',
    po_market_regions: 'market_region',
    po_ms_regions: 'ms_region',
  };

  created() {
    const self = this;
    // let interval = setInterval(() => {

      // if (self.map.loaded()) {
      //  clearInterval(interval);

    self.showDrawTools = false;

    self.$root.$on('addSymbolLayer', (value: any) => {

      this.map.removeLayer('symbol_' + `${value.id}`);
      const symbolLayer = {
        id: 'symbol_' + `${value.id}`,
        type: 'symbol',
        source: value.id,
        layout: {
          'text-field': value.name,
          'text-font': [
            'DIN Offc Pro Medium',
            'Arial Unicode MS Bold',
          ],
          'text-size': 12,
        },
      };
      self.map.addLayer(symbolLayer);
      self.symbolLayers.push(symbolLayer);
    });

    self.$root.$on('remove_shape_from_address', (id: string) => {

      this.removeShapeFromAddress(id);

    });

    self.$root.$on('draw_shapes', (shapes: any) => {

      self.drawShapesFromAddress(shapes);

    });

    self.$root.$on('draw_shape', (shape: any) => {

      this.drawShapeFromAddress(shape);

    });

    self.$root.$on('shape_removed', (id: string) => {

      this.removeShape(id);

    });

    this.$root.$on('startDraw', (value: any) => {
      this.draw_shape(value, true);
      this.currentDrawStyle = value;
    });

    this.$root.$on('getViewPort', () => {

      const bounds = this.map.getBounds();
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

      this.captureViewport = true;
    });
    this.$root.$on('interact', (obj: any) => {
      this.interact = obj.bool;
      this.interactWith = obj.with;

    });

      // }
    // }, 1);

  }

  @Watch('interact', { immediate: true })
  polygonsInteract() {

    const self = this;
    if (this.interact) {

      self.map.on('click', this.interactWith, this.onClick);
      self.map.on('mousemove', this.interactWith, this.onMouseMove);
      self.map.on('mouseleave', this.interactWith, () => {

        setTimeout(() => {
          self.tooltip.remove();
          self.map.getCanvas().style.cursor = '';
        },         100);

        try {
          self.map.removeLayer(lastSelectedLocality1);
          self.map.removeSource(lastSelectedLocality1);
          lastSelectedLocality1 = '';

        } catch {
        }
      });
    } else {
      if (this.interactWith !== '') {
        self.map.off('click', this.interactWith, this.onClick);
        self.map.off('mousemove', this.interactWith, this.onMouseMove);
      }
    }
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

      const coordinates = <mapboxgl.LngLatLike>[position.lngLat.lng, position.lngLat.lat];

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

      // console.log(name);

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
              // console.log(JSON.stringify(polygon));
            }
            // geom.push(turf.multiPolygon(a[i].geometry.coordinates));
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

          },
          );
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
    let lastSelectedLocality: any;
    const self = this;
    const fs = self.map.queryRenderedFeatures(e.point, { layers: [this.interactWith] });

    const c = this.get_color();

    self.map.getCanvas().style.cursor = 'pointer';

    if (fs.length) {

      const f = fs[0];

      const lang = localStorage.getItem('lang');

      let name = f.properties['name_' + `${lang}`];
      if (lang === 'en') {
        name = f.properties['name_de'];
      }

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
              // console.log(JSON.stringify(polygon));
            }
            // geom.push(turf.multiPolygon(a[i].geometry.coordinates));
          } else {
            geom.push(turf.polygon(a[i].geometry.coordinates));
          }
        } catch (err) {
        }

      }

      if (geom.length) {
        const e = turf.union(...geom);
        lastSelectedLocality = f.properties.uniqueidentifier;

        if (this.map.getLayer(f.properties.uniqueidentifier)) {
          this.map.removeLayer(f.properties.uniqueidentifier);
          this.map.removeSource(f.properties.uniqueidentifier);
          this.$root.$emit('address_removed', f.properties.uniqueidentifier);
        } else {
          try {
            this.map.addSource(lastSelectedLocality, {
              type: 'geojson',
              data: e,

            },
            );
            this.map.addLayer({
              id: lastSelectedLocality,
              type: 'fill',
              source: lastSelectedLocality,
              paint: {
                'fill-color': c,
                'fill-opacity': 0.4,
              },
            });

            const shape = {
              name,
              id: f.properties.uniqueidentifier,
              color: c,
              infinite: this.infiniteDraw,
              geom: e.geometry.coordinates,
            };
            this.$root.$emit('geo_shape_created', shape);

          } catch {
            /* this.map.removeLayer(lastSelectedLocality);
            this.map.removeSource(lastSelectedLocality);
            this.$root.$emit("shape_removed_from_map", lastSelectedLocality); */

          }
        }

      }

    }
  }

  get_color(): string {

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

  }

  @Watch('mapLoaded')
  ml() {
    if (this.mapLoaded) {
      // console.log("map is loaded");
    }
  }

  @Watch('map')
  ml1() {
    if (this.map) {
      // console.log("map is ok");
    }
  }

}
