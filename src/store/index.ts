import Vue from 'vue';
import Vuex from 'vuex';
import createPersistedState from 'vuex-persistedstate';
import { mainModule } from './modules/main';
import { mapModule } from './modules/map';
import { searchStatesModule } from './modules/searchStatesModule';
import { history } from './modules/history';
import { globalStatesModule } from './modules/globalStatesModule';
import { authStatesModule } from './modules/authStatesModule';
import { adminStates } from './modules/adminModule';
import { searchModule } from './modules/searchModule';
import { leadsModule } from './modules/leads';
import { pipelineModule } from './modules/pipeline';
import { marketRadarModule } from './modules/marketRadar';
import { sidebarsModule } from './modules/sidebars';
import { pricePredictionModule } from './modules/pricePredictionModule';
import * as api from '@immosparrow/cockpit-api-v2';

api.init(process.env.apiURL);
Vue.use(Vuex);

export const showSuccessMessage = (text: string) => {
  Vue.prototype.$notify({
    text,
    group: 'actions',
    type: 'success',
    duration: 2500,
  });
};

const store = new Vuex.Store({
  modules: {
    mainModule,
    mapModule,
    authStatesModule,
    adminStates,
    globalStatesModule,
    searchStatesModule,
    history,
    searchModule,
    leadsModule,
    pipelineModule,
    marketRadarModule,
    sidebarsModule,
    pricePredictionModule,
  },
  plugins: [
    createPersistedState({
      namespace: 'immosparrow',
      paths: [
        'authStatesModule',
        'adminStates',
        'globalStatesModule',
        'searchStatesModule',
        'history',
        'searchModule',
        'leadsModule',
        'pipelineModule',
      ],
      expires: 7 * 24 * 60 * 60 * 1e3,
    }),
  ],
  strict: false,

});

export default store;
