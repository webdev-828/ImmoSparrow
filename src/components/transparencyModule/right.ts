import template from './right_template.vue';
import { Component, Watch, Prop } from 'vue-property-decorator';
import vue_slider from 'vue-slider-component';
import RadialProgress from './radial.progress.vue';
import VueGallery from 'vue-gallery';
import * as api from '@immosparrow/cockpit-api-v2';
import BaseComponent from '../base';

@Component({
  mixins: [template],
  components: {
    VueGallery,
    'vue-slider': vue_slider,
    'radial-progress-bar': RadialProgress,
  },
})
export default class Right extends BaseComponent {

  @Prop()
  address: api.GeoSuggestion;

  galleryImages: string[] = [];
  completedSteps0: number = 80;
  completedSteps1: number = 45;
  completedSteps2: number = 82;
  completedSteps3: number = 25;
  index: any = null;
  object: api.BuildingModel = new api.BuildingModel();
  fullscreenOptions: any = {
    // Defines if the gallery should open in fullscreen mode:
    fullScreen: true,
  };
  totalSteps: number = 100;
  home: boolean = true;
  analitics: boolean = false;
  offset: number = 0;
  transparencyAddress: api.GeoSuggestion = new api.GeoSuggestion();
  // chartData = [["Jan", 220000], ["Feb", 240000], ["Mar", 260000], ["Apr", 210000], ["May", 300000]];
  chartData: any = {
    '2017-05-13': 2,
    '2017-05-14': 5,
    '2017-05-15': 3,
    '2017-05-16': 8,
    '2017-05-17': 6,
    '2017-05-18': 6,
    '2017-05-19': 12,
    '2017-05-20': 5,
    '2017-05-21': 5,
    '2017-05-22': 3,
    '2017-05-23': 1,
    '2017-05-24': 6,
    '2017-05-25': 1,
    '2017-05-26': 3,
    '2017-05-27': 2,
    '2017-05-28': 3,
    '2017-05-29': 2,
    '2017-05-30': 8,
    '2017-05-31': 5,
  };
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
  showZero: boolean = true;
  showOne: boolean = false;

  slidePage: number = 2;

  destroyed() {
    /*let searchedAddress = {
      id: "",
      lat: 0,
      lng: 0,
      name: "",
      geo: {}
    };
    search.commitSearchingFor(store, searchedAddress);*/
  }

  pageChanged(pageNum: number) {
    const newPageNum = pageNum + 1;
    this.slidePage = newPageNum * 2;
  }

  get fullAddress() {
    let addr = '';
    if (this.object.entrances !== undefined) {
      const address = this.object.entrances[0].address;
      if (address.street || address.streetNumber) {
        addr = `${address.street}${address.streetNumber ? ` ${address.streetNumber}` : ''}, ${address.zip} ${address.locality}`;
      } else if (address.zip || address.locality) {
        addr = `${address.zip} ${address.locality}`;
      }
      if (addr.length >= 50) {
        return `${addr.substring(0, 50)}...`;
      }
      return addr;

    }
  }

  mounted() {
    // this.$refs["slider"].refresh();

    setTimeout(() => {

      window.dispatchEvent(new Event('resize'));
    }, 2000);
  }

  get id() {
    return this.address.uniqueIdentifier;
  }

  show(tab: number) {

    switch (tab) {
      case 0:
        this.showZero = true;
        this.showOne = false;
        break;
      case 1:
        this.showZero = false;
        this.showOne = true;
        break;

    }
  }

  @Watch('searchedAddressBuilding', { immediate: true, deep: true })
  searched() {
    this.object = this.searchedAddressBuilding;
    this.galleryImages = [];
    /* for (let i = 0, l = this.object.pictures.length; i < l; i ++) {
      this.galleryImages.push(this.object.pictures[i].id);

    }
    */
  }

  closeRightSidebar() {

    // commitObjectWindow(store, false);
    // this.$root.$emit("remove_transparency_address", true);
    // commitResetState(store);
  }

  toggleSideBar() {
    const searchSidebar = document.querySelector('#sidebar-fixed');

    if (searchSidebar.classList.contains('active')) {
      searchSidebar.classList.remove('active');
      document.getElementsByClassName('switch_style')[0].className = 'switch_style mapboxgl-ctrl-group mapboxgl-ctrl second';

    } else {
      searchSidebar.classList.add('active');
      document.getElementsByClassName('switch_style')[0].className = 'switch_style mapboxgl-ctrl-group mapboxgl-ctrl on_left second';

    }
  }

}
