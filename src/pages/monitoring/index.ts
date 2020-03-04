import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';
import template from './Monitoring.vue';

@Component({
  name: 'Monitoring',
  mixins: [template],
})
export default class Monitoring extends Vue {
  addMonitorSidebar: boolean = false;
  monitorSidebar: boolean = false;
  loading: boolean = false;
  optionsDemo: {id: number; name: string}[] = [{
    id: 100,
    name: 'House',
  }, {
    id: 200,
    name: 'Apartment',
  }];
  // Type Demo
  types: object = {
    fluctuation: true,
    rentalPrice: false,
    vacancy: false,
    portfolioPrice: false,
  };
  toggleType(what: string) {
    for (const i in this.types) {
      if (i === what) {
        this.types[i] = true;
      } else {
        this.types[i] = false;
      }
    }
  }
  // End Type Demo
}
