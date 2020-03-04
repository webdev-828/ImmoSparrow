import 'intl';
import 'intl/locale-data/jsonp/en.js';

import Vue from 'vue';
import VueLocale from 'vue-ts-locale';

const config = require('./config.json');
const englishMessageText = require('./locale/en.json');

Vue.use(VueLocale, {
  language: config.language,
  currency: config.currency,
  messages: englishMessageText,
});
