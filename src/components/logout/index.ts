import Vue from 'vue';
import { Component } from 'vue-property-decorator';
import store from '../../store';
import template from './template.vue';
import * as auth from '../../store/modules/authStatesModule';

@Component({
  mixins: [template],
})
export default class Logout extends Vue {

  created () {
    setTimeout(() => {
      auth.dispatchLogout(store);
    },         localStorage.getItem('fromRoute') === 'Pipe' ? 1000 : 0);
  }

}
