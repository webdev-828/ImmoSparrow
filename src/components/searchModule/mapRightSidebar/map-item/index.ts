import { Component, Prop, Watch } from 'vue-property-decorator';
import { safeVal } from '@immosparrow/cockpit-lib-core';
import template from './template.vue';
import BaseComponent from '../../../base';
import { getMainCategory1, formatPrice, getGoogleStreetViewImage } from '../../../sharedFunctions';
import GetTimeUtc from '../../../getTimeUtc';
@Component({
  mixins: [template],
  components: { GetTimeUtc },
})

export default class MapItem extends BaseComponent {

  @Prop({ default: null })
    ad: any;

  @Prop()
    selectedIndex: number;

  @Prop()
    index: number;

  addToFav: boolean = false;

  val: Function = safeVal;
  getMainCategory: Function = getMainCategory1;
  formatPrice: Function = formatPrice;

  photo: string = 'static/img/house-placeholder-scaled.png';

  shortenTitle(title: string) {
    if (title !== undefined) {
      if (title.length >= 60) {
        return `${title.substring(0, 60)}...`;
      }
      return title;

    }
  }

  created() {

    if (!this.ad.pictures) {
      getGoogleStreetViewImage(this.ad.address.coordinates.latitude, this.ad.address.coordinates.longitude).then((data: string) => {
        this.photo = data;
      });
    } else {
      if (!this.ad.pictures.length) {
        getGoogleStreetViewImage(this.ad.address.coordinates.latitude, this.ad.address.coordinates.longitude).then((data: string) => {
          this.photo = data;
        });
      }
    }
  }

  @Watch('ad')
    watchAd() {
    if (!this.ad.pictures) {
      getGoogleStreetViewImage(this.ad.address.coordinates.latitude, this.ad.address.coordinates.longitude).then((data: string) => {
        this.photo = data;
      });
    } else {
      if (!this.ad.pictures.length) {
        getGoogleStreetViewImage(this.ad.address.coordinates.latitude, this.ad.address.coordinates.longitude).then((data: string) => {
          this.photo = data;
        });
      }
    }
  }

  log(a: any) {
    // console.log(a);
  }

}
