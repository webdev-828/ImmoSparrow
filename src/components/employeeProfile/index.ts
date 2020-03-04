import Vue from 'vue';
import { Component, Prop, Watch } from 'vue-property-decorator';
import store from '../../store';
import template from './template.vue';
import { dispatchGetSavedUser, getAgency } from '../../store/modules/adminModule';
import * as auth from '../../store/modules/authStatesModule';
import * as globalState from './../../store/modules/globalStatesModule';
import Base from './../base';
import { Validator } from 'vee-validate';
import _ from 'lodash';
import {
  EmployeeModel, ISearchResult, IEmployeeLightModel,
  EmployeeRole, IInvitationRequest, InvitationRequest,
  $newObj, IEmployeeModel, ModifiableAddress, PersonalInfo,
  EmployeeContactInfo, EmployeePrimaryInfo, IUserLightModel,
  IAgencyLicenseLightModel, ILicensingOptionsModel,
  LicensingOptionsModel, ILicensingBundleItem,
  WorkspaceLicenseSettings, GeoAreaShape, $agency,
  IAgencyModel, GeoSuggestion, AgencyModel,
  GeoAreaSet, $agencies, $employee, $authUser,
  $geo, GeoAddressPartType, GeoAreaAddressPart,
} from '@immosparrow/cockpit-api-v2';
import Debounce from 'debounce-decorator';
import { OptionModel } from '../../models';
import { getDateAndTime, showTabs } from '../sharedFunctions';
import Address from '../address';
import EmployeeModal from './employeeModal';
import Geo from './../shared/geo';

export enum UpdateInviteType {
  Sent = 1,
  Accepted = 2,
}

enum GeoTypes {
  agency = 'agency',
  employee = 'employee',
}

export class GroupedFeatures {
  groupName: string;
  features: { feature: string, included: boolean }[] = [];
}

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
  name: 'EmployeeProfile',
  mixins: [template],
  components: {
    Address,
    EmployeeModal,
    Geo,
  },
})
export default class EmployeeProfile extends Base {

  @Prop({ default: new EmployeeModel })
  employeeProfile: EmployeeModel;

  @Prop({ default: false })
  addEmployee: Boolean;

  @Prop()
  showDeleted: Boolean;

  employees: ISearchResult<IEmployeeLightModel> = null;

  tabsProfile: object = {
    showProfile: false,
    showBundles: false,
  };
  showTabs: Function = showTabs;
  getDateAndTime: Function = getDateAndTime;

  showIdentity: boolean = true;
  showContactInfo: boolean = true;
  showInvitation: boolean = true;
  showBundles: boolean = true;
  showArea: boolean = true;
  showModal: boolean = false;
  updateType: UpdateInviteType;

  invitation: IInvitationRequest = $newObj(InvitationRequest);
  employeeEmail: string = '';
  sendingInvitation: boolean = false;

  employee: EmployeeModel = new EmployeeModel();
  employeeRoles: OptionModel[] = [
    {
      value: EmployeeRole.Employee,
      text: 'Employee',
    },
    {
      value: EmployeeRole.Admin,
      text: 'Admin',
    },
  ];
  selectedRole: OptionModel = null;

  options: Object[] = [];

  error: boolean = false;
  loading: boolean = false;

  loadingBar: boolean = false;
  loaded: boolean = false;
  updated: boolean = false;

  unlocatedLicenses: IAgencyLicenseLightModel[] = [];
  selectedLicense: IAgencyLicenseLightModel = null;
  licensingOptions: ILicensingOptionsModel = $newObj(LicensingOptionsModel);
  includedFeatures: GroupedFeatures[] = [];

  selectedSearchSuggestionsStrings: string[] = [];
  selectedSearchSuggestions: GeoSuggestion[] = [];
  colorsUsed: string[] = [];
  shapes: any[] = [];
  showSearchAreasInit: boolean = false;
  showSearchAreas: boolean = false;
  mapIsLoaded: boolean = false;

  agency: IAgencyModel = new AgencyModel;
  searchSuggestionTypes: any = [10, 20, 30, 40, 50, 15, 18];

  created() {
    this.loadEmployeeDetails(this.employeeProfile);
    this.tabsProfile['showProfile'] = true;
    this.showInvitation = false;

    this.getGeoSearchSuggestions.bind(this);

    // get agency for this work space
    this.agency = getAgency(store);

    this.$root.$on('map_is_loaded', (loaded: boolean) => {
      this.mapIsLoaded = true;
    });

    this.$root.$on('profile_is_closed', (value: boolean) => {
      this.$parent.$emit('showSearchAreas', false);
      this.showSearchAreas = false;
    });

    this.$root.$on('changeSearchParams', (value: number) => {
      if (value === 0) {
        this.searchSuggestionTypes = [10, 20, 30, 40, 50, 15, 18];
      } else {
        this.searchSuggestionTypes = [value];
      }
    });

    this.$root.$on('addToShapes', (shape: GeoAreaShape) => {
      Vue.set(this.employee.geoRestriction.shapes, this.employee.geoRestriction.shapes.length, shape);
    });
    this.$root.$on('geo_shape_created', (shape: any) => {
      Vue.set(this.employee.geoRestriction.shapes, this.employee.geoRestriction.shapes.length, shape);
    });
    this.$root.$on('address_removed', (id: string) => {
      if (this.employee.geoRestriction) {
        this.employee.geoRestriction.addressParts.forEach((data: any, index: number) => {
          if (data.uniqueIdentifier === id) {
            this.$delete(this.employee.geoRestriction.addressParts, index);
            this.employee.geoRestriction.addressParts.splice(index, 1);
          }
        });
        this.employee.geoRestriction.shapes.forEach((data: any, index: number) => {
          if (data.id === id) {
            this.employee.geoRestriction.shapes.splice(index, 1);
          }
        });
      }
    });
  }

  get employeeComputed(): IEmployeeModel {
    return this.employee;
  }

  get employeeFullName(): string {
    return `${this.employee.primaryInfo.firstName} ${this.employee.primaryInfo.lastName}`;
  }

  @Watch('employee', { deep: true })
  fillInvitation() {
    this.invitation.recipient.firstName = this.employee.primaryInfo.firstName;
    this.invitation.recipient.lastName = this.employee.primaryInfo.lastName;
    this.employeeEmail = this.employee.contactInfo.email;
  }

  @Watch('employeeProfile')
  loadEmployeeDetails(val: any) {
    globalState.commitSetLoadingButton(store, false);
    this.updated = false;
    this.loaded = false;
    this.employee = { ...val };
    this.invitation = $newObj(InvitationRequest);
    this.invitation.recipient = $newObj(PersonalInfo);
    this.employeeEmail = '';

    if (this.employee.geoRestriction === undefined) {
      Vue.set(this.employee, 'geoRestriction', new GeoAreaSet());
      Vue.set(this.employee.geoRestriction, 'addressParts', []);
      Vue.set(this.employee.geoRestriction, 'shapes', []);
    } else {
      if (this.employee.geoRestriction.addressParts === undefined) {
        Vue.set(this.employee.geoRestriction, 'addressParts', []);
      }
      if (this.employee.geoRestriction.shapes === undefined) {
        Vue.set(this.employee.geoRestriction, 'shapes', []);
      }
    }

    if (this.employee.address === undefined) {
      this.employee.address = $newObj(ModifiableAddress);
    }
    if (this.employee.contactInfo === undefined) {
      this.employee.contactInfo = $newObj(EmployeeContactInfo);
    }
    if (this.employee.primaryInfo === undefined) {
      this.employee.primaryInfo = $newObj(EmployeePrimaryInfo);
    }
    this.employeeEmail = this.employee.contactInfo.email;
    if (!this.invitation) {
      this.invitation.recipient.firstName = this.employee.primaryInfo.firstName;
      this.invitation.recipient.lastName = this.employee.primaryInfo.lastName;
    } else if (this.employee.invitation && (this.employee.invitation.status === 5 || this.employee.invitation.status === 2 || this.employee.invitation.status === 4)) {
      this.invitation.recipient.firstName = this.employee.primaryInfo.firstName;
      this.invitation.recipient.lastName = this.employee.primaryInfo.lastName;
    }
    $agencies.getLicensingOptions()
      .then((res) => {
        this.licensingOptions = res;
        if (this.employee.license) {
          this.selectedLicense = this.employee.license;
        } else {
          this.selectedLicense = null;
        }
      });
    $agency(getAgency(store).id).getUnallocatedLicenses()
      .then((res) => {
        this.unlocatedLicenses = res;
      });
    this.loaded = true;
    const self = this;
    setTimeout(() => {
      if (self.$refs.autocomplete_geo !== undefined) {
        self.$refs.autocomplete_geo.$refs['search_element'].onfocus = function () {
          self.openMapAndDraw();
        };
      }
    }, 500);
  }

  updateBundleArea(form: string) {
    globalState.commitSetLoadingButton(store, true);
    const self = this;
    try {
      for (const i in this.employee.geoRestriction.shapes) {
        delete this.employee.geoRestriction.shapes[i]['id'];
        delete this.employee.geoRestriction.shapes[i]['infinite'];
      }
    } catch { }
    const shapes = _.cloneDeep(this.employee.geoRestriction.shapes);
    // delete this.employee.geoRestriction.shapes;
    this.employee.geoRestriction.shapes = [];
    for (const i in shapes) {
      const s = new GeoAreaShape();
      s.name = shapes[i].name;
      s.color = shapes[i].color;
      if ('coordinates' in shapes[i].geom) {
        s.geom = shapes[i].geom;
      } else {
        s.geom = {
          coordinates: shapes[i].geom,
          type: 'Polygon',
        };
      }
      this.employee.geoRestriction.shapes.push(s);
    }
    this.$validator.validateAll(form).then((result) => {
      if (result) {
        this.attachLicense();
        $employee(this.employee.id).update(this.employee).then(() => {
          self.$emit('searchFor');
          this.updated = true;
          this.closeAreasCLick();
          globalState.commitSetLoadingButton(store, false);
          Vue.prototype.$notify({
            group: 'actions',
            type: 'success',
            duration: 2500,
            text: 'Employee was updated',
          });
          $authUser.getCurrentWorkspaceContext()
            .then((res) => {
              auth.commitSetEmployeeContext(store, res);
            });
        });
      } else {
        globalState.commitSetLoadingButton(store, false);
      }
    });
  }

  updateOrCreate(form: string) {

    const self = this;
    globalState.commitSetLoadingButton(store, true);

    if (this.addEmployee) {
      this.$validator.validateAll(form).then((result) => {
        if (result) {
          // emailsDB.push(this.user.email);
          this.employee.isEnabled = true;
          $agency(getAgency(store).id).createEmployee(this.employee)
            .then((res) => {
              if (this.showInvitation) {
                const loggedInUser = auth.getUserContext(store);
                this.invitation.senderName = loggedInUser.identity ? `${loggedInUser.identity.firstName} ${loggedInUser.identity.lastName}` : '';
                const emp = res;
                const invitation = {
                  invitationRequest: this.invitation,
                  id: emp.id,
                  email: this.employeeEmail,
                };
                $employee(emp.id).sendInvitation(this.employeeEmail, this.invitation)
                  .then((res2) => {
                    if (res2) {
                      globalState.commitSetLoadingButton(store, false);
                      Vue.prototype.$notify({
                        group: 'actions',
                        type: 'success',
                        duration: 2500,
                        text: 'Employee was created and invitation was sent successfully',
                      });
                      this.$emit('loadEmployees');
                      this.$emit('closeNewEmployee');
                      this.employee = new EmployeeModel();
                    } else {
                      setTimeout(() => {
                        Vue.prototype.$notify({
                          group: 'actions',
                          type: 'error',
                          duration: 2500,
                          text: 'Error while trying to create an employee and send an invitation',
                        });
                        globalState.commitSetLoadingButton(store, false);
                      }, 1000);
                    }
                  });
              } else {
                globalState.commitSetLoadingButton(store, false);
                Vue.prototype.$notify({
                  group: 'actions',
                  type: 'success',
                  duration: 2500,
                  text: 'Employee was created',
                });
                this.$emit('loadEmployees');
                this.$emit('closeNewEmployee');

                this.employee = new EmployeeModel();
              }
            })
            .catch((err) => {
              globalState.commitSetLoadingButton(store, false);
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
                  text: 'Employee was not created successfully',
                });
              }
            });
        } else {
          const err = this.$validator.errors.items.length ? `#${this.$validator.errors.items[0].field}` : '';
          this.$el.querySelector(err).scrollIntoView({ behavior: 'smooth' });
          globalState.commitSetLoadingButton(store, false);
        }
      });
    } else {
      this.updateBundleArea('bundleArea_form');
    }
  }

  sendInvitation(form: string) {
    this.$validator.validateAll(form).then((result) => {
      if (result) {
        this.sendingInvitation = true;
        const loggedInUser = auth.getUserContext(store);
        this.invitation.senderName = loggedInUser.identity ? `${loggedInUser.identity.firstName} ${loggedInUser.identity.lastName}` : '';
        $employee(this.employee.id).sendInvitation(this.employeeEmail, this.invitation)
          .then((res) => {
            if (res) {
              $employee(this.employee.id).get()
                .then((res) => {
                  this.loadEmployeeDetails(res as EmployeeModel);
                  globalState.commitSetLoadingButton(store, false);
                  Vue.prototype.$notify({
                    group: 'actions',
                    type: 'success',
                    duration: 2500,
                    text: 'Employee invitation was sent successfully',
                  });
                  this.sendingInvitation = false;
                });
            } else {
              setTimeout(() => {
                Vue.prototype.$notify({
                  group: 'actions',
                  type: 'error',
                  duration: 2500,
                  text: 'Error while trying to send an employee invitation',
                });
                globalState.commitSetLoadingButton(store, false);
                this.sendingInvitation = false;
              }, 1000);
            }
          });
      } else {
        this.sendingInvitation = false;
      }
    });
  }

  cancelInvitation() {
    this.sendingInvitation = true;
    $employee(this.employee.id).cancelInvitation()
      .then(() => {
        setTimeout(() => {
          Vue.prototype.$notify({
            group: 'actions',
            type: 'success',
            duration: 2500,
            text: 'Invitation was canceled successfully',
          });
        }, 1000);
        globalState.commitSetLoadingButton(store, false);
        $employee(this.employee.id).get()
          .then((res) => {
            this.loadEmployeeDetails(res as EmployeeModel);
            this.sendingInvitation = false;
          });
      });
  }

  redirectToUser(id: string) {
    dispatchGetSavedUser(store, id)
      .then((res) => {
        this.$router.push({
          name: 'users',
          params: {
            from: 'employee',
            id: this.employeeProfile.id,
          },
        });
      });
  }

  toggleUserModal(show: boolean, type?: UpdateInviteType) {
    this.showModal = show;
    if (type) {
      this.updateType = type;
    }
  }

  async setNewInvitationStatus(user: IUserLightModel) {
    const employee: any = this.employee;
    if (this.updateType === UpdateInviteType.Accepted) {
      employee.invitation.acceptedUser.email = user.email;
      employee.invitation.acceptedUser.firstName = user.primaryInfo.firstName;
      employee.invitation.acceptedUser.lastName = user.primaryInfo.lastName;
    }

    if (this.updateType === UpdateInviteType.Sent) {
      employee.invitation.email = user.email;
      employee.invitation.request.recipient.firstName = user.primaryInfo.firstName;
      employee.invitation.request.recipient.lastName = user.primaryInfo.lastName;
    }

    await $employee(employee.id).update(employee);
    this.updated = true;
    this.showModal = false;
  }

  unlinkInvitationUser(type: UpdateInviteType) {
    this.updateType = type;
  }

  bundleName(bundle: IAgencyLicenseLightModel) {
    let name: string = '';
    if (this.licensingOptions && this.licensingOptions.bundles) {
      this.licensingOptions.bundles.forEach((b) => {
        if (b.id === bundle.bundleId) {
          name = b.name;
        }
      });
    }
    return name;
  }

  removeLicense() {
    // this.employee.license = null;
    this.employee.licenseId = null;
    this.selectedLicense = null;
  }

  getFeatureName(feature: any) {
    let name = '';
    if (this.licensingOptions.features) {
      this.licensingOptions.features.forEach((f) => {
        if (f.id === feature.feature) {
          name = f.name;
        }
      });
    }
    return name;
  }

  getFeatures() {
    let features: ILicensingBundleItem[] = [];
    if (this.selectedLicense && this.licensingOptions && this.licensingOptions.bundles) {
      this.licensingOptions.bundles.forEach((bundle) => {
        if (bundle.id === this.selectedLicense.bundleId) {
          features = bundle.features;
        }
      });
    }
    return features;
  }

  getFeatureGroup(featureId: string) {
    let foundCategory: string = '';
    this.licensingOptions.features.forEach((f) => {
      if (f.id === featureId) {
        foundCategory = f.categoryId;
      }
    });
    let cat = '';
    if (foundCategory) {
      cat = this.licensingOptions.featureCategories.find(e => e.id === foundCategory).name;
    }
    return cat;
  }

  @Watch('selectedLicense')
  loadFeatures() {
    this.includedFeatures = [];
    const features = this.getFeatures();
    let found = false;
    features.forEach((feature) => { // first we add group names
      found = false;
      const featureGroupName = this.getFeatureGroup(feature.featureId);
      this.includedFeatures.forEach((group) => {
        if (group.groupName === featureGroupName) {
          found = true;
        }
      });
      if (!found) {
        this.includedFeatures.push({ groupName: featureGroupName, features: [] });
      } else {
        found = false;
      }
    });
    features.forEach((feature) => { // then we add features
      const featureGroupName = this.getFeatureGroup(feature.featureId);
      this.includedFeatures.forEach((group) => {
        if (group.groupName === featureGroupName) {
          group.features.push({ feature: feature.featureId, included: true });
        }
      });
    });
    if (this.employee.licenseSettings && this.employee.licenseSettings.excludeFeatureIDs) {
      this.employee.licenseSettings.excludeFeatureIDs.forEach((item) => {
        this.includedFeatures.forEach((group) => {
          group.features.forEach((f) => {
            if (f.feature === item) {
              f.included = false;
            }
          });
        });
      });
    }
  }

  attachLicense() {
    if (this.selectedLicense) {
      if (!this.employee.licenseId) {
        this.employee.isEnabled = true;
        this.employee.licenseId = this.selectedLicense.id;
        this.employee.licenseSettings = $newObj(WorkspaceLicenseSettings);
      }
      this.employee.licenseSettings.excludeFeatureIDs = [];
      this.includedFeatures.forEach((group) => {
        group.features.forEach((f) => {
          if (!f.included) {
            this.employee.licenseSettings.excludeFeatureIDs.push(f.feature);
          }
        });
      });
    }
  }

  // GEO STUFF
  destroyed() {
    this.$root.$off('geo_shape_created');
  }

  @Debounce(250)
  async getGeoSearchSuggestions() {
    const results = await $geo.findSuggestions({
      text: this.$parent.$refs['autocomplete_geo']['model'],
      includeGeom: true,
      suggestionTypes: this.$parent.$parent['searchSuggestionTypes'],
      maxItemCount: 6,
    });

    this.autocompleteOptions = results;
    this.$parent.$refs['autocomplete_geo']['options'] = results;
    this.$parent.$refs['autocomplete_geo']['loadingData'] = false;
  }

  findWithId(type: GeoTypes, id: string) {
    return this[type].geoRestriction.addressParts.find(x => x.id === id);
  }

  addArea(data: GeoSuggestion) {

    const color = this.get_color();
    data['bg_color'] = color;

    if (!this.showSearchAreas) {
      this.$root.$emit('showSearchAreas', true);
      this.showSearchAreas = true;
    }

    this.$refs['geoSuggest'].$refs.autocomplete_geo.model = '';
    this.$refs['geoSuggest'].$refs.autocomplete_geo.options = [];

    // this.$nextTick(() => {
    // re-render start
    this.$nextTick(() => {
      // re-render end
      const findInWorkspaces = this.findWithId(GeoTypes.employee, data.uniqueIdentifier);
      if (this.selectedSearchSuggestionsStrings.indexOf(data.uniqueIdentifier) === -1 && !findInWorkspaces) {

        if (this.agency.geoRestriction) {
          const findInAgences = this.findWithId(GeoTypes.agency, data.uniqueIdentifier);

          if (findInAgences) {
            this.$root.$emit('shape_removed', findInAgences.id);
          }
        }

        if (!this.employee.geoRestriction.addressParts) {
          this.employee.geoRestriction.addressParts = [];
        }
        Vue.set(this.employee.geoRestriction.addressParts, this.employee.geoRestriction.addressParts.length, new GeoAreaAddressPart({
          color,
          id: data.uniqueIdentifier,
          type: <GeoAddressPartType>data.suggestionType.valueOf(),
          name: data.name,
        }));
        /*this.agency.geoRestriction.addressParts.push(( new GeoAreaAddressPart({
          id: data.uniqueIdentifier,
          type:  <GeoAddressPartType> data.suggestionType.valueOf(),
          name: data.name,
          // color: areas[i]["bg_color"],

        })));*/
        this.selectedSearchSuggestionsStrings.push(data.uniqueIdentifier);

        this.$root.$emit('draw_shape', {
          color,
          id: data.uniqueIdentifier,
          geo: data.geom,
          name: data.name,
        });
        this.$forceUpdate();
      }

    });
    // });
  }

  get_color(): string {

    let color = this.colors()[Math.floor(Math.random() * this.colors().length)];

    if (this.colorsUsed.length === this.colors().length) {
      color = `#${Math.floor(Math.random() * 16777215).toString(16)}`;
    }

    if (this.colorsUsed.indexOf(color) === -1) {
      this.colorsUsed.push(color);

    } else {
      color = `#${Math.floor(Math.random() * 16777215).toString(16)}`;
      this.colorsUsed.push(color);
    }
    return color;
  }
  openMapAndDraw() {
    // if (this.workspace.geoRestriction != undefined) {
    this.$parent.$emit('showSearchAreas', true);
    this.showSearchAreas = true;
    // }
  }
  stc(color: string): object {
    return {
      'background-color': `${color} !important`,
    };
  }
  closeAreasCLick() {
    this.$parent.$emit('showSearchAreas', false);
    this.showSearchAreas = false;
    this.mapIsLoaded = false;
  }
  remove_shape(id: string, index: number): void {
    if (this.showSearchAreas) {
      this.$root.$emit('shape_removed', id);
    }
    // this.shapes.splice(index, 1);
    this.employee.geoRestriction.shapes.splice(index, 1);
  }
  remove_address_item(index: number): void {
    const workspaceId = this.employee.geoRestriction.addressParts[index].id;

    if (this.showSearchAreas) {
      this.$root.$emit('remove_shape_from_address', workspaceId);
      if (this.agency.geoRestriction) {
        const foundAgencyEl = this.findWithId(GeoTypes.agency, workspaceId);
        if (foundAgencyEl) {
          this.addNewGeo(GeoTypes.agency, [foundAgencyEl]);
        }
      }
    }
    this.selectedSearchSuggestionsStrings.splice(this.selectedSearchSuggestionsStrings.indexOf(workspaceId), 1);
    this.employee.geoRestriction.addressParts.splice(index, 1);
  }
  async addNewGeo(type: GeoTypes, ganAreas?: GeoAreaAddressPart[]) {
    if (this[type].geoRestriction !== undefined && this.load) {
      const areas = ganAreas || this[type].geoRestriction.addressParts;
      const shapes = this[type].geoRestriction.shapes;

      const toDraw = <any>[];
      const promises = <any>[];

      if (areas) {

        areas.forEach((item) => {
          const p = $geo.getAddressPart(item.id).then((res) => {
            return res;
          });
          promises.push(p);
        });

        await Promise.all(promises).then((data: any) => {

          data.forEach((item: any, e: number) => {
            const newElement = {
              id: item.id,
              geom: item.geom,
              name: item.name,
              color: (areas[e].id === item.id && areas[e].color) ? areas[e].color : '#5c90d2',
              opacity: 0.5,
            };

            if (type === 'agency') {
              newElement.color = '#d2d210';
              newElement.opacity = 0.1;
            }

            toDraw.push(newElement);
          });

          if (shapes) {
            shapes.forEach((item) => {
              toDraw.push({
                id: item.name,
                geom: item.geom,
                name: item.name,
                color: item.color,
              });
            });
          }
          this.$root.$emit('draw_shapes', toDraw);

        },
        );
      } else {
        if (shapes) {
          shapes.forEach((item) => {
            toDraw.push({
              id: item.name,
              geom: item.geom,
              name: item.name,
              color: item.color,
            });
          });
        }
        this.$root.$emit('draw_shapes', toDraw);
      }
    }
  }
  get load() {
    return this.mapIsLoaded && this.showSearchAreas;
  }
  @Watch('load')
  async ml() {
    await this.addNewGeo(GeoTypes.employee);
    await this.addNewGeo(GeoTypes.agency);
  }
}
