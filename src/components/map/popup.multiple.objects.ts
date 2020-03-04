import Vue from 'vue';
import template from './popup.multiple.objects_template.vue';
import { Component, Watch, Prop } from 'vue-property-decorator';
import * as api from '@immosparrow/cockpit-api-v2';

@Component({
  mixins: [template],
  components: {

  },
})
export default class PopupMultipleObjectsComponent extends Vue {

  @Prop()
  adsInfo: Array<api.PubModel>;

  @Prop()
  selectAddress: Function;

  @Prop()
  minify: Function;

  @Prop()
  uniqueIdentifier: string;

  @Prop()
  minifiedPopup: boolean;

  created() {
    // console.log(this.adInfo);

  }
}
