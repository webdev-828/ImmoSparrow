import Vue from 'vue';
import { Component, Watch } from 'vue-property-decorator';
import template from './template.vue';
import store from '../../../../store';
import Base from '../../../base';
import {
  $contactLists, ILeadGenFilterLightModel, EntitySearchQueryEnabledStatus,
  IContactLightModel, $newObj, LeadGenFilterQueryFilterType, LeadGenFilterQuery,
  IEntitySearchResult, EntitySearchQueryDeletedStatus, $contactList, $pipeline,
  $leadGenFilter, $leadGenFilters,
} from '@immosparrow/cockpit-api-v2';
import * as leadsModule from '../../../../store/modules/leads';
import moment from 'moment';
import ConfirmModal from '../../../modal/confirmModal';

@Component({
  mixins: [template],
  components: {
    Base,
    ConfirmModal,
  },
})

export default class SubsTab extends Base {

  showSidebarSearch: boolean = false;
  showSidebarFilter: boolean = false;
  showSidebarDisabled: boolean = false;

  subs: { item: ILeadGenFilterLightModel, edit: boolean }[] = [];
  contacts: IContactLightModel[] = [];

  selectedContact: IContactLightModel = null;
  searchText: string = '';

  showDeleteModal: boolean = false;
  showDeactivateModal: boolean = false;
  deactivate: boolean = false;
  subForDelete: ILeadGenFilterLightModel = null;

  created () {
    if (this.basicSearch) {
      this.loadSubs();
    }
  }

  loadSubs () {
    this.subs = [];
    const filter = $newObj(LeadGenFilterQuery);
    filter.filterType = LeadGenFilterQueryFilterType.Any;
    filter.text = this.searchText;
    if (!this.showSidebarDisabled) {
      filter.enabledStatus = 0;
    }
    $leadGenFilters.find(filter)
    .then((res: IEntitySearchResult<ILeadGenFilterLightModel>) => {
      res.items.forEach((sub) => {
        this.subs.push({ item: sub, edit: false });
      });
      $contactLists.find({ text: '' })
        .then((res1) => {
          if (res1 && res1.items.length) {
            this.getContacts(res1.items[0].id);
          } else {
            $contactLists.create({ name: 'Default contact list' })
              .then((res2) => {
                this.getContacts(res2.id);
              });
          }
        });
    });
  }

  getContacts (id: string) {
    $contactList(id).contacts.find({
      text: '',
      enabledStatus: EntitySearchQueryEnabledStatus.All,
      deletedStatus: EntitySearchQueryDeletedStatus.All,
    })
    .then((res) => {
      if (res) {
        this.contacts = res.items;
      }
    });
  }

  get filteredSubs () {
    return this.subs
      .filter((sub) => {
        if (this.selectedContact) {
          if (sub.item.contact && (sub.item.contact.firstName === this.selectedContact.firstName)) {
            return sub;
          }
        } else {
          return true;
        }
      })
      .filter((sub) => {
        return sub.item.name.toLowerCase().includes(this.searchText.toLowerCase());
      });
  }

  switchHideDeleted () {
    this.showSidebarDisabled = !this.showSidebarDisabled;
    this.loadSubs();
  }

  formatSubDate (date: Date) {
    return moment(date).fromNow();
  }

  showDeactivateSub (sub: ILeadGenFilterLightModel, deactivate: boolean) {
    this.subForDelete = sub;
    this.deactivate = deactivate;
    this.showDeactivateModal = true;
  }

  deleteSub (sub: ILeadGenFilterLightModel) {
    this.subForDelete = sub;
    this.showDeleteModal = true;
  }

  cancelModal () {
    this.showDeleteModal = false;
    this.showDeactivateModal = false;
    this.subForDelete = null;
  }

  activateSub () {
    this.showDeactivateModal = false;
    this.subForDelete.isEnabled = !this.subForDelete.isEnabled;
    $leadGenFilter(this.subForDelete.id).updateIsEnabled(!this.deactivate)
      .then((res) => {
        if (res) {
          Vue.prototype.$notify({
            group: 'actions',
            type: 'success',
            duration: 2500,
            text: 'Subscription successfully updated',
          });
          if (!this.subForDelete.isEnabled) {
            this.subs.forEach((item) => {
              if (this.subForDelete.id === item.item.id) {
                this.subs.splice(this.subs.indexOf(item), 1);
              }
            });
          }
        } else {
          this.subForDelete.isEnabled = !this.subForDelete.isEnabled;
          Vue.prototype.$notify({
            group: 'actions',
            type: 'error',
            duration: 2500,
            text: 'Error while trying to update subscription',
          });
        }
        this.subForDelete = null;
      });
  }

  renameSubName (sub: any) {
    $leadGenFilter(sub.item.id).updateName(sub.item.name)
      .then((res) => {
        leadsModule.dispatchGetLeadsListById(store, sub.item.leadList.id)
          .then((res1) => {
            $pipeline(res1.defaultPipelineId).updateName(sub.item.name)
              .then((res2) => {
                sub.edit = !sub.edit;
                if (res2) {
                  Vue.prototype.$notify({
                    group: 'actions',
                    type: 'success',
                    duration: 2500,
                    text: 'Subscription name successfully updated ',
                  });
                } else {
                  Vue.prototype.$notify({
                    group: 'actions',
                    type: 'error',
                    duration: 2500,
                    text: 'Error while trying to update subscription name',
                  });
                }
              });
          });
      });
  }

  updateSub () {
    this.showDeleteModal = false;
    $leadGenFilter(this.subForDelete.id).delete()
      .then((res) => {
        if (res) {
          this.subs.forEach((item) => {
            if (this.subForDelete.id === item.item.id) {
              this.subs.splice(this.subs.indexOf(item), 1);
            }
          });
          leadsModule.dispatchDeleteLeadsList(store, this.subForDelete.leadList.id)
            .then((res1: any) => {
              // pipelineModule.dispatchRemovePipeline(store, this.subForDelete.leadList.id)
              if (res1) {
                Vue.prototype.$notify({
                  group: 'actions',
                  type: 'success',
                  duration: 2500,
                  text: 'Subscription successfully deleted',
                });
              } else {
                Vue.prototype.$notify({
                  group: 'actions',
                  type: 'error',
                  duration: 2500,
                  text: 'Error while trying to delete subscription',
                });
              }
            });
          this.subForDelete = null;
        } else {
          Vue.prototype.$notify({
            group: 'actions',
            type: 'error',
            duration: 2500,
            text: 'Error while trying to delete subscription',
          });
          this.subForDelete = null;
        }
      });
  }

  editInInbox (sub: ILeadGenFilterLightModel) {
    this.$router.push({ path: `/inbox/${sub.id}` });
  }
  editInSearch (sub: ILeadGenFilterLightModel) {
    this.$router.push({ path: `/search/${sub.id}` });
  }
  loadSearchData (id: string) {
    // this.$router.push({ path: `search/${id}` });
    this.$emit('loadSearchData', { id, edit: false });
  }

  contactsLabel (contact: IContactLightModel) {
    return `${contact.firstName} ${contact.lastName}`;
  }

  showDisabled () {
    if (!this.showSidebarDisabled) {
      return 'Show Disabled Items';
    }
    return 'Hide Disabled Items';

  }

  @Watch('showSidebarFilter')
  ssf () {
    if (!this.showSidebarFilter) {
      this.selectedContact = null;
    }
  }

  @Watch('showSidebarSearch')
  sss () {
    if (!this.showSidebarSearch) {
      this.searchText = '';
    }
  }
}
