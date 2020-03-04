import { getStoreAccessors } from 'vuex-typescript';
import { GeoSuggestion, GeoAddress, GeoAddressPart } from '@immosparrow/cockpit-api-v2';

class AddressParts {
  // tslint:disable
  Locality: GeoAddressPart;
  Commune: GeoAddressPart;
  Canton: GeoAddressPart;
  // tslint:enable

  constructor() {
    this.Locality = null;
    this.Commune = null;
    this.Canton = null;
  }
}

class State {
  isLoading: boolean;
  isFullscreenLoading: boolean;
  searchedAddress: GeoSuggestion;
  fullAddress: GeoAddress;
  isAddressLoading: boolean;
  addressParts: AddressParts;
}

export const state: State = {
  isLoading: false,
  isFullscreenLoading: false,
  searchedAddress: null,
  fullAddress: null,
  isAddressLoading: false,
  addressParts: new AddressParts(),
};

const namespaced = true;
export const mainModule = {
  namespaced,
  state,
  getters: {
    getIsLoading(state: State) {
      return state.isLoading;
    },
    getIsFullscreenLoading(state: State) {
      return state.isFullscreenLoading;
    },
    getSearchedAddress(state: State) {
      return state.searchedAddress;
    },
    getFullAddress(state: State) {
      return state.fullAddress;
    },
    getIsAddressLoading(state: State) {
      return state.isAddressLoading;
    },
    getAddressParts(state: State) {
      return state.addressParts;
    },
  },
  mutations: {
    setIsLoading(state: State, value: boolean) {
      state.isLoading = value;
    },
    setIsFullscreenLoading(state: State, value: boolean) {
      state.isFullscreenLoading = value;
    },
    setSearchedAddress(state: State, address: GeoSuggestion) {
      state.searchedAddress = address;
    },
    setFullAddress(state: State, address: GeoAddress) {
      state.fullAddress = address;
    },
    setIsAddressLoading(state: State, value: boolean) {
      state.isAddressLoading = value;
    },
    clearAddressParts(state: State) {
      state.addressParts = new AddressParts();
    },
  },
};

const { read, commit } = getStoreAccessors<State, any>('mainModule');

const getters = mainModule.getters;
export const getIsLoading = read(getters.getIsLoading);
export const getIsFullscreenLoading = read(getters.getIsFullscreenLoading);
export const getSearchedAddress = read(getters.getSearchedAddress);
export const getFullAddress = read(getters.getFullAddress);
export const getIsAddressLoading = read(getters.getIsAddressLoading);
export const getAddressParts = read(getters.getAddressParts);

const mutations = mainModule.mutations;
export const setIsLoading = commit(mutations.setIsLoading);
export const setIsFullscreenLoading = commit(mutations.setIsFullscreenLoading);
export const setSearchedAddress = commit(mutations.setSearchedAddress);
export const setFullAddress = commit(mutations.setFullAddress);
export const setIsAddressLoading = commit(mutations.setIsAddressLoading);
export const clearAddressParts = commit(mutations.clearAddressParts);
