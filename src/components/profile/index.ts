import Vue from 'vue';
import { Component, Prop, Watch } from 'vue-property-decorator';
import store from '../../store';
import template from './template.vue';
import {
  IUserModel, UserModel, $geo, GeoSuggestion,
  $ensureObj, Address, ContactInfo, UserAdminInfo, IUserAgencyModel,
  UserPrimaryInfo, UserSettings, UserUISettings, UserDevSettings, $users,
  $user, $authUser,
} from '@immosparrow/cockpit-api-v2';
import { StreetSpecific } from '../../models';
import { dispatchGetAgency, dispatchGetEmployeeByIdAndSave, dispatchGetAgencyAndSave } from './../../store/modules/adminModule';
import * as globalState from './../../store/modules/globalStatesModule';
import Base from './../base';
import { Validator } from 'vee-validate';
import { showTabs, displayAddress, getDateAndTime } from '../sharedFunctions';
import AddressTemplate from '../address/index';
import VueIntercom from 'vue-intercom';

Vue.use(VueIntercom, { appId: process.env.intercom });

let emailsDB: any = [];

export interface StreetModel {
  Name: string;
  UniqueIdentifier: string;
}

export interface OptionModel {
  value: Number;
  text: string;
}

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
  name: 'ProfileComponent',
  mixins: [template],
  components: { AddressTemplate },
})

export default class ProfileComponent extends Base {

  @Prop({ default: new UserModel })
  userProfile: UserModel;

  @Prop()
  showDeleted: Boolean;

  @Prop({ default: false })
  addUser: Boolean;

  @Prop({ default: false })
  isUserProfile: Boolean;

  $intercom: any;

  agencies: IUserAgencyModel[] = [];

  chartData: any = [{
    name: 'User Sign Ins',
    data: {
      July: 10,
      '8. July': 3,
      '15. July': 5,
      '22. July': 2,
    },
  }];

  tabsProfile: object = {
    showProfile: false,
    showPassword: false,
    showAgencies: false,
  };

  showTabs: Function = showTabs;
  getDateAndTime: Function = getDateAndTime;

  user: IUserModel = new UserModel();

  street: GeoSuggestion = new GeoSuggestion();

  error: boolean = false;
  loading: boolean = false;
  udpated: boolean = false;

  salutations: OptionModel[] = [
    { value: -1, text: 'Salutation' },
    { value: 0, text: 'Mr' },
    { value: 1, text: 'Ms' },
  ];
  languages: OptionModel[] = [
    { value: -1, text: 'Language' },
    { value: 0, text: 'EN' },
    { value: 1, text: 'DE' },
    { value: 2, text: 'FR' },
    { value: 3, text: 'IT' },
  ];
  countries: OptionModel[] = [
    { value: 0, text: 'Country' },
    { value: 1, text: 'CH' },
  ];
  userRoles: OptionModel[] = [
    { value: 0, text: 'Regular user' },
    { value: 1, text: 'Admin' },
    { value: 2, text: 'Support' },
    { value: 3, text: 'Limited Support' },
  ];

  accessLevels: OptionModel[] = [
    { value: 0, text: 'Feature type' },
    { value: 1, text: 'Beta' },
    { value: 2, text: 'Alpha' },
    { value: 10, text: 'Developer' },
  ];

  password: string = '';
  newPassword: string = '';
  currentPassword: string = '';
  passwordOk: boolean = false;

  searchResult: StreetSpecific;

  showIdentity: boolean = true;
  showContactInfo: boolean = true;
  showNewFeatures: boolean = true;

  loadingBar: boolean = false;

  displayAddress: Function = displayAddress;

  created() {
    globalState.commitSetLoadingButton(store, false);
    $users.find({ page: 0, pageSize: 10 })
      .then((result) => {
        emailsDB = result.items.map((user: any) => {
          return user.email;
        });
      });
    this.tabsProfile['showProfile'] = true;
  }

  get userComputed(): IUserModel {
    return this.user;
  }

  async redirectToEmployee(employeeId: string, agencyId: string) {
    await dispatchGetAgency(store, agencyId);
    dispatchGetEmployeeByIdAndSave(store, employeeId).then((res) => {
      this.$router.push({
        name: 'employees',
        params: {
          from: 'user',
          id: this.user.id,
        },
      });
    });
  }

  updateOrCreate(form: string) {

    const self = this;
    globalState.commitSetLoadingButton(store, true);

    if (this.addUser) {
      this.$validator.validateAll(form).then((result) => {
        if (result) {
          emailsDB.push(this.user.email);
          this.user.password = this.password;
          this.user.isEnabled = true;
          $users.create(this.user)
            .then(() => {
              globalState.commitSetLoadingButton(store, false);
              Vue.prototype.$notify({
                group: 'actions',
                type: 'success',
                duration: 2500,
                text: 'User was created',
              });
              this.$emit('loadUsers');
              this.$emit('closeNewUser');

              this.user = new UserModel();

            })
            .catch((err) => {
              globalState.commitSetLoadingButton(store, false);
              // context.commit("setLoadingButton", false);
              if (err.status === 409) {
                Vue.prototype.$notify({
                  group: 'actions',
                  type: 'error',
                  duration: 2500,
                  text: 'Email is already taken, please try with another one',
                });
              } else {
                Vue.prototype.$notify({
                  group: 'actions',
                  type: 'error',
                  duration: 2500,
                  text: 'User was not created successfully',
                });
              }
            });
        } else {
          globalState.commitSetLoadingButton(store, false);
        }
      });
    } else if (this.isUserProfile) {

      this.$validator.validateAll(form).then((result) => {
        if (result) {

          $authUser.profile.update(this.user)
            .then((res) => {
              if (res) {
                setTimeout(() => {
                  globalState.commitSetLoadingButton(store, false);
                  Vue.prototype.$notify({
                    group: 'actions',
                    type: 'success',
                    duration: 2500,
                    text: 'Profile was updated',
                  });
                }, 500);
              }
              this.udpated = true;
            });
        } else {
          globalState.commitSetLoadingButton(store, false);
        }
      });
    } else {
      this.$validator.validateAll(form).then((result) => {
        if (result) {
          // this.$intercom.update({
          //   user_id: this.user.id,
          //   name: `${this.user.primaryInfo.firstName} ${this.user.primaryInfo.lastName}`,
          //   email: this.user.email,
          //   active: this.user.isEnabled,
          // });
          $user(this.user.id).update(this.user).then(() => {
            setTimeout(() => {
              globalState.commitSetLoadingButton(store, false);
              Vue.prototype.$notify({
                group: 'actions',
                type: 'success',
                duration: 2500,
                text: 'User was updated',
              });
            }, 1000);
            self.$emit('searchFor');
            this.udpated = true;
          });

        } else {
          globalState.commitSetLoadingButton(store, false);
        }
      });
    }
  }

  updatePassword(form: string) {

    globalState.commitSetLoadingButton(store, true);

    if (this.userProfile) {
      this.$validator.validateAll(form).then((result) => {
        if (result) {
          this.user.password = this.password;
          $user(this.user.id).update(this.user)
            .then(() => {
              setTimeout(() => {
                globalState.commitSetLoadingButton(store, false);
                Vue.prototype.$notify({
                  group: 'actions',
                  type: 'success',
                  duration: 2500,
                  text: 'User was updated',
                });
              }, 1000);
            });
        }
      });
    } else {
      this.$validator.validateAll(form).then((result) => {
        if (result) {
          const data = {
            id: this.user['id'],
            password: this.newPassword,
          };
          // user.dispatchUpdatePassword(store, data);
        }
      });
    }
  }

  @Watch('userProfile', { immediate: true })
  uu(val: any) {
    this.udpated = false;
    this.loading = true;
    val.address = $ensureObj(val.address, Address);
    val.contactInfo = $ensureObj(val.contactInfo, ContactInfo);
    val.primaryInfo = $ensureObj(val.primaryInfo, UserPrimaryInfo);
    val.adminInfo = $ensureObj(val.adminInfo, UserAdminInfo);
    val.adminInfo.devSettings = $ensureObj(val.adminInfo.devSettings, UserDevSettings);
    val.settings = $ensureObj(val.settings, UserSettings);
    val.settings.ui = $ensureObj(val.settings.ui, UserUISettings);
    if (!val.role) {
      val.role = 0;
    }
    this.user = val;
    if (!this.addUser) {
      $user(this.user.id).getAgencies()
        .then((res) => {
          this.agencies = res;
          this.loading = false;
        })
        .catch(() => {
          this.loading = false;
        });
    } else {
      this.loading = false;
    }
  }
  @Watch('currentPassword')
  onPasswordChanged(val: string, oldVal: string) {
    this.passwordOk = true;
  }

  getAgency(agency: IUserAgencyModel) {
    dispatchGetAgencyAndSave(store, agency.agency.id)
      .then(() => {
        this.$router.push({
          name: 'agencies',
          params: {
            from: 'user',
            id: this.user.id,
          },
        });
      });
  }
}
