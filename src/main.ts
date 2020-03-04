import { Component, Watch } from 'vue-property-decorator';
import Vue from 'vue';
import template from './main.vue';
import store from '@store';
import router from '@/router';
import { mapGetters } from 'vuex';
import NavHeader from '@components/layout/header/';
import Navigation from '@components/layout/navigation/';
import NavFooter from '@components/layout/footer/';
import FeatureModal from '@components/modal/featureModal';
import * as globalStates from '@store/modules/globalStatesModule';
import * as api from '@immosparrow/cockpit-api-v2';
import bugsnag from '@bugsnag/js';
import bugsnagVue from '@bugsnag/plugin-vue';
import packageJSON from '../package.json';
import validation from '@/assets/generalValidation';
import * as auth from '@store/modules/authStatesModule';

import '@/initialize/registerComponents';
import '@/initialize/registerFilters';
import '@/initialize/installModules';
import '@/directives';
import '@/localisation';
import '@/polyfill';
import WebglWarning from './components/shared/webgl-warning';

require('jquery-slim-webpack');
require('../node_modules/bootstrap/dist/js/bootstrap.min.js');

@Component({
  store,
  router,
  mixins: [template],
  components: {
    NavHeader,
    Navigation,
    NavFooter,
    FeatureModal,
    WebglWarning,
  },
  computed: mapGetters({ dataNoEmployee: 'authStatesModule/dataNoEmployee' }),
})
class App extends Vue {
  version: string = null;
  webgl: boolean = true;

  detectWebGL() {
    // Check for the WebGL rendering context
    const canvas = document.createElement('canvas');
    // Get WebGLRenderingContext from canvas element.
    const gl = canvas.getContext('webgl')
      || canvas.getContext('experimental-webgl');
    // Report the result.
    if (!gl && !(gl instanceof WebGLRenderingContext)) {
      this.webgl = false;
    }
  }
  beforeCreate() {
    const langs: string[] = ['de', 'en', 'it-CH'];
    this.$validator.dictionary.merge(validation);
    let lang = 'en';
    if (localStorage.getItem('lang')) {
      lang = localStorage.getItem('lang');
    } else {
      const userLang = navigator.language || navigator['userLanguage'];
      if (userLang) {
        if (userLang.includes('-')) { // get all 'de' (de-CH, de-LT, etc.)
          lang = userLang.split('-')[0].toLowerCase();
          if (lang === 'it') {  // but support only it-CH
            lang = 'it-CH';
          }
        } else {
          lang = userLang;
        }
      }
    }
    lang = langs.indexOf(lang) !== -1 ? lang : 'en';
    window['Localize'].setLanguage(lang);
    localStorage.setItem('lang', lang);

    const apiPersistentData = localStorage.getItem('api.data');
    const apiSessionData = localStorage.getItem('api.auth.data');
    if (apiPersistentData) {
      api.$global.data.loadPersistentData(JSON.parse(apiPersistentData));
    }
    if (apiSessionData) {
      api.$global.data.loadSessionData(JSON.parse(apiSessionData));
    }

    api.$global.net.errors.onUnauthorized(() => {
      auth.commitSetUserContext(store, null);
      this.$router.push({ name: 'Login', query: this.$router['history'].current.query });
    });

    const showErrorMessage = (text: string) => {
      Vue.prototype.$notify({
        text,
        group: 'actions',
        type: 'error',
        duration: 10000,
        speed: 1,
      });
    };

    if (apiSessionData) {
      api.$global.net.errors.onForbidden(() => {
        showErrorMessage('Looks like you have no access, please reload the page');
      });
      api.$global.net.errors.onServerError(() => {
        showErrorMessage('Something is wrong with the server, please, try again later');
      });
      api.$global.net.errors.onNetworkError(() => {
        showErrorMessage('Looks like the network connection is too slow, please, try again later');
      });

      api.$global.net.errors.onUnknownError((res: any) => {
        if (res.response && res.response.status === 581) {
          return;
        }
        showErrorMessage('Oops something went wrong, please contact us and we will help you');
      });
      api.$global.net.errors.onAnyError((e: api.HttpErrorEvent) => {
        globalStates.commitSetLoadingButton(store, false);
        if (e.response.status === 403 || e.response.status === 503) {
          this.$router.push({ name: 'Login' });
        }
      });
    }

    if (this.$route.meta.requiresAuth || apiSessionData) {
      auth.commitSetUserContext(store, null);
      api.$authUser.getContext().then((res) => {
        auth.commitSetUserContext(store, res);
      }).catch(err => err);
    }
    this.$validator.extend('notEmptyArr', {
      getMessage: (field: string) => `The ${field} must not be empty`,
      validate: ({ id }: { id: string }) => id !== '',
    });

    this.$validator.extend('noHTMLTag', {
      getMessage: () => 'Please, don\'t use the following construction - <something>',
      validate: (val: string) => !val.match(/(<([^>]+)>)/ig),
    });

    this.$validator.extend('canNotBeZero', {
      getMessage: (field: string) => {
        return `${field}` + ' can not be 0';
      },
      validate: (value: string) => {
        return parseInt(value) !== 0;
      },
    });
    this.$validator.extend('trinityIsSmaller', {
      getMessage: (field: string) => {
        const fieldName = field.split('-min')[0];
        return `Min ${fieldName} must be less than ${fieldName} field`;
      },
      validate: (value: string, otherValue: string[]) => {
        if (value && otherValue[0]) {
          return parseInt(value) <= parseInt(otherValue[0]);
        }
        return true;
      },
    });
    this.$validator.extend('trinityIsBigger', {
      getMessage: (field: string) => {
        const fieldName = field.split('-max')[0];
        return `Max ${fieldName} must be greater than price field`;
      },
      validate: (value: string, otherValue: string[]) => {
        if (value && otherValue[0]) {
          return parseInt(value) >= parseInt(otherValue[0]);
        }
        return true;
      },
    });

    if (process.env.NODE_ENV !== 'dev') {
      const bugsnagClient = bugsnag({
        apiKey: process.env.bugsnagKey,
        releaseStage: process.env.bugsnagENV,
        appVersion: packageJSON.version,
        consoleBreadcrumbsEnabled: false,
      });
      bugsnagClient.use(bugsnagVue, Vue);

      api.$global.net.errors.onAnyError((e: api.HttpErrorEvent) => {
        const { status } = e.response;
        if (status !== 401 && status !== 0) {
          const emp = auth.getEmployeeContext(store);
          bugsnagClient.notify(`${JSON.stringify(e.response)} ${JSON.stringify(e.request)}`, {
            request: {
              APIdata: {
                response: e.response,
                request: e.request,
              },
            },
            user: {
              employeeId: emp?.employee?.id,
            },
            severity: 'error',
          });
        }
      });
    }
  }

  showUpdateModal = false;
  intervals: any = [];
  onUpdateReady() {
    this.showUpdateModal = true;
  }

  confirmIAmOkWithUpdate() {
    this.showUpdateModal = false;
    auth.dispatchLogout(store).then(() => {
      globalStates.updateVersion(this.$store, { version: this.version, isNew: false });
      this.$router.push({ name: 'Login' });
    });
  }

  created() {
    this.detectWebGL();
    api.$global.data.persistentDataChanged.add(this.persistentDataChanged);
    api.$global.data.sessionDataChanged.add(this.sessionDataChanged);
    // First we get the viewport height and we multiple it by 1% to get a value for a vh unit
    const vh = window.innerHeight * 0.01;
    document.documentElement.style.setProperty('--vh', `${vh}px`);

    window.addEventListener('resize', () => {
      const vh = window.innerHeight * 0.01;
      document.documentElement.style.setProperty('--vh', `${vh}px`);
    });
  }
  get loggedInUser() {
    return {
      u: auth.getLoggedInUser(this.$store) && auth.getLoggedInUser(this.$store).id,
      time: new Date().getTime(),
    };
  }
  checkNewVersion() {
    fetch('/static/version.json').then((data) => {
      return data.json();
    }).then((json) => {
      this.version = json.version;
      const currentVersion = globalStates.getVersion(this.$store);
      if (currentVersion.version && currentVersion.version !== json.version && !currentVersion.isNew) {
        this.showUpdateModal = true;
        globalStates.updateVersion(this.$store, { version: json.version, isNew: true });
      }
    });
  }
  persistentDataChanged() {
    const apiPersistentData = api.$global.data.getPersistentData();
    if (apiPersistentData) {
      localStorage.setItem('api.data', JSON.stringify(apiPersistentData));
    }
  }
  sessionDataChanged() {
    const apiSessionData = api.$global.data.getSessionData();
    if (apiSessionData) {
      localStorage.setItem('api.auth.data', JSON.stringify(apiSessionData));
    }
  }

  @Watch('loggedInUser')
  watchloggedInUser() {
    // check for new version only if user is logged in
    if (this.loggedInUser.u) {
      const perfEntries = performance.getEntriesByType('navigation');
      for (let i = 0; i < perfEntries.length; i += 1) {
        if ((<any>perfEntries[i]).type === 'reload' || (<any>perfEntries[i]).type === 'navigate' || (<any>perfEntries[i]).type === 'back_forward') {
          fetch('/static/version.json').then((data) => {
            return data.json();
          }).then((json) => {
            globalStates.updateVersion(this.$store, { version: json.version, isNew: false });
          });
        }
      }
      this.checkNewVersion();
      this.intervals.push(setInterval(this.checkNewVersion, 60000));
    } else {
      for (const i in this.intervals) {
        clearInterval(this.intervals[i]);
      }
      this.showUpdateModal = false;
    }
  }
}

export const app = new App().$mount('#app');
