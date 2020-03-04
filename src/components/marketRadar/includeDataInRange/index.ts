import { Component, Watch } from 'vue-property-decorator';
import { mixins } from 'vue-class-component';
import template from './IncludeDataInRangeTemplate.vue';
import {
  $geo, GeoAddress, GeoAddressPart, GeoSuggestionType,
  GeoAreaAddressPart, GeoAddressPartType,
} from '@immosparrow/cockpit-api-v2';
import store from '@/store';
import { getFormModel } from '@/store/modules/marketRadar';
import { getFullAddress, setIsLoading, getAddressParts } from '@/store/modules/main';
import { MarketRadarModel, GeoSearch, MapShape } from '@/models';
import { EventBus } from '@/EventBus';
import GlobalMixin from '@/mixins/global';

@Component({
  mixins: [template],
  inject: ['$validator'],
})
export default class IncludeDataInRange extends mixins(GlobalMixin) {
  isOpenGeoIncludeDropdown: boolean = false;
  geoSearchOptions: string[] = ['Radius', /*'Draw manually', 'Viewport', 'Travel Time',*/ 'Locality', 'Commune', 'Canton'];
  selectedGeoSearchOption: string = this.geoSearchOptions[1];
  travelBy: string[] = ['walk', 'bike', 'car', 'transit'];
  travelTimes: number[] = [10, 15, 30, 45, 60];
  radius: number = null;
  transitStartTime: string = null;
  rushHour: boolean = false;
  viewportName: string = '';
  polygonName: string = '';

  get model(): MarketRadarModel {
    return getFormModel(store);
  }
  get geoSearch(): GeoSearch {
    return this.model.geoSearch;
  }
  get address(): GeoAddress {
    return getFullAddress(store);
  }
  get loadedAddressParts() {
    return getAddressParts(store);
  }
  get isAreaOptionSelected(): boolean {
    return ['Locality', 'Commune', 'Canton'].includes(this.selectedGeoSearchOption);
  }

  async isFieldValid(field: string) {
    await this.$validator.validate(`marketRadarForm.${field}`);
    return !this.$validator.errors.items.find((x) => {
      return x.field === field;
    });
  }
  selectRestriction(restriction: string) {
    this.selectedGeoSearchOption = restriction;
    switch (restriction) {
      case 'Locality':
        this.getAreaPart(this.address.localityId, restriction);
        break;
      case 'Commune':
        this.getAreaPart(this.address.communeId, restriction);
        break;
      case 'Canton':
        this.getAreaPart(this.address.stateId, restriction);
        break;
      default:
        this.removeAreaRestriction();
        break;
    }
  }
  removeAreaRestriction() {
    this.geoSearch.area = null;
    this.radius = null;
    this.selectedGeoSearchOption = 'Radius';
  }
  async getAreaPart(id: string, type: string) {
    if (this.geoSearch.area) {
      EventBus.$emit('map:removeShape', 'geoAreaShape');
    }
    setIsLoading(store, true);

    let area = this.loadedAddressParts[type];
    if (!area) {
      area = await $geo.getAddressPart(id);
      this.loadedAddressParts[type] = area;
    }
    setIsLoading(store, false);
    this.drawAreaGeom(area);
    this.radius = null;
    this.geoSearch.radius = null;
    this.geoSearch.area = <GeoAreaAddressPart>{
      id,
      type: GeoAddressPartType[type],
      geom: area.geom,
    };
  }
  drawAreaGeom(area: GeoAddressPart) {
    const shape: MapShape = {
      id: 'geoAreaShape',
      name: area.name,
      geom: area.geom,
      type: GeoSuggestionType.Canton,
      addressId: this.address.entranceAddressId,
    };
    EventBus.$emit('map:drawShape', shape);
  }
  getGeoAreaFullName() {
    switch (this.selectedGeoSearchOption) {
      case 'Locality':
        return `Locality ${this.address.zip} ${this.address.locality}`;
      case 'Commune':
        return `Commune ${this.address.commune}`;
      case 'Canton':
        return `Canton ${this.address.state}`;
    }
  }

  @Watch('radius')
  async onRadiusChanged(a: any, b: any) {
    const isValid = await this.isFieldValid('radius');
    if (isValid) {
      this.geoSearch.radius = +this.radius;
      EventBus.$emit('map:drawRadiusAroundPoint', this.geoSearch.radius);
    } else {
      this.geoSearch.radius = null;
      EventBus.$emit('map:removeRadiusPoint');
    }
  }

  @Watch('geoSearch', { immediate: true })
  onGeoSearchRadiusChanged(value: GeoSearch, oldValue: GeoSearch) {
    if (oldValue === undefined) {
      if (value.radius) {
        this.radius = value.radius;
        this.selectedGeoSearchOption = 'Radius';
      }

      if (value.area) {
        switch (value.area.type) {
          case GeoAddressPartType.Locality:
            this.selectedGeoSearchOption = 'Locality';
            break;
          case GeoAddressPartType.Commune:
            this.selectedGeoSearchOption = 'Commune';
            break;
          case GeoAddressPartType.Canton:
            this.selectedGeoSearchOption = 'Canton';
            break;
        }
      }
    }
  }
}
