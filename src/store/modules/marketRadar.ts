import { getStoreAccessors } from 'vuex-typescript';
import { ActionContext } from 'vuex';
import {
  $pubs, $queryLists, QueryListEntryTypes, MarketRadarQueryType, IPubPropertyCategory,
  PubLightModel, BuildingModel, PropertyPricePrediction, PubStatsPubCountPerQuarterModel,
  PricePredStatsModel, PubStatsPricesModel, EntranceRatingsModel,
} from '@immosparrow/cockpit-api-v2';
import { MarketRadarModel, HistoryItem, Publication } from '@/models';
import { PoiCategory } from '@immosparrow/cockpit-api-v2/lib/client';

class Prediction {
  loading: boolean;
  ads: PropertyPricePrediction;
  transaction: PropertyPricePrediction;
  statistics: PropertyPricePrediction;

  constructor() {
    this.loading = false;
    this.ads = null;
    this.transaction = null;
    this.statistics = null;
  }
}

class Statistics {
  country: PubStatsPricesModel;
  canton: PubStatsPricesModel;
  ads: PubStatsPricesModel;
  market: {
    all: PubStatsPubCountPerQuarterModel[];
    onlyActive: PubStatsPubCountPerQuarterModel[];
  };

  constructor() {
    this.country = null;
    this.canton = null;
    this.ads = null;
    this.market = { all: [], onlyActive: [] };
  }
}

class State {
  formModel: MarketRadarModel;
  marketRadarModel: MarketRadarModel;
  bookmarks: HistoryItem[];
  history: HistoryItem[];
  ads: PubLightModel[];
  buildingInfo: BuildingModel;
  selectedAd: PubLightModel;
  similarObjects: Publication[];
  prediction: Prediction;
  propertyCategories: IPubPropertyCategory[];
  statistics: Statistics;
  entranceRatings: EntranceRatingsModel;
  poiCategories: PoiCategory[];
}

export const state: State = {
  formModel: null,
  marketRadarModel: null,
  bookmarks: [],
  history: [],
  ads: [],
  buildingInfo: null,
  selectedAd: null,
  similarObjects: [],
  prediction: new Prediction(),
  statistics: new Statistics(),
  propertyCategories: [],
  entranceRatings: null,
  poiCategories: [],
};

const namespaced = true;
export const marketRadarModule = {
  namespaced,
  state,
  getters: {
    getFormModel(state: State) {
      return state.formModel;
    },
    getSearchModel(state: State) {
      return state.marketRadarModel;
    },
    getAds(state: State) {
      return state.ads;
    },
    getBookmarks(state: State) {
      return state.bookmarks;
    },
    getHistory(state: State) {
      return state.history;
    },
    getBuildingInfo(state: State) {
      return state.buildingInfo;
    },
    getSelectedAd(state: State) {
      return state.selectedAd;
    },
    getSimilarObjects(state: State) {
      return state.similarObjects.filter((ad: Publication) => {
        return ad?.address?.quality && ad?.address?.quality !== 0;
      });
    },
    getPricePrediction(state: State) {
      return state.prediction;
    },
    getPropertyCategories(state: State) {
      return state.propertyCategories;
    },
    getStatistics(state: State) {
      return state.statistics;
    },
    getEntranceRatings(state: State) {
      return state.entranceRatings;
    },
    getPoiCategories(state: State) {
      return state.poiCategories;
    },
  },
  mutations: {
    setFormModel(state: State, model: MarketRadarModel) {
      state.formModel = model;
    },
    setSearchModel(state: State, model: MarketRadarModel) {
      state.marketRadarModel = model;
    },
    setAds(state: State, ads: PubLightModel[]) {
      state.ads = ads;
    },
    setBookmarks(state: State, bookmarks: HistoryItem[]) {
      state.bookmarks = bookmarks;
    },
    setHistory(state: State, history: HistoryItem[]) {
      state.history = history;
    },
    addHistoryEntry(state: State, entry: HistoryItem) {
      state.history.unshift(entry);
    },
    removeHistoryEntry(state: State, id: string) {
      const targetIndex = state.history.findIndex(x => x.id === id);
      state.history.splice(targetIndex, 1);
    },
    addBookmarkEntry(state: State, entry: HistoryItem) {
      state.bookmarks.unshift(entry);
    },
    removeBookmarkEntry(state: State, id: string) {
      const targetIndex = state.bookmarks.findIndex(x => x.id === id);
      state.bookmarks.splice(targetIndex, 1);
    },
    setBuildingInfo(state: State, model: BuildingModel) {
      state.buildingInfo = model;
    },
    setSelectedAd(state: State, ad: PubLightModel) {
      state.selectedAd = ad;
    },
    setSimilarObjects(state: State, similarObjects: Publication[]) {
      state.similarObjects = similarObjects;
    },
    setPredictionIsLoading(state: State, value: boolean) {
      state.prediction.loading = value;
    },
    setPredictionAds(state: State, prediction: PropertyPricePrediction) {
      state.prediction.ads = prediction;
    },
    setPredictionTransaction(state: State, prediction: PropertyPricePrediction) {
      state.prediction.transaction = prediction;
    },
    setPredictionStatistics(state: State, statistics: PropertyPricePrediction) {
      state.prediction.statistics = statistics;
    },
    setCountryStatisticModel(state: State, model: PricePredStatsModel) {
      state.statistics.country = model;
    },
    setCantonStatisticModel(state: State, model: PricePredStatsModel) {
      state.statistics.canton = model;
    },
    setAdsStatisticModel(state: State, model: PropertyPricePrediction) {
      state.statistics.ads = model;
    },
    setMarketAnyStatisticModel(state: State, model: PubStatsPubCountPerQuarterModel[]) {
      state.statistics.market.all = model;
    },
    setMarketOnlyActiveStatisticModel(state: State, model: PubStatsPubCountPerQuarterModel[]) {
      state.statistics.market.onlyActive = model;
    },
    setPropertyCategories(state: State, propertyCategories: IPubPropertyCategory[]) {
      state.propertyCategories = propertyCategories;
    },
    setEntranceRatings(state: State, entranceRatings: EntranceRatingsModel) {
      state.entranceRatings = entranceRatings;
    },
    setPoiCategories(state: State, poiCategories: PoiCategory[]) {
      state.poiCategories = poiCategories;
    },
  },
  actions: {
    async getHistory(context: ActionContext<State, any>) {
      const response = await $queryLists.marketRadar.list(50, QueryListEntryTypes.History);
      const history = response.map(item => new HistoryItem(item));
      setHistory(context, history);
    },
    async removeAllHistory(context: ActionContext<State, any>) {
      return $queryLists.marketRadar.deleteAll(QueryListEntryTypes.History).then(() => {
        setHistory(context, []);
      });
    },
    async actionRemoveHistoryEntry(context: ActionContext<State, any>, id: string) {
      return await $queryLists.marketRadar.$entry(id).delete().then(() => {
        removeHistoryEntry(context, id);
      });
    },
    async getBookmarks(context: ActionContext<State, any>) {
      const response = await $queryLists.marketRadar.list(50, QueryListEntryTypes.Favorite);
      const bookmarks = response.map(item => new HistoryItem(item));
      setBookmarks(context, bookmarks);
    },
    async toggleIsFavoriteHistoryEntry(context: ActionContext<State, any>, entry: HistoryItem) {
      return await $queryLists.marketRadar.$entry(entry.id).updateIsFavorite(!entry.isFavorite).then(() => {
        entry.isFavorite = !entry.isFavorite;
        if (entry.isFavorite) {
          removeHistoryEntry(context, entry.id);
          addBookmarkEntry(context, entry);
        } else {
          removeBookmarkEntry(context, entry.id);
          addHistoryEntry(context, entry);
        }
      });
    },
    async removeAllBookmarks(context: ActionContext<State, any>) {
      return await $queryLists.marketRadar.deleteAll(QueryListEntryTypes.Favorite).then(() => {
        setBookmarks(context, []);
      });
    },
    async editBookmarkEntryName(context: ActionContext<State, any>, payload: { entry: HistoryItem, name: string }) {
      return await $queryLists.marketRadar.$entry(payload.entry.id).updateName(payload.name, false);
    },
    async createHistoryEntry(context: ActionContext<State, any>, data: any) {
      return await $queryLists.marketRadar.create(data.name, false, data.query, MarketRadarQueryType.Publication);
    },
    async getPropertyCategories(context: ActionContext<State, any>) {
      return await $pubs.getPropertyCategories()
        .then((propertyCategories: IPubPropertyCategory[]) => {
          setPropertyCategories(context, propertyCategories);
        });
    },
    async reset(context: ActionContext<State, any>) {
      setFormModel(context, null);
      setMarketRadarModel(context, null);
      setAds(context, []);
      setSelectedAd(context, null);
      setBuildingInfo(context, null);
      setSimilarObjects(context, []);
      state.prediction = new Prediction();
      state.statistics = new Statistics();
    },
  },
};

const { commit, read, dispatch } = getStoreAccessors<State, any>('marketRadarModule');

const getters = marketRadarModule.getters;
export const getFormModel = read(getters.getFormModel);
export const getMarketRadarModel = read(getters.getSearchModel);
export const getAds = read(getters.getAds);
export const getBookmarks = read(getters.getBookmarks);
export const getHistory = read(getters.getHistory);
export const getBuildingInfo = read(getters.getBuildingInfo);
export const getSelectedAd = read(getters.getSelectedAd);
export const getSimilarObjects = read(getters.getSimilarObjects);
export const getPricePrediction = read(getters.getPricePrediction);
export const getStatistics = read(getters.getStatistics);
export const getPropertyCategories = read(getters.getPropertyCategories);
export const getEntranceRatings = read(getters.getEntranceRatings);
export const getPoiCategories = read(getters.getPoiCategories);

const mutations = marketRadarModule.mutations;
export const setFormModel = commit(mutations.setFormModel);
export const setMarketRadarModel = commit(mutations.setSearchModel);
export const setAds = commit(mutations.setAds);
export const setBookmarks = commit(mutations.setBookmarks);
export const setHistory = commit(mutations.setHistory);
export const addHistoryEntry = commit(mutations.addHistoryEntry);
export const removeHistoryEntry = commit(mutations.removeHistoryEntry);
export const addBookmarkEntry = commit(mutations.addBookmarkEntry);
export const removeBookmarkEntry = commit(mutations.removeBookmarkEntry);
export const setBuildingInfo = commit(mutations.setBuildingInfo);
export const setSelectedAd = commit(mutations.setSelectedAd);
export const setSimilarObjects = commit(mutations.setSimilarObjects);
export const setPredictionIsLoading = commit(mutations.setPredictionIsLoading);
export const setPredictionAds = commit(mutations.setPredictionAds);
export const setPredictionTransaction = commit(mutations.setPredictionTransaction);
export const setPredictionStatistics = commit(mutations.setPredictionStatistics);
export const setCountryStatisticModel = commit(mutations.setCountryStatisticModel);
export const setCantonStatisticModel = commit(mutations.setCantonStatisticModel);
export const setAdsStatisticModel = commit(mutations.setAdsStatisticModel);
export const setMarketAnyStatisticModel = commit(mutations.setMarketAnyStatisticModel);
export const setMarketOnlyActiveStatisticModel = commit(mutations.setMarketOnlyActiveStatisticModel);
export const setPropertyCategories = commit(mutations.setPropertyCategories);
export const setEntranceRatings = commit(mutations.setEntranceRatings);
export const setPoiCategories = commit(mutations.setPoiCategories);

const actions = marketRadarModule.actions;
export const dispatchGetHistory = dispatch(actions.getHistory);
export const dispatchRemoveAllHistory = dispatch(actions.removeAllHistory);
export const dispatchRemoveHistoryEntry = dispatch(actions.actionRemoveHistoryEntry);
export const dispatchGetBookmarks = dispatch(actions.getBookmarks);
export const dispatchToggleIsFavoriteHistoryEntry = dispatch(actions.toggleIsFavoriteHistoryEntry);
export const dispatchEditBookmarkEntryName = dispatch(actions.editBookmarkEntryName);
export const dispatchRemoveAllBookmarks = dispatch(actions.removeAllBookmarks);
export const dispatchCreateHistoryEntry = dispatch(actions.createHistoryEntry);
export const dispatchGetPropertyCategories = dispatch(actions.getPropertyCategories);
export const dispatchReset = dispatch(actions.reset);
