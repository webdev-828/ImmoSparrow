import { getStoreAccessors } from 'vuex-typescript';
import router from '../../router';
import store from '../../store';
import { ActionContext } from 'vuex';
import * as globalState from './../../store/modules/globalStatesModule';
import * as search_ from './../../store/modules/searchStatesModule';
import * as searchModule from './../../store/modules/searchModule';
import * as adminStates from './../../store/modules/adminModule';
import * as api from '@immosparrow/cockpit-api-v2';
import * as leadsModule from './leads';
import * as pipelineModule from './pipeline';
import * as history from './history';

export interface Permissions {
  property: string;
}
export interface RegisterModel {
  profile: api.IUserProfileModel;
  password: string;
  proof: api.IUserRegistrationProof;
}
class State {
  loginError: boolean;
  loggedInUser: api.IUserProfileModel;
  userContext: api.IUserContextModel;
  userAgency: api.IUserAgencyModel;
  employeeContext: api.IUserWorkspaceContextModel;
  superviseMode: boolean;
  lang: string;
  dataNoEmployee: { pageName: string, moduleName: string } | undefined;
}

interface IupdateAgencyLight {
  id: string;
  name: string;
  address: api.IModifiableAddress;
  contactInfo: api.IAgencyContactInfo;
  logo: api.IImageInfo | undefined;
}
const sleep = (ms: number) => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

export const state: State = {
  loginError: false,
  loggedInUser: null,
  userContext: null,
  userAgency: null,
  employeeContext: null,
  lang: 'en',
  superviseMode: false,
  dataNoEmployee: null,
};
const namespaced = true;

export const authStatesModule = {
  namespaced,

  state,
  getters: {
    lang: (state: State) => {
      return state.lang;
    },
    loginError: (state: State) => {
      return state.loginError;
    },
    loggedInUser: (state: State) => {
      return state.loggedInUser;
    },
    userContext: (state: State) => {
      return state.userContext;
    },
    userAgency: (state: State) => {
      return state.userAgency;
    },
    employeeContext: (state: State) => {
      return state.employeeContext;
    },
    superviseMode: (state: State) => {
      return state.superviseMode;
    },
    dataNoEmployee: (state: State) => {
      return state.dataNoEmployee;
    },
  },
  mutations: {
    updateFAndLNames(state: State, { firstName, lastName }: { firstName: string, lastName: string }) {
      state.userContext.identity.firstName = firstName;
      state.userContext.identity.lastName = lastName;
    },
    updateLang(state: State, newLang: string) {
      window['Localize'].setLanguage(newLang);
      localStorage.setItem('lang', newLang);
      state.lang = newLang;
      api.$authUser.language = newLang;
    },
    updateAvatar(state: State, photo: api.IImageInfo | undefined) {
      state.userContext.photo = photo;
    },
    updateAgencyLight(state: State, { id, name, address, contactInfo, logo }: IupdateAgencyLight) {
      state.userAgency.agency.address = address;
      state.userAgency.agency.name = name;
      state.userAgency.agency.contactInfo = contactInfo;
      state.userAgency.agency.logo = logo;

      const wsIndexInList = state.userContext.agencies.map(({ agency }) => agency.id).indexOf(id);
      if (wsIndexInList !== -1) {
        state.userContext.agencies[wsIndexInList].agency.name = name;
        state.userContext.agencies[wsIndexInList].agency.logo = logo;
      }
    },
    setLoggedInUser (state: State, user: api.IUserProfileModel) {
      state.loggedInUser = user;
    },
    loggedOut (state: State) {
      globalState.commitResetState(store);
      search_.commitResetState(store);
      adminStates.commitResetState(store);
      searchModule.commitResetState(store);
      leadsModule.commitResetState(store);
      pipelineModule.commitResetState(store);
      history.commitResetState(store);
      router.push('/login');
    },
    loginError (state: State, message: boolean) {
      state.loginError = message;
    },
    setUserContext (state: State, context: api.IUserContextModel) {
      state.userContext = context;
    },
    setEmployeeContext (state: State, context: api.IUserWorkspaceContextModel) {
      state.employeeContext = context;
    },
    setUserAgency (state: State, userAgency: api.IUserAgencyModel) {
      state.userAgency = userAgency;
    },
    setSuperviseMode (state: State, superviseMode: boolean) {
      state.superviseMode = superviseMode;
    },
    setNoEmployeeStatus(state: State, dataNoEmployee: { pageName: string, moduleName: string }) {
      state.dataNoEmployee = dataNoEmployee;
    },
    resetState: (s: State) => {
      const initial = state;
      Object.keys(initial).forEach((key) => {
        s[key] = initial[key];
      });
    },
  },
  actions: {
    async login(context: ActionContext<State, any>, data: api.UserPasswordCredential) {
      await api.$anonymousUser.profile.login(data.email, data.password, data.persistent)
        .then((value: boolean) => {
          if (value) {
            api.$authUser.profile.get().then((profile: api.IUserProfileModel) => {
              commitSetLoggedInUser(store, profile);
              return value;
            });
          } else {
            commitLoginError(store, true);
            return;
          }
        });
    },
    logout ({ commit }: any) {

      return new Promise((resolve, reject) => {
        commitLoggedOut(store);
        commitResetState(store);
        api.$authUser.logout();
        localStorage.removeItem('api.data');
        localStorage.removeItem('api.auth.data');
        commitSetEmployeeContext(store, null);
        router.push({ path: '/login' });
        resolve();
      });
    },
    async register(context: ActionContext<State, any>, registerData: RegisterModel) {
      return await api.$anonymousUser.profile.register(registerData.profile, registerData.password, registerData.proof);
    },
  },
};

const { commit, read, dispatch } =
  getStoreAccessors<State, any>('authStatesModule');

const mutations = authStatesModule.mutations;
export const commitLoggedOut = commit(mutations.loggedOut);
export const commitLoginError = commit(mutations.loginError);
export const commitSetUserContext = commit(mutations.setUserContext);
export const commitUpdateFAndLNames = commit(mutations.updateFAndLNames);
export const commitUpdateLang = commit(mutations.updateLang);
export const commitUpdateAgencyLight = commit(mutations.updateAgencyLight);
export const commitSetUserAgency = commit(mutations.setUserAgency);
export const commitSetLoggedInUser = commit(mutations.setLoggedInUser);
export const commitSetEmployeeContext = commit(mutations.setEmployeeContext);
export const commitSetSuperviseMode = commit(mutations.setSuperviseMode);
export const commitResetState = commit(mutations.resetState);
export const commitUpdateAvatar = commit(mutations.updateAvatar);
export const commitSetNoEmployeeStatus = commit(mutations.setNoEmployeeStatus);

const actions = authStatesModule.actions;
export const dispatchLogin = dispatch(actions.login);
export const dispatchLogout = dispatch(actions.logout);
export const dispatchRegisterUser = dispatch(actions.register);

const getters = authStatesModule.getters;
export const getLoginError = read(getters.loginError);
export const getLoggedInUser = read(getters.loggedInUser);
export const getUserAgency = read(getters.userAgency);
export const getUserContext = read(getters.userContext);
export const getSuperviseMode = read(getters.superviseMode);
export const getEmployeeContext = read(getters.employeeContext);
export const getLang = read(getters.lang);
export const getDataNoEmployee = read(getters.dataNoEmployee);
