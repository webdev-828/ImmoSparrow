import { Component, Prop } from 'vue-property-decorator';
import { mixins } from 'vue-class-component';
import template from './TransactionFormTemplate.vue';
import {
  PricePredPropertyHouseType, PricePredQualityType,
  PricePredPropertyConditionType,
} from '@immosparrow/cockpit-api-v2';
import { TransactionModel } from '@models/form';
import GlobalMixin from '@/mixins/global';

@Component({
  mixins: [template],
  inject: ['$validator'],
})
export default class TransactionForm extends mixins(GlobalMixin) {
  @Prop({ required: true })
  transactionModel: TransactionModel;
  @Prop({ required: true })
  formName: string;
  @Prop({ required: true })
  propertyTypeId: number;
  @Prop({ required: true })
  approved: Object;

  houseTypes = [
    { id: PricePredPropertyHouseType.Detached, name: 'Detached' },
    { id: PricePredPropertyHouseType.Attached, name: 'Attached' },
  ];
  constructionQualities = [
    { id: PricePredQualityType.Bad, name: 'Bad' },
    { id: PricePredQualityType.Average, name: 'Average' },
    { id: PricePredQualityType.Good, name: 'Good' },
    { id: PricePredQualityType.VeryGood, name: 'Very Good' },
  ];
  buildingConditions = [
    { id: PricePredPropertyConditionType.Bad, name: 'Bad' },
    { id: PricePredPropertyConditionType.Intact, name: 'Intact' },
    { id: PricePredPropertyConditionType.Renovated, name: 'Renovated' },
    { id: PricePredPropertyConditionType.AsNew, name: 'As New' },
  ];
  microLocations = [
    { id: 1.0, name: 'Unsuitable situation' },
    { id: 1.5, name: 'Unfavorable situation' },
    { id: 2.0, name: 'Situation with deficits' },
    { id: 2.5, name: 'Situation with light deficits' },
    { id: 3.0, name: 'Average situation' },
    { id: 3.5, name: 'Average-good situation' },
    { id: 4.0, name: 'Good situation' },
    { id: 4.5, name: 'Excellent  situation' },
    { id: 5.0, name: 'Outstanding situation' },
  ];
}
