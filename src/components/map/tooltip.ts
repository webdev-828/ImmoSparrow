import Vue from 'vue';
import template from './tooltip.template.vue';
import { Component, Prop } from 'vue-property-decorator';

@Component({
  mixins: [template],
  components: {
  },
})
export default class Tooltip extends Vue {

  @Prop()
  closePopup: Function;

  @Prop()
  tooltip: string;

  @Prop()
  loader: boolean;

}
