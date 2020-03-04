import { Component, Vue } from 'vue-property-decorator';
import template from '@components/marketRadar/rightSidebar/tabs/ads/AdsTemplate.vue';
import { getAds } from '@store/modules/marketRadar';
import store from '@store';
import AdPreview from '@components/marketRadar/rightSidebar/tabs/ads/adPreview';
import { PubLightModel } from '@immosparrow/cockpit-api-v2';

@Component({
  mixins: [template],
  components: {
    AdPreview,
  },
})
export default class Ads extends Vue {
  adsToShow: string = 'all';

  get ads(): PubLightModel[] {
    return getAds(store);
  }
  get adsFiltered(): PubLightModel[] {
    if (this.adsToShow === 'active') {
      return this.ads.filter((ad) => {
        return ad?.trackingInfo?.publicationInterval?.isActive || false;
      });
    }
    if (this.adsToShow === 'inactive') {
      return this.ads.filter((ad) => {
        return !ad?.trackingInfo?.publicationInterval?.isActive || false;
      });
    }
    return this.ads;
  }

  showAds(adsToShow: string) {
    this.adsToShow = adsToShow;
  }
}
