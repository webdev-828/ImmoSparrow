import { Component, Prop, Vue } from 'vue-property-decorator';
import template from './AdPreview.vue';
import GetTimeUtc from '@components/getTimeUtc';
import { PubLightModel } from '@immosparrow/cockpit-api-v2';
import { formatDate, formatPrice } from '@components/sharedFunctions';
import { setSelectedAd } from '@store/modules/marketRadar';
import store from '@store';

@Component({
  mixins: [template],
  components: {
    GetTimeUtc,
  },
})
export default class Ads extends Vue {
  @Prop({ required: true })
  ad: PubLightModel;

  openAd(ad: PubLightModel) {
    setSelectedAd(store, ad);
  }
  formatDate(date: Date) {
    return formatDate(date);
  }
  formatPrice(price: number) {
    return formatPrice(price);
  }
  adTimestamp(ad: PubLightModel) {
    return ad?.trackingInfo?.publicationInterval?.publicationTimeUtc;
  }
  publicationTimeUtc(ad: PubLightModel) {
    return ad?.trackingInfo?.publicationInterval?.publicationTimeUtc;
  }
  deleteTimeUTC(ad: PubLightModel) {
    return ad?.trackingInfo?.publicationInterval?.deleteTimeUtc;
  }
  lastUpdateTime(ad: PubLightModel) {
    return ad?.trackingInfo?.publicationInterval?.lastUpdateTimeUtc;
  }
  publicationTime(ad: PubLightModel) {
    return ad?.trackingInfo?.publicationInterval?.publicationTimeUtc;
  }
  totalPriceCalculated(ad: PubLightModel) {
    return ad?.financialInfo?.totalPriceCalculated;
  }
  currencyValue(ad: PubLightModel) {
    return ad?.financialInfo?.currency?.value;
  }
}
