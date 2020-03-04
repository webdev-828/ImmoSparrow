import { Component, Watch } from 'vue-property-decorator';
import { mixins } from 'vue-class-component';
import template from './RightTemplate.vue';
import {
  $pubs,
  PubStatsPricesModel,
  IPropertyEnvironmentInfo,
  PubLightModel,
  BuildingModel,
  $entrance, Entrance, EntranceRatingsModel,
} from '@immosparrow/cockpit-api-v2';
import * as MRStore from '@store/modules/marketRadar';
import { getRightSidebarActiveTab, setIsEnabledRightSidebar } from '@store/modules/sidebars';
import { getSearchedAddress, setSearchedAddress } from '@store/modules/main';
import store from '@store';
import { commitSetStatusDBModal } from '@store/modules/searchModule';
import GlobalMixin from '@/mixins/global';
import ObjectComponent from '@components/searchModule/object';
import OverviewTab from './tabs/overview';
import AdsHistoryTab from './tabs/ads';
import AnalyticsTab from './tabs/analytics';
import SimilarObjectsTab from './tabs/similarObjects';
import ConstructionSitesTab from './tabs/constructionSites';
import DocumentationTab from './tabs/documentation';
import Neighborhood from '@components/shared/neighborhood';
import { Publication } from '@/models';
import { EventBus } from '../../../EventBus';
import FeatureChecks from '@/mixins/featureChecks';
import BundleChecks from '@/mixins/bundleChecks';

@Component({
  mixins: [template],
  components: {
    ObjectComponent,
    OverviewTab,
    AdsHistoryTab,
    AnalyticsTab,
    SimilarObjectsTab,
    ConstructionSitesTab,
    DocumentationTab,
    Neighborhood,
  },
})
export default class RightBar extends mixins(GlobalMixin, FeatureChecks, BundleChecks) {
  environmentInfo: IPropertyEnvironmentInfo = null;
  neighborhoodPopover: boolean = false;

  get selectedAd(): PubLightModel {
    return MRStore.getSelectedAd(store);
  }
  get buildingInfo(): BuildingModel {
    return MRStore.getBuildingInfo(store);
  }
  get searchedAddress() {
    return getSearchedAddress(store);
  }
  get ads() {
    return MRStore.getAds(store);
  }
  get activeTab() {
    return getRightSidebarActiveTab(store);
  }
  get activeTabL1(): string {
    return this.activeTab.level1;
  }
  get activeTabL2(): string {
    return this.activeTab.level2;
  }
  get prediction() {
    return MRStore.getPricePrediction(store);
  }
  get statistics() {
    return MRStore.getStatistics(store);
  }
  get similarObjects(): Publication[] {
    return MRStore.getSimilarObjects(store);
  }
  get selectedObjects(): Publication[] {
    if (!this.similarObjects) return [];
    return this.similarObjects.filter(x => x.selected);
  }
  get entranceRatings(): EntranceRatingsModel {
    return MRStore.getEntranceRatings(store);
  }

  created() {
    this.setActiveTab('overview', 1, true);
    MRStore.dispatchGetPropertyCategories(store);
  }

  unselectAd() {
    MRStore.setSelectedAd(store, null);
    EventBus.$emit('map:highlight', null);
  }
  reset() {
    setIsEnabledRightSidebar(store, false);
    setSearchedAddress(store, null);
    MRStore.dispatchReset(store);

  }
  closeDBModal() {
    commitSetStatusDBModal(store, false);
  }
  getGraph(lang: string) {
    return `static/img/misc/db-graph-${lang}.png`;
  }

  @Watch('selectedObjects')
  onSelectedObjectsChanged() {
    if (!this.selectedObjects.length) return;
    MRStore.setPredictionIsLoading(store, true);
    const ids = this.selectedObjects.map(x => x.id);
    $pubs.stats.getPubPrices(ids).then((statistics: PubStatsPricesModel) => {
      MRStore.setAdsStatisticModel(store, statistics);
    });
    MRStore.setPredictionIsLoading(store, false);
  }
  @Watch('searchedAddress')
  async onSearchedAddressChanged() {
    if (this.searchedAddress && this.searchedAddress.uniqueIdentifier) {
      const entranceRatings = await $entrance(this.searchedAddress.uniqueIdentifier).getEntranceRatings();
      if (entranceRatings) {
        MRStore.setEntranceRatings(store, entranceRatings);
      } else {
        MRStore.setEntranceRatings(store, null);
      }
    }
  }
}
