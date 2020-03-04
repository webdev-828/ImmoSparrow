import { getStoreAccessors } from 'vuex-typescript';
import { ActionContext } from 'vuex';
import * as api from '@immosparrow/cockpit-api-v2';

class State {
  pricePredictorModuleHistory: api.QueryListEntryLightModel<any>[];
  pricePredictorModuleFavorites: api.QueryListEntryLightModel<any>[];
  searchModuleHistory: api.QueryListEntryLightModel<any>[];
  searchModuleBookmarks: api.QueryListEntryLightModel<any>[];
}

export const state: State = {
  pricePredictorModuleHistory: [],
  pricePredictorModuleFavorites: [],
  searchModuleHistory: [],
  searchModuleBookmarks: [],
};

type HistoryContext = ActionContext<State, any>;
const namespaced = true;

export const history = {
  namespaced,
  state,
  getters: {

    getSearchModuleHistory(state: State) {
      return state.searchModuleHistory;
    },
    getSearchModuleBookmarks(state: State) {
      return state.searchModuleBookmarks;
    },
    getPPModuleHistory(state: State) {
      return state.pricePredictorModuleHistory;
    },
    getPPModuleFavorites(state: State) {
      return state.pricePredictorModuleFavorites;
    },
  },
  mutations: {

    addToSearchModuleHistory(state: State, data: api.QueryListEntryLightModel<api.SearchQueryType>[]) {
      state.searchModuleHistory = data;
    },
    addToSearchModuleBookmarks(state: State, data: api.QueryListEntryLightModel<api.SearchQueryType>[]) {
      state.searchModuleBookmarks = data;
    },
    addToPPModuleHistory(state: State, data: api.QueryListEntryLightModel<any>[]) {
      state.pricePredictorModuleHistory = data;
    },
    addToPPModuleFavorites(state: State, data: api.QueryListEntryLightModel<any>[]) {
      state.pricePredictorModuleFavorites = data;
    },
    resetState: (s: State) => {
      const initial = state;
      Object.keys(initial).forEach((key) => { s[key] = initial[key]; });
    },
  },
  actions: {

    // search module
    async getSearchModuleHistory(context: HistoryContext) {
      const history = await api.$queryLists.search.list(50, api.QueryListEntryTypes.History);
      commitSearchModuleHistory(context, history);
      return history;
    },

    async getSearchModuleHistoryEntry(context: HistoryContext, id: string) {
      return await api.$queryLists.search.$entry(id).get();
    },

    async addToSearchModuleHistoryEntry(context: HistoryContext, data: any) {
      return await api.$queryLists.search.create(data.name, true, data.query, api.SearchQueryType.Publication);
    },

    async removeFromSearchModuleHistoryEntry(context: HistoryContext, id: string) {
      return await api.$queryLists.search.$entry(id).delete();
    },
    async bookmarkSearchModuleHistoryEntry(context: HistoryContext, h: api.QueryListEntryLightModel<any>) {
      return await api.$queryLists.search.$entry(h.id).updateIsFavorite(!h.isFavorite);
    },

    async editFavouriteSearchModuleHistoryEntry(context: HistoryContext, data: any) {
      return await api.$queryLists.search.$entry(data.id).updateName(data.name, false);
    },

    async editLastUsedHistoryEntrySearch(context: HistoryContext, id: string) {
      return await api.$queryLists.search.$entry(id).updateLastUsed();
    },

    async getSearchModuleBookmarks(context: HistoryContext) {
      const history = await api.$queryLists.search.list(50, api.QueryListEntryTypes.Favorite);
      commitSearchModuleBookmarks(context, history);
      return history;
    },

    // price predictor
    async bookmarkPPModuleHistoryEntry(context: HistoryContext, h: api.QueryListEntryLightModel<any>) {
      return await api.$queryLists.pricePred.$entry(h.id).updateIsFavorite(!h.isFavorite);
    },

    async editFavouritePPModuleHistoryEntry(context: HistoryContext, data: any) {
      return await api.$queryLists.pricePred.$entry(data.id).updateName(data.name, false);
    },

    async editLastUsedHistoryEntry(context: HistoryContext, id: string) {
      return await api.$queryLists.pricePred.$entry(id).updateLastUsed();
    },

    async getPPModuleHistory(context: HistoryContext) {
      const history = await api.$queryLists.pricePred.list(50, api.QueryListEntryTypes.History);
      commitPPModuleHistory(context, history);
      return history;
    },

    async getPPModuleBookmarks(context: HistoryContext) {
      const history = await api.$queryLists.pricePred.list(50, api.QueryListEntryTypes.Favorite);
      commitPPModuleFavorites(context, history);
      return history;
    },

    async addToPPModuleHistoryEntry(context: HistoryContext, data: any) {
      return await api.$queryLists.pricePred.create(data.name, true, data.query, data.queryType);
    },

    async removeFromPPModuleHistoryEntry(context: HistoryContext, id: string) {
      return await api.$queryLists.pricePred.$entry(id).delete();
    },

    async getPPModuleHistoryEntry(context: HistoryContext, id: string) {
      return await api.$queryLists.pricePred.$entry(id).get();
    },

    // market radar module
    async getMarkerRadarHistoryEntry(context: HistoryContext, id: string) {
      return await api.$queryLists.marketRadar.$entry(id).get();
    },

    async addToMarkerRadarModuleHistoryEntry(context: HistoryContext, data: any) {
      return await api.$queryLists.marketRadar.create(data.name, false, data.query, api.MarketRadarQueryType.Publication);
    },

    async editLastUsedHistoryEntryMarkerRadar(context: HistoryContext, id: string) {
      return await api.$queryLists.marketRadar.$entry(id).updateLastUsed();
    },
  },
};

const { commit, read, dispatch } =
  getStoreAccessors<State, any>('history');
const mutations = history.mutations;
const getters = history.getters;
const actions = history.actions;

export const commitResetState = commit(mutations.resetState);
// search module
export const commitSearchModuleHistory = commit(mutations.addToSearchModuleHistory);
export const commitSearchModuleBookmarks = commit(mutations.addToSearchModuleBookmarks);

export const getSearchModuleHistory = read(getters.getSearchModuleHistory);
export const getSearchModuleBookmarks = read(getters.getSearchModuleBookmarks);
export const dispatchGetSearchModuleBookmarks = dispatch(actions.getSearchModuleBookmarks);

export const dispatchGetSearchModuleHistory = dispatch(actions.getSearchModuleHistory);
export const dispatchGetSearchModuleHistoryEntry = dispatch(actions.getSearchModuleHistoryEntry);
export const dispatchAddToSearchModuleHistoryEntry = dispatch(actions.addToSearchModuleHistoryEntry);
export const dispatchRemoveFromSearchModuleHistoryEntry = dispatch(actions.removeFromSearchModuleHistoryEntry);
export const dispatchBookmarkSearchModuleHistoryEntry = dispatch(actions.bookmarkSearchModuleHistoryEntry);
export const dispatchEditFavouriteSearchModuleHistoryEntry = dispatch(actions.editFavouriteSearchModuleHistoryEntry);
export const dispatchEditLastUsedHistoryEntrySearch = dispatch(actions.editLastUsedHistoryEntrySearch);

// pp module
export const getPPModuleHistory = read(getters.getPPModuleHistory);
export const getPPModuleFavorites = read(getters.getPPModuleFavorites);

export const commitPPModuleHistory = commit(mutations.addToPPModuleHistory);
export const commitPPModuleFavorites = commit(mutations.addToPPModuleFavorites);

export const dispatchGetPPModuleHistory = dispatch(actions.getPPModuleHistory);
export const dispatchGetPPModuleBookmarks = dispatch(actions.getPPModuleBookmarks);
export const dispatchAddToPPModuleHistoryEntry = dispatch(actions.addToPPModuleHistoryEntry);
export const dispatchRemoveFromPPModuleHistoryEntry = dispatch(actions.removeFromPPModuleHistoryEntry);
export const dispatchBookmarkPPModuleHistoryEntry = dispatch(actions.bookmarkPPModuleHistoryEntry);
export const dispatchEditFavouritePPhModuleHistoryEntry = dispatch(actions.editFavouritePPModuleHistoryEntry);
export const dispatchGetPPModuleHistoryEntry = dispatch(actions.getPPModuleHistoryEntry);
export const dispatchEditLastUsedHistoryEntryPP = dispatch(actions.editLastUsedHistoryEntry);

// mr module
export const dispatchGetMRModuleHistoryEntry = dispatch(actions.getMarkerRadarHistoryEntry);
export const dispatchAddToMRModuleHistoryEntry = dispatch(actions.addToMarkerRadarModuleHistoryEntry);
export const dispatchEditLastUsedHistoryEntryMR = dispatch(actions.editLastUsedHistoryEntryMarkerRadar);
