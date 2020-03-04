import { getStoreAccessors } from 'vuex-typescript';
import Vue from 'vue';
import * as api from '@immosparrow/cockpit-api-v2';
import { ActionContext } from 'vuex';
import { showSuccessMessage } from '../index';
import { FilterOptionModel } from '../../models/global';

class InboxFilters {
  sortFilter: { value: string, text: string, label: string };
  vendorFilters: Array<FilterOptionModel>;
  onlyActive: boolean;
}

class State {
  inboxes: api.IEntitySearchResult<api.ILeadListLightModel>;
  leadsListIds: string[];
  inboxFilters: InboxFilters;
}

const state: State = {
  inboxes: null,
  leadsListIds: [],
  inboxFilters: {
    sortFilter: { value: '', text: '', label: '' },
    vendorFilters: [],
    onlyActive: false,
  },
};

const namespaced = true;

export const leadsModule = {
  namespaced,
  state,
  getters: {
    getInboxes: (state: State) => {
      return state.inboxes;
    },
    getInboxFilters: (state: State) => {
      return state.inboxFilters;
    },
  },
  mutations: {
    setInboxes (state: State, inboxes: api.IEntitySearchResult<api.ILeadListLightModel>) {
      state.inboxes = inboxes;
    },
    setInboxFilters (state: State, inboxFilters: InboxFilters) {
      state.inboxFilters = inboxFilters;
    },
    resetState: (s: State) => {
      const initial = state;
      Object.keys(initial).forEach((key) => {
        if (key !== 'inboxFilters') {
          s[key] = initial[key];
        }
      });
    },
  },
  actions: {
    async getLeadById (context: ActionContext<State, any>, leadId: string) {
      return await api.$lead(leadId).get();
    },
    async updateLeadStatus (context: ActionContext<State, any>, data: {id: string, status: api.LeadStatus}) {
      return await api.$lead(data.id).updateStatus(data.status);
    },
    async getLeadsList (context: ActionContext<State, any>, query: api.ILeadQuery) {
      const { page } = query;
      // front-end pagination

      if (0 === page) {
        delete query.page;
        query.sourceTypes = -1;
        query.maxItemCount = 500;

        const { items } = await api.$leads.findIds(query);
        state.leadsListIds = items;
      }
      const startFromElement = page * 10;
      const rangeGet = state.leadsListIds.slice(startFromElement, startFromElement + 10);
      const countItems = state.leadsListIds.length;

      const unsortedItems = startFromElement < countItems ? await api.$leads.getMultiple(rangeGet) : [];

      const leadsByIdDict = unsortedItems.reduce((map: any, obj: any) => {
        map[obj.id] = obj;
        return map;
      },                                         {});

      const items = rangeGet.map((x: any) => leadsByIdDict[x]);

      const leads = {
        items,
        page,
        pageCount: Math.ceil(countItems / 10),
        totalItemCount: countItems,
      };

      return leads;
    },
    async updateLeadListName (context: ActionContext<State, any>, data: { id: string, name: string }) {
      return await api.$leadList(data.id).updateName(data.name);
    },
    async deactivateInbox (context: ActionContext<State, any>, data: { id: string, isEnabled: boolean }) {
      return await api.$leadList(data.id).updateIsEnabled(data.isEnabled);
    },
    async getInboxes (context: ActionContext<State, any>) {
      const inboxes: api.IEntitySearchResult<api.ILeadListLightModel> = await api.$leadLists.find(new api.EntitySearchQuery());
      commitSetInboxes(context, inboxes);
      return inboxes;
    },
    async getLeadsListById (context: ActionContext<State, any>, id: string) {
      return await api.$leadList(id).get();
    },
    async updateLeadsList (context: ActionContext<State, any>, data: { id: string, leadsList: api.ILeadListModel }) {
      return await api.$leadList(data.id).update(data.leadsList);
    },
    async createLeadsList (context: ActionContext<State, any>, leadsList: api.ILeadListModel) {
      return await api.$leadLists.create(leadsList);
    },
    async deleteLeadsList (context: ActionContext<State, any>, id: string) {
      return await api.$leadList(id).delete();
    },
    async sendLeads (context: ActionContext<State, any>, data: { leadIds: string[], mailMessage: api.TemplatedMailMessageRequest }) {
      const result = await api.$leads.send(data.leadIds, data.mailMessage);
      showSuccessMessage('Leads successfully sent to the client');
      return result;
    },
  },
};

const { commit, read, dispatch } =
  getStoreAccessors<State, any>('leadsModule');

const getters = leadsModule.getters;
export const getInboxes = read(getters.getInboxes);
export const getInboxFilters = read(getters.getInboxFilters);

const mutations = leadsModule.mutations;
export const commitSetInboxes = commit(mutations.setInboxes);
export const commitSetInboxFilters = commit(mutations.setInboxFilters);

export const commitResetState = commit(mutations.resetState);

const actions = leadsModule.actions;
export const dispatchGetLead = dispatch(actions.getLeadById);
export const dispatchGetLeadsList = dispatch(actions.getLeadsList);
export const dispatchUpdateLeadStatus = dispatch(actions.updateLeadStatus);
export const dispatchCreateLeadsList = dispatch(actions.createLeadsList);
export const dispatchGetLeadsListById = dispatch(actions.getLeadsListById);
export const dispatchSendLeads = dispatch(actions.sendLeads);
export const dispatchUpdateLeadsList = dispatch(actions.updateLeadsList);
export const dispatchDeleteLeadsList = dispatch(actions.deleteLeadsList);
export const dispatchGetInboxes = dispatch(actions.getInboxes);
export const dispatchUpdateLeadListName = dispatch(actions.updateLeadListName);
export const dispatchDeactivateInbox = dispatch(actions.deactivateInbox);
