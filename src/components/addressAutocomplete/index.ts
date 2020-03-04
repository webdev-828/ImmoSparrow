import Vue from 'vue';
import { Component, Prop, Watch } from 'vue-property-decorator';
import template from './template.vue';
import _ from 'lodash';
import Debounce from 'debounce-decorator';
import { SingleCall } from '../call';
import * as api from '@immosparrow/cockpit-api-v2';

@Component({
  name: 'AutocompleteComponent',
  mixins: [template],
})

export default class AutocompleteComponent extends Vue {

  @Prop()
  onSearch: Function;

  @Prop()
  setData: Function;

  @Prop({ default: true })
  redo: boolean;

  @Prop()
  searchedAddress: string;

  @Prop()
  disabled: boolean;

  @Prop({ default: 1 })
  autocompleteTextLimit: number;

  @Prop()
  noCustomSearch: boolean;

  @Prop()
  includeInSuggestions: number[];

  @Prop()
  itemHighlighted: string;

  @Prop()
  onClean: Function;

  @Prop()
  placeholder: string;

  loadingData: boolean = false;
  isOpen: boolean = false;
  options: Object[] = [];
  itemSelected: Object = null;
  currentItem: number = 0;
  model: string = '';
  module: string = '';

  $refs: {};

  localize: any = window['Localize'];

  load_data(event: KeyboardEvent) {

    if (event.keyCode === 91) {
      this.loadingData = false;
    }
    if (event.keyCode === 27) {
      this.close_results();
      return;
    }

    if (this.options.length > 0) {

      this.itemSelected = this.options[this.currentItem];

      // console.log( this.options[this.currentItem]);
      // this.$refs["search_element"].value =  this.options[this.currentItem]["name"];
      if (event.keyCode === 38 && this.currentItem >= 0) {
        this.currentItem = this.currentItem === 0 ? 0 : this.currentItem - 1;
        this.model = this.options[this.currentItem]['name'];
        this.itemSelected = this.options[this.currentItem];
      } else if (event.keyCode === 40 && this.currentItem <= 5) {
        this.currentItem += 1;
        if (!this.options[this.currentItem]) this.currentItem -= 1;
        this.model = this.options[this.currentItem]['name'];
        this.itemSelected = this.options[this.currentItem];
      }
    }

    if (this.options.length === 0 && this.onClean) {
      this.onClean();
    }

    if (event.keyCode !== 38 && event.keyCode !== 40 && event.keyCode !== 13) {
      if (this.model.length >= this.autocompleteTextLimit) {
        this.loadingData = true;
        this.getSearchSuggestions();
        this.isOpen = true;

      }
    }
  }

  genVal(item: object, val: string) {
    const arr = val.split('.');
    let genVal = { ...item };
    arr.forEach(el => genVal = genVal[el]);
    return genVal;
  }

  close_results() {
    this.isOpen = false;
  }

  show_results() {
    // this.isOpen = true;
    this.$refs['search_element'].focus();
  }

  open_options() {
    if (this.options.length) {
      this.isOpen = true;
    }
  }

  reset_model() {
    if (this.onClean) {
      this.onClean();
    }
    this.isOpen = false;
    this.model = '';
    this.options = [];
    this.$refs['search_element'].focus();
  }
  created() {
  }

  @Watch('model')
  wm() {
    this.$emit('modelChanged', this.model);
  }

  @Debounce(250)
  async getSearchSuggestions() {
    const validationResult = await this.$validator.validateAll();
    if (validationResult) {
      if (!this.noCustomSearch) {
        this.onSearch();
      } else {
        if (this.model.length < this.autocompleteTextLimit) {
          this.loadingData = false;
          return false;
        }
        const singleCall = new SingleCall <api.GeoSuggestion[]>(api.$geo.findSuggestions);
        const results = await singleCall.invoke({
          text: this.model,
          includeGeom: true,
          suggestionTypes: this.includeInSuggestions,
          maxItemCount: 6,
        });

        this.options = results;
        this.loadingData = false;
      }
    } else {
      this.loadingData = false;
      return false;
    }
  }

  @Watch('includeInSuggestions')
  watchIncludeInSuggestions() {
    this.reset_model();
  }

  @Watch('searchedAddress')
  watchSearchedAddress(old: string, newV: string) {
    this.model = this.searchedAddress;
    this.options = [];
  }

}
