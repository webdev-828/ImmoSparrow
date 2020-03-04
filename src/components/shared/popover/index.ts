import template from './template.vue';
import { Vue, Component, Prop } from 'vue-property-decorator';
import { getBundles } from '@/components/sharedFunctions';
import { getEmployeeContext } from '@/store/modules/authStatesModule';
import store from '@/store';

@Component({
  name: 'Popover',
  mixins: [template],
})

export default class Popover extends Vue {

  @Prop()
  bundle: string;

  @Prop()
  feature: string;

  getBundles: Function = getBundles;

  get empCtx () {
    return getEmployeeContext(store);
  }
}
