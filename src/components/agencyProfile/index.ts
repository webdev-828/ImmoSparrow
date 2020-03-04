import Vue from 'vue';
import { Component, Prop, Watch } from 'vue-property-decorator';
import store from '../../store';
import template from './template.vue';
import autocomplete from '../addressAutocomplete';
import * as auth from '../../store/modules/authStatesModule';
import {
  dispatchGetSavedUser, dispatchGetEmployeeByIdAndSave,
  dispatchGetAgency, getAgency,
 } from '../../store/modules/adminModule';
import {
  AgencyModel,
  IAgencyModel,
  ISearchResult,
  $agency,
  $agencies,
  IEmployeeLightModel,
  EmployeeModel,
  PersonalInfo,
  AgencyPrimaryInfo,
  GeoAddressPartType, AgencyContactInfo,
  GeoAreaAddressPart, GeoAreaSet, IAgencyLicenseModel,
  $geo, $newObj, EmployeeRole, AgencyLicenseModel,
  GeoSuggestion, GeoAreaShape, ModifiableAddress,
  LicensingOptionsModel, ILicensingOptionsModel, ILicensingBundleItem,
} from '@immosparrow/cockpit-api-v2';
import * as globalState from './../../store/modules/globalStatesModule';
import Base from './../base';
import Debounce from 'debounce-decorator';
import AgencyMapComponent from './../map/agency';
import { OptionModel } from '../../models';
// import Geo from "./geo";
import Geo from './../shared/geo';
import { SingleCall } from '../call';
import _ from 'lodash';
import { formatDate, getDateAndTime, showTabs } from '../sharedFunctions';

@Component({
  name: 'AgencyProfile',
  mixins: [template],
  components: {
    autocomplete,
    AgencyMapComponent,
    Geo,
  },
})
export default class AgencyProfile extends Base {

  @Prop({ default: new AgencyModel })
  agencyProfile: AgencyModel;

  @Prop()
  showDeleted: Boolean;

  @Prop({ default: false })
  addAgency: Boolean;

  formatDate: Function = formatDate;
  showTabs: Function = showTabs;

  agency: AgencyModel = new AgencyModel();
  employees: ISearchResult<IEmployeeLightModel> =  null;

  agencyLicences: IAgencyLicenseModel[] = [];
  licencingOptions: ILicensingOptionsModel = $newObj(LicensingOptionsModel);
  updatingLicence: boolean = false;
  removingLicence: boolean = false;
  selectedBundleId: string = null;
  searchSuggestionTypes: any = [10, 20, 30, 40, 50, 15, 18];
  tabsProfile: object = {
    showProfile: false,
    showEmployees: false,
    showGeo: false,
    showBundles: false,
  };
  tabsLicences: object = {
    showUsed: true,
    showUnused: false,
  };
  showIdentity: boolean = true;
  showContactInfo: boolean = true;
  showSearchAreas: boolean = false;
  showNewLicence: boolean = true;

  street: GeoSuggestion = new GeoSuggestion();
  error: boolean = false;
  loading: boolean = false;
  mapIsLoaded: boolean = false;
  loadingBar: boolean = false;
  loaded: boolean = false;
  getDateAndTime: Function = getDateAndTime;
  updated: boolean = false;

  countries: OptionModel[] = [
    { value: 0, text: 'Country' },
    { value: 1, text: 'CH' },
  ];

  selectedSearchSuggestionsStrings: string[] = [];
  // selectedSearchSuggestions: Array<api.GeoSuggestion> = [];
  colorsUsed: string[] = [];
  // shapes: Array<any> = [];
  showSearchAreasInit: boolean = false;

  newBundle: IAgencyLicenseModel = $newObj(AgencyLicenseModel);
  addingBundle: boolean = false;

  disabledDatesEndDate: any = {};
  disabledDatesStartDate: any = {
    from: new Date(new Date().getFullYear() + 1, 0, 1),
  };

  get sortedEmployees () {
    return this.employees.items.sort((a, b) => {
      return a.lastName.localeCompare(b.lastName);
    });
  }

  @Watch('newBundle.startDate')
  minPubTime () {
    Vue.set(this.disabledDatesEndDate, 'to', this.newBundle.startDate);
  }
  @Watch('newBundle.endDate')
  maxPubTime () {
    Vue.set(this.disabledDatesStartDate, 'from', this.newBundle.endDate);
    if (this.newBundle.endDate) {
      this.newBundle.isTrial = true;
    } else {
      this.newBundle.isTrial = false;
    }
  }

  getDisabledDatesStart (bundle: IAgencyLicenseModel) {
    return {
      from: new Date(new Date().getFullYear() + 1, 0, 1),
      to: bundle.startDate,
    };
  }
  getDisabledDatesEnd (bundle: IAgencyLicenseModel) {
    return {
      from: bundle.endDate,
    };
  }

  get bundleDatesHighlighted(): object {
    return {
      to: this.newBundle.endDate,
      from: this.newBundle.startDate,
    };
  }

  destroyed() {
    this.$root.$off('geo_shape_created');
  }
  created() {

    globalState.commitSetLoadingButton(store, false);
    this.loadAgencyDetails(this.agencyProfile);
    this.tabsProfile['showProfile'] = true;

    this.$root.$on('changeSearchParams', (value: number) => {

      if (value === 0) {
        this.searchSuggestionTypes = [10, 20, 30, 40, 50, 15, 18];
      } else {
        this.searchSuggestionTypes = [value];
      }

    });
    this.$root.$on('map_is_loaded', (loaded: boolean) => {
      this.mapIsLoaded = true;
    });
    this.$root.$on('addToShapes', (shape: GeoAreaShape) => {
      Vue.set(this.agency.geoRestriction.shapes, this.agency.geoRestriction.shapes.length, shape);
    });

    this.$root.$on('geo_shape_created', (shape: any) => {

      /*if (this.agency.geoRestriction == undefined) {
        this.agency.geoRestriction = new GeoAreaSet();
        this.agency.geoRestriction.addressParts = [];
        this.agency.geoRestriction.shapes = [];
      }*/
      // console.log(this.agency.geoRestriction.shapes);
      Vue.set(this.agency.geoRestriction.shapes, this.agency.geoRestriction.shapes.length, shape);
    });

    this.$root.$on('profile_is_closed', (value: boolean) => {
      // alert("S");
      this.$root.$emit('showSearchAreas', false);
      this.showSearchAreas = false;
    });

    this.$root.$on('address_removed', (id: string) => {

      if (this.agency.geoRestriction) {
        this.agency.geoRestriction.addressParts.forEach((data: any, index: number) => {
          if (data.uniqueIdentifier === id) {
            this.$delete(this.agency.geoRestriction.addressParts, index);
            // Vue.delete(this.agency.geoRestriction.addressParts, index);
            this.agency.geoRestriction.addressParts.splice(index, 1);
          }
        });

        this.agency.geoRestriction.shapes.forEach((data: any, index: number) => {

          if (data.id === id) {
            // this.$delete(this.agency.geoRestriction.shapes, index);
            // Vue.delete(this.agency.geoRestriction.shapes, index);
            this.agency.geoRestriction.shapes.splice(index, 1);
          }
        });
      }
    });

  }

  get agencyComputed (): IAgencyModel {
    return this.agency;
  }

  setStreet(data: GeoSuggestion) {
    this.street = data;
    this.$refs.autocomplete_profile.model = data.name;
    this.$refs.autocomplete_profile.options = [];

    if (this.street.uniqueIdentifier !== '') {
      $geo.getAddress(this.street.uniqueIdentifier).then((res: any) => {
        this.agency.address.street = res.street;
        this.agency.address.locality = res.locality;
        this.agency.address.zip = res.zip;
        this.agency.address.streetNumber = res.streetNumber;
        this.agency.address.countryCode = res.countryCode;
        this.$forceUpdate();
      });
    }
  }

  @Watch('agencyProfile')
  loadAgencyDetails(val: any) {
    this.updated = false;
    this.loaded = false;
    this.agency = val;
    this.newBundle = $newObj(AgencyLicenseModel);
    this.newBundle.startDate = new Date();

    if (this.agency.geoRestriction === undefined) {
      Vue.set(this.agency, 'geoRestriction', new GeoAreaSet());
      Vue.set(this.agency.geoRestriction, 'addressParts', []);
      Vue.set(this.agency.geoRestriction, 'shapes', []);
    } else {
      if (this.agency.geoRestriction.addressParts === undefined) {
        Vue.set(this.agency.geoRestriction, 'addressParts', []);
      }
      if (this.agency.geoRestriction.shapes === undefined) {
        Vue.set(this.agency.geoRestriction, 'shapes', []);
      }
    }

    if (this.agency.address === undefined) {
      this.agency.address = $newObj(ModifiableAddress);
    }
    if (this.agency.contactInfo === undefined) {
      this.agency.contactInfo = $newObj(AgencyContactInfo);
    }
    if (this.agency.primaryInfo === undefined) {
      this.agency.primaryInfo = $newObj(AgencyPrimaryInfo);
    }

    if (!this.addAgency) {
      const employeeData = {
        maxItemCount: 500,
        text: '',
      };
      $agency(this.agency.id).findEmployees(employeeData)
      .then((res) => {
        this.employees = res;
      });
      $agencies.getLicensingOptions()
        .then((res) => {
          this.licencingOptions = res;
        });
      $agency(this.agency.id).getLicenses()
        .then((res) => {
          this.agencyLicences = res;
          this.loaded = true;
        });

    } else {
      this.loaded = true;
    }

  }

  getFeatures (bundleId: string) {
    let features: string = '';
    if (this.licencingOptions.bundles) {
      this.licencingOptions.bundles.forEach((bundle) => {
        if (bundle.id === bundleId) {
          bundle.features.forEach((f: ILicensingBundleItem, index: number) => {
            const ind = index + 1;
            features += `${ind}. ${f.featureId}` + '<br>';
          });
        }
      });
    }
    return features;
  }

  getBundleName (bundleId: string) {
    let name = '';
    if (this.licencingOptions.bundles) {
      this.licencingOptions.bundles.forEach((bundle) => {
        if (bundle.id === bundleId) {
          name = bundle.name;
        }
      });
    }
    return name;
  }

  addNewBundle (form: string) {
    this.addingBundle = true;
    this.newBundle.isEnabled = true;
    this.$validator.validateAll(form).then((result) => {
      if (result) {
        $agency(this.agency.id).addLicense(this.newBundle)
          .then((res) => {
            if (res) {
              Vue.prototype.$notify({
                group: 'actions',
                type: 'success',
                duration: 2500,
                text: 'Bundle successfully assigned to agency',
              });
              $agency(this.agency.id).getLicenses()
                .then((res) => {
                  this.agencyLicences = res;
                  this.addingBundle = false;
                });
            } else {
              Vue.prototype.$notify({
                group: 'actions',
                type: 'error',
                duration: 2500,
                text: 'Error while trying to assign a bundle to agency',
              });
              this.addingBundle = false;
            }
          });
      } else {
        this.addingBundle = false;
      }
    });
  }

  updateLicence (bundle: IAgencyLicenseModel) {
    this.updatingLicence = true;
    this.selectedBundleId = bundle.id;
    setTimeout(() => {
      $agency(this.agency.id).updateLicense(bundle.id, bundle)
      .then((res) => {
        if (res) {
          Vue.prototype.$notify({
            group: 'actions',
            type: 'success',
            duration: 2500,
            text: 'Bundle successfully updated',
          });
          $agency(this.agency.id).getLicenses()
            .then((res) => {
              this.agencyLicences = res;
              this.updatingLicence = false;
              this.selectedBundleId = null;
            });
        } else {
          Vue.prototype.$notify({
            group: 'actions',
            type: 'error',
            duration: 2500,
            text: 'Error while trying to update a bundle',
          });
          this.updatingLicence = false;
          this.selectedBundleId = null;
        }
      });
    },         1000);
  }

  removeLicence (bundle: IAgencyLicenseModel) {
    this.selectedBundleId = bundle.id;
    this.removingLicence = true;
    setTimeout(() => {
      $agency(this.agency.id).removeLicense(bundle.id)
      .then((res) => {
        if (res) {
          Vue.prototype.$notify({
            group: 'actions',
            type: 'success',
            duration: 2500,
            text: 'Bundle successfully removed',
          });
          $agency(this.agency.id).getLicenses()
            .then((res) => {
              this.agencyLicences = res;
              this.removingLicence = false;
              this.selectedBundleId = null;
            });
        } else {
          Vue.prototype.$notify({
            group: 'actions',
            type: 'error',
            duration: 2500,
            text: 'Error while trying to remove a bundle',
          });
          this.removingLicence = false;
          this.selectedBundleId = null;
        }
      });
    },         1000);
  }

  get usedLicences () {
    return this.agencyLicences.filter((item) => {
      return item.isUsed;
    });
  }

  get unusedLicences () {
    return this.agencyLicences.filter((item) => {
      return !item.isUsed;
    });
  }

  @Debounce(250)
  async getSearchSuggestions () {

    const singleCall = new SingleCall <GeoSuggestion[]>($geo.findSuggestions);
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

  @Debounce(250)
  async getGeoSearchSuggestions () {
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

  addAreas() {
    this.$root.$emit('showSearchAreas', true);
    this.showSearchAreas = true;
  }

  openMapAndDraw() {

    this.$root.$emit('map_change_size', 'big');
    this.$root.$emit('showSearchAreas', true);
    this.showSearchAreas = true;

  }

  closeAreas() {
    this.$root.$emit('showSearchAreas', false);
    this.showSearchAreas = false;
  }

  closeAreasCLick() {
    this.$root.$emit('showSearchAreas', false);
    this.showSearchAreas = false;
    this.mapIsLoaded = false;
  }

  addArea(data: GeoSuggestion) {

    const color = this.get_color();
    data['color'] = color;

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
      if (this.selectedSearchSuggestionsStrings.indexOf(data.uniqueIdentifier) === -1) {

        if (!this.agency.geoRestriction.addressParts) {
          this.agency.geoRestriction.addressParts = [];
        }
        Vue.set(this.agency.geoRestriction.addressParts, this.agency.geoRestriction.addressParts.length, new GeoAreaAddressPart({
          color,
          id: data.uniqueIdentifier,
          type:  <GeoAddressPartType> data.suggestionType.valueOf(),
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
      }

    });
    // });

  }

  /*updateAgencyAreas() {

    // let areas = this.selectedSearchSuggestions;
    // let shapes = this.shapes;
    this.agency.geoRestriction = new GeoAreaSet();
    this.agency.geoRestriction.addressParts = [];
    this.agency.geoRestriction.shapes = [];

    for (let i = 0, l = shapes.length; i < l; i++) {

      this.agency.geoRestriction.shapes.push( new GeoAreaShape({
        name: shapes[i].name,
        color: shapes[i].color,
        geom: shapes[i].geom
      }));
    }

    for (let i = 0, l = areas.length; i < l; i++) {

      this.agency.geoRestriction.addressParts.push( new GeoAreaAddressPart({
        id: areas[i].uniqueIdentifier,
        type:  <GeoAddressPartType> areas[i].suggestionType.valueOf(),
        name: areas[i].name,
        color: areas[i]["bg_color"],

      }));
    }

  }*/

  get_color(): string {

    let color = this.colors()[Math.floor(Math.random() * this.colors().length)];

    if (this.colorsUsed.length === this.colors().length) {
      color =  `# ${Math.floor(Math.random() * 16777215).toString(16)}`;
    }

    if (this.colorsUsed.indexOf(color) === -1) {
      this.colorsUsed.push(color);

    } else {
      color =  `# ${Math.floor(Math.random() * 16777215).toString(16)}`;
      this.colorsUsed.push(color);
    }

    return color;

  }

  add_km_to_geo_object(index: number): void {
    const km = prompt('Extend search in km', '');
    if (km == null || km === '') {
      Vue.delete(this.agency.geoRestriction.addressParts[index], 'extend_by');
      return;
    }
    Vue.set(this.agency.geoRestriction.addressParts[index], 'extend_by', parseInt(km));
  }

  remove_km_from_geo_object(index: number): void {
    Vue.delete(this.agency.geoRestriction.addressParts[index], 'extend_by');
  }

  remove_address_item(index: number): void {
    if (this.showSearchAreas) {
      this.$root.$emit('remove_shape_from_address', this.agency.geoRestriction.addressParts[index].id);
    }
    this.selectedSearchSuggestionsStrings.splice(this.selectedSearchSuggestionsStrings.indexOf(this.agency.geoRestriction.addressParts[index].id), 1);
    this.agency.geoRestriction.addressParts.splice(index, 1);
  }

  remove_shape(id: string, index: number): void {
    if (this.showSearchAreas) {
      this.$root.$emit('shape_removed', id);
    }
    // this.shapes.splice(index, 1);
    this.agency.geoRestriction.shapes.splice(index, 1);
  }

  stc(color: string): object {
    return {
      'background-color': `${color} !important`,
    };
  }
  closeNewAgency () {
    this.$emit('closeNewAgency');
  }
  updateOrCreate(form: string) {

    // if created just delete parts we dont need in shapes
    try {
      for (const i in this.agency.geoRestriction.shapes) {
        delete this.agency.geoRestriction.shapes[i]['id'];
        delete this.agency.geoRestriction.shapes[i]['infinite'];
      }
    } catch {}

    const shapes = _.cloneDeep(this.agency.geoRestriction.shapes);
    // delete this.agency.geoRestriction.shapes;

    this.agency.geoRestriction.shapes = [];

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

      this.agency.geoRestriction.shapes.push(s);
    }
    // return;

    // console.log(this.agency.geoRestriction.shapes);
    const self = this;
    globalState.commitSetLoadingButton(store, true);
    if (this.addAgency) {
      this.$validator.validateAll(form).then((result) => {
        if (result) {
          this.agency.isEnabled = true;
          $agencies.create(this.agency)
          .then((res) => {
            globalState.commitSetLoadingButton(store, false);
            Vue.prototype.$notify({
              group: 'actions',
              type: 'success',
              duration: 2500,
              text: 'Agency was created',
            });
            this.$emit('loadAgencies');
            this.$emit('closeNewAgency');

            this.agency = new AgencyModel();
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
                text: 'Agency was not created successfully',
              });
              globalState.commitSetLoadingButton(store, false);
            }
          });
        } else {
          const err = this.$validator.errors.items.length ? `#${this.$validator.errors.items[0].field}` : '';
          this.$el.querySelector(err).scrollIntoView({ behavior: 'smooth' });
          globalState.commitSetLoadingButton(store, false);
        }
      });
    } else {
      this.$validator.validateAll(form).then((result) => {
        if (result) {
          $agency(this.agency.id).update(this.agency)
          .then((res) => {
            if (res) {
              Vue.prototype.$notify({
                text: 'Agency was updated',
                group: 'actions',
                type: 'success',
                duration: 2500,
              });
            }
            globalState.commitSetLoadingButton(store, false);
            this.updated = true;
            self.$emit('searchFor');
          });
        } else {
          globalState.commitSetLoadingButton(store, false);
        }
      });
    }
  }

  redirectToEmployee (employee: EmployeeModel) {
    const from = this.$route.name;
    dispatchGetEmployeeByIdAndSave(store, employee.id).then((res) => {
      this.$router.push({
        name: 'employees',
        params: {
          from,
          id: this.agency.id,
        },
      });
    });
  }

  redirectToUser (id: string) {
    const from = this.$route.name;
    dispatchGetSavedUser(store, id)
    .then((res) => {
      this.$router.push({
        name: 'users',
        params: {
          from,
          id: this.agency.id,
        },
      });
    });
  }

  getEmployeeRole (role: number) {
    if (role >= 0) {
      return EmployeeRole[role];
    }
    return '';

  }

  get l ( ) {
    return {
      a: this.mapIsLoaded,
      b: this.showSearchAreas,
    };
  }

  @Watch('l')
  ml() {
    const self = this;
    if (this.agency.geoRestriction !== undefined && this.l.a && this.l.b) {
      const areas = this.agency.geoRestriction.addressParts;
      const shapes = this.agency.geoRestriction.shapes;
      const toDraw = <any>[];
      const promises = <any>[];

      if (areas) {
        areas.forEach((el) => {
          const p = $geo.getAddressPart(el.id).then((res) => {
            return res;
          });
          promises.push(p);
        });

        Promise.all(promises).then((data: any) => {
          data.forEach((el: any, e: number) => {
            toDraw.push({
              id: el.id,
              geom: el.geom,
              name: el.name,
              color: (areas[e].id === el.id && areas[e].color) ? areas[e].color : '#5c90d2',
            });
          });

          if (shapes) {
            shapes.forEach((el: any) => {
              toDraw.push({
                id: el.name,
                geom:el.geom,
                name: el.name,
                color: el.color,
              });
            });
          }
          self.$root.$emit('draw_shapes', toDraw);
        },
        );
      } else {
        if (shapes) {
          shapes.forEach((el: any) => {
            toDraw.push({
              id: el.name,
              geom:el.geom,
              name: el.name,
              color: el.color,
            });
          });
        }
        self.$root.$emit('draw_shapes', toDraw);
      }
    }
  }

  checkExpired (endDate: Date) {
    return endDate && endDate <= new Date();
  }
}
