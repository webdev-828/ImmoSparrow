import { Component, Prop, Vue } from 'vue-property-decorator';
import template from './AdItemTemplate.vue';
import { IPubLightModel } from '@immosparrow/cockpit-api-v2';
import { safeVal } from '@immosparrow/cockpit-lib-core';

@Component({
  mixins: [template],
})
export default class AdItem extends Vue {
  @Prop({ required: true })
  ad: IPubLightModel;
  @Prop({ default: false })
  selected: boolean;

  safeVal: Function = safeVal;

  selectAd() {
    this.$emit('adSelected', this.ad);
  }
}
