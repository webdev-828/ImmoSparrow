import { getStoreAccessors } from 'vuex-typescript';
import { MapPoint, ViewPort } from '@/models';

class State {
  isLoaded: boolean;
  mapPoint: MapPoint;
  lastViewPort: ViewPort;
}

export const state: State = {
  isLoaded: false,
  mapPoint: null,
  lastViewPort: null,
};

const namespaced = true;
export const mapModule = {
  namespaced,
  state,
  getters: {
    getIsMapLoaded(state: State) {
      return state.isLoaded;
    },
    getMapPoint(state: State) {
      return state.mapPoint;
    },
    getLastViewPort(state: State) {
      return state.lastViewPort;
    },
  },
  mutations: {
    setIsMapLoaded(state: State, value: boolean) {
      state.isLoaded = value;
    },
    setMapPoint(state: State, point: MapPoint) {
      state.mapPoint = point;
    },
    setLastViewPort(state: State, viewPort: ViewPort) {
      state.lastViewPort = viewPort;
    },
  },
};

const { read, commit } = getStoreAccessors<State, any>('mapModule');

const getters = mapModule.getters;
export const getIsMapLoaded = read(getters.getIsMapLoaded);
export const getMapPoint = read(getters.getMapPoint);
export const getLastViewPort = read(getters.getLastViewPort);

const mutations = mapModule.mutations;
export const setIsMapLoaded = commit(mutations.setIsMapLoaded);
export const setMapPoint = commit(mutations.setMapPoint);
export const setLastViewPort = commit(mutations.setLastViewPort);
