import Vue from 'vue';
import { Component, Prop, Watch } from 'vue-property-decorator';
import template from './template.vue';
import vue_slider from 'vue-slider-component';
import RadialProgress from '../../../pages/transparency/radial.progress.vue';
import VueGallery from 'vue-gallery';
import Chart from 'chart.js';
import History from './tabs/history';
import Neighborhood from '../../shared/neighborhood';
import store from '../../../store';
import {
  getMainCategory1,
  formatPrice,
  getAddressQuality,
  getPersonName,
  getVendorClass,
  formatDate,
  showTabs,
  displayAddress,
  getGoogleStreetViewImage,
} from '../../../components/sharedFunctions';
import {
  PubTransactionType,
  PubModel, PubSiteInfo,
  PropertyPricePrediction, PubStatsAboveAndBelowPriceModel,
  PubPictureInfo, $pubs,
  mval as val, PubPriceChangeType,
  IPubModel,
  PubStatsAboveAndBelowPriceItem,
  PubAvailabilityType,
  IPropertyEnvironmentInfo,
  EntranceModelFields,
  $entrance,
} from '@immosparrow/cockpit-api-v2';
import { safeVal } from '@immosparrow/cockpit-lib-core';
import StarRating from '../../shared/starRating';
import * as searchModule from '../../../store/modules/searchModule';
import ActionBar from '../actionBar';
import Inhabitants from '../../shared/inhabitants';
import Owners from '../../shared/owners';
import PhoneMixin from '../../../mixins/phoneParser';
import Modal from '../../modal';
import UpgradeModal from '../../modal/upgradeModal';
import { mixins } from 'vue-class-component';
import FeatureChecks from '@/mixins/featureChecks';
import BundleChecks from '@/mixins/bundleChecks';
import { setEntranceRatings } from '@store/modules/marketRadar';

interface TooltipsData {
  free: number[];
  paid: number[];
  private: number[];
  unknown: number[];
}

@Component({
  mixins: [template, PhoneMixin],
  components: {
    VueGallery,
    History,
    Neighborhood,
    Owners,
    StarRating,
    ActionBar,
    Modal,
    Inhabitants,
    UpgradeModal,
    'vue-slider': vue_slider,
    'radial-progress-bar': RadialProgress,
  },
})
export default class RightSidebar extends mixins(FeatureChecks, BundleChecks) {

  @Prop()
  itemId: string;

  @Prop({ default: -1 })
  selectedIndex: number;

  @Prop({ default: true })
  showArrows: boolean;

  @Prop({ default: 2 })
  countItems: number;

  @Prop({ default: true })
  showMR: boolean;

  item: IPubModel = null;

  itemDescription: boolean = true;
  itemDescriptionMinified: boolean = true;

  ppSection: boolean = false;
  docSection: boolean = false;

  val: Function = val;
  safeVal: Function = safeVal;

  getMainCategory: Function = getMainCategory1;
  formatPrice: Function = formatPrice;
  getVendorClass: Function = getVendorClass;
  formatDate: Function = formatDate;
  showTabs: Function = showTabs;
  displayAddress: Function = displayAddress;
  getAddressQuality: Function = getAddressQuality;
  getPersonName: Function = getPersonName;
  environmentInfo: IPropertyEnvironmentInfo = null;
  loading: boolean = false;

  showPortalsFS: boolean = false;
  showPriceFS: boolean = false;
  tooltipsData: any = {};
  activeTooltipData: { title: string, data: TooltipsData } = {
    title: null,
    data: {
      free: [0, 0, 0],
      paid: [0, 0, 0],
      private: [0, 0, 0],
      unknown: [0, 0, 0],
    },
  };

  createChart(chartId: any, chartData: any, chartName: string) {
    const ctx = document.querySelector(chartId);
    if (ctx) {
      this[chartName] = new Chart(ctx, {
        type: chartData.type,
        data: chartData.data,
        options: chartData.options,
      });
    }
  }
  // END DEMO

  @Prop()
  pageNum: number;

  @Prop({ default: false })
  showHistoryFirst: boolean;

  @Prop()
  pageNum2: number;
  @Prop({ default: false })
  notOnMap: boolean;

  pictures: string[] = [];

  completedSteps0: number = 80;
  completedSteps1: number = 45;
  completedSteps2: number = 82;
  completedSteps3: number = 25;
  description: string = '';

  index: any = null;
  fullscreenOptions: any = {
    // Defines if the gallery should open in fullscreen mode:
    fullScreen: true,
  };
  totalSteps: number = 100;
  home: boolean = true;
  analitics: boolean = false;
  offset: number = 0;

  sliderProps = {
    data: [
      0,
      50,
      100,

    ],
    value: 50,
    width: '100%',
    tooltip: 'never',
    height: 24,
    disabled: true,
    piecewise: true,
    piecewiseLabel: true,
    style: {
      padding: '8px',
      margin: 0,
      'margin-bottom': '40px',
      opacity: '1',
    },

  };
  tabsProfile: object = {
    showHistory: false,
    showOverview: true,
    showNbr: false,
  };

  loadingPP: boolean = false;

  $refs: {
    itemId: any,
    link: any,
    cur: any,
    descr: any,
  };
  resetIndex: number = 0;
  navigateTo: number = 0;

  pricePrediction: PropertyPricePrediction = null;
  priceComparison: PubStatsAboveAndBelowPriceModel = null;
  priceComparisonLoading: boolean = false;

  shareLink: string = '';
  showShareLinkModal: boolean = false;
  refresh: boolean = false;

  neighborhoodPopover: boolean = false;

  pageChanged(e: number) {
    this.navigateTo = e;
  }

  getGraph(lang: string) {
    return `static/img/misc/db-graph-${lang}.png`;
  }

  nextItem(next: boolean) {
    this.refresh = true;
    let nextIndex = this.selectedIndex;
    let left = false;
    if (next) {
      nextIndex += 1;
    } else {
      nextIndex -= 1;
      left = true;
    }
    this.$emit('selectItem', nextIndex, true, left);
  }

  get hasEnvInfo() {
    return !(JSON.stringify(this.environmentInfo) !== '{}');
  }

  get itemChanged() {
    return [this.itemId, this.selectedIndex].join();
  }

  get priceChangeType () {
    return this.val(this.item, (item: IPubModel) => item.trackingInfo.lastTotalPriceChange.totalPriceChangeType);
  }

  get priceIncrease () {
    return PubPriceChangeType[this.priceChangeType] === 'Increase';
  }

  get priceDecrease () {
    return PubPriceChangeType[this.priceChangeType] === 'Decrease';
  }

  get fromUnknownToKnown () {
    return PubPriceChangeType[this.priceChangeType] === 'FromUnknownToKnown';
  }

  @Watch('itemChanged', { immediate: true })
  async changeItem() {
    if (this.itemId) {
      const self = this;
      self.refresh = true;
      self.loading = true;
      self.pricePrediction = null;
      self.pictures = [];
      self.priceComparison = null;
      self.ppSection = false;

      searchModule.dispatchGetPubById(store, this.itemId)
        .then(async (res) => {
          this.item = res;
          if (this.item?.address?.entranceId) {
            const entranceRatings = await $entrance(this.item.address.entranceId).getEntranceRatings();
            if (entranceRatings) {
              setEntranceRatings(store, entranceRatings);
            } else {
              setEntranceRatings(store, null);
            }
          } else {
            setEntranceRatings(store, null);
          }
          this.loadItem();
        });
    }
  }

  async loadItem() {
    const self = this;
    if (this.$refs.cur) {
      this.$refs.cur.currentPage = 0;
      this.resetIndex += 1;
    }

    if (this.item.files && this.item.files.length) {
      this.docSection = true;
    } else {
      this.docSection = false;
    }

    this.description = '';
    if (this.item.primaryInfo.basicInfo && this.item.primaryInfo.basicInfo.description) {
      const { description } = this.item.primaryInfo.basicInfo;
      this.description = description.replace(/(\\r)*\\n|\\\N/g, '&#10;');
    }
    // airdjura
    const googleData = await getGoogleStreetViewImage(this.item.address.coordinates.latitude, this.item.address.coordinates.longitude);
    if (googleData) {
      if (self.item.pictures) {
        if (self.item.pictures.length) {
          self.item.pictures.forEach((pic: PubPictureInfo) => {
            self.pictures.push(`https://axresources.azurewebsites.net/image/get/${pic.id}/?mw=500&mh=500&q=90`);
            if (self.pictures.length > 28) {
              self.pictures = self.pictures.slice(0, 28);
            }
          });
        } else {
          self.pictures.unshift(googleData);
        }
      } else {
        self.pictures.unshift(googleData);
      }
      // if (this.tabsProfile['showNbr']) {
      //   this.showTabs('showOverview', this.tabsProfile);
      // }
      if (this.item.address.quality === 8 || this.item.address.quality === 9) {
        $entrance(this.item.address.entranceAddressId || this.item.address.entranceId || this.item.address.streetId).get(EntranceModelFields.EnvironmentInfo).then((data) => {
          if (data) {
            this.environmentInfo = data.environmentInfo;
          }
        });
      }
    }

    if (this.basicPP && safeVal(this.item, (item: PubModel) => item.financialInfo.totalPriceCalculated)) {
      this.loadingPP = true;
      let pp: PropertyPricePrediction = null;
      try {
        pp = await searchModule.dispatchGetPredictedPrice(store, this.item.id);
      } catch (e) {
        self.refresh = false;
      }

      if (pp) {
        const adPrice = this.item.financialInfo.totalPriceCalculated;
        const percent20 = (adPrice / 5);
        if (safeVal(pp, (pp: PropertyPricePrediction) => pp.price.value)) {
          const diff = Math.abs(pp.price.value - this.item.financialInfo.totalPriceCalculated);
          if (diff < percent20) {
            this.pricePrediction = pp;
            this.ppSection = true;
          } else {
            this.ppSection = false;
          }
        }
        setTimeout(() => {
          self.loadingPP = false;
        }, 1000);
      } else {
        self.loadingPP = false;
      }
    }

    this.priceComparisonLoading = true;
    const pabAbAndAl = await $pubs.stats.getPublicationsAboveAndBelowPrice(this.item.id);
    if (pabAbAndAl) {
      this.priceComparison = pabAbAndAl;
      this.priceComparisonLoading = false;
    }
    this.refresh = false;
    this.loading = false;
  }

  clickOnImg(index: number, noImage?: string) {
    // let pic = this.pictures[index];
    this.pictures.forEach((p, pindex) => {
      const height = window.innerHeight;
      const weight = window.innerWidth;
      this.index = index;
      if (p.indexOf('google') > -1) {
        // return;
        this.pictures[pindex] = p.replace('500x400', '1920x746');
      } else {
        const pic = p;
        const img = pic.split('?');

        if (noImage) {
          this.pictures[pindex] = noImage;
        } else {
          this.pictures[pindex] = `${img[0]}` + `?mw=${weight}&mh=${height}&q=90`;
        }
      }
    });
  }

  closeFullScreen(index: number, noImage?: string) {
    if (index !== null) {
      // let pic = this.pictures[index];
      this.pictures.forEach((p, pindex) => {
        if (p.indexOf('google') > -1) {
          // return;
          this.pictures[pindex] = p.replace('1920x746', '500x400');
        } else {
          const pic = p;
          const img = pic.split('?');
          if (noImage) {
            this.pictures[pindex] = pic;
          } else {
            this.pictures[pindex] = `${img[0]}` + '?mw=500&mh=500&q=90';
          }
        }
        this.index = null;
      });
    }
  }

  destroyed() {
    this.$emit('closeRightSidebar');
  }

  getTransType(type: number) {
    if (type) {
      return PubTransactionType[type];
    }
    return '';

  }

  formatName(name: string) {
    let names = name.split('has');
    let res = '';
    if (names[1]) {
      res = names[1];
    } else {
      names = name.split('is');
      if (names[1]) {
        res = names[1];
      } else {
        names = name.split('are');
        if (names[1]) {
          res = names[1];
        } else {
          res = name;
        }
      }
    }
    return res.replace(/([A-Z])/g, ' $1').trim();
  }

  cropText(text: string) {
    if (text !== undefined) {
      if (text.length > 100) {
        return `${text.substring(0, 100)}...`;
      }
      return text;

    }
  }

  calculatePercentege(stats: PubStatsAboveAndBelowPriceItem, count: string) {
    if (stats && stats[count]) {
      return Math.round((stats[count] * 100) / (stats.aboveCount + stats.belowCount));
    }
    return 0;

  }

  calculateDifference(pp: number, adPrice: number) {
    const diff = pp - adPrice;
    if (diff) {
      return this.formatPrice(diff);
    }
    return null;

  }

  copyToClipboard(ref: string) {
    const copiedValue = this.$refs[ref];
    copiedValue.setAttribute('type', 'text');
    copiedValue.select();
    document.execCommand('copy');
    copiedValue.setAttribute('type', 'hidden');
    let text = '';
    if (ref === 'link') {
      text = 'Link copied to clipboard';
      this.showShareLinkModal = false;
    } else {
      text = 'ID copied to clipboard';
    }

    this.$notify({
      text,
      group: 'actions',
      type: 'success',
      duration: 2500,
    });
  }

  formatAvailableDate(item: PubModel) {
    if (safeVal(item, (item: PubModel) => item.primaryInfo.availability.availableDate.value.itemIndex === 1)) {
      return PubAvailabilityType[item.primaryInfo.availability.availableDate.value.item1];
    } if (safeVal(item, (item: PubModel) => item.primaryInfo.availability.availableDate.value.itemIndex === 2)) {
      return safeVal(item, (item: PubModel) => item.primaryInfo.availability.availableDate.value.item2, (item: Date) => this.formatDate(item), '');
    }
    return safeVal(item, (item: PubModel) => item.primaryInfo.availability.availableDate.text, '');

  }

  created() {
    this.refresh = true;

    searchModule.commitSetStatusDBModal(store, false);
    if (this.showHistoryFirst) {
      this.tabsProfile['showHistory'] = true;
      this.tabsProfile['showNbr'] = false;
      this.tabsProfile['showOverview'] = false;
    }

    if (!searchModule.getRealEstatePortals(store).length) {
      searchModule.dipsatchGetRealEstatePortals(store);
    }
  }

  fullScreenPortalsChart: any = null;
  showFullScreenPortals(chart: any, tooltipsData: any) {
    this.tooltipsData = tooltipsData;
    if (this.fullScreenPortalsChart) {
      this.fullScreenPortalsChart.update();
    } else {
      this.createChart('#fullScreenPortalsChart', chart, 'fullScreenPortalsChart');
    }
    this.showPortalsFS = true;
  }

  fullScreenPriceChart: any = null;
  showFullScreenPrice(chart: any) {
    if (this.fullScreenPriceChart) {
      this.fullScreenPriceChart.update();
    } else {
      this.createChart('#fullScreenPriceChart', chart, 'fullScreenPriceChart');
    }
    this.showPriceFS = true;
  }

  shareAdLink(id: string) {
    this.showShareLinkModal = true;
    this.shareLink = `${window.location.origin}/publications/details?id=${id}`;
  }

  closeDBModal() {
    searchModule.commitSetStatusDBModal(store, false);
  }

  get deepLink () {
    const sites: PubSiteInfo[] = this.val(this.item, (item: IPubModel) => item.trackingInfo.sites);
    if (sites) {
      const res = sites.find((item) => {
        return item.projectDeepLinkUrl;
      });
      if (res) {
        if (res.projectDeepLinkUrl.length > 25) {
          return `${res.projectDeepLinkUrl.substring(0, 25)}...`;
        }
        return res.projectDeepLinkUrl;
      }
    }
    return null;
  }
}
