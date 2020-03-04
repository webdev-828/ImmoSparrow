import { Component, Prop, Vue } from 'vue-property-decorator';
import template from './SimilarObjectPreviewTemplate.vue';
import { Publication } from '@/models';
import { PubLightModel } from '@immosparrow/cockpit-api-v2';
import { setSelectedAd } from '@store/modules/marketRadar';
import store from '@store/index';
import { getMainCategory1, formatPrice, getGoogleStreetViewImage } from '@components/sharedFunctions';
import GetTimeUtc from '@components/getTimeUtc';
import { EventBus } from '../../../../../../EventBus';

@Component({
  mixins: [template],
  components: {
    GetTimeUtc,
  },
})
export default class AdPreview extends Vue {
  @Prop({ required: true })
  ad: Publication;

  photo: string = 'static/img/house-placeholder-scaled.png';
  getMainCategory: Function = getMainCategory1;
  formatPrice: Function = formatPrice;

  get isActive() {
    return this.ad?.trackingInfo?.publicationInterval?.isActive;
  }
  get addressQuality() {
    return this.ad?.address?.quality;
  }
  get zip() {
    return this.ad?.address?.zip;
  }
  get locality() {
    return this.ad?.address?.locality;
  }
  get totalPriceCalculated() {
    return this.ad?.financialInfo?.totalPriceCalculated;
  }
  get currencyValue() {
    return this.ad?.financialInfo?.currency?.value;
  }
  get publicationTimeUTC(): Date | null {
    return this.ad?.trackingInfo?.publicationInterval?.publicationTimeUtc || null;
  }
  get street() {
    return this.ad?.address?.street;
  }
  get streetNumber() {
    return this.ad?.address?.streetNumber;
  }
  get propertyCategory() {
    return this.ad?.primaryInfo?.basicInfo?.propertyCategory;
  }

  created() {
    if (!this.ad?.pictures?.length) {
      getGoogleStreetViewImage(this.ad.address.coordinates.latitude, this.ad.address.coordinates.longitude).then((data: string) => {
        this.photo = data;
      });
    }
  }

  openAd(ad: PubLightModel) {
    setSelectedAd(store, ad);
    EventBus.$emit('map:highlight', ad.id);
  }
  shortenTitle(title: string) {
    if (title?.length >= 60) {
      return `${title.substring(0, 60)}...`;
    }
    return title;
  }
}
