import Vue from 'vue';
import { Component } from 'vue-property-decorator';
import template from './Vendors.vue';
import { MasterDetails, LegalPersonDetails } from '../../components/legalPerson';
import {
  IEntitySearchResult, ILegalPersonLightModel, ILegalPersonMasterLightModel,
  ILegalPersonMasterModel, $legalPersons, LegalPersonStatus, $newObj,
  LegalPersonMasterLightModel, LegalPersonMasterModel, $legalPersonMaster,
  ModifiableAddress, LegalPersonContactInfo,
} from '@immosparrow/cockpit-api-v2';
import Base from '../../components/base';
import Debounce from 'debounce-decorator';
import { SingleCall } from '../../components/call';

@Component({
  mixins: [template],
  components: { MasterDetails, LegalPersonDetails },
})

export default class Vendors extends Base {
  modal = {
    master: false,
    legal: false,
  };
  legalPersons: ILegalPersonLightModel[] = [];
  masterLegalPersons: ILegalPersonMasterLightModel[] = [];

  currentMaster: ILegalPersonMasterModel;
  legalPerson: ILegalPersonLightModel;

  linkedLegalPersons: string[] = [];
  linkedMaster: string = null;

  filterMaster: ILegalPersonMasterLightModel = $newObj(LegalPersonMasterLightModel);

  mounted() {
    this.getLegalPersons(0);
    this.getLegalPersonsMasters();
  }

  getLegalPersons(status?: LegalPersonStatus, masterId?: string) {
    const maxItemCount = 500;
    $legalPersons.find({ maxItemCount, status, masterId })
      .then((newLegalPersons: IEntitySearchResult<ILegalPersonLightModel>) => {
        this.legalPersons = newLegalPersons.items;
      });
  }

  getLegalPersonsMasters() {
    $legalPersons.masters.find({ maxItemCount: 500 })
      .then((newMasterLegalPersons: IEntitySearchResult<ILegalPersonMasterLightModel>) => {
        this.masterLegalPersons = newMasterLegalPersons.items;
      });
  }

  closeModal(type: string) {
    if (type !== 'all') {
      this.modal[type] = false;
    } else {
      Object.keys(this.modal).forEach(key => this.modal[key] = false);
    }
  }

  async masterSubmit(currentMaster: ILegalPersonMasterModel) {
    const { id } = currentMaster;
    if (id) {
      await $legalPersonMaster(id).update(currentMaster)
        .then(() => {
          this.getLegalPersonsMasters();
          this.closeModal('master');
          this.showSuccessMessage('Legal person master was updated!');
        });
    } else {
      $legalPersons.masters.create(currentMaster)
        .then(() => {
          this.getLegalPersonsMasters();
          this.closeModal('master');
          this.showSuccessMessage('Legal person master was created!');
        });
    }
  }

  legalPersonDetail(legalPerson: ILegalPersonLightModel) {
    this.closeModal('all');
    this.legalPerson = legalPerson;
    this.modal.legal = true;
  }

  async legalPersonMasterDetail(id?: string) {
    if (id) {
      this.currentMaster = await $legalPersonMaster(id).get();
    } else {
      this.currentMaster = $newObj(LegalPersonMasterModel);
      this.currentMaster.address = $newObj(ModifiableAddress);
      this.currentMaster.contactInfo = $newObj(LegalPersonContactInfo);
    }
    this.modal.master = true;
  }

  toggleLinkedLP(id: string) {
    const idIndex = this.linkedLegalPersons.findIndex(lp => lp === id);
    if (idIndex === -1) {
      this.linkedLegalPersons.push(id);
    } else {
      this.linkedLegalPersons.splice(idIndex, 1);
    }
  }

  toggleLinkedMaster(id: string) {
    this.linkedMaster = this.linkedMaster === id ? null : id;
  }

  async linkItems() {
    switch (true) {
      case (!this.linkedMaster && this.linkedLegalPersons.length === 0)
      : this.showErrorMessage('Please, select master and one or more legal persons');
        break;
      case (this.linkedLegalPersons.length === 0)
      : this.showErrorMessage('Please, select one or more legal persons');
        break;
      case (!this.linkedMaster)
      : this.showErrorMessage('Please, select master');
        break;
      default
      :
        await this.setLinkedLegalPersons();
        this.getPersonsFilter();
    }
  }

  async unlinkItems() {
    if (this.linkedLegalPersons.length === 0) {
      this.showErrorMessage('Please, select one or more legal persons');
    } else {
      await this.unlinkLegalPersons();
      this.getPersonsFilter();
    }
  }

  getPersonsFilter() {
    const { id } = this.filterMaster;
    if (id) {
      this.getLegalPersons(undefined, id);
    }
  }

  async setLinkedLegalPersons() {
    await $legalPersonMaster(this.linkedMaster).linkLegalPersons(this.linkedLegalPersons);
    this.getLegalPersonsMasters();
    this.linkedLegalPersons = [];
    this.linkedMaster = null;
    this.showSuccessMessage('Legal persons was successfully linked');
  }

  async unlinkLegalPersons() {
    await $legalPersons.masters.unlinkLegalPersons(this.linkedLegalPersons);
    this.getLegalPersonsMasters();
    this.linkedLegalPersons = [];
    this.linkedMaster = null;
    this.showSuccessMessage('Legal persons was successfully unlinked, out of their masters');
  }

  filterByMaster(master: ILegalPersonMasterLightModel) {
    if (master.id !== this.filterMaster.id) {
      this.getLegalPersons(undefined, master.id);
      this.filterMaster = master;
    } else {
      this.getLegalPersons(0);
      this.filterMaster = $newObj(LegalPersonMasterModel);
    }
  }

  filterList(type: string, { val, text }: { val: LegalPersonStatus, text: string }) {
    if (type === 'lp') {
      this.lPFilter.selected = text;
      this.filterMaster = $newObj(LegalPersonMasterLightModel);
      this.getLegalPersons(val);
    } else {
      this.masterFilterVal.selected = text;
    }
  }

  setPersonFilter(data: ILegalPersonMasterLightModel) {
    if (data) {
      this.legalPersons = [data];
      this.$forceUpdate();
    }
  }

  setMasterFilter(data: ILegalPersonLightModel) {
    if (data) {
      this.masterLegalPersons = [data];
      this.$forceUpdate();
    }
  }

  @Debounce(250)
  async getSearchSuggestionsLP () {
    const ref = 'autocomplete_search_lp';
    const singleCall = new SingleCall($legalPersons.find);
    const results = await singleCall.invoke({
      text: this.$parent.$refs[ref]['model'],
      maxItemCount: 6,
    });
    const { items } = results;
    this.autocompleteOptions = items;
    this.$parent.$refs[ref]['options'] = items;
    this.$parent.$refs[ref]['loadingData'] = false;
  }

  @Debounce(250)
  async getSearchSuggestionsMaster () {
    const ref = 'autocomplete_search_master';
    const singleCall = new SingleCall($legalPersons.masters.find);
    const results = await singleCall.invoke({
      text: this.$parent.$refs[ref]['model'],
      maxItemCount: 6,
    });
    const { items } = results;
    this.autocompleteOptions = items;
    this.$parent.$refs[ref]['options'] = items;
    this.$parent.$refs[ref]['loadingData'] = false;
  }
}
