import { Component, Watch } from 'vue-property-decorator';
import template from './Transparency.vue';
import TransparencyMap from '../../components/map/transparency';
import LeftSidebar from '../../components/transparencyModule/left';
import RightSidebar from '../../components/transparencyModule/right';
import BaseComponent from '../../components/base';
import * as api from '@immosparrow/cockpit-api-v2';
import store from '../../store';
@Component({
  store,
  mixins: [template],
  components: {
    TransparencyMap,
    LeftSidebar,
    RightSidebar,
  },
})
export default class Transparency extends BaseComponent {

  address: api.GeoSuggestion = new api.GeoSuggestion();
  showEntrence: boolean = false;
  object: api.BuildingModel = new api.BuildingModel();
  created() {
    const self = this;

    this.$root.$on('transparency_address_changed',  (address: api.GeoSuggestion) => {
      self.address = address;
    });

  }
  @Watch('searchedAddressBuilding', { immediate: true })
  searched() {
    this.object = this.searchedAddressBuilding;
  }

}
