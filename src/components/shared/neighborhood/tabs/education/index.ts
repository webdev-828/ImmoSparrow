import { Component } from 'vue-property-decorator';
import template from './template.vue';
import { mixins } from 'vue-class-component';
import RatingsMixin from '@/mixins/ratings';
import RadialProgress from '@components/transparencyModule/radial.progress.vue';

@Component({
  mixins: [template],
  components: {
    'radial-progress-bar': RadialProgress,
  },
})
export default class Education extends mixins(RatingsMixin) {
  get allPois() {
    return this.kindergardens.concat(this.primarySchools).concat(this.secondarySchools).concat(this.highschools).concat(this.universities);
  }
}
