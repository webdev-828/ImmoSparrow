import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';
import template from './index.template.vue';
import Base from '../../../base';
import { LegalPersonMasterModel } from '@immosparrow/cockpit-api-v2';
import Address from '../../../address/index';
import validation from '../../data/validation';

@Component({
  name: 'MasterDetails',
  mixins: [template],
  components: { Address },
})

export default class MasterDetails extends Base {
  @Prop()
  closeModal: Function;

  @Prop()
  masterSubmit: Function;

  @Prop()
  currentMaster: LegalPersonMasterModel;

  mounted() {
    this.$validator.dictionary.merge(validation);
  }

  validateAndSubmit() {
    this.$validator.validateAll().then((isValid) => {
      if (isValid) {
        this.masterSubmit(this.currentMaster);
      }
    });
  }
}
