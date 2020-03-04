import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';
import template from './Performance.vue';
import RadialProgress from '../transparency/radial.progress.vue';
@Component({
  name: 'Performance',
  mixins: [template],
  components: {
    'radial-progress-bar': RadialProgress,
  },
})

export default class Performance extends Vue {

}
