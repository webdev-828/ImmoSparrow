import Vue from 'vue';
import { Component } from 'vue-property-decorator';
import template from './template.vue';
import store from '@store/index';
import { getAppVersion } from '@/store/modules/globalStatesModule';

@Component({
  name: 'VersionFooter',
  mixins: [template],
})

export default class VersionFooter extends Vue {

  get appVersion () {
    return getAppVersion(store);
  }
}
