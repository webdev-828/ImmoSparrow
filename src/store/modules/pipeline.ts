import { getStoreAccessors } from 'vuex-typescript';
import {
  IPipelineModel, IPipelineLightModel, IEntitySearchResult,
  EntitySearchQuery, $pipelines,
 } from '@immosparrow/cockpit-api-v2';
import { ActionContext } from 'vuex';
import { FilterDropdownModel } from '@/components/shared/filterDropdown/model';
class PipeFilters {
  ownerFilter: FilterDropdownModel;
  entryFilter: FilterDropdownModel;
  entryState: boolean;
}

class State {
  selectedPipeline: IPipelineModel;
  pipelines: IEntitySearchResult<IPipelineLightModel>;
  pipeFilters: PipeFilters;
}

const state: State = {
  selectedPipeline: null,
  pipelines: null,
  pipeFilters: {
    ownerFilter: null,
    entryFilter: null,
    entryState: false,
  },
};
const namespaced = true;

export const pipelineModule = {
  namespaced,
  state,
  getters: {
    selectedPipeline: (state: State) => {
      return state.selectedPipeline;
    },
    getPipelines: (state: State) => {
      return state.pipelines;
    },
    getPipeFilters: (state: State) => {
      return state.pipeFilters;
    },
  },
  mutations: {
    setSelectedPipeline (state: State, selectedPipeline: IPipelineModel) {
      state.selectedPipeline = selectedPipeline;
    },
    setPipelines (state: State, pipelines: IEntitySearchResult<IPipelineLightModel>) {
      state.pipelines = pipelines;
    },
    setPipeFilters (state: State, pipeFilters: PipeFilters) {
      state.pipeFilters = pipeFilters;
    },
    resetState: (s: State) => {
      const initial = state;
      Object.keys(initial).forEach((key) => {
        if (key !== 'pipeFilters') {
          s[key] = initial[key];
        }
      });
    },
  },
  actions: {
    async getPipelines (context: ActionContext<State, any>, query: EntitySearchQuery) {
      query.text = '';
      const pipelines: IEntitySearchResult<IPipelineLightModel> = await $pipelines.find(query);
      commitSetPipelines(context, pipelines);
      return pipelines;
    },
  },
};

const { commit, read, dispatch } =
  getStoreAccessors<State, any>('pipelineModule');

const mutations = pipelineModule.mutations;
export const commitSetSelectedPipeline = commit(mutations.setSelectedPipeline);
export const commitSetPipelines = commit(mutations.setPipelines);
export const commitSetPipeFilters = commit(mutations.setPipeFilters);
export const commitResetState = commit(mutations.resetState);

const actions = pipelineModule.actions;
export const dispatchGetPipelines = dispatch(actions.getPipelines);

const getters = pipelineModule.getters;
export const getSelectedPipeline = read(getters.selectedPipeline);
export const getPipelines = read(getters.getPipelines);
export const getPipeFilters = read(getters.getPipeFilters);
