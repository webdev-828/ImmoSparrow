import { getStoreAccessors } from 'vuex-typescript';
import * as api from '@immosparrow/cockpit-api-v2';
import { ActionContext } from 'vuex';

class State {
  selectedEntrance: api.EntranceLightModel;
  selectedBuilding: api.BuildingModel;
  selectedAd: api.PubModel;
}
const state: State = {
  selectedEntrance: null,
  selectedBuilding: null,
  selectedAd: null,
};
const namespaced = true;

export const pricePredictionModule = {
  namespaced,
  state,
  getters: {
    getSelectedEntrance: (state: State) => {
      return state.selectedEntrance;
    },
    getSelectedBuilding: (state: State) => {
      return state.selectedEntrance;
    },
    getSelectedAd: (state: State) => {
      return state.selectedAd;
    },
  },
  mutations: {
    setSelectedBuilding (state: State, selectedBuilding: api.BuildingModel) {
      state.selectedBuilding = selectedBuilding;
    },
    setSelectedEntrance (state: State, selectedEntrance: api.EntranceLightModel) {
      state.selectedEntrance = selectedEntrance;
    },
    setSelectedAd (state: State, selectedAd: api.PubModel) {
      state.selectedAd = selectedAd;
    },
  },
  actions: {
    async getBuilding (context: ActionContext<State, any>, query: api.EntitySearchQuery) {
      query.text = '';
      const building = new api.BuildingModel();
      commitSetSelectedBuilding(context, building);
      return building;
    },
    async getEntrance (context: ActionContext<State, any>, query: api.EntitySearchQuery) {
      query.text = '';
      const entrance = new api.EntranceLightModel();
      commitSetSelectedEntrance(context, entrance);
      return entrance;
    },
  },
};

const { commit, read, dispatch } =
  getStoreAccessors<State, any>('pricePredictionModule');

const mutations = pricePredictionModule.mutations;
export const commitSetSelectedBuilding = commit(mutations.setSelectedBuilding);
export const commitSetSelectedEntrance = commit(mutations.setSelectedEntrance);
export const commitSetSelectedAd = commit(mutations.setSelectedAd);

const actions = pricePredictionModule.actions;
export const dispatchGetBuilding = dispatch(actions.getBuilding);
export const dispatchGetEntrance = dispatch(actions.getEntrance);

const getters = pricePredictionModule.getters;
export const getSelectedBuilding = read(getters.getSelectedBuilding);
export const getSelectedEntrance = read(getters.getSelectedEntrance);
export const getSelectedAd = read(getters.getSelectedAd);
