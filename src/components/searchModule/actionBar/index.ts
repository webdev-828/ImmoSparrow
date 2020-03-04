import Vue from 'vue';
import template from './template.vue';
import { Component, Prop, Watch } from 'vue-property-decorator';
import { IPubModel, ILeadListLightModel,
  IPipelineLightModel, IPubLeadInfo, LeadListLightModel,
  PipelineEntryEntityType, $leads, LeadList,
  LeadStatus, $pipeline, $geo, LeadListModel,
  $newObj, EntitySearchQuery, Pipeline, PipelineLightModel,
} from '@immosparrow/cockpit-api-v2';
import { dispatchGetPipelines, getPipelines } from '../../../store/modules/pipeline';
import store from '../../../store';
import * as searchModule from '../../../store/modules/searchModule';
import * as leadsModule from '../../../store/modules/leads';
import { safeVal } from '@immosparrow/cockpit-lib-core';
import PipeDetails from '../../../pages/pipe/pipeDetails';
import { mixins } from 'vue-class-component';
import FeatureChecks from '@/mixins/featureChecks';
import BundleChecks from '@/mixins/bundleChecks';

@Component({
  mixins: [template],
  name: 'ActionBar',
  components: { PipeDetails },
})
export default class ActionBar extends mixins(FeatureChecks, BundleChecks) {

  @Prop({ default: null })
  item: IPubModel;

  @Prop({ default: false })
  detailView: boolean;

  createInbox: boolean = false;
  createPipe: boolean = false;
  createInboxDropdown: boolean = false;
  createPipeDropdown: boolean = false;
  showInboxError: boolean = false;

  @Prop({ default: true })
  showMR: boolean;

  selectedInbox: ILeadListLightModel = null;
  selectedPipeline: IPipelineLightModel = null;
  inboxName: string = '';

  val: Function = safeVal;

  addingToFav: boolean = false;

  created () {
    this.$root.$on('refreshItem', (item: IPubModel) => {
      if (this.item.id === item.id && !this.detailView) {
        this.item = item;
        this.$forceUpdate();
      }
    });
  }

  get availableInboxes () {
    const inboxes = leadsModule.getInboxes(store);
    const availableInb: ILeadListLightModel[] = [];
    // show only inboxes to which ad wasn't added already
    if (inboxes && inboxes.items) {
      inboxes.items.forEach((inb) => {
        let found = null;
        if (this.item.leads) {
          found = this.item.leads.find((lead: IPubLeadInfo) => {
            return (inb.id === lead.leadList.id && lead.status !== 4);
          });
        }
        if (!found) {
          // also exclude inbox that has my-favorites tag
          if (!inb.tags || (inb.tags && !inb.tags.includes('my-favorites'))) {
            availableInb.push(inb);
          }
        }
      });
    }
    return availableInb;
  }
  get availablePipelines () {
    const pipelines = getPipelines(store);
    const availablePipes: IPipelineLightModel[] = [];
    if (pipelines && pipelines.items) {
      pipelines.items.forEach((p) => {
        let found = null;
        if (this.item.pipelineEntries) {
          found = this.item.pipelineEntries.find((pipe: any) => {
            return p.id === pipe.pipeline.id;
          });
        }
        if (!found) {
          availablePipes.push(p);
        }
      });
    }
    return availablePipes;
  }

  get filteredItemLeads () {
    if (this.item.leads) {
      return this.item.leads.filter((item) => {
        return item.status !== 4 && (!item.leadList.tags || (!item.leadList.tags.includes('my-favorites')));
      });
    }
    return [];

  }

  myFavorites (): ILeadListLightModel {
    const inboxes = leadsModule.getInboxes(store);
    let myFavs = null;
    if (inboxes.items) {
      inboxes.items.forEach((inb) => {
        if (inb.tags && inb.tags.includes('my-favorites')) {
          myFavs = inb;
        }
      });
    }
    return myFavs;
  }

  addToInbox() {
    if (this.selectedInbox) {
      this.creatingNew = true;
      $leads.create([
        {
          leadListId: this.selectedInbox.id,
          entityId: this.item.id,
          entityType: PipelineEntryEntityType.Publication,
        },
      ])
        .then(() => {
          this.reloadItem();
        });
    }
  }

  addToPipeline() {
    if (this.selectedPipeline) {
      this.creatingNew = true;
      $pipeline(this.selectedPipeline.id).entries.add(PipelineEntryEntityType.Publication, [this.item.id])
      .then(() => {
        this.selectedPipeline = null;
        this.reloadItem();
      });
    }
  }

  removeInbox(lead: IPubLeadInfo) {
    this.item.leads.splice(this.item.leads.indexOf(lead), 1);
    this.availableInboxes.push(lead);
    leadsModule.dispatchUpdateLeadStatus(store, { id: lead.id, status: LeadStatus.Remove })
    .then(() => {
      this.$forceUpdate();
      this.refreshOVItem();
    });
  }

  refreshOVItem () {
    this.$root.$emit('refreshItem', this.item);
  }

  addToFavorites(item: IPubModel) {
    this.addingToFav = true;
    const bookmarked = this.getBookmarked();
    const myFavs = this.myFavorites();
    if (bookmarked && bookmarked.status !== 4) {
      leadsModule.dispatchUpdateLeadStatus(store, { id: bookmarked.id, status: LeadStatus.Remove })
        .then(() => {
          this.reloadItem();
          setTimeout(() => {
            this.addingToFav = false;
          },         300);
        });
    } else {
      if (myFavs) {
        $leads.create([
          {
            leadListId: myFavs.id,
            entityId: item.id,
            entityType: PipelineEntryEntityType.Publication,
          },
        ]).then(() => {
          this.reloadItem();
          setTimeout(() => {
            this.addingToFav = false;
          },         300);
        });
      } else {
        Vue.prototype.$notify({
          group: 'actions',
          type: 'error',
          duration: 2500,
          text: "Favorites list doesn't exist",
        });
        this.addingToFav = false;
      }
    }
  }

  getBookmarked (): IPubLeadInfo {
    let bookmarked = null;
    if (this.item.leads) {
      this.item.leads.forEach((lead) => {
        if (lead.leadList.tags) {
          lead.leadList.tags.forEach((tag) => {
            if (tag.includes('my-favorites')) {
              bookmarked = lead;
            }
          });
        }
      });
    }
    return bookmarked;
  }

  get checkIfBookmarked (): boolean {
    let bookmarked = false;
    if (this.item.leads) {
      this.item.leads.forEach((lead) => {
        if (lead.leadList.tags) {
          lead.leadList.tags.forEach((tag) => {
            if (tag.includes('my-favorites') && lead.status !== 4) {
              bookmarked = true;
            }
          });
        }
      });
    }
    return bookmarked;
  }

  reloadItem () {
    searchModule.dispatchGetPubById(store, this.item.id)
    .then((res) => {
      this.item = res;
      this.refreshOVItem();
      this.creatingNew = false;
    });
  }

  reloadPipelines(newPipe: Pipeline) {
    this.createInbox = false;
    const query = $newObj(EntitySearchQuery);
    dispatchGetPipelines(store, query);
    this.createPipe = false;
    if (newPipe && newPipe.id) {
      this.selectedPipeline = $newObj(PipelineLightModel);
      this.selectedPipeline.id = newPipe.id;
      this.addToPipeline();
    }
  }

  creatingNew: boolean = false;
  create() {
    if (this.inboxName.length) {
      this.createInbox = false;
      const leadsList = $newObj(LeadListModel);
      leadsList.name = this.inboxName;
      leadsList.isEnabled = true;
      leadsList.tags = [];
      leadsList.tags.push('bookmarks');
      leadsModule.dispatchCreateLeadsList(store, leadsList).then((data: LeadList) => {
        leadsModule.dispatchGetInboxes(store);
        this.inboxName = '';
        this.createInbox = false;
        if (data && data.id) {
          this.selectedInbox = $newObj(LeadListLightModel);
          this.selectedInbox.id = data.id;
          this.addToInbox();
        }
      });
    }
  }
  openInPP () {
    $geo.getAddress(this.item.address.entranceAddressId).then((data) => {
      const routeData = this.$router.resolve({
        name: 'Price Prediction',
        query: { adId: this.item.id, entrenceId: data.entranceId },
      });
      const popup = window.open(routeData.href, '_blank');

      if (popup == null || typeof(popup) === 'undefined') {
        Vue.prototype.$notify({
          group: 'actions',
          type: 'error',
          duration: 2500,
          text: '<img src="/static/img/popup.png"/> We were unable to open Price prediction because new window was blocked by browser. Please allow popup in order to use this function.',
        });
      } else {
        popup.focus();
      }
    });
  }

  openInMR() {
    $geo.getAddress(this.item.address.entranceAddressId).then((data) => {
      const routeData = this.$router.resolve({
        name: 'Market radar ads',
        query: { adId: this.item.id, entrenceId: data.entranceId },
      });
      const popup = window.open(routeData.href, '_blank');

      if (popup == null || typeof (popup) === 'undefined') {
        Vue.prototype.$notify({
          group: 'actions',
          type: 'error',
          duration: 2500,
          text: '<img src="/static/img/popup.png"/> We were unable to open Price prediction because new window was blocked by browser. Please allow popup in order to use this function.',
        });
      } else {
        popup.focus();
      }

    });
  }

  openInPipe (pipeId: string, pipeEntryId: string) {
    const routeData = this.$router.resolve({
      name: 'Pipe',
      query: { id: pipeId, entryId: pipeEntryId },
    });
    window.open(routeData.href, '_blank');
  }

  openShareAd () {
    this.$emit('shareAdLink', this.item.id);
  }

  @Watch('item', { immediate: true, deep: true })
  loadData () {
    this.createInboxDropdown = false;
    this.createPipeDropdown = false;
    this.selectedInbox = null;
    this.selectedPipeline = null;
  }

}
