import Vue from 'vue';
import template from './template.vue';
import { Component, Prop } from 'vue-property-decorator';
import { getBundles } from '../../sharedFunctions';
import { commitSetNoEmployeeStatus } from '../../../store/modules/authStatesModule';
import store from '../../../store';
@Component({
  mixins: [template],
  name: 'FeatureModal',
})
export default class FeatureModal extends Vue {

  getBundles: Function = getBundles;

  @Prop()
  pageName: string;

  @Prop()
  moduleName: string;

  @Prop()
  feature: string;

  cancel() {
    commitSetNoEmployeeStatus(store, undefined);
  }

}
