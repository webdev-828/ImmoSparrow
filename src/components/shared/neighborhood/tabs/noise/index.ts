import { Component, Prop } from 'vue-property-decorator';
import template from './template.vue';
import { commitSetStatusDBModal } from '@store/modules/searchModule';
import store from '@store';
import RadialProgress from '@components/transparencyModule/radial.progress.vue';
import { mixins } from 'vue-class-component';
import RatingsMixin from '@/mixins/ratings';
import FeatureChecks from '@/mixins/featureChecks';

@Component({
  mixins: [template],
  components: {
    'radial-progress-bar': RadialProgress,
  },
})
export default class Noise extends mixins(RatingsMixin, FeatureChecks) {
  callModal() {
    commitSetStatusDBModal(store, true);
  }
}
