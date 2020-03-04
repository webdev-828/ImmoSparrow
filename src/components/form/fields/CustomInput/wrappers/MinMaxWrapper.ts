import { Component, Prop, Vue } from 'vue-property-decorator';
import { MinMaxFields } from '@/models';
import { ErrorField } from 'vee-validate';
import BasicInput from '../BasicInput';
import template from './MinMaxWrapperTemplate.vue';

@Component({
  mixins: [template],
  inject: ['$validator'],
  components: {
    'basic-input': BasicInput,
  },
})
export default class MinMaxWrapper extends Vue {
  @Prop({ required: true })
  label: string;
  @Prop({ required: true, default: 'text' })
  type: 'text' | 'number';
  @Prop({ required: true })
  fieldName: string;
  @Prop({ required: true })
  minMaxFields: MinMaxFields;
  @Prop({ required: true })
  formName: string;
  @Prop({ default: false })
  step5: boolean;
  @Prop({ default: false })
  ppIndicator: string | number;

  get fieldErrors(): ErrorField[] {
    return this.$validator.errors.items.filter((x) => {
      return x.field === this.fieldName;
    });
  }
  get validationObject(): Object[] {
    if (this.type === 'text') return [];
    const value = this.minMaxFields.values.value;
    const limits = this.minMaxFields.defaultLimits;
    return [
      { min_value: limits.min, trinityIsSmaller: value },
      { min_value: limits.min, max_value: limits.max, trinityIsBigger: value },
    ];
  }
  get minMaxText() {
    const text: { [key: string]: string } = { min: null, max: null };
    text.min = (this.minMaxFields.values.min || this.minMaxFields.defaultLimits.min).toString();
    text.max = (this.minMaxFields.values.max || this.minMaxFields.defaultLimits.max).toString();
    if (this.fieldName === 'price') {
      text.min = this.$options.filters.money(text.min);
      text.max = this.$options.filters.money(text.max);
    }
    return text;
  }

  handleInput(value: string, field: string) {
    this.$set(this.minMaxFields.values, field, value);
  }
  handleEnter(isMaxField: boolean) {
    if (isMaxField) {
      this.$emit('enter', isMaxField);
    } else {
      const input = document.getElementsByName(`${this.fieldName}-max`)[0] as HTMLInputElement;
      input.focus();
    }
  }
}
