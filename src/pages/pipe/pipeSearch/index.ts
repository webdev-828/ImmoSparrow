import Vue from 'vue';
import { Component } from 'vue-property-decorator';
import template from './template.vue';
import {
  IPipelineEntryLightModel, $newObj, PipelineEntryQueryStatuses,
  IPipelineEntryQuery, PipelineEntryQuery, $pipelines, mval as val,
  EntitySearchQueryDeletedStatus,
} from '@immosparrow/cockpit-api-v2';
import Debounce from 'debounce-decorator';
import { displayAddress } from '../../../components/sharedFunctions';
@Component({
  name: 'PipeSearch',
  mixins: [template],
})

export default class PipeSearch extends Vue {

  globalPipeSearchLoading: boolean = false;
  globalPipeSearchLoaded: boolean = false;
  globalPipeSearch: string = '';
  globalSearchResults: IPipelineEntryLightModel[] = [];
  inProgressOnly: boolean = true;
  displayAddress: Function = displayAddress;
  val: Function = val;

  pipeSearchOpen () {
    this.globalPipeSearchLoading = false;
    this.globalPipeSearchLoaded = false;
    this.globalSearchResults = [];
    setTimeout(() => {
      document.getElementById('globalPipeSearch').focus();
    }, 300);
  }

  @Debounce(500)
  async getGlobalPipeResults () {
    const query: IPipelineEntryQuery = $newObj(PipelineEntryQuery);
    query.text = this.globalPipeSearch;
    if (this.inProgressOnly) {
      query.statuses = PipelineEntryQueryStatuses.InProgress;
      query.deletedStatus = EntitySearchQueryDeletedStatus.Default;
    } else {
      query.statuses = PipelineEntryQueryStatuses.Any;
      query.deletedStatus = EntitySearchQueryDeletedStatus.All;
    }

    if (this.globalPipeSearch) {
      $pipelines.findEntries(query)
        .then((res) => {
          if (res) {
            this.globalSearchResults = res.items;
          }
          this.globalPipeSearchLoading = false;
        });
    } else {
      this.globalPipeSearchLoading = false;
    }
  }

  openResults () {
    this.globalPipeSearchLoading = false;
    if (this.globalSearchResults.length) {
      this.globalPipeSearchLoaded = true;
    }
  }

  globalSearch (event: KeyboardEvent) {
    if (event.keyCode === 91) {
      this.globalPipeSearchLoading = false;
    }
    if (event.keyCode === 27) {
      this.globalPipeSearchLoaded = false;
      return;
    }
    if (event.keyCode !== 38 && event.keyCode !== 40) {
      if (this.globalPipeSearch.length >= 3 || !this.globalPipeSearch) {
        this.globalPipeSearchLoading = true;
        this.globalSearchResults = [];
        this.getGlobalPipeResults();
        this.globalPipeSearchLoaded = true;
      }
    }
  }

  selectSearchResult (lead: IPipelineEntryLightModel) {
    this.globalPipeSearch = '';
    this.globalSearchResults = [];
    this.$emit('selectSearchResult', lead);
  }

  markedTitle (item: IPipelineEntryLightModel) {
    const name = this.val(item, (item: IPipelineEntryLightModel) => item.name, '') || this.val(item, (item: IPipelineEntryLightModel) => item.publication.primaryInfo.basicInfo.title, '');
    if (!this.globalPipeSearch) {
      return name;
    }
    return name.replace(new RegExp(this.globalPipeSearch, 'gi'), (match: any) => {
      return `<mark>${match}</mark>`;
    });
  }
}
