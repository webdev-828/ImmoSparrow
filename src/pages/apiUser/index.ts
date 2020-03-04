import Vue from 'vue';
import { Component } from 'vue-property-decorator';
import template from './ApiUser.vue';
import gsap from 'gsap';
import { mixins } from 'vue-class-component';
import FeatureChecks from '@/mixins/featureChecks';

Vue.use(gsap);

@Component({
  mixins: [template],
})
export default class ApiUser extends mixins(FeatureChecks) {
  activeNo: number = 0;
  inActiveNo: number = 0;
  pages: number = 0;
  searchForString: string = '';
  searchLoading: boolean = false;
  searchFinished: boolean = false;
  addingUser: boolean = false;
  perPage: number = 10;
  pageNum: number = 0;
  selectedIndex: number = -1;
  loading: boolean = false;
  firstLoadElement: boolean = false;
  $refs: {
    usersPagination: any,
  };
  deletingUser: boolean = false;
  showModal: boolean = false;
  showDeleted: boolean = false;
  addApiUserSidebar: boolean = false;
  apiUserSidebar: boolean = false;
  wizardEnable: boolean = false;
  tabsItem: object = {
    profile: true,
    extAPI: false,
    wizard: false,
  };
  keys: any = [
    { name: 'AddressSuggestion', date: '26 Jan 2019', expired: false },
    { name: 'AdvertismentPricePredictor', date: '22 Jan 2019', expired: false },
    { name: 'Pipeline', date: '10 Jan 2019', expired: true },
    { name: 'MarketRadar', date: '27 Jan 2019', expired: false },
    { name: 'Portfolio', date: '28 Jan 2019', expired: false },
  ];
  keys2: any = [
    { name: 'AdvertismentPricePredictor', date: '10 Jan 2019', expired: true },
    { name: 'MarketRadar', date: '27 Jan 2019', expired: false },
    { name: 'AddressSuggestion', date: '28 Jan 2019', expired: false },
  ];
  identitySection: boolean = true;
  extApiSection: boolean = true;
  addApiLine: boolean = false;
  show(tab: string) {
    for (const i in this.tabsItem) {
      if (i === tab) {
        this.tabsItem[i] = true;
      } else {
        this.tabsItem[i] = false;
      }
    }
  }
  addSegment () {
    this.addApiLine = true;
    gsap.fromTo('#newApiLine', { backgroundColor: '#F9F4D5' }, { duration: 5, backgroundColor: '#fff', ease: 'power1.out' });
  }
}
