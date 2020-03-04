import { getStoreAccessors } from 'vuex-typescript';
import * as api from '@immosparrow/cockpit-api-v2';
import store from '../../store';
import { ActionContext } from 'vuex';

class FindModel {
  query: api.IPubQuery;
  fields?: api.PubLightModelFields;
  maxItemCount?: number;
}

class State {
  propertyTypes: api.IPubPropertyCategory[];
  realEstatePortals: api.IPubSiteModel[];
  competitors: api.IPubPublisherModel[];
  searchData: FindModel;
  statusDBModal: boolean;
}

const state: State = {
  propertyTypes: [],
  realEstatePortals: [],
  competitors: [],
  searchData: new FindModel(),
  statusDBModal: false,
};
const namespaced = true;

export const searchModule = {
  namespaced,
  state,
  getters: {
    propertyTypes: (state: State) => {
      return state.propertyTypes;
    },
    realEstatePortals: (state: State) => {
      return state.realEstatePortals;
    },
    competitors: (state: State) => {
      return state.competitors;
    },
    searchData: (state: State) => {
      return state.searchData;
    },
    statusDBModal: (state: State) => {
      return state.statusDBModal;
    },
  },
  mutations: {
    setPropertyTypes (state: State, propertyTypes: api.IPubPropertyCategory[]) {
      state.propertyTypes = propertyTypes;
    },
    setRealEstatePortals (state: State, realEstatePortals: api.IPubSiteModel[]) {
      state.realEstatePortals = realEstatePortals;
    },
    setCompetitors (state: State, competitors: api.IPubPublisherModel[]) {
      state.competitors = competitors;
    },
    setStatusDBModal (state: State, newStatus: boolean) {
      state.statusDBModal = newStatus;
    },
    setSearchData (state: State, searchData: FindModel) {
      state.searchData = new FindModel;
      state.searchData = searchData;
    },
    resetState: (s: State) => {
      const initial = state;
      Object.keys(initial).forEach((key) => { s[key] = initial[key]; });

      // make property types always available, we reset this search module on bunch occasions and for now
      // this is only way to get that resolved
      dispatchGetPropertyTypes(store);
    },
  },
  actions: {
    async find (context: ActionContext<State, any>, data: FindModel) {
      commitSetSearchData(context, data);
    },
    async findCoordinates (context: ActionContext<State, any>, data: FindModel) {
      commitSetSearchData(context, data);
    },
    async getPubById (context: ActionContext<State, any>, id: string) {
      return await api.$publication(id).get();
    },
    async getRealEstatePortals (context: ActionContext<State, any>) {
      const pubSources: api.IPubSiteModel[] = await api.$pubs.getPublicationSites();
      const onlyActive = pubSources.filter((p) => {
        return p.isActive;
      });
      commitSetRealEstatePortals(context, onlyActive);
    },
    async getCompetitors (context: ActionContext<State, any>) {
      const competitors: api.IPubPublisherModel[] = await api.$pubs.getTopPublishers();
      commitSetCompetitors(context, competitors);
    },
    async getPropertyTypes (context: ActionContext<State, any>) {
      const properties: api.IPubPropertyCategory[] = await api.$pubs.getPropertyCategories();
      commitSetPropertyTypes(context, properties);
    },
    async getPredictedPrice (context: ActionContext<State, any>, id: string) {
      return await api.$publication(id).getPricePrediction();
    },
  },
};

const { commit, read, dispatch } =
  getStoreAccessors<State, any>('searchModule');

const mutations = searchModule.mutations;
export const commitSetPropertyTypes = commit(mutations.setPropertyTypes);
export const commitSetRealEstatePortals = commit(mutations.setRealEstatePortals);
export const commitSetSearchData = commit(mutations.setSearchData);
export const commitSetCompetitors = commit(mutations.setCompetitors);
export const commitSetStatusDBModal = commit(mutations.setStatusDBModal);
export const commitResetState = commit(mutations.resetState);

const actions = searchModule.actions;
export const dispatchFind = dispatch(actions.find);
export const dispatchFindCoordinates = dispatch(actions.findCoordinates);
export const dispatchGetPropertyTypes = dispatch(actions.getPropertyTypes);
export const dipsatchGetRealEstatePortals = dispatch(actions.getRealEstatePortals);
export const dipsatchGetCompetitors = dispatch(actions.getCompetitors);
export const dispatchGetPredictedPrice = dispatch(actions.getPredictedPrice);
export const dispatchGetPubById = dispatch(actions.getPubById);

const getters = searchModule.getters;
export const getPropertyTypes = read(getters.propertyTypes);
export const getCompetitors = read(getters.competitors);
export const getRealEstatePortals = read(getters.realEstatePortals);
export const getSearchData = read(getters.searchData);
export const getStatusDBModal = read(getters.statusDBModal);
