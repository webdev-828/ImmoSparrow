import MapComponent from '../map';
import store from '../../store';
import { Component, Watch, Prop } from 'vue-property-decorator';
import * as search from '../../store/modules/searchStatesModule';
import Vue from 'vue';
import PopupMultipleEntrancesComponent from '../map/popup.multiple.e';
import * as api from '@immosparrow/cockpit-api-v2';
import * as pp from '../../store/modules/pricePredictionModule';
import r360 from 'route360';
import { TargomoClient } from '@targomo/core';
import { bbox } from '@turf/turf';
import mapboxgl from 'mapbox-gl';
import Tooltip from '../map/tooltip';
import { setTimeout } from 'timers';

const tgmClient = new TargomoClient('westcentraleurope', 'FBTLI0O1DTZNSIJQTU8R101440813');
let lastFeatureIdClicked: any = '';
let lastFeatureId: any = '';
@Component({
  mixins: [],
  components: {

  },
})

export default class AdsMapComponent extends MapComponent {

  @Prop()
  addressFromAd: api.GeoSuggestion;
  @Prop()
  buildingModel: api.BuildingModel;
  address: api.IGeoSuggestion;
  lastFsIdHover: string = '';
  lastFsLayerTypeHover: string = '';
  lastFsLayerId: string = '';
  clickedShape: string = '';

  destroyed() {
    // search.commitResetState(store);
    search.commitSearchedPricePredictAddress(store, new api.GeoSuggestion());
  }

  setLayers(address: any) {

    const self = this;

    try {
      self.setBuildingShape(this.buildingModel);
      self.setObject(address.uniqueIdentifier, null, address);
      this.buildingLoading = false;

    } catch {
      // search.commitResetState(store);
      this.buildingLoading = false;
      search.commitSearchedPricePredictAddress(store, new api.GeoSuggestion());

    }
  }

  addTravelPolygons(polygon: any) {

    const travelTimes = [300, 600, 900];

    function getHeightStops(travelTimes: any, heightFactor: any) {
      return [
        [travelTimes[0], travelTimes.length * (10 * heightFactor)],
        [travelTimes[travelTimes.length - 1], travelTimes.length * heightFactor],
      ];
    }

    // color stop function
    function getColorStops(times: any) {
      const colors = r360.config.defaultTravelTimeControlOptions.travelTimes.map((time: any, idx: any) => {
        if (times[idx] !== undefined) {
          return [times[idx], time.color];
        }
      });
      return colors.slice(0, 3);
    }

    try {

      this.map.addSource('polygons', {
        type: 'geojson',
        data: {
          type: 'FeatureCollection',
          features: polygon,
        },
      });

      this.map.addLayer({
        id: 'polygons',
        type: 'fill-extrusion',
        source: 'polygons',
        layout: {},
        paint: {

          'fill-extrusion-base': 0,
          'fill-extrusion-height': {
            property: 'time',
            stops: getHeightStops(travelTimes, 2),
          },
          'fill-extrusion-color': {
            property: 'time',
            stops: getColorStops(travelTimes),
          },
          'fill-extrusion-opacity': 0.5,
        },
      });
      this.map.fitBounds(bbox(polygon[2]), { padding: 20 });
    } catch (err) {
    }

  }
  async setObject(id: string, e: any, address: api.IGeoSuggestion) {

    try {

      const geojson = {
        type: 'FeatureCollection',
        features: [{
          type: 'Feature',
          geometry: {
            type: 'Point',
            coordinates: [address.coordinates.longitude, address.coordinates.latitude],
          },
        }],
      };

      const pointSource = {
        type: 'geojson',
        data: geojson,
      };
      const pointLayer = {
        id: 'point',
        type: 'circle',
        source: 'point',
        paint: {
          'circle-radius': 10,
          'circle-color': '#d61683',
          'circle-stroke-width': 1,
          'circle-stroke-color': '#fff',
        },
      };

      try {
        this.map.addSource('point', pointSource);
        this.map.addLayer(pointLayer);

        this.markers.push(pointLayer);
        this.markerSources.push(pointSource);

      } catch (err) {
        this.map.getSource('point').setData(geojson);
      }

      this.map.setZoom(18);
      this.mapZoom = 18;
      this.map.setCenter([address.coordinates.longitude, address.coordinates.latitude]);

    } catch (err) {
      search.commitAddressLoading(store, false);
    }

  }
  setBuildingShape(b: api.BuildingModel) {

    // TODO refactor map pp
    if (!b) {
      return;
    }
    const self = this;
    try {

      if (this.map.getLayer('bl')) {
        this.map.removeLayer('bl');
        this.map.removeSource('bl');
      }

      this.map.addLayer({
        id: 'bl',
        type: 'fill',
        source: {
          type: 'geojson',
          data: {
            type: 'Feature',
            geometry: b.realProperty.primaryInfo.geom,
          },
        },
        layout: {},
        paint: {
          'fill-color': '#98a6b2',
          'fill-opacity': 0.3,
          'fill-outline-color': '#000',
        },
      });

    } catch (err) {
      // console.log(err);
    }

  }

  get mapAndAddress() {
    return {
      loaded: this.mapLoaded,
      address: this.pricePredictSearchedAddress,
    };
  }
  @Watch('mapAndAddress', { immediate: true })
  ma() {
    const self = this;
    const l = '';
    try {

      if (this.mapAndAddress.loaded && this.mapAndAddress.address !== undefined) {

        this.buildingLoading = true;
        this.address = this.mapAndAddress.address;

        self.map.setCenter([self.address.coordinates.longitude, self.address.coordinates.latitude]);
        self.map.panTo([self.address.coordinates.longitude, self.address.coordinates.latitude]);
        self.setLayers(self.address);

        self.map.setPaintProperty(self.d3 ? 'av3d' : 'av', self.d3 ? 'fill-extrusion-color' : 'fill-color', '#cbc7c3');

        self.popup.remove();

      } else {
        try {
          self.map.removeLayer('point');
          self.map.removeSource('point');
          this.buildingLoading = false;

        } catch (err) {
          search.commitAddressLoading(store, false);
          this.buildingLoading = false;
        }
      }
    } catch (err)  {
      search.commitAddressLoading(store, false);
      this.buildingLoading = false;

    }
  }

  created() {
    const self = this;
    this.$root.$on('buildingModelChanged', (data: api.BuildingModel) => {
      if (data.id) {
        this.setBuildingShape(data);

        setTimeout(() => {
          if (this.address && this.address.coordinates) {
            let l = self.map.project([this.address.coordinates.longitude, this.address.coordinates.latitude]);
            const fs = self.map.queryRenderedFeatures(l, { layers: this.d3 ? this.layersForHover3d : this.layersForHover });

            if (fs.length) {

              const f = fs[0];

              lastFeatureIdClicked = f.properties.uniqueidentifier;
              lastFeatureId = f.properties.uniqueidentifier;
              l = f.layer.id;
              self.$root.$emit('selectedLayer', f.layer.id);
              self.map.setPaintProperty(this.d3 ? 'av3d' : f.layer.id, this.d3 ? 'fill-extrusion-color' : 'fill-color', ['case',
                ['==', ['get', 'uniqueidentifier'], f.properties.uniqueidentifier], '#5a636e', '#cbc7c3']);
            }
          }
        },         500);
      }

      // this.buildingModel = data;
    });
    this.$root.$on('removeMarkers', () => {
      try {
        this.map.removeLayer('marketRadarPoints');
        this.map.removeSource('marketRadarPointsSource');
        this.map.removeLayer('radius');
        this.map.removeSource('radius');
        this.searchAreasLayers = [];
        this.shapeNames = [];
        this.map.removeLayer('point');
        this.map.removeSource('point');
        this.buildingLoading = false;
      } catch {
        this.buildingLoading = false;
      }
    });

    // used for main market radar layer that is coming from search
    this.$root.$on('remove_market_radar_point', (selectedLayer: string) => {
      this.buildingLoading = false;
      try {
        this.map.removeLayer('point');
        this.map.removeSource('point');

        setTimeout(() => {
          this.map.setPaintProperty(this.d3 ? 'av3d' : selectedLayer, this.d3 ? 'fill-extrusion-color' : 'fill-color', ['case',
                 ['==', ['get', 'uniqueidentifier'], lastFeatureId !== '' ? lastFeatureId : lastFeatureIdClicked], '#cbc7c3', '#cbc7c3']);
          lastFeatureId = '';
          lastFeatureIdClicked = '';
        },         500);

      } catch  {
        this.buildingLoading = false;
      }

      try {
        this.map.removeLayer('bl');
        this.map.removeSource('bl');
      } catch {
        this.buildingLoading = false;
      }

    });

    this.$root.$on('remove_market_radar_popup', () => {
      this.popupMarketRadar.remove();
      this.buildingLoading = false;
    });
  }

  buildingLoading: boolean = false;

  load() {

    const self = this;

    self.map.on('click', (e: any) => {

      if (self.buildingLoading) {
        return;
      }

      let l = self.layersForHover;

      if (self.d3) {
        l = self.layersForHover3d;
      } else {
        if (self.satelliteView) {
          l = self.layersForHoverSatellite;
        }
      }

      self.popup.remove();
      const fs = self.map.queryRenderedFeatures(e.point, { layers: l });

      if (fs.length) {

        try {
          self.map.removeLayer('point');
          self.map.removeLayer('bl');
          self.map.removeSource('point');
          self.map.removeSource('bl');
        } catch  {
        }

        self.buildingLoading = true;

        const f = fs[0];
        self.tooltip.remove();
        if (f.properties.uniqueidentifier !== lastFeatureIdClicked) {
          lastFeatureIdClicked = f.properties.uniqueidentifier;
          // self.lastFsIdHover = lastFeatureIdClicked;
          // self.lastFsLayerTypeHover = f.layer.type;
          self.map.getCanvas().style.cursor = 'pointer';

          self.$root.$emit('selectedLayer', f.layer.id);
          self.map.setPaintProperty(self.d3 ? 'av3d' : f.layer.id, self.d3 ? 'fill-extrusion-color' : 'fill-color', ['case',
                 ['==', ['get', 'uniqueidentifier'], f.properties.uniqueidentifier], '#5a636e', '#cbc7c3']);

        } else {
          self.map.getCanvas().style.cursor = '';
        }

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

        search.commitAddressLoading(store, true);
        api.$building(f.properties.uniqueidentifier).get().then((data: api.BuildingModel) => {
          pp.commitSetSelectedBuilding(this.$store, data);
          self.tooltip.remove();
          // this is used to show right sidebar with building information
          if (data.entrances.length > 1) {

            const popupComponent = new Vue({

              name: 'popup_entrances_app',
              data: {
                // entrances: data.entrances,
                // pictures: data.pictures,
                building: data,
                lat: e.lngLat.lat,
                lng: e.lngLat.lng,
                // entrence: null,
              },
              components: {
                popUp: PopupMultipleEntrancesComponent,
              },
              methods: {
                setEntrance(o: any, index: number) {
                  pp.commitSetSelectedEntrance(this.$store, data.entrances[index]);
                  self.$root.$emit('onSelectEnterence', index - 1);
                  getEntrenceData(o, data);
                  self.popup.remove();
                },
              },
              parent: self,
              template: '<pop-up ref="popup_entrances" v-bind:building="building" v-bind:setEntrence="setEntrance" v-bind:lat="lat" v-bind:lng="lng" />',
            }).$mount();

            // Need to be triggered somehow DO NOT REMOVE!
            // setTimeout(function () {
            const coordinates = <mapboxgl.LngLatLike>[e.lngLat.lng, e.lngLat.lat];

            // Ensure that if the map is zoomed out such that multiple
            // copies of the feature are visible, the popup appears
            // over the copy being pointed to.
            while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
              coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
            }

            self.popup.setLngLat(coordinates)
              .setDOMContent(popupComponent.$el)
              .addTo(self.map);

            search.commitAddressLoading(store, false);

          } else {

            if (data.entrances.length) {
              pp.commitSetSelectedEntrance(this.$store, data.entrances[0]);
              getEntrenceData(data.entrances[0], data);
            } else {
              // just add marker
              search.commitAddressLoading(store, false);
              self.setBuildingShape(data);

              if (self.clickedShape !== '') {
                self.$root.$emit('remove_shape', self.clickedShape);

              }
              self.$root.$emit('remove_address_item');
              self.$root.$emit('showObject', false);

              self.clickedShape = data.id;

              self.address.name = 'Building does not have any entrances or any address details.';
              self.address.uniqueIdentifier = data.id;
              self.address.coordinates = new api.GeoCoordinates({
                longitude: e.lngLat.lng,
                latitude: e.lngLat.lat,
              });
              self.$root.$emit('removePricePrediction');

              self.setObject(f.properties.uniqueidentifier, null, self.address);

              Vue.prototype.$notify({
                group: 'actions',
                type: 'error',
                duration: 5000,
                text: 'Building does not have any entrances or any address details.',
              });

            }
          }

          function getEntrenceData(entrance: api.EntranceLightModel, b: api.BuildingModel) {
            if (entrance) {

              if (self.clickedShape !== '') {
                self.$root.$emit('remove_shape', self.clickedShape);
              }
              self.$root.$emit('remove_address_item');
              self.$root.$emit('showObject', false);

              const suggestion = {
                uniqueIdentifier: entrance.address.entranceAddressId || entrance.address.streetId || entrance.address.localityId || f.properties.uniqueidentifier,
                name: `${entrance.address.street} ${entrance.address.streetNumber}, ${entrance.address.zip} ${entrance.address.locality}`,
                coordinates: new api.GeoCoordinates({
                  longitude: entrance.address.coordinates ? entrance.address.coordinates.longitude : e.lngLat.lng,
                  latitude: entrance.address.coordinates ? entrance.address.coordinates.latitude : e.lngLat.lat,
                }),
                fromMap: true,
              };
              self.$emit('hasEntranceAndBuilding', {
                entrance,
                building: b,
              });
              search.commitSearchedPricePredictAddress(store, <any>suggestion);
              self.clickedShape = entrance.id;

              self.address.name = `${entrance.address.street} ${entrance.address.streetNumber}, ${entrance.address.zip} ${entrance.address.locality}`;
              self.address.uniqueIdentifier = entrance.address.entranceAddressId || entrance.address.streetId || entrance.address.localityId || f.properties.uniqueidentifier;
              self.address.coordinates = new api.GeoCoordinates({
                longitude: entrance.address.coordinates ? entrance.address.coordinates.longitude : e.lngLat.lng,
                latitude: entrance.address.coordinates ? entrance.address.coordinates.latitude : e.lngLat.lat,
              });

              self.setObject(f.properties.uniqueidentifier, null, self.address);
              self.setBuildingShape(b);
            } else {

              search.commitAddressLoading(store, false);
            }
          }

          self.buildingLoading = false;

        }).catch((err) => {
          self.buildingLoading = false;
          search.commitAddressLoading(store, false);
          self.tooltip.remove();
          Vue.prototype.$notify({
            group: 'actions',
            type: 'error',
            duration: 2500,
            text: 'No building found.',
          });

        });
      } else {
        self.buildingLoading = false;
      }
    });

    this.map.on('mouseleave',  (e: any) => {
      try {
        self.map.setPaintProperty(self.lastFsLayerId, self.d3 && !self.satelliteView ? 'fill-extrusion-color' : 'fill-color', ['case',
            ['==', ['get', 'uniqueidentifier'], lastFeatureId], '#cbc7c3',
            ['==', ['get', 'uniqueidentifier'], lastFeatureIdClicked], '#cbc7c3', '#cbc7c3',
        ]);
      } catch {}
    });

    this.map.on('mousemove', (e: any) => {

      if (self.buildingLoading) {
        return;
      }
      let l = self.layersForHover;

      if (self.d3) {
        l = self.layersForHover3d;
      } else {
        if (self.satelliteView) {
          l = self.layersForHoverSatellite;
        }
      }

      const fs = self.map.queryRenderedFeatures(
        e.point, {
          layers: l,
        },
      );

      if (fs.length) {

        const f = fs[0];

        if (f.properties.uniqueidentifier !== lastFeatureId) {
          lastFeatureId = f.properties.uniqueidentifier;
          self.lastFsIdHover = lastFeatureId;
          self.lastFsLayerTypeHover = f.layer.type;
          self.lastFsLayerId = f.layer.id;
          self.map.getCanvas().style.cursor = 'pointer';

          self.map.setPaintProperty(f.layer.id, self.d3 && !self.satelliteView ? 'fill-extrusion-color' : 'fill-color', ['case',
              ['==', ['get', 'uniqueidentifier'], f.properties.uniqueidentifier], '#5a636e',
              ['==', ['get', 'uniqueidentifier'], lastFeatureIdClicked], '#5a636e', '#cbc7c3',
          ]);

        }

      } else {

        try {
          if (lastFeatureIdClicked !== '') {
            self.map.setPaintProperty(self.lastFsLayerId, self.d3 && !self.satelliteView ? 'fill-extrusion-color' : 'fill-color', ['case',
                ['==', ['get', 'uniqueidentifier'], lastFeatureIdClicked], '#5a636e', '#cbc7c3',
            ]);
          } else {
            self.map.setPaintProperty(self.lastFsLayerId, self.d3 && !self.satelliteView ? 'fill-extrusion-color' : 'fill-color', ['case',
                ['==', ['get', 'uniqueidentifier'], lastFeatureId], '#cbc7c3',
                ['==', ['get', 'uniqueidentifier'], lastFeatureIdClicked], '#cbc7c3', '#cbc7c3',
            ]);
          }
        } catch {}
        lastFeatureId = '';
      }
    });

  }

  @Watch('mapLoaded')
  ml() {
    if (this.mapLoaded) {
      this.load();
    }
  }
  @Watch('addressFromAd')
  watchAddressFromAd() {

    if (this.addressFromAd) {
      this.setLayers(this.addressFromAd);
      const self = this;
      setTimeout(() => {
        let l = self.map.project([this.addressFromAd.coordinates.longitude, this.addressFromAd.coordinates.latitude]);
        const fs = self.map.queryRenderedFeatures(l, { layers: this.d3 ? this.layersForHover3d : this.layersForHover });
        if (fs.length) {
          const f = fs[0];
          lastFeatureIdClicked = f.properties.uniqueidentifier;
          lastFeatureId = f.properties.uniqueidentifier;
          l = f.layer.id;
          self.$root.$emit('selectedLayer', f.layer.id);
          self.map.setPaintProperty(this.d3 ? 'av3d' : f.layer.id, this.d3 ? 'fill-extrusion-color' : 'fill-color', ['case',
            ['==', ['get', 'uniqueidentifier'], f.properties.uniqueidentifier], '#5a636e', '#cbc7c3']);
        }
      }, 1500);

    }

  }

}
