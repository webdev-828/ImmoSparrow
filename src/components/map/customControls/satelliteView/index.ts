import Vue from 'vue';
import { Map } from 'mapbox-gl';
import { Component } from 'vue-property-decorator';

@Component({})
export default class SatelliteView extends Vue {
  map: Map;
  container: HTMLElement;
  satelliteView: boolean = false;

  switchStyle () {
    this.satelliteView = !this.satelliteView;
    this.map.setStyle(this.satelliteView ? 'mapbox://styles/ascarix/cjss48toy2o951fpafepitii2' : 'mapbox://styles/mapbox/light-v9');
    this.container.classList.toggle('active');
  }

  onAdd(map: Map) {
    this.map = map;
    this.container = document.createElement('button');
    this.container.classList.add('mapboxgl-ctrl', 'mapboxgl-ctrl-group', 'satellite-but');
    this.container.onclick = this.switchStyle;
    return this.container;
  }

  onRemove() {
    this.container.parentNode.removeChild(this.container);
    this.map = undefined;
  }
}
