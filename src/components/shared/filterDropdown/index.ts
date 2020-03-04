import Vue from 'vue';
import { Component, Prop, Watch } from 'vue-property-decorator';
import template from './template.vue';
import { FilterDropdownModel } from './model';

@Component({
  name: 'FilterDropdown',
  mixins: [template],
})
export default class FilterDropdown extends Vue {

  @Prop()
  tooltipContent: string;

  @Prop()
  title: string;

  @Prop({ default: false })
  disabled: boolean;

  @Prop({ default: false })
  searchable: boolean;

  @Prop()
  placeholder: string;

  @Prop({ default: 'fa fa-filter' })
  icon: string;

  @Prop({ default: false })
  shortWidth: boolean;

  @Prop({ default: false })
  translate: boolean;

  @Prop()
  options: FilterDropdownModel[];

  @Prop({ default: null })
  selected: FilterDropdownModel;

  selectedOption: FilterDropdownModel = { text: '', value: '' };
  searchQuery: string = '';

  @Watch('selected', { immediate: true })
  changeSelected () {
    if (this.selected) {
      this.selectedOption = this.selected;
    }
  }

  get filteredOptions() {
    return this.options.filter((option) => {
      return option.text.toLowerCase().includes(this.searchQuery.toLowerCase());
    });
  }

  selectOption(option: FilterDropdownModel) {
    this.selectedOption = option;
    this.$emit('select', this.selectedOption);
  }

  selectedLabel(option: FilterDropdownModel) {
    // Employee initials
    if (option.text && option.additionalText) {
      return `${option.text.charAt(0).toUpperCase()}${option.additionalText.charAt(0).toUpperCase()}`;
    }
    return option.text;
  }

  label(option: FilterDropdownModel) {
    return option.text && option.additionalText ? `${option.text} ${option.additionalText}` : option.text;
  }

}
