import Vue from 'vue';
import { Component } from 'vue-property-decorator';
import template from './template.vue';
import Intercom from '../../intercom';
import autocomplete from '../../addressAutocomplete';
import {
  getUserContext, dispatchLogout, commitSetEmployeeContext,
  commitSetUserAgency, commitSetSuperviseMode, commitUpdateLang,
  commitSetNoEmployeeStatus, getUserAgency,
 } from './../../../store/modules/authStatesModule';
import { dispatchGetAgency } from './../../../store/modules/adminModule';
import store from './../../../store';
import * as search from '../../../store/modules/searchStatesModule';
import Base from './../../base';
import {
  GeoSuggestion, IUserContextModel, EmployeeRole,
  IUserAgencyModel, $authUser, IEmployeeLightModel,
} from '@immosparrow/cockpit-api-v2';
import Modal from '../../../components/modal';
import * as globalStates from '../../../store/modules/globalStatesModule';
import VueIntercom from 'vue-intercom';
import gsap from 'gsap';
import { KeyValueList } from '@/models';
Vue.use(VueIntercom, { appId: process.env.intercom });
Vue.use(gsap);
const _ = require('lodash');

@Component({
  mixins: [template],
  components: {
    autocomplete,
    Modal,
    intercom: Intercom,
  },
})
export default class NavHeader extends Base {

  env: boolean = process.env.bugsnagENV === 'staging' ? true : false;
  options: Object[] = [];
  showSearch: boolean = false;
  $ga: any;
  $intercom: any;
  streetSet: boolean = false;
  lang: KeyValueList = { key: 'EN', value: 'en' };
  langs: KeyValueList[] = [
    { key: 'DE', value: 'de' },
    { key: 'EN', value: 'en' },
    { key: 'IT', value: 'it-CH' },
  ];
  selectedEmployee: IEmployeeLightModel = null;
  showModal: boolean = false;
  // searchHistory: QueryListEntry<any>[] = [];
  // searchHistoryFoundInSearch: QueryListEntry<any>[] = [];
  includeInSuggestions: number[] = [10, 15, 18, 20, 30, 50, 70];
  editName: boolean = false;
  ncDeployed: boolean = false;
  notifications: any = [
    { time: '14:58', text: 'Item added to Bern Apartments subscription', from: 'Subscriptions', urgent: false },
    { time: '14:54', text: 'Price Prediction request complete', from: 'PP', urgent: false },
    { time: '14:52', text: 'CPU load in high', from: 'Server', urgent: false },
    { time: '14:45', text: 'Owner request failed', from: 'Search', urgent: true },
    { time: '14:31', text: 'Agency Swiss RealEstate Co. creaded', from: 'Admin', urgent: false },
    { time: '14:26', text: 'User Peter Wlatz added to agency ImmoSparrow', from: 'Admin', urgent: false },
    { time: '14:11', text: '7 items sent to client Karl Gustav', from: 'Subscriptions', urgent: false },
    { time: '14:02', text: 'Item added to Zurich houses with mountainview subscription', from: 'Subscriptions', urgent: false },
    { time: '13:37', text: 'User Ulirch Shmidt added to agency ImmoSparrow', from: 'Admin', urgent: false },
    { time: '13:29', text: 'Search module is not responding', from: 'Server', urgent: true },
    { time: '13:05', text: 'Item Zahlbare Wohnung mit tollem Gartensitzplatz Won in ApencyPipe', from: 'Pipe', urgent: false },
    { time: '12:58', text: 'Item added to Bern Apartments subscription', from: 'Subscriptions', urgent: false },
    { time: '12:54', text: 'Price Prediction request complete', from: 'PP', urgent: false },
    { time: '12:52', text: 'CPU load in high', from: 'Server', urgent: false },
    { time: '12:45', text: 'Owner request failed', from: 'Search', urgent: true },
    { time: '12:31', text: 'Agency Swiss RealEstate Co. creaded', from: 'Admin', urgent: false },
    { time: '12:26', text: 'User Peter Wlatz added to agency ImmoSparrow', from: 'Admin', urgent: false },
    { time: '12:11', text: '7 items sent to client Karl Gustav', from: 'Subscriptions', urgent: false },
    { time: '12:02', text: 'Item added to Zurich houses with mountainview subscription', from: 'Subscriptions', urgent: false },
    { time: '11:37', text: 'User Ulirch Shmidt added to agency ImmoSparrow', from: 'Admin', urgent: false },
    { time: '11:29', text: 'Search module is not responding', from: 'Server', urgent: true },
    { time: '11:05', text: 'Item Zahlbare Wohnung mit tollem Gartensitzplatz Won in ApencyPipe', from: 'Pipe', urgent: false },
  ];

  get userContext () {
    return getUserContext(store);
  }

  get userAgency () {
    return getUserAgency(store);
  }

  logout () {
    dispatchLogout(store).then(() => {
      this.$router.push({ name: 'Login' });
    });
  }

  setStreet(data: GeoSuggestion) {

    if (data === undefined || data.name === undefined) {
      return;
    }

    this.searchString = data.name;

    this.streetSet = true;

    if (this.get_products(data.suggestionType)[0] === 'price_prediction') {
      // this.$router.push({name: "Transparency"});
      // search.commitSearchingForTransparency(store, data);

      search.commitSearchedPricePredictAddress(this.$store, data);
      this.$router.push({ name: 'Price Prediction' });

    } else {
      search.commitSearchingFor(store, data);
      this.$router.push({ name: 'Search' });
    }

  }
  setProduct(item: GeoSuggestion, module: any, products: string[]) {

    this.searchString = item.name;
    switch (module) {

      case 'transparency':
        search.dispatchSetTransparencyAddress(this.$store, item);
        this.$router.push({ name: 'Transparency' });
        break;

      case 'market_radar':
        search.commitSearchingForMarketRadarAddress(this.$store, item);
        this.$router.push({ name: 'Market radar ads' });
        break;

      case 'price_prediction':
        search.commitSearchedPricePredictAddress(this.$store, item);
        this.$router.push({ name: 'Price Prediction' });
        break;

      case 'search':
        search.commitSearchingFor(store, item);
        this.$router.push({ name: 'Search' });
        break;

      default:
        break;
    }
  }

  get getAgencies () {
    return this.userContext.agencies.filter((item) => {
      return item.agency.isEnabled && !item.agency.isDeleted;
    });
  }

  get employeeName () {
    return this.empCtx && this.empCtx.employee ? `${this.empCtx.employee.firstName} ${this.empCtx.employee.lastName}` : '';
  }

  created() {
    if (this.userContext) {
      this.$ga.set('userId', this.userContext.identity.id);
    }
    if (localStorage.getItem('lang')) {
      this.setLangauge(this.langs.find(item => item.value === localStorage.getItem('lang')));
    }
    if (!this.empCtx) {
      if (this.userContext.agencies.length) {
        this.selectAgency(this.getAgencies[0]);
      }
    } else {
      this.$root.$emit('currentEmployeeLoaded');
    }
  }

  selectAgency (agency: IUserAgencyModel) {
    if ((!this.empCtx || !agency.employee) || this.empCtx.employee && agency.employee && (this.empCtx.employee.id !== agency.employee.id)) {
      dispatchGetAgency(store, agency.agency.id)
        .then(() => {
          // this.$intercom.update({
          //   user_id: this.user.identity.id,
          //   company: {
          //     id: agency.agency.id,
          //     name: agency.agency.name,
          //   },
          // });
          $authUser.clearCurrentEmployee();
          commitSetEmployeeContext(store, null);
          commitSetUserAgency(store, agency);
          commitSetSuperviseMode(store, false);
          if (agency.employee) {
            this.selectedEmployee = agency.employee;
            this.confirmSelectEmployee();
          } else {
            this.selectedEmployee = null;
            this.$router.push({ name: 'Dashboard' });
            this.$root.$emit('noEmployeeSelected');
          }
        });
    }
  }

  setLangauge(lang: KeyValueList) {
    if (lang) {
      commitUpdateLang(store, lang.value as string);
      this.lang = lang;
    }
  }

  // On selecting workspace we udpated intercom
  // this.$intercom.update({
  //   user_id: this.user.identity.id,
  //   workspace: workspace.workspace.name,
  // });

  async confirmSelectEmployee () {
    this.showModal = false;
    const accessMode: number = this.selectedEmployee.role;
    await $authUser.setCurrentEmployee(this.selectedEmployee.id, accessMode);
    $authUser.getCurrentWorkspaceContext()
      .then(async (res) => {
        await commitSetEmployeeContext(store, res);
        await commitSetNoEmployeeStatus(store, undefined);
        this.$root.$emit('currentEmployeeLoaded');
        this.$router.push({ name: 'Dashboard' });
      });
  }

  toggleShowNewFeatures () {
    const showNewFeatures = globalStates.getShowNewFeatures(store);
    globalStates.commitShowNewFeatures(store, !showNewFeatures);
  }
  searchString: string = '';
  searchStringChanged(a: string) {
    this.searchString = '';
  }
  showNC () {
    const tl = gsap.timeline();
    if (!this.ncDeployed) {
      this.ncDeployed = true;
      tl.to('#n-center .flex-scroll', { duration: 0, maxHeight: document.body.clientHeight - 154, opacity: 1, ease: 'power1.out' });
      tl.fromTo('#n-center', { width: 20, height: 20, opacity: 0 }, { duration: .3, width: 600, height: document.body.clientHeight - 100, opacity: 1, ease: 'power1.out' });
      tl.fromTo('.n-table, .flex-head .data-section', { opacity: 0 }, { duration: .5, delay: .3, opacity: 1, ease: 'power1.out' });
    } else {
      tl.to('.n-table, .flex-head .data-section', { duration: .3, opacity: 0, ease: 'power1.out' });
      tl.to('#n-center', { duration: .5, width: 0, height: 0, opacity: 0, ease: 'power4.out' });
      setTimeout(() => {
        this.ncDeployed = false;
      }, 800);
    }
  }
  newNotification () {
    gsap.from('.btn-notification .fa', { duration: 2.5, rotate: 25, yoyo: true, ease: 'elastic' });
  }

  empRole (role: number) {
    return EmployeeRole[role];
  }

  agencyLabel(role: number) {
    switch (EmployeeRole[role]) {
      case 'Admin':
        return 'label-success';
      case 'Employee':
        return 'label-default';
      default:
        return 'label-primary';
    }
  }
}
