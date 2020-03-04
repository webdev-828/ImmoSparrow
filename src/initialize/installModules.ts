import Vue from 'vue';
import router from '../router';
import Vuebar from 'vuebar';
import Notifications from 'vue-notification';
import BootstrapVue from 'bootstrap-vue';
import VeeValidate from 'vee-validate';
import VueTheMask from 'vue-the-mask';
import VueAnalytics from 'vue-analytics';
import VTooltip from 'v-tooltip';
import VueCarousel from 'vue-carousel';
import VueChartkick from 'vue-chartkick';
import Chart from 'chart.js';
import VueTimeago from 'vue-timeago';

Vue.use(Vuebar);
Vue.use(VueTheMask);
Vue.use(VTooltip);
Vue.use(BootstrapVue);
Vue.use(Notifications);
Vue.use(VueCarousel);
Vue.use(VueChartkick, { adapter: Chart });
Vue.use(VeeValidate, { events: 'input' });
Vue.use(VueAnalytics, {
  router,
  id: process.env.analythics,
  autoTracking: {
    exception: false,
  },
  debug: {
    enabled: false,
  },
});
Vue.use(VueTimeago, {
  name: 'timeago',
  locale: 'en-US',
  locales: {
    'en-US': require('vue-timeago/locales/en-US.json'),
  },
});
