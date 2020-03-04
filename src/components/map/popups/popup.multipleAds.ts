import template from './popup.multipleAds.template.vue';
import Base from '../../base';
import { Component, Prop } from 'vue-property-decorator';
import { PubLightModel } from '@immosparrow/cockpit-api-v2';
import { getMainCategory1, formatPrice } from '../../sharedFunctions';
import { safeVal } from '@immosparrow/cockpit-lib-core';
import GetTimeUtc from '../../getTimeUtc';
import {
  commitOpenedPopapDetailId,
  getOpenedPopapDetailId,
} from '../../../store/modules/searchStatesModule';
import store from '../../../store';

@Component({
  store,
  mixins: [template],
  components: { GetTimeUtc },
})
export default class PopupMultipleAdsComponent extends Base {

  @Prop()
  adsInfo: PubLightModel[];

  @Prop()
  openAds: Function;

  @Prop()
  removeActive: Function;

  val: Function = safeVal;
  getMainCategory: Function = getMainCategory1;
  formatPrice: Function = formatPrice;
  slidePage: number = 0;
  photo: string = 'static/img/house-placeholder-scaled.png';

  get openedPopapDetailId() {
    return getOpenedPopapDetailId(store);
  }

  getIconType(type: string) {
    let icon = '';
    switch (type) {
      case ('Apartment'):
        icon = 'apartment';
        break;
      case ('House'):
        icon = 'home';
        break;
      case ('Business'):
        icon = 'business';
        break;
      case ('Building Area'):
        icon = 'area';
        break;
      case ('Parking'):
        icon = 'parking';
        break;
      case ('Industry'):
        icon = 'industry';
        break;
    }

    return icon;
  }

  pageChangedApartments(e: number) {
    if (this.$refs['cur1']) {
      this.$refs['cur1'].goToPage(e);
    }
    this.slidePage = e;
  }

  nextSlide() {
    if (this.$refs['cur1'].currentPage < this.$refs['cur1'].slideCount) {
      this.$refs['cur1'].currentPage = this.$refs['cur1'].currentPage + 1;
    }
  }

  prevSlide() {
    if (this.$refs['cur1'].currentPage !== 0) {
      this.$refs['cur1'].currentPage = this.$refs['cur1'].currentPage - 1;
    }
  }

  toggleModal(status: boolean) {
    if (status) {
      this.removeActive();
    }
    const { longitude, latitude } = this.adsInfo[0].address.coordinates;
    commitOpenedPopapDetailId(store, status ? `${longitude}-${latitude}` : '');
    const currentPopup = document.getElementsByClassName(`popup-${longitude}-${latitude}`)[0] as HTMLElement;
    currentPopup.style.zIndex = status ? '6' : '';
  }

  abbreviateNumber(value: number) {
    let newValue = value;
    const suffixes = ['', 'K', 'M', 'B', 'T'];
    let suffixNum = 0;
    while (newValue >= 1000) {
      newValue /= 1000;
      suffixNum = suffixNum + 1;
    }

    const stringNumber = newValue.toPrecision(3);
    return stringNumber + suffixes[suffixNum];
  }

  getBackground(id: string): string {
    return id !== '00000000-0000-0000-0000-000000000000' ?
      `url(https://axresources.azurewebsites.net/image/get/${id}/?mw=500&mh=500&q=90` :
      `url(${this.photo}) no-repeat center center / cover`;
  }

  shortenTitle(title: string) {
    if (title) {
      return title.length >= 60 ? `${title.substring(0, 60)}...` : title;
    }
  }
}
