import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';
import template from './MarketRadarOverall.vue';
@Component({
  name: 'MarketRadarOverall',
  mixins: [template],
})

export default class MarketRadarOverall extends Vue {
  parcelList: boolean = false;
}
