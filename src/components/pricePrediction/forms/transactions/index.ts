import { Component, Prop, Watch } from 'vue-property-decorator';
import Base from '../../../base';
import template from './template.vue';
import * as api from '@immosparrow/cockpit-api-v2';
import * as history from '../../../../store/modules/history';
import * as search from '../../../../store/modules/searchStatesModule';
import store from '../../../../store';

const validationCheck = {
  house: ['builtYear', 'microLocation', 'garageCount', 'cubature', 'bathroomsCount', 'houseTypes', 'roomsNumber', 'livingArea', 'propertyArea', 'quality', 'condition', 'propertyType'],
  apartment: ['builtYear', 'microLocation', 'garageCount', 'bathroomsCount', 'roomsNumber', 'livingArea', 'quality', 'condition', 'propertyType'],
};

@Component({
  mixins: [template],
})
export default class Transactions extends Base {

  @Prop()
  searchModelTransaction: any;

  @Prop()
  searchModel: any;

  @Prop()
  calculateTrans: boolean;

  @Prop()
  activeRenovationSlider: boolean;

  @Prop()
  fullAddress: api.GeoAddress;

  @Prop()
  addToHistory: Function;

  @Prop()
  approved: any;

  searchMap: boolean = false;

  // tslint:disable-next-line
  localize: any = window['Localize'];

  propTypes: {id: number; name: string}[] = [{
    id: 100,
    name: 'House',
  }, {
    id: 200,
    name: 'Apartment',
  }];

  get valuesApproved () {
    const validationType = this.selectedPropertyType.id === 100 ? 'house' : 'apartment';

    return !!Object.keys(this.approved).find((key) => {
      if (validationCheck[validationType].includes(key)) {
        return this.approved[key] === false;
      }
    });
  }

  isSubmitValid() {
    const { id } = this.selectedPropertyType;
    const validationType = id === api.PubPropertyWellKnownCategory.House ? 'house' : 'apartment';
  }

  get livingSpaceSlider() {
    return {
      min: this.selectedPropertyType.id === 100 ? 20 : 10,
      max: this.selectedPropertyType.id === 100 ? 600 : 400,
    };
  }

  buttonIsLoading: boolean = false;

  roomsSlider = {
    min: 1,
    max: 14,
  };

  propertySpaceSlider = {
    min: 50,
    max: 5000,
  };

  microLocationTypes: {id: number; name: string}[] = [{
    id: 1.0,
    name: 'Unsuitable situation',
  }, {
    id: 1.5,
    name: 'Unfavorable situation',
  }, {
    id: 2.0,
    name: 'Situation with deficits',
  }, {
    id: 2.5,
    name: 'Situation with light deficits',
  }, {
    id: 3.0,
    name: 'Average situation',
  }, {
    id: 3.5,
    name: 'Average-good situation',
  }, {
    id: 4.0,
    name: 'Good situation',
  }, {
    id: 4.5,
    name: 'Excellent  situation',
  }, {
    id: 5.0,
    name: 'Outstanding situation',
  }];
  get selectedPropertyType() {
    return this.propTypes.find(el => el.id === this.searchModelTransaction.propertyCategory);
  }

  set selectedPropertyType(el) {
    this.searchModelTransaction.propertyCategory = el.id;
    this.$nextTick(() => {
      this.$validator.errors.clear('pricePredictorTrans');
      this.$validator.reset();
      this.isSubmitValid();
      this.$emit('setPropertyType', el);
    });
  }
  created() {
    this.$nextTick(() => {
      this.$validator.reset();
    });
    this.isSubmitValid();
    setTimeout(() => {
      this.validateFiled('propertyArea').then(() => {
        if (this.isValid('propertyArea')) {
          this.approved.propertyArea = true;
        }
      });
      this.validateAllFieldsWithValue();
    }, 0);

  }

  validateAllFieldsWithValue() {
    if (this.searchModel.livingArea !== null) {
      this.validateFiled('livingArea');
    }
  }
  convertEnumToArray(enumName: string) {
    const enumValues = api[enumName];
    const map: {id: number; name: string}[] = [];

    for (const n in enumValues) {
      if (typeof enumValues[n] === 'number') {
        map.push({ id: <any>enumValues[n], name: n });
      }
    }

    return map;
  }

  getValue(selectedId: number, data: {id: number; name: string}[]) {
    if (selectedId) {
      return data.find(el => el.id === selectedId);
    }
  }

  propLimitLabel(el: any): string {
    if (el) {
      return el.name.replace(/([A-Z]+)/g, ' $1').replace(/([A-Z][a-z])/g, ' $1');
    }
  }

  limitText(count: number): string {
    return `and ${count} other elements`;
  }

  updateSelected(el: any): void {
    this.searchModelTransaction.propertyCategory = el.id;
    this.selectedPropertyType = el;
    this.$nextTick(() => {
      this.$validator.errors.clear('pricePredictorTrans');
      this.$validator.reset();
      this.isSubmitValid();
    });
  }

  async isValid(field: string) {
    await this.validateFiled(field);
    for (const i in this.$validator.errors.items) {
      if (this.$validator.errors.items[i].field === field) {
        return false;
      }
    }
    return true;
  }

  async validateFiled(field: string) {
    try {
      await this.$validator.validate(`pricePredictorTrans.${field}`);
      for (const i in this.$validator.errors.items) {
        if (this.$validator.errors.items[i].field === field) {
          this.approved[field] = false;
        }
      }
      this.isSubmitValid();
    } catch (e) {}
  }

  nextField(field: any, $event?: any) {
    this.isSubmitValid();
    if (field !== 'submitForm') {
      if ($event) {
        $event.preventDefault();
        $event.stopPropagation();
      }
    } else {
      setTimeout(() => {
        if (!(this.valuesApproved || this.$validator.errors.items.length > 0 || this.$store.getters['globalStatesModule/loadingButton'] && this.searchMap)) {
          this.sendData();
        }
      }, 10);
    }
    const el = document.getElementsByName(field)[0] as HTMLInputElement;
    el.focus();

    if (field !== 'submitForm') {
      el.select();
    }
  }

  resetApprovedTransactons() {
    Object.keys(this.approved).forEach((key: string) => this.approved[key] = false);
    setTimeout(() => {
      this.validateFiled('propertyArea').then(() => {
        if (this.isValid('propertyArea')) {
          this.approved.propertyArea = true;
        }
      });
    }, 0);
  }

  async goNext(event: Event | undefined, currentField: string, nextfield: string) {
    await this.validateFiled(currentField);
    if (!event) {
      this.$forceUpdate();
      setTimeout(async () => {
        this.approved[currentField] = await this.isValid(currentField);
        this.nextField(nextfield, event);
      },         10);
    } else {
      this.approved[currentField] = event ? await this.isValid(currentField) : true;
      this.nextField(nextfield, event);
    }
  }

  async sendData() {
    this.searchModelTransaction.builtYear = this.searchModel.builtYear;
    this.searchModelTransaction.roomsNumber = this.searchModel.roomsNumber;
    this.buttonIsLoading = true;
    const { cubature, propertyArea, transactionType } = this.searchModelTransaction;
    if (this.selectedPropertyType.id === api.PubPropertyWellKnownCategory.Apartment) {
      delete this.searchModelTransaction.cubature;
      delete this.searchModelTransaction.propertyArea;
    }
    this.searchModelTransaction.transactionType = api.PubTransactionType.Buy;
    this.searchModelTransaction.pricePredictionMethod = api.PricePredQueryType.TransPricePred;
    search.commitPPCalculating(store, true);

    const ppAdvertising = api.$newObj(api.PropertyPubPricePredictionQuery);

    delete ppAdvertising.renovationYear;
    if (this.searchModelTransaction.propertyCategory === api.PubPropertyWellKnownCategory.Apartment) {
      delete ppAdvertising.propertyArea;
    }

    Object.keys(ppAdvertising).forEach((key: string) => ppAdvertising[key] = this.searchModelTransaction[key]);

    this.addToHistory(this.searchModelTransaction);

    const transData: api.PropertyPricePrediction[] = await api.$properties.getTransPricePrediction(this.searchModelTransaction);
    const adData: api.PropertyPricePrediction = await api.$properties.getPubPricePrediction(ppAdvertising);

    if (transData[0].price) {
      this.$root.$emit('pricePredicted', {
        adData,
        data: transData[0],
        model: this.searchModelTransaction,
        address: this.fullAddress,
      });
    } else {
      search.commitPPCalculating(store, false);
    }
    this.searchModelTransaction.cubature = cubature;
    this.searchModelTransaction.propertyArea = propertyArea;
    this.searchModelTransaction.transactionType = transactionType;
    this.buttonIsLoading = false;
  }

  @Watch('calculateTrans', { immediate: true })
  watchcalculateTrans() {
    if (this.calculateTrans) {
      this.$nextTick(async () => {
        const isValid = await this.$validator.validateAll('pricePredictorTrans');
        if (isValid) {
          this.sendData();
        }
      });
    }
  }
}
