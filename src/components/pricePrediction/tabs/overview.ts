import { Component, Watch, Prop } from 'vue-property-decorator';
import * as pp from '../../../store/modules/pricePredictionModule';
import Base from '../../base';
import template from './overview.template.vue';
import autocomplete from '../../addressAutocomplete';
import modal from '../../modal';
import VueSlider from 'vue-slider-component';
import * as api from '@immosparrow/cockpit-api-v2';
import { safeVal } from '@immosparrow/cockpit-lib-core';
import Owners from '../../shared/owners';
import VueGallery from 'vue-gallery';
import Inhabitants from '../../shared/inhabitants';
import { getGoogleStreetViewImage } from '../../sharedFunctions';
@Component({

  mixins: [template],
  components: {
    autocomplete,
    modal,
    VueSlider,
    Owners,
    VueGallery,
    Inhabitants,
  },
})
export default class Overview extends Base {

  @Prop()
  buildingOnAddress: api.BuildingModel;

  @Prop()
  addressFromAd: api.GeoSuggestion;

  @Prop()
  entrenceId: string;

  @Prop({ default: 0 })
  indexEnterence: number;

  index: any = null;
  val: Function = safeVal;
  completedSteps0: number = 80;
  completedSteps1: number = 45;
  completedSteps2: number = 82;
  completedSteps3: number = 25;
  completedSteps4: number = 97;
  showApartments: api.ApartmentLightModel[] = [];

  totalSteps: number = 100;
  slidePage: number = 0;
  slides: number = 0;

  inhabitantsSection: boolean = false;
  inhabitantsMinified: boolean = true;
  ownerInfoLoaded: boolean = true;
  ownerInterval: any = false;
  ownerStatesInfo: any = {
    supported: [],
    notSupported: [],
    planned: [],
  };
  ownerSection: boolean = false;
  gettingOwner: number = 0;
  navigateTo: number = 0;
  photosLoaded: boolean = false;

  pageChanged(e: number, a?: any) {
    if (this.$refs['cur']) {
      this.$refs['cur'].goToPage(e);
    }
  }
  pageChangedApartments(e: number) {

    // console.log(e);
    if (this.$refs['cur1']) {
      this.$refs['cur1'].goToPage(e);
    }
    this.slidePage = e;

  }
  photos: string[] = [];

  created() {
    api.$pubs.getOwnersServiceInfo()
      .then((res) => {
        res.items.forEach((item) => {
          if (item.serviceStatus === 0) {
            this.ownerStatesInfo.notSupported.push(item.stateShort);
          }
          if (item.serviceStatus === 4) {
            this.ownerStatesInfo.supported.push(item.stateShort);
          }
          if (item.serviceStatus === 3) {
            this.ownerStatesInfo.planned.push(item.stateShort);
          }
        });
        this.ownerInfoLoaded = true;
      });
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

  toPersonType(no: number): string {
    if (no === 10) {
      return 'Person';
    }

    return 'Organisation';
  }

  getOwnerType(no: number): string {
    if (no === 10) {
      return 'Natural Person';
    }

    return 'Legal Person';
  }

  ifAnyKey(data: api.PropertyOwnerModel): boolean {
    for (const i in data) {
      if (data[i]) {
        return true;
      }
    }

    return false;
  }
  entrId: string = '';

  updatedApartments() {
    const entrance = this.buildingOnAddress.entrances[this.indexEnterence === -1 ? 0 : this.indexEnterence];
    if (entrance && entrance.apartments) {
      this.showApartments = entrance.apartments;
    } else {
      const { apartments } = this.buildingOnAddress;
      this.showApartments = apartments.filter(el => !el.hasEntrance);
    }

  }

  @Watch('entrenceId', { immediate: true })
  eid() {

    this.entrId = this.entrenceId;

    // this.ppGetImage(this.pricePredictSearchedAddress.coordinates.latitude, this.pricePredictSearchedAddress.coordinates.longitude);
  }

  get getSelectedAd() {
    return pp.getSelectedAd(this.$store);
  }

  @Watch('buildingOnAddress', { immediate: true, deep: true })
  boa() {
    this.updatedApartments();
    this.photos = [];
    this.index = null;
    let thereIsImages = false;
    if (this.getSelectedAd.pictures && this.getSelectedAd.pictures.length) {
      getGoogleStreetViewImage(this.getSelectedAd.address.coordinates.latitude, this.getSelectedAd.address.coordinates.longitude).then((data) => {
        if (this.getSelectedAd.pictures) {
          if (this.getSelectedAd.pictures.length) {
            this.getSelectedAd.pictures.forEach((pic: api.PubPictureInfo) => {
              this.photos.push(`https://axresources.azurewebsites.net/image/get/${pic.id}/?mw=500&mh=500&q=90`);
              if (this.photos.length > 28) {
                this.photos = this.photos.slice(0, 28);
              }
            });
          }
        }
        if (!thereIsImages) {
          this.photos.unshift(data);
        } else {
          if (data.indexOf('house-placeholder-scaled') === -1 && thereIsImages) {
            this.photos.unshift(data);
          }
        }
        this.$forceUpdate();
        setTimeout(() => {
          this.pageChanged(0);
          this.pageChangedApartments(0);
          this.$forceUpdate();
        }, 250);
      });
    } else {
      getGoogleStreetViewImage(
        this.pricePredictSearchedAddress.coordinates ? this.pricePredictSearchedAddress.coordinates.latitude : this.addressFromAd.coordinates.latitude,
        this.pricePredictSearchedAddress.coordinates ? this.pricePredictSearchedAddress.coordinates.longitude : this.addressFromAd.coordinates.longitude,
      ).then((data: string) => {
        if (this.buildingOnAddress.entrances) {
          if (this.buildingOnAddress.entrances.length) {
            if (this.buildingOnAddress.entrances[0].pictures) {
              if (this.buildingOnAddress.entrances[0].pictures.length) {
                thereIsImages = true;
                for (const i in this.buildingOnAddress.entrances[0].pictures) {
                  this.photos.push(`https://axresources.azurewebsites.net/image/get/${this.buildingOnAddress.entrances[0].pictures[i].id}/?mw=500&mh=500&q=90`);
                }
                if (this.photos.length > 28) {
                  this.photos = this.photos.slice(0, 28);
                }
              }
            }
          }
        }
        if (!thereIsImages) {
          this.photos.unshift(data);
        } else {
          if (data.indexOf('house-placeholder-scaled') === -1 && thereIsImages) {
            this.photos.unshift(data);
          }
        }
        this.$forceUpdate();
        setTimeout(() => {
          this.pageChanged(0);
          this.pageChangedApartments(0);
          this.$forceUpdate();
        }, 250);
      });
    }
    // Alte Landstrasse 382, 8708 Männedorf
  }

  clickOnImg(index: number, noImage?: string) {
    // let pic = this.pictures[index];
    this.photos.forEach((p, pindex) => {
      const height = window.innerHeight;
      const weight = window.innerWidth;
      this.index = index;
      if (p.indexOf('google') > -1) {
        // return;
        this.photos[pindex] = p.replace('500x400', '1920x746');
      } else {
        const pic = p;
        const img = pic.split('?');

        if (noImage) {
          this.photos[pindex] = noImage;
        } else {
          this.photos[pindex] = `${img[0]}` + `?mw=${weight}&mh=${height}&q=90`;
        }
      }
    });
  }

  closeFullScreen(index: number, noImage?: string) {
    if (index !== null) {
      // let pic = this.pictures[index];
      this.photos.forEach((p, pindex) => {
        if (p.indexOf('google') > -1) {
          // return;
          this.photos[pindex] = p.replace('1920x746', '500x400');
        } else {
          const pic = p;
          const img = pic.split('?');
          if (noImage) {
            this.photos[pindex] = pic;
          } else {
            this.photos[pindex] = `${img[0]}` + '?mw=500&mh=500&q=90';
          }
        }
        this.index = null;
      });
    }
  }
}
