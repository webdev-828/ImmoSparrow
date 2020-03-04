import { Component, Watch } from 'vue-property-decorator';
import MapComponent from '../map';
import { cc } from '../map/radius';
import store from '@store';
import { getSearchedAddress } from '@/store/modules/main';
import { getMapPoint } from '@/store/modules/map';
import { EventBus } from '@/EventBus';
import { MapShape } from '@/models';

@Component({
  mixins: [],
  components: {},
})
export default class AdsMapComponent extends MapComponent {
  created() {
    EventBus.$on('map:drawRadiusAroundPoint', this.drawRadiusAroundPoint);
    EventBus.$on('map:removeRadiusPoint', this.removeRadiusPoint);
    EventBus.$on('map:drawShape', this.drawShape);
    EventBus.$on('map:removeShape', this.removeShape);
  }

  get searchedAddress() {
    return getSearchedAddress(store);
  }
  get mapPoint() {
    return getMapPoint(store);
  }

  loadMap() { }
  drawShape(shape: MapShape) {
    this.map.addSource(shape.id, {
      type: 'geojson',
      data: shape.geom,
    });
    const polygonLayer = {
      id: shape.id,
      type: 'fill',
      source: shape.id,
      paint: {
        'fill-color': '#87CEEB',
        'fill-opacity': 0.6,
      },
      properties: {
        type: 'withSourceId',
      },
    };
    this.map.addLayer(polygonLayer, this.layersForHover[0]);
    this.mapLayerIds.push(shape.id);
  }
  removeShape(id: string) {
    if (this.map.getSource(id) || this.map.getLayer(id)) {
      this.map.removeLayer(id);
      this.map.removeSource(id);
    }
  }
  drawRadiusAroundPoint(radius: number) {
    try {
      this.map.removeLayer('radius');
      this.map.removeSource('radius');
    } catch { }

    let source = null;
    if (this.searchedAddress.coordinates) {
      source = cc([this.searchedAddress.coordinates.longitude, this.searchedAddress.coordinates.latitude], radius);
    } else {
      const c = this.mapPoint.coordinates;
      source = cc([c.longitude, c.latitude], radius);
    }

    const circleLayer = {
      source,
      id: 'radius',
      type: 'fill',
      layout: {},
      paint: {
        'fill-color': '#d61683',
        'fill-opacity': 0.3,
        'fill-outline-color': '#ccc',
      },
      'data.uniqueIdentifier': { id: this.searchedAddress.uniqueIdentifier },
    };
    this.map.addLayer(circleLayer, this.layersForHover[0]);
    this.$emit('radiusSource', source.data.features[0].geometry);
  }
  removeRadiusPoint() {
    try {
      this.map.removeLayer('radius');
      this.map.removeSource('radius');
    } catch { }
  }

  @Watch('mapLoaded')
  onMapLoadedChanged() {
    if (this.mapLoaded) {
      this.loadMap();
    }
  }

  @Watch('mapPoint')
  watchMarketRadarPoint() {
    const geojson = {
      type: 'FeatureCollection',
      features: [{
        type: 'Feature',
        geometry: {
          type: 'Point',
          coordinates: [this.mapPoint.coordinates.longitude, this.mapPoint.coordinates.latitude],
        },
      }],
    };
    const pointSource = {
      type: 'geojson',
      data: geojson,
    };
    const pointLayer = {
      id: this.mapPoint.id,
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
    try {
      this.map.removeLayer('marketRadarPoints');
      this.map.removeSource('marketRadarPointsSource');
    } catch { }

    this.map.setZoom(18);
    this.mapZoom = 18;
    this.map.setCenter([this.mapPoint.coordinates.longitude, this.mapPoint.coordinates.latitude]);
  }
}
