import Vue from 'vue';
import { Component, Watch, Prop } from 'vue-property-decorator';
import template from './leftSidebarTemplate.vue';
import * as api from '@immosparrow/cockpit-api-v2';
import store from '../../../store';
import * as searchModule from './../../../store/modules/searchModule';
import * as globalState from './../../../store/modules/globalStatesModule';
import * as auth from './../../../store/modules/authStatesModule';
import { OptionModel } from '../../../models';
import autocomplete from './../../addressAutocomplete';
import Base from './../../base';
import Debounce from 'debounce-decorator';
import _ from 'lodash';
import ColorPicker from './../../shared/color_picker';
import SearchAbo from '../searchAbo/';
import VueSlider from 'vue-slider-component';
import * as pipelineModule from '../../../store/modules/pipeline';
import * as leadsModule from '../../../store/modules/leads';
import * as search from '../../../store/modules/searchStatesModule';
import { SingleCall } from '../../call';
import Modal from '../../../components/modal';
import ConfirmModal from '../../../components/modal/confirmModal';
import UpgradeModal from '../../../components/modal/upgradeModal';
import * as history from './../../../store/modules/history';
import { safeVal } from '@immosparrow/cockpit-lib-core';
import SubsTab from './subsTab';
import InputNumber from '../../shared/number.vue';
import * as turf from '@turf/turf';

export interface Counter {
  next(): number;
}
/* eslint-disable no-param-reassign */
export function new_counter(init = 0): Counter {
  return {
    // tslint:disable-next-line
    next: () => ++ init,
  };
}
/* eslint-enable */

export const counter = new_counter(1);

interface Polygon {
  center: number[]; color: string; drawStyle: string; geom:{coordinates: []; type: string}; id: string; inifinite: boolean; name: string;
}

@Component({
  mixins: [template],
  components: {
    autocomplete,
    ColorPicker,
    SearchAbo,
    VueSlider,
    Modal,
    ConfirmModal,
    SubsTab,
    InputNumber,
    UpgradeModal,
  },
  filters: {
    currency(amount: number) {
      return amount && amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, "'");
    },
  },
})
export default class SearchSidebar extends Base {

  @Prop({ default: null })
  addressFromMap: {name: string; id: string; color: string; type: number; geom: any; fromClick: boolean; time: number};

  @Prop({ default: null })
  addressForRemoveFromList: {id: string; time: number};

  @Prop({ default: null })
  shapeFromMap: Polygon;

  @Prop({ default: null })
  travelPolygon: {geo: []; id: string};

  @Prop({ default: null })
  travelPolygonPoint: {id: string; geom: {coordinates: []}; color: string};

  @Prop({ default: null })
  shapeWithUpdatedRadius: {geom: any; id: string};

  @Prop({ default: null })
  addressWithRadiusUpdated: {id: string; time: number, geometry:{type: string; coordinates: [number[]]}};

  @Prop({ default: null })
  viewPortForSearchShapes: {id: string, color: string, name: string, polygon:[], show: boolean};

  orignalShapes: any = undefined;
  mapIsLoadedVar: boolean = false;
  viewPortIsActive: boolean = false;
  isLoading: boolean = false;
  isFromRecord: boolean = false;
  viewPortNameEdit: boolean = false;
  workspace: boolean = false;
  workspacePlaces: any[];
  workspacePlacesBase: any[];
  markerGroupName: string = '';
  editingValue: boolean = false;
  newValue: string = '';
  showMore: boolean = true;
  loaded: boolean = false;
  showLocalityRequired: boolean = false;
  mainCategoryRequired: boolean = false;
  resultsCounter: api.IPubSearchResultCount = new api.PubSearchResultCount();
  historicAds: boolean = false;
  lastCalcObject: any = {};
  currentShape: any = {};
  selectedPoints: any = [];
  selectedIndex: number = null;
  subEditMode: boolean = false;
  agencyWorkspaceRestriction: boolean = false;

  travelTimesValues: any = [];
  travelTimes: any = {};

  searchHistoryTabs: object = {
    searchHistoryOverview: true,
    searchHistorySaved: false,
  };

  val: Function = safeVal;

  showHisPopover: boolean = false;
  showWorPopover: boolean = false;
  showInhPopover: boolean = false;
  currentBundleCount: number = null;

  showHistoryTab(tab: string) {
    for (const i in this.searchHistoryTabs) {
      if (i === tab) {
        this.searchHistoryTabs[i] = true;
      } else {
        this.searchHistoryTabs[i] = false;
      }
    }
  }

  // Temporary Demo Code
  editGroupName: boolean = false;
  viewPortName: boolean = false;

  travelTypes: any = {};
  get counterItems() {
    return this.resultsCounter;
  }

  tabCategory: object = {
    searchBuy: false,
    searchRent: false,
  };

  /* OPTIONS DATA */
  sortOptions: {value: string, text: string, label: string, display: string}[] = [
    { value: undefined, text: 'Standard', label: '', display: '' },
    { value: '+PublicationTime', text: 'First Publication', label: 'oldest first', display: '' },
    { value: '-PublicationTime', text: 'First Publication', label: 'newest first', display: '' },
    { value: '+LastUpdateTime', text: 'Last Update', label: 'oldest first', display: '' },
    { value: '-LastUpdateTime', text: 'Last Update', label: 'newest first', display: '' },
    { value: '+Price', text: 'Price', label: 'cheapest first', display: '' },
    { value: '-Price', text: 'Price', label: 'expensive first', display: '' },
    { value: '+BuiltYear', text: 'Built year', label: 'oldest first', display: '' },
    { value: '-BuiltYear', text: 'Built year', label: 'newest first', display: '' },
    { value: '+LivingArea', text: 'Living area', label: 'smallest first', display: '' },
    { value: '-LivingArea', text: 'Living area', label: 'biggest first', display: '' },
    { value: '+RoomCount', text: 'Rooms', label: 'less first', display: '' },
    { value: '-RoomCount', text: 'Rooms', label: 'most first', display: '' },
    { value: '+LastPriceChangeTime', text: 'Last price change', label: 'oldest first', display: '' },
    { value: '-LastPriceChangeTime', text: 'Last price change', label: 'newest first', display: '' },
    { value: '+Zip', text: 'Zip', label: '', display: '' },
    { value: '+Locality', text: 'Locality', label: '', display: '' },
  ];
  vendorOptions: OptionModel[] = [
    { value: api.PubQueryPublisherClasses.Unknown, text: 'Unknown' },
    { value: api.PubQueryPublisherClasses.Professional, text: 'Professional' },
    { value: api.PubQueryPublisherClasses.NonProfessional, text: 'NonProfessional' },
    { value: api.PubQueryPublisherClasses.Uncertain, text: 'Uncertain' },
  ];
  vendor: OptionModel = { value: undefined, text: 'Vendor type' };

  selectedVendors: OptionModel[] = [];

  /* Search model */
  searchModel = api.$newObj(api.PubQuery);
  searchAgainModel: api.QueryListEntryModel<any, any> = null;
  pageNum: number = 0;
  perPage: number = 10;
  pages: number = 0;

  viewPort: any = null;

  mainCategories: api.IPubPropertyCategory[] = [];
  selectedMainCategories: api.IPubPropertyCategory[] = [];
  competitorOptions: api.IPubPublisherModel[] = [];
  selectedCompetitors: api.IPubPublisherModel[] = [];
  realEstateOptions: api.IPubSiteModel[] = [];
  selectedRealEstateOptions: api.IPubSiteModel[] = [];
  subCategories: api.IPubPropertyType[] = [];
  selectedSubCategories: api.IPubPropertyType[] = [];

  searchSuggestions: api.GeoSuggestion = new api.GeoSuggestion();
  selectedSearchSuggestions: api.IGeoSuggestion[] = [];
  selectedSearchSuggestionsStrings: string[] = [];
  onlyPartereFloor: boolean = false;

  sortBy: {value: string, text: string, icon?: string} = { value: undefined, text: 'Standard', icon: undefined };

  searchMap: boolean = false;
  switchSearchAbo: boolean = false;
  shapes: any[] = [];
  viewPorts: any[] = [];
  points: {id: string; geom: {coordinates: []}}[] = [];
  travelPolygons: any[] = [];

  colorsUsed: string[] = [];
  timer: any = null;

  selectedSub: api.LeadGenFilterModel = api.$newObj(api.LeadGenFilterModel);

  extendIndex: number = -1;
  showExtendKmModal: boolean = false;
  showAboModal: boolean = false;
  extendKm: any = null;

  disabledDatesHisMax: any = {
    to: new Date(2011, 0, 1),
    from: new Date(new Date().getFullYear() + 1, 0, 1),
  };
  disabledDatesHisMin: any = {
    to: new Date(2011, 0, 1),
    from: new Date(new Date().getFullYear() + 1, 0, 1),
  };

  disabledDatesPubMax: any = {
    to: new Date(2011, 0, 1),
    from: new Date(),
  };
  disabledDatesPubMin: any = {
    to: new Date(2011, 0, 1),
    from: new Date(),
  };

  @Watch('searchModel.publicationTime.min')
  minPubTime () {
    Vue.set(this.disabledDatesPubMax, 'to', this.searchModel.publicationTime.min);
  }
  @Watch('searchModel.publicationTime.max')
  maxPubTime () {
    Vue.set(this.disabledDatesPubMin, 'from', this.searchModel.publicationTime.max);
  }
  @Watch('searchModel.inactivePublicationTime.min')
  minHisTime () {
    Vue.set(this.disabledDatesHisMax, 'to', this.searchModel.inactivePublicationTime.min);
  }
  @Watch('searchModel.inactivePublicationTime.max')
  maxHisTime () {
    Vue.set(this.disabledDatesHisMin, 'from', this.searchModel.inactivePublicationTime.max);
  }

  get publicationHighlighated(): object {
    return {
      to: this.searchModel.publicationTime.max,
      from: this.searchModel.publicationTime.min,
    };
  }

  get sortedVendorOptions() {
    return this.vendorOptions.sort((a, b) => {
      return a.text.localeCompare(b.text);
    });
  }

  get sortedRealEstateOptions() {
    return this.realEstateOptions.sort((a, b) => {
      return a.name.localeCompare(b.name);
    });
  }

  get sortedMainCategories() {
    return this.mainCategories.sort((a, b) => {
      return a.name.localeCompare(b.name);
    });
  }

  get sortedSubCategories() {
    return this.subCategories.sort((a, b) => {
      return a.name.localeCompare(b.name);
    });
  }

  initsearchModel () {
    this.searchModel = api.$newObj(api.PubQuery);
    this.searchModel.amenities = api.$newObj(api.PubQueryAmenities);
    this.searchModel.searchArea = api.$newObj(api.GeoAreaSet);
    this.searchModel.searchArea.addressParts = [];
    this.searchModel.price = api.$newObj(api.SearchQueryRangeOfDouble);
    this.searchModel.roomCount = api.$newObj(api.SearchQueryRangeOfDouble);
    this.searchModel.livingArea = api.$newObj(api.SearchQueryRangeOfDouble);
    this.searchModel.usableArea = api.$newObj(api.SearchQueryRangeOfDouble);
    this.searchModel.propertyArea = api.$newObj(api.SearchQueryRangeOfDouble);
    this.searchModel.publisherTypes = -1;
    // this always has to be set
    // get status from `Include historic ads`
    this.searchModel.publicationStatuses = api.PubQueryStatuses.Active;
    this.searchModel.publisherTypes = api.PubQueryPublisherTypes.Any;
    this.searchModel.publicationTime = api.$newObj(api.SearchQueryRangeOfDateTime);
    this.searchModel.availableDate = api.$newObj(api.SearchQueryRangeOfDateTime);
    this.searchModel.builtYear = api.$newObj(api.SearchQueryRangeOfInt32);
    this.searchModel.inactivePublicationTime = api.$newObj(api.SearchQueryRangeOfDateTime);
    this.searchModel.transactionType = api.PubTransactionType.Buy;
    this.searchModel.publisherClasses = api.PubQueryPublisherClasses.Any;
    this.searchModel.textSearchMode = api.PubTextSearchMode.PhraseSearch;
  }

  get fullYear() {
    return new Date().getFullYear();
  }
  created() {

    this.$validator.extend('canNotBeZero', {
      getMessage: (field: string) =>  {
        return `${field}` + ' can not be 0';
      },
      validate: (value: string) => {
        return parseInt(value) !== 0;
      },
    });
    this.$validator.extend('isSmaller', {
      getMessage: (field: string) =>  {
        const fieldName = field.split('Min');
        return 'Min ' + `${fieldName}` + ' can not be greater than max ' + `${fieldName}`;
      },
      validate: (value: string, otherValue: string[]) => {
        if (value && otherValue[0]) {
          return parseInt(value) <= parseInt(otherValue[0]);
        }

        return true;
      },
    });

    this.loaded = false;
    this.tabCategory['searchBuy'] = true;

    this.getSearchHistory();
    this.getBookmarks();

    if (localStorage.getItem('autoLoadHistory_searchModule')) {
      this.autoLoadHistory = true;
    }

    this.$root.$on('agencyWorkspaceRestriction', (value: boolean) => {
      this.agencyWorkspaceRestriction = value;
    });

    globalState.commitSetLoadingButton(store, false);
    globalState.commitShowOverviewList(store, false);
    globalState.commitShowRightSidebar(store, false);
    globalState.commitShowMapRightSidebar(store, false);
    globalState.commitShowSearchMap(store, true);
    this.searchSuggestions = new api.GeoSuggestion();

    this.initsearchModel();
    this.$root.$on('map_is_loaded', () => {
      this.mapIsLoadedVar = true;
    });

    if (this.basicSearch) {
      this.getAllSubs();
      this.getPipeLines();
      searchModule.dispatchGetPropertyTypes(store)
        .then(() => {
          const cats = _.cloneDeep(searchModule.getPropertyTypes(store));
          this.mainCategories = cats;
          this.searchModel.propertyTypeIds = undefined;
          searchModule.dipsatchGetCompetitors(store)
            .then(() => {
              const comps = _.cloneDeep(searchModule.getCompetitors(store));
              this.competitorOptions = comps;
            });
          searchModule.dipsatchGetRealEstatePortals(store)
            .then(() => {
              const portals = _.cloneDeep(searchModule.getRealEstatePortals(store));
              this.realEstateOptions = portals;
            });
        });

      this.counterSearch();

      globalState.commitSetSearchSidebar(store, true);

      this.$root.$on('remove_all_markers_from_search', (id: any) => {
        this.searchModuleResults = undefined;
      });

      this.$root.$on('closeModal', () => {
        this.cloaseSearchAboModal();
        this.getAllSubs();
        this.getPipeLines();
      });

      this.$emit('getViewPort');
    } else {
      this.loaded = true;
    }

    this.$on('showMapOnToggle', (v: boolean) => {
      if (v) {
        this.searchSidebarToggleIn();
      }
    });
  }

  restrictByArea() {
    this.showControl('RestrictedArea');
    const getAddressCordinate = (areas: api.GeoAreaAddressPart[]): Promise<api.GeoAddressPart[]> => {
      const ids: string[] = [];
      areas.forEach(i => ids.push(i.id));
      return api.$geo.getAddressParts(ids);
    };
    const { workspaceGeoRestriction } = this.empCtx;
    const areasWorkspace = workspaceGeoRestriction.addressParts;
    getAddressCordinate(areasWorkspace).then((data) => {
      data.forEach((item) => {
        const createPloigon = (item: api.GeoAddressPart) => {
          let oneItem: any[] = [];
          oneItem = item.geom.coordinates;
          return turf.multiPolygon(oneItem);
        };
        const onePoligon = createPloigon(item);
        const address = new api.GeoAreaAddressPart();
        address.id = item.id;
        address.type = item.type;
        address.color = this.get_color();
        address.geom = onePoligon.geometry;
        address.radius = 0;
        address.name = item.name || 'Employee Area';
        setTimeout(() => {
          if (!this.selectedSearchSuggestionsStrings.find(el => el === item.id)) {
            this.addAddressShapeToMap(address.geom, address.id, address.color);
            this.searchModel.searchArea.addressParts.unshift(address);
            this.selectedSearchSuggestionsStrings.push(address.id);
          }
        },         200);
      });
    });
  }

  get employeeRestrictedArea () {
    return this.val(this.empCtx, (empCtx: api.IUserWorkspaceContextModel) => empCtx.workspaceGeoRestriction.addressParts.length, 0);
  }

  cloaseSearchAboModal () {
    this.showAboModal = false;
    this.switchSearchAbo = false;
  }

  populateData() {
    this.searchModel.inactivePublicationTime = api.$ensureObj(this.searchModel.inactivePublicationTime, api.SearchQueryRangeOfDateTime);
    this.searchModel.availableDate = api.$ensureObj(this.searchModel.availableDate, api.SearchQueryRangeOfDateTime);
    this.searchModel.textSearchMode = api.PubTextSearchMode.PhraseSearch;
    // this.updateSliders();

    const allCats: api.IPubPropertyCategory[] = _.clone(this.mainCategories);
    if (this.searchModel.propertyCategoryIds && this.searchModel.propertyCategoryIds.length) {
      allCats.filter((item) => {
        if (this.searchModel.propertyCategoryIds.includes(item.id)) {
          this.updateSelectedMainCategories(item);
        }
      });
    }
    if (this.searchModel.propertyTypeIds && this.searchModel.propertyTypeIds.length) {
      if (this.subCategories.length === 0) {
        allCats.forEach((prop) => {
          this.subCategories = this.subCategories.concat(prop.propertyTypes);
        });
      }
      const allSubTypes: api.IPubPropertyType[] = _.clone(this.subCategories);
      allSubTypes.filter((o: api.IPubPropertyType) => {
        if (this.searchModel.propertyTypeIds.indexOf(o.id) > -1) {
          this.updateSelectedSubCategories(o);
          allCats.forEach((cat) => {
            if (cat.propertyTypes.includes(o)) {
              this.updateSelectedMainCategories(cat);
            }
          });
        }
      });
    }

    if (this.searchModel.propertyCategoryIds && this.searchModel.propertyCategoryIds.length) {
      allCats.filter((item) => {
        if (this.searchModel.propertyCategoryIds.includes(item.id)) {
          this.updateSelectedMainCategories(item);
        }
      });
    }
    const allPortals: api.IPubSiteModel[] = _.clone(this.realEstateOptions);
    if (this.searchModel.siteIds) {
      allPortals.filter((item) => {
        if (this.searchModel.siteIds.includes(item.id)) {
          this.updateSelectedPortals(item);
        }
      });
    }
    if (this.searchModel.publisherIds) {
      this.competitorOptions.filter((item) => {
        if (this.searchModel.publisherIds.includes(item.id)) {
          this.updateSelectedCompetitors(item);
        }
      });
    }
    if (this.searchModel.inactivePublicationTime && this.searchModel.inactivePublicationTime.min) {
      this.historicAds = true;
    }
    const allVendorOptions: OptionModel[] = _.clone(this.vendorOptions);
    if (this.searchModel.publisherClasses !== api.PubQueryPublisherClasses.Any) {
      allVendorOptions.filter((item) => {
        if ((this.searchModel.publisherClasses & item.value) !== 0) {
          this.updateSelectedVendors(item);
        }
      });
    }
    if (this.searchModel.floorCategories) {
      this.onlyPartereFloor = true;
    }

  }

  getAllSubs () {
    let favsExist = false;
    leadsModule.commitSetInboxes(store, null);

    // get all inboxes
    leadsModule.dispatchGetInboxes(store)
      .then(() => {
        leadsModule.getInboxes(store).items.forEach((item) => {
          // check if Inbox with my-favorites tag exists
          if (item.tags) {
            item.tags.forEach((tag) => {
              if (tag === 'my-favorites') {
                favsExist = true;
              }
            });
          }
        });
        // if it doesn't - create it
        if (!favsExist) {
          const leadsList = api.$newObj(api.LeadListModel);
          leadsList.name = 'Favorites';
          leadsList.isEnabled = true;
          leadsList.tags = [];
          leadsList.tags.push('my-favorites');
          leadsModule.dispatchCreateLeadsList(store, leadsList);
        }
      });
  }
  getPipeLines() {
    const query = api.$newObj(api.EntitySearchQuery);
    pipelineModule.dispatchGetPipelines(store, query);
  }

  show(tab: string) {
    for (const i in this.tabCategory) {
      if (i === tab) {
        this.tabCategory[i] = true;
      } else {
        this.tabCategory[i] = false;
      }
    }
  }

  exitEditMode () {
    this.resetForm();
    if (this.$route.params.subId) {
      this.subEditMode = false;
      this.selectedSub = api.$newObj(api.LeadGenFilterModel);
      this.$router.push({ name: 'Search' });
    }
  }

  @Watch('$route')
  reloadPage() {
    if (this.$route.path === '/search') {
      // this.exitEditMode();
    }
  }

  removeShape(id: string, index: number): void {

    this.searchModel.searchArea.shapes.filter((shape, shapeIndex) => {
      if (shape.key === id) {
        // if (this.searchModel.searchArea.shapes[index].radius) {
        //  this.removeKmFromGeoObject(index, true);
        // }
        this.searchModel.searchArea.shapes.splice(index, 1);
        this.$emit('removeShapeFromMap', {
          id,
          time: new Date().getTime(),
        });
      }
    });

    this.viewPorts.filter((viewport, viewportIndex) => {
      if (viewport.id === id) {
        this.viewPorts.splice(viewportIndex, 1);
      }
    });

    this.markerGroupName = '';
    this.by = '';
    this.selectedPoints = [];

    this.$forceUpdate();
    this.counterSearch();
  }

  stc(color: string): object {
    return {
      'background-color': `${color} !important`,
    };
  }

  nextField(field: any, $event?: any) {
    if (field !== 'submitForm') {
      if ($event) {
        $event.preventDefault();
        $event.stopPropagation();
      }
    } else {
      // this.predictPrice('pricePredictor');
    }

    const el = document.getElementsByName(field)[0] as HTMLInputElement;
    el.focus();

    if (field !== 'submitForm') {
      el.select();
    }
  }

  toggleSearchAbo() {
    this.showAboModal = true;
  }

  counterSearch() {
    clearTimeout(this.timer);
    this.timer = setTimeout(() => {
      if (!this.$validator.errors.items.length) {
        this.getTotals();
      }
      // this.$root.$emit("changesearchModel", this.searchModel);
    },                      1000);
  }

  async getTotals() {
    const sd = _.cloneDeep(this.searchModel);

    if (sd.leadGenParams && sd.leadGenParams.triggers) {
      delete sd.leadGenParams;
    }

    api.$pubs.getTotals(sd).then((data: any) => {
      this.resultsCounter = data;
    }).catch(() => {
      // this.resultsCounter.searchQueryItemCount = 0;

      Vue.prototype.$notify({
        group: 'actions',
        type: 'error',
        duration: 2500,
        text: 'Error seting total number of ads',
      });
    });

  }

  get_color(): string {

    let color = this.colors()[Math.floor(Math.random() * this.colors().length)];

    if (this.colorsUsed.length === this.colors().length) {
      color =  `#${Math.floor(Math.random() * 16777215).toString(16)}`;
    }

    if (this.colorsUsed.indexOf(color) === -1) {
      this.colorsUsed.push(color);

    } else {
      color =  `#${Math.floor(Math.random() * 16777215).toString(16)}`;
      this.colorsUsed.push(color);
    }

    return color;

  }

  setStreet(data: api.GeoSuggestion): void {

    this.showLocalityRequired = false;

    if (data && this.selectedSearchSuggestionsStrings.indexOf(data.uniqueIdentifier) === -1) {
      if (data.suggestionType === api.GeoSuggestionType.Quarter) {
        const s = new api.GeoAreaShape();
        s.geom = data.geom;
        s.name = data.name;
        s.key = 'shape_' + `${counter.next().toString()}`;
        s.color = this.get_color();
        this.addAddressShapeToMap(data.geom, s.key, s.color);
        this.searchModel.searchArea.shapes.unshift(s);
      } else {
        const address = new api.GeoAreaAddressPart();
        address.type = <api.GeoAddressPartType>data.suggestionType.valueOf();
        address.id = data.uniqueIdentifier;
        address.color = this.get_color();
        address.radius = 0;
        address.name = data.name;
        this.addAddressShapeToMap(data.geom, address.id, address.color);
        // e.push(addr);
        // this.searchModel.searchArea.addressParts.push(addr);
        this.searchModel.searchArea.addressParts.unshift(address);
        this.selectedSearchSuggestionsStrings.push(data.uniqueIdentifier);
      }
    } else {
      Vue.prototype.$notify({
        group: 'actions',
        type: 'error',
        duration: 2500,
        text: 'Area is alredy in the list.',
      });
    }
  }

  addAddressShapeToMap(geom: {coordinates: []; type: string}, id: string, color: string, radius?: number, geometry?: any) {
    this.$emit('addAddressShapeToMap', {
      geom,
      id,
      radius,
      geometry,
      color,
      time: new Date().getTime(),
    });
  }

  addShapeToMap(geom: {coordinates: []; type: string}, key: string, color: string, name: string) {
    this.$emit('addShapeToMap', {
      geom,
      color,
      name,
      id: key,
      time: new Date().getTime(),
    });
  }

  removeWorkspace(id: string) {
    const index = this.workspacePlaces.map(e => e.id).indexOf(id);
    if (index !== -1) {
      this.$root.$emit('remove_shapes', [this.workspacePlaces[index]]);
      this.workspacePlaces.splice(index, 1);
    }
  }

  addWorkspace(id: string) {
    const index = this.workspacePlacesBase.map(e => e.id).indexOf(id);
    if (index !== -1) {
      this.$root.$emit('draw_shapes', [this.workspacePlacesBase[index]]);
      this.workspacePlaces.push(this.workspacePlacesBase[index]);
    }
  }

  @Debounce(250)
  async getSearchSuggestions() {
    const singleCall = new SingleCall <api.GeoSuggestion[]>(api.$geo.findSuggestions);
    const text = this.$parent.$refs['autocomplete_search']['model'];
    if (text.length < 1 || text.length >= 200) {
      this.$parent.$refs['autocomplete_search']['loadingData'] = false;
      return false;
    }
    const results = await singleCall.invoke({
      text,
      includeGeom: true,
      suggestionTypes: [10, 20, 30, 40, 50, 15, 18],
      maxItemCount: 6,
      isoLanguageCode: localStorage.getItem('lang'),
    });

    this.autocompleteOptions = results;
    if (this.$parent && this.$parent.$refs['autocomplete_search']) {
      this.$parent.$refs['autocomplete_search']['options'] = results;
      this.$parent.$refs['autocomplete_search']['loadingData'] = false;
    }

  }

  searchSidebarToggleIn(fromSearch?: boolean): void {
    const self = this;

    const searchSidebar = document.querySelector('#side-overlay');
    // let searchAboSidebar = document.querySelector("#side-overlay-searchAbo");

    this.counterSearch();

    if (searchSidebar.classList.contains('active')) {

      // searchAboSidebar.classList.remove("active");
      // searchAboSidebar.classList.remove("prepare");
      searchSidebar.classList.remove('active');
      globalState.commitSetSearchSidebar(store, false);

      if (this.searchModuleResults) {
        if (!this.searchMap) {
          globalState.commitShowOverviewList(this.$store, true);
          return;
        }

        if (this.searchModuleResults.items !== undefined) {
          // turn off interaction
          this.$emit('setInteractWithMap', false);
          const mapSearchSidebar = document.querySelector('#sidebar-object-fixed-2');
          if (this.currentShape.id) {
            this.$emit('removeShapeFromMap', {
              id: this.currentShape.id,
              time: new Date().getTime(),
            });
            this.currentShape = {};
            this.viewPortNameEdit = false;
          }
          // remove points if any
          if (this.points.length) {
            this.removePoint(this.points[0].id, 0);
          }
          if (mapSearchSidebar) {

            if (this.controls.ViewPort) {
              this.viewPortIsActive = false;
            }

            if (this.searchMap) {
              mapSearchSidebar.classList.add('show');
              mapSearchSidebar.classList.remove('hidden');

              mapSearchSidebar.classList.add('active');
              this.$root.$emit('map_change_size', 'small');
              document.getElementsByClassName('switch_style')[0].className = 'switch_style mapboxgl-ctrl-group mapboxgl-ctrl on_left second';

            }
            this.$emit('changeSearchArealLayersVisibility', false);

          }
        }
      }
    } else {
      // turn on interaction
      this.$emit('setInteractWithMap', true);
      if (this.controls.ViewPort && this.viewPortName) {
        this.viewPortIsActive = true;
      }
      searchSidebar.classList.add('active');
      // searchAboSidebar.classList.add("prepare");
      if (this.searchMap) {
        globalState.commitShowSearchMap(store, true);
      }
      globalState.commitSetSearchSidebar(store, true);
      globalState.commitShowOverviewList(store, false);
      globalState.commitShowRightSidebar(store, false);

      self.$root.$emit('show_object', '0');

      if (this.searchModuleResults) {
        if (this.searchModuleResults.items !== undefined) {
          const mapSearchSidebar = document.querySelector('#sidebar-object-fixed-2');

          if (mapSearchSidebar) {
            if (this.searchMap) {
              mapSearchSidebar.classList.remove('show');
              mapSearchSidebar.classList.remove('active');
              mapSearchSidebar.classList.add('hidden');
            }
            document.getElementsByClassName('switch_style')[0].className = 'switch_style mapboxgl-ctrl-group mapboxgl-ctrl';

            this.$root.$emit('map_change_size', 'big');
            // this.$root.$emit('show_search_areas');
            this.$emit('changeSearchArealLayersVisibility', true);

          }
        }
      }

    }

  }
  lastDeletedAddressId: string = '';
  removeAddressItem(item: api.GeoAddressPart): void {

    this.searchModel.searchArea.addressParts.filter((adr: api.GeoAddressPart, index: number) => {
      if (adr.id === item.id) {
        this.$emit('removeAddressFromMap', item.id);
        if (this.searchModel.searchArea.addressParts[index].radius) {
          this.removeKmFromGeoObject(index);
        }
        this.searchModel.searchArea.addressParts.splice(index, 1);
      }
    });

    this.selectedSearchSuggestionsStrings.filter((adr: string, index) => {
      if (adr === item.id) {
        this.selectedSearchSuggestionsStrings.splice(index, 1);
      }
    });

    this.counterSearch();
    /* TODO I dont know what is this used for
    if (this.workspacePlacesBase) {
        this.addWorkspace(itemGeo.uniqueIdentifier);
      }
    }*/

  }

  removeKmFromGeoObject(index: number, inShapes?: boolean): void {
    if (inShapes) {

      // this.searchModel.searchArea.shapes[index].radius = undefined;
      this.$emit('removeLayerById', `${this.searchModel.searchArea.shapes[index].key}` + 'WithRadius');
    } else {
      this.searchModel.searchArea.addressParts[index].radius = undefined;
      this.searchModel.searchArea.addressParts[index].geom = undefined;
      this.$emit('removeLayerById', `${this.searchModel.searchArea.addressParts[index].id}` + 'WithRadius');
    }
    this.counterSearch();
  }
  editingShape: boolean = false;
  addKmToGeoObject(index: number, inShapes?: boolean): void {
    this.extendIndex = index;
    this.showExtendKmModal = true;

    if (!inShapes) {
      this.editingShape = false;
      if (this.searchModel.searchArea.addressParts[index].radius) {
        this.extendKm = this.searchModel.searchArea.addressParts[index].radius;
      }
    } else {
      this.editingShape = true;

      // if (this.searchModel.searchArea.shapes[index].radius) {
      //  this.extendKm = this.searchModel.searchArea.shapes[index].radius;
      // }
    }

  }

  extendByKm(form: string) {
    if (this.extendKm <= 0 || this.extendKm === '' || this.extendKm == null) {
      if (!this.editingShape) {
        this.searchModel.searchArea.addressParts[this.extendIndex].radius = undefined;
        this.$emit('removeLayerById', `${this.searchModel.searchArea.addressParts[this.extendIndex].id}` + 'WithRadius');
      } else {
        // this.searchModel.searchArea.shapes[this.extendIndex].radius = undefined;
        this.$emit('removeLayerById', `${this.searchModel.searchArea.shapes[this.extendIndex].key}` + 'WithRadius');
      }
      this.showExtendKmModal = false;
      this.extendIndex = -1;
      return;
    }
    this.$validator.validateAll(form).then((valid) => {
      if (valid) {

        globalState.commitSetLoadingButton(store, true);
        if (!this.editingShape) {
          this.searchModel.searchArea.addressParts[this.extendIndex].radius = this.extendKm;
          this.$emit('addOrUpdateLayerWithRadius', {
            id: this.searchModel.searchArea.addressParts[this.extendIndex].id,
            radius: this.searchModel.searchArea.addressParts[this.extendIndex].radius,
            isShape: false,
          });
        } else {
          // this.searchModel.searchArea.shapes[this.extendIndex].radius = this.extendKm;
          this.$emit('addOrUpdateLayerWithRadius', {
            id: this.searchModel.searchArea.shapes[this.extendIndex].key,
            // radius: this.searchModel.searchArea.shapes[this.extendIndex].radius,
            isShape: true,
            geom: this.searchModel.searchArea.shapes[this.extendIndex].geom,
          });
        }
      } else {
        Vue.prototype.$notify({
          group: 'actions',
          type: 'error',
          duration: 2500,
          text: 'Radius can not be greater than 10 000m.',
        });
      }
    });
  }

  historyDeleteActionLoading: any = {};
  editingFavouriteId: string = '';
  editingFavouriteName: string = '';
  autoLoadHistory: boolean = false;
  searchHistory: api.QueryListEntryLightModel<any>[] = [];
  bookmarksHistory: api.QueryListEntryLightModel<any>[] = [];

  getBookmarks() {
    const self = this;
    history.dispatchGetSearchModuleBookmarks(this.$store).then(() => {
      self.bookmarksHistory = history.getSearchModuleBookmarks(this.$store);

      self.$forceUpdate();

    });
  }

  getSearchHistory() {
    const self = this;
    history.dispatchGetSearchModuleHistory(this.$store).then(() => {
      self.searchHistory = history.getSearchModuleHistory(this.$store);
      this.getBookmarks();
      self.$forceUpdate();

    });
  }
  addToHistory(name: string) {

    history.dispatchAddToSearchModuleHistoryEntry(this.$store, { name, query: this.searchModel }).then((data) => {
      // TODO replace this by only changing searchHistory var
      this.getSearchHistory();

    });

  }
  removeFromHistory(index: number, index1: number, id: string) {

    // index and index are used if history is in sorted state, not used at this momment
    const self = this;
    this.historyDeleteActionLoading[id] = true;
    this.$forceUpdate();
    history.dispatchRemoveFromSearchModuleHistoryEntry(this.$store, id).then(() => {
      this.historyDeleteActionLoading[id] = false;
      // TODO  replace this by only changing searchHistory var
      this.getSearchHistory();
      self.$forceUpdate();
    });
  }
  confirmDeleteFromFav () {
    history.dispatchBookmarkSearchModuleHistoryEntry(this.$store, this.deleteFromFav).then((val: boolean) => {
      this.deleteFromFav = null;
      this.showRemoveFavModal = false;
      // TODO replace this by only changing searchHistory var
      this.getSearchHistory();
    });
  }

  deleteFromFav: api.QueryListEntryLightModel<any> = null;
  showRemoveFavModal: boolean = false;
  bookmarkSearch(h: api.QueryListEntryLightModel<any>) {
    if (!h.isFavorite) {
      history.dispatchBookmarkSearchModuleHistoryEntry(this.$store, h).then((val: boolean) => {
        // TODO replace this by only changing searchHistory var
        this.getSearchHistory();
      });
    } else {
      this.deleteFromFav = h;
      this.showRemoveFavModal = true;
    }
  }
  editFavourite (h: api.QueryListEntryLightModel<any>, noSave: boolean) {

    if (noSave) {
      this.editingFavouriteId = h.id;
      this.editingFavouriteName = this.parseGeneratedNameForEdit(h.name);
      return;
    }
    history.dispatchEditFavouriteSearchModuleHistoryEntry(this.$store, { id: h.id, name: this.editingFavouriteName }).then(() => {
      // TODO replace this by only changing searchHistory var
      this.editingFavouriteId = '';
      this.editingFavouriteName = '';
      this.getSearchHistory();
    });
  }

  searchAgainId: string = '';
  loadAboEntry(entry: {id: string; edit: boolean}) {
    if (!entry.edit) {
      this.exitEditMode();
    }
    api.$leadGenFilter(entry.id).get()
      .then((data) => {
        this.subEditMode = true;
        if (entry.edit) {
          this.selectedSub = _.cloneDeep(data);
        }
        const s = _.cloneDeep(data.query.searchArea.shapes);
        const a = _.cloneDeep(data.query.searchArea.addressParts);

        data.query.searchArea.shapes = [];
        data.query.searchArea.addressParts = [];

        this.searchModel = _.cloneDeep(data.query);
        this.populateData();

        const promises = [];
        const shapes = [];

        if (s.length) {
          for (const i in s) {
            shapes.unshift(s[i]);
          }
          promises.unshift(shapes);
        } else {
          promises.unshift(Promise.resolve([]));
        }
        if (a.length) {
          const ids = [];
          for (const i in a) {
            // ids.push(a[i].id);
            ids.push({
              object: api.$geo.getAddressPart(a[i].id),
              geom: a[i].geom,
              radius: a[i].radius,
            });
          }
          promises.push(ids);

        } else {
          promises.push(Promise.resolve([]));
        }

        Promise.all(promises).then((elements: any) => {

          const allShapes = elements[0];
          const addressParts = elements[1];
          // this.searchModel.searchArea.shapes = [];
          // this.searchModel.searchArea.addressParts = [];

          allShapes.forEach((el: any) => {
            // console.log(el);
            const s = new api.GeoAreaShape();
            s.geom = el.geom;
            s.name = el.name;
            s.key = 'shape_' + `${counter.next().toString()}`;
            s.color = this.get_color();

            this.searchModel.searchArea.shapes.unshift(s);
            setTimeout(() => {
              this.addShapeToMap(el.geom, s.key, s.color, s.name);
            },         200);

          });

          for (let i = 0, l = addressParts.length; i < l; i += 1) {
            addressParts[i].object.then((address: api.GeoAddressPart) => {
              const s = new api.GeoAreaAddressPart();
              s.name = address.name;
              s.type = <api.GeoAddressPartType> address.type.valueOf();
              s.color = this.get_color();
              // s.geom = el.geom;
              s.id = address.id;
              s.radius = addressParts[i].radius;
              // this.selectedSearchSuggestions.push(s);
              this.searchModel.searchArea.addressParts.unshift(s);
              setTimeout(() => {
                // draw as well
                this.addAddressShapeToMap(address.geom, address.id, s.color, addressParts[i].radius, addressParts[i].geom);
              },         200);
            });
          }
          if (data.query.sort) {

            for (const i in this.sortOptions) {
              if (this.sortOptions[i].value === data.query.sort) {
                this.sortBy = this.sortOptions[i];
              }
            }
          }

          const mapSearchSidebar = document.querySelector('#sidebar-object-fixed-2');

          if (mapSearchSidebar) {
            mapSearchSidebar.classList.remove('show');
            mapSearchSidebar.classList.remove('active');
            mapSearchSidebar.classList.add('hidden');
          }
          // setTimeout(() => {
          this.$root.$emit('hide_object');
          globalState.updateLoadingSearchResults(store, false);
          globalState.commitShowOverviewList(store, false);
          globalState.commitSetLoadingButton(store, false);
          globalState.commitShowMapRightSidebar(store, false);
          globalState.commitShowRightSidebar(store, false);
          globalState.commitShowSearchMap(store, false);

          this.$root.$emit('searchModuleResults', []);
          this.$root.$emit('adsInViewport', []);
          this.$root.$emit('map_change_size', 'big');

          this.toggle('search');
          search.commitAddressLoading(this.$store, false);
          this.searchAgainId = '';

          this.$emit('fitMapToSearchArea', true);

        });

      })
      .catch(() => {
        this.subEditMode = false;
      });
  }
  searchAgain(h: api.QueryListEntryLightModel<any>) {

    this.exitEditMode();

    this.searchAgainId = h.id;

    api.$queryLists.search.$entry(h.id).get().then((data) => {

      this.searchModel = _.cloneDeep(data.query);
      this.populateData();
      this.searchAgainModel = _.cloneDeep(data);
      const promises = [];
      const shapes = [];

      if (data.query.searchArea.shapes) {
        if (data.query.searchArea.shapes.length) {
          for (const i in data.query.searchArea.shapes) {
            shapes.unshift(data.query.searchArea.shapes[i]);
          }
          promises.unshift(shapes);
        } else {
          promises.unshift([]);
        }
      } else {
        promises.unshift([]);
      }
      if (data.query.searchArea.addressParts) {
        if (data.query.searchArea.addressParts.length) {
          const ids: any[] = [];
          for (const i in data.query.searchArea.addressParts) {
            ids.push({
              object: api.$geo.getAddressPart(data.query.searchArea.addressParts[i].id),
              geom: data.query.searchArea.addressParts[i].geom,
              radius: data.query.searchArea.addressParts[i].radius,
            });
          }
          promises.push(ids);

        } else {
          promises.push([]);
        }
      } else {
        promises.push([]);
      }

      Promise.all(promises).then((elements: any) => {

        const allShapes = elements[0];
        const addressParts = elements[1];
        this.searchModel.searchArea.shapes = [];
        this.searchModel.searchArea.addressParts = [];

        allShapes.forEach((el: any) => {
          // console.log(el);
          const s = new api.GeoAreaShape();
          s.geom = el.geom;
          s.name = el.name;
          s.key = 'shape_' + `${counter.next().toString()}`;
          s.color = this.get_color();

          this.searchModel.searchArea.shapes.unshift(s);
          setTimeout(() => {
            this.addShapeToMap(el.geom, s.key, s.color, s.name);
          },         200);

        });

        addressParts.forEach((el: any) => {
          el.object.then((address: api.GeoAddressPart) => {
            const s = new api.GeoAreaAddressPart();
            s.name = address.name;
            s.type = <api.GeoAddressPartType> address.type.valueOf();
            s.color = this.get_color();
            s.radius = el.radius;
            s.geom = el.geom;
            // s.geom = el.geom;
            s.id = address.id;
            // this.selectedSearchSuggestions.push(s);
            this.searchModel.searchArea.addressParts.unshift(s);
            setTimeout(() => {
              // draw as well
              this.addAddressShapeToMap(address.geom, address.id, s.color, el.radius, el.geom);
            },         200);
          });
        });

        if (data.query.sort) {

          for (const i in this.sortOptions) {
            if (this.sortOptions[i].value === data.query.sort) {
              this.sortBy = this.sortOptions[i];
            }
          }
        }

        const mapSearchSidebar = document.querySelector('#sidebar-object-fixed-2');

        if (mapSearchSidebar) {
          mapSearchSidebar.classList.remove('show');
          mapSearchSidebar.classList.remove('active');
          mapSearchSidebar.classList.add('hidden');
        }
        // setTimeout(() => {
        this.$root.$emit('hide_object');
        globalState.updateLoadingSearchResults(store, false);
        globalState.commitShowOverviewList(store, false);
        globalState.commitSetLoadingButton(store, false);
        globalState.commitShowMapRightSidebar(store, false);
        globalState.commitShowRightSidebar(store, false);
        globalState.commitShowSearchMap(store, false);

        this.$root.$emit('searchModuleResults', []);
        this.$root.$emit('adsInViewport', []);
        this.$root.$emit('map_change_size', 'big');

        this.toggle('search');
        search.commitAddressLoading(this.$store, false);
        this.searchAgainId = '';
        this.$emit('fitMapToSearchArea', true);
      });
    });
  }

  removingHistory: boolean = false;
  emptyHistory(empty?: boolean) {
    this.showModal = true;
    if (empty) {
      this.removingHistory = true;
      api.$queryLists.search.deleteAll(api.QueryListEntryTypes.History).then(() => {
        this.removingHistory = false;
        this.showModal = false;
        this.getSearchHistory();
        this.getBookmarks();
      });
    }
  }

  emptyBookmarks(empty?: boolean) {
    this.showModal = true;
    if (empty) {
      this.removingHistory = true;
      api.$queryLists.search.deleteAll(api.QueryListEntryTypes.Favorite).then(() => {
        this.removingHistory = false;
        this.showModal = false;
        this.getBookmarks();
        this.getSearchHistory();
      });
    }
  }

  mapListSearch(form: string): void {
    globalState.commitSetLoadingButton(store, true);
    delete this.searchModel.leadGenParams;

    this.$validator.validateAll(form).then((result) => {
      if (result) {
        if (!this.$validator.errors.items.length) {

          if (!this.searchModel.searchArea.addressParts.length && !this.searchModel.searchArea.shapes.length) {
            this.showLocalityRequired = true;
          }
          if (!this.selectedMainCategories.length) {
            this.mainCategoryRequired = true;
          }
          if (this.showLocalityRequired || this.mainCategoryRequired) {
            globalState.commitSetLoadingButton(store, false);
            this.$el.querySelector('#mainCat').scrollIntoView(false);
            // this.$el.querySelector("#searchSug").scrollIntoView({ block: 'start', behavior: 'smooth' });
          } else {
            this.showLocalityRequired = false;
            this.mainCategoryRequired = false;

            if (this.switchSearchAbo) {
              globalState.commitSetLoadingButton(store, false);
              this.showAboModal = true;
            } else {
              // searchModule.commitResetState(store);
              this.$root.$emit('remove_all_markers_from_search');
              // this.searchModel.searchArea.shapes = this.shapes;
              globalState.commitShowMapRightSidebar(store, false);
              globalState.commitShowSearchMap(store, false);
              globalState.commitShowOverviewList(store, false);
              globalState.commitShowRightSidebar(store, false);

              const q = this.searchModel;
              q.sort = this.sortBy?.value;

              if (this.searchAgainModel) {
                if (JSON.stringify(q) === JSON.stringify(this.searchAgainModel.query)) {
                  history.dispatchEditLastUsedHistoryEntrySearch(this.$store, this.searchAgainModel.id);
                  setTimeout(() => {
                    this.getSearchHistory();
                    this.getBookmarks();
                  },         1000);
                } else {
                  this.addToHistory(this.generateSearchName());
                }
              } else {
                this.addToHistory(this.generateSearchName());
              }
              this.$emit('setInteractWithMap', false);
              if (this.currentShape.id) {
                this.$emit('removeShapeFromMap', {
                  id: this.currentShape.id,
                  time: new Date().getTime(),
                });
                this.currentShape = {};
                this.viewPortNameEdit = false;
              }
              // remove points if any
              if (this.points.length) {
                this.removePoint(this.points[0].id, 0);
              }
              if (this.controls.ViewPort) {
                this.viewPortIsActive = false;
              }
              if (this.searchMap) {

                if (this.resultsCounter.searchQueryItemCount > 500) {
                  this.$root.$emit('setMaxLimitMsg', true);
                } else {
                  this.$root.$emit('setMaxLimitMsg', false);
                }
                q.maxItemCount = 500; // this.resultsCounter.searchQueryItemCount;
                delete q.page;
                delete q.pageSize;
                searchModule.dispatchFindCoordinates(store, {
                  query: q,
                  fields: api.PubLightModelFields.All,
                  maxItemCount: undefined,
                });
                api.$pubs.find(q, api.PubLightModelFields.All).then((data) => {

                  globalState.commitSetLoadingButton(store, false);
                  if (data.items.length) {
                    const self = this;
                    globalState.commitShowSearchMap(store, true);

                    this.$root.$emit('searchModuleResults', data);
                    this.searchModuleResults = data;
                    self.searchSidebarToggleIn(true);
                    // self.searchMap = false;
                  } else {
                    globalState.commitShowSearchMap(store, false);
                    // this.searchSidebarToggleIn(false);
                    // this.$root.$emit('adsInViewport', []);
                    // this.$root.$emit('setMaxLimitMsg', false);
                    this.$root.$emit('searchModuleResults', null);
                    this.searchModuleResults = null;
                    this.searchMap = false;
                    Vue.prototype.$notify({
                      group: 'actions',
                      type: 'success',
                      duration: 2500,
                      text: 'There are no search results for selected parameters. Please choose adjust your search parameters.',
                    });
                    globalState.commitShowMapRightSidebar(store, false);
                    // globalState.updateLoadingSearchResults(store, true);
                  }
                });
              } else {
                const q = this.searchModel;
                // q.sort = this.sortBy.value;
                q.page = this.pageNum;
                q.pageSize = this.perPage;
                delete q.maxItemCount;

                api.$pubs.find(q, api.PubLightModelFields.All).then((data) => {

                  this.searchModuleResults = data;
                  globalState.commitSetLoadingButton(store, false);
                  // if (data.items.length) {
                  const self = this;
                  globalState.commitShowMapRightSidebar(store, false);
                  globalState.commitShowOverviewList(store, true);
                  this.$root.$emit('searchModuleResultsOList', data);
                  globalState.commitShowRightSidebar(store, false);
                  globalState.commitShowSearchMap(store, false);
                  self.searchSidebarToggleIn(true);
                  // }
                });

                searchModule.dispatchFind(store, {
                  query: q,
                  fields: api.PubLightModelFields.All,
                  maxItemCount: undefined,
                });
              }
            }
          }
        } else {
          globalState.commitSetLoadingButton(store, false);
          const id = this.$validator.errors.items[0].field;
          if (id && this.$refs[id]) {
            this.$refs[id].$el.scrollIntoView(false);
          }
        }
      } else {
        globalState.commitSetLoadingButton(store, false);
      }
    });
  }

  addViewPortToTheMap(viewPort: any) {
    this.$emit('addViewPortToTheMap', viewPort);
  }

  /*removeFromTheMap(id: string) {
    this.$root.$emit('removeLayerById', id);
  }*/

  // **** LABELS *****
  limitText(count: number): string {
    return `and ${count} other elements`;
  }

  propLimitLabel({ name }: api.IPubPropertyCategory): string {
    if (name.length > 25) {
      return  `${name.substring(0, 25)}...`;
    }
    return name;

  }

  resetForm(): void {
    this.$root.$emit('agencyWorkspaceRestriction', false);
    this.initsearchModel();
    this.$emit('resetMap');
    this.selectedSearchSuggestionsStrings = [];
    this.viewPorts = [];
    // this.initsearchModel();

    this.workspacePlaces = undefined;
    this.workspacePlacesBase = undefined;
    this.workspace = false;

    this.searchModel.text = undefined;
    this.$root.$emit('resetInputNumberFields');

    this.onlyPartereFloor = false;
    this.searchModel.floorCategories = undefined;
    this.searchModel.hasKnownInhabitants = false;
    this.searchModel.hasKnownInhabitants = false;
    this.historicAds = false;
    this.sortBy = { value: undefined, text: 'Standard', icon: undefined };

    this.selectedMainCategories = [];
    this.selectedRealEstateOptions = [];
    this.selectedSubCategories = [];
    this.selectedCompetitors = [];
    this.selectedVendors = [];

    const cats = _.cloneDeep(searchModule.getPropertyTypes(store));
    this.mainCategories = cats;
    const portals = _.cloneDeep(searchModule.getRealEstatePortals(store));
    this.realEstateOptions = portals;
    const comps = _.cloneDeep(searchModule.getCompetitors(store));
    this.competitorOptions = comps;
    this.vendorOptions = [
      { value: api.PubQueryPublisherClasses.Unknown, text: 'Unknown' },
      { value: api.PubQueryPublisherClasses.Professional, text: 'Professional' },
      { value: api.PubQueryPublisherClasses.NonProfessional, text: 'NonProfessional' },
      { value: api.PubQueryPublisherClasses.Uncertain, text: 'Uncertain' },
    ];
    this.showLocalityRequired = false;
    this.$validator.reset();

  }

  mounted(): void {
  }

  @Watch('searchModel', { immediate: true, deep: true })
  updatesearchModel(): void {
    this.counterSearch();
  }

  @Watch('mainSearchedAddress', { immediate: true })
  uad(): void {
    if (this.mainSearchedAddress.name !== undefined) {
      this.$nextTick(() => {
        this.setStreet(this.mainSearchedAddress);
      });

    }
  }

  generateSearchName() {

    let searchType = 'Rent';
    if (this.searchModel.transactionType === api.PubTransactionType.Buy) {
      searchType = 'Buy';
    }

    const mainCategories: string[] = [];
    for (const i in this.selectedMainCategories) {
      mainCategories.push(this.selectedMainCategories[i].name);
    }

    const categories: string = mainCategories.join(', ');

    const searchArea: string[] = [];

    if (this.searchModel.searchArea.addressParts.length) {
      for (const i in this.searchModel.searchArea.addressParts) {
        searchArea.push(`[t]${this.searchModel.searchArea.addressParts[i].name}[/t] ${this.get_icon(this.searchModel.searchArea.addressParts[i].type)}`);
      }
    }

    if (this.searchModel.searchArea.shapes) {
      for (const i in this.searchModel.searchArea.shapes) {
        searchArea.push(this.searchModel.searchArea.shapes[i].name);
      }

    }

    let price: string = '';
    if (this.searchModel.price.min && this.searchModel.price.max) {

      price = `- Price from [t]${this.formatPrice(this.searchModel.price.min)}[/t] to [t]${this.formatPrice(this.searchModel.price.max)}[/t]`;
    } else if (!this.searchModel.price.min && this.searchModel.price.max) {
      price = `- Price up to [t]${this.formatPrice(this.searchModel.price.max)}[/t]`;
    } else {
      if (this.searchModel.price.min && !this.searchModel.price.max) {
        price = `- Price from [t]${this.formatPrice(this.searchModel.price.min)}[/t]`;
      }
    }

    let rooms: string = '';
    if (this.searchModel.roomCount.min && this.searchModel.roomCount.max) {

      rooms = ` - Rooms from [t]${this.searchModel.roomCount.min}[/t] to [t]${this.searchModel.roomCount.max}[/t]`;
    } else if (!this.searchModel.roomCount.min && this.searchModel.roomCount.max) {
      rooms = ` - Rooms up to [t]${this.searchModel.roomCount.max}[/t]`;
    } else {
      if (this.searchModel.roomCount.min && !this.searchModel.roomCount.max) {
        rooms = ` - Rooms from [t]${this.searchModel.roomCount.min}[/t]`;
      }
    }

    let lArea: string = '';
    if (this.searchModel.livingArea.min && this.searchModel.livingArea.max) {

      lArea = ` - Living area from [t]${this.searchModel.livingArea.min}[/t] to [t]${this.searchModel.livingArea.max}[/t][t][sq2][/t]`;
    } else if (!this.searchModel.livingArea.min && this.searchModel.livingArea.max) {
      lArea = ` - Living area up to [t]${this.searchModel.livingArea.max}[/t][t][sq2][/t]`;
    } else {
      if (this.searchModel.livingArea.min && !this.searchModel.livingArea.max) {
        lArea = ` - Living area from [t]${this.searchModel.livingArea.min}[/t][t][sq2][/t]`;
      }
    }

    let where =  `${searchType} ${categories} - ${searchArea.join(', ')} ${price}${rooms}${lArea}`;

    if (where.length >= 200) {
      where =  `${searchType} ${categories} - ${searchArea.join(', ')} ${price}${rooms}`;
      if (where.length >= 200) {
        where =  `${searchType} ${categories} - ${searchArea.join(', ')} ${price}`;
        if (where.length >= 200) {
          where = `${searchType} ${categories} - ${searchArea.join(', ')}`;
          if (where.length >= 200) {
            where = `${searchType} ${categories}`;
          }
        }
      }
    }

    return where;

  }

  parseGeneratedName(name: string) {
    if (name.indexOf('[t]') > -1) {
      return name.replace(/\[t\]/g, '<span notranslate>').replace(/\[\/t\]/g, '</span>').replace(/\[sq2\]/g, 'm<sup>2</sup>');
    }

    return `<span notranslate>${name}</span>`;
  }
  parseGeneratedNameForEdit(name: string) {
    return name.replace(/\[t\]/g, '').replace(/\[\/t\]/g, '').replace(/\[sq2\]/g, '');
  }

  updateSelectedMainCategories(el: api.IPubPropertyCategory): void {
    if (this.selectedMainCategories.indexOf(el) === -1) {
      this.selectedMainCategories.unshift(el);
      this.mainCategories.splice(this.mainCategories.indexOf(el), 1);
    }
  }
  removeMainCategory(index: number): void {
    const allCategories = this.selectedMainCategories[index].propertyTypes;
    const newList = this.selectedSubCategories.filter((item) => {
      return !allCategories.includes(item);
    });
    this.selectedSubCategories = newList;
    this.mainCategories.unshift(this.selectedMainCategories[index]);
    this.selectedMainCategories.splice(index, 1);
  }
  updateSelectedPortals(el: api.IPubSiteModel): void {
    if (this.selectedRealEstateOptions.indexOf(el) === -1) {
      this.selectedRealEstateOptions.unshift(el);
      this.realEstateOptions.splice(this.realEstateOptions.indexOf(el), 1);
    }
  }
  removeRealEstatePortal(index: number): void {
    this.realEstateOptions.unshift(this.selectedRealEstateOptions[index]);
    this.selectedRealEstateOptions.splice(index, 1);
  }
  updateSelectedSubCategories (el: api.IPubPropertyType) {
    if (this.selectedSubCategories.indexOf(el) === -1) {
      this.selectedSubCategories.unshift(el);
      this.subCategories.splice(this.subCategories.indexOf(el), 1);
    }
  }
  removeSubCategory(index: number): void {
    this.subCategories.unshift(this.selectedSubCategories[index]);
    this.selectedSubCategories.splice(index, 1);
  }
  updateSelectedVendors (el: OptionModel) {
    if (this.selectedVendors.indexOf(el) === -1) {
      this.selectedVendors.unshift(el);
      this.vendorOptions.splice(this.vendorOptions.indexOf(el), 1);
    }

    if (this.selectedVendors.length === 0) {
      // agencyWorkspaceRestriction
      this.$root.$emit('agencyWorkspaceRestriction', false);
    } else {
      this.$root.$emit('agencyWorkspaceRestriction', true);
    }
  }
  removeVendor (index: number): void {
    this.vendorOptions.unshift(this.selectedVendors[index]);
    this.selectedVendors.splice(index, 1);

    if (this.selectedVendors.length === 0) {
      // agencyWorkspaceRestriction
      this.$root.$emit('agencyWorkspaceRestriction', false);
    } else {
      this.$root.$emit('agencyWorkspaceRestriction', true);
    }
  }
  updateSelectedCompetitors (el: api.IPubPublisherModel) {
    if (this.selectedCompetitors.indexOf(el) === -1) {
      this.selectedCompetitors.unshift(el);
      this.competitorOptions.splice(this.competitorOptions.indexOf(el), 1);
    }
  }
  removeCompetitor (index: number): void {
    this.competitorOptions.unshift(this.selectedCompetitors[index]);
    this.selectedCompetitors.splice(index, 1);
  }

  @Watch('selectedVendors')
  vendorWatch(): void {
    this.searchModel.publisherClasses = 0;
    if (this.selectedVendors.length) {
      for (const i in this.selectedVendors) {
        this.searchModel.publisherClasses |= this.selectedVendors[i].value;
      }
    }
    if (this.searchModel.publisherClasses === 0) {
      this.searchModel.publisherClasses = api.PubQueryPublisherClasses.Any;
    }
    this.counterSearch();
  }

  @Watch('selectedCompetitors')
  competitorWatch(): void {
    this.searchModel.publisherIds = [];
    if (this.selectedCompetitors.length) {
      for (const i in this.selectedCompetitors) {
        this.searchModel.publisherIds.push(this.selectedCompetitors[i].id);
      }
    }
    this.counterSearch();
  }

  @Watch('selectedSubCategories')
  propertyWatch(): void {
    this.searchModel.propertyTypeIds = [];
    if (this.selectedSubCategories.length) {
      for (const i in this.selectedSubCategories) {
        this.searchModel.propertyTypeIds.push(this.selectedSubCategories[i].id);
      }
    }
    this.counterSearch();
  }

  @Watch('selectedRealEstateOptions')
  realEstateWatch(): void {
    this.searchModel.siteIds = [];
    if (this.selectedRealEstateOptions.length) {
      for (const i in this.selectedRealEstateOptions) {
        this.searchModel.siteIds.push(this.selectedRealEstateOptions[i].id);
      }
    }
    this.counterSearch();
  }

  @Watch('selectedMainCategories')
  categoryWatch(): void {
    this.searchModel.propertyCategoryIds = [];
    this.subCategories = [];
    if (this.selectedMainCategories.length) {
      this.mainCategoryRequired = false;
      for (const i in this.selectedMainCategories) {
        this.searchModel.propertyCategoryIds.push(this.selectedMainCategories[i].id);
        this.subCategories = this.subCategories.concat(this.selectedMainCategories[i].propertyTypes);
      }
    }
    this.counterSearch();
  }

  @Watch('historicAds')
  historicAdsWatch(): void {
    if (!this.historicAds) {
      this.searchModel.inactivePublicationTime = api.$newObj(api.SearchQueryRangeOfDateTime);
      this.counterSearch();
    }
  }
  @Watch('onlyPartereFloor')
  floorWatch(): void {
    if (this.onlyPartereFloor) {
      this.searchModel.floorCategories = [api.PubPropertyFloorCategory.GroundLevel, api.PubPropertyFloorCategory.HalfAboveGroundLevel, api.PubPropertyFloorCategory.HalfBelowGroundLevel];
    } else {
      this.searchModel.floorCategories = undefined;
    }
    this.counterSearch();
  }

  locationType: string = 'Address';

  controls: any = {
    Address: true,
    TravelTime: false,
    Radius: false,
    ManualDraw: false,
    ViewPort: false,
    PolygonSelect: false,
    RestrictedArea: false,
  };

  interactWith: object = {
    Address: 'Zip/Locality',
    TravelTime: 'Travel Time',
    Radius: 'Radius',
    ManualDraw: 'Manual Draw',
    ViewPort: 'ViewPort',
    RestrictedArea: 'Restricted Area',
    po_localities: 'Locality',
    po_communes: 'Commune',
    po_cantons: 'Canton',
    po_districts: 'District',
    po_market_regions: 'Market region',
    po_ms_regions: 'Ms Region',
  };

  showControl(interactWith: string, emitInteract?: boolean, draw?: string, travelPoint?: boolean) {

    if (this.mapIsLoadedVar) {

      for (const i in this.controls) {
        this.controls[i] = false;
      }

      this.controls[interactWith] = true;
      this.$emit('interactWithMap', interactWith);

      this.$emit('startPolygonDraw', draw);
      if (this.points.length) {
        this.removePoint(this.points[0].id, 0);
      }
      this.locationType = interactWith;

      if (interactWith === 'ViewPort') {
        this.$emit('getViewPort');
        this.viewPortNameEdit = true;
      }

      if (travelPoint) {
        this.$emit('setTravelPoint', true);
      } else {
        this.$emit('setTravelPoint', false);
      }

      if (interactWith !== 'Radius' && interactWith !== 'ManualDraw') {
        this.$root.$emit('infiniteDrawOff');

        if (this.controls.ViewPort) {
          this.viewPortIsActive = true;
        }
      }

      if (this.currentShape.id) {

        this.$emit('removeShapeFromMap', {
          id: this.currentShape.id,
          time: new Date().getTime(),
        });
        this.currentShape = {};
        this.viewPortNameEdit = false;
      }
    }
  }
  editValue (sliderId: any) {
    this.editingValue = true;
    this.newValue = '';
  }
  pushValue(slider: any, newValue: any) {
    this.editingValue = false;
    // this.priceSlider.value = newValue;
  }

  removePoint(id: string, index: number) {
    this.$emit('removeLayerById', id);
    setTimeout(() => {
      this.$emit('removeLayerById', 'onePoint');
    },         200);
    // this.$root.$emit('removeLayerById', 'onePoint');
    this.points.splice(index, 1);
    this.travelPolygons.splice(index, 1);
    this.selectedPoints = [];
    this.lastCalcObject = {};
  }

  getIcon(ty: string) {
    if (ty === 'walk') {
      return '<i class="fa fa-male"></i> ';
    }  if (ty === 'car') {
      return '<i class="fa fa-car"></i> ';
    }  if (ty === 'bike') {
      return '<i class="fa fa-bicycle"></i> ';
    }
    return '<i class="fa fa-train"></i> ';

  }

  updateTimeForTimeTravel() {
    /*if (this.lastCalcObject.by === 'Transit') {
      this.rushHourStartTimeError = false;
    }*/
    if (this.lastCalcObject.time && !this.rushHourStartTimeError) {
      this.$emit('travelTimeUpdate', {
        time: this.lastCalcObject.time,
        pointId: this.lastCalcObject.pointId,
        by: this.lastCalcObject.by,
        color: this.lastCalcObject.color,
        rushHour: this.lastCalcObject.by === 'Car' || this.lastCalcObject.by === 'Transit' ? this.rushHour : false,
        rushHourStartTime: this.letToSeconds(this.rushHourStartTime),
      });
    }
  }

  letToSeconds(str: string) {

    let a = [];
    if (str.indexOf(':') > -1) {
      a = str.split(':');

      return  (+Number(a[0])) * 60 * 60 + (+Number(a[1])) * 60;
    }
    return Number(str);

  }
  by: string = '';
  rushHour: boolean = false;
  rushHourStartTime: string = '';
  selectType(ty: string, id: number, color: string, travelType: string) {
    /*if (travelType !== 'transit') {
      this.rushHourStartTimeError = false;
    }*/
    this.travelTypes = {};

    this.travelTypes[id] = ty;
    this.by = travelType;

    this.selectedPoints = [];
    this.selectedPoints.push(id);

    if (this.travelTimes[id]) {
      if (!this.rushHourStartTimeError) {
        this.$emit('travelTimeUpdate', {
          color,
          time: this.travelTimes[id],
          pointId: id,
          by: ty,
          rushHour: travelType === 'car' || travelType === 'transit' ? this.rushHour : false,
          rushHourStartTime: this.rushHourStartTime ? this.letToSeconds(this.rushHourStartTime) : '',
        });
      }
      this.lastCalcObject = {
        color,
        time: this.travelTimes[id],
        pointId: id,
        by: ty,
        doneEditing: false,
      };

    }

    this.$forceUpdate();
  }

  selectTravelTime(time: number, pointId: any, color: string) {
    this.travelTimes = {};
    this.travelTimesValues = [];
    this.travelTimes[pointId] = time;
    this.travelTimesValues.push(pointId);
    if (this.travelTypes[pointId] !== 'Transit') {
      this.rushHourStartTimeError = false;
    }
    if (this.travelTypes[pointId]) {

      if (!this.rushHourStartTimeError) {
        this.$emit('travelTimeUpdate', {
          time,
          pointId,
          color,
          by: this.travelTypes[pointId],
          rushHour: this.travelTypes[pointId] === 'Car' || this.travelTypes[pointId] === 'Transit' ? this.rushHour : false,
          rushHourStartTime: this.rushHourStartTime ? this.letToSeconds(this.rushHourStartTime) : '',
        });
      }

      this.lastCalcObject = {
        time,
        pointId,
        color,
        by: this.travelTypes[pointId],
        doneEditing: false,
      };

    }
  }

  @Watch('rushHour')
  watchRushHour() {
    // if (this.rushHour) {
    if (this.lastCalcObject.time && !this.rushHourStartTimeError) {
      this.$emit('travelTimeUpdate', {
        time: this.lastCalcObject.time,
        pointId: this.lastCalcObject.pointId,
        by: this.lastCalcObject.by,
        color: this.lastCalcObject.color,
        rushHour: this.lastCalcObject.by === 'Car' || this.lastCalcObject.by === 'Transit' ? this.rushHour : false,
        rushHourStartTime: this.rushHourStartTime ? this.letToSeconds(this.rushHourStartTime) : '',
      });
    }
    // }
  }

  groupTravelPolygons() {
    if (this.markerGroupName === '' && this.travelPolygons.length) {
      // this.setMarkerGroupName();
      this.$refs['markerGroupName'].focus();
      this.$refs['markerGroupName'].classList.add('error_focus');
      return;
    }
    this.points.forEach(() => {
      this.$emit('removeLayerById', 'onePoint');
    });

    this.travelTypes = {};
    this.travelTimes = {};
    this.selectedPoints = [];
    this.travelTimesValues = [];
    this.points = [];

    if (this.travelPolygons.length) {

      this.lastCalcObject.doneEditing = true;
      const o = new api.GeoAreaShape({
        geom: this.travelPolygons[0],
        // geom: this.travelPolygons[0][0].geometry,
        name: this.markerGroupName,
        color: this.lastCalcObject.color,
      });
      o.key = this.lastCalcObject.pointId;
      this.searchModel.searchArea.shapes.unshift(o);
    }
    this.markerGroupName = '';
  }

  get isTravelTimeInvalid() {
    if (this.by === '' || this.travelTimesValues.length === 0 || this.markerGroupName === '') {
      return true;
    }
    if (this.by === 'transit') {
      if (this.rushHourStartTimeError) {
        return true;
      }
    }
    return false;
  }

  setMarkerGroupName() {
    // this.markerGroupName = prompt("Please enter marker group name");
    if (this.markerGroupName === '') {
      this.$refs['markerGroupName'].focus();
      this.$refs['markerGroupName'].classList.add('error_focus');
    } else {
      this.editGroupName = false;
    }
  }

  nextInput (ref: string) {
    this.$refs[ref].focus();
  }

  @Watch('currentShape', { immediate: true, deep: true })
  cs() {

    if (this.currentShape.name && this.currentShape.id) {
      this.$emit('addSymbolLayer', {
        shape: this.currentShape,
        time: new Date().getTime(),
      });
      // this.$root.$emit('addSymbolLayer', this.currentShape);
    }
  }
  @Watch('editGroupName')
  uu() {
    if (this.editGroupName) {
      setTimeout(() => {
        const el = document.getElementById('editGroupName') as HTMLInputElement;
        el.focus();
        el.select();
      },         100);
    }
  }
  @Watch('points')
  po() {
    if (this.points.length === 1) {
      this.editGroupName = true;

      setTimeout(() => {
        const el = document.getElementById('editGroupName') as HTMLInputElement;
        el.focus();
        el.select();
      },         100);
    } else {
      this.editGroupName = false;
    }
  }

  formatPrice (price: any) {
    if (price) {
      return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, "'");
    }
    return '';

  }

  @Watch('mapIsLoadedVar')
  mapIsLoaded() {
    if (!this.$route.params.subId) {
      if (this.mapIsLoadedVar) {
        if (this.searchHistory.length) {
          if (this.autoLoadHistory) {
            this.searchAgain(this.searchHistory[0]);
          }
        }
      }
    }
  }

  @Watch('autoLoadHistory')
  autoLoadHistoryWatch() {
    if (this.autoLoadHistory) {
      localStorage.setItem('autoLoadHistory_searchModule', '1');

    } else {
      localStorage.removeItem('autoLoadHistory_searchModule');
    }
  }

  get currentBundleName () {
    return this.val(this.empCtx, (empCtx: api.IUserWorkspaceContextModel) => empCtx.license.bundle.name, '');
  }

  get bundleCounter () {
    let cnt = 0;
    if (this.resultsCounter.bundleTotalItemCounts) {
      this.resultsCounter.bundleTotalItemCounts.forEach((b: any) => {
        if (this.empCtx && this.empCtx.license && b.bundle.id === this.empCtx.license.bundle.id) {
          cnt = b.count;
        }
      });
    }
    return cnt;
  }

  checkIfHigherBundle (count: number) {
    const workspaceBundle = this.empCtx.license;
    const allBundles = this.resultsCounter.bundleTotalItemCounts;
    if (workspaceBundle && workspaceBundle.bundle && allBundles) {
      if (!this.currentBundleCount) {
        const currentBundleCountIndex = allBundles.findIndex(bundle => bundle.bundle.id === workspaceBundle.bundle.id);
        if (currentBundleCountIndex !== -1) {
          this.currentBundleCount = allBundles[currentBundleCountIndex].count;
        }
      }
      return count <= this.currentBundleCount;
    }
  }

  addShapeToList(shape: Polygon) {
    const o = new api.GeoAreaShape({
      geom: shape.geom,
      name: shape.name,
      color: shape.color,
    });
    o.key = shape.id;

    this.searchModel.searchArea.shapes.unshift(o);
    this.showLocalityRequired = false;

  }

  @Watch('addressFromMap')
  watchAreasFromMap() {

    if (this.selectedSearchSuggestionsStrings.indexOf(this.addressFromMap.id) > -1) {
      Vue.prototype.$notify({
        group: 'actions',
        type: 'error',
        duration: 2500,
        text: 'Area is already in the list.',
      });
      return;
    }
    const a = this.addressFromMap;

    const address = new api.GeoAreaAddressPart();
    address.type = <api.GeoAddressPartType> a.type.valueOf();
    address.id = a.id;
    address.color = a.color;
    address.radius = 0;
    address.name = a.name;
    // e.push(addr);
    // this.searchModel.searchArea.addressParts.push(addr);
    this.searchModel.searchArea.addressParts.unshift(address);
    this.selectedSearchSuggestionsStrings.push(a.id);
    this.showLocalityRequired = false;
    this.$forceUpdate();
  }

  @Watch('addressForRemoveFromList')
  watchAddressesForRemoveFromList() {
    this.searchModel.searchArea.addressParts.filter((item: api.GeoAddressPart, index: number) => {
      if (this.addressForRemoveFromList.id === item.id) {
        this.searchModel.searchArea.addressParts.splice(index, 1);
      }
    });

    this.selectedSearchSuggestionsStrings.filter((adr: string, index) => {
      if (this.addressForRemoveFromList.id  === adr) {
        this.selectedSearchSuggestionsStrings.splice(index, 1);
      }
    });
  }

  @Watch('shapeFromMap')
  watchShapeFromMap() {
    if (this.shapeFromMap) {
      this.currentShape = this.shapeFromMap;
      this.currentShape.name = this.shapeFromMap.drawStyle === 'draw_polygon' ? 'Polygon name' : 'Radius name';
      this.viewPortNameEdit = true;

      setTimeout(() => {
        const el = document.getElementById('shapeName') as HTMLInputElement;
        el.focus();
        el.select();
      },         100);

    }
  }
  @Watch('travelPolygon')
  watchTravelPolygon() {
    this.travelPolygons = [];
    this.travelPolygons.push(this.travelPolygon.geo);

    const sd = _.cloneDeep(this.searchModel);

    if (sd.leadGenParams && sd.leadGenParams.triggers) {
      delete sd.leadGenParams;
    }

    const shape = {
      name: this.markerGroupName,
      color: this.lastCalcObject.color,
      geom: this.travelPolygons[0],
      // geom: this.travelPolygons[0][0].geometry,
    };

    sd.searchArea.shapes.unshift(shape);
    this.showLocalityRequired = false;

    api.$pubs.getTotals(sd).then((data: any) => {
      this.resultsCounter = data;
    }).catch(() => {
      Vue.prototype.$notify({
        group: 'actions',
        type: 'error',
        duration: 2500,
        text: 'Error setting total number of ads',
      });
    });
  }

  @Watch('travelPolygonPoint')
  watchTravelPolygonPoint() {
    if (!this.lastCalcObject.doneEditing && this.lastCalcObject.time) {

      this.$emit('removeLayerById', this.lastCalcObject.pointId);
      this.selectedPoints = [];
      this.selectedPoints.push(this.travelPolygonPoint.id);
      this.selectTravelTime(this.lastCalcObject.time, this.travelPolygonPoint.id, this.travelPolygonPoint.color);
      this.lastCalcObject.pointId = this.travelPolygonPoint.id;
      return;

    }

    this.points = [];
    this.points.push(this.travelPolygonPoint);
  }
  @Watch('shapeWithUpdatedRadius')
  watchShapeWithUpdatedRadius() {
    globalState.commitSetLoadingButton(store, false);
    this.extendIndex = -1;
    this.extendKm = null;
    this.showExtendKmModal = false;

    const sd = _.cloneDeep(this.searchModel);
    sd.searchArea.shapes = [];
    for (let i = 0, l = this.searchModel.searchArea.shapes.length; i < l; i += 1) {
      if (this.shapeWithUpdatedRadius.id === this.searchModel.searchArea.shapes[i].key) {
        // console.log(this.searchModel.searchArea.shapes[i].geom);
        this.searchModel.searchArea.shapes[i].geom = this.shapeWithUpdatedRadius.geom;
        sd.searchArea.shapes.unshift({
          name: this.searchModel.searchArea.shapes[i].name,
          geom: this.shapeWithUpdatedRadius.geom,
          color: this.searchModel.searchArea.shapes[i].color,
        });
      } else {
        sd.searchArea.shapes.unshift({
          name: this.searchModel.searchArea.shapes[i].name,
          geom: this.searchModel.searchArea.shapes[i].geom,
          color: this.searchModel.searchArea.shapes[i].color,
        });
      }
    }

    if (sd.leadGenParams && sd.leadGenParams.triggers) {
      delete sd.leadGenParams;
    }

    api.$pubs.getTotals(sd).then((data: any) => {
      this.resultsCounter = data;
    }).catch(() => {
      Vue.prototype.$notify({
        group: 'actions',
        type: 'error',
        duration: 2500,
        text: 'Error setting total number of ads',
      });
    });
  }

  @Watch('addressWithRadiusUpdated')
  watchAddressWithRadiusUpdated() {
    globalState.commitSetLoadingButton(store, false);
    this.extendIndex = -1;
    this.extendKm = null;
    this.showExtendKmModal = false;

    for (const i in this.searchModel.searchArea.addressParts) {
      // console.log(this.searchModel.searchArea.addressParts[i]);
      if (this.searchModel.searchArea.addressParts[i].id === this.addressWithRadiusUpdated.id) {
        this.searchModel.searchArea.addressParts[i].geom = this.addressWithRadiusUpdated.geometry;
        this.counterSearch();
        // console.log(this.addressWithRadiusUpdated);
      }
    }
  }

  @Watch('viewPortForSearchShapes')
  watchViewPortForSearchShapes() {
    if (!this.viewPortForSearchShapes.show) {
      this.showControl('Address');
      return;
    }

    this.viewPort = this.viewPortForSearchShapes;
    this.viewPortNameEdit = true;
    this.viewPortIsActive = true;
    setTimeout(() => {
      try {
        const el = document.getElementById('viewportName') as HTMLInputElement;
        el.focus();
        el.select();
      } catch {}
    },         100);
  }

  @Watch('viewPorts')
  watchViewPorts() {
    outer: for (const i in this.viewPorts) {
      if (this.viewPorts[i].polygon) {
        for (const e in this.searchModel.searchArea.shapes) {
          if (this.searchModel.searchArea.shapes[e].key === this.viewPorts[i].id) {
            continue outer;
          }
        }
        this.searchModel.searchArea.shapes.push(new api.GeoAreaShape({
          geom: {
            type: 'polygon',
            coordinates: [this.viewPorts[i].polygon],
          },
          name: this.viewPorts[i].name,
          color: this.viewPorts[i].color,
          key: this.viewPorts[i].id,
        }));
        this.showLocalityRequired = false;
      }
    }
    this.counterSearch();
  }
  get subscriptionId() {
    return {
      id: this.$route.params.subId,
      mapLoaded: this.mapIsLoadedVar,
    };
  }
  @Watch('subscriptionId')
  watchSubscriptionId() {
    if (this.subscriptionId.id && this.subscriptionId.mapLoaded) {
      this.loadAboEntry({ id: this.subscriptionId.id, edit: true });
    }
  }

  /*@Watch('searchModel', {immediate: true, deep: true})
  watchSearchModel() {
    if (this.searchModel.searchArea) {
      if (this.searchModel.searchArea.addressParts.length || this.searchModel.searchArea.shapes.length) {
        this.showLocalityRequired = false;
      } else {
        this.showLocalityRequired = true;
      }
    }
  }*/
  rushHourStartTimeError: boolean = true;
  @Watch('rushHourStartTime', { immediate: true })
  watchRushHourStartTime(newVal: string, oldVal: string) {
    const regex = /^([01]\d|2[0-3]):?([0-5]\d)$/g;
    if (regex.test(this.rushHourStartTime) || (oldVal !== '' && oldVal !== undefined && oldVal !== null && newVal === '')) {
      this.rushHourStartTimeError = false;
      this.updateTimeForTimeTravel();
    } else {
      this.rushHourStartTimeError = true;
    }
  }
}
