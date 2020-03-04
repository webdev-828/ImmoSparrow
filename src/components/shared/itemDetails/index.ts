import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';
import template from './template.vue';
import { IPubModel, PubTransactionType, PubPriceChangeType, mval as val, GeoAddressConfidence } from '@immosparrow/cockpit-api-v2';
import GetTimeUtc from '../../getTimeUtc/index';
import {
    formatPrice,
    getPersonName,
    getAddressQuality,
    getVendorClass,
} from '../../sharedFunctions';
import PhoneMixin from '../../../mixins/phoneParser';
import { safeVal } from '@immosparrow/cockpit-lib-core';

@Component({
  name: 'ItemDetails',
  mixins: [template, PhoneMixin],
  components: { GetTimeUtc },
})
export default class ItemDetails extends Vue {

  @Prop()
  item: IPubModel;

  @Prop()
  index: number;

  val: Function = val;
  safeVal: Function = safeVal;

  formatPrice: Function = formatPrice;
  getVendorClass: Function = getVendorClass;
  getAddressQuality: Function = getAddressQuality;
  getPersonName: Function = getPersonName;

  get priceChangeType () {
    return this.val(this.item, (item: IPubModel) => item.trackingInfo.lastTotalPriceChange.totalPriceChangeType);
  }

  get priceIncrease () {
    return PubPriceChangeType[this.priceChangeType] === 'Increase';
  }

  get priceDecrease () {
    return PubPriceChangeType[this.priceChangeType] === 'Decrease';
  }

  get fromUnknownToKnown () {
    return PubPriceChangeType[this.priceChangeType] === 'FromUnknownToKnown';
  }

  get addressConfidence () {
    const conf = this.val(this.item, (item: IPubModel) => item.address.confidence);
    return conf ? GeoAddressConfidence[conf] : undefined;
  }

  get transactionType() {
    return this.item ? PubTransactionType[this.item.primaryInfo.basicInfo.transactionType] : null;
  }
}
