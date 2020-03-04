import Vue from 'vue';
import { Component, Prop, Provide } from 'vue-property-decorator';
import template from './tab1.template.vue';
import Base from '../../base';
import { $authUser, IUserProfileModel } from '@immosparrow/cockpit-api-v2';
import validation from '../data/validation';
import { commitUpdateAvatar, commitUpdateFAndLNames } from '../../../store/modules/authStatesModule';
import store from '../../../store';
import Address from '../../address';
import profileImgUploader from '../../profileImgUploader';

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

  @Provide('validator') $validator: any = this.$validator;

  @Prop()
  user: IUserProfileModel;

  @Prop()
  setShortInfo: Function;

  mounted() {
    this.$validator.dictionary.merge(validation);
  }

  updateUserData() {
    this.$validator.validateAll().then(async (isValid: boolean) => {
      if (isValid) {
        await $authUser.profile.update(this.user);
        setTimeout(() => {
          Vue.prototype.$notify({
            group: 'actions',
            type: 'success',
            duration: 2500,
            text: 'Profile was updated',
          });
        },         500);
        const { lastName , firstName } = this.user.primaryInfo;
        commitUpdateFAndLNames(store, { firstName, lastName });

        if (this.imgData.avatar) {
          await $authUser.profile.updatePhoto(this.imgData.avatar);
          await $authUser.profile.update(this.user);
        }

        if (this.imgData.removedAvatar) {
          await $authUser.profile.deletePhoto();
        }

        const user = await $authUser.profile.get();

        if (!user.photo && this.imgData.removedAvatar) {
          commitUpdateAvatar(store, undefined);
        }

        if (user.photo && this.imgData.avatar) {
          commitUpdateAvatar(store, user.photo);
        }
        this.setShortInfo(user);
      }
    });
  }
}
