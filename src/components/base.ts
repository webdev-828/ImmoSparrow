import Vue from 'vue';
import autocomplete from './addressAutocomplete';
import { Component, Prop, Watch } from 'vue-property-decorator';
import { mixins } from 'vue-class-component';
import * as api from '@immosparrow/cockpit-api-v2';
import store from '../store';
import * as search_ from './../store/modules/searchStatesModule';
import accounting from 'accounting';
import * as globalState from '../store/modules/globalStatesModule';
import colorpicker from './shared/color_picker';
import Debounce from 'debounce-decorator';
import {
  getMarketRadarAds,
  getObjectWindow,
  getPubLightModel,
  getPubLightModels,
  getSearchedAddressBuilding,
} from '../store/modules/searchStatesModule';
import moment from 'moment';

import * as searchModule from '../store/modules/searchModule';
const geoJSON = require('geojson');
const _ = require('lodash');

import {
  TotalAdsChart, RentPerMonth, BuyPerMonth, CompetitorComparisonChart, GeoLocalChart,
  InboxChart, NewAdsPerDay, Subscriptions,
} from './dashboardDiagrams';
import FeatureChecks from '@/mixins/featureChecks';
import BundleChecks from '@/mixins/bundleChecks';

export enum IWorkaspaceStore {
  dashboardSettings = 0,
}

@Component({
  name: 'BaseComponent',
  // mixins: [template],
  components: {
    autocomplete,
  },
})

export default class BaseComponent extends mixins(FeatureChecks, BundleChecks) {

  autocompleteOptions: any = [];

  $refs: {
    totalAdsChartdiagram: TotalAdsChart,
    newAdsPerDaydiagram: NewAdsPerDay,
    geoLocalChartdiagram: GeoLocalChart,
    competitorComparisonChartdiagram: CompetitorComparisonChart,
    buyPerMonthdiagram: BuyPerMonth,
    rentPerMonthdiagram: RentPerMonth,
    inboxChartdiagram: InboxChart,
    subscriptions: Subscriptions,
    autocomplete: autocomplete,
    autocomplete_search: autocomplete,
    autocomplete_profile: autocomplete,
    autocomplete_geo: autocomplete,
    autocomplete_search_lp: autocomplete,
    autocomplete_search_master: autocomplete,
    transactionForm: any,
    avatar: any,
    map: any,
    colorpicker: colorpicker,
    cur: any,
    slider: any,
    topPagination: any,
    bottomPagination: any,
    topPagination2: any,
    bottomPagination2: any,
    priceSlider: any,
    yearInput: any,
    priceSliderMax: any,
    roomSliderMin: any,
    roomSliderMax: any,
    livingSpaceSliderMin: any,
    livingSpaceSliderMax: any,
    builtYearSliderMin: any,
    builtYearSliderMax: any,
    areaSliderMin: any,
    areaSliderMax: any,
    usableAreaSliderMin: any,
    usableAreaSliderMax: any,
    portalsChartTooltip: any,
  };

  rawCategories: { [name: number]: string } = {
    1021: window['Localize'].translate('Detached Houses'),
    1025: window['Localize'].translate('Multi Family Houses'),
    1030: window['Localize'].translate('Residential Building With Secondary Use'),
    1040: window['Localize'].translate('Building With Partial Residential Use'),
    7100: window['Localize'].translate('No Heating'),
    7101: window['Localize'].translate('Stove Heating'),
    7102: window['Localize'].translate('Self Contained Central Heating'),
    7103: window['Localize'].translate('Building Central Heating'),
    7104: window['Localize'].translate('Multiple Building Central Heating'),
    7105: window['Localize'].translate('Public Distant Heating'),
    7109: window['Localize'].translate('Other Heating'),
  };
  searchModuleResults: api.ISearchResult<api.IPubLightModel>;

  apiUrl: string = process.env.apiURL;

  /*slider_props: any = {

    width: 'auto',
    direction: 'horizontal',
    eventType: 'auto',
    tooltipDir: 'bottom',
    // min: 0,
    // max: 100,
    interval: 1,
    disabled: false,
    show: true,
    realTime: true,
    tooltip: 'always',
    clickable: true,
    piecewise: false,
    lazy: false,
    reverse: false,
    speed: 0.5,
    formatter: undefined,
    bgStyle: undefined,
    sliderStyle: undefined,
    tooltipStyle: undefined,
    processStyle: undefined,
    piecewiseStyle: undefined,
    condition: '',
    height: 4,
    dotSize: 14,

  };*/

  // mask for password
  passRegex: RegExp = new RegExp('^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\\$%\\^&\\*\\(\\)\\[\\]\\{\\}\\<\\>\\-\\_\\=\\+\\.\\?])');

  // for bookmarks editing var
  editing: string = '';

  showModal: boolean = false;
  // start with tabs
  tabs: object = {
    search: true,
    bookmarks: false,
    docs: false,
    history: false,
    abo: false,
    overview: false,
    analytics: false,
    buildingsites: false,
    similar: false,
    showApartments: false,
    showAds: false,
    neighborhood: false,
    historyAds: false,
    'file-history': false,
    profileGlobal: false,
    updatePassword: false,
    profileLead: false,
    profileTemplates: false,
    profileEmail: false,
    profilePipe: false,
    pricePredictionPrice: false,
    fileWizard: false,
  };

  subTabs: object = {
    showApartments: false,
    showAds: false,
  };

  subSubTabs: object = {
    showFeatures: false,
    showPrice: true,
  };

  moreTabs: object = {
    marketRadarDataIn: false,
    marketPricingInfo: false,
    marketAdsInfo: false,
  };

  lPFilter = {
    selected: 'Show All (No Filter)',
    val: [{
      val: 0,
      text: 'Show All (No Filter)',
    }, {
      val: 1,
      text: 'Assigned',
    }, {
      val: 2,
      text: 'Not Assigned',
    }],
  };

  masterFilterVal = {
    selected: 'Show All (No Filter)',
    val: [{
      val: 0,
      text: 'Show All (No Filter)',
    }, {
      val: 1,
      text: 'Biggest first',
    }, {
      val: 2,
      text: 'Smallest first',
    }],
  };

  // end with tabs

  mapZoom: number = 0;

  format_money(number: number, c?: string) {
    // c = "CHF";
    try {
      return accounting.formatMoney(number, '', 0, "'", ','); // &euro;4.999,99
      // return c + " " + accounting.formatMoney(number, "", 0, "'", ","); // &euro;4.999,99
    } catch {
      return '';
    }
  }

  dateDiffInDays(date1: any, date2: any) {

    const oneDay = 1000 * 60 * 60 * 24;    // Convert both dates to milliseconds
    const date1Ms = date1.getTime();
    const date2Ms = date2.getTime();    // Calculate the difference in milliseconds
    const differenceMs = date2Ms - date1Ms;        // Convert back to days and return

    if (Math.round(differenceMs / oneDay) > 365) {
      return (Math.round(differenceMs / oneDay) / 365) > 1 ?
        `${Math.floor(Math.round(differenceMs / oneDay) / 365)} years` :
        `${Math.floor(Math.round(differenceMs / oneDay) / 365)} year`;
    }
    return `${Math.round(differenceMs / oneDay)} days`;

  }

  convertGeoJsonToPolygon(geoJson: any) {
    const d = geoJSON.parse(geoJson[0][0], { Point: ['y', 'x'] });
    const s: any = [];
    for (const i in d.features) {
      s.push(d.features[i].geometry.coordinates);
    }

    return [s];
  }

  setActiveMarker(ad: api.PubModel) {
    const data = ad ? { type: 'active', ads: ad } : { type: 'active' };
    this.$root.$emit('setPopupState', data);
    this.$root.$emit('highlight_marker', ad ? ad.id : '');
  }

  hilight_marker(ad: api.PubModel, empty: string) {

    if (empty === '') {
      this.$root.$emit('highlight_marker', '');
      this.$root.$emit('setPopupState', { type: 'hover' });
    } else {
      this.$root.$emit('highlight_marker', ad.id);
      this.$root.$emit('setPopupState', { type: 'hover', ads: ad });
    }

    // console.log(ad["address"]["localityUniqueIdentifier"]);
  }

  searchSidebarToggle() {
    const searchSidebar = document.querySelector('#side-overlay');
    if (searchSidebar.classList.contains('active')) {
      searchSidebar.classList.remove('active');
      globalState.commitSetSearchSidebar(this.$store, false);
      this.$emit('addressIsFromAutocomplete', true);
    } else {
      searchSidebar.classList.add('active');
      globalState.commitSetSearchSidebar(this.$store, true);
    }
  }

  add_to_history(address: api.GeoSuggestion) {

    address['time'] = new Date();
    // history.commitAddToTransparencyHistory(store, address);

  }
  edit_bookmark(address: api.GeoSuggestion, action: string, date: string) {

    this.editing = address.uniqueIdentifier;

    if (action === 'save') {
      this.editing = '';
      address['scope'] = date;
      // bookmarks.update_bookmark(store, address);
    }
  }
  remove_doc(address: api.GeoSuggestion) {
    // docs.RemoveDoc(store, address);
  }

  bookmark(address: api.GeoSuggestion) {

    if (this.isAddressBookmarked(address)) {
      // bookmarks.commitRemoveFromBookmarks(store, address);
    } else {
      // bookmarks.commitAddToBookmarks(store, address);
    }
  }

  isAddressBookmarked(address: api.GeoSuggestion) {
    this.bkmrks.forEach((item) => {
      item.data.forEach((data: any) => {
        if (data.uniqueIdentifier === address.uniqueIdentifier) {
          return true;
        }
      });
    });

    return false;

  }

  get showSearchMap() {
    return globalState.getSearchMap(store);
  }
  // globalState.commitShowSearchMap(store, true);
  get transparency_history() {
    return new Array(); // history.getTransparencyHistory(store);
  }

  get bkmrks() {
    return new Array(); // bookmarks.getBookmarks(store);
  }

  get documents() {
    return new Array(); // docs.getDocs(store);
  }

  empty_history(action: boolean) {

    if (action) {
      this.showModal = false;
      // history.commitResetHistory(store);
    } else {
      this.showModal = true;
    }

  }

  empty_bookmarks(action: boolean) {

    if (action) {
      this.showModal = false;
      // bookmarks.commitResetBookmarks(store);
    } else {
      this.showModal = true;
    }

  }

  empty_docs(action: boolean) {

    if (action) {
      this.showModal = false;
      // docs.resetDocs(store);
    } else {
      this.showModal = true;
    }

  }

  getDay(date: Date) {
    moment.locale(localStorage.getItem('lang'));
    return moment(date).format('dddd');
  }

  getDate(date: Date) {
    moment.locale(localStorage.getItem('lang'));
    return moment.utc(date.getTime()).local().format('DD.MM.YYYY');
  }

  getTime(date: Date) {
    return moment.utc(date.getTime()).local().format('HH:mm');
  }

  get objectWindow() {
    return getObjectWindow(store);
  }

  get searchedAddressBuilding() {
    return getSearchedAddressBuilding(store);
  }

  get pubLightModel() {
    return getPubLightModel(store);
  }
  get pubLightModels() {
    return getPubLightModels(store);
  }

  get marketRadarAds() {
    return getMarketRadarAds(store);
  }

  get showMapRightSidebar() {
    return globalState.getMapRightSidebar(store);
  }
  get mainSearchedAddress() {
    return search_.getSearchedAddress(store);
  }

  get transparencySearchedAddress() {
    return search_.getSearchedAddressTransparency(store);
  }
  get marketRadarSearchedAddressRadius() {
    return search_.getSearchedAddressMarketRadarRadius(store);
  }
  get marketRadarSearchedAddress() {
    return search_.getSearchedAddressMarketRadar(store);
  }
  get pricePredictSearchedAddress() {
    return search_.getSearchedPricePredictAddress(store);
  }
  get pricePredictSearchedAddressOutside() {
    return search_.getSearchedPricePredictAddressOutside(store);
  }

  get isLeftSearchBarOpened() {
    return globalState.getSearchSideBar(store);
  }

  get isRightSideBarOpened() {
    return globalState.getRightSidebar(store);
  }

  get transparencySideBarOpened() {
    return globalState.getTransparencySidebar(store);
  }

  get building() {
    return getSearchedAddressBuilding(store);
  }

  get_building_type(no: number) {

    const e: any = {
      0: 'Unknown',
      1: 'Verwaltung',
      2: 'Wohngebaeude',
      4: 'Verkehr',
      5: 'Handel',
      6: 'Industrie_Gewerbe',
      8: 'Nebengebaeude',
    };

    return e[no];
  }

  @Debounce(250)
  async searchAllModules(no: number) {
    const self = this;
    /*
    *
    * Canton = 10,
    MarketRegion = 15,
    MsRegion = 18,
    District = 20,
    Commune = 30,
    Quarter = 40,
    Locality = 50,
    Street = 60,
    EntranceAddress = 70
    * */

    const results = await api.$geo.findSuggestions({
      text: this.$parent.$refs['autocomplete']['model'],
      includeGeom: true,
      suggestionTypes: [10, 15, 18, 20, 30, 50, 70],
      maxItemCount: 6,
    });

    this.autocompleteOptions = results;
    this.$parent.$refs['autocomplete']['options'] = results;
    this.$parent.$refs['autocomplete']['loadingData'] = false;

  }

  get_icon(no: number, no2?: number) {

    /*
      Canton = 10,
      District = 20,
      Commune = 30,
      Quarter = 40,
      Locality = 50,
      Street = 60,
      EntranceAddress = 70

      MarketRegion = 15,
    MsRegion = 18,
     */

    // return "icon_" + no.toString();

    let name = '';
    let shortName = '';
    switch (no) {
      case 10:
        name = 'Canton';
        shortName = 'Can';
        break;

      case 20:
        name = 'District';
        shortName = 'Dis';
        break;

      case 30:
        name = 'Commune';
        shortName = 'Com';
        break;

      case 40:
        name = 'Quarter';
        shortName = 'Quar';
        break;

      case 50:
        name = 'Locality';
        shortName = 'Loc';
        break;

      case 60:
        name = '';
        shortName = '';
        break;

      case 70:
        name = '';
        shortName = '';
        break;

      case 15:
        name = 'Market Region';
        shortName = 'M.Reg';
        break;

      case 18:
        name = 'Ms Region';
        shortName = 'Ms.Reg';
        break;
    }
    return name;

  }

  get_icon2(no: number) {
    let shortName = '';
    switch (no) {
      case 10:
        shortName = 'Can';
        break;

      case 20:
        shortName = 'Dis';
        break;

      case 30:
        shortName = 'Com';
        break;

      case 40:
        shortName = 'Quar';
        break;

      case 50:
        shortName = 'Loc';
        break;

      case 60:
        shortName = '';
        break;

      case 70:
        shortName = '';
        break;

      case 15:
        shortName = 'M.Reg';
        break;

      case 18:
        shortName = 'Ms.Reg';
        break;
    }
    return shortName;

  }

  get_products(no: number) {

    const productTypes = [
      {
        name: 'search',
        types: [10, 20, 30, 40, 50, 15, 18],
      },
      {
        name: 'price_prediction',
        types: [api.GeoAddressPartType.EntranceAddress],
      }, /*,
      {
        name: "transparency",
        types: [api.GeoAddressPartType.EntranceAddress]
      }*/
    ];
    // let types = api.GeoSuggestionTypeEnum;
    const products = [];
    // console.log(types[no]);

    for (let i = 0, l = productTypes.length; i < l; i += 1) {

      if (productTypes[i].types.indexOf(no) > -1) {
        products.push(productTypes[i].name);
      }
    }

    return products;

  }

  print_(address: api.GeoSuggestion) {

    const self = this;
    address['time'] = new Date();

    const quotes = document.getElementById('print');
    // docs.AddToDocs(store, address);

    /*html2pdf(quotes, {
      margin:       0.8,
      filename:     address.name,
      // image:        { type: 'jpeg', quality: 0.98 },
      html2canvas:  { dpi: 192, letterRendering: true },
      jsPDF:        { unit: "cm", format: "a4", orientation: "portrait" }
    }, function(data: any) {
      // console.log(data)
    }).then(function (data: any) {

      // self.printing = false;
    });*/
  }

  toggle(what: string, no?: boolean) {
    const searchSidebar = document.querySelector('#side-overlay');
    if (!no) {
      try {
        if (!searchSidebar.classList.contains('active')) {
          searchSidebar.classList.add('active');
        }
      } catch {
      }
    }
    setTimeout(() => {
      for (const i in this.tabs) {
        if (i === what) {
          this.tabs[i] = true;
          try {
            if (!no) {
              if (!searchSidebar.classList.contains('active')) {
                this.$emit('showMapOnToggle', true);
              }
            }
          } catch { }
        } else {
          this.tabs[i] = false;
        }
      }
    }, 200);
  }

  toggleSubTabs(what: string) {

    for (const i in this.subTabs) {
      if (i === what) {
        this.subTabs[i] = true;
      } else {
        this.subTabs[i] = false;
      }
    }
  }

  toggleSubSubTabs(what: string) {

    for (const i in this.subSubTabs) {
      if (i === what) {
        this.subSubTabs[i] = true;
      } else {
        this.subSubTabs[i] = false;
      }
    }
  }

  searchTypes: string = '';

  getMainCategoryHistory(mainIds: number[], subIds: string[]) {

    searchModule.dispatchGetPropertyTypes(store)
      .then(() => {
        const t = searchModule.getPropertyTypes(store);
        const names: string[] = [];
        if (mainIds.length) {
          const n = t.filter(t1 => mainIds.indexOf(t1.id) > -1);

          for (const i in n) {
            names.push(n[i].name);
          }
        } else {
          if (subIds.length) {
            for (const i in t) {
              for (const e in t[i].propertyTypes) {
                const n = t[i].propertyTypes.filter(t1 => subIds.indexOf(t1.id) > -1);

                for (const i in n) {
                  if (!names.includes(n[i].name)) {
                    names.push(n[i].name);
                  }
                }

              }
            }
          }
        }

        this.searchTypes = names.join(', ');

        /*let t = searchModule.getPropertyTypes(store);
        let n =  t.filter(t1 => ids.indexOf(t1.id) > -1);
        let names = [];
        for (let i in n) {
          names.push(n[i].name);
        }

        if (!names.length) {
          // let t = searchModule.getPropertyTypes(store);

          for (let i in t) {
            for (let e in t[i].propertyTypes) {
              let n =  t[i].propertyTypes.filter(t1 => ids.indexOf(t1.id) > -1);

              for (let i in n) {
                names.push(n[i].name);
              }

            }
          }
          // let n =  t.filter(t1 => ids.indexOf(t1.propertyTypes.id) > -1);
        }
        this.searchTypes = names.join(", ");*/
      });

  }

  getAddressName(ids: any) {

    const promises = <any>[];
    for (let i = 0, l = ids.length; i < l; i += 1) {
      const p = api.$geo.getAddressPart(ids[i].id).then((res: any) => {
        return res;
      });
      promises.push(p);

      return Promise.all(promises).then((data: any) => {
        return data;
      });
    }

  }

  toggleMore(what: string) {

    for (const i in this.moreTabs) {
      if (i === what) {
        this.moreTabs[i] = true;
      } else {
        this.moreTabs[i] = false;
      }
    }
  }

  @Watch('objectWindow')
  ow(val: boolean) {
    try {
      if (val) {
        document.getElementsByClassName('switch_style')[0].className = 'switch_style mapboxgl-ctrl-group mapboxgl-ctrl on_left second';
      } else {
        document.getElementsByClassName('switch_style')[0].className = 'switch_style mapboxgl-ctrl-group mapboxgl-ctrl';
      }
    } catch { }
  }

  colors() {
    return [
      '#5c90d2',
      '#a48ad4',
      '#ff6b6b',
      '#44b4a6',
      '#14adc4',
      '#ff6c9d',
      '#46c37b',
      '#70b9eb',
      '#f3b760',
      '#d26a5c',
      '#D6A298',
      '#BDE4A8',
      '#FDC5F5',
      '#72DDF7',
      '#86ACDC',
      '#CCDCF1',
      '#98B9E3',
      '#5C90D2',
      '#E4DCF2',
      '#C7B7E4',
      '#A48AD4',
      '#A8DED8',
      '#83D0C7',
      '#44B4A6',
      '#70B9EB',
      '#46C37B',
    ];
  }
  new_colors() {
    return [
      '#86ACDC',
      '#CCDCF1',
      '#98B9E3',
      '#5C90D2',
      '#E4DCF2',
      '#C7B7E4',
      '#A48AD4',
      '#A8DED8',
      '#83D0C7',
      '#44B4A6',
      '#70B9EB',
      '#46C37B',
    ];
  }
  get_colors() {
    return {
      red: {
        100: '#ffcdd2',
        200: '#ef9a9a',
        300: '#e57373',
        400: '#ef5350',
        500: '#f44336',
        600: '#e53935',
        700: '#d32f2f',
        800: '#c62828',
        900: '#b71c1c',
        a100: '#ff8a80',
        a200: '#ff5252',
        a400: '#ff1744',
        a700: '#d50000',
      },
      pink: {
        100: '#f8bbd0',
        200: '#f48fb1',
        300: '#f06292',
        400: '#ec407a',
        500: '#e91e63',
        600: '#d81b60',
        700: '#c2185b',
        800: '#ad1457',
        900: '#880e4f',
        a100: '#ff80ab',
        a200: '#ff4081',
        a400: '#f50057',
        a700: '#c51162',
      },
      purple: {
        100: '#e1bee7',
        200: '#ce93d8',
        300: '#ba68c8',
        400: '#ab47bc',
        500: '#9c27b0',
        600: '#8e24aa',
        700: '#7b1fa2',
        800: '#6a1b9a',
        900: '#4a148c',
        a100: '#ea80fc',
        a200: '#e040fb',
        a400: '#d500f9',
        a700: '#aa00ff',
      },
      deeppurple: {
        100: '#d1c4e9',
        200: '#b39ddb',
        300: '#9575cd',
        400: '#7e57c2',
        500: '#673ab7',
        600: '#5e35b1',
        700: '#512da8',
        800: '#4527a0',
        900: '#311b92',
        a100: '#b388ff',
        a200: '#7c4dff',
        a400: '#651fff',
        a700: '#6200ea',
      },
      indigo: {
        100: '#c5cae9',
        200: '#9fa8da',
        300: '#7986cb',
        400: '#5c6bc0',
        500: '#3f51b5',
        600: '#3949ab',
        700: '#303f9f',
        800: '#283593',
        900: '#1a237e',
        a100: '#8c9eff',
        a200: '#536dfe',
        a400: '#3d5afe',
        a700: '#304ffe',
      },
      blue: {
        100: '#bbdefb',
        200: '#90caf9',
        300: '#64b5f6',
        400: '#42a5f5',
        500: '#2196f3',
        600: '#1e88e5',
        700: '#1976d2',
        800: '#1565c0',
        900: '#0d47a1',
        a100: '#82b1ff',
        a200: '#448aff',
        a400: '#2979ff',
        a700: '#2962ff',
      },
      lightblue: {
        100: '#b3e5fc',
        200: '#81d4fa',
        300: '#4fc3f7',
        400: '#29b6f6',
        500: '#03a9f4',
        600: '#039be5',
        700: '#0288d1',
        800: '#0277bd',
        900: '#01579b',
        a100: '#80d8ff',
        a200: '#40c4ff',
        a400: '#00b0ff',
        a700: '#0091ea',
      },
      cyan: {
        100: '#b2ebf2',
        200: '#80deea',
        300: '#4dd0e1',
        400: '#26c6da',
        500: '#00bcd4',
        600: '#00acc1',
        700: '#0097a7',
        800: '#00838f',
        900: '#006064',
        a100: '#84ffff',
        a200: '#18ffff',
        a400: '#00e5ff',
        a700: '#00b8d4',
      },
      teal: {
        100: '#b2dfdb',
        200: '#80cbc4',
        300: '#4db6ac',
        400: '#26a69a',
        500: '#009688',
        600: '#00897b',
        700: '#00796b',
        800: '#00695c',
        900: '#004d40',
        a100: '#a7ffeb',
        a200: '#64ffda',
        a400: '#1de9b6',
        a700: '#00bfa5',
      },
      green: {
        200: '#a5d6a7',
        300: '#81c784',
        400: '#66bb6a',
        500: '#4caf50',
        600: '#43a047',
        700: '#388e3c',
        800: '#2e7d32',
        900: '#1b5e20',
        a100: '#b9f6ca',
        a200: '#69f0ae',
        a400: '#00e676',
        a700: '#00c853',
      },
      lightgreen: {
        200: '#c5e1a5',
        300: '#aed581',
        400: '#9ccc65',
        500: '#8bc34a',
        600: '#7cb342',
        700: '#689f38',
        800: '#558b2f',
        900: '#33691e',
        a100: '#ccff90',
        a200: '#b2ff59',
        a400: '#76ff03',
        a700: '#64dd17',
      },
      lime: {
        200: '#e6ee9c',
        300: '#dce775',
        400: '#d4e157',
        500: '#cddc39',
        600: '#c0ca33',
        700: '#afb42b',
        800: '#9e9d24',
        900: '#827717',
        a100: '#f4ff81',
        a200: '#eeff41',
        a400: '#c6ff00',
        a700: '#aeea00',
      },
      yellow: {
        200: '#fff59d',
        300: '#fff176',
        400: '#ffee58',
        500: '#ffeb3b',
        600: '#fdd835',
        700: '#fbc02d',
        800: '#f9a825',
        900: '#f57f17',
        a100: '#ffff8d',
        a200: '#ffff00',
        a400: '#ffea00',
        a700: '#ffd600',
      },
      amber: {
        200: '#ffe082',
        300: '#ffd54f',
        400: '#ffca28',
        500: '#ffc107',
        600: '#ffb300',
        700: '#ffa000',
        800: '#ff8f00',
        900: '#ff6f00',
        a100: '#ffe57f',
        a200: '#ffd740',
        a400: '#ffc400',
        a700: '#ffab00',
      },
      orange: {
        100: '#ffe0b2',
        200: '#ffcc80',
        300: '#ffb74d',
        400: '#ffa726',
        500: '#ff9800',
        600: '#fb8c00',
        700: '#f57c00',
        800: '#ef6c00',
        900: '#e65100',
        a100: '#ffd180',
        a200: '#ffab40',
        a400: '#ff9100',
        a700: '#ff6d00',
      },
      deeporange: {
        100: '#ffccbc',
        200: '#ffab91',
        300: '#ff8a65',
        400: '#ff7043',
        500: '#ff5722',
        600: '#f4511e',
        700: '#e64a19',
        800: '#d84315',
        900: '#bf360c',
        a100: '#ff9e80',
        a200: '#ff6e40',
        a400: '#ff3d00',
        a700: '#dd2c00',
      },
      brown: {

        200: '#bcaaa4',
        300: '#a1887f',
        400: '#8d6e63',
        500: '#795548',
        600: '#6d4c41',
        700: '#5d4037',
        800: '#4e342e',
        900: '#3e2723',
      },
      grey: {

        400: '#bdbdbd',
        500: '#9e9e9e',
        600: '#757575',
        700: '#616161',
        800: '#424242',
        900: '#212121',
      },
      bluegrey: {
        200: '#b0bec5',
        300: '#90a4ae',
        400: '#78909c',
        500: '#607d8b',
        600: '#546e7a',
        700: '#455a64',
        800: '#37474f',
        900: '#263238',
      },
    };
  }

  get_random_color(): string {
    const colors = Object.keys(this.get_colors());
    const randomKey = colors[Math.floor(Math.random() * colors.length)];
    const keys = Object.keys(this.get_colors()[randomKey]);
    return this.get_colors()[randomKey][keys[Math.floor(keys.length * Math.random())]];
  }
  get get_map_draw_styles() {

    return [
      // ACTIVE (being drawn)
      // line stroke
      {
        id: 'gl-draw-line',
        type: 'line',
        filter: ['all', ['==', '$type', 'LineString'], ['!=', 'mode', 'static']],
        layout: {
          'line-cap': 'round',
          'line-join': 'round',
        },
        paint: {
          'line-color': '#D96B27',
          // "line-dasharray": [0.2, 2],
          'line-width': 4,
        },
      },
      // polygon fill
      {
        id: 'gl-draw-polygon-fill',
        type: 'fill',
        filter: ['all', ['==', '$type', 'Polygon'], ['!=', 'mode', 'static']],
        paint: {
          'fill-color': this.$refs.colorpicker.defaultColor,
          'fill-outline-color': '#D20C0C',
          'fill-opacity': 0.1,
        },
      },
      // polygon outline stroke
      // This doesn"t style the first edge of the polygon, which uses the line stroke styling instead
      {
        id: 'gl-draw-polygon-stroke-active',
        type: 'line',
        filter: ['all', ['==', '$type', 'Polygon'], ['!=', 'mode', 'static']],
        layout: {
          'line-cap': 'round',
          'line-join': 'round',
        },
        paint: {
          'line-color': '#D96B27',
          // "line-dasharray": [0.2, 2],
          'line-width': 4,
        },
      },
      // vertex point halos
      {
        id: 'gl-draw-polygon-and-line-vertex-halo-active',
        type: 'circle',
        filter: ['all', ['==', 'meta', 'vertex'], ['==', '$type', 'Point'], ['!=', 'mode', 'static']],
        paint: {
          'circle-radius': 7,
          'circle-color': '#FFF',
        },
      },
      // vertex points
      {
        id: 'gl-draw-polygon-and-line-vertex-active',
        type: 'circle',
        filter: ['all', ['==', 'meta', 'vertex'], ['==', '$type', 'Point'], ['!=', 'mode', 'static']],
        paint: {
          'circle-radius': 6,
          'circle-color': '#fff',
        },
      },

      // INACTIVE (static, already drawn)
      // line stroke
      {
        id: 'gl-draw-line-static',
        type: 'line',
        filter: ['all', ['==', '$type', 'LineString'], ['==', 'mode', 'static']],
        layout: {
          'line-cap': 'round',
          'line-join': 'round',
        },
        paint: {
          'line-color': '#fff',
          'line-width': 3,
        },
      },
      // polygon fill
      {
        id: 'gl-draw-polygon-fill-static',
        type: 'fill',
        filter: ['all', ['==', '$type', 'Polygon'], ['==', 'mode', 'static']],
        paint: {
          'fill-color': '#fff',
          'fill-outline-color': '#fff',
          'fill-opacity': 0.1,
        },
      },
      // polygon outline
      {
        id: 'gl-draw-polygon-stroke-static',
        type: 'line',
        filter: ['all', ['==', '$type', 'Polygon'], ['==', 'mode', 'static']],
        layout: {
          'line-cap': 'round',
          'line-join': 'round',
        },
        paint: {
          'line-color': '#fff',
          'line-width': 3,
        },
      },
    ];
  }

  /*
  *   paginator for market radar and search
  * */

  /*@Watch('adsInViewport', { immediate: true, deep: true })
  adsInV() {
    if (this.adsInViewport.length) {
      this.adsNotOnMap();
      this.adsOnMap();
    }
  }*/
  // @Prop({default: []})
  adsInViewport: {
    id: string,
    coordinates: api.GeoCoordinates,
    time?: number,
  }[] = [];

  adsOnMapCountPages: number = 0;
  newAdsOnMapCount: number = 0;
  newAdsOnMap: api.PubModel[] = new Array<api.PubModel>();
  newAdsNotOnMap: api.PubModel[] = new Array<api.PubModel>();
  adsNotOnMapCountPages: number = 0;
  newAdsNotOnMapCount: number = 0;
  pageNum: number = 1;
  pageNum2: number = 1;
  showZero: boolean = true;
  showOne: boolean = false;
  selectedIndex: number;
  selectedAd: string = null;
  loading: boolean = false;
  allAds: number = 0;
  perPage: number = 6;
  timer: any = null;
  searchResults: number = 0;

  async adsNotOnMap() {
    const self = this;
    /*
      1. make paginator for ads no on map
      2. get current page
      3. get ads not on map
     */

    // 1. make paginator for ads on map
    const ids: string[] = [];
    const filteredAds = this.adsInViewport.filter((ad) => {
      if (!ad.coordinates) {
        ids.push(ad.id);
        return ad;
      }
    });

    if (filteredAds.length % this.perPage !== 0) {
      this.adsNotOnMapCountPages = Math.floor(filteredAds.length / this.perPage) + 1;
    } else {

      this.adsNotOnMapCountPages = Math.floor(filteredAds.length / this.perPage);
    }

    // 2. get current page && get ads not on map
    if (ids.length) {
      api.$pubs.getMultiple(ids.slice((this.pageNum2 - 1) * this.perPage, this.pageNum2 * this.perPage)).then((data: api.PubModel[]) => {
        self.newAdsNotOnMap = data;
        self.$forceUpdate();
      });
    } else {
      self.newAdsNotOnMap = [];
    }

    globalState.updateLoadingSearchResults(store, false);

    this.newAdsNotOnMapCount = ids.length;
  }

  async adsOnMap() {
    const self = this;
    /*
      1. make paginator for ads on map
      2. get current page
      3. get ads on map
     */

    // 1. make paginator for ads on map
    const ids: string[] = [];
    this.adsInViewport.filter((ad) => {
      if (ad.coordinates) {
        ids.push(ad.id);
        // return ad;
      }
    });
    this.loadingOnNext = true;
    if (ids.length % this.perPage !== 0) {
      this.adsOnMapCountPages = Math.floor(ids.length / this.perPage) + 1;
    } else {

      this.adsOnMapCountPages = Math.floor(ids.length / this.perPage);
    }
    // 2. get current page && get ads on map
    if (ids.length) {
      await api.$pubs.getMultiple(ids.slice(0, this.pageNum * this.perPage)).then((data: api.PubModel[]) => {
        self.newAdsOnMap = data;
        this.loadingOnNext = false;
      });
    } else {
      self.newAdsOnMap = [];
    }
    globalState.updateLoadingSearchResults(store, false);

    this.newAdsOnMapCount = ids.length;

    return true;
  }
  get getNewAdsOnMap() {
    return this.newAdsOnMap;
  }
  loadingOnNext: boolean = false;
  nextPage(pageNum: number, index: number, state?: any) {
    this.loadingOnNext = true;
    this.pageNum = pageNum;
    if (!state) {
      this.$refs.topPagination.selected = this.pageNum - 1;
    }
    const self = this;
    const ids: string[] = [];
    this.adsInViewport.filter((ad) => {
      if (ad.coordinates) {
        ids.push(ad.id);
      }
    });
    if (state) {
      if (!ids.slice((this.pageNum - 1) * this.perPage, this.pageNum * this.perPage).length) {
        state.complete();
        return;
      }
    }
    const results = api.$pubs.getMultiple(ids.slice((this.pageNum - 1) * this.perPage, this.pageNum * this.perPage));
    results.then((data: api.PubModel[]) => {
      self.loadingOnNext = false;
      if (state) {
        for (const i in data) {
          self.newAdsOnMap.push(data[i]);
        }
      } else {
        self.newAdsOnMap = data;
      }
      self.$forceUpdate();
      if (this.pageNum === this.adsOnMapCountPages) {
        const currInd = this.selectedIndex;
        const nextIndex = currInd + 1;
        if (!this.newAdsOnMap[nextIndex]) {
          globalState.commitSetNextItem(store, false);
        }
      }
      if (index !== -1) {
        this.selectedIndex = index;
        if (this.newAdsOnMap[this.selectedIndex]) {
          this.selectedAd = this.newAdsOnMap[this.selectedIndex].id;
        }
      }
      if (self.newAdsOnMap.length) {
        if (state) {
          state.loaded();
        }
      } else {
        if (state) {
          state.complete();
        }
      }

    });
  }

  nextPage2(pageNum: number, index: number) {
    this.loadingOnNext = true;
    this.pageNum2 = pageNum;
    this.$refs.topPagination2.selected = this.pageNum2 - 1;

    const self = this;
    const ids: string[] = [];
    const filteredAds = this.adsInViewport.filter((ad) => {
      if (!ad.coordinates) {
        ids.push(ad.id);
        return ad;
      }
    });
    const results = api.$pubs.getMultiple(ids.slice((this.pageNum2 - 1) * this.perPage, this.pageNum2 * this.perPage));
    results.then((data: api.PubModel[]) => {
      self.loadingOnNext = false;
      self.newAdsNotOnMap = data;
      if (this.pageNum2 === this.adsNotOnMapCountPages) {
        const currInd = this.selectedIndex;
        const nextIndex = currInd + 1;
        if (!this.newAdsNotOnMap[nextIndex]) {
          globalState.commitSetNextItem(store, false);
        }
      }
      if (index !== -1) {
        this.selectedIndex = index;
        if (this.newAdsNotOnMap[this.selectedIndex]) {
          this.selectedAd = this.newAdsNotOnMap[this.selectedIndex].id;
        }
      }
    });
  }

  selectItem(index: number, arrow: boolean, left: boolean) {
    globalState.commitSetNextItem(store, true);
    if (this.showZero) {
      if (index !== 0 && index % this.perPage === 0 && !left) {
        this.pageNum += 1;
        this.selectedIndex = 0;
        this.nextPage(this.pageNum, 0);
      } else if (index === -1 && this.pageNum > 0) {
        this.pageNum -= 1;
        this.selectedIndex = 5;
        this.nextPage(this.pageNum, 5);
      } else {
        this.selectedIndex = index;
        this.selectedAd = this.newAdsOnMap[this.selectedIndex].id;
        this.setActiveMarker(this.newAdsOnMap[this.selectedIndex]);
        if (this.pageNum === this.adsOnMapCountPages) {
          const nextIndex = this.selectedIndex + 1;
          if (!this.newAdsOnMap[nextIndex]) {
            globalState.commitSetNextItem(store, false);
          }
        }
      }
    } else {
      if (index !== 0 && index % this.perPage === 0 && !left) {
        this.pageNum2 += 1;
        this.selectedIndex = 0;
        this.nextPage2(this.pageNum2, 0);
      } else if (index === -1 && this.pageNum2 > 0) {
        this.pageNum2 -= 1;
        this.selectedIndex = 5;
        this.nextPage2(this.pageNum2, 5);
      } else {
        this.selectedIndex = index;
        this.selectedAd = this.newAdsNotOnMap[this.selectedIndex].id;
        this.setActiveMarker(this.newAdsNotOnMap[this.selectedIndex]);
        if (this.pageNum2 === this.adsNotOnMapCountPages) {
          const nextIndex = this.selectedIndex + 1;
          if (!this.newAdsNotOnMap[nextIndex]) {
            globalState.commitSetNextItem(store, false);
          }
        }
      }
    }
  }

  hilight_locality(ad: api.PubModel, empty: string) {

    if (empty === '') {
      this.$root.$emit('localityUniqueIdentifier', '');
    } else {
      this.$root.$emit('localityUniqueIdentifier', ad.address.localityId);
    }

    // console.log(ad["address"]["localityUniqueIdentifier"]);
  }

  objectLeave() {
    this.hilight_marker(null, '');
  }

  setSelectedIndex(index: number) {
    const p = this.pageNum - 1;
    this.selectedIndex = (p * this.perPage) + index;
  }
  setSelectedIndex2(index: number) {
    const p = this.pageNum2 - 1;
    this.selectedIndex = (p * this.perPage) + index;
  }

  closeObjectRightSidebar() {
    this.selectedAd = null;
    this.hilight_marker(null, '');
    const mapSearchSidebar = document.querySelector('#sidebar-object-fixed-2');
    if (mapSearchSidebar) {
      if (!mapSearchSidebar.classList.contains('active')) {
        this.$root.$emit('map_change_size', 'big');

      }
    }
  }

  showTab(tab: number) {
    switch (tab) {
      case 0:
        this.showZero = true;
        this.showOne = false;
        break;
      case 1:
        this.showOne = true;
        this.showZero = false;
        break;
    }
  }

  /*
  *   end of paginator for market radar and search
  * */

  /*  PP
  * */

  getApartmentTitle(o: api.ApartmentLightModel) {
    if (!o.primaryInfo.level && !o.primaryInfo.position) {
      if (o.address.govId.ewid && o.primaryInfo.physNumber) {
        return `${o.address.govId.ewid} ${o.primaryInfo.physNumber}`;
      }
      if (o.address.govId.ewid && !o.primaryInfo.physNumber) {
        return o.address.govId.ewid;
      }
      if (!o.address.govId.ewid && o.primaryInfo.physNumber) {
        return o.primaryInfo.physNumber;
      }
      return '';

    }
    if (o.primaryInfo.level && o.primaryInfo.position) {
      return `${o.primaryInfo.level}(${o.primaryInfo.position})`;
    }
    if (!o.primaryInfo.position && o.primaryInfo.level) {
      return o.primaryInfo.level;
    }
    if (!o.primaryInfo.level && o.primaryInfo.position) {
      return `${o.address.govId.ewid} ${o.primaryInfo.physNumber} (${o.primaryInfo.position})`;
    }

  }
  sortByLevel(o: api.ApartmentLightModel[]) {
    if (o.length > 1) {
      o.sort(((n1, n2) => {
        try {
          return this.naturalCompare(`${n1.primaryInfo.level} ${n1.primaryInfo.position}`, `${n2.primaryInfo.level} ${n2.primaryInfo.position}`);
        } catch { }
      }));
    }

    return o;
  }

  naturalCompare(a: any, b: any) {
    const ax: any = [];
    const bx: any = [];

    a.replace(/(\d+)|(\D+)/g, (_: any, $1: any, $2: any) => { ax.push([$1 || Infinity, $2 || '']); });
    b.replace(/(\d+)|(\D+)/g, (_: any, $1: any, $2: any) => { bx.push([$1 || Infinity, $2 || '']); });

    while (ax.length && bx.length) {
      const an = ax.shift();
      const bn = bx.shift();
      const nn = (an[0] - bn[0]) || an[1].localeCompare(bn[1]);
      if (nn) return nn;
    }

    return ax.length - bx.length;
  }

  showSuccessMessage(text: string) {
    this.$notify({
      text,
      group: 'actions',
      type: 'success',
      duration: 2500,
    });
  }

  showErrorMessage(text: string) {
    this.$notify({
      text,
      group: 'actions',
      type: 'error',
      duration: 2500,
    });
  }

  addressName: string = '';

  /*  PP END
  * */

  mapImage() {
    const mapCanvas: any = document.querySelector('.mapboxgl-canvas');
    return mapCanvas.toDataURL('image/jpeg');
  }
}
