import Vue from 'vue';
import template from './popup.multiple.e.template.vue';
import { Component, Watch, Prop } from 'vue-property-decorator';
import * as api from '@immosparrow/cockpit-api-v2';

@Component({
  mixins: [template],
  components: {

  },
  filters: {

  },
})
export default class PopupMultipleEntrancesComponent extends Vue {

  @Prop()
  building: api.BuildingModel;

  @Prop()
  setEntrence: Function;

  @Prop()
  lat: number;

  @Prop()
  lng: number;

  tabsInfo: object = {
    showBase: false,
    showEntrances: true,
  };

  show(tab: string) {
    for (const i in this.tabsInfo) {
      if (i === tab) {
        this.tabsInfo[i] = true;
      } else {
        this.tabsInfo[i] = false;
      }
    }
  }

  created () {
    this.building.entrances.sort(this.sortAlphaNum);
    this.ppGetImage(this.lat, this.lng);
  }

  sortAlphaNum(a: any, b: any) {

    try {
      const reA = /[^a-zA-Z]/g;
      const reN = /[^0-9]/g;
      const c = `${a.address.street}` + ' ' + `${a.address.streetNumber}` + ',' + `${a.address.locality}`;
      const d = `${b.address.street}` + ' ' + `${b.address.streetNumber}` + ',' + `${b.address.locality}`;
      const aA = c.replace(reA, '');
      const bA = d.replace(reA, '');
      if (aA === bA) {
        const aN = parseInt(c.replace(reN, ''), 10);
        const bN = parseInt(d.replace(reN, ''), 10);
        return aN === bN ? 0 : aN > bN ? 1 : -1;
      }
      return aA > bA ? 1 : -1;

    } catch {}
  }

  sortByStreet(a: any) {
    return a.sort(this.sortAlphaNum);
  }

  ppNoImage: string = 'https://cdn.shopify.com/s/files/1/0533/2089/files/placeholder-images-image_large.png';
  ppGetImage(lat: number, lng: number) {
    const self = this;
    fetch('https://maps.googleapis.com/maps/api/streetview/metadata?location=' + `${lat}` + ',' + `${lng}` + '&size=500x400&key=AIzaSyBP13wW7gtbz3AQeneSFnqbpuWfthC4pHY&pitch=5&source=outdoor')
      .then((data: any) => {
        return data.json();
      }).then((data: any) => {
        if (data.status === 'OK') {
          self.ppNoImage = 'https://maps.googleapis.com/maps/api/streetview?location=' + `${lat}` + ',' + `${lng}` + '&size=500x400&key=AIzaSyBP13wW7gtbz3AQeneSFnqbpuWfthC4pHY&pitch=5&source=outdoor';
        } else {
          self.ppNoImage = 'https://cdn.shopify.com/s/files/1/0533/2089/files/placeholder-images-image_large.png';
        }
      });
  }

}
