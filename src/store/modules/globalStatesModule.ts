import { getStoreAccessors } from 'vuex-typescript';
import packageJSON from '../../../package.json';

class State {
  fullscreenLoading: boolean;
  loadingButton: boolean;
  showOverviewList: boolean;
  showRightSidebar: boolean;
  leftSearchSidebar: boolean;
  showSearchMap: boolean;
  showMapRightSidebar: boolean;
  showRightSidebarTransparency: boolean;
  profileRightSidebar: boolean;
  mapLoaded: boolean;
  mapSize: string;
  loadingSearchResults: boolean;
  nextItem: boolean;
  showNewFeatures: boolean;
  showPipeDetails: boolean;
  version: {
    version: string;
    isNew: boolean
  };
  packageVersion: string;
}
const state: State = {
  fullscreenLoading: false,
  loadingButton: false,
  showOverviewList: false,
  showRightSidebar: false,
  showRightSidebarTransparency: false,
  leftSearchSidebar: false,
  showSearchMap: true,
  mapLoaded: false,
  showMapRightSidebar: true,
  profileRightSidebar: false,
  mapSize: 'big',
  loadingSearchResults: false,
  nextItem: true,
  showNewFeatures: false,
  showPipeDetails: false,
  version: {
    version: null,
    isNew: false,
  },
  packageVersion: packageJSON ? packageJSON.version : '0',
};
const namespaced = true;

export const globalStatesModule = {
  namespaced,

  state,
  getters: {
    fullscreenLoading: (state: State) => {
      return state.fullscreenLoading;
    },
    loadingButton: (state: State) => {
      return state.loadingButton;
    },
    showOverviewList: (state: State) => {
      return state.showOverviewList;
    },
    showRightSidebar: (state: State) => {
      return state.showRightSidebar;
    },
    showRightSidebarTransparency: (state: State) => {
      return state.showRightSidebarTransparency;
    },
    showPipeDetails: (state: State) => {
      return state.showPipeDetails;
    },
    showMapRightSidebar: (state: State) => {
      return state.showMapRightSidebar;
    },
    showSearchMap: (state: State) => {
      return state.showSearchMap;
    },
    profileRightSidebar: (state: State) => {
      return state.profileRightSidebar;
    },
    isSearchSidebarOpened: (state: State) => {
      return state.leftSearchSidebar;
    },
    mapLoaded: (state: State) => {
      return state.mapLoaded;
    },
    mapSize: (state: State) => {
      return state.mapSize;
    },
    loadingSearchResults: (state: State) => {
      return state.loadingSearchResults;
    },
    nextItem: (state: State) => {
      return state.nextItem;
    },
    showNewFeatures: (state: State) => {
      return state.showNewFeatures;
    },
    version: (state: State) => {
      return state.version;
    },
    appVersion: (state: State) => {
      return state.packageVersion;
    },
  },
  mutations: {
    version(s: State, v: { version: string; isNew: boolean }) {
      s.version = v;
    },
    setFullscreenLoading(state: State, fullscreenLoading: boolean) {
      state.fullscreenLoading = fullscreenLoading;
    },
    setLoadingButton(state: State, loadingButton: boolean) {
      state.loadingButton = loadingButton;
    },
    setShowNewFeatures(state: State, showNewFeatures: boolean) {
      state.showNewFeatures = showNewFeatures;
    },
    setOverviewList(state: State, showOverviewList: boolean) {
      state.showOverviewList = showOverviewList;
    },
    setRightSidebar(state: State, showRightSidebar: boolean) {
      state.showRightSidebar = showRightSidebar;
    },
    setRightSidebarTransparency(state: State, showRightSidebar: boolean) {
      state.showRightSidebarTransparency = showRightSidebar;
    },
    setShowPipeDetails(state: State, showPipeDetails: boolean) {
      state.showPipeDetails = showPipeDetails;
    },
    setMapRightSidebar(state: State, showMapRightSidebar: boolean) {
      state.showMapRightSidebar = showMapRightSidebar;
    },
    setSearchMap(state: State, showSearchMap: boolean) {
      state.showSearchMap = showSearchMap;
    },
    setSearchSidebar(state: State, on: boolean) {

      state.leftSearchSidebar = on;
    },
    setProfileRightSidebar(state: State, profileRightSidebar: boolean) {
      state.profileRightSidebar = profileRightSidebar;
    },
    mapLoaded(state: State, loaded: boolean) {
      state.mapLoaded = loaded;
    },
    mapSize(state: State, size: string) {
      state.mapSize = size;
    },
    loadingSearchResults(state: State, v: boolean) {
      state.loadingSearchResults = v;
    },
    setNextItem(state: State, next: boolean) {
      state.nextItem = next;
    },
    resetState: (s: State) => {
      const initial = state;
      Object.keys(initial).forEach((key) => { s[key] = initial[key]; });
    },
  },
};

const { commit, read } =
  getStoreAccessors<State, any>('globalStatesModule');

const getters = globalStatesModule.getters;
export const getIsCentralLoading = read(getters.fullscreenLoading);
export const getLoadingButton = read(getters.loadingButton);
export const getOverviewList = read(getters.showOverviewList);
export const getRightSidebar = read(getters.showRightSidebar);
export const getTransparencySidebar = read(getters.showRightSidebarTransparency);
export const getMapRightSidebar = read(getters.showMapRightSidebar);
export const getSearchSideBar = read(getters.isSearchSidebarOpened);
export const getSearchMap = read(getters.showSearchMap);
export const getProfileRightSidebar = read(getters.profileRightSidebar);
export const loadingSearchResults = read(getters.loadingSearchResults);
export const getNextItem = read(getters.nextItem);
export const getShowNewFeatures = read(getters.showNewFeatures);
export const getShowPipeDetails = read(getters.showPipeDetails);
export const getAppVersion = read(getters.appVersion);

const mutations = globalStatesModule.mutations;
export const commitIsCentralLoading = commit(mutations.setFullscreenLoading);
export const commitSetLoadingButton = commit(mutations.setLoadingButton);
export const commitShowOverviewList = commit(mutations.setOverviewList);
export const commitShowRightSidebar = commit(mutations.setRightSidebar);
export const commitShowRightSidebarTransparency = commit(mutations.setRightSidebarTransparency);
export const commitShowMapRightSidebar = commit(mutations.setMapRightSidebar);
export const commitSetSearchSidebar = commit(mutations.setSearchSidebar);
export const commitShowSearchMap = commit(mutations.setSearchMap);
export const commitProfileRightSidebar = commit(mutations.setProfileRightSidebar);
export const commitSetNextItem = commit(mutations.setNextItem);
export const commitShowPipeDetails = commit(mutations.setShowPipeDetails);
export const commitShowNewFeatures = commit(mutations.setShowNewFeatures);
export const commitResetState = commit(mutations.resetState);
export const updateLoadingSearchResults = commit(mutations.loadingSearchResults);

export const getVersion = read(getters.version);
export const updateVersion = commit(mutations.version);
