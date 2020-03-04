import Vue from 'vue';
import template from './popup.object_template.vue';
import { Component, Watch, Prop } from 'vue-property-decorator';
import * as api from '@immosparrow/cockpit-api-v2';

@Component({
  mixins: [template],
  components: {

  },
})
export default class PopupObjectComponent extends Vue {

  @Prop()
  adInfo: api.PubModel;

  created() {
    // console.log(this.adInfo);
  }
}
