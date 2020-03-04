import Vue from 'vue';
import { Component } from 'vue-property-decorator';
import Profile from '../../components/profile';
import BaseComponent from '../../components/base';
import template from './AgencyProfile.vue';
import store from '../../store';
import * as globalState from '../../store/modules/globalStatesModule';
import * as adminModule from './../../store/modules/adminModule';
import { getUserContext, getEmployeeContext } from './../../store/modules/authStatesModule';
import { $newObj, EmployeeRole, AgencyModel, IUserContextModel,
  IAgencyModel, mval as val } from '@immosparrow/cockpit-api-v2';
import { Tab1, Tab2, Tab3, Tab4 } from '../../components/agencyProfileTabs';

@Component({
  name: 'UserProfileComponent',
  mixins: [template],
  components: {
    Profile, Tab1, Tab2, Tab3, Tab4,
  },
})

export default class UserProfileComponent extends BaseComponent {

  userAgency: IAgencyModel = $newObj(AgencyModel);
  val: Function = val;

  async mounted() {
    this.userAgency = await adminModule.getAgency(store);
    this.toggle(this.isOwner || this.isAdmin ? 'profileGlobal' : 'profileTempaltes');
    globalState.commitSetSearchSidebar(store, true);
  }

  get isOwner() {
    const ctx = getUserContext(store);
    return this.val(this.userAgency, (agency: IAgencyModel) => agency.ownerUser.id, '') === ctx.identity.id;
  }

  get isAdmin() {
    const ctx = getEmployeeContext(store);
    const userContext = getUserContext(store);
    return ctx.employee.role === EmployeeRole.Admin || (this.val(userContext, (userContext: IUserContextModel) => userContext.access.globalPermissions.agencies.readList));
  }
}
