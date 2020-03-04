import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';
import template from './index.template.vue';
import Base from '../../../base';
import { ILegalPersonLightModel } from '@immosparrow/cockpit-api-v2';

@Component({
  name: 'LegalPersonDetails',
  mixins: [template],
})

export default class LegalPersonDetails extends Base {
  @Prop()
  closeModal: Function;

  @Prop()
  legalPerson: ILegalPersonLightModel;
}
