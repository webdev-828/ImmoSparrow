import { Component, Prop, Watch, Vue } from 'vue-property-decorator';
import { ErrorField } from 'vee-validate';
import template from './BasicInputTemplate.vue';

@Component({
  mixins: [template],
  inject: ['$validator'],
})
export default class BasicInput extends Vue {
  @Prop({})
  value: string;
  @Prop({ required: true, default: 'text' })
  type: 'text' | 'number';
  @Prop({})
  placeholder: string;
  @Prop({})
  validate: Object | string;
  @Prop({ required: true })
  fieldName: string;
  @Prop({ required: true })
  formName: string;
  @Prop({ default: false })
  step5: boolean;
  @Prop({ default: false })
  approved: boolean;

  get fieldErrors(): ErrorField[] {
    return this.$validator.errors.items.filter((x) => {
      return x.field === this.fieldName;
    });
  }
  get formatedInput() {
    if (this.type === 'text') {
      return this.value;
    }
    return this.$options.filters.longDigits(this.value);
  }

  parseInput(value: string) {
    if (this.type === 'text') return value;
    if (value === '') return null;
    return +value;
  }
  handleInput(value: string) {
    this.$emit('input', this.parseInput(value));
  }
  handleApprove(approve: boolean) {
    this.$emit('approve', approve);
  }
  enterPressed() {
    this.$emit('enter');
  }
  validateField() {
    this.$validator.validate(`${this.formName}.${this.fieldName}`);
  }

  @Watch('fieldErrors')
  onFieldErrorsChanged() {
    if (this.approved && this.fieldErrors.length) {
      this.handleApprove(false);
    }
  }
}
