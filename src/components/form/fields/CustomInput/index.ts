import { Component, Prop, Watch } from 'vue-property-decorator';
import { mixins } from 'vue-class-component';
import InlineWrapper from './wrappers/InlineWrapper';
import MinMaxWrapper from './wrappers/MinMaxWrapper';
import template from './Template.vue';
import BasicInput from './BasicInput';
import { MinMaxFields } from '@/models';
import { ErrorField } from 'vee-validate';
import GlobalMixin from '@/mixins/global';
import { watch } from 'fs';

@Component({
  mixins: [template],
  inject: ['$validator'],
  components: {
    'basic-input': BasicInput,
    'inline-wrapper': InlineWrapper,
    'minmax-wrapper': MinMaxWrapper,
  },
})
export default class CustomInput extends mixins(GlobalMixin) {
  @Prop({ required: true })
  label: string;
  @Prop({})
  placeholder: string;
  @Prop({})
  value: string;
  @Prop({ required: true })
  type: 'text' | 'number';
  @Prop({ required: true })
  displayType: 'inline' | 'minmax';
  @Prop({ default: '' })
  validate: Object | string;
  @Prop({ required: true })
  fieldName: string;
  @Prop({ required: true })
  formName: string;
  @Prop({})
  minMaxFields: MinMaxFields;
  @Prop({ default: false })
  step5: boolean;
  @Prop({ default: false })
  approved: boolean;
  @Prop({ default: false })
  ppIndicator: boolean;

  localize: any = window['Localize'];

  get wrapperType(): string {
    return `${this.displayType}-wrapper`;
  }
  get validatorString() {
    return `${this.formName}.${this.fieldName}`;
  }
  get fieldErrors(): ErrorField[] {
    return this.$validator.errors.items.filter((x) => {
      if (this.displayType === 'minmax') {
        return x.field === `${this.fieldName}-min` || x.field === `${this.fieldName}-max`;
      }
      return x.field === this.fieldName;
    });
  }

  async validateField(field: string) {
    return await this.$validator.validate(field);
  }
  async validateAllFields() {
    if (this.displayType === 'minmax') {
      await Promise.all([
        this.validateField(`${this.validatorString}-min`),
        this.validateField(`${this.validatorString}-max`),
      ]);
    } else {
      await this.validateField(this.validatorString);
    }
    return !this.fieldErrors.length;
  }
  handleInput(value: string) {
    this.$emit('input', value);
  }
  handleApprove(value: boolean) {
    let approve = value;
    if (value && this.fieldErrors.length) {
      approve = false;
    }
    this.$emit('update:approved', approve);
  }
  handleEnter(isLastField: boolean = false) {
    this.validateAllFields().then((isValid: boolean) => {
      if (this.displayType === 'minmax') {
        if (isValid) {
          if (isLastField) {
            this.$emit('update:approved', true);
            this.$emit('enter');
          } else {
            const input = document.getElementsByName(`${this.fieldName}-min`)[0] as HTMLInputElement;
            input.focus();
          }
        }
      } else {
        if (isValid) {
          this.$emit('update:approved', true);
          this.$emit('enter');
        }
      }
    });
  }
  setMinMaxValues() {
    const value = +this.value;
    const values = this.minMaxFields.values;
    const limits = this.minMaxFields.defaultLimits;
    const result = this.getFieldMinMax(this.fieldName, value, limits);
    values.min = result.min;
    values.max = result.max;
  }

  @Watch('approved')
  @Watch('value')
  onValueChanged() {
    this.$nextTick(() => {
      this.validateAllFields().then((isValid: boolean) => {
        if (!isValid) this.$emit('update:approved', false);
        if (isValid && this.displayType === 'minmax') {
          this.setMinMaxValues();
        }
      });
    });
  }

  @Watch('minMaxFields', { deep: true })
  onMinMaxFieldsValueChanged() {
    this.$nextTick(() => {
      this.validateAllFields();
    });
  }
}
