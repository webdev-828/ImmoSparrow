import Vue from 'vue';
import { Component, Prop, Inject } from 'vue-property-decorator';
import template from './template.vue';
import Base from '../base';
import { IimgData } from '../myProfileTabs/tab1/tab1';
import validation from './data/validation';

@Component({
  name: 'ProfileImgUploader',
  mixins: [template],
})
export default class ProfileImgUploader extends Base {

  @Inject('validator') $validator: any;

  @Prop()
  imgData: IimgData;

  @Prop()
  defaultAvatarLink: string;

  errors: any;

  mounted() {
    this.$validator.dictionary.merge(validation);
  }

  removeAvatar() {
    this.$refs.avatar.value = '';
    this.imgData.uploadedImage = null;
    this.imgData.avatar = undefined;
    this.imgData.removedAvatar = !this.imgData.removedAvatar;
    this.errors.clear();
  }

  onFileChange({ target }: {target: HTMLInputElement}) {
    this.imgData.removedAvatar = false;
    const files = target.files;
    if (!files.length) {
      return;
    }
    this.createImage(files[0]);
  }

  createImage(file: File) {
    const reader = new FileReader();

    reader.onload = (e: Event) => {
      this.imgData.avatar = file;
      this.imgData.uploadedImage = (<FileReader>e.target).result;
    };
    reader.readAsDataURL(file);
  }
}
