import { Component, Watch, Prop } from 'vue-property-decorator';
import * as search_ from './../../store/modules/searchStatesModule';
import store from '../../store';
import polylabel from 'polylabel';
import {
  commitSearchingForTransparency, commitSearchedAddressBuilding,
  commitResetState, commitAddressLoading, commitObjectWindow, commitSidebar,
} from '../../store/modules/searchStatesModule';
import { setTimeout } from 'timers';
import MapComponent from './index';
import mapboxgl from 'mapbox-gl';
import * as api from '@immosparrow/cockpit-api-v2';

@Component({
  mixins: [],
  components: {},
})

export default class TransparencyMapComponent extends MapComponent {

  lastFsIdHover: string = '';
  lastFsLayerTypeHover: string = '';

  @Prop()
  address: api.GeoSuggestion;

  created() {

    const self = this;

  }

  destroyed() {
    search_.commitResetState(store);
  }

  ready() {
    window.onbeforeunload = function () {
      search_.commitResetState(store);
    };

  }

  setTransparencyLayers(address: any) {

    const self = this;

    try {

      const result = self.transparencyObject(address.uniqueIdentifier, null);
      result.then((data: api.BuildingModel) => {
        self.getBuilding(data);
        // search_.commitResetState(store);

      });

    } catch (err) {
      search_.commitResetState(store);
    }
  }

  getBuilding(result: api.BuildingModel) {

    const self = this;
    const i = setInterval(() => {
      if (self.map.loaded()) {
        clearInterval(i);
      }
    },                    1);

    try {
      const polygonLayerProperty = {
        id: 'transparencyObjectProperty',
        type: 'fill',
        source: {
          type: 'geojson',
          data: {
            type: 'Feature',
            geometry: {
              type: 'Polygon',
              coordinates: this.convertGeoJsonToPolygon(result.realProperty.primaryInfo.geom),
            },
          },
        },
        properties: {
          id: result.id,
        },
        layout: {},
        paint: {
          'fill-color': '#4e5051',
          'fill-opacity': 0.3,
          'fill-outline-color': '#000',
        },
      };

      if (this.map.getLayer('transparencyObjectProperty') !== undefined) {

        this.map.getSource('transparencyObjectProperty').setData({
          type: 'Feature',
          geometry: {
            type: 'Polygon',
            coordinates: this.convertGeoJsonToPolygon(result.realProperty.primaryInfo.geom),
          },
        });

      } else {

        setTimeout(() => {
          self.map.addLayer(polygonLayerProperty);
        },         parseInt(i.valueOf().toString()));

      }

      const polygonLayer = {
        id: 'transparencyObject',
        type: 'fill',
        source: {
          type: 'geojson',
          data: {
            type: 'Feature',
            geometry: {
              type: 'Polygon',
              coordinates: this.convertGeoJsonToPolygon(result.primaryInfo.geom),
            },
          },
        },
        properties: {
          id: result.id,
        },
        layout: {},
        paint: {
          'fill-color': '#dd3e33',
          'fill-opacity': 1,
          'fill-outline-color': '#000',
        },
      };

      if (this.map.getLayer('transparencyObject') !== undefined) {

        this.map.getSource('transparencyObject').setData({
          type: 'Feature',
          geometry: {
            type: 'Polygon',
            coordinates: this.convertGeoJsonToPolygon(result.primaryInfo.geom),
          },
        });

      } else {

        setTimeout(() => {
          self.map.addLayer(polygonLayer);
        },         parseInt(i.valueOf().toString()));

      }

      if (result.entrances.length > 1) {

      } else {

      }

      commitSearchedAddressBuilding(store, result);
    } catch (err) {
    }

    commitAddressLoading(store, false);

  }

  async transparencyObject(id: string, e: any) {

    const result: api.IBuildingModel = await api.$building(id).get();
    return (<api.BuildingModel>result);

  }

  mounted() {
    // search_.commitResetState(store);
  }

  @Watch('mapLoaded')
  msl() {

    const self = this;
    let lastFeatureId: any;

    this.map.on('mousemove', 'av', (e: any) => {

      const fs = self.map.queryRenderedFeatures(e.point, { layers: ['av'] });

      if (fs.length) {

        const f = fs[0];

        if (f.properties.uniqueidentifier !== lastFeatureId) {
          lastFeatureId = f.properties.uniqueidentifier;
          self.lastFsIdHover = lastFeatureId;
          self.lastFsLayerTypeHover = f.layer.type;
          self.map.getCanvas().style.cursor = 'pointer';
          if (f.layer.type !== 'fill-extrusion') {
            self.map.setPaintProperty('av', 'fill-color', ['case', ['==', ['get', 'uniqueidentifier'], f.properties.uniqueidentifier], '#dd3e33', '#9ac5d5']);
          } else {
            self.map.setPaintProperty('av', 'fill-extrusion-color', ['case', ['==', ['get', 'uniqueidentifier'], f.properties.uniqueidentifier], '#dd3e33', '#9ac5d5']);
          }
        }
      }
    });

    self.map.on('mouseleave', 'av', () => {

      if (self.lastFsLayerTypeHover !== 'fill-extrusion') {
        self.map.setPaintProperty('av', 'fill-color', ['case', ['==', ['get', 'uniqueidentifier'], self.lastFsIdHover], '#9ac5d5', '#9ac5d5']);
      } else {
        self.map.setPaintProperty('av', 'fill-extrusion-color', ['case', ['==', ['get', 'uniqueidentifier'], self.lastFsIdHover], '#9ac5d5', '#9ac5d5']);
      }
      self.lastFsIdHover = '';
      self.lastFsLayerTypeHover = '';
      lastFeatureId = '';
      // map.setPaintProperty("av", "fill-color", "#499bbc");
    });

    self.map.on('mouseleave', 'av', () => {
      self.map.getCanvas().style.cursor = '';

    });

    self.map.on('click', 'av', (e: any) => {
      commitAddressLoading(store, true);
      const result = self.transparencyObject(e['features'][0].properties.uniqueidentifier, e);

      result.then((data: api.BuildingModel) => {
        self.getBuilding(data);
        // search_.commitResetState(store);
        self.map.setZoom(18);
      });

    });

  }

  get mapLoadedAndTransparencyAddress() {
    return {
      mapLoaded: this.mapLoaded,
      address: this.transparencySearchedAddress,
    };
  }

  @Watch('mapLoadedAndTransparencyAddress')
  kk() {
    const self = this;
    const address = this.mapLoadedAndTransparencyAddress.address;
    const mapLoaded = this.mapLoadedAndTransparencyAddress.mapLoaded;

    if (mapLoaded) {
      if (address.name !== undefined) {

        commitAddressLoading(store, true);
        // self.add_to_history(address);

        this.map.setCenter([address.coordinates.longitude, address.coordinates.latitude]);
        this.map.flyTo([address.coordinates.longitude, address.coordinates.latitude]);
        this.map.setZoom(18);
        self.setTransparencyLayers(address);

      }
    }

  }

  @Watch('searchedAddressBuilding')
  watchSearchedAddressBuilding() {
    try {
      this.map.removeLayer('transparencyObjectProperty');
      this.map.removeLayer('transparencyObject');
      this.map.removeSource('transparencyObject');
      this.map.removeSource('transparencyObjectProperty');
    } catch  {

    }
  }

}
