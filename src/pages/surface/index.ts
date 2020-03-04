import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';
import template from './Surface.vue';
@Component({
  name: 'Surface',
  mixins: [template],
})

export default class Surface extends Vue {
  parcelDetails: boolean = false;
  parcelList: boolean = false;
}
