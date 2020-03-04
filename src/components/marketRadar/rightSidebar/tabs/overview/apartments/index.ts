import { Component, Prop } from 'vue-property-decorator';
import template from './ApartmentsTemplate.vue';
import { ApartmentLightModel } from '@immosparrow/cockpit-api-v2';
import GlobalMixin from '@/mixins/global';
import { mixins } from 'vue-class-component';
import MarketRadarMixin from '@/mixins/marketRadar';

@Component({
  mixins: [template, MarketRadarMixin],
})
export default class Apartments extends mixins(GlobalMixin) {
  @Prop({ required: true })
  apartments: ApartmentLightModel[];
  $refs: {
    carouselApartments: any,
  };
  slidePage: number = 2;

  get carouselApartments() {
    return this.$refs['carouselApartments'];
  }

  ewid(apartment: ApartmentLightModel) {
    return apartment?.address?.govId?.ewid;
  }
  rooms(apartment: ApartmentLightModel) {
    return apartment?.primaryInfo?.roomCount;
  }
  livingArea(apartment: ApartmentLightModel) {
    return apartment?.primaryInfo?.livingArea;
  }
  level(apartment: ApartmentLightModel) {
    return apartment?.primaryInfo?.level;
  }
  levelNumber(apartment: ApartmentLightModel) {
    return apartment?.primaryInfo?.levelNumber;
  }
  position(apartment: ApartmentLightModel) {
    return apartment?.primaryInfo?.position;
  }
  adminNumber(apartment: ApartmentLightModel) {
    return apartment?.primaryInfo?.adminNumber;
  }
  nextSlide() {
    if (this.carouselApartments.currentPage < this.carouselApartments.slideCount) {
      this.carouselApartments.currentPage = this.carouselApartments.currentPage + 1;
    }
  }
  prevSlide() {
    if (this.carouselApartments.currentPage !== 0) {
      this.carouselApartments.currentPage = this.carouselApartments.currentPage - 1;
    }
  }
  pageChangedApartments(pageNumber: number) {
    if (this.carouselApartments) {
      this.carouselApartments.goToPage(pageNumber);
    }
    this.slidePage = pageNumber;
  }
}
