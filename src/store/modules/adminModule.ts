import { getStoreAccessors } from 'vuex-typescript';
import {
    IAgencyModel, $agency,
    UserModel, $user,
    IEmployeeModel, $employee,
} from '@immosparrow/cockpit-api-v2';
import { ActionContext } from 'vuex';

class State {
  agency: IAgencyModel;
  savedAgency: IAgencyModel;
  savedUser: UserModel;
  savedEmployee: IEmployeeModel;
}

const state: State = {
  agency: null,
  savedAgency: null,
  savedUser: null,
  savedEmployee: null,
};

const namespaced = true;

export const adminStates = {
  namespaced,

  state,
  getters: {
    agency: (state: State) => {
      return state.agency;
    },
    savedAgency: (state: State) => {
      return state.savedAgency;
    },
    savedUser: (state: State) => {
      return state.savedUser;
    },
    savedEmployee: (state: State) => {
      return state.savedEmployee;
    },
  },
  mutations: {
    setAgency (state: State, agency: IAgencyModel) {
      state.agency = agency;
    },
    setSavedAgency (state: State, agency: IAgencyModel) {
      state.savedAgency = agency;
    },
    setSavedUser (state: State, user: UserModel) {
      state.savedUser = user;
    },
    setSavedEmployee (state: State, employee: IEmployeeModel) {
      state.savedEmployee = employee;
    },
    resetState: (s: State) => {
      const initial = state;
      Object.keys(initial).forEach((key) => { s[key] = initial[key]; });
    },
  },
  actions: {
    async getAgencyByIdAndSave (context: ActionContext<State, any>, agencyId: string) {
      const agency: any = await $agency(agencyId).get();
      await commitSetSavedAgency(context, agency);
    },
    async getAgencyById (context: ActionContext<State, any>, agencyId: string) {
      const agency: IAgencyModel = await $agency(agencyId).get();
      await commitSetAgency(context, agency);
      return agency;
    },
    async getSavedUser (context: ActionContext<State, any>, userId: string) {
      const user: UserModel = await $user(userId).get();
      commitSavedUser(context, user);
    },
    async getEmployeeByIdAndSave (context: ActionContext<State, any>, employeeId: string) {
      const employee = await $employee(employeeId).get();
      commitSetSavedEmployee(context, employee);
    },
  },
};

const { commit, read, dispatch } =
  getStoreAccessors<State, any>('adminStates');

const mutations = adminStates.mutations;
export const commitSetAgency = commit(mutations.setAgency);
export const commitSetSavedAgency = commit(mutations.setSavedAgency);
export const commitResetState = commit(mutations.resetState);
export const commitSavedUser = commit(mutations.setSavedUser);
export const commitSetSavedEmployee = commit(mutations.setSavedEmployee);

const actions = adminStates.actions;
export const dispatchGetAgency = dispatch(actions.getAgencyById);
export const dispatchGetAgencyAndSave = dispatch(actions.getAgencyByIdAndSave);
export const dispatchGetSavedUser = dispatch(actions.getSavedUser);
export const dispatchGetEmployeeByIdAndSave = dispatch(actions.getEmployeeByIdAndSave);

const getters = adminStates.getters;
export const getAgency = read(getters.agency);
export const getSavedAgency = read(getters.savedAgency);
export const getSavedUser = read(getters.savedUser);
export const getSavedEmployee = read(getters.savedEmployee);
