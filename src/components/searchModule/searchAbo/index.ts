import Vue from 'vue';
import { Component, Prop, Watch } from 'vue-property-decorator';
import template from './template.vue';
import { OptionModel } from '../../../models';
import store from '../../../store';
import * as searchModule from '../../../store/modules/searchModule';
import * as leadsModule from '../../../store/modules/leads';
import {
  $contactLists, $newObj, LeadGenFilterModel, PubQuery,
  IContactModel, ContactModel, IContactLightModel,
  $leadGenFilters, $leadGenFilter,
  IEntitySearchResult, SearchQueryRangeNonNegativeOfDouble,
  PubQueryLeadGenTrigger, PubQueryLeadGenTriggerType,
  UserPrimaryInfo, Address, ContactInfo, PipelineModel,
  LeadListModel, PubQueryLeadGenParams, $contactList,
} from '@immosparrow/cockpit-api-v2';
import Modal from '../../modal';
import _ from 'lodash';

@Component({
  mixins: [template],
  components: {
    Modal,
  },
})

export default class SearchAbo extends Vue {

  @Prop()
  selectedSub: LeadGenFilterModel;

  @Prop()
  searchData: PubQuery;

  showMore: boolean = false;
  showMore2: boolean = false;
  showCreateNewContact: boolean = false;
  loading: boolean = false;

  searchSub = $newObj(LeadGenFilterModel);
  newContact: IContactModel = $newObj(ContactModel);

  contacts: IEntitySearchResult<IContactLightModel> = { items: [] };

  selectedContact: IContactLightModel = null;
  salutations: OptionModel[] = [
    { value: 0, text: 'Mr' },
    { value: 1, text: 'Ms' },
  ];
  selectedSal: OptionModel = null;
  criteriaOptions: PubQueryLeadGenTrigger[] = [
    new PubQueryLeadGenTrigger({
      type: PubQueryLeadGenTriggerType.New,
      change: new SearchQueryRangeNonNegativeOfDouble(),
      changePercentage: new SearchQueryRangeNonNegativeOfDouble() }),
    new PubQueryLeadGenTrigger({
      type: PubQueryLeadGenTriggerType.Renewed,
      change: new SearchQueryRangeNonNegativeOfDouble(),
      changePercentage: new SearchQueryRangeNonNegativeOfDouble() }),
    new PubQueryLeadGenTrigger({
      type: PubQueryLeadGenTriggerType.PriceIncreased,
      change: new SearchQueryRangeNonNegativeOfDouble(),
      changePercentage: new SearchQueryRangeNonNegativeOfDouble() }),
    new PubQueryLeadGenTrigger({
      type: PubQueryLeadGenTriggerType.PriceDecreased,
      change: new SearchQueryRangeNonNegativeOfDouble(),
      changePercentage: new SearchQueryRangeNonNegativeOfDouble() }),
    new PubQueryLeadGenTrigger({
      type: PubQueryLeadGenTriggerType.PriceChangedFromKnownToUnknown,
      change: new SearchQueryRangeNonNegativeOfDouble(),
      changePercentage: new SearchQueryRangeNonNegativeOfDouble() }),
    new PubQueryLeadGenTrigger({
      type: PubQueryLeadGenTriggerType.PriceChangedFromUnknownToKnown,
      change: new SearchQueryRangeNonNegativeOfDouble(),
      changePercentage: new SearchQueryRangeNonNegativeOfDouble() }),
    new PubQueryLeadGenTrigger({
      type: PubQueryLeadGenTriggerType.PublicationDurationDays,
      change: new SearchQueryRangeNonNegativeOfDouble(),
      changePercentage: new SearchQueryRangeNonNegativeOfDouble() }),
  ];
  selectedCriteria: PubQueryLeadGenTrigger[] = [];
  showIncDecModal: boolean = false;
  minPriceChangePercentage: number = null;
  minPriceChangeValue: number = null;
  selectedIndex: number = null;
  updatingSub: boolean = false;

  contactListId: string = '';
  triggersRequired: boolean = false;
  updateSub: boolean = false;

  showDaysModal: boolean = false;
  durationDays: number = null;

  created () {
    // console.log(this.selectedSub);
    $contactLists.find({ text: '' })
      .then((res) => {
        if (res && res.items.length) {
          this.contactListId = res.items[0].id;
          this.getContacts();
        } else {
          $contactLists.create({ name: 'Default contact list' })
            .then((res) => {
              this.contactListId = res.id;
              this.getContacts();
            });
        }
      });
  }

  getContacts () {
    $contactList(this.contactListId).contacts.find({ text: '' })
    .then((res) => {
      this.contacts = res;
      if (!this.contacts) {
        this.contacts = { items: [] };
      }
      // this.contacts.items.unshift({firstName: "New ", lastName: "contact"});
      if (this.selectedSub.id) {
        this.searchSub = _.cloneDeep(this.selectedSub);
        this.searchSub.query = this.searchData;
        this.searchSub.query.leadGenParams = this.selectedSub.query.leadGenParams;

        if (this.contacts) {
          this.selectedContact = this.contacts.items.find((con) => {
            return con.id === this.searchSub.contactId;
          });
        }
        if (this.searchSub.query.leadGenParams && this.searchSub.query.leadGenParams.triggers) {
          const allOptions = _.cloneDeep(this.criteriaOptions);
          allOptions.filter((item: PubQueryLeadGenTrigger) => {
            const found = this.searchSub.query.leadGenParams.triggers.filter(e => e.type === item.type);
            if (found.length > 0) {
              this.loadSelectedCriteria(item);
              this.selectedIndex = this.selectedCriteria.indexOf(item);
              if (found[0].change?.min) {
                this.minPriceChangeValue = found[0].change.min;
                this.changeMinPrice();
                this.minPriceChangeValue = null;
              }
              if (found[0].changePercentage?.min) {
                this.minPriceChangePercentage = found[0].changePercentage.min;
                this.changeMinPrice();
                this.minPriceChangePercentage = null;
              }
            }
          });
        }
      } else {
        this.searchSub = $newObj(LeadGenFilterModel);
        const query = this.searchData;
        Vue.set(this.searchSub, 'query', query);
        this.searchSub.maxInitialLeadCount = 500;
      }
      this.newContact.primaryInfo = $newObj(UserPrimaryInfo);
      this.newContact.address = $newObj(Address);
      this.newContact.contactInfo = $newObj(ContactInfo);
    });
  }

  saveSubscription (form: string) {
    this.$validator.validateAll(form).then((result) => {
      if (result) {
        this.loading = true;
        delete this.searchSub.query.maxItemCount;
        delete this.searchSub.query.sort;
        delete this.searchSub.query.page;
        delete this.searchSub.query.pageSize;

        if (!this.searchSub.maxInitialLeadCount) {
          this.searchSub.maxInitialLeadCount = 500;
        }

        if (this.searchSub.query.leadGenParams && this.searchSub.query.leadGenParams.triggers.length || (this.selectedCriteria && this.selectedCriteria.length)) {
          this.triggersRequired = false;
        } else {
          this.triggersRequired = true;
        }
        if (!this.triggersRequired) {
          if (this.updateSub) {
            this.updateSubscription();
          } else {
            this.searchSub.isEnabled = true;
            const pipeline = $newObj(PipelineModel);
            pipeline.name = this.searchSub.name;
            pipeline.isEnabled = true;

            this.saveCriteria();

            // pipelineModule.dispatchCreatePipeline(store, pipeline)
              // .then((res) => {
            const leadsList = $newObj(LeadListModel);
            // leadsList.defaultPipelineId = res.id;
            leadsList.name = this.searchSub.name;
            leadsList.isEnabled = true;
            if (this.newContact.primaryInfo.firstName) {
              if (this.selectedSal) {
                this.newContact.primaryInfo.salutation = this.selectedSal.text;
              }
              $contactList(this.contactListId).contacts.create(this.newContact)
                .then((res) => {
                  const contactId = res.id;
                  leadsList.contactId = contactId;
                  leadsModule.dispatchCreateLeadsList(store, leadsList)
                    .then((res2) => {
                      this.searchSub.contactId = contactId;
                      this.searchSub.leadListId = res2.id;
                      $leadGenFilters.create(this.searchSub)
                        .then((result) => {
                          if (result) {
                            setTimeout(() => {
                              Vue.prototype.$notify({
                                group: 'actions',
                                type: 'success',
                                duration: 2500,
                                text: 'Subscription was created successfully',
                              });
                              this.resetForm();
                              this.loading = false;
                              this.$root.$emit('closeModal');
                            },         1000);
                          } else {
                            this.loading = false;
                          }
                        });
                    });
                });
            } else {
              if (this.selectedContact && this.selectedContact.id) {
                leadsList.contactId = this.selectedContact.id;
              }
              leadsModule.dispatchCreateLeadsList(store, leadsList)
                  .then((res2) => {
                    this.searchSub.leadListId = res2.id;
                    if (this.selectedContact && this.selectedContact.id) {
                      this.searchSub.contactId = this.selectedContact.id;
                    } else {
                      delete this.searchSub.contactId;
                    }
                    $leadGenFilters.create(this.searchSub)
                      .then((result) => {
                        if (result) {
                          setTimeout(() => {
                            Vue.prototype.$notify({
                              group: 'actions',
                              type: 'success',
                              duration: 2500,
                              text: 'Subscription was created successfully',
                            });
                            this.resetForm();
                            this.loading = false;
                            this.$root.$emit('closeModal');
                          },         1000);
                        } else {
                          this.loading = false;
                        }
                      });
                  });
            }
              // });
          }
        } else {
          this.loading = false;
        }
      } else {
        if (this.searchSub.query.leadGenParams && !this.searchSub.query.leadGenParams.triggers.length) {
          this.triggersRequired = true;
        } else {
          this.triggersRequired = false;
        }
      }
    });
  }

  saveCriteria () {
    if (this.selectedCriteria.length) {
      if (!this.searchSub.query.leadGenParams) {
        this.searchSub.query.leadGenParams = $newObj(PubQueryLeadGenParams);
        if (!this.searchSub.query.leadGenParams.triggers) {
          this.searchSub.query.leadGenParams.triggers = [];
        }
      }
      this.searchSub.query.leadGenParams.triggers = this.selectedCriteria;
      this.searchSub.query.leadGenParams.triggers.forEach((trigger) => {
        if (!_.isEmpty(trigger.change)) {
          try {
            const parsed = parseInt(trigger.change.min.toString());
            trigger.change.min = parsed;
          } catch {}
        }
        if (!_.isEmpty(trigger.changePercentage)) {
          try {
            const parsed = parseInt(trigger.changePercentage.min.toString());
            trigger.changePercentage.min = parsed;
          } catch {}
        }
      });
    }
  }

  updateSubscription () {
    this.updatingSub = true;
    this.saveCriteria();
    $leadGenFilter(this.searchSub.id).update(this.searchSub)
      .then((res) => {
        setTimeout(() => {
          if (res) {
            Vue.prototype.$notify({
              group: 'actions',
              type: 'success',
              duration: 2500,
              text: 'Subscription successfully updated',
            });
          } else {
            Vue.prototype.$notify({
              group: 'actions',
              type: 'error',
              duration: 2500,
              text: 'Error while trying to update subscription',
            });
          }
          this.updatingSub = false;
          this.$root.$emit('closeModal');
        },         1000);
      });
  }

  contactsLabel (contact: IContactLightModel) {
    return `${contact.firstName} ${contact.lastName}`;
  }

  @Watch('selectedCriteria')
  triggersWatch(): void {
    if (this.selectedCriteria.length) {
      this.triggersRequired = false;
    } else {
      this.triggersRequired = true;
    }
  }

  loadSelectedCriteria (el: PubQueryLeadGenTrigger) {
    if (this.selectedCriteria.indexOf(el) === -1) {
      this.selectedCriteria.unshift(el);
      this.criteriaOptions.forEach((c) => {
        if (c.type === el.type) {
          this.criteriaOptions.splice(this.criteriaOptions.indexOf(c), 1);
        }
      });
    }
  }

  updateSelectedCriteria (el: PubQueryLeadGenTrigger) {
    if (this.selectedCriteria.indexOf(el) === -1) {
      this.selectedCriteria.unshift(el);
      if (el.type === PubQueryLeadGenTriggerType.PublicationDurationDays) {
        this.onMarketDays(this.selectedCriteria.indexOf(el));
      }
      if (el.type === PubQueryLeadGenTriggerType.PriceIncreased || el.type === PubQueryLeadGenTriggerType.PriceDecreased) {
        this.priceIncreaseDecrease(this.selectedCriteria.indexOf(el));
      }
      this.criteriaOptions.forEach((c, index) => {
        if (c.type === el.type) {
          this.criteriaOptions.splice(this.criteriaOptions.indexOf(c), 1);
        }
        if (this.criteriaOptions[index] && c.type === PubQueryLeadGenTriggerType.PublicationDurationDays) {
          this.criteriaOptions[index]['$isDisabled'] = true;
        }
      });
    }
  }
  removeCriteria (index: number): void {
    this.selectedCriteria[index].change = new SearchQueryRangeNonNegativeOfDouble();
    this.selectedCriteria[index].changePercentage = new SearchQueryRangeNonNegativeOfDouble();
    this.criteriaOptions.unshift(this.selectedCriteria[index]);
    this.selectedCriteria.splice(index, 1);
    if (!this.selectedCriteria.length) {
      this.criteriaOptions.forEach((item, index) => {
        this.criteriaOptions[index]['$isDisabled'] = false;
      });
    }
  }
  limitText(count: number): string {
    return `and ${count} other elements`;
  }

  priceIncreaseDecrease(index: number): void {
    this.minPriceChangeValue = null;
    this.minPriceChangePercentage = null;
    this.selectedIndex = index;
    if (this.selectedCriteria[index].change) {
      this.minPriceChangeValue = this.selectedCriteria[index].change.min;
    }
    if (this.selectedCriteria[index].changePercentage) {
      this.minPriceChangePercentage = this.selectedCriteria[index].changePercentage.min;
    }
    this.showIncDecModal = true;
  }
  changeMinPrice () {
    if (this.minPriceChangeValue) {
      this.selectedCriteria[this.selectedIndex].change.min = this.minPriceChangeValue;
    } else {
      this.selectedCriteria[this.selectedIndex].change = new SearchQueryRangeNonNegativeOfDouble();
    }
    if (this.minPriceChangePercentage) {
      this.selectedCriteria[this.selectedIndex].changePercentage.min = this.minPriceChangePercentage;
    } else {
      this.selectedCriteria[this.selectedIndex].changePercentage = new SearchQueryRangeNonNegativeOfDouble();
    }
    this.closeIncDecModal();
  }
  closeIncDecModal () {
    this.selectedIndex = null;
    this.minPriceChangeValue = null;
    this.minPriceChangePercentage = null;
    this.showIncDecModal = false;
  }
  closeDaysModal () {
    this.selectedIndex = null;
    this.durationDays = null;
    this.showDaysModal = false;
  }
  onMarketDays (index: number) {
    this.durationDays = null;
    this.selectedIndex = index;
    if (this.selectedCriteria[index].change) {
      this.durationDays = this.selectedCriteria[index].change.min;
    }
    this.showDaysModal = true;
  }
  addDurationDays () {
    if (this.durationDays) {
      this.selectedCriteria[this.selectedIndex].change.min = this.durationDays;
    }
    this.closeDaysModal();
    this.criteriaOptions.forEach((item, ind) => {
      if (item.type !== PubQueryLeadGenTriggerType.PublicationDurationDays) {
        this.criteriaOptions[ind]['$isDisabled'] = true;
      }
    });
  }
  closeDurationModal () {
    this.removeCriteria(this.selectedIndex);
    this.showDaysModal = false;
  }
  removeDurationDays (index: number) {
    this.selectedCriteria[index].change = new SearchQueryRangeNonNegativeOfDouble();
    this.onMarketDays(index);
    this.criteriaOptions.forEach((item, ind) => {
      if (item.type === PubQueryLeadGenTriggerType.PublicationDurationDays) {
        this.criteriaOptions[ind]['$isDisabled'] = false;
      }
    });
  }

  removeMinChange (index: number) {
    this.selectedCriteria[index].change = new SearchQueryRangeNonNegativeOfDouble();
    this.selectedCriteria[index].changePercentage = new SearchQueryRangeNonNegativeOfDouble();
  }

  getTriggerName ({ type }: PubQueryLeadGenTrigger) {
    const name = PubQueryLeadGenTriggerType[type];
    return name.match(/[A-Z][a-z]+/g).join(' ');
  }

  resetForm () {
    this.newContact = $newObj(ContactModel);
    this.newContact.primaryInfo = $newObj(UserPrimaryInfo);
    this.newContact.address = $newObj(Address);
    this.newContact.contactInfo = $newObj(ContactInfo);
    this.searchSub = $newObj(LeadGenFilterModel);
    this.searchSub.query = $newObj(PubQuery);
    this.searchSub.query.leadGenParams = $newObj(PubQueryLeadGenParams);
    this.searchSub.query = searchModule.getSearchData(store).query as PubQuery;
    this.selectedSal = null;
    this.selectedContact = null;
    this.selectedCriteria = [];
    this.criteriaOptions = [
      new PubQueryLeadGenTrigger({
        type: PubQueryLeadGenTriggerType.New,
        change: new SearchQueryRangeNonNegativeOfDouble(),
        changePercentage: new SearchQueryRangeNonNegativeOfDouble() }),
      new PubQueryLeadGenTrigger({
        type: PubQueryLeadGenTriggerType.Renewed,
        change: new SearchQueryRangeNonNegativeOfDouble(),
        changePercentage: new SearchQueryRangeNonNegativeOfDouble() }),
      new PubQueryLeadGenTrigger({
        type: PubQueryLeadGenTriggerType.PriceIncreased,
        change: new SearchQueryRangeNonNegativeOfDouble(),
        changePercentage: new SearchQueryRangeNonNegativeOfDouble() }),
      new PubQueryLeadGenTrigger({
        type: PubQueryLeadGenTriggerType.PriceDecreased,
        change: new SearchQueryRangeNonNegativeOfDouble(),
        changePercentage: new SearchQueryRangeNonNegativeOfDouble() }),
      new PubQueryLeadGenTrigger({
        type: PubQueryLeadGenTriggerType.PriceChangedFromKnownToUnknown,
        change: new SearchQueryRangeNonNegativeOfDouble(),
        changePercentage: new SearchQueryRangeNonNegativeOfDouble() }),
      new PubQueryLeadGenTrigger({
        type: PubQueryLeadGenTriggerType.PriceChangedFromUnknownToKnown,
        change: new SearchQueryRangeNonNegativeOfDouble(),
        changePercentage: new SearchQueryRangeNonNegativeOfDouble() }),
      new PubQueryLeadGenTrigger({
        type: PubQueryLeadGenTriggerType.PublicationDurationDays,
        change: new SearchQueryRangeNonNegativeOfDouble(),
        changePercentage: new SearchQueryRangeNonNegativeOfDouble() }),
    ];
  }
  isEmpty (value: any) {
    return _.isEmpty(value);
  }
  checkIfContactSub () {
    if (this.selectedContact) {
      if (this.searchSub.contactId === this.selectedContact.id) {
        return true;
      }
      return false;

    }
    return true;

  }

  createNewCon () {
    this.selectedContact = null;
    this.showCreateNewContact = !this.showCreateNewContact;
  }
}
