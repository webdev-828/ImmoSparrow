import { Component } from 'vue-property-decorator';
import template from './template.vue';
import RadialProgress from '@components/transparencyModule/radial.progress.vue';
import { mixins } from 'vue-class-component';
import GlobalMixin from '@/mixins/global';
import RatingsMixin from '@/mixins/ratings';

@Component({
  mixins: [template],
  components: {
    'radial-progress-bar': RadialProgress,
  },
})
export default class Overview extends mixins(GlobalMixin, RatingsMixin)  {}
