import { Component } from 'vue-property-decorator';
import { mixins } from 'vue-class-component';
import RatingsMixin from '@/mixins/ratings';
import template from './template.vue';
import {
  PropertyEnvironmentLakeViewType,
} from '@immosparrow/cockpit-api-v2';
import RadialProgress from '@components/transparencyModule/radial.progress.vue';
import FeatureChecks from '@/mixins/featureChecks';

@Component({
  mixins: [template],
  components: {
    'radial-progress-bar': RadialProgress,
  },
})
export default class NeighborhoodView extends mixins(RatingsMixin, FeatureChecks) {
  getLakeViewTypeValue(type: PropertyEnvironmentLakeViewType) {
    return PropertyEnvironmentLakeViewType[type];
  }
}
