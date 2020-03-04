import { IPubPropertyCategory } from '@immosparrow/cockpit-api-v2';
import { Component, Prop, Vue } from 'vue-property-decorator';
import template from './Template.vue';

@Component({
  mixins: [template],
})
export default class CustomSelect extends Vue {
  @Prop({})
  label: string;
  @Prop({})
  value: Object;
  @Prop({ required: true })
  dataSet: Array<Object>;
  @Prop({ required: true })
  formName: string;
  @Prop({ required: true })
  fieldName: string;
  @Prop({ default: false })
  approved: boolean;
  localize: any = window['Localize'];

  mounted() {
    if (!this.value) {
      this.$emit('input', this.dataSet[0]);
    }
  }

  customLabel({ name }: IPubPropertyCategory) {
    return name;
  }
  limitText(count: number): string {
    return `and ${count} other elements`;
  }
  handleInput(value: IPubPropertyCategory) {
    if (value) {
      this.$emit('input', value);
      this.$emit('selected');
    }
    this.handleApprove(true);
  }
  handleApprove(value: boolean) {
    this.$emit('update:approved', value);
  }
}
