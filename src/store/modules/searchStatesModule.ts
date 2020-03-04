import { getStoreAccessors } from 'vuex-typescript';
import { ActionContext } from 'vuex';
import * as api from '@immosparrow/cockpit-api-v2';
import store from '../../store';

class State {
  searchedAddress: api.GeoSuggestion;
  searchedAddressTransparency: api.GeoSuggestion;
  searchedAddressMarketRadar: api.IGeoSuggestion;
  searchedPricePredictAddress: api.IGeoSuggestion;
  searchedPricePredictAddressOutside: api.GeoSuggestion;
  searchedAddressMarketRadarRadius: number;
  searchedAddressBuilding: api.BuildingModel;
  addressLoading: boolean;
  objectWindow: boolean;
  mapSidebar: boolean;
  pubLightModel: api.PubLightModel;
  pubLightModels: Array<api.PubLightModel>;
  marketRadarAds: Array<api.IPubLightModel>;
  searchQuery: api.PubQuery;
  openedPopapDetailId: string;
  ppCalculating: boolean;
}

const state: State = {
  searchedAddress: new api.GeoSuggestion(),
  searchedAddressTransparency: new api.GeoSuggestion(),
  searchedAddressMarketRadar: new api.GeoSuggestion(),
  searchedPricePredictAddress: new api.GeoSuggestion(),
  searchedPricePredictAddressOutside: new api.GeoSuggestion(),
  searchedAddressMarketRadarRadius: 5,
  searchedAddressBuilding: new api.BuildingModel(),
  addressLoading: false,
  objectWindow: false,
  mapSidebar: false,
  pubLightModel: new api.PubLightModel(),
  pubLightModels: [],
  marketRadarAds: [],
  searchQuery: api.$newObj(api.PubQuery),
  openedPopapDetailId: null,
  ppCalculating: false,
};
const namespaced = true;

export const searchStatesModule = {
  namespaced,
  state,
  getters: {
    ppCalculating: (state: State) => {
      return state.ppCalculating;
    },
    openedPopapDetailId: (state: State) => {
      return state.openedPopapDetailId;
    },
    searchedAddressBuilding: (state: State) => {
      return state.searchedAddressBuilding;
    },
    searchedAddress: (state: State) => {
      return state.searchedAddress;
    },
    searchedAddressTransparency: (state: State) => {
      return state.searchedAddressTransparency;
    },
    searchedAddressMarketRadar: (state: State) => {
      return state.searchedAddressMarketRadar;
    },
    searchedPricePredictAddress: (state: State) => {
      return state.searchedPricePredictAddress;
    },
    searchedPricePredictAddressOutside: (state: State) => {
      return state.searchedPricePredictAddressOutside;
    },
    searchedAddressMarketRadarRadius: (state: State) => {
      return state.searchedAddressMarketRadarRadius;
    },
    addressLoading: (state: State) => {
      return state.addressLoading;
    },
    objectWindow: (state: State) => {
      return state.objectWindow;
    },
    sidebar: (state: State) => {
      return state.mapSidebar;
    },
    pubLightModel: (state: State) => {
      return state.pubLightModel;
    },
    pubLightModels: (state: State) => {
      const p = state.pubLightModels.sort((a, b) => {
        if (a.trackingInfo.publicationInterval.lastUpdateTimeUtc.getTime() > b.trackingInfo.publicationInterval.lastUpdateTimeUtc.getTime()) return -1;
        if (a.trackingInfo.publicationInterval.lastUpdateTimeUtc.getTime() < b.trackingInfo.publicationInterval.lastUpdateTimeUtc.getTime()) return 1;
      });
      return p;
    },
    marketRadarAds: (state: State) => {
      return state.marketRadarAds;
    },
    searchQuery: (state: State) => {
      return state.searchQuery;
    },
  },
  mutations: {
    setPPCalculating: (state: State, newStatus: boolean) => {
      state.ppCalculating = newStatus;
    },
    setOpenedPopapDetailId (state: State, id: string) {
      state.openedPopapDetailId = id;
    },
    searchingFor (state: State, address: api.GeoSuggestion) {
      state.searchedAddress = address;
    },
    searchingForTransparency (state: State, address: api.GeoSuggestion) {
      state.searchedAddressTransparency = address;
    },
    searchingMarketRadarAddress (state: State, address: api.IGeoSuggestion) {
      state.searchedAddressMarketRadar = address;
    },
    async searchingPricePredictAddress (state: State, address: api.IGeoSuggestion) {
      state.searchedPricePredictAddress = address;
      return await state.searchedPricePredictAddress;
    },
    searchedPricePredictAddressOutside (state: State, address: api.GeoSuggestion) {
      state.searchedPricePredictAddressOutside = address;
    },

    searchingMarketRadarAddressRadius (state: State, radius: number) {
      state.searchedAddressMarketRadarRadius = radius;
    },

    searchedAddressBuilding (state: State, b: api.BuildingModel) {
      state.searchedAddressBuilding = b;
    },

    addressLoading (state: State, loading: boolean) {
      state.addressLoading = loading;
    },

    objectWindow (state: State, loading: boolean) {
      state.objectWindow = loading;
    },

    changeSidebar (state: State, val: boolean) {
      state.mapSidebar = val;
    },

    pubLightModel (state: State, val: api.PubLightModel) {
      state.pubLightModel = val;
    },
    pubLightModels (state: State, val: Array<api.PubLightModel>) {
      state.pubLightModels = val;
    },
    marketRadarAds (state: State, val: Array<api.IPubLightModel>) {
      state.marketRadarAds = val;
    },
    searchQuery (state: State, val: api.PubQuery) {
      state.searchQuery = val;
    },
    resetSearchQuery (state: State, q: any) {
      state.searchQuery = api.$newObj(api.PubQuery);
    },

    resetState: (s: State) => {
      const initial = state;
      Object.keys(initial).forEach((key) => { s[key] = initial[key]; });
    },
  },
  actions: {
    setTransparencyAddress(context: ActionContext<State, any>, address: api.GeoSuggestion) {
      commitSearchingForTransparency(store, address);
    },

  },
};

const { commit, read, dispatch } =
  getStoreAccessors<State, any>('searchStatesModule');
const mutations = searchStatesModule.mutations;
const getters = searchStatesModule.getters;
/*[getters, mutations].forEach(dictionary =>
  Object["entries"](dictionary).forEach(
    ([name, func]: any) => ((<any>func)._vuexKey = name)
  )
);
if (!Object["entries"]) {
  Object["entries"] = function (obj: any) {
    console.log(obj)
    let ownProps = Object.keys(obj),
      i = ownProps.length,
      resArray = new Array(i); // preallocate the Array
    while (i--)
      resArray[i] = [ownProps[i], obj[ownProps[i]]];

    return resArray;
  };
}*/

export const commitSearchingFor = commit(mutations.searchingFor);
export const commitSearchingForTransparency = commit(mutations.searchingForTransparency);
export const commitSearchingForMarketRadarAddress = commit(mutations.searchingMarketRadarAddress);
export const commitSearchedPricePredictAddress = commit(mutations.searchingPricePredictAddress);
export const commitSearchedPricePredictAddressOutside = commit(mutations.searchedPricePredictAddressOutside);
export const commitSearchingForMarketRadarAddressRadius = commit(mutations.searchingMarketRadarAddressRadius);
export const commitSearchedAddressBuilding = commit(mutations.searchedAddressBuilding);
export const commitAddressLoading = commit(mutations.addressLoading);
export const commitResetState = commit(mutations.resetState);
export const commitObjectWindow = commit(mutations.objectWindow);
export const commitSidebar = commit(mutations.changeSidebar);
export const commitPubLightModel = commit(mutations.pubLightModel);
export const commitPubLightModels = commit(mutations.pubLightModels);
export const commitMarketRadarAds = commit(mutations.marketRadarAds);
export const commitSearchQuery = commit(mutations.searchQuery);
export const commitResetSearchQuery = commit(mutations.resetSearchQuery);
export const commitOpenedPopapDetailId = commit(mutations.setOpenedPopapDetailId);
export const commitPPCalculating = commit(mutations.setPPCalculating);

export const getSearchedAddress = read(getters.searchedAddress);
export const getSearchedAddressTransparency = read(getters.searchedAddressTransparency);
export const getSearchedAddressMarketRadar = read(getters.searchedAddressMarketRadar);
export const getSearchedPricePredictAddress = read(getters.searchedPricePredictAddress);
export const getSearchedPricePredictAddressOutside = read(getters.searchedPricePredictAddressOutside);
export const getSearchedAddressMarketRadarRadius = read(getters.searchedAddressMarketRadarRadius);
export const getSearchedAddressBuilding = read(getters.searchedAddressBuilding);
export const getAddressLoading = read(getters.addressLoading);
export const getObjectWindow = read(getters.objectWindow);
export const getSidebar = read(getters.objectWindow);
export const getPubLightModel = read(getters.pubLightModel);
export const getPubLightModels = read(getters.pubLightModels);
export const getMarketRadarAds = read(getters.marketRadarAds);
export const getSearchQuery = read(getters.searchQuery);
export const getOpenedPopapDetailId = read(getters.openedPopapDetailId);

const actions = searchStatesModule.actions;
export const dispatchSetTransparencyAddress = dispatch(actions.setTransparencyAddress);
