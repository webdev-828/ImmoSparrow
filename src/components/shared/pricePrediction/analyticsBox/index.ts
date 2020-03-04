import { Component, Prop } from 'vue-property-decorator';
import { mixins } from 'vue-class-component';
import template from './AnalyticsBoxTemplate.vue';
import { PropertyPricePrediction, PubTransactionType } from '@immosparrow/cockpit-api-v2';
import GlobalMixin from '@/mixins/global';

@Component({
  mixins: [template],
  inject: ['$validator'],
})
export default class PricePredictionAnalyticsBox extends mixins(GlobalMixin) {
  @Prop({ required: true })
  prediction: PropertyPricePrediction;
  @Prop({ required: true })
  transactionType: PubTransactionType;
  @Prop({ required: true })
  livingArea: number;
  @Prop({ default: false })
  isTransaction: boolean;
  @Prop({ default: '#5c90d2' })
  color: string;
}
