import { Component, Prop, Watch } from 'vue-property-decorator';
import template from './template.vue';
import store from '../../../store';
import Paginate from 'vuejs-paginate';
import Base from './../../base';
import MapItem from './map-item/';
import ObjectComponent from '../object/';
import * as api from '@immosparrow/cockpit-api-v2';
import * as searchModule from '../../../store/modules/searchModule';
import * as globalState from '../../../store/modules/globalStatesModule';
import Vue from 'vue';

@Component({
  mixins: [template],
  components: {
    Paginate,
    MapItem,
    ObjectComponent,
  },
  filters: {
    currency(amount: number) {
      return amount && amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, "'");
    },
  },
})
export default class MapRightSidebar extends Base {

  @Prop({ default: null })
  mapSearchResults: {time: number, items: Array<{id: string; coordinates: api.GeoCoordinates}>};
  pictures: string[] = [];
  selectedAd: string = null;
  searchData: api.PubQuery = new api.PubQuery();
  showMaxLimitMsg: boolean = false;
  selectedIndexOnResults: number = -1;
  beforeCreate() {
    this.newAdsOnMap = null;
  }

  show (tab: number) {
    const popups = document.getElementsByClassName('custom-popup');

    switch (tab) {
      case 0:
        this.$root.$emit('show_map_points');
        this.showZero = true;
        this.showOne = false;
        if (popups.length) {
          Array.from(popups).forEach(el => el.classList.remove('hide'));
        }
        break;
      case 1:
        this.$root.$emit('hide_map_points');
        this.showOne = true;
        this.showZero = false;
        if (popups.length) {
          Array.from(popups).forEach(el => el.classList.add('hide'));
        }
        break;
    }
  }

  selectAd (ad: api.PubModel, selectedIndex: number, noArrows: boolean) {
    globalState.commitShowMapRightSidebar(store, true);
    const self = this;
    this.selectedAd = ad.id;
    this.selectedIndex = selectedIndex;
    this.$root.$emit('setPopupState', { type: 'hover' });
    this.$emit('selectAd', ad);
    this.$root.$emit('setPopupState', { type: 'active', ads: ad });
    this.$root.$emit('highlight_marker', ad.id);

    globalState.commitSetNextItem(store, true);
    if (this.showZero) {
      if (this.pageNum === this.adsOnMapCountPages) {
        const nextIndex = this.selectedIndex + 1;
        if (!this.newAdsOnMap[nextIndex]) {
          globalState.commitSetNextItem(store, false);
        }
      }
    } else if (this.showOne) {
      if (this.pageNum2 === this.adsNotOnMapCountPages) {
        const nextIndex = this.selectedIndex + 1;
        if (!this.newAdsNotOnMap[nextIndex]) {
          globalState.commitSetNextItem(store, false);
        }
      }
    }
  }
  closeRightSidebar() {
    this.selectedAd = null;
    this.$root.$emit('close_popup_object');

    const mapSearchSidebar = document.querySelector('#sidebar-object-fixed-2');

    if (mapSearchSidebar) {
      if (!mapSearchSidebar.classList.contains('active')) {
        this.$root.$emit('map_change_size', 'big');
      }
    } else  {
      this.$root.$emit('map_change_size', 'big');
    }

  }

  mapRightSidebarToggle () {

    const searchSidebar = document.querySelector('#sidebar-object-fixed-2');
    // const leftSearchSidebar = document.querySelector('#side-overlay');

    if (searchSidebar.classList.contains('active')) {
      searchSidebar.classList.remove('active');

      document.getElementsByClassName('switch_style')[0].className = 'switch_style mapboxgl-ctrl-group mapboxgl-ctrl second';
      this.$root.$emit('map_change_size', 'big');

    } else {
      searchSidebar.classList.add('active');
      document.getElementsByClassName('switch_style')[0].className = 'switch_style mapboxgl-ctrl-group mapboxgl-ctrl on_left second';
      this.$root.$emit('map_change_size', 'small');

    }

  }

  closeObjectRightSidebar() {
    // this.$root.$emit("highlight_marker", "");
    this.selectedAd = null;
    this.$root.$emit('setPopupState', { type: 'active' });
    this.hilight_marker(null, '');
    const mapSearchSidebar = document.querySelector('#sidebar-object-fixed-2');
    if (mapSearchSidebar) {
      if (!mapSearchSidebar.classList.contains('active')) {
        this.$root.$emit('map_change_size', 'big');

      }
    }
  }

  created() {
    const self = this;

    this.$root.$on('show_object', (id: string) => {

      if (id === '0') {
        self.closeRightSidebar();
        self.$root.$emit('map_change_size', 'big');
        return;
      }

      const mapSearchSidebar = document.querySelector('#sidebar-object-fixed-2');
      if (mapSearchSidebar) {
        if (!mapSearchSidebar.classList.contains('active')) {
          self.$root.$emit('map_change_size', 'small');

        }
      }
      api.$publication(id).get().then((pub) => {
        self.selectAd(pub, 0, true);
      });

    });

    this.$root.$on('hide_object',  (id: string) => {
      self.closeRightSidebar();
    });

    this.$root.$on('setMaxLimitMsg',  (msg: boolean) => {
      self.showMaxLimitMsg = msg;
    });

    /* this.$root.$on('adsInViewport', (adsInViewport: {
      id: string,
      coordinates: number[],
    }[]) => {

      this.adsInViewport = adsInViewport;

    }); */
    const height = window.innerHeight - 250; // header + right side panel headers + footer
    this.perPage = Math.round((height / 240) * 2); // height of each map item
    if (this.perPage % 2 !== 0) {
      this.perPage += 1;
    }
  }

  @Watch('mapSearchResults')
  watchMapSearchResults() {
    const self = this;
    // clearTimeout(this.timer);
    this.adsInViewport = this.mapSearchResults.items;
    // this.timer = setTimeout(() => {
    self.pageNum = 1;
    self.pageNum2 = 1;
    const anm = self.adsNotOnMap();
    const am = self.adsOnMap();
    Promise.all([anm, am]).then(() => {
      if (0 === self.newAdsOnMap.length && self.newAdsNotOnMap.length > 0) {
        if (self.showOne) {
          return;
        }
        self.show(1);
      } else {
        if (self.showOne) {
          return;
        }
        self.show(0);
      }
    });
    // }, 1000);
  }

}
