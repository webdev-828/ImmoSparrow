import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';
import template from './Portfolio.vue';
@Component({
  name: 'Portfolio',
  mixins: [template],
})

export default class Portfolio extends Vue {
  leftSidebar: boolean = true;
  addList: boolean = false;

  selectState: boolean = false;
  selectedObjects: number = 0;

  filtersDeployed: boolean = false;
  sidebarDeployed: boolean = false;
  alertsDeployed: boolean = false;
  sectionBasic: boolean = true;
  sectionAddress: boolean = true;
  sectionGallery: boolean = false;
  sectionBuilding: boolean = true;
  sectionProperty: boolean = true;
  sectionApartments: boolean = true;
  sectionInhabitants: boolean = true;
  sectionOwners: boolean = false;
  alertsFilter: boolean = false;
  showContactInfo: boolean = true;
  showCustomContactInfo: boolean = true;
  addContactField: boolean = false;
  updatingEntry: boolean = false;
  tabsItem: object = {
    overview: true,
    images: false,
    apartments: false,
    contact: false,
    history: false,
    neighborhood: false,
  };
  selectDemo: any = ['One', 'Two', 'Three'];
  objects: any = [
    { name: 'Eine Klasse für sich – Luxuriöse Terrassenwohnung mit Seeblick', selected: false },
    { name: 'Sehr schöne 4.5 Zi-Whg (keine Makleranfragen)', selected: false },
    { name: 'Ruhe an bester Lage', selected: false },
  ];
  optionsDemo: {id: number; name: string}[] = [{
    id: 100,
    name: 'House',
  }, {
    id: 200,
    name: 'Apartment',
  }];
  show(tab: string) {
    for (const i in this.tabsItem) {
      if (i === tab) {
        this.tabsItem[i] = true;
      } else {
        this.tabsItem[i] = false;
      }
    }
  }
  categories: object = {
    list: true,
    map: false,
  };
  showCategories(tab: string) {
    for (const i in this.categories) {
      if (i === tab) {
        this.categories[i] = true;
      } else {
        this.categories[i] = false;
      }
    }
  }
  selectObject(object: any) {
    if (this.objects[object].selected === true) {
      this.objects[object].selected = false;
      this.selectedObjects = this.selectedObjects - 1;
    } else {
      this.objects[object].selected = true;
      this.selectedObjects = this.selectedObjects + 1;
    }
    if (this.selectedObjects > 0) {
      this.selectState = true;
    } else {
      this.selectState = false;
    }
  }
  deselectItems() {
    this.objects[0].selected = false;
    this.objects[1].selected = false;
    this.objects[2].selected = false;
    this.selectState = false;
  }
}
