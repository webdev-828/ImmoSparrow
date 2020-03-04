import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';
import template from './template.vue';
import MapBox from 'mapbox-gl-vue';
import mapboxgl from 'mapbox-gl';
import { SatelliteView } from '../../../map/customControls';

@Component({
  mixins: [template],
  components: {
    mapbox: MapBox,
  },
})
export default class ListMap extends Vue {

  @Prop({ default: null })
    coordinates: any;

  map: any;
  markers: any = [];

  mapInitialized(map: mapboxgl.Map) {
    this.map = map;

  }

  clearMarkers() {
    if (this.markers.length > 0) {
      this.markers.forEatch((item: any) => {
        item.remove();
      });
    }
  }

  loaded () {
    this.clearMarkers();
    const marker = new mapboxgl.Marker()
      .setLngLat([this.coordinates.longitude, this.coordinates.latitude])
      .addTo(this.map);
    this.map.dragRotate.disable();
    this.map.touchZoomRotate.disableRotation();
    this.map.setCenter([this.coordinates.longitude, this.coordinates.latitude]);
    this.map.panTo([this.coordinates.longitude, this.coordinates.latitude]);
    this.map.addControl(new mapboxgl.FullscreenControl());
    this.map.addControl(new SatelliteView(), 'bottom-right');
  }
}
