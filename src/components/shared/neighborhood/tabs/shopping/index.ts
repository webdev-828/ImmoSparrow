import { Component } from 'vue-property-decorator';
import { mixins } from 'vue-class-component';
import RatingsMixin from '@/mixins/ratings';
import template from './template.vue';
import RadialProgress from '@components/transparencyModule/radial.progress.vue';

@Component({
  mixins: [template],
  components: {
    'radial-progress-bar': RadialProgress,
  },
})
export default class Shopping extends mixins(RatingsMixin) {}
