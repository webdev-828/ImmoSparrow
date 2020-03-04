import Vue from 'vue';
import Component from 'vue-class-component';
import {
 dispatchGetAgencyAndSave, dispatchGetSavedUser,
 dispatchGetEmployeeByIdAndSave, getAgency,
} from '../store/modules/adminModule';
import store from '../store';

@Component
export default class RedirectMixin extends Vue {
  redirectBack(id: string, from: 'agencies' | 'user' | 'employee' | 'MSRegions') {
    if (from === 'agencies' || from === 'MSRegions') {
      dispatchGetAgencyAndSave(store, id)
        .then(() => {
          this.$router.push({ name: from });
        });
    }  else if (from === 'user') {
      dispatchGetSavedUser(store, id)
        .then(() => {
          this.$router.push({ name: 'users' });
        });
    } else if (from === 'employee') {
      dispatchGetEmployeeByIdAndSave(store, id)
        .then(() => {
          this.$router.push({ name: 'employees' });
        });
    }
  }

  async redirectToAgency() {
    const agency = await getAgency(store);
    dispatchGetAgencyAndSave(store, agency.id)
      .then(() => {
        this.$router.push({ name: 'agencies' });
      });
  }
}
