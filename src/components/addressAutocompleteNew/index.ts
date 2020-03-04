import { Component, Prop, Vue } from 'vue-property-decorator';
import template from './template.vue';
import { GeoSuggestion, $geo, IGeoSuggestionQuery } from '@immosparrow/cockpit-api-v2';
import store from '@store';
import { setSearchedAddress } from '@/store/modules/main';
import { getIsMapLoaded } from '@/store/modules/map';

@Component({
  name: 'AutocompleteComponent',
  mixins: [template],
})
export default class AutocompleteComponent extends Vue {
  @Prop({ default: 3 })
  autocompleteMinTextLimit: number;
  @Prop({ default: 'Address' })
  placeholder: string;

  searchText: string = '';
  results: GeoSuggestion[] = [];
  isOpen: boolean = false;
  loadingData: boolean = false;
  timeout: any = null;
  localize: any = window['Localize'];

  get isMapLoaded() {
    return getIsMapLoaded(store);
  }

  selectItem(item: GeoSuggestion) {
    if (!this.results.length) return;
    setSearchedAddress(store, item ? item : this.results[0]);
    this.$emit('selectedItem');
    this.clear();
  }
  showResults() {
    if (this.results.length) {
      this.isOpen = true;
    }
    const input = this.$refs.searchInput as HTMLInputElement;
    input.focus();
  }
  debounceSearch() {
    this.loadingData = true;
    clearTimeout(this.timeout);
    this.timeout = setTimeout(() => {
      this.searchForSuggestions();
    }, 250);
  }
  async searchForSuggestions() {
    if (this.searchText.length >= 3 && this.searchText.length < 200) {
      const query: IGeoSuggestionQuery = {
        text: this.searchText,
        suggestionTypes: [70],
        maxItemCount: 6,
        includeGeom: true,
      };
      const results = await $geo.findSuggestions(query);
      this.results = results;
      this.isOpen = true;
      this.loadingData = false;
    }
  }
  clear(dontDeleteText: boolean = false) {
    if (!dontDeleteText) {
      this.searchText = '';
    }
    this.results = [];
    this.isOpen = false;
    this.loadingData = false;
  }
}
