import Component from 'vue-class-component';
import Vue from 'vue';
import { UserDevAccessLevel } from '@immosparrow/cockpit-api-v2';
import store from '@store/index';
import { getShowNewFeatures } from '@/store/modules/globalStatesModule';
import { getUserContext, getEmployeeContext } from '@/store/modules/authStatesModule';

@Component
export default class FeatureChecks extends Vue {

  get currentEmployee () {
    return getEmployeeContext(store).employee;
  }

  get newFeatures () {
    return getShowNewFeatures(store);
  }

  get alphaFeature () {
    return this.newFeatures && getUserContext(store).devSettings && getUserContext(store).devSettings.accessLevel !== UserDevAccessLevel.Beta;
  }

  get betaFeature () {
    return this.newFeatures && getUserContext(store).devSettings;
  }
}
