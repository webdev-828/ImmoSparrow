import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';
import template from './template.vue';

@Component({
  name: 'StarRating',
  mixins: [template],
})

export default class StarRating extends Vue {

  @Prop()
  no: number;

  starRatingState: number = null;

  starRating() {
    let rating = 'rating-50';
    if (this.no >= 90) {
      this.starRatingState = 50;
    } else if (this.no >= 80 && this.no < 90) {
      this.starRatingState = 45;
    } else if (this.no >= 70 && this.no < 80) {
      this.starRatingState = 40;
    } else if (this.no >= 60 && this.no < 70) {
      this.starRatingState = 35;
    } else if (this.no >= 50 && this.no < 60) {
      this.starRatingState = 30;
    } else if (this.no >= 40 && this.no < 50) {
      this.starRatingState = 25;
    } else if (this.no >= 30 && this.no < 40) {
      this.starRatingState = 20;
    } else if (this.no >= 20 && this.no < 30) {
      this.starRatingState = 15;
    } else if (this.no >= 10 && this.no < 20) {
      this.starRatingState = 10;
    } else if (this.no >= 0 && this.no < 10) {
      this.starRatingState = 5;
    }
    switch (this.starRatingState) {
      case 5:
        rating = 'rating-05';
        break;

      case 10:
        rating = 'rating-10';
        break;

      case 15:
        rating = 'rating-15';
        break;

      case 20:
        rating = 'rating-20';
        break;

      case 25:
        rating = 'rating-25';
        break;

      case 30:
        rating = 'rating-30';
        break;

      case 35:
        rating = 'rating-35';
        break;

      case 40:
        rating = 'rating-40';
        break;

      case 45:
        rating = 'rating-45';
        break;

      case 50:
        rating = 'rating-50';
        break;
    }
    return rating;

  }
}
