import Vue from 'vue';
import template from './right_template.vue';
import { Component, Watch, Prop } from 'vue-property-decorator';
import BaseComponent from '../base';
import * as api from '@immosparrow/cockpit-api-v2';
import VueGallery from 'vue-gallery';
import { safeVal } from '@immosparrow/cockpit-lib-core';
import vue_slider from 'vue-slider-component';
import * as globalState from '../../store/modules/globalStatesModule';
import store from '../../store';
import Paginate from 'vuejs-paginate';
import MapItem from './../searchModule/mapRightSidebar/map-item';
import ObjectComponent from './../searchModule/object';
import Overview from './tabs/overview';
import Price from './tabs/price';
import Neighborhood from '../shared/neighborhood';
import * as search_ from './../../store/modules/searchModule';
import Modal from '../modal';

@Component({
  mixins: [template],
  components: {
    VueGallery,
    Paginate,
    MapItem,
    ObjectComponent,
    Overview,
    Price,
    Modal,
    Neighborhood,
    'vue-slider': vue_slider,
  },
  filters: {
    currency(amount: number) {
      return amount && amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, "'");
    },
  },
})
export default class RightBar extends BaseComponent {
  @Prop()
  buildingOnAddress: api.BuildingModel;
  @Prop()
  addressFromAd: api.GeoSuggestion;

  @Prop()
  showBuilding: boolean;

  val: Function = safeVal;

  @Prop()
  predicted: any;

  historicAds: api.PubLightModel[] = new Array<api.PubLightModel>();
  galleryIndex: any = null;
  environmentInfo: api.IPropertyEnvironmentInfo = api.$newObj(api.PropertyEnvironmentInfo);

  completedSteps0: number = 80;
  completedSteps1: number = 45;
  completedSteps2: number = 82;
  completedSteps3: number = 25;
  completedSteps4: number = 97;
  totalSteps: number = 100;
  address: any = {};
  priceTrendsChart: boolean = false;

  prediction: api.PropertyPricePrediction = new api.PropertyPricePrediction();
  predictionModel: api.PropertyPubPricePredictionQuery = new api.PropertyPubPricePredictionQuery();

  galleryImages: string[] = [];

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

  selectedAd: string = null;

  filterPlant: boolean = true;
  filterCell: boolean = true;
  filterShop: boolean = true;
  pricePredictionNotOk: boolean = false;
  filterApparel: boolean = true;
  updateAddressFromShape: string = '';
  entrenceId: string = '';
  indexEnterence: number = 0;

  neighborhoodPopover: boolean = false;

  created() {
    // this.toggle("overview");

    search_.commitSetStatusDBModal(store, false);

    try {
      if (this.predicted.data.salePricePrediction || this.predicted.data.grossPricePrediction) {
        this.toggle('pricePredictionPrice');
      } else {
        this.toggle('overview');
      }
    } catch {
      this.toggle('overview');
    }

    // this.toggle("overview");
    this.galleryImages = [];
    const self = this;
    /* for (let i = 0, l = this.showBuilding.pictures.length; i < l; i ++) {
      this.galleryImages.push(this.showBbuildingOnAddressuilding.pictures[i].id);
    }
    */

    this.$root.$on('onSelectEnterence', (indexEnterence: number) => {
      this.indexEnterence = indexEnterence;
    });

    this.$root.$on('searchAddressRenamed', (name: string) => {
      this.addressName = name;
      this.$forceUpdate();
    });
    /*this.$root.$on("shape_created", (shape: any) => {

      setTimeout(() => {
        try {
          // document.getElementById("addressName").innerText = shape.name;
          this.addressName = shape.name;
        } catch {}
      }, 500);
      this.entrenceId = shape.id;
      this.toggle("overview");
      try {
        if (this.predicted.data) {
          this.predicted.data = undefined;
        }
      } catch {}

    });*/

    this.$root.$emit('map_change_size', 'small');

    /*try {
      api.$building(this.predicted.model.addressId).get().then((data: api.BuildingModel) => {
        this.buildingOnAddress = data;
      });
    } catch {}*/

  }

  getGraph(lang: string) {
    return `static/img/misc/db-graph-${lang}.png`;
  }

  remove_address_item() {
    // search.commitSearchedPricePredictAddress(store, new api.GeoSuggestion());
    this.$root.$emit('resetPricePredictor');
  }

  selectAd(ad: api.PubModel) {
    this.selectedAd = ad.id;
    globalState.commitShowMapRightSidebar(store, true);
  }

  toggleSideBar() {

    const searchSidebar = document.querySelector('#sidebar-object-fixed');

    if (searchSidebar.classList.contains('active')) {
      if (document.getElementsByClassName('switch_style')[0] !== undefined) {
        searchSidebar.classList.remove('active');
        document.getElementsByClassName('switch_style')[0].className = 'switch_style mapboxgl-ctrl-group mapboxgl-ctrl second';
        this.$root.$emit('map_change_size', 'big');
      }

    } else {
      searchSidebar.classList.add('active');
      document.getElementsByClassName('switch_style')[0].className = 'switch_style mapboxgl-ctrl-group mapboxgl-ctrl on_left second';
      this.$root.$emit('map_change_size', 'small');

    }
  }

  selectAd1(ad: api.PubModel, selectedIndex: number, noArrows: boolean) {
    globalState.commitShowMapRightSidebar(store, true);
    const self = this;
    this.selectedAd = ad.id;
    this.selectedIndex = selectedIndex;
    this.$emit('selectAd', ad);

    if (noArrows) {
      setTimeout(() => {
        self.$root.$emit('hide_arrows');
      }, 10);

    }
  }

  @Watch('predicted.data', { immediate: true, deep: true })
  pp(newVal: any, oldVal: any) {
    try {
      if (this.predicted.data.price) {
        this.toggle('pricePredictionPrice', true);
      } else {
        this.toggle('overview', true);
      }
    } catch  {
      this.toggle('overview', true);
    }
    if (this.predicted.data && this.predicted.data.price) {
      const searchSidebar = document.querySelector('#side-overlay');
      if (searchSidebar.classList.contains('active')) {
        searchSidebar.classList.remove('active');
        globalState.commitSetSearchSidebar(this.$store, false);
        this.$emit('addressIsFromAutocomplete', true);
      }
    }
  }

  @Watch('pricePredictSearchedAddress', { immediate: true })
  ppa() {
    if (this.pricePredictSearchedAddress.name !== undefined) {
      this.addressName = this.pricePredictSearchedAddress.name;
      this.entrenceId = this.pricePredictSearchedAddress.uniqueIdentifier;
      if (this.showBuilding) {
        this.toggle('overview');
        try {
          if (this.predicted.data) {
            this.predicted.data = undefined;
          }
        } catch {

        }
        // this must be like this since there is no environmentInfo in building model
        api.$entrance(this.entrenceId).get(api.EntranceModelFields.EnvironmentInfo).then((data) => {
          if (data) {
            this.environmentInfo = data.environmentInfo;
          }
        });
      }

    }

  }
  @Watch('addressFromAd', { immediate: true })
  watchAddressFromAd() {
    if (this.addressFromAd) {
      this.addressName = this.addressFromAd.name;
      this.entrenceId = this.addressFromAd.uniqueIdentifier;

      api.$entrance(this.entrenceId).get(api.EntranceModelFields.EnvironmentInfo).then((data) => {
        if (data) {
          this.environmentInfo = data.environmentInfo;
        }
      });
    }
  }
  get hasEnvInfo() {
    return !(JSON.stringify(this.environmentInfo) !== '{}');
  }

  closeDBModal() {
    search_.commitSetStatusDBModal(store, false);
  }

}
