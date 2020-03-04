import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';
import template from './Map.vue';
import TheMapbox from '../../components/map/';

@Component({
  mixins: [template],
  components: {
    TheMapbox,
  },
})
export default class Map extends Vue {

  destroyed() {
    const searchedAddress = {
      id: 0,
      lat: 0,
      lng: 0,
    };

    this.$store.commit('searchingFor', searchedAddress);
  }

}
