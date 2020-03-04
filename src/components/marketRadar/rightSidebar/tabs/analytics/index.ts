import { Component } from 'vue-property-decorator';
import { mixins } from 'vue-class-component';
import template from './AnalyticsTemplate.vue';
import store from '@store';
import { getRightSidebarActiveTab } from '@/store/modules/sidebars';
import GlobalMixin from '@/mixins/global';
import PriceAnalyticsTab from './price';
import ObjectAnalyticsTab from './object';
import MarketAnalyticsTab from './market';

@Component({
  mixins: [template],
  components: {
    PriceAnalyticsTab,
    ObjectAnalyticsTab,
    MarketAnalyticsTab,
  },
})
export default class AnalyticsTab extends mixins(GlobalMixin) {
  get activeTab() {
    return getRightSidebarActiveTab(store);
  }
  get activeTabL1(): string {
    return this.activeTab.level1;
  }
  get activeTabL2(): string {
    return this.activeTab.level2;
  }

  mounted() {
    this.setActiveTab('price', 2, true);
  }
}
