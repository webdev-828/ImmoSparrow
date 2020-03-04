import Vue from 'vue';
import { Component, Watch } from 'vue-property-decorator';
import template from './Inbox.vue';
import store from '../../store';
import Left from './../../components/lead/left';
import ObjectComponent from './../../components/searchModule/object';
import OverviewList from '../../components/searchModule/overviewList/';
import * as globalState from '../../store/modules/globalStatesModule';
import * as leadsModule from '../../store/modules/leads';
import * as pipelineModule from '../../store/modules/pipeline';
import * as searchModule from '../../store/modules/searchModule';
import { $newObj, ILeadGenFilterLightModel, LeadGenFilterLightModel,
  LeadGenFilterQueryFilterType, IEntitySearchResult, IContactLightModel,
  LeadStatus, LeadModel, ILeadLightModel, TemplatedMailMessageRequest,
  LeadGenFilterQuery, LeadQuery, LeadQueryStatuses,
  PubPublisherType, IPubLeadGenTrigger,
  PubQueryLeadGenTriggerType, $leads, LeadExportModel,
  ILeadListLightModel, ILeadModel,
  EntitySearchQuery,
  $leadList, PubQueryStatuses,
  PipelineModel, $leadGenFilter, $leadGenFilters,
  EntitySearchQueryEnabledStatus,
  Pipeline, $pipeline,
  $pipelines, LeadLightModel,
  IPipelineLightModel,
  PipelineLightModel, $lead,
  PubQueryPublisherClasses,
  LeadListNestedModel, mval as val,
} from '@immosparrow/cockpit-api-v2';
import Paginate from 'vuejs-paginate';
import Modal from '../../components/modal';
import ConfirmModal from '../../components/modal/confirmModal';
import listMap from '../../components/searchModule/overviewList/listMap';
import {
  displayAddress,
  formatPrice,
  getPersonName,
  getAddressQuality,
  getMainCategory1,
  getVendorClass,
  getDay,
  getDateAndTime } from '../../components/sharedFunctions';
import { getUserContext } from '../../store/modules/authStatesModule';
import ItemDetails from '../../components/shared/itemDetails';
import GetTimeUtc from '../../components/getTimeUtc/index';
import { FilterOptionModel } from '../../models/global';
import PipeDetails from '../pipe/pipeDetails';
import _ from 'lodash';
import { VueHammer } from 'vue2-hammer';
import { mixins } from 'vue-class-component';
import FeatureChecks from '@/mixins/featureChecks';
import BundleChecks from '@/mixins/bundleChecks';

Vue.use(VueHammer);

export class ContactSubs {
  contact: IContactLightModel;
  subs: IEntitySearchResult<ILeadGenFilterLightModel> = { items: [] };
  showMore: boolean;
}

@Component({
  mixins: [template],
  components: {
    Left,
    OverviewList,
    Paginate,
    ObjectComponent,
    Modal,
    ConfirmModal,
    listMap,
    ItemDetails,
    GetTimeUtc,
    PipeDetails,
  },
})

export default class Inbox extends mixins(FeatureChecks, BundleChecks) {

  $refs: {
    leadsTopPagination: any,
    leadsBottomPagination: any,
    subNameRef: any,
    sidebarSearch: any,
    contactSubName: any,
    ownSubName: any,
    infiniteLoading: any,
    newPipe: any,
  };

  showLeads: boolean = false;
  showMore2: boolean = false;
  showSidebarSearch: boolean = false;
  showSidebarDisabled: boolean = false;
  renamingSubName: boolean = false;
  showModal: boolean = false;
  showPipeModal: boolean = false;
  createNewPipelineInput: boolean = false;
  deactivate: boolean = false;
  editSub: boolean = false;
  editSubId: string = '';
  loadDataLids = false;
  objectsListCompact: boolean = true;
  objectsListCompact2: boolean = true;
  filtersDeployed: boolean = false;
  downloading: boolean = false;
  getLeadsList: any = null;
  refreshTime: number = 60000;
  selectDemo: any = ['One', 'Two', 'Three'];

  sendToTabs: object = {
    contact: true,
    email: false,
  };

  sendToShowTab(tab: string) {
    for (const i in this.sendToTabs) {
      if (i === tab) {
        this.sendToTabs[i] = true;
      } else {
        this.sendToTabs[i] = false;
      }
    }
  }

  ownSubs: IEntitySearchResult<ILeadGenFilterLightModel> = { items: [] };
  contactSubs: ContactSubs[] = [];
  bookmarks: IEntitySearchResult<ILeadListLightModel> = { items: [] };
  favorites: ILeadListLightModel = null;

  selectedSub: ILeadGenFilterLightModel = $newObj(LeadGenFilterLightModel);

  leads: IEntitySearchResult<ILeadLightModel> = { items: [] };
  selectedItem: ILeadLightModel = new LeadLightModel();
  selectedIndex: number = -1;
  countItems: number = undefined;
  totalItemCount: number = 0;
  dataWasFiltered: boolean = false;

  page: number = -1;
  pages: number = 0;
  infiniteId = +new Date();
  perPage: number = 10;
  selectedLeads: Array<ILeadGenFilterLightModel> = [];

  sortOptions: Array<{value: string, text: string, label: string}> = [
    { value: '-CreatedTime', text: 'Inbox Date', label: 'newest first' },
    { value: '+CreatedTime', text: 'Inbox Date', label: 'oldest first' },
    { value: '-PublicationTime', text: 'Publication Date', label: 'newest first' },
    { value: '+PublicationTime', text: 'Publication Date', label: 'oldest first' },
    { value: '-LastUpdateTime', text: 'Last Update', label: 'newest first' },
    { value: '+LastUpdateTime', text: 'Last Update', label: 'oldest first' },
    { value: '+Price', text: 'Price', label: 'cheapest first' },
    { value: '-Price', text: 'Price', label: 'expensive first' },
    { value: '+PricePerSqrMeter', text: 'Price Per Sqr Meter', label: 'cheapest first' },
    { value: '-PricePerSqrMeter', text: 'Price Per Sqr Meter', label: 'expensive first' },
    { value: '-RoomCount', text: 'Rooms', label: 'biggest count first' },
    { value: '+RoomCount', text: 'Rooms', label: 'smallest count first' },
    { value: '+LivingArea', text: 'Living area', label: 'smallest first' },
    { value: '-LivingArea', text: 'Living area', label: 'biggest first' },
    { value: '-BuiltYear', text: 'Built Year', label: 'newest first' },
    { value: '+BuiltYear', text: 'Built Year', label: 'oldest first' },
    { value: '+Zip', text: 'Zip', label: 'smallest first' },
    { value: '-Zip', text: 'Zip', label: 'biggest first' },
    { value: '+Locality', text: 'Locality', label: 'A-Z' },
    { value: '-Locality', text: 'Locality', label: 'Z-A' },
  ];
  filterSelect: any = [
    {
      headers: 'Lead status',
      options: [
        { value: LeadQueryStatuses.New | LeadQueryStatuses.Viewed, text: 'Unhandled', leadStatusFilter: true, icon: false },
        { value: LeadQueryStatuses.Keep, text: 'Highlighted', leadStatusFilter: true, icon: true },
        { value: LeadQueryStatuses.New, text: 'Not Viewed', leadStatusFilter: true, icon: false },
        { value: LeadQueryStatuses.Remove, text: 'Deleted', leadStatusFilter: true, icon: true },
      ],
    },
    {
      headers: 'Vendor',
      options: [
        { value: PubQueryPublisherClasses.Professional, text: 'Professional', leadStatusFilter: false, icon: false },
        { value: PubQueryPublisherClasses.NonProfessional, text: 'Non-Professional', leadStatusFilter: false, icon: false },
        { value: PubQueryPublisherClasses.Uncertain, text: 'Uncertain', leadStatusFilter: false, icon: false },
        { value: PubQueryPublisherClasses.Unknown, text: 'Unknown', leadStatusFilter: false, icon: false },
      ],
    },
  ];
  selectedFilters: Array<FilterOptionModel> = [];
  sortFilter: any = { value: '-LastUpdateTime', text: 'Last Update', label: 'newest first' };
  showMiniMap: boolean = false;
  activeAdsOnly: boolean = false;

  // Send to Client Demo
  showSidebar: boolean = false;
  additionalEmail: boolean = false;
  historySidebar: boolean = false;
  email1: boolean = true;
  email2: boolean = true;
  contactEmail1: string = null;
  contactEmail2: string = null;

  tabsSubscr: object = {
    bookmarks: false,
    showOwn: false,
    showClients: false,
  };

  val: Function = val;
  getMainCategory: Function = getMainCategory1;
  formatPrice: Function = formatPrice;
  displayAddress: Function = displayAddress;
  getVendorClass: Function = getVendorClass;
  getAddressQuality: Function = getAddressQuality;
  getPersonName: Function = getPersonName;
  getDay: Function = getDay;
  getDateAndTime: Function = getDateAndTime;
  refreshIntervalId: number = null;

  subForDelete: ILeadGenFilterLightModel = null;
  showDeleteModal: boolean = false;
  maps: any = [];
  subSearchText: string = '';
  loadingSubscriptions: boolean = false;

  usedLeadQuery: LeadQuery = null;
  showHistoryFirst: boolean = false;

  selectedPipeline: IPipelineLightModel = $newObj(PipelineLightModel);
  pipelines: IEntitySearchResult<IPipelineLightModel> = { items: [] };
  linkedPipeline: IPipelineLightModel = null;
  pipeSearch: string = '';

  get filteredPipelines () {
    return this.pipelines.items
      .filter((item) => {
        return item.name.toLowerCase().includes(this.pipeSearch.toLowerCase());
      })
      .sort((a, b) => {
        return a.name.localeCompare(b.name);
      });
  }

  created () {
    const self = this;
    this.$root.$on('show_leads', (data: boolean) => {
      self.showLeads = data;

      const searchSidebar =  document.querySelector('#side-overlay');
      searchSidebar.classList.remove('active');
      globalState.commitSetSearchSidebar(self.$store, false);

    });

    const query = $newObj(EntitySearchQuery);
    query.text = '';
    $pipelines.find(query)
      .then((res) => {
        this.pipelines = res;
      });
    globalState.commitSetSearchSidebar(store, true);

    if (this.basicLeads) {
      searchModule.dipsatchGetRealEstatePortals(store);
      this.getAllSubs();
    }
    const pipeMsg = localStorage.getItem('pipeMessage');
    if (this.basicPipe) {
      if (!pipeMsg) {
        localStorage.setItem('pipeMessage', 'show');
      } else if (pipeMsg === 'show') {
        this.showPipeMessage = true;
      }
    } else {
      localStorage.setItem('pipeMessage', 'hide');
    }

    this.$root.$on('closeAllMiniMaps', () => {
      this.showMiniMap = false;
    });
    this.updateSelectedFilters();
    this.refreshIntervalId = <any>setInterval(() => this.updateLeftSidebar(), this.refreshTime);
  }

  updateLeftSidebar() {
    const filterContact = $newObj(LeadGenFilterQuery);
    filterContact.filterType = LeadGenFilterQueryFilterType.HasContact;
    if (!this.showSidebarDisabled) {
      filterContact.enabledStatus = 0;
    }

    const filterNoContact = $newObj(LeadGenFilterQuery);
    filterNoContact.filterType = LeadGenFilterQueryFilterType.NoContact;
    if (!this.showSidebarDisabled) {
      filterNoContact.enabledStatus = 0;
    }

    // Get all contact subscriptions
    $leadGenFilters.find(filterContact)
      .then((res: IEntitySearchResult<ILeadGenFilterLightModel>) => {
        let found;
        // First add all contacts
        res.items.forEach((item) => {
          found = false;
          this.contactSubs.forEach((sub) => {
            if (sub.contact.id === item.contact.id) {
              found = true;
            }
          });
          if (!found) {
            this.contactSubs.push({ contact: item.contact, subs: { items: [] }, showMore: false });
          } else {
            found = false;
          }
        });
        // Then add subs to those grouped contacts
        res.items.forEach((item) => {
          this.contactSubs.forEach((sub, index) => {
            if (sub.contact.id === item.contact.id) {
              const subAlreadyExist = sub.subs.items.findIndex(obj => obj.id === item.id);
              if (subAlreadyExist === -1) {
                sub.subs.items.splice(index, 0 , item);
              } else {
                if (JSON.stringify(sub.subs.items[subAlreadyExist]) !== JSON.stringify(item)) {
                  if (this.selectedSub.id === item.id) {
                    this.$notify({
                      text: 'There new ads available for this subscription, please refresh to see new ones',
                      group: 'actions',
                      type: 'warn',
                      duration: 2500,
                    });
                  }
                  sub.subs.items.splice(subAlreadyExist, 1, item);
                }
              }
            }
          });
        });
      });

    // Get all own subscriptions
    $leadGenFilters.find(filterNoContact)
      .then((res: IEntitySearchResult<ILeadGenFilterLightModel>) => {
        res.items.forEach((item, index) => {
          const subAlreadyExist = this.ownSubs.items.findIndex(obj => obj.id === item.id);
          if (subAlreadyExist === -1) {
            this.ownSubs.items.splice(index, 0, item);
          } else {
            if (JSON.stringify(this.ownSubs.items[subAlreadyExist]) !== JSON.stringify(item)) {
              if (this.selectedSub.id === item.id) {
                this.$notify({
                  text: 'There new ads available for this subscription, please refresh to see new ones',
                  group: 'actions',
                  type: 'warn',
                  duration: 2500,
                });
              }
              if (this.selectedSub.name === 'All subscriptions') {
                this.$notify({
                  text: 'There new ads available, please refresh to see new ones',
                  group: 'actions',
                  type: 'warn',
                  duration: 2500,
                });
              }
              this.ownSubs.items.splice(subAlreadyExist, 1, item);
            }
          }
        });
        leadsModule.dispatchGetInboxes(store)
          .then((res) => {
            res.items.forEach((item, index) => {
              if (item.tags) {
                if (item.tags.includes('bookmarks')) {
                  const bookmarkAlreadyExist = this.bookmarks.items.findIndex(obj => obj.id === item.id);
                  if (bookmarkAlreadyExist === -1) {
                    this.bookmarks.items.splice(index, 0, item);
                  } else {
                    if (JSON.stringify(this.bookmarks.items[bookmarkAlreadyExist]) !== JSON.stringify(item)) {
                      if (this.selectedSub.leadList && this.selectedSub.leadList.id === item.id) {
                        this.$notify({
                          text: 'There new ads available for this bookmark, please refresh to see new ones',
                          group: 'actions',
                          type: 'warn',
                          duration: 2500,
                        });
                      }
                      this.bookmarks.items.splice(bookmarkAlreadyExist, 1, item);
                    }
                  }
                }

                if (item.tags.includes('my-favorites') && JSON.stringify(this.favorites) !== JSON.stringify(item)) {
                  if (this.selectedSub.leadList && this.selectedSub.leadList.id === item.id) {
                    this.$notify({
                      text: 'There new favorite ads are available, please refresh to see new ones',
                      group: 'actions',
                      type: 'warn',
                      duration: 2500,
                    });
                  }
                  this.favorites = item;
                }
              }
            });
          });
      });
  }

  showHideMap (id: any) {
    if (this.maps.indexOf(id) > -1) {
      this.maps.splice(this.maps.indexOf(id), 1);
    } else {
      for (const i in this.maps) {
        this.maps.splice(i, 1);
      }
      this.maps.push(id);
    }
    this.$forceUpdate();
  }

  toggleSidebarSearch () {
    this.showSidebarSearch = !this.showSidebarSearch;
    this.$refs.sidebarSearch.focus();
  }

  switchSidebarDisabled () {
    this.showSidebarDisabled = !this.showSidebarDisabled;
    this.loadingSubscriptions = true;
    this.getAllSubs();
  }

  refreshSubsList () {
    this.loadingSubscriptions = true;
    this.getAllSubs();
  }

  refreshLeadsList () {
    this.cleanLeads();
  }

  activeAds () {
    this.activeAdsOnly = !this.activeAdsOnly;
    this.cleanLeads();
  }

  makeCancelablePromise = (promise: any) => {
    let hasCanceled = false;

    const wrappedPromise = new Promise((resolve, reject) => {
      promise.then((val: any) =>
        hasCanceled ? reject({ isCanceled: true }) : resolve(val),
      );
      promise.catch((error: any) =>
        hasCanceled ? reject({ isCanceled: true }) : reject(error),
      );
    });

    return {
      promise: wrappedPromise,
      cancel() {
        hasCanceled = true;
      },
    };
  }

  infiniteHandler($state: any) {
    this.page += 1;
    this.loadLeads(true, this.sortFilter, $state);
  }

  async loadLeads (nextPage: boolean, sortBy: { value: string }, state?: any) {
    this.usedLeadQuery = null;

    if (!this.loadDataLids) {
      return this.loadDataLids = false;
    }
    if (this.basicLeads) {

      const query = $newObj(LeadQuery);
      if (this.tabsSubscr['showOwn'] || this.tabsSubscr['showClients']) {
        query.hasGenFilter = true;
      } else if (this.tabsSubscr['bookmarks']) {
        query.hasGenFilter = false;
      }

      if (this.selectedSub.leadList && this.selectedSub.leadList.id) {
        query.leadListId = this.selectedSub.leadList.id;
        // query.leadGenFilterId = this.selectedSub.id;
      }
      if (this.showSidebarDisabled) {
        query.leadGenFilterEnabledStatus = EntitySearchQueryEnabledStatus.All;
        query.leadListEnabledStatus = EntitySearchQueryEnabledStatus.All;
      } else {
        query.leadGenFilterEnabledStatus = EntitySearchQueryEnabledStatus.Enabled;
        query.leadListEnabledStatus = EntitySearchQueryEnabledStatus.Enabled;
      }

      query.publicationStatuses = this.activeAdsOnly ? PubQueryStatuses.Active : PubQueryStatuses.Any;

      if (this.selectedSub.name === 'All subscriptions') {
        query.hasContact = false;
      }

      if (sortBy) {
        query.sort = sortBy.value;
      }
      if (!nextPage) {
        this.page = 0;
      }
      query.page = this.page;
      query.statuses = undefined;
      query.publisherClasses = undefined;
      if (this.selectedFilters.length) {
        this.selectedFilters.forEach((filter) => {
          if (filter.leadStatusFilter) {
            query.statuses |= filter.value;
          } else {
            query.publisherClasses |= filter.value;
          }
        });
      } else { // default
        query.statuses = (LeadQueryStatuses.New | LeadQueryStatuses.Keep | LeadQueryStatuses.Viewed);
        query.publisherClasses = PubQueryPublisherClasses.Any;
      }

      this.usedLeadQuery = query;

      if (this.getLeadsList) {
        this.getLeadsList.cancel();
      }

      this.getLeadsList = this.makeCancelablePromise(leadsModule.dispatchGetLeadsList(store, query));

      this.getLeadsList
        .promise
        .then((resLeadsModule: IEntitySearchResult<ILeadLightModel>) => {
          const { id } = this.selectedSub;
          if (id) {
            $leadGenFilter(id).get()
              .then((res) => {
                this.selectedSub = $newObj(LeadGenFilterLightModel);
                this.selectedSub = res;
              });
          }
          this.pages = resLeadsModule.pageCount;
          this.checkLeadsAndSet(resLeadsModule, state);

        })
        .catch((err: Error) => {});

    } else {
      if (state) {
        state.complete();
      }
    }
  }

  checkLeadsAndSet(resLeadsModule: IEntitySearchResult<ILeadLightModel>, state: any) {
    const { items, page, pageCount, totalItemCount } = resLeadsModule;
    this.leads.page = page;
    this.leads.pageCount = pageCount;
    this.totalItemCount = totalItemCount;
    if (items.length > 0) {
      if (!this.leads.items) {
        this.leads.items = [];
      }

      items.forEach(el => this.leads.items.push(el));
      if (state) {
        state.loaded();
      }
    } else {
      if (state) {
        state.complete();
      }
    }
  }

  get filteredLeads () {
    return this.leads.items;
  }

  @Watch('sortFilter')
  sortBy () {
    this.cleanLeads();
  }

  cleanLeads() {
    this.loadDataLids = true;
    this.page = -1;
    this.leads.items = null;
    this.infiniteId += 1;
  }

  async getBookmarks () {
    await leadsModule.dispatchGetInboxes(store)
    .then((res) => {
      res.items.forEach((item) => {
        if (item.tags) {
          if (item.tags.includes('bookmarks')) {
            if (this.showSidebarDisabled) {
              this.bookmarks.items.push(item);
            } else if (item.isEnabled) {
              this.bookmarks.items.push(item);
            }
          } else if (item.tags.includes('my-favorites')) {
            this.favorites = item;
          }
        }
      });
    });
  }

  getAllSubs () {
    this.loadingSubscriptions = true;
    this.contactSubs = [];
    this.ownSubs = { items: [] };
    this.bookmarks = { items: [] };
    this.favorites = null;

    const filterContact = $newObj(LeadGenFilterQuery);
    filterContact.filterType = LeadGenFilterQueryFilterType.HasContact;
    if (!this.showSidebarDisabled) {
      filterContact.enabledStatus = 0;
    }
    const filterNoContact = $newObj(LeadGenFilterQuery);
    filterNoContact.filterType = LeadGenFilterQueryFilterType.NoContact;
    if (!this.showSidebarDisabled) {
      filterNoContact.enabledStatus = 0;
    }
    const { id } = this.selectedSub;
    if (id) {
      $leadGenFilter(id).get()
        .then((res) => {
          this.selectedSub = $newObj(LeadGenFilterLightModel);
          this.selectedSub = res;
        });
    }
    // Get all contact subscriptions
    $leadGenFilters.find(filterContact)
    .then((res: IEntitySearchResult<ILeadGenFilterLightModel>) => {
      let found;
      // First add all contacts
      res.items.forEach((item) => {
        found = false;
        this.contactSubs.forEach((sub) => {
          if (sub.contact.id === item.contact.id) {
            found = true;
          }
        });
        if (!found) {
          this.contactSubs.push({ contact: item.contact, subs: { items: [] }, showMore: false });
        } else {
          found = false;
        }
      });
      // Then add subs to those grouped contacts
      res.items.forEach((item) => {
        this.contactSubs.forEach((sub) => {
          if (sub.contact.id === item.contact.id) {
            sub.subs.items.push(item);
          }
        });
      });
      // Get all own subscriptions
      $leadGenFilters.find(filterNoContact)
      .then((res: IEntitySearchResult<ILeadGenFilterLightModel>) => {
        this.ownSubs = res;
        this.getBookmarks()
          .then(() => {
            // Check if we come from search module
            if (this.$route.params.subId) {
              let foundItem = false;
              this.tabsSubscr['bookmarks'] = false;
              this.tabsSubscr['showOwn'] = false;
              this.tabsSubscr['showClients'] = false;
              this.contactSubs.forEach((item) => {
                item.subs.items.forEach((sub) => {
                  if (sub.id === this.$route.params.subId) {
                    this.tabsSubscr['showClients'] = true;
                    item.showMore = true;
                    foundItem = true;
                    this.loadingSubscriptions = false;
                    this.selectSub(sub);
                  }
                });
              });
              this.ownSubs.items.forEach((item) => {
                if (item.id === this.$route.params.subId) {
                  this.tabsSubscr['showOwn'] = true;
                  foundItem = true;
                  this.loadingSubscriptions = false;
                  this.selectSub(item);
                }
              });
              if (!foundItem) {
                this.$router.push('/inbox');
                this.tabsSubscr['showOwn'] = true;
                this.selectSub({ name: 'All subscriptions' });
                this.loadingSubscriptions = false;
              }
            } else {
              if (!this.tabsSubscr['showClients'] && !this.tabsSubscr['showOwn'] && !this.tabsSubscr['bookmarks']) {
                this.tabsSubscr['showOwn'] = true;
                this.selectSub({ name: 'All subscriptions' });
              } else {
                if (!this.selectedSub.isEnabled) {
                  this.tabsSubscr['showOwn'] = true;
                  this.tabsSubscr['showClients'] = false;
                  this.tabsSubscr['bookmarks'] = false;
                  this.selectSub({ name: 'All subscriptions' });
                }
              }
              this.loadingSubscriptions = false;
            }
          });
      });
    });
  }

  get allSubsCount () {
    let cnt = 0;
    this.ownSubs.items.forEach((sub) => {
      if (sub.isEnabled) {
        cnt += sub.stats.existingLeadCount;
      }
    });
    return cnt;
  }
  get allSubsNewCount () {
    let cnt = 0;
    this.ownSubs.items.forEach((sub) => {
      if (sub.isEnabled) {
        cnt += sub.stats.newLeadCount;
      }
    });
    return cnt;
  }

  get filteredOwnSubs () {
    return this.ownSubs.items
      .filter((sub) => {
        return sub.name.toLowerCase().includes(this.subSearchText.toLowerCase());
      });
  }
  get filteredContactSubs () {
    return this.contactSubs
      .filter((con) => {
        return con.contact.firstName.toLowerCase().includes(this.subSearchText.toLowerCase()) ||
               con.contact.lastName.toLowerCase().includes(this.subSearchText.toLowerCase()) ||
               con.subs.items.forEach((sub) => {
                 sub.name.toLowerCase().includes(this.subSearchText.toLowerCase());
               });
      });
  }

  selectSub (item: ILeadGenFilterLightModel) {
    this.selectedLeads = [];
    this.cancelRename();
    this.closeObjectRightSidebar();
    if (item.id) {
      $leadGenFilter(item.id).get()
        .then((res) => {
          this.selectedSub = res;
          $leadList(res.leadListId).get()
            .then((res) => {
              this.selectPipeline(res.defaultPipelineId);
              this.renamingSubName = false;
              this.cleanLeads();
            });
        });
    } else {
      this.selectedSub = $newObj(LeadGenFilterLightModel);
      this.selectedSub.name = 'All subscriptions';
      this.cleanLeads();
    }
  }

  selectPipeline (id: string) {
    if (id) {
      this.pipelines.items.forEach((item) => {
        if (id === item.id) {
          this.linkedPipeline = item;
        }
      });
    } else {
      this.linkedPipeline = null;
    }
  }

  showLinkPipeModal: boolean = false;
  pipeForLink: IPipelineLightModel = null;
  showLinkToPipe (pipe: IPipelineLightModel) {
    this.pipeForLink = pipe;
    this.showLinkPipeModal = true;
  }

  linkToPipe () {
    this.showLinkPipeModal = false;
    this.selectPipeline(this.pipeForLink.id);
    $leadList(this.selectedSub.leadList.id).updateDefaultPipelineId(this.pipeForLink.id)
      .then((res) => {
        this.pipeForLink = null;
        this.cleanLeads();
      });
  }
  cancelLinkPipeModal () {
    this.showLinkPipeModal = false;
    this.pipeForLink = null;
  }

  selectBookmark (item: ILeadListLightModel) {
    this.closeObjectRightSidebar();
    this.selectedSub = $newObj(LeadGenFilterLightModel);
    this.selectedSub.name = item.name;
    this.selectedSub.isEnabled = item.isEnabled;
    this.selectedSub.leadList = $newObj(LeadListNestedModel);
    this.selectedSub.leadList.id = item.id;
    this.selectedSub.stats = item.stats;
    this.cancelRename();
    this.cleanLeads();
  }

  checkIfSelected (lead: ILeadLightModel) {
    let selected = false;
    this.selectedLeads.forEach((i) => {
      if (lead.id === i.id) {
        selected = true;
      }
    });
    return selected;
  }

  addToSelected (lead: ILeadLightModel) {
    let found = false;
    this.selectedLeads.forEach((i) => {
      if (lead.id === i.id) {
        found = true;
      }
    });
    if (found) {
      const index = this.selectedLeads.indexOf(lead);
      this.selectedLeads.splice(index, 1);
    } else {
      this.selectedLeads.push(lead);
    }
  }

  sendLeads () {
    const leadIds: Array<string> = [];
    const email: TemplatedMailMessageRequest = $newObj(TemplatedMailMessageRequest);
    if (this.selectedSub.contact && this.selectedSub.contact.email) {
      email.to.push(this.selectedSub.contact.email);
    } else if (this.contactEmail1) {
      email.to.push(this.contactEmail1);
    } else if (this.contactEmail2) {
      email.to.push(this.contactEmail2);
    }
    this.selectedLeads.forEach((item) => {
      leadIds.push(item.id);
    });
    const sendData = {
      leadIds,
      mailMessage: email,
    };
    leadsModule.dispatchSendLeads(store, sendData)
      .then(() => {
        this.showSidebar = false;
        this.selectedLeads = [];
        this.contactEmail2 = null;
        this.contactEmail1 = null;
      });
  }

  show(tab: string) {
    for (const i in this.tabsSubscr) {
      if (i === tab) {
        this.tabsSubscr[i] = true;
      } else {
        this.tabsSubscr[i] = false;
      }
    }
  }

  editSubscription (id: string, ref: string) {
    this.editSub = true;
    this.editSubId = id;
    const refName = ref;
    setTimeout(() => {
      if (refName && this.$refs[refName]) {
        this.$refs[refName][0].focus();
      }
    },         1);
  }

  renameSubName (sub: ILeadGenFilterLightModel) {
    this.editSub = false;
    this.editSubId = null;
    $leadGenFilter(sub.id).updateName(sub.name)
      .then((res) => {
        this.renamingSubName = false;
        if (this.selectedSub.id === sub.id) {
          this.selectedSub.name = sub.name;
        }
        leadsModule.dispatchGetLeadsListById(store, sub.leadList.id)
          .then((res1) => {
            if (res1) {
              Vue.prototype.$notify({
                group: 'actions',
                type: 'success',
                duration: 2500,
                text: 'Successfully updated subscription name',
              });
              if (res1.defaultPipelineId) {
                $pipeline(res1.defaultPipelineId).updateName(sub.name);
              }
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
  }
  renameInboxName (inbox: ILeadListLightModel) {
    this.editSub = false;
    this.editSubId = null;
    leadsModule.dispatchUpdateLeadListName(store, { id: inbox.id, name: inbox.name })
      .then((res) => {
        this.renamingSubName = false;
        if (this.selectedSub.leadList && this.selectedSub.leadList.id === inbox.id) {
          this.selectedSub.name = inbox.name;
        }
        leadsModule.dispatchGetLeadsListById(store, inbox.id)
          .then((res1) => {
            if (res1) {
              Vue.prototype.$notify({
                group: 'actions',
                type: 'success',
                duration: 2500,
                text: 'Successfully updated inbox name',
              });
              if (res1.defaultPipelineId) {
                $pipeline(res1.defaultPipelineId).updateName(inbox.name);
              }
            } else {
              Vue.prototype.$notify({
                group: 'actions',
                type: 'error',
                duration: 2500,
                text: 'Error while trying to update inbox name',
              });
            }
          });
      });
  }

  cancelRename () {
    this.editSub = false;
    this.editSubId = null;
  }

  decreaseNewCount (it: ILeadLightModel, newCnt: boolean) {
    if (this.tabsSubscr['showOwn']) {
      this.ownSubs.items.filter((item: LeadGenFilterLightModel) => {
        if (it.leadGenFilter && item.name === it.leadGenFilter.name) {
          if (newCnt) {
            Vue.set(item.stats, 'newLeadCount', item.stats.newLeadCount - 1);
          } else {
            Vue.set(item.stats, 'existingLeadCount', item.stats.existingLeadCount - 1);
          }
        }
      });
    } else if (this.tabsSubscr['showClients']) {
      this.contactSubs.filter((sub: ContactSubs) => {
        if (sub.contact.id === this.selectedSub.contact.id) {
          sub.subs.items.filter((item: LeadGenFilterLightModel) => {
            if (item.name === it.leadGenFilter.name) {
              if (newCnt) {
                Vue.set(item.stats, 'newLeadCount', item.stats.newLeadCount - 1);
              } else {
                Vue.set(item.stats, 'existingLeadCount', item.stats.existingLeadCount - 1);
              }
            }
          });
        }
      });
    } else if (this.tabsSubscr['bookmarks']) {
      this.bookmarks.items.filter((item: ILeadListLightModel) => {
        if (it.leadList && item.id === it.leadList.id) {
          if (newCnt) {
            Vue.set(item.stats, 'newLeadCount', item.stats.newLeadCount - 1);
          } else {
            Vue.set(item.stats, 'existingLeadCount', item.stats.existingLeadCount - 1);
          }
        }
      });
    }
    if ((it.leadGenFilter && (this.selectedSub.name === it.leadGenFilter.name) || (this.selectedSub.leadList && it.leadList && this.selectedSub.leadList.id === it.leadList.id))) {
      if (newCnt) {
        Vue.set(this.selectedSub.stats, 'newLeadCount', this.selectedSub.stats.newLeadCount - 1);
      } else {
        Vue.set(this.selectedSub.stats, 'existingLeadCount', this.selectedSub.stats.existingLeadCount - 1);
      }
    }
  }

  selectItem (index: number, arrow: boolean, switchHistory: boolean) {
    globalState.commitSetNextItem(store, true);
    this.selectedIndex = index;
    this.showHistoryFirst = switchHistory;

    if (this.leads.items[index]) {
      // Not getting full LeadModel because we have publication id in LightModel
      // leadsModule.dispatchGetLead(store, this.leads.items[index].id)
      // .then((res) => {
      if (this.leads.items) {
        this.countItems = this.leads.items.length;
      }
      this.selectedItem = this.leads.items[index];
      // this.selectedItem = res;
      if (arrow) {
        this.$nextTick(() => {
          const el = document.getElementById(`#item${index}`);
          if (el) {
            el.scrollIntoView({ block: 'end', behavior: 'smooth' });
          }
        });
      }
      globalState.commitShowRightSidebar(store, true);
      if (this.leads.items[index].status === LeadStatus.New) {
        this.leads.items[index].status = LeadStatus.Viewed;
        leadsModule.dispatchUpdateLeadStatus(store, { id: this.leads.items[index].id, status: LeadStatus.Viewed })
          .then(() => {
            this.decreaseNewCount(this.leads.items[index], true);
          });
      }
    }
    if (this.page === this.leads.pageCount) {
      const next = index + 1;
      if (!this.leads.items[next]) {
        globalState.commitSetNextItem(store, false);
      }
    }
  }

  closeObjectRightSidebar() {
    this.selectedIndex = -1;
    this.selectedItem = new LeadModel();
    globalState.commitShowRightSidebar(store, false);
  }

  renameSub () {
    this.renamingSubName = true;
    setTimeout(() => {
      this.$refs['subNameRef'].focus();
    },         1);
  }

  leadUpdateStatus (lead: ILeadModel, status: boolean) {
    if (lead.status === LeadStatus.New) {
      this.decreaseNewCount(lead, true);
    }
    let s: LeadStatus;
    status ? s = LeadStatus.Keep : s = LeadStatus.Remove;
    lead.status = s;
    if (s === LeadStatus.Keep) {
      if (!this.selectedFilters.find((item) => {
        return item.text === 'Highlighted';
      })) {
        this.totalItemCount = this.totalItemCount - 1;
      }
      if (this.selectedFilters.find((item) => {
        return item.text === 'Unhandled' || item.text === 'Deleted';
      })) {
        this.leads.items.splice(this.leads.items.indexOf(lead), 1);
        if (lead.id === this.selectedItem.id) {
          this.closeObjectRightSidebar();
        }
      }
    }
    if (s === LeadStatus.Remove) {
      if (!this.selectedFilters.find((item) => {
        return item.text === 'Deleted';
      })) {
        this.totalItemCount = this.totalItemCount - 1;
        this.leads.items.splice(this.leads.items.indexOf(lead), 1);
        if (lead.id === this.selectedItem.id) {
          this.closeObjectRightSidebar();
        }
      }
      this.decreaseNewCount(lead, false);
    }

    if (this.leads.items.length < 5) {
      this.$nextTick(() => {
        this.infiniteHandler(undefined);
      });
    }

    if (this.leads.items.length === 0) {
      this.$refs.infiniteLoading.stateChanger.error();
    }

    leadsModule.dispatchUpdateLeadStatus(store, { id: lead.id, status: s })
      .then(() => {
        if (this.basicPipe) {
          if (s === LeadStatus.Keep) {
            leadsModule.dispatchGetLeadsListById(store, lead.leadList.id)
                .then((res) => {
                  const id = res.defaultPipelineId;
                  if (lead.id && id && !lead.isOnPipeline) {
                    $lead(lead.id).addToPipeline(id)
                      .then(() => {
                        // this.selectSub(this.selectedSub);
                      });
                  }
                });
          } else {
            // this.selectSub(this.selectedSub);
          }
        }
      });
  }

  leadForUpdate: ILeadModel = null;
  leadStatus: boolean = null;
  updateLeadStatus (lead: ILeadModel, status: boolean) {
    if (this.basicPipe && getUserContext(store).devSettings) {
      if (lead['defaultPipeline'] || !status) {
        this.leadUpdateStatus(lead, status);
      } else {
        this.leadForUpdate = lead;
        this.leadStatus = status;
        this.showPipeModal = true;
      }
    } else {
      const showMsg = localStorage.getItem('pipeMessage');
      if (showMsg === 'show') {
        this.showPipeMessage = true;
      }
      this.leadUpdateStatus(lead, status);
    }
  }

  showPipeMessage: boolean = false;
  hidePipeMessage () {
    this.showPipeMessage = false;
    localStorage.setItem('pipeMessage', 'hide');
  }

  showDeactivateSub (sub: ILeadGenFilterLightModel, deactivate: boolean) {
    this.subForDelete = sub;
    this.deactivate = deactivate;
    this.showModal = true;
  }
  inboxForDelete: ILeadListLightModel = null;

  deactivateSub () {
    this.showModal = false;
    $leadGenFilter(this.subForDelete.id).updateIsEnabled(!this.deactivate)
      .then((res) => {
        if (res) {
          Vue.prototype.$notify({
            group: 'actions',
            type: 'success',
            duration: 2500,
            text: 'Subscription successfully updated',
          });
          if (this.subForDelete.id === this.selectedSub.id) {
            this.selectedSub = $newObj(LeadGenFilterLightModel);
            this.selectedSub.name = 'All subscriptions';
          }
          this.subForDelete = null;
          this.ownSubs = { items: [] };
          this.contactSubs = [];
          this.leads = { items: [] };
          this.getAllSubs();
        } else {
          this.subForDelete = null;
          Vue.prototype.$notify({
            group: 'actions',
            type: 'error',
            duration: 2500,
            text: 'Error while trying to update subscription',
          });
        }
      });
  }

  deleteSub (sub: ILeadGenFilterLightModel) {
    this.subForDelete = sub;
    this.showDeleteModal = true;
  }
  deleteLeadList (inbox: ILeadListLightModel) {
    this.inboxForDelete = inbox;
    this.showDeleteModal = true;
  }

  confirmDeleteSub () {
    this.showDeleteModal = false;
    $leadGenFilter(this.subForDelete.id).delete()
      .then((res) => {
        if (res) {
          leadsModule.dispatchDeleteLeadsList(store, this.subForDelete.leadList.id)
            .then((res1: any) => {
              // pipelineModule.dispatchRemovePipeline(store, this.subForDelete.leadList.id)
              if (res1) {
                if (this.subForDelete.id === this.selectedSub.id) {
                  if (this.tabsSubscr['showClients']) {
                    this.contactSubs.forEach((item) => {
                      if (item.contact.id === this.subForDelete.contact.id) {
                        item.subs.items.splice(item.subs.items.indexOf(this.subForDelete), 1);
                      }
                    });
                    const withoutSubId =  this.contactSubs.findIndex(el => el.subs.items.length === 0);
                    if (withoutSubId !== -1) {
                      this.contactSubs.splice(withoutSubId, 1);
                    }
                    if (this.contactSubs.length) {
                      this.selectSub(this.contactSubs[0].subs.items[0]);
                    } else {
                      this.selectedSub = $newObj(LeadGenFilterLightModel);
                      this.selectedSub.name = 'All subscriptions';
                    }
                  } else if (this.tabsSubscr['showOwn']) {
                    this.ownSubs.items.forEach((item) => {
                      if (item.id === this.subForDelete.id) {
                        this.ownSubs.items.splice(this.ownSubs.items.indexOf(this.subForDelete), 1);
                      }
                    });
                    this.selectedSub = $newObj(LeadGenFilterLightModel);
                    this.selectedSub.name = 'All subscriptions';
                  } else {
                    this.selectedSub = $newObj(LeadGenFilterLightModel);
                    this.selectedSub.name = 'All subscriptions';
                  }
                }
                this.subForDelete = null;
                Vue.prototype.$notify({
                  group: 'actions',
                  type: 'success',
                  duration: 2500,
                  text: 'Subscription successfully deleted',
                });
                // this.ownSubs = { items: [] };
                // this.contactSubs = [];
                // this.leads = { items: [] };
                // this.getAllSubs();
              } else {
                this.subForDelete = null;
                Vue.prototype.$notify({
                  group: 'actions',
                  type: 'error',
                  duration: 2500,
                  text: 'Error while trying to delete subscription',
                });
              }
            });
        } else {
          this.subForDelete = null;
          Vue.prototype.$notify({
            group: 'actions',
            type: 'error',
            duration: 2500,
            text: 'Error while trying to delete subscription',
          });
        }
      });
  }

  confirmDeleteInbox () {
    this.showDeleteModal = false;
    leadsModule.dispatchDeleteLeadsList(store, this.inboxForDelete.id)
      .then((res1: any) => {
        // pipelineModule.dispatchRemovePipeline(store, this.inboxForDelete.id)
        if (res1) {
          if (this.selectedSub.leadList && this.inboxForDelete.id === this.selectedSub.leadList.id) {
            this.selectBookmark(this.favorites);
          }
          this.getAllSubs();
          Vue.prototype.$notify({
            group: 'actions',
            type: 'success',
            duration: 2500,
            text: 'Inbox successfully deleted',
          });
          this.inboxForDelete = null;
        } else {
          this.inboxForDelete = null;
          Vue.prototype.$notify({
            group: 'actions',
            type: 'error',
            duration: 2500,
            text: 'Error while trying to delete inbox',
          });
        }
      });
  }

  cancelModal () {
    this.showModal = false;
    this.showDeleteModal = false;
    this.subForDelete = null;
    this.inboxForDelete = null;
  }

  editInSearchAbo (sub: ILeadGenFilterLightModel) {
    this.$router.push({ path: `/search/${sub.id}` });
  }

  getVendorType (type: number) {
    return PubPublisherType[type];
  }
  getTriggerName (trigger: IPubLeadGenTrigger) {
    const name = PubQueryLeadGenTriggerType[trigger.type];
    return name.match(/[A-Z][a-z]+/g).join(' ');
  }
  searchSidebarToggle () {
    const searchSidebar =  document.querySelector('#side-overlay');
    const mainContainer = document.querySelector('#main-container');
    if (searchSidebar.classList.contains('active')) {
      searchSidebar.classList.remove('active');
      globalState.commitSetSearchSidebar(this.$store, false);
    } else {
      searchSidebar.classList.add('active');
      globalState.commitSetSearchSidebar(this.$store, true);
    }
    if (mainContainer.classList.contains('with-second-sidebar')) {
      mainContainer.classList.remove('with-second-sidebar');
    } else {
      mainContainer.classList.add('with-second-sidebar');
    }
  }

  downloadExcel (all: boolean) {
    if (this.usedLeadQuery) {
      this.downloading = true;
      const model = $newObj(LeadExportModel);
      // model.timeZoneOffsetMinutes = new Date().getTimezoneOffset();
      model.query = _.cloneDeep(this.usedLeadQuery);
      delete model.query.page;
      model.query.maxItemCount = 500;
      if (all) {
        model.period = 1;
      } else {
        model.period = 0;
      }
      $leads.export(model)
        .then((res) => {
          const saveBlob = (function () {
            const a = document.createElement('a');
            document.body.appendChild(a);
            return function (blob: any, fileName: string) {
              const url = window.URL.createObjectURL(blob);
              a.href = url;
              a.download = fileName;
              a.click();
              window.URL.revokeObjectURL(url);
            };
          }());
          const name = res.fileName || `Export_${this.getDateAndTime(new Date(), 'DDMMYYYY_hhmm')}.xlsx`;
          saveBlob(res.data, name);
          this.downloading = false;
        });
    }
  }

  newPipeline: PipelineModel = $newObj(PipelineModel);
  modalLoading: boolean = false;
  addToNewPipe () {
    this.modalLoading = true;
    this.newPipeline.isEnabled = true;
    $pipelines.create(this.newPipeline)
      .then((res: Pipeline) => {
        const resPipe = res;
        $leadList(this.leadForUpdate.leadList.id).updateDefaultPipelineId(res.id)
          .then((res: boolean) => {
            this.leadUpdateStatus(this.leadForUpdate, this.leadStatus);
            this.closeNewPipeModal();
            this.modalLoading = false;
            const query = $newObj(EntitySearchQuery);
            query.text = '';
            $pipelines.find(query)
              .then((res) => {
                this.pipelines = res;
                this.selectPipeline(resPipe.id);
                this.cleanLeads();
              });
          });
      });
  }
  addToExistingPipe () {
    this.modalLoading = true;
    $leadList(this.leadForUpdate.leadList.id).updateDefaultPipelineId(this.selectedPipeline.id)
      .then((res: boolean) => {
        this.selectPipeline(this.selectedPipeline.id);
        this.leadUpdateStatus(this.leadForUpdate, this.leadStatus);
        this.closeNewPipeModal();
        this.cleanLeads();
        this.modalLoading = false;
      });
  }
  closeNewPipeModal () {
    this.showPipeModal = !this.showPipeModal;
    this.selectedPipeline = $newObj(PipelineLightModel);
    this.newPipeline = $newObj(PipelineModel);
    this.leadForUpdate = null;
    this.leadStatus = null;
  }
  cancelNew () {
    this.createNewPipelineInput = !this.createNewPipelineInput;
    this.newPipeline = $newObj(PipelineModel);
  }
  cancelExisting () {
    this.createNewPipelineInput = !this.createNewPipelineInput;
    this.selectedPipeline = $newObj(PipelineLightModel);
  }

  updateSelectedFilters () {
    const inboxFilters = leadsModule.getInboxFilters(store);
    if (inboxFilters.sortFilter.text) {
      this.sortFilter = inboxFilters.sortFilter;
    }
    this.activeAdsOnly = inboxFilters.onlyActive;
    if (inboxFilters.vendorFilters.length) {
      this.updateVendorFilters(inboxFilters.vendorFilters);
    } else {
      this.cleanLeads();
    }
  }

  updateVendorFilters (el: Array<FilterOptionModel>) {
    el.forEach((item: FilterOptionModel) => {
      if (this.selectedFilters.indexOf(item) === -1) {
        this.selectedFilters.unshift(item);
        this.filterSelect[item.leadStatusFilter ? 0 : 1].options.forEach((filter: FilterOptionModel, index: number) => {
          if (filter.value === item.value) {
            this.filterSelect[item.leadStatusFilter ? 0 : 1].options.splice(index, 1);
          }
        });
      }
    });
    this.cleanLeads();
  }

  removeFilterTimer: any = null;
  removeFilter (el: FilterOptionModel, index: number): void {
    clearTimeout(this.removeFilterTimer);
    if (el.leadStatusFilter) {
      this.filterSelect[0].options.unshift(this.selectedFilters[index]);
    } else {
      this.filterSelect[1].options.unshift(this.selectedFilters[index]);
    }
    this.selectedFilters.splice(index, 1);
    this.removeFilterTimer = setTimeout(() => {
      this.cleanLeads();
    },                      1000);
  }

  beforeDestroy () {
    clearInterval(this.refreshIntervalId);
    leadsModule.commitSetInboxFilters(store, {
      vendorFilters: this.selectedFilters,
      sortFilter: this.sortFilter,
      onlyActive: this.activeAdsOnly,
    });
  }

  addDealInList: boolean = false;
  reloadPipelines (newPipe: Pipeline) {
    const query = $newObj(EntitySearchQuery);
    query.text = '';
    pipelineModule.dispatchGetPipelines(store, query)
      .then((res: IEntitySearchResult<IPipelineLightModel>) => {
        this.pipelines = res;
        this.selectPipeline(newPipe.id);
        $leadList(this.selectedSub.leadList.id).updateDefaultPipelineId(newPipe.id)
          .then((res) => {
            this.pipeForLink = null;
            this.cleanLeads();
          });
      });
  }
}
