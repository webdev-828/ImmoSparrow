import { Component } from 'vue-property-decorator';
import template from './template.vue';
import { Noise, NeighborhoodView, Connectivity, Poi, Immissions, Education, Overview, Shopping } from './tabs';
import store from '@store';
import RadialProgress from '@components/transparencyModule/radial.progress.vue';
import { getRightSidebarActiveTab, setSidebarActiveTab } from '@store/modules/sidebars';
import GlobalMixin from '@/mixins/global';
import { mixins } from 'vue-class-component';
import { EntranceRatingsModel } from '@immosparrow/cockpit-api-v2';
import { getEntranceRatings } from '@store/modules/marketRadar';
import FeatureChecks from '@/mixins/featureChecks';

@Component({
  mixins: [template],
  components: {
    Noise,
    NeighborhoodView,
    Connectivity,
    Shopping,
    Overview,
    Immissions,
    Education,
    Poi,
    'radial-progress-bar': RadialProgress,
  },
})
export default class Neighborhood extends mixins(GlobalMixin, FeatureChecks) {
  get entranceRatings(): EntranceRatingsModel {
    return getEntranceRatings(store);
  }
  get activeTab() {
    return getRightSidebarActiveTab(store);
  }
  get activeTabL2(): string {
    return this.activeTab.level2;
  }

  mounted() {
    this.setActiveTab('overview', 2, true);
  }
}
