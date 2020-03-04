import Vue from 'vue';
import { Component, Watch } from 'vue-property-decorator';
import template from './template.vue';
import { $poi } from '@immosparrow/cockpit-api-v2';
import { PoiCategory } from '@immosparrow/cockpit-api-v2/lib/client';
import { setPoiCategories, getPoiCategories } from '@store/modules/marketRadar';
import store from '@store/index';

@Component({
  mixins: [template],
})
export default class Poi extends Vue {
  selectedRootCategory: PoiCategory | null = null;
  selectedPoiSubcategory: PoiCategory | null = null;
  selectedCategories: PoiCategory[] = [];
  poiViews: object = {
    traveltime: true,
    radius: false,
    manualDraw: false,
  };
  poiTabs(tab: string) {
    for (const i in this.poiViews) {
      if (i === tab) {
        this.poiViews[i] = true;
      } else {
        this.poiViews[i] = false;
      }
    }
  }
  limitText(count: number): string {
    return `and ${count} other elements`;
  }
  sectionTraffic: boolean = false;
  sectionGastronomy: boolean = false;
  optionsTraffic: any = ['Railway', 'Tram/Bus', 'Mountain trsp', 'Parking', 'Traffic', 'Bike sharing', 'Mobility'];
  optionsGastronomy: any = ['Bar', 'Cafe', 'Hotel', 'Restaurant'];
  optionsEntertainment: any = ['Cinema', 'Museum', 'Theater', 'Excursions', 'Fireplace', 'Playground', 'Swimming pool', 'Camping'];
  optionsPublicBuildings: any = ['Church', 'Police', 'School', 'Hospital', 'Administration'];
  optionsShoppingService: any = ['Pharmacy', 'Cash machine', 'Post Office', 'Shop', 'Gas station', 'Electric charging station'];
  optionsGeo: any = ['Mountain', 'Pass', 'Waterfall', 'Webcam', 'Wikipedia'];

  get poiCategories(): PoiCategory[] {
    return getPoiCategories(store);
  }
  get rootPoiCategories(): PoiCategory[] {
    return this.poiCategories.filter((category: PoiCategory) => {
      return !category?.parentId;
    });
  }
  get poiSubCategories(): PoiCategory[] {
    if (this.selectedRootCategory) {
      return this.poiCategories.filter((category: PoiCategory) => {
        return this.selectedRootCategory.id === category.parentId;
      });
    }
    return [];
  }
  created() {
    if (!this.poiCategories.length) {
      $poi.getCategories().then((poiCategories: PoiCategory[]) => {
        setPoiCategories(store, poiCategories);
      });
    }
  }

  removeCategory(category: PoiCategory) {
    // tslint:disable-next-line:no-increment-decrement
    for (let i = 0; i < this.selectedCategories.length; i++) {
      if (this.selectedCategories[i].id === category.id) {
        this.selectedCategories.splice(i, 1);
      }
    }
  }

  @Watch('selectedRootCategory')
  onSelectedRootCategoryChange() {
    this.selectedPoiSubcategory = null;
  }
  @Watch('selectedPoiSubcategory')
  onSelectedPoiSubcategory() {
    if (this.selectedPoiSubcategory) {
      let duplicate = false;
      this.selectedCategories.forEach((category: PoiCategory) => {
        if (category.id === this.selectedPoiSubcategory.id) {
          duplicate = true;
        }
      });
      if (!duplicate) {
        this.selectedCategories.push(this.selectedPoiSubcategory);
      }
    }
  }
}
