import Vue from 'vue';
import template from './left_template.vue';
import { Component, Watch, Prop } from 'vue-property-decorator';
import autocomplete from './../addressAutocomplete';
import Base from './../base';
import store from '../../store';
import * as api from '@immosparrow/cockpit-api-v2';
import * as pp from '../../store/modules/pricePredictionModule';
import modal from '../modal';
import ConfirmModal from '../modal/confirmModal';
import * as search from '../../store/modules/searchStatesModule';
import VueSlider from 'vue-slider-component';
import * as globalState from '../../store/modules/globalStatesModule';
import * as history from '../../store/modules/history';
import { displayAddress, formatDate, formatPrice } from '../sharedFunctions';
import { safeVal } from '@immosparrow/cockpit-lib-core';
import Transactions from './forms/transactions';
import * as MRStore from '@store/modules/marketRadar';
import moment from 'moment';
import { watch } from 'fs';

const _ = require('lodash');
let isTyping = false;
document.onkeypress = () => {
  isTyping = true;
};

enum pricePredictorType {
  Advertising = 0,
  Transactions = 1,
}

const validationCheck = {
  houseAdvertising:{
    fields: ['propertyType', 'builtYear', 'roomsNumber', 'livingArea', 'propertyArea', 'renovationYear'],
    notRequired: ['renovationYear'],
  },
  apartmentAdvertising: {
    fields: ['propertyType', 'builtYear', 'roomsNumber', 'livingArea', 'renovationYear'],
    notRequired: ['renovationYear'],
  },
};

@Component({
  mixins: [template],
  components: {
    autocomplete,
    modal,
    VueSlider,
    Transactions,
    ConfirmModal,
  },
})
export default class LeftBar extends Base {
  testVal: string = '';
  @Prop({ default: null })
  entranceAndBuilding: { entrance: api.EntranceLightModel, building: api.BuildingModel };

  adOnAddress: api.PubModel = null;
  @Prop({ default: false })
  mapIsLoaded: boolean;
  val: Function = safeVal;
  typePP: pricePredictorType = pricePredictorType.Advertising;
  formatDate: Function = formatDate;
  formatPrice: Function = formatPrice;
  approved = {
    builtYear: false,
    microLocation: false,
    constructionGrade: false,
    garageCount: false,
    cubature: false,
    bathroomsCount: false,
    houseTypes: false,
    renovationYear: false,
    roomsNumber: false,
    livingArea: false,
    state: false,
    propertyArea: false,
    propertyType: true,
    quality: false,
    condition: false,
  };

  approvedTrans = {
    builtYear: false,
    microLocation: false,
    garageCount: false,
    cubature: false,
    bathroomsCount: false,
    houseTypes: false,
    roomsNumber: false,
    livingArea: false,
    propertyArea: false,
    quality: false,
    condition: false,
    propertyType: true,
  };
  api: any = api;
  currentYear: any = moment().year();
  // location interact start
  locationType: string = 'Address';
  // tslint:disable-next-line
  localize: any = window['Localize'];

  controls: { [key: string]: boolean } = {
    Address: true,
    BuildingNumber: false,
    ParcelNumber: false,
  };

  interactWith: { [key: string]: string } = {
    Address: 'Address',
    BuildingNumber: 'Building No',
    ParcelNumber: 'Parcel No',
  };

  addressPlaceHolder: string = 'Address';
  includeInSuggestions: number[] = [70];
  autocompleteTextLimit: number = 3;

  ppTransPricePopover: boolean = false;

  showControl(what: string, str: string) {

    for (const i in this.controls) {
      this.controls[i] = false;
    }
    this.controls[what] = true;
    this.locationType = what;
    this.addressPlaceHolder = str;

    if (this.locationType === 'BuildingNumber') {
      this.includeInSuggestions = [110];
      this.autocompleteTextLimit = 1;
    }
    if (this.locationType === 'ParcelNumber') {
      this.includeInSuggestions = [100];
      this.autocompleteTextLimit = 1;
    }
    if (this.locationType === 'Address') {
      this.includeInSuggestions = [70];
      this.autocompleteTextLimit = 3;
    }

    this.searchedAddress = '';
  }
  // location interact end

  adsAddress: api.IGeoSuggestion = new api.GeoSuggestion();
  manualSearch: boolean = false;
  minified: boolean = false;
  selectedLayer: string = '';
  apartments: api.ApartmentLightModel[] = [];
  propTypes: { id: number; name: string }[] = [{
    id: 100,
    name: 'House',
  }, {
    id: 200,
    name: 'Apartment',
  }];
  selectedPropertyType: { id: number; name: string } = this.propTypes[0];
  activeRenovationSlider: boolean = false;
  searchMap: boolean = false;
  basePP: any = {
    propertyCategory: api.PubPropertyWellKnownCategory.House,
    transactionType: api.PubTransactionType.Buy,
    rentDealType: api.PricePredRentDealType.Gross,
    roomCount: null,
    builtYear: null,
    livingArea: null,
    propertyArea: null,
    renovationYear: null,
  };
  baseTransPP: any = {
    propertyCategory: api.PubPropertyWellKnownCategory.House,
    roomCount: null,
    builtYear: null,
    livingArea: null,
    propertyArea: null,
    renovationYear: null,
    transactionType: api.PubTransactionType.Buy,
    pricePredictionMethod: 2,
    cubature: null,
    garageCount: null,
    houseType: null,
    quality: null,
    condition: null,
    microLocation: null,
  };
  forceRender: boolean = false;
  buildingModel: api.BuildingModel = new api.BuildingModel();
  searchModel: any = Object.assign(this.basePP, {});
  searchModelTransaction: any = Object.assign(this.baseTransPP, {});

  adSelected: api.ApartmentLightModel = new api.ApartmentLightModel();
  fullAddress: api.GeoAddress = new api.GeoAddress();
  // sliders start
  builtYear = {
    min: 1800,
    max: new Date().getFullYear(),
  };
  renovationYear = {
    min: 1800,
    max: new Date().getFullYear(),
  };
  editYearState: boolean = false;
  yearState() {
    this.editYearState = !this.editYearState;
    this.$refs.yearInput.focus();
  }

  roomsSlider = {
    min: 1,
    max: 14,
  };

  get valuesApproved () {
    const validationType = this.selectedPropertyType.id === 100 ? 'houseAdvertising' : 'apartmentAdvertising';

    return !!Object.keys(this.approved).find((key) => {
      if (validationCheck[validationType].fields.includes(key)) {
        if (validationCheck[validationType].notRequired.includes(key)) {
          if (this.searchModel[key]) {
            return this.approved[key] === false;
          }
        } else {
          return this.approved[key] === false;
        }
      }
    });
  }
  get livingSpaceSlider() {
    return {
      min: this.selectedPropertyType.id === 100 ? 20 : 10,
      max: this.selectedPropertyType.id === 100 ? 600 : 400,
    };
  }

  // if apartment hide property space
  propertySpaceSlider = {
    min: 50,
    max: 5000,
  };
  // sliders end

  remove_address_item() {

    this.manualSearch = false;
    this.$root.$emit('remove_market_radar_point', this.selectedLayer);
    this.$root.$emit('building', new api.BuildingModel());
    this.adsAddress = new api.GeoSuggestion();
    /// this.$refs.autocomplete_search.model = "";
    this.searchedAddress = '';
    this.adsInViewport = [];

    this.$root.$emit('map_change_size', 'big');
    if (document.getElementsByClassName('switch_style').length) {
      document.getElementsByClassName('switch_style')[0].className = 'switch_style mapboxgl-ctrl-group mapboxgl-ctrl';
    }

    this.$root.$emit('remove_market_radar_popup', true);

    this.apartments = [];
    // this.$refs.autocomplete_search.model = "";
    this.searchedAddress = '';
    this.$root.$emit('pricePredicted', false);
    search.commitSearchedPricePredictAddress(store, new api.GeoSuggestion());
    this.$root.$emit('buildingModelChanged', new api.BuildingModel());
    this.$root.$emit('showBuilding', false);
    this.searchModel = Object.assign(this.basePP, {});
    this.searchModel.transactionType = api.PubTransactionType.Buy;
    this.searchModelTransaction = Object.assign(this.basePP, {});
    this.setOKValToDefault();

  }
  searchedAddress: string = '';
  async setObjectLocation(suggestion: api.GeoSuggestion) {
    /*if (suggestion.suggestionType !== api.GeoSuggestionType.EntranceAddress) {
      return api.$geo.getAddress(suggestion.uniqueIdentifier).then((data) => {
        const address: api.IGeoSuggestion = new api.GeoSuggestion();
        address.name = displayAddress(data);
        address.uniqueIdentifier = data.entranceId;
        address.coordinates = new api.GeoCoordinates({
          longitude: data.coordinates.longitude,
          latitude: data.coordinates.latitude,
        });
        return search.commitSearchedPricePredictAddress(this.$store, address);
      });
    }*/
    return search.commitSearchedPricePredictAddress(store, suggestion);
  }

  searchStringChanged(a: string) {
    this.searchedAddress = a;
  }

  changeTypePP(id: pricePredictorType) {
    if (id === pricePredictorType.Advertising) {
      this.selectedPropertyType = this.propTypes.find(el => el.id === this.searchModel.propertyCategory);
      this.$nextTick(() => {
        this.$validator.reset();
      });
    }
    this.typePP = id;
    this.$forceUpdate();
    this.isSubmitValid();
  }

  setStreet(suggestion: api.IGeoSuggestion, redo: boolean = true) {
    this.$validator.reset();
    if (this.loadFromHistory) {
      return;
    }
    this.setOKValToDefault();
    this.manualSearch = false;
    this.$root.$emit('pricePredicted', false);

    // this is used to reset data in child model
    this.searchedAddress = '';

    search.commitAddressLoading(store, true);
    if (!suggestion.uniqueIdentifier) {
      search.commitAddressLoading(store, false);
      this.$root.$emit('buildingModelChanged', true);
      this.manualSearch = true;
      this.apartments = [];
      return;
    }

    api.$geo.getAddress(suggestion.uniqueIdentifier).then((data: api.GeoAddress) => {
      this.fullAddress = data;
    });
    this.setBuildingAndApartments(suggestion);
  }

  setBuildingAndApartments(suggestion: api.IGeoSuggestion) {
    pp.commitSetSelectedAd(this.$store, new api.PubModel());
    this.adOnAddress = null;
    this.apartments = [];
    api.$building(suggestion.uniqueIdentifier).get().then((data: api.BuildingModel) => {
      pp.commitSetSelectedBuilding(this.$store, data);
      this.manualSearch = false;
      this.buildingModel = data;
      if (!this.loadFromHistory) {

        this.searchModel = Object.assign(this.basePP, {});
        this.searchModel.addressId = suggestion.uniqueIdentifier;
        this.searchModel.transactionType = api.PubTransactionType.Buy;
        this.searchModel.propertyCategory = this.propTypes[0]['id'];

        this.searchModelTransaction = Object.assign(this.baseTransPP, {});
        this.searchModelTransaction.addressId = suggestion.uniqueIdentifier;
        this.searchModelTransaction.propertyCategory = this.propTypes[0]['id'];
        this.selectedPropertyType = this.propTypes[0];

        if (this.buildingModel.primaryInfo) {
          if (this.buildingModel.primaryInfo.builtYear) {
            this.searchModel.builtYear = this.buildingModel.primaryInfo.builtYear;
            this.searchModelTransaction.builtYear = this.buildingModel.primaryInfo.builtYear;
          }

          if (this.buildingModel.primaryInfo.renovationYear) {
            this.searchModel.renovationYear = this.buildingModel.primaryInfo.renovationYear;
            this.searchModelTransaction.renovationYear = this.buildingModel.primaryInfo.renovationYear;
          }

          // if (this.buildingModel.primaryInfo.renovationYear) {
          //   this.searchModel.renovationYear = this.buildingModel.primaryInfo.renovationYear;
          // }
          if (this.buildingModel.realProperty.primaryInfo) {
            if (this.buildingModel.realProperty.primaryInfo.area) {
              this.searchModel.propertyArea = this.buildingModel.realProperty.primaryInfo.area;
              this.searchModelTransaction.propertyArea = this.buildingModel.realProperty.primaryInfo.area;
              this.approved.propertyArea = true;
            } else {
              this.approved.propertyArea = false;
            }
          }
        }
        this.approved.propertyType = false;
        this.setOKValToDefault();

      } else {

        // in the case where we dont have ren year in search model take one from the building if exists
        // if (!this.searchModel.renovationYear) {
        //   if (this.buildingModel.primaryInfo) {
        //     if (this.buildingModel.primaryInfo.renovationYear) {
        //       this.searchModel.renovationYear = this.buildingModel.primaryInfo.renovationYear;
        //     }
        //   }
        // }

        // in the case where we dont have propertyArea in search model take one from the building if exists
        if (!this.searchModel.propertyArea) {
          if (this.buildingModel.realProperty.primaryInfo) {
            if (this.buildingModel.realProperty.primaryInfo.area) {
              this.searchModel.propertyArea = this.buildingModel.realProperty.primaryInfo.area;
              this.searchModelTransaction.propertyArea = this.buildingModel.realProperty.primaryInfo.area;
            }
          }
        }

      }
      if (data.entrances.length) {
        pp.commitSetSelectedEntrance(this.$store, data.entrances[0]);
        for (const i in data.entrances) {
          if (data.entrances[i].address.entranceId) {

            if (data.entrances[i].address.entranceAddressId === suggestion.uniqueIdentifier) {
              if (data.entrances[i].apartments) {
                if (data.entrances[i].apartments.length) {
                  Vue.set(this, 'apartments', data.entrances[i].apartments);
                  if (data.entrances[i].apartments.length > 1) {

                    if (!this.loadFromHistory) {
                      this.approved.propertyType = false;
                    }
                    this.orderedApartments = data.entrances[i].apartments;
                    if (!this.loadFromHistory) {
                      this.updateSelected(this.propTypes[1]);
                      this.selectAd(this.orderedApartments[0], data.primaryInfo.builtYear, data.realProperty.primaryInfo ? data.realProperty.primaryInfo.area : null);
                    } else {
                      this.adSelected = this.orderedApartments[0];
                      this.minified = true;
                    }

                  } else {
                    if (!this.loadFromHistory) {
                      this.selectAd(data.entrances[i].apartments[0], data.primaryInfo.builtYear, data.realProperty.primaryInfo.area);
                      this.updateSelected(this.propTypes[0]);
                    } else {
                      this.adSelected = data.entrances[i].apartments[0];
                      this.minified = true;
                    }
                  }
                } else {
                  this.updateSelected(this.propTypes[0]);
                }
              } else {
                const { apartments } = data;
                const filtredAp = apartments.filter(el => !el.hasEntrance);
                if (filtredAp.length > 1) {
                  this.orderedApartments = filtredAp;
                  this.selectAd(filtredAp[0], data.primaryInfo.builtYear, data.realProperty.primaryInfo ? data.realProperty.primaryInfo.area : null);
                  this.updateSelected(this.propTypes[1]);
                } else {
                  this.updateSelected(this.propTypes[0]);

                }
              }
            }
          }
        }
      }
      // this.apartments = data.apartments;
      search.commitAddressLoading(store, false);
      this.subTabs['showApartments'] = true;
      this.toggle('search');
      if (this.loadFromHistory) {
        if (this.searchModelTransaction.bathroomsCount) {
          this.calculateTrans = new Date().getTime();
          this.searchAgainId = '';
        } else {
          this.calculateTrans = null;
          this.predictPrice('pricePredictor');
        }
      }
      this.loadFromHistory = false;
    }).catch((err) => {
      search.commitAddressLoading(store, false);
      this.$root.$emit('buildingModelChanged', true);
      this.manualSearch = true;
      this.apartments = [];

    });
  }

  // sorting apartments start
  get orderedApartments() {
    return this.apartments;
  }

  set orderedApartments(apartments: api.ApartmentLightModel[]) {
    this.apartments = this.sortByEwid(this.sortByLevelNumber(apartments));
  }

  sortByLevelNumber(apartments: api.ApartmentLightModel[]) {
    return apartments.sort((a: api.ApartmentLightModel, b: api.ApartmentLightModel) => {
      return a.primaryInfo.levelNumber - b.primaryInfo.levelNumber;
    });
  }

  sortByEwid(apartments: api.ApartmentLightModel[]) {
    return apartments.sort((a: api.ApartmentLightModel, b: api.ApartmentLightModel) => {
      return parseInt(a.address.govId.ewid, 36) - parseInt(b.address.govId.ewid, 36);
    });
  }
  // sorting apartments end

  updateSelected(el: any): void {
    this.searchModel.propertyCategory = el.id;
    this.searchModelTransaction.propertyCategory = el.id;
    this.selectedPropertyType = el;
    this.$nextTick(() => {
      this.nextField('builtYear');
    });
    this.isSubmitValid();
  }

  setOKValToDefault() {
    const { propertyArea } = this.approved;
    Object.keys(this.approved).forEach(key => this.approved[key] = false);
    Object.keys(this.approvedTrans).forEach(key => this.approvedTrans[key] = false);
    this.approved.propertyArea = propertyArea;
    if (this.$refs.transactionForm) {
      this.$refs.transactionForm.resetApprovedTransactons();
    }
  }

  selectAd(ad: api.ApartmentLightModel, by?: number, arp?: number, index?: number) {
    // this.setOKValToDefault();
    // TODO: uncomment and solve
    // if (this.buildingModel.primaryInfo.renovationYear) {
    //   this.searchModel.renovationYear = this.buildingModel.primaryInfo.renovationYear;
    //   this.activeRenovationSlider = true;
    // } else {
    //   this.searchModel.renovationYear = null;
    //   this.activeRenovationSlider = false;
    // }

    if (this.buildingModel.primaryInfo.builtYear) {
      this.searchModel.builtYear = this.buildingModel.primaryInfo.builtYear;
      this.searchModelTransaction.builtYear = this.buildingModel.primaryInfo.builtYear;
    } else {
      this.searchModel.builtYear = null;
      this.searchModelTransaction.builtYear = null;
    }
    this.adSelected = ad;
    // this.approved.renovationYear = false;
    this.approved.propertyType = false;

    this.minified = true;
    this.subTabs['showApartments'] = true;

    this.$root.$emit('removeMarkers', true);
    this.setOKValToDefault();
    this.searchModel.addressId = this.adsAddress.uniqueIdentifier ? this.adsAddress.uniqueIdentifier : this.searchModel.addressId;
    this.searchModelTransaction.addressId = this.adsAddress.uniqueIdentifier ? this.adsAddress.uniqueIdentifier : this.searchModelTransaction.addressId;

    this.searchModel.livingArea = ad.primaryInfo.livingArea;
    this.searchModel.roomCount = ad.primaryInfo.roomCount;

    this.searchModelTransaction.livingArea = ad.primaryInfo.livingArea;
    this.searchModelTransaction.roomCount = ad.primaryInfo.roomCount;

    if (by) {
      this.searchModel.builtYear = by;
      this.searchModelTransaction.builtYear = by;
      // this.setConstructionYear(by);
    }
    if (this.selectedPropertyType.id === api.PubPropertyWellKnownCategory.House) {
      if (arp) {
        this.searchModel.propertyArea = arp;
        this.searchModelTransaction.propertyArea = arp;
      }
    }

  }

  propLimitLabel(el: any): string {
    if (el) {
      return el.name;
    }
  }
  limitText(count: number): string {
    return `and ${count} other elements`;
  }

  created() {
    this.getSearchHistory();
    this.getBookmarks();

    // manual set to calculate for buy
    this.searchModel.transactionType = api.PubTransactionType.Buy;
    // initial set to the house

    this.searchModel.propertyCategory = this.propTypes[0]['id'];
    this.searchModelTransaction.propertyCategory = this.propTypes[0]['id'];

    this.$root.$on('resetPricePredictor', () => {
      this.resetForm();
      this.buildingModel = new api.BuildingModel();
      this.adsAddress = new api.GeoSuggestion();
      this.setOKValToDefault();
    });

    this.$root.$on('searchAddressRenamed', (name: string) => {
      this.adsAddress.name = name;
      this.$forceUpdate();
    });

    this.$root.$on('remove_address_item', () => {
      this.adsAddress = new api.GeoSuggestion();
      this.apartments = [];
      // search.commitSearchingForMarketRadarAddress(store, new api.GeoSuggestion());
      this.searchedAddress = '';

    });

    this.$root.$on('selectedLayer', (selectedLayer: string) => {
      this.selectedLayer = selectedLayer;
    });

    window.addEventListener('beforeunload', (event) => {
      search.commitSearchedPricePredictAddress(store, new api.GeoSuggestion());
    });

    this.$validator.extend('isSmaller', {
      getMessage: (field: string) => {
        const fieldName = field.split('Min');
        return 'Renovation year can not be smaller then constructon year';
      },
      validate: (value: string, otherValue: string[]) => {
        if (value && otherValue[0]) {
          return parseInt(value) >= parseInt(otherValue[0]);
        }

        return true;
      },
    });

  }

  resetForm(): void {
    this.searchedAddress = '';

    // reset default address and commit empty to store -> map will react
    this.adsAddress = new api.GeoSuggestion();
    search.commitSearchedPricePredictAddress(store, new api.GeoSuggestion());

    // reset all layers on map
    this.$root.$emit('reset_map');
    this.$root.$emit('pricePredicted', false);

    document.getElementsByClassName('switch_style')[0].className = 'switch_style mapboxgl-ctrl-group mapboxgl-ctrl second';
    this.$root.$emit('map_change_size', 'big');
    this.remove_address_item();

    // reset validator -> validator is not used anywhere in this module, maybe redundant, keep it for now - Sep, 24, 2018
    this.$validator.reset();

  }

  generateSearchName(searchModel: any) {
    // [t] - dynamic part start - no translate later
    // [/t] - dynamic part end - no translate later
    // [sq2] - dynamic part with m2 - no translate later
    let searchType = 'Rent';
    if (searchModel.transactionType === api.PubTransactionType.Buy) {
      searchType = 'Buy';
    }

    let category = 'House';

    if (searchModel.propertyCategory === api.PubPropertyWellKnownCategory.Apartment) {
      category = 'Apartment';
    }

    const bYear = 'Built year: [t]' + `${searchModel.builtYear}` + ',[/t] ';
    const rYear = searchModel.renovationYear ? 'Renovation year: [t]' + `${searchModel.renovationYear}` + ',[/t] ' : '';
    const rooms = 'Room count: [t]' + `${searchModel.roomCount}` + ',[/t] ';
    const aLiving = 'Area living: [t]' + `${searchModel.livingArea}` + '[/t][t][sq2][/t], ';
    const aProperty = searchModel.propertyCategory === api.PubPropertyWellKnownCategory.House ? 'Property area: [t]' + `${searchModel.propertyArea}` + '[/t][t][sq2][/t] ' : '';
    let address = this.searchedAddress;
    if (address === '') {
      address = this.pricePredictSearchedAddress.name;
    }
    let where = `${searchType}` + ' ' + `${category}` + ' [t]' + `${address}` + ',[/t] ' + `${bYear}` + `${rYear}` + `${rooms}` + `${aLiving}` + `${aProperty}`;

    if (where.length >= 200) {
      where = `${searchType}` + ' ' + `${category}` + ' [t]' + `${address}` + ',[/t] ' + `${bYear}` + `${rYear}` + `${rooms}` + `${aLiving}`;
      if (where.length >= 200) {
        where = `${searchType}` + ' ' + `${category}` + ' [t]' + `${address}` + ',[/t] ' + `${bYear}` + `${rYear}` + `${rooms}`;
        if (where.length >= 200) {
          where = `${searchType}` + ' ' + `${category}` + ' [t]' + `${address}` + ',[/t] ' + `${bYear}` + `${rYear}`;
        }
      }
    }

    return where;
  }

  parseGeneratedName(name: string) {
    if (name.indexOf('[t]') > -1) {
      return name.replace(/\[t\]/g, '<span notranslate>').replace(/\[\/t\]/g, '</span>').replace(/\[sq2\]/g, 'm<sup>2</sup>');
    }

    return '<span notranslate>' + `${name}` + '</span>';
  }
  parseGeneratedNameForEdit(name: string) {
    return name.replace(/\[t\]/g, '').replace(/\[\/t\]/g, '').replace(/\[sq2\]/g, '');
  }

  predictPrice(formName: string) {
    const errors = this.$validator.errors;
    // if (!this.activeRenovationSlider) {
    //   errors.remove('renovationYear', 'pricePredictor');
    // }

    if (this.selectedPropertyType.id !== api.PubPropertyWellKnownCategory.House) {
      errors.remove('propertyArea', 'pricePredictor');
    }
    setTimeout(() => {
      if (!errors.all(formName).length && !this.valuesApproved) {
        this.searchModel.pricePredictionMethod = this.typePP === 1 ? api.PricePredQueryType.TransPricePred : api.PricePredQueryType.PubPricePred; // .publication;
        globalState.commitSetLoadingButton(store, true);
        search.commitPPCalculating(store, true);

        // if (!this.activeRenovationSlider) {
        //   this.searchModel.renovationYear = null;
        // }
        if (this.selectedPropertyType.id !== api.PubPropertyWellKnownCategory.House) {
          this.searchModel.propertyArea = null;
        }
        this.searchModel.addressId = this.adsAddress.uniqueIdentifier ? this.adsAddress.uniqueIdentifier : this.searchModel.addressId;
        if (this.searchAgainModel) {
          if (JSON.stringify(this.searchAgainModel.query) === JSON.stringify(this.searchModel)) {

            history.dispatchEditLastUsedHistoryEntryPP(this.$store, this.searchAgainModel.id);
            setTimeout(() => {
              this.getSearchHistory();
              this.getBookmarks();
            }, 1000);

          } else {
            this.addToHistory(this.searchModel);
          }
        } else {
          this.addToHistory(this.searchModel);
        }
        if (this.searchModel.transactionType === 20) {
          this.searchModel.rentDealType = undefined;
        }
        api.$properties.getPubPricePrediction(this.searchModel).then((data: api.PropertyPricePrediction) => {
          if (!data) {
            Vue.prototype.$notify({
              group: 'actions',
              type: 'error',
              duration: 2500,
              text: 'Sorry, price prediction is not possible for this address.',
            });
            globalState.commitSetLoadingButton(store, false);
            return;
          }
          if (data.price) {
            this.$root.$emit('pricePredicted', {
              data,
              model: this.searchModel,
              address: this.fullAddress,
            });

            this.searchAgainId = '';
          }
          globalState.commitSetLoadingButton(store, false);
        }).catch((err) => {
          globalState.commitSetLoadingButton(store, false);
          search.commitPPCalculating(store, false);
          this.searchAgainId = '';
        });
      } else {
        globalState.commitSetLoadingButton(store, false);

        Vue.prototype.$notify({
          group: 'actions',
          type: 'error',
          duration: 2500,
          text: 'Please fill in all data and confirm',
        });
      }
    }, 200);
  }

  @Watch('pricePredictSearchedAddress', { immediate: true })
  pp() {
    if (this.pricePredictSearchedAddress && this.pricePredictSearchedAddress.name !== undefined) {
      this.adsAddress = this.pricePredictSearchedAddress;
      if (!<any>this.pricePredictSearchedAddress['fromMap']) {
        this.setStreet(this.pricePredictSearchedAddress, false);
      } else {
        search.commitAddressLoading(this.$store, false);
      }
    }
  }

  @Watch('buildingModel')
  bm() {
    if (this.buildingModel) {
      if (this.buildingModel.entrances) {
        if (this.buildingModel.entrances.length) {
          this.$root.$emit('buildingModelChanged', this.buildingModel);
        } else {
          this.$root.$emit('buildingModelChanged', new api.BuildingModel());
        }
      } else {
        this.$root.$emit('buildingModelChanged', new api.BuildingModel());
      }
    }
  }

  isSubmitValid() {
    const { id } = this.selectedPropertyType;
    const validationType = id === api.PubPropertyWellKnownCategory.House ? 'houseAdvertising' : 'apartmentAdvertising';

    // if (!this.activeRenovationSlider) {
    //   this.approved.renovationYear = true;
    // }
  }

  @Watch('selectedPropertyType')
  spt() {
    setTimeout(() => {
      if (!this.loadFromHistory) {
        if (this.selectedPropertyType.id === api.PubPropertyWellKnownCategory.House) {
          if (this.buildingModel.realProperty.primaryInfo) {
            if (this.buildingModel.realProperty.primaryInfo.area) {
              this.searchModel.propertyArea = this.buildingModel.realProperty.primaryInfo.area;
              this.searchModelTransaction.propertyArea = this.buildingModel.realProperty.primaryInfo.area;
              this.approved.propertyArea = true;
            } else {
              this.approved.propertyArea = false;
            }
          } else {
            this.approved.propertyArea = false;
          }
        }
        if (this.selectedPropertyType.id === api.PubPropertyWellKnownCategory.Apartment) {
          this.approved.propertyArea = true;
        }
      }
      this.validateAllFieldsWithValue();
    }, 10);
  }
  validateAllFieldsWithValue() {
    if (this.searchModel.livingArea !== null) {
      this.validateFiled('livingArea');
    }
  }
  // search history bookmarks
  historyDeleteActionLoading: { [key: string]: boolean } = {};
  editingFavouriteId: string = '';
  editingFavouriteName: string = '';
  autoLoadHistory: boolean = false;
  searchHistory: api.QueryListEntryLightModel<api.PricePredQueryType>[] = [];
  favoritesHistory: api.QueryListEntryLightModel<api.PricePredQueryType>[] = [];

  getSearchHistory() {

    history.dispatchGetPPModuleHistory(this.$store).then(() => {
      this.searchHistory = history.getPPModuleHistory(this.$store);
      if (this.searchHistory.length) {
        if (this.autoLoadHistory) {
          // this.searchAgain(self.searchHistory[0]);
        }
      } else {
        this.goTo();
      }
      this.$forceUpdate();

    });
  }

  getBookmarks() {

    history.dispatchGetPPModuleBookmarks(this.$store).then(() => {
      this.favoritesHistory = history.getPPModuleFavorites(this.$store);
      if (!this.favoritesHistory) {
        this.goTo();
      }
      this.$forceUpdate();

    });
  }

  addToHistory(searchModel: any) {
    const name = this.generateSearchName(searchModel);
    const queryType = this.typePP === 1 ? api.PricePredQueryType.TransPricePred : api.PricePredQueryType.PubPricePred;
    history.dispatchAddToPPModuleHistoryEntry(this.$store, { name, queryType, query: searchModel }).then((data) => {
      // TODO replace this by only changing searchHistory var
      this.getSearchHistory();
    });
  }

  goTo() {
    if (this.tabs['history']) {
      if (!this.searchHistory.length) {
        this.toggle('search');
      }
    }

    if (this.tabs['bookmarks']) {
      if (!this.favoritesHistory.length) {
        this.toggle('search');
      }
    }
  }
  removeFromHistory(index: number, index1: number, id: string) {
    // index and index are used if history is in sorted state, not used at this momment
    this.historyDeleteActionLoading[id] = true;
    this.$forceUpdate();
    history.dispatchRemoveFromPPModuleHistoryEntry(this.$store, id).then(() => {
      this.historyDeleteActionLoading[id] = false;
      // TODO  replace this by only changing searchHistory var
      this.getSearchHistory();
      this.getBookmarks();
      this.$forceUpdate();
    });

  }

  bookmarkSearch(h: api.QueryListEntryLightModel<any>, loading?: boolean) {

    if (loading) {
      // in case of delete
      this.historyDeleteActionLoading[h.id] = true;
      this.$forceUpdate();
    }
    history.dispatchBookmarkPPModuleHistoryEntry(this.$store, h).then((val: boolean) => {
      if (loading) {
        this.historyDeleteActionLoading[h.id] = false;
        this.$forceUpdate();
      }
      // TODO replace this by only changing searchHistory var
      this.getSearchHistory();
      this.getBookmarks();
    });

  }

  editFavourite(h: api.QueryListEntryLightModel<any>, noSave: boolean) {

    if (noSave) {
      this.editingFavouriteId = h.id;
      this.editingFavouriteName = this.parseGeneratedNameForEdit(h.name);
      return;
    }
    history.dispatchEditFavouritePPhModuleHistoryEntry(this.$store, { id: h.id, name: this.editingFavouriteName }).then(() => {
      // TODO replace this by only changing searchHistory var
      this.editingFavouriteId = '';
      const n: string = this.editingFavouriteName;
      this.editingFavouriteName = '';
      this.getBookmarks();
      this.getSearchHistory();

      history.dispatchGetPPModuleHistoryEntry(this.$store, h.id).then((data) => {

        api.$geo.getAddress(data.query.addressId).then((address: api.GeoAddress) => {
          this.$root.$emit('searchAddressRenamed', n);
          this.$forceUpdate();
        });
      });
    });
  }

  loadFromHistory: boolean = false;
  searchAgainId: string = '';
  searchAgainModel: api.QueryListEntryModel<any, any> = null;

  searchAgain(h: api.QueryListEntryLightModel<any>) {
    this.resetForm();
    search.commitAddressLoading(this.$store, true);
    this.searchAgainId = h.id;
    this.manualSearch = false;

    history.dispatchGetPPModuleHistoryEntry(this.$store, h.id).then((data) => {
      this.searchAgainModel = data;
      api.$geo.getAddress(data.query.addressId).then((address: api.GeoAddress) => {
        this.fullAddress = address;
        const suggestion = {
          uniqueIdentifier: data.query.addressId,
          name: `${address.street}` + ' ' + `${address.streetNumber}` + ', ' + `${address.zip}` + ' ' + `${address.locality}`,
          coordinates: address.coordinates,
        };
        this.loadFromHistory = true;
        if ((data.query as any).bathroomsCount) {
          this.changeTypePP(1);
          this.searchModelTransaction.cubature = (data.query as any).cubature;
          this.searchModelTransaction.bathroomsCount = (data.query as any).bathroomsCount;
          this.searchModelTransaction.garageCount = (data.query as any).garageCount;
          this.searchModelTransaction.houseType = (data.query as any).houseType;
          this.searchModelTransaction.quality = (data.query as any).quality;
          this.searchModelTransaction.condition = (data.query as any).condition;
          this.searchModelTransaction.microLocation = (data.query as any).microLocation;
          this.approved.cubature = true;
          this.approved.bathroomsCount = true;
          this.approved.garageCount = true;
          this.approved.houseTypes = true;
          this.approved.quality = true;
          this.approved.condition = true;
          this.approved.microLocation = true;
          Object.keys(this.approvedTrans).forEach(key => this.approvedTrans[key] = true);
        } else {
          this.changeTypePP(0);
          this.searchModelTransaction = Object.assign(this.baseTransPP, {});
          delete this.searchModelTransaction.bathroomsCount;
        }
        this.searchModelTransaction.addressId = data.query.addressId;
        this.searchModelTransaction.builtYear = (data.query as any).builtYear;
        this.searchModelTransaction.renovationYear = (data.query as any).renovationYear;
        this.searchModelTransaction.roomCount = (data.query as any).roomCount;
        this.searchModelTransaction.livingArea = (data.query as any).livingArea;
        this.searchModelTransaction.propertyArea = (data.query as any).propertyArea;
        this.setObjectLocation(<api.GeoSuggestion>suggestion).then(() => {

          this.searchModel = data.query;
          this.approved.builtYear = true;
          this.approved.renovationYear = true;
          this.approved.roomsNumber = true;
          this.approved.livingArea = true;
          this.approved.propertyType = true;
          if (data.queryType === api.PricePredQueryType.PubPricePred) {
            if (data.query['renovationYear']) {
              // this.activeRenovationSlider = true;
              // this.approved.renovationYear = true;
            } else {
              // this.approved.renovationYear = false;
              // this.activeRenovationSlider = false;

            }
          }

          this.searchModel.propertyCategory = data.query.propertyCategory;
          this.searchModelTransaction.propertyCategory = data.query.propertyCategory;
          if (data.query.propertyCategory === 100) {
            this.selectedPropertyType = this.propTypes[0];
          } else {
            this.selectedPropertyType = this.propTypes[1];
          }
          for (const i in this.propTypes) {
            if (this.propTypes[i].id === data.query.propertyCategory) {
              this.selectedPropertyType = this.propTypes[i];
            }
          }

          if (data.query.propertyArea) {
            this.approved.propertyArea = true;
          }
          // this.$validator.errors.remove('renovationYear', 'pricePredictor');
          this.$validator.errors.remove('propertyArea', 'pricePredictor');
          this.setBuildingAndApartments(suggestion);

        });

      });
    });
  }
  removingHistory: boolean = false;
  calculateTrans: number = null;
  emptyHistory(empty?: boolean) {
    this.showModal = true;

    if (empty) {
      this.removingHistory = true;
      api.$queryLists.pricePred.deleteAll(api.QueryListEntryTypes.History).then(() => {
        this.removingHistory = false;
        this.getSearchHistory();
        this.getBookmarks();
        this.showModal = false;
      });
    }
  }

  emptyBookmarks(empty?: boolean) {
    this.showModal = true;
    if (empty) {
      this.removingHistory = true;
      api.$queryLists.pricePred.deleteAll(api.QueryListEntryTypes.Favorite).then(() => {
        this.removingHistory = false;
        this.getBookmarks();
        this.getSearchHistory();
        this.showModal = false;
      });
    }
  }

  selectApartment (apartment: api.ApartmentLightModel) {
    this.adSelected = apartment;
    this.searchModel.livingArea = apartment.primaryInfo.livingArea;
    this.searchModelTransaction.livingArea = apartment.primaryInfo.livingArea;
    this.searchModel.roomCount = apartment.primaryInfo.roomCount;
    this.searchModelTransaction.roomCount = apartment.primaryInfo.roomCount;
  }

  async validateFiled(field: string) {
    try {
      await this.$validator.validate(`pricePredictor.${field}`);
    } catch (e) { }
  }

  async goNext(event: Event | undefined, currentField: string, nextfield: string) {
    this.nextField(nextfield, event);
    if (!event) {
      setTimeout(() => {
        this.validateFiled(currentField);
        this.approved[currentField] = event ? this.isValid(currentField) : true;
      }, 10);
    } else {
      await this.validateFiled(currentField);
      this.approved[currentField] = event ? this.isValid(currentField) : true;
    }
  }

  goNextLivingArea(event: Event) {
    let nextField = '';

    switch (true) {
      case (this.typePP === 1 && this.selectedPropertyType.id === 200): nextField = 'microLocation'; break;
      case (this.selectedPropertyType.id === 100): nextField = 'propertyArea'; break;
      default: nextField = 'submitForm';
    }

    this.goNext(event, 'livingArea', nextField);
  }

  @Watch('autoLoadHistory')
  autoLoadHistoryWatch() {
    if (this.autoLoadHistory) {
      localStorage.setItem('autoLoadHistory_PPModule', '1');

    } else {
      localStorage.removeItem('autoLoadHistory_PPModule');
    }
  }

  nextField(field: any, $event?: any) {
    if (field !== 'submitForm') {
      if ($event) {
        $event.preventDefault();
        $event.stopPropagation();
      }
    } else {
      this.predictPrice('pricePredictor');
    }

    const el = document.getElementsByName(field)[0] as HTMLInputElement;
    if (el) {
      el.focus();
      if (field !== 'submitForm') {
        el.select();
      }
    }
  }

  async isValid(field: string) {
    return this.validateFiled(field).then(() => {
      for (const i in this.$validator.errors.items) {
        if (this.$validator.errors.items[i].field === field) {
          return false;
        }
      }
      return false;
    });
  }

  @Watch('entranceAndBuilding')
  watchEntranceAndBuilding() {
    pp.commitSetSelectedAd(this.$store, new api.PubModel());
    this.adOnAddress = null;
    this.loadFromHistory = false;
    this.basePP = {
      propertyCategory: api.PubPropertyWellKnownCategory.House,
      roomCount: null,
      builtYear: null,
      livingArea: null,
      propertyArea: null,
    };
    this.searchModel = null;
    this.searchModelTransaction = null;
    this.buildingModel = _.cloneDeep(this.entranceAndBuilding.building);
    this.searchModel = Object.assign(this.basePP, {});
    this.searchModelTransaction = Object.assign(this.basePP, {});
    this.typePP = pricePredictorType.Advertising;
    this.searchModel.addressId = this.pricePredictSearchedAddress.uniqueIdentifier;
    this.searchModel.transactionType = api.PubTransactionType.Buy;
    this.searchModel.propertyCategory = this.propTypes[0]['id'];

    this.searchModelTransaction.addressId = this.pricePredictSearchedAddress.uniqueIdentifier;
    this.searchModelTransaction.propertyCategory = this.propTypes[0]['id'];
    this.selectedPropertyType = this.propTypes[0];
    if (this.buildingModel.primaryInfo) {
      if (this.buildingModel.primaryInfo.builtYear) {
        this.searchModel.builtYear = this.buildingModel.primaryInfo.builtYear;
        this.searchModelTransaction.builtYear = this.buildingModel.primaryInfo.builtYear;
      }

      if (this.buildingModel.primaryInfo.renovationYear) {
        this.searchModel.renovationYear = this.buildingModel.primaryInfo.renovationYear;
      }
      if (this.buildingModel.realProperty.primaryInfo) {
        if (this.buildingModel.realProperty.primaryInfo.area) {
          this.searchModel.propertyArea = this.buildingModel.realProperty.primaryInfo.area;
          this.searchModelTransaction.propertyArea = this.buildingModel.realProperty.primaryInfo.area;
          this.approved.propertyArea = true;
        } else {
          this.approved.propertyArea = false;
        }
      }
    }
    this.approved.propertyType = false;
    this.setOKValToDefault();
    const entrance = this.entranceAndBuilding.entrance;
    const building = this.entranceAndBuilding.building;
    this.manualSearch = false;
    if (entrance.apartments) {
      if (entrance.apartments.length) {
        Vue.set(this, 'apartments', entrance.apartments);
        if (entrance.apartments.length > 1) {

          this.approved.propertyType = false;
          this.orderedApartments = entrance.apartments;
          this.updateSelected(this.propTypes[1]);
          this.selectedPropertyType = this.propTypes[1];
          this.selectAd(this.orderedApartments[0], building.primaryInfo.builtYear, building.realProperty.primaryInfo ? building.realProperty.primaryInfo.area : null);
        } else {
          this.selectAd(entrance.apartments[0], building.primaryInfo.builtYear, building.realProperty.primaryInfo.area);
          this.updateSelected(this.propTypes[0]);
          this.selectedPropertyType = this.propTypes[0];
        }
      } else {
        this.updateSelected(this.propTypes[0]);
      }
    } else {
      const { apartments } = building;
      const filtredAp = apartments.filter(el => !el.hasEntrance);
      if (filtredAp.length > 1) {
        this.orderedApartments = filtredAp;
        this.selectAd(filtredAp[0], building.primaryInfo.builtYear, building.realProperty.primaryInfo ? building.realProperty.primaryInfo.area : null);
        this.updateSelected(this.propTypes[1]);
      } else {
        this.updateSelected(this.propTypes[0]);

      }
    }
    if (this.adsAddress) {
      this.toggleSubTabs('showApartments');
    }
  }
  selectAdFromSm(entrenceId: string, adId: string) {
    api.$geo.getAddress(entrenceId).then((data) => {
      const address: api.IGeoSuggestion = new api.GeoSuggestion();
      address.name = displayAddress(data);
      this.searchedAddress = address.name;
      address.uniqueIdentifier = data.entranceId;
      address.coordinates = new api.GeoCoordinates({
        longitude: data.coordinates.longitude,
        latitude: data.coordinates.latitude,
      });

      this.adsAddress = address;
      this.fullAddress = data;
      api.$publication(adId).get().then((ad) => {
        pp.commitSetSelectedAd(this.$store, ad);
        this.adOnAddress = ad;
        this.subTabs['showApartments'] = true;
        try {
          if (safeVal(ad, item => item.primaryInfo.basicInfo.transactionType)) {
            this.searchModel.transactionType = ad.primaryInfo.basicInfo.transactionType;
          }
        } catch { }
        try {
          if (safeVal(ad, item => ad.primaryInfo.layout.rooms.roomCount.value)) {
            this.searchModel.roomCount = ad.primaryInfo.layout.rooms.roomCount.value;
            this.searchModelTransaction.roomCount = ad.primaryInfo.layout.rooms.roomCount.value;
            this.approved.roomsNumber = true;
          }
        } catch { }
        try {
          if (safeVal(ad, item => item.primaryInfo.layout.size.areaCalculated)) {
            this.searchModel.livingArea = ad.primaryInfo.layout.size.areaCalculated;
            this.searchModelTransaction.livingArea = ad.primaryInfo.layout.size.areaCalculated;
            this.approved.livingArea = true;
          }
        } catch { }
        try {
          if (safeVal(ad, item => item.primaryInfo.layout.size.areaProperty.value)) {
            this.searchModel.propertyArea = ad.primaryInfo.layout.size.areaProperty.value;
            this.searchModelTransaction.propertyArea = ad.primaryInfo.layout.size.areaProperty.value;
            this.approved.propertyArea = true;
          }
        } catch { }
        try {
          if (safeVal(ad, item => item.primaryInfo.basicInfo.builtYearCalculated)) {
            this.searchModel.builtYear = ad.primaryInfo.basicInfo.builtYearCalculated;
            this.searchModelTransaction.builtYear = ad.primaryInfo.basicInfo.builtYearCalculated;
            this.approved.builtYear = true;
          }
        } catch { }
        try {
          if (safeVal(ad, item => item.primaryInfo.basicInfo.renovationYearCalculated)) {
            this.searchModel.renovationYear = ad.primaryInfo.basicInfo.renovationYearCalculated;
            // this.activeRenovationSlider = true;
            setTimeout(() => {
              // this.approved.renovationYear = true;
            }, 0);
          }
        } catch { }
        try {
          if (safeVal(ad, item => item.primaryInfo.garageInfo.garageCount.value)) {
            this.searchModelTransaction.garageCount = ad.primaryInfo.garageInfo.garageCount.value;
            this.approved.garageCount = true;
          }
        } catch { }
        try {
          if (safeVal(ad, item => item.primaryInfo.layout.bathrooms.bathroomCount.value)) {
            this.searchModelTransaction.bathroomsCount = ad.primaryInfo.layout.bathrooms.bathroomCount.value;
            this.approved.bathroomsCount = true;
          }
        } catch { }
        try {
          this.approved.renovationYear = true;
        } catch { }
        try {
          if (safeVal(ad, item => item.primaryInfo.basicInfo.propertyCategory)) {
            this.searchModel.propertyCategory = ad.primaryInfo.basicInfo.propertyCategory;
            this.searchModelTransaction.propertyCategory = ad.primaryInfo.basicInfo.propertyCategory;
            this.propTypes.filter((t) => {
              if (t.id === this.searchModel.propertyCategory) {
                this.updateSelected(t);
              }
            });
            this.approved.propertyType = true;

          }
        } catch {
        }
        this.searchModel.addressId = data.entranceId || data.entranceAddressId;
        this.searchModelTransaction.addressId = data.entranceId || data.entranceAddressId;
        api.$building(this.searchModel.addressId).get().then((data: api.BuildingModel) => {
          pp.commitSetSelectedBuilding(this.$store, data);
          this.$emit('buildingFromAd', {
            address,
            building: data,
          });
          if (data.entrances.length) {
            pp.commitSetSelectedEntrance(this.$store, data.entrances[0]);
            for (const i in data.entrances) {
              if (data.entrances[i].address.entranceId) {
                // if (data.entrances[i].address.entranceAddressId === address.uniqueIdentifier) {
                if (data.entrances[i].apartments) {
                  if (data.entrances[i].apartments.length) {
                    Vue.set(this, 'apartments', data.entrances[i].apartments);
                    this.orderedApartments = data.entrances[i].apartments;
                    this.adSelected = this.orderedApartments[0];
                    this.minified = true;
                  }
                } else {
                  const { apartments } = data;
                  const filtredAp = apartments.filter(el => !el.hasEntrance);
                  if (filtredAp.length) {
                    this.orderedApartments = filtredAp;
                    this.adSelected = this.orderedApartments[0];
                    this.minified = true;
                  }
                }
              }
              // }
            }
          }
          // this.buildingModel = data;

          if (
            this.searchModel.transactionType &&
            this.searchModel.roomCount &&
            this.searchModel.livingArea &&
            this.searchModel.builtYear &&
            this.searchModel.propertyCategory
          ) {
            //
            this.predictPrice('pricePredictor');
          } else {
            this.$validator.validateAll('pricePredictor').then(() => {
              // if (this.activeRenovationSlider) {
              //   if (this.$validator.errors.has('renovationYear', 'pricePredictor')) {
              //     const el = document.getElementsByName('renovationYear')[0] as HTMLInputElement;
              //     el.focus();
              //   }
              // } else {
              //   // this.$validator.reset();
              //   if (this.$validator.errors.has('renovationYear', 'pricePredictor')) {
              //     this.$validator.errors.remove('renovationYear', 'pricePredictor');
              //   }
              //   const el = document.getElementsByName(this.$validator.errors.items[0].field)[0] as HTMLInputElement;
              //   setTimeout(() => {
              //     el.focus();
              //   }, 2000);

              // }
            });
          }
        });
      });
    });
  }
  @Watch('mapIsLoaded')
  watchMapIsLoded() {
    if (this.mapIsLoaded) {
      if (this.$route.query.adId && this.$route.query.entrenceId) {
        this.selectAdFromSm(<string>this.$route.query.entrenceId, <string>this.$route.query.adId);
        this.$router.replace({ query: {} });
      }
    }
  }

  get validatorErrors() {
    return this.$validator.errors.items;
  }

  @Watch('validatorErrors')
  watchValidatorErrors() {
    if (this.$validator.errors.items && this.$validator.errors.items.length) {
      for (const i in this.$validator.errors.items) {
        if (this.approved[this.$validator.errors.items[i].field]) {
          this.approved[this.$validator.errors.items[i].field] = false;
        }
      }
    }
  }

  // @Watch('activeRenovationSlider')
  // watchActiveRenovationSlider() {
  //   setTimeout(() => {
  //     if (this.activeRenovationSlider) {
  //       if (!this.isValid('renovationYear')) {
  //         this.approved.renovationYear = false;
  //       } else {
  //         this.approved.renovationYear = true;
  //       }
  //     } else {
  //       if (this.$validator.errors.has('renovationYear', 'pricePredictor')) {
  //         this.$validator.errors.remove('renovationYear', 'pricePredictor');
  //       }
  //     }
  //   }, 0);
  // }

  getTypePP(type: number) {
    return type === 1 ? 'Advertisement Price' : 'Transaction Price';
  }
  @Watch('adsAddress')
  async onAdsAddressChange() {
    if (this.adsAddress && this.adsAddress.uniqueIdentifier) {
      const ratings = await api.$entrance(this.adsAddress.uniqueIdentifier).getEntranceRatings();
      if (ratings) {
        MRStore.setEntranceRatings(store, ratings);
      } else {
        MRStore.setEntranceRatings(store, null);
      }
    }
  }
}
