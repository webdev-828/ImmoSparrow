import Vue from 'vue';
import { Component } from 'vue-property-decorator';
import template from './tab2.template.vue';
import Base from '../../base';
import validation from '../data/validation';
import * as api from '@immosparrow/cockpit-api-v2/lib/public/users/auth-user';

@Component({
  name: 'Tab2',
  mixins: [template],
})

export default class Tab2 extends Base {
  currentPassword: string = '';
  newPassword: string = '';

  mounted() {
    this.$validator.dictionary.merge(validation);
  }

  updatePassword({ target }: {target: HTMLFormElement}) {
    this.$validator.validateAll().then((isValid) => {
      if (isValid) {
        api.$authUser.profile.changePassword(this.currentPassword, this.newPassword).then((updated) => {
          Vue.prototype.$notify({
            group: 'actions',
            type: updated ? 'success' : 'error',
            duration: 2500,
            text: updated ? 'Password was updated' : 'Current password is incorrect',
          });
          target.reset();
        });
      }
    });
  }
}
