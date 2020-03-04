import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';
import template from './template.vue';
import { IPipelineEntryLightModel, mval as val } from '@immosparrow/cockpit-api-v2';
import { displayAddress, formatPrice } from '../../../components/sharedFunctions';
@Component({
  name: 'BasicInfo',
  mixins: [template],
})

export default class BasicInfo extends Vue {

  @Prop({ default: null })
  item: IPipelineEntryLightModel;

  displayAddress: Function = displayAddress;
  formatPrice: Function = formatPrice;
  val: Function = val;

  sectionRelated: boolean = true;
}
