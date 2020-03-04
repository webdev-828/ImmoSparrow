import Vue from 'vue';
import { Component, Prop, Provide } from 'vue-property-decorator';
import template from './index.template.vue';
import Base from '../../base';
import Address from '../../address';
import { IAgencyModel, $agency } from '@immosparrow/cockpit-api-v2';
import store from '../../../store';
import { commitUpdateAgencyLight } from '../../../store/modules/authStatesModule';
import validation from '../data/validation';
import { dispatchGetAgency } from '../../../store/modules/adminModule';
import profileImgUploader from '../../profileImgUploader';
import { Validator } from 'vee-validate';

export interface IimgData {
  uploadedImage: ArrayBuffer | string | null;
  avatar?: File;
  removedAvatar: boolean;
}

@Component({
  name: 'Tab1',
  mixins: [template],
  components: { Address, profileImgUploader },
})
export default class Tab1 extends Base {

  imgData: IimgData = {
    uploadedImage: null,
    avatar: null,
    removedAvatar: false,
  };

  @Provide('validator') $validator: Validator = this.$validator;

  @Prop()
  agencyInfo: IAgencyModel;

  mounted() {
    this.$validator.dictionary.merge(validation);
  }

  async updateAgencyInfo() {
    this.$validator.validateAll().then(async (isValid: boolean) => {
      if (isValid) {
        let resUpdatePhoto = 0;
        const updateInf = {
          id: this.agencyInfo.id,
          name: this.agencyInfo.primaryInfo.name,
          address: { ...this.agencyInfo.address },
          contactInfo: { ...this.agencyInfo.contactInfo },
          logo: this.agencyInfo.logo,
        };
        const resUpdateAg = await $agency(this.agencyInfo.id).update(this.agencyInfo);
        if (this.imgData.avatar) {
          resUpdatePhoto = await $agency(updateInf.id).updateLogo(this.imgData.avatar);
          const updatedAgency = await dispatchGetAgency(store, this.agencyInfo.id);
          updateInf.logo = updatedAgency.logo;
        }

        if (this.imgData.removedAvatar) {
          await $agency(updateInf.id).deleteLogo();
          resUpdatePhoto = 0;
          updateInf.logo = undefined;
        }

        if (resUpdateAg && resUpdatePhoto === 0) {
          commitUpdateAgencyLight(store, updateInf);
        }
      }
    });
  }
}
