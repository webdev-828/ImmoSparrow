import { Component, Prop, Vue } from 'vue-property-decorator';
import template from './InlineWrapperTemplate.vue';

@Component({
  mixins: [template],
  inject: ['$validator'],
})
export default class InlineWrapper extends Vue {
  @Prop({ required: true })
  label: string;
}
