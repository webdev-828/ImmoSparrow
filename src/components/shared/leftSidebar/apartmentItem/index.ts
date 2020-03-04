import { Component, Prop } from 'vue-property-decorator';
import { mixins } from 'vue-class-component';
import template from './ApartmentItemTemplate.vue';
import MarketRadarMixin from '@/mixins/marketRadar';
import { ApartmentLightModel } from '@immosparrow/cockpit-api-v2';
import { safeVal } from '@immosparrow/cockpit-lib-core';

@Component({
  mixins: [template],
})
export default class ApartmentItem extends mixins(MarketRadarMixin) {
  @Prop({ required: true })
  apartment: ApartmentLightModel;
  @Prop({ default: false })
  selected: boolean;

  safeVal: Function = safeVal;

  selectApartment() {
    this.$emit('apartmentSelected', this.apartment);
  }
}
