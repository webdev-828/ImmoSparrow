import Vue from 'vue';
import { Component, Watch } from 'vue-property-decorator';
import template from './PricePrediction.vue';
import AdsMapComponent from '../../components/pricePrediction/map';
import Left from '../../components/pricePrediction/left';
import Right from '../../components/pricePrediction/right';
import BaseComponent from '../../components/base';
import * as api from '@immosparrow/cockpit-api-v2';
import * as globalState from '../../store/modules/globalStatesModule';
import store from '../../store';

@Component({
  mixins: [template],
  components: {
    Left,
    Right,
    amap: AdsMapComponent,
  },
})
export default class PricePrediction extends BaseComponent {

  upgradeMode: boolean = false;
  entranceAndBuilding: { entrance: api.EntranceLightModel, building: api.BuildingModel } = null;
  address: api.GeoSuggestion = new api.GeoSuggestion();
  predicted: boolean = false;
  showBuilding: boolean = false;
  buildingModel: api.BuildingModel = new api.BuildingModel();
  mapIsLoaded: boolean = false;
  created() {
    const self = this;

    this.$root.$on('market_radar_address_changed', (address: api.GeoSuggestion) => {
      self.address = address;
    });
    this.$root.$emit('show_draw_tools', false);

    globalState.commitSetSearchSidebar(store, true);

    this.$root.$on('buildingModelChanged', (data: api.BuildingModel) => {

      if (this.pricePredictSearchedAddress.name === undefined) {
        this.showBuilding = false;
      } else {
        this.showBuilding = true;
        this.buildingModel = data;
      }

      // this was old code if no building is found
      /* if (data.entrances) {
        this.showBuilding = true;
        this.buildingModel = data;

      } else {
        this.showBuilding = false;
        this.predicted = false;
        this.$root.$emit("map_change_size", "big");
        if (document.getElementsByClassName("switch_style").length) {
          document.getElementsByClassName("switch_style")[0].className = "switch_style mapboxgl-ctrl-group mapboxgl-ctrl";
        }
      } */
    });
    this.$root.$on('removePricePrediction', (value: any) => {
      this.predicted = false;
      this.showBuilding = false;
      this.$root.$emit('map_change_size', 'big');
      if (document.getElementsByClassName('switch_style').length) {
        document.getElementsByClassName('switch_style')[0].className = 'switch_style mapboxgl-ctrl-group mapboxgl-ctrl';
      }

    });
    this.$root.$on('pricePredicted', (value: any) => {
      this.predicted = value;
    });
    this.$root.$on('showBuilding', (value: any) => {
      this.showBuilding = value;
    });

    /*this.$root.$on("building", (building: api.BuildingModel) => {
      this.showBuilding = building;
    });*/

  }

  @Watch('pricePredictSearchedAddress', { immediate: true })
  pp() {

    if (this.pricePredictSearchedAddress && this.pricePredictSearchedAddress.name === undefined) {
      Vue.set(this, 'showBuilding', false);
      Vue.set(this, 'predicted', false);
      if (document.getElementsByClassName('switch_style').length) {
        document.getElementsByClassName('switch_style')[0].className = 'switch_style mapboxgl-ctrl-group mapboxgl-ctrl';
      }
      this.$forceUpdate();
    }
  }
  hasEntranceAndBuilding(o: { entrance: api.EntranceLightModel, building: api.BuildingModel }) {
    this.entranceAndBuilding = o;
  }
  addressFromAd: api.GeoSuggestion = null;
  buildingFromAd(o: { building: api.BuildingModel, address: api.GeoSuggestion }) {
    this.buildingModel = o.building;
    this.showBuilding = true;
    this.addressFromAd = o.address;
  }
}
