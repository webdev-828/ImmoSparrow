import Vue from 'vue';
import template from './template.vue';
import { Component, Prop } from 'vue-property-decorator';
import { getBundles } from '../../sharedFunctions';
import { getEmployeeContext } from '@/store/modules/authStatesModule';
import store from '@/store';
@Component({
  mixins: [template],
  name: 'UpgradeModal',
})
export default class UpgradeModal extends Vue {

  getBundles: Function = getBundles;

  @Prop()
  name: string;

  @Prop()
  feature: string;

  get empCtx () {
    return getEmployeeContext(store);
  }

}
