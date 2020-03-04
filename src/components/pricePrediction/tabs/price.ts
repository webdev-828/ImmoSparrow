import { Component, Watch, Prop } from 'vue-property-decorator';
import Base from '../../base';
import template from './price.template.vue';
import autocomplete from '../../addressAutocomplete';
import modal from '../../modal';
import VueSlider from 'vue-slider-component';
import * as api from '@immosparrow/cockpit-api-v2';
import * as pp from '../../../store/modules/pricePredictionModule';
import RadialProgress from './../../transparencyModule/radial.progress.vue';
import { safeVal } from '@immosparrow/cockpit-lib-core';
import StarRating from '../../shared/starRating';
import _ from 'lodash';
import * as search from '../../../store/modules/searchStatesModule';
import store from '../../../store';
import moment from 'moment';

interface MicroLocation {
  id: number;
  name: string;
}

@Component({

  mixins: [template],
  components: {
    autocomplete,
    modal,
    VueSlider,
    StarRating,
    'radial-progress-bar': RadialProgress,
  },
})
export default class Price extends Base {

  @Prop()
  prediction: any;

  @Prop()
  predictionModel: api.PropertyPubPricePredictionQuery;

  @Prop()
  pricePredictionNotOk: boolean;

  pubPredictedPrice: api.PropertyPricePrediction = null;
  predictedPrice: api.PropertyPricePrediction = null;
  predictedPriceStats: api.PricePredStatsModel = null;
  predictedAddress: api.GeoAddress = null;
  predictedModel: any = null;
  priceTrendsChart: boolean = false;
  backgroundColorsForPriceTrends: any = [];
  completedSteps0: number = 80;
  completedSteps1: number = 45;
  completedSteps2: number = 82;
  completedSteps3: number = 25;
  completedSteps4: number = 97;
  // tslint:disable-next-line
  localize: any = window['Localize'];
  totalSteps: number = 100;
  slidePage: number = 2;
  competitorAdd: boolean = false;
  competitorOne: boolean = false;
  waitingforGeneratingPdf: boolean = false;

  competitorsOptions: string[] = [
    'Wüest & Partner',
    'Fahrländer',
    'Iazi',
    'PriceHubble',
  ];
  competitors: string = '';
  val: Function = safeVal;

  competitorAdded() {
    this.competitorOne = true;
    this.competitorAdd = false;
  }

  pageChanged(pageNum: number) {
    const newPageNum = pageNum + 1;
    this.slidePage = newPageNum * 2;
  }

  get selectedEntranceAddress() {
    return pp.getSelectedEntrance(this.$store).address;
  }

  generatePdf(isTransaction: boolean) {
    const exportObject: api.PricePredictionExportModel = api.$newObj(api.PricePredictionExportModel);

    if (this.pubPredictedPrice) {
      exportObject.priceInfo = isTransaction ? this.predictedPrice : this.pubPredictedPrice;
    } else {
      exportObject.priceInfo = this.predictedPrice;
    }
    exportObject.mapImage = this.mapImage().substring(23); // remove data url
    exportObject.isTransaction = isTransaction;
    let propertyInfo: api.PropertyInfo = api.$newObj(api.PropertyInfo);
    propertyInfo = Object.assign({}, api.PropertyInfo.fromJS(this.predictedModel));
    // remap predictedModel to match PropertyInfo model
    propertyInfo.builtYear = this.predictedModel.builtYear;
    propertyInfo.livingArea = this.predictedModel.livingArea;
    propertyInfo.bathroomsCount = this.predictedModel.bathroomsCount;
    propertyInfo.garageCount = this.predictedModel.garageCount;
    propertyInfo.quality = this.getTranslatedNameOfEnumValue('PricePredQualityType', this.predictedModel.quality);
    propertyInfo.cubature = this.predictedModel.cubature;
    propertyInfo.roomCount = this.predictedModel.roomCount;
    propertyInfo.propertyCategory = this.predictedModel.propertyCategory;
    propertyInfo.propertyArea = this.predictedModel.propertyArea;
    propertyInfo.microLocation = this.getTranslatedMicroLocationName(this.predictedModel.microLocation);
    propertyInfo.condition = this.getTranslatedNameOfEnumValue('PricePredPropertyConditionType', this.predictedModel.condition);
    propertyInfo.houseType = this.getTranslatedNameOfEnumValue('PricePredPropertyHouseType', this.predictedModel.houseType);

    switch (propertyInfo.propertyCategory) {
      case 200:
        propertyInfo.propertyCategoryName = this.localize.translate('Apartment');
        break;
      case 100:
        propertyInfo.propertyCategoryName = this.localize.translate('House');
        break;
    }

    // end remap
    const selectedAddress = this.selectedEntranceAddress;
    const customAddress = new api.GeoAddress({
      street: selectedAddress.street,
      streetNumber: selectedAddress.streetNumber,
      zip: selectedAddress.zip,
      locality: selectedAddress.locality,
      state: selectedAddress.state,
    });
    propertyInfo.address = customAddress;
    exportObject.propertyInfo = propertyInfo;
    this.waitingforGeneratingPdf = true;
    api.$properties.exportPricePredictionToDocument(exportObject, api.DocumentFormat.Pdf)
      .then((response) => {
        const saveBlob = (() => {
          const a = document.createElement('a');
          document.body.appendChild(a);
          return (blob: any, fileName: string) => {
            const url = window.URL.createObjectURL(blob);
            a.href = url;
            a.download = fileName;
            a.click();
            window.URL.revokeObjectURL(url);
            a.remove();
          };
        })();
        saveBlob(response.data, `${this.selectedEntranceAddress.street}_${this.selectedEntranceAddress.streetNumber}_${this.selectedEntranceAddress.locality}_${moment().format('DD_MM_YYYY_h_mm')}.${response.headers['content-type'].split('/')[1]}`);
        this.waitingforGeneratingPdf = false;
      }).catch((error: any) => {
        this.showErrorMessage('Sorry, something went wrong');
        this.waitingforGeneratingPdf = false;
      });
  }

  minVal: number = 0;
  maxVal: number = 0;
  chartDataLocality: any = [];
  yearsMin: any = [];
  yearsMax: any = [];

  // not used
  chartData: any = {
    type: 'line',
    data: {
      labels: [],
      datasets: [

      ],
    },
    options: {
      scales: {
        yAxes: [{
          display: true,
          ticks: {
            beginAtZero: true,
            // stepSize: 1
          },
        }],
        xAxes: [{
          display: true,
        }],
      },
      legend: {
        display: false,
      },
      tooltips: {
        mode: 'index',
        intersect: false,
      },
      hover: {
        mode: 'index',
        intersect: false,
      },
    },
  };

  getType(enumType: number): string {
    return enumType === 1 ? 'advertising' : 'transaction';
  }

  @Watch('prediction')
  aa() {

    try {
      this.priceTrendsChart = false;
      this.predictedPrice = null;
      this.predictedPriceStats = null;
      this.predictedAddress = null;
      this.predictedModel = null;
      this.pubPredictedPrice = null;
      this.predictedPriceStats = _.cloneDeep(this.prediction.data.stats);
      this.predictedAddress = _.cloneDeep(this.prediction.address);
      this.predictedModel = _.cloneDeep(this.prediction.model);
      if (this.prediction.adData) {
        this.pubPredictedPrice = _.cloneDeep(this.prediction.adData);
        const tempObj = _.cloneDeep(this.prediction.data);
        tempObj.pricePerSqm = this.pubPredictedPrice.pricePerSqm;

        this.predictedPrice = tempObj;
      } else {
        this.predictedPrice = _.cloneDeep(this.prediction.data);
      }

      const a: any = [];
      const mins: any = [];
      const maxs: any = [];
      const years: any = [];
      try {
        const trends: api.PricePredStatsPriceTrend[] = this.predictedPriceStats.locality.averagePrices.priceTrends;
        for (const i in trends) {
          a.push([
            trends[i].year,
            trends[i].average ? trends[i].average.toFixed(2) : 0,
          ]);

          years.push(trends[i].year);

          if (trends[i].min) {
            mins.push(trends[i].min);
          } else {
            mins.push(0);
          }
          if (trends[i].average) {
            maxs.push(trends[i].average.toFixed(2));
          } else {
            maxs.push(0);
          }

        }
      } catch (err) {
        // console.log(err);
      }
      this.maxVal = Math.max(...maxs);
      this.minVal = Math.min(...mins);

      this.yearsMin = Math.min(...years);
      this.yearsMax = Math.max(...years);
      if (a.length) {

        this.priceTrendsChart = true;
        this.chartDataLocality = a;
      }
    } catch { }
    setTimeout(() => {
      search.commitPPCalculating(store, false);
    }, 100);
  }
  getNameOfEnumValue(enumName: string, enumId: any) {
    const enumValues = api[enumName];
    let enumPropName = '' ;
    for (const n in enumValues) {
      if (typeof enumValues[n] === 'number' && enumValues[n] === enumId) {
        enumPropName = n;
      }
    }

    return enumPropName;
  }

  getTranslatedNameOfEnumValue(enumName: string, enumId: any) {
    return this.localize.translate(this.getNameOfEnumValue(enumName, enumId));
  }
  getTranslatedMicroLocationName(id: any) {
    const microLocationTypes: MicroLocation[] = [{
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

    return this.getMicroLocationType(microLocationTypes, id);
  }
  getMicroLocationType(microLocationTypes: MicroLocation[], id: number): string {
    // Note undefined is returned if object not found
    return this.localize.translate(microLocationTypes.find(type => type.id === id).name);
  }

  getTwo(a: any) {
    try {
      return parseFloat(a).toFixed(2);
    } catch   {
      return a;
    }
  }

  chartColors: any = {
    red: 'rgb(255, 99, 132)',
    orange: 'rgb(255, 159, 64)',
    yellow: 'rgb(255, 205, 86)',
    green: 'rgb(75, 192, 192)',
    blue: 'rgb(54, 162, 235)',
    purple: 'rgb(153, 102, 255)',
    grey: 'rgb(231,233,237)',
  };

  fillColors: any = [
    this.chartColors.green,
    this.chartColors.orange,
    this.chartColors.yellow,
    this.chartColors.grey,
    this.chartColors.red,
    this.chartColors.blue,
    this.chartColors.purple];
}
