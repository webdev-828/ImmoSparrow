import Base from '../../base';
import template from './template.vue';
import { Component } from 'vue-property-decorator';
import store from '../../../store';
import { getIsCentralLoading, commitIsCentralLoading } from '../../../store/modules/globalStatesModule';

@Component({
  name: 'SpinnerLoaderComponent',
  mixins: [template],
})

export default class SpinnerLoader extends Base {
  get isLoading() {
    return getIsCentralLoading(store);
  }

  mounted() {
    commitIsCentralLoading(store, false);
  }
}
