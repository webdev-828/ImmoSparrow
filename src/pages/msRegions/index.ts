import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';
import template from './MSRegions.vue';
import {
  $agencies, ISearchQueryRangeOfInt32, IAgencyModel,
  AgencyModel, IMsRegionQuery, IMsRegionLightModel,
  ILicensingOptionsModel, $msRegions, $msRegion,
  AgencyNestedModel,
} from '@immosparrow/cockpit-api-v2';
import AgencyProfile from '../../components/agencyProfile';
import { getSavedAgency, commitSetSavedAgency, dispatchGetAgency, getAgency } from '../../store/modules/adminModule';
import store from '../../store';
import * as globalState from '../../store/modules/globalStatesModule';
import AgencyMapComponent from '../../components/map/agency';

interface Filter {
  name: string;
  rule?: ISearchQueryRangeOfInt32;
}

enum FilterValue {
  showAll = 'Show all',
  onlyAvailable = 'Only available',
  notAvailable = 'Not available',
}

@Component({
  name: 'MSRegions',
  mixins: [template],
  components: {
    AgencyProfile,
    AgencyMapComponent,
  },
})

export default class MSRegions extends Vue {
  showMoreAgencies: string = '';
  searchForString: string = '';
  filterAgencyName: string = '';
  textSearch: string = '';
  selectedAgency: IAgencyModel = new AgencyModel;
  totalItemCount: number = 0;
  showSearchAreas: boolean = false;
  searchFinished: boolean = false;
  loading: boolean = false;
  bundles: {id: string, name: string}[] = [];
  selectedBundle: {id: string, name: string} = null;
  msRegionQuery: IMsRegionQuery = {
    maxItemCount: 500,
    availableAgencyCount: undefined,
  };
  filters: Filter[] = [{
    name: FilterValue.showAll,
    rule: undefined,
  }, {
    name: FilterValue.onlyAvailable,
    rule: { min: 1 },
  }, {
    name: FilterValue.notAvailable,
    rule: { max: 0 },
  }];
  selectedFilter: string = FilterValue.showAll;
  msRegions: IMsRegionLightModel[] = [];

  async beforeCreate() {
    const licensingOptions: ILicensingOptionsModel = await $agencies.getLicensingOptions();
    if (licensingOptions) {
      licensingOptions.bundles.forEach((bundle) => {
        if (bundle.id && bundle.name) {
          this.bundles.push({ id: bundle.id, name: bundle.name });
        }
      });
    }
  }

  created() {
    this.$root.$on('showSearchAreas', (value: boolean) => {
      this.showSearchAreas = value;
    });
    this.getMsRegionData();
  }

  async getMsRegionData() {
    this.loading = true;
    this.msRegions = [];
    const result = await $msRegions.find(this.msRegionQuery);
    if (result.items.length) {
      const agency = getSavedAgency(store);
      if (agency) {
        if (agency.created) {
          agency.created.time = new Date(agency.created.time);
        }
        if (agency.updated) {
          agency.updated.time = new Date(agency.updated.time);
        }
        commitSetSavedAgency(store, undefined);
        this.selectedAgency = agency;
        dispatchGetAgency(store, agency.id).then(() => {
          globalState.commitProfileRightSidebar(store, true);
          this.loading = false;
        }).catch(() => this.loading = false);
      } else {
        this.loading = false;
      }
      this.msRegions = result.items;
    } else {
      this.loading = false;
    }
    this.totalItemCount = result.totalItemCount;
    this.searchFinished = !!this.textSearch.length;
  }

  getAvailableAgencies(count: number = 0, maxCount: number = 0): number {
    const res = maxCount - count;
    return res >= 0 ? res : 0;
  }

  async updateAgencyMaxCount(region: IMsRegionLightModel, index: number, newValue: number) {
    const res = await this.$validator.validate(`maxAgencyCount${region.id}.maxAgencyCount`);
    if (res) {
      if (newValue <= 0) {
        this.msRegions[index].maxAgencyCount = 0;
        return;
      }
      const res = await $msRegion(region.id).updateMaxAgencyCount(newValue);
      if (res) {
        this.msRegions[index].maxAgencyCount = newValue;
        if (
          (this.selectedFilter === FilterValue.notAvailable && region.agencyCount <= newValue) ||
          (this.selectedFilter === FilterValue.onlyAvailable && region.agencyCount >= newValue)
        ) {
          this.msRegions.splice(index, 1);
          this.totalItemCount -= 1;
        }
      }
    }
  }

  selectBundle(bundle: {id: string, name: string}) {
    if (this.selectedBundle && (this.selectedBundle.id === bundle.id)) {
      this.msRegionQuery.bundleId = null;
      this.selectedBundle = null;
    } else {
      this.msRegionQuery.bundleId = bundle.id;
      this.selectedBundle = bundle;
    }
    this.getMsRegionData();
  }

  selectAgency(agencyId: string) {
    if (this.selectedAgency.id !== agencyId) {
      dispatchGetAgency(store, agencyId).then(() => {
        this.selectedAgency = getAgency(store);
        globalState.commitProfileRightSidebar(store, true);
      });
    } else {
      this.closeAgency();
    }
  }

  closeAgency() {
    this.selectedAgency = new AgencyModel;
    this.showSearchAreas = false;
  }

  filterByAgency(agency?: AgencyNestedModel) {
    if (agency && this.msRegionQuery.agencyId !== agency.id) {
      this.msRegionQuery.agencyId = agency.id;
      this.filterAgencyName = agency.name;
    } else {
      this.msRegionQuery.agencyId = undefined ;
      this.filterAgencyName = '';
    }
    this.closeAgency();
    this.getMsRegionData();
  }

  filerByAvailableAgencyCount(selected: Filter) {
    if (this.selectedFilter !== selected.name) {
      this.selectedFilter = selected.name;
      this.msRegionQuery.availableAgencyCount = selected.rule;
      this.getMsRegionData();
    }
  }

  searchFor(clean: boolean) {
    if (clean) {
      this.msRegionQuery.text = '';
      this.textSearch = '';
    } else {
      this.msRegionQuery.text = this.textSearch;
    }

    this.getMsRegionData();
  }
}
