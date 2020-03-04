import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';
import template from './template.vue';
import listMap from '../listMap';
import {
  getMainCategory1,
  getPersonName,
  getVendorClass,
  formatPrice,
  getAddressQuality,
  formatDate,
  getGoogleStreetViewImage,
} from '../../../../components/sharedFunctions';
import { IPubModel, mval as val } from '@immosparrow/cockpit-api-v2';
import ActionBar from '../../actionBar';
import ItemDetails from '../../../shared/itemDetails';
import GetTimeUtc from '../../../getTimeUtc/index';
@Component({
  mixins: [template],
  components: {
    listMap,
    ActionBar,
    ItemDetails,
    GetTimeUtc,
  },
})
export default class ListItem extends Vue {

  @Prop({ default: null })
  item: IPubModel;

  @Prop()
  index: number;

  val: Function = val;
  getMainCategory: Function = getMainCategory1;
  formatPrice: Function = formatPrice;
  getAddressQuality: Function = getAddressQuality;
  getVendorClass: Function = getVendorClass;
  getPersonName: Function = getPersonName;
  formatDate: Function = formatDate;

  showMiniMap: boolean = false;
  photo: string = 'static/img/house-placeholder-scaled.png';

  created() {
    this.$root.$on('closeAllMiniMaps', () => {
      this.showMiniMap = false;
    });

    const pictures = this.item.pictures;
    if (!pictures || (pictures && !pictures.length)) {
      getGoogleStreetViewImage(this.item.address.coordinates.latitude, this.item.address.coordinates.longitude).then((data: string) => {
        this.photo = data;
      });
    }
  }

  showHideMap(id: any) {
    if (this.$parent['maps'].indexOf(id) > -1) {
      this.$parent['maps'].splice(this.$parent['maps'].indexOf(id), 1);
    } else {
      for (const i in this.$parent['maps']) {
        this.$parent['maps'].splice(i, 1);
      }
      this.$parent['maps'].push(id);
    }
    this.$forceUpdate();
  }

  shareAdLink(id: string) {
    this.$emit('shareAdLink', id);
  }
}
