import Component from 'vue-class-component';
import Vue from 'vue';
import {
  Address, ConnectivityPois,
  EntranceRatingsModel, PoiEnvironmentNoise,
  PoiEnvironmentView,
  PoiLightModel, ServicePois,
} from '@immosparrow/cockpit-api-v2';
import { getEntranceRatings } from '@store/modules/marketRadar';
import store from '@store/index';
import { TwoPartTitle } from '@components/shared/neighborhood/tabs/overview/models/overview';
import { EducationPois, ImmissionPois } from '@immosparrow/cockpit-api-v2/lib/client/nswag-generated';
import { EventBus } from '../EventBus';

@Component
export default class RatingsMixin extends Vue {
  dimmRow: number = null;
  get entranceRatings(): EntranceRatingsModel {
    return getEntranceRatings(store);
  }
  get overallRating(): number {
    return this.entranceRatings?.overallRating || 0;
  }
  get shoppingPlaces(): PoiLightModel[] {
    return this.entranceRatings?.servicePois?.shopping;
  }
  get neighborhoodView(): PoiEnvironmentView {
    return this.entranceRatings?.view;
  }
  get neighborhoodTitle(): TwoPartTitle {
    if (this.overallRating > 4) {
      return new TwoPartTitle('EXCELLENT', 'NEIGHBORHOOD');
    }
    if (this.overallRating > 3) {
      return new TwoPartTitle('GOOD', 'NEIGHBORHOOD');
    }
    if (this.overallRating > 2) {
      return new TwoPartTitle('MODERATE', 'NEIGHBORHOOD');
    }
    if (this.overallRating > 1) {
      return new TwoPartTitle('BELOW AVERAGE', 'NEIGHBORHOOD');
    }
    return new TwoPartTitle('BAD', 'NEIGHBORHOOD');
  }
  get neighborhoodTitleString(): string {
    return `${this.neighborhoodTitle.firstPart} ${this.neighborhoodTitle.secondPart}`;
  }
  get noise(): PoiEnvironmentNoise {
    return this.entranceRatings?.noise;
  }
  get noiseRating(): number {
    return this.entranceRatings?.noise?.rating || 0;
  }
  get noiseTitle(): TwoPartTitle {
    if (this.noiseRating > 4) {
      return new TwoPartTitle('EXCELLENT', 'SILENCE');
    }
    if (this.noiseRating > 3) {
      return new TwoPartTitle('GOOD', 'SILENCE');
    }
    if (this.noiseRating > 2) {
      return new TwoPartTitle('MODERATE', 'SILENCE');
    }
    if (this.noiseRating > 1) {
      return new TwoPartTitle('BELOW AVERAGE', 'SILENCE');
    }
    return new TwoPartTitle('BAD', 'SILENCE');
  }
  get noiseTitleString(): string {
    return `${this.noiseTitle.firstPart} ${this.noiseTitle.secondPart}`;
  }
  get viewRating(): number {
    return this.entranceRatings?.view?.rating || 0;
  }
  get viewTitle(): TwoPartTitle {
    if (this.viewRating > 4) {
      return new TwoPartTitle('EXCELLENT', 'VIEW');
    }
    if (this.viewRating > 3) {
      return new TwoPartTitle('GOOD', 'VIEW');
    }
    if (this.viewRating > 2) {
      return new TwoPartTitle('MODERATE', 'VIEW');
    }
    if (this.viewRating > 1) {
      return new TwoPartTitle('BELOW AVERAGE', 'VIEW');
    }
    return new TwoPartTitle('BAD', 'VIEW');
  }
  get viewTitleString(): string {
    return `${this.viewTitle.firstPart} ${this.viewTitle.secondPart}`;
  }
  get service(): ServicePois {
    return this.entranceRatings?.servicePois;
  }
  get shoppingRating(): number {
    return this.service?.serviceRating || 0;
  }
  get shoppingTitle(): TwoPartTitle {
    if (this.shoppingRating > 4) {
      return new TwoPartTitle('EXCELLENT', 'SHOPPING');
    }
    if (this.shoppingRating > 3) {
      return new TwoPartTitle('GOOD', 'SHOPPING');
    }
    if (this.shoppingRating > 2) {
      return new TwoPartTitle('MODERATE', 'SHOPPING');
    }
    if (this.shoppingRating > 1) {
      return new TwoPartTitle('BELOW AVERAGE', 'SHOPPING');
    }
    return new TwoPartTitle('BAD', 'SHOPPING');
  }
  get shoppingTitleString(): string {
    return `${this.shoppingTitle.firstPart} ${this.shoppingTitle.secondPart}`;
  }
  get shops(): PoiLightModel[] {
    return this.service?.shopping || [];
  }
  get closestShop(): PoiLightModel {
    if (this.shops.length) {
      return this.shops.reduce((closest: PoiLightModel, current: PoiLightModel) => {
        return closest.distance < current.distance ? closest : current;
      });
    }
    return null;
  }
  get immissionsRating(): number {
    return this.entranceRatings?.immissionPois?.immisionRating || 0;
  }
  get immissionsTitle(): TwoPartTitle {
    if (this.immissionsRating > 4) {
      return new TwoPartTitle('EXCELLENT', 'IMMISSION');
    }
    if (this.immissionsRating > 3) {
      return new TwoPartTitle('GOOD', 'IMMISSION');
    }
    if (this.immissionsRating > 2) {
      return new TwoPartTitle('MODERATE', 'IMMISSION');
    }
    if (this.immissionsRating > 1) {
      return new TwoPartTitle('BELOW AVERAGE', 'IMMISSION');
    }
    return new TwoPartTitle('BAD', 'IMMISSION');
  }
  get immissionsTitleString(): string {
    return `${this.immissionsTitle.firstPart} ${this.immissionsTitle.secondPart}`;
  }
  get immissionPoints(): ImmissionPois {
    return this.entranceRatings?.immissionPois;
  }
  get mobileTransmitters(): PoiLightModel[] {
    return this.entranceRatings?.immissionPois?.mobileTransmitters || [];
  }
  get closestMobileTransmitter(): PoiLightModel {
    if (this.mobileTransmitters.length) {
      return this.mobileTransmitters.reduce((closest: PoiLightModel, current: PoiLightModel) => {
        return closest.distance < current.distance ? closest : current;
      });
    }
    return null;
  }
  get educationRating(): number {
    return this.entranceRatings?.educationPois?.educationRating || 0;
  }
  get educationTitle(): TwoPartTitle {
    if (this.educationRating > 4) {
      return new TwoPartTitle('EXCELLENT', 'EDUCATION');
    }
    if (this.educationRating > 3) {
      return new TwoPartTitle('GOOD', 'EDUCATION');
    }
    if (this.educationRating > 2) {
      return new TwoPartTitle('MODERATE', 'EDUCATION');
    }
    if (this.educationRating > 1) {
      return new TwoPartTitle('BELOW AVERAGE', 'EDUCATION');
    }
    return new TwoPartTitle('BAD', 'EDUCATION');
  }
  get educationTitleString(): string {
    return `${this.educationTitle.firstPart} ${this.educationTitle.secondPart}`;
  }
  get education(): EducationPois {
    return this.entranceRatings?.educationPois;
  }
  get kindergardens(): PoiLightModel[] {
    return this.education?.kindergardens || [];
  }
  get closestKinderGarden(): PoiLightModel {
    if (this.kindergardens.length) {
      return this.kindergardens.reduce((closest: PoiLightModel, current: PoiLightModel) => {
        return closest.distance < current.distance ? closest : current;
      });
    }
    return null;
  }
  get primarySchools(): PoiLightModel[] {
    return this.education?.primarySchools || [];
  }
  get closestSchool(): PoiLightModel {
    if (this.primarySchools.length) {
      return this.primarySchools.reduce((closest: PoiLightModel, current: PoiLightModel) => {
        return closest.distance < current.distance ? closest : current;
      });
    }
    return null;
  }
  get secondarySchools(): PoiLightModel[] {
    return this.education?.secondarySchools || [];
  }
  get closestSecondarySchool(): PoiLightModel {
    if (this.secondarySchools.length) {
      return this.secondarySchools.reduce((closest: PoiLightModel, current: PoiLightModel) => {
        return closest.distance < current.distance ? closest : current;
      });
    }
    return null;
  }
  get highschools(): PoiLightModel[] {
    return this.education?.highschools || [];
  }
  get closestHighschool(): PoiLightModel {
    if (this.highschools.length) {
      return this.highschools.reduce((closest: PoiLightModel, current: PoiLightModel) => {
        return closest.distance < current.distance ? closest : current;
      });
    }
    return null;
  }
  get universities(): PoiLightModel[] {
    return this.education?.universities || [];
  }
  get closestUniversity(): PoiLightModel {
    if (this.universities.length) {
      return this.universities.reduce((closest: PoiLightModel, current: PoiLightModel) => {
        return closest.distance < current.distance ? closest : current;
      });
    }
    return null;
  }
  get connectivity(): ConnectivityPois {
    return this.entranceRatings?.connectivityPois;
  }
  get connectivityRating(): number {
    return this.connectivity?.connectivityRating || 0;
  }
  get connectivityTitle(): TwoPartTitle {
    if (this.connectivityRating > 4) {
      return new TwoPartTitle('EXCELLENT', 'CONNECTIVITY');
    }
    if (this.connectivityRating > 3) {
      return new TwoPartTitle('GOOD', 'CONNECTIVITY');
    }
    if (this.connectivityRating > 2) {
      return new TwoPartTitle('MODERATE', 'CONNECTIVITY');
    }
    if (this.connectivityRating > 1) {
      return new TwoPartTitle('BELOW AVERAGE', 'CONNECTIVITY');
    }
    return new TwoPartTitle('BAD', 'CONNECTIVITY');
  }
  get connectivityTitleString(): string {
    return `${this.connectivityTitle.firstPart} ${this.connectivityTitle.secondPart}`;
  }
  formatAddress(address: Address): string {
    return `${address.street} ${address.streetNumber}, ${address.zip} ${address.locality}`;
  }
  addPoisToMap(pois: PoiLightModel[]) {
    EventBus.$emit('map:addPoisToMap', pois);
  }
  highlightOnMap(id?: number) {
    EventBus.$emit('map:highlightPoi', id ? id - 1 : null);
  }
  created() {
    EventBus.$on('map:hasHighlightPoi', (id: number) => {
      this.dimmRow = id + 1;
    });
  }
}
