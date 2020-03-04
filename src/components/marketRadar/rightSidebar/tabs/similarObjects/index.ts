import { Component, Watch } from 'vue-property-decorator';
import { mixins } from 'vue-class-component';
import template from './SimilarObjectsTemplate.vue';
import { Publication } from '@/models';
import store from '@/store';
import { getSimilarObjects, getPricePrediction, getSelectedAd } from '@store/modules/marketRadar';
import SimilarObjectPreview from './similarObjectPreview';
import GlobalMixin from '@/mixins/global';
import { EventBus } from '@/EventBus';
import { PubLightModel } from '@immosparrow/cockpit-api-v2';

@Component({
  mixins: [template],
  components: {
    SimilarObjectPreview,
  },
})
export default class SimilarObjects extends mixins(GlobalMixin) {
  allSelected: boolean = true;

  get ads(): Publication[] {
    return getSimilarObjects(store);
  }
  get selectedAd(): PubLightModel {
    return getSelectedAd(store);
  }
  get selectedAds(): Publication[] {
    return this.ads.filter((ad: Publication) => {
      return ad.selected;
    });
  }
  get prediction() {
    return getPricePrediction(store);
  }

  selectAd(ad: Publication) {
    ad.selected = !ad.selected;
  }

  @Watch('allSelected', { immediate: true })
  onAllSelectedChange() {
    this.ads.forEach((ad: Publication) => {
      ad.selected = this.allSelected;
    });
  }

  highlightOnMap(id?: string) {

    if (id == null && this.selectedAd != null) {
      return;
    }
    EventBus.$emit('map:highlight', id);
  }
}
