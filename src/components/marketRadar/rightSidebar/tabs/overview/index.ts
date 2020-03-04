import { Component, Watch } from 'vue-property-decorator';
import template from './OverviewTemplate.vue';
import GlobalMixin from '@/mixins/global';
import { ApartmentLightModel, BuildingModel } from '@immosparrow/cockpit-api-v2';
import { getBuildingInfo } from '@store/modules/marketRadar';
import store from '@store';
import { getSearchedAddress } from '@store/modules/main';
import VueGallery from 'vue-gallery';
import { getGoogleStreetViewImage } from '@components/sharedFunctions';
import ColumnData from '@components/shared/dataDisplay/columnData';
import Apartments from './apartments';
import Owners from '@components/shared/owners';
import Inhabitants from '@components/shared/inhabitants';
import { mixins } from 'vue-class-component';
import { KeyValueList } from '@/models';

@Component({
  mixins: [template],
  components: {
    VueGallery,
    Apartments,
    Owners,
    Inhabitants,
    ColumnData,
  },
})
export default class Overview extends mixins(GlobalMixin) {
  index: number = null;
  photos: string[] = [];
  slidePage: number = 2;
  navigateTo: number = 0;
  apartments: ApartmentLightModel[] = [];

  get buildingInfo(): BuildingModel {
    return getBuildingInfo(store);
  }
  get searchedAddress() {
    return getSearchedAddress(store);
  }
  get entranceId() {
    return this.searchedAddress?.uniqueIdentifier || null;
  }
  get buildingData(): KeyValueList[] {
    const data: KeyValueList[] = [];

    data.push({ key: 'EGID', value: this.buildingInfo?.address?.govId?.egid });
    data.push({ key: 'Built Year', value: this.buildingInfo?.primaryInfo?.builtYear });
    data.push({ key: 'Category', value: this.buildingInfo?.primaryInfo?.gwsCategory ? this.rawCategories[this.buildingInfo.primaryInfo.gwsCategory] : null });
    data.push({ key: 'Renovation Year', value: this.buildingInfo?.primaryInfo?.renovationYear });
    data.push({ key: 'Total Floors', value: this.buildingInfo?.primaryInfo?.floorCount });
    data.push({ key: 'BFS Number', value: this.buildingInfo?.identity?.communeBfsNumber });
    data.push({ key: 'Cadastre District', value: this.buildingInfo?.identity?.cadastreDistrict });
    data.push({ key: 'Number', value: this.buildingInfo?.identity?.buldingNumber });

    return data;
  }
  get propertyData(): KeyValueList[] {
    const data: KeyValueList[] = [];

    data.push({ key: 'EGRID', value: this.buildingInfo?.realProperty?.identity?.egrid });
    data.push({ key: 'Property Area', value: this.buildingInfo?.realProperty?.primaryInfo?.area });
    data.push({ key: 'BFS Number', value: this.buildingInfo?.realProperty?.identity?.communeBfsNumber });
    data.push({ key: 'Cadastre District', value: this.buildingInfo?.realProperty?.identity?.cadastreDistrict });
    data.push({ key: 'Parcel Number', value: this.buildingInfo?.realProperty?.identity?.parcelNumber });

    return data;
  }

  clickOnImg(index: number, noImage?: string) {
    this.photos.forEach((p, pindex) => {
      const height = window.innerHeight;
      const weight = window.innerWidth;
      this.index = index;
      if (p.indexOf('google') > -1) {
        this.photos[pindex] = p.replace('500x400', '1920x746');
      } else {
        const img = p.split('?');

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
      this.photos.forEach((p, pindex) => {
        if (p.indexOf('google') > -1) {
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
  updateApartments() {
    if (this.buildingInfo?.entrances?.length) {
      for (const i in this.buildingInfo.entrances) {
        if (this.buildingInfo?.entrances[i]?.apartments?.length) {
          this.apartments = this.buildingInfo.entrances[i].apartments;
        } else {
          this.apartments = [];
        }
      }
    }
  }
  @Watch('buildingInfo', { immediate: true })
  onBuildingInfoChange() {
    this.photos = this.photos.splice(0, this.photos.length - 1);
    this.index = null;
    let thereAreImages = false;
    let lat = null;
    let lng = null;
    if (this.searchedAddress?.coordinates) {
      lat = this.searchedAddress.coordinates.latitude;
      lng = this.searchedAddress.coordinates.longitude;
    }
    if (lat && lng) {
      getGoogleStreetViewImage(lat, lng).then((data: string) => {
        const photos = [];
        if (this.buildingInfo?.entrances?.length) {
          if (this.buildingInfo?.entrances[0]?.pictures?.length) {
            thereAreImages = true;
            const pictures = this.buildingInfo.entrances[0].pictures;
            // tslint:disable-next-line:no-increment-decrement
            let count = 0;
            for (const i in pictures) {
              // tslint:disable-next-line:no-increment-decrement
              count++;
              if (count === 28) {
                break;
              }
              photos.push(`https://axresources.azurewebsites.net/image/get/${pictures[i].id}/?mw=500&mh=500&q=90`);
            }
          }
        }
        if (!thereAreImages || data.indexOf('house-placeholder-scaled') === -1) {
          this.photos.push(data);
        }
        // tslint:disable-next-line:no-increment-decrement
        for (let i = 0; i < photos.length; i++) {
          this.photos.push(photos[i]);
        }
      });
    }
    this.updateApartments();
  }
}
