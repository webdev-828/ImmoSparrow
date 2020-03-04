import Vue from 'vue';
import { Component } from 'vue-property-decorator';
import template from './template.vue';
import VueIntercom from 'vue-intercom';
Vue.use(VueIntercom, { appId: process.env.intercom });
import * as auth from './../../store/modules/authStatesModule';
import store from '../../store';
import { $authUser, IUserContextModel, IUserProfileModel, IUserWorkspaceContextModel } from '@immosparrow/cockpit-api-v2';
@Component({
  name: 'IntecomComponent',
  mixins: [template],
})

export default class IntecomComponent extends Vue {

  fullName: string;

  $intercom: any;

  mounted() {

    this.$root.$on('showIntercom', () => {
      this.show_intercom();
    });

    $authUser.profile.get()
    .then((profile: IUserProfileModel) => {
      auth.commitSetLoggedInUser(store, profile);
      const context: IUserWorkspaceContextModel = auth.getEmployeeContext(store);
      const userContext: IUserContextModel = auth.getUserContext(store);

      let company = null;
      const boot: any = {
        user_id: profile.id,
        name: `${profile.primaryInfo.firstName} ${profile.primaryInfo.lastName}`,
        email: profile.email,
      };

      boot.accessLevel = userContext?.devSettings?.accessLevel;

      if (context) {
        company = {
          id: context.agency.id,
          name: context.agency.name,
        };

        // workspace = context.workspace.name;

        boot.company = company;
        // boot.workspace = workspace;
      }
      try {
        this.$intercom.boot(boot);
      } catch {}
    });
  }
  show_intercom() {
    this.$intercom.visible ? this.$intercom.hide() : this.$intercom.show();
  }
}
