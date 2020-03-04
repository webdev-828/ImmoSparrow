import Vue from 'vue';
import template from './popup.poi_template.vue';
import { Component, Prop } from 'vue-property-decorator';
import * as api from '@immosparrow/cockpit-api-v2';

@Component({
  mixins: [template],
  components: {
  },
})
export default class PopupPoi extends Vue {

  @Prop()
  poi: api.PoiLightModel;

  @Prop()
  fakeId: number;

}
