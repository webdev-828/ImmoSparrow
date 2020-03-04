import { getStoreAccessors } from 'vuex-typescript';

class ISidebar {
  enabled?: boolean;
  shown: boolean;
  activeTab: {
    level1: string,
    level2: string,
    level3: string,
    level4: string,
  };
}

class State {
  leftSidebar: ISidebar;
  rightSidebar: ISidebar;
}

function getTarget(isRight: boolean): string {
  return isRight ? 'rightSidebar' : 'leftSidebar';
}

export const state: State = {
  leftSidebar: {
    shown: true,
    activeTab: {
      level1: null,
      level2: null,
      level3: null,
      level4: null,
    },
  },
  rightSidebar: {
    enabled: false,
    shown: false,
    activeTab: {
      level1: null,
      level2: null,
      level3: null,
      level4: null,
    },
  },
};

const namespaced = true;
export const sidebarsModule = {
  namespaced,
  state,
  getters: {
    getIsEnabledRightSidebar(state: State) {
      return state.rightSidebar.enabled;
    },
    getIsShownLeftSidebar(state: State) {
      return state.leftSidebar.shown;
    },
    getIsShownRightSidebar(state: State) {
      return state.rightSidebar.shown;
    },
    getLeftSidebarActiveTab(state: State) {
      return state.leftSidebar.activeTab;
    },
    getRightSidebarActiveTab(state: State) {
      return state.rightSidebar.activeTab;
    },
  },
  mutations: {
    setIsEnabledRightSidebar(state: State, value: boolean) {
      state.rightSidebar.enabled = value;
    },
    setSidebarState(state: State, payload: { visible: boolean, isRight?: boolean }) {
      state[getTarget(payload.isRight)].shown = payload.visible;
    },
    toggleSidebar(state: State, isRight: boolean) {
      const target = getTarget(isRight);
      const isOpen = state[target].shown;
      state[target].shown = !isOpen;
    },
    setSidebarActiveTab(state: State, payload: { tabName: string, level: number, isRight?: boolean }) {
      const level = payload.level;
      const target = getTarget(payload.isRight);
      if (level >= 1 && level <= 4) {
        state[target].activeTab[`level${level}`] = payload.tabName;
      }
    },
  },
};

const { commit, read } = getStoreAccessors<State, any>('sidebarsModule');

const getters = sidebarsModule.getters;
export const getIsEnabledRightSidebar = read(getters.getIsEnabledRightSidebar);
export const getIsShownLeftSidebar = read(getters.getIsShownLeftSidebar);
export const getLeftSidebarActiveTab = read(getters.getLeftSidebarActiveTab);
export const getIsShownRightSidebar = read(getters.getIsShownRightSidebar);
export const getRightSidebarActiveTab = read(getters.getRightSidebarActiveTab);

const mutations = sidebarsModule.mutations;
export const setIsEnabledRightSidebar = commit(mutations.setIsEnabledRightSidebar);
export const setSidebarState = commit(mutations.setSidebarState);
export const toggleSidebar = commit(mutations.toggleSidebar);
export const setSidebarActiveTab = commit(mutations.setSidebarActiveTab);
