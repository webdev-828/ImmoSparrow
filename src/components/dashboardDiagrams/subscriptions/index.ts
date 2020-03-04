import Vue from 'vue';
import Component, { mixins } from 'vue-class-component';
import template from './index.template.vue';
import DashboardMixin from '../../../mixins/dashboard';
import * as api from '@immosparrow/cockpit-api-v2';

@Component({
  name: 'Subscriptions',
  mixins: [template],
})
export default class Subscriptions extends mixins(DashboardMixin) {
  leadGens: api.ILeadGenFilterLightModel[] = [];
  totalCount: number = 0;

  gettingData: boolean = false;

  mounted () {
    this.getData();
  }

  async getData() {
    if (!this.gettingData) {
      this.gettingData = true;
      const result = await api.$leadGenFilters.find({
        sort: '-createdTime,+totalItemCount',
        maxItemCount: 5,
        enabledStatus: api.EntitySearchQueryEnabledStatus.Enabled,
      });
      this.gettingData = false;
      if (result) {
        this.resetData();
        this.totalCount = result.totalItemCount;
        this.leadGens = result.items;
      }
    }
  }

  resetData() {
    this.totalCount = 0;
    this.leadGens = [];
  }
}
