import Vue from 'vue';
import { Component, Prop, Watch } from 'vue-property-decorator';
import store from '../../store';
import template from './template.vue';
import autocomplete from '../addressAutocomplete';
import * as globalState from './../../store/modules/globalStatesModule';
import Base from './../base';
import { Validator } from 'vee-validate';
import Debounce from 'debounce-decorator';
import {
  ISearchResult, ContactModel, IContactModel,
  GeoSuggestion, IContactLightModel, $geo,
  $contact, $contactList,
  Address, ContactInfo, PersonalInfo, $newObj,
} from '@immosparrow/cockpit-api-v2';
import { OptionModel } from '../../models';
import { SingleCall } from '../call';
import { getDateAndTime } from '../sharedFunctions';

const emailsDB: any = [];

const isUnique = (value: any) => new Promise((resolve) => {
  setTimeout(() => {
    if (emailsDB.indexOf(value) === -1) {
      return resolve({
        valid: true,
      });
    }

    return resolve({
      valid: false,
      data: {
        message: `${value} is already taken.`,
      },
    });
  }, 200);
});

Validator.extend('unique', {
  validate: isUnique,
  getMessage: (field: any, params: any, data: any) => data.message,
});

@Component({
  name: 'ContactProfile',
  mixins: [template],
  components: {
    autocomplete,
  },
})
export default class ContactProfile extends Base {

  @Prop({ default: () => $newObj(ContactModel) })
  contactProfile: IContactModel;

  @Prop({ default: false })
  addContact: Boolean;

  @Prop()
  contactListId: string;

  @Prop()
  searchFor: Function;

  contacts: ISearchResult<IContactLightModel> = null;

  tabsProfile: object = {
    showProfile: false,
  };
  showIdentity: boolean = true;
  showContactInfo: boolean = true;

  contact: IContactModel = new ContactModel();

  street: GeoSuggestion = new GeoSuggestion();

  error: boolean = false;
  loading: boolean = false;
  updated: boolean = false;

  countries: OptionModel[] = [
    { value: 0, text: 'Country' },
    { value: 1, text: 'CH' },
  ];
  salutations: OptionModel[] = [
    { value: 0, text: 'Mr' },
    { value: 1, text: 'Ms' },
  ];

  loadingBar: boolean = false;
  loaded: boolean = false;
  getDateAndTime: Function = getDateAndTime;

  created() {
    this.loadContactDetails(this.contactProfile);
    this.tabsProfile['showProfile'] = true;
  }

  get contactComputed(): IContactModel {
    return this.contact;
  }

  get contactFullName(): string {
    return `${this.contact.primaryInfo.firstName} ${this.contact.primaryInfo.lastName}`;
  }

  setStreet(data: GeoSuggestion) {

    this.street = data;
    this.$refs.autocomplete_profile.model = data.name;
    this.$refs.autocomplete_profile.options = [];

    if (this.street.uniqueIdentifier !== '') {
      $geo.getAddress(this.street.uniqueIdentifier)
        .then((res) => {
          this.contact.address.street = res.street;
          this.contact.address.locality = res.locality;
          this.contact.address.zip = res.zip;
          this.contact.address.streetNumber = res.streetNumber;
          this.contact.address.countryCode = res.countryCode;
          this.$forceUpdate();
        }).catch((e) => {
        });
    }
  }

  @Watch('contactProfile')
  loadContactDetails(val: any) {
    this.updated = false;
    this.loaded = false;
    this.contact = val;
    if (this.contact.address === undefined) {
      this.contact.address = Address.fromJS(undefined);
    } else {
      const cnt = this.countries.filter((country) => {
        if (this.contact.address.countryCode === country.text) {
          return country;
        }
      })[0];
      if (cnt) {
        this.contact.address.countryCode = cnt.text;
      }
    }
    if (this.contact.contactInfo === undefined) {
      this.contact.contactInfo = ContactInfo.fromJS(undefined);
    }
    if (this.contact.primaryInfo === undefined) {
      this.contact.primaryInfo = PersonalInfo.fromJS(undefined);
    }
    const sal = this.salutations.filter((sal) => {
      if (this.contact.primaryInfo.salutation === sal.text) {
        return sal;
      }
    })[0];
    if (sal) {
      this.contact.primaryInfo.salutation = sal.text;
    }
    this.loaded = true;
  }

  show(tab: string) {
    for (const i in this.tabsProfile) {
      this.tabsProfile[i] = i === tab;
    }
  }

  @Debounce(250)
  async getSearchSuggestions() {

    /*const results = await $geo.findSuggestions({
      text: this.$parent.$refs["autocomplete_profile"]["model"],
      includeGeom: true,
      suggestionTypes: [70],
      maxItemCount: 6
    });
    this.autocompleteOptions = results;
    this.$parent.$refs["autocomplete_profile"]["options"] = results;
    this.$parent.$refs["autocomplete_profile"]["loading_data"] = false;*/

    const singleCall = new SingleCall<GeoSuggestion[]>($geo.findSuggestions);
    const results = await singleCall.invoke({
      text: this.$parent.$refs['autocomplete_profile']['model'],
      includeGeom: true,
      suggestionTypes: [70],
      maxItemCount: 6,
    });

    this.autocompleteOptions = results;
    this.$parent.$refs['autocomplete_profile']['options'] = results;
    this.$parent.$refs['autocomplete_profile']['loadingData'] = false;

  }

  updateOrCreate(form: string) {

    const self = this;
    globalState.commitSetLoadingButton(store, true);

    if (this.addContact) {
      this.$validator.validateAll(form).then((result) => {
        if (result) {
          // emailsDB.push(this.user.email);
          $contactList(this.contactListId).contacts.create(this.contact)
            .then(() => {
              globalState.commitSetLoadingButton(store, false);
              Vue.prototype.$notify({
                group: 'actions',
                type: 'success',
                duration: 2500,
                text: 'Contact was created',
              });
              this.$emit('loadContacts');
              this.$emit('closeNewContact');

              this.contact = new ContactModel();

            })
            .catch((err) => {
              globalState.commitSetLoadingButton(store, false);
              Vue.prototype.$notify({
                group: 'actions',
                type: 'error',
                duration: 2500,
                text: 'Employee was not created successfully',
              });
            });
        } else {
          globalState.commitSetLoadingButton(store, false);
        }
      });
    } else {
      this.$validator.validateAll(form).then((result) => {
        if (result) {
          $contact(this.contact.id).update(this.contact).then(() => {
            self.$emit('searchFor');
            this.updated = true;
          });
        } else {
          globalState.commitSetLoadingButton(store, false);
        }
      });
    }
  }
}
