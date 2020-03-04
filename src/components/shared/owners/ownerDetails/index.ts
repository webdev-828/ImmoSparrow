import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';
import template from './template.vue';
import { PropertyOwnerModel, PropertyOwnershipType } from '@immosparrow/cockpit-api-v2';
import { safeVal } from '@immosparrow/cockpit-lib-core';
@Component({
  name: 'OwnerDetails',
  mixins: [template],
  components: {
    OwnerDetails,
  },
})

export default class OwnerDetails extends Vue {

  @Prop({ default: null })
    owner: PropertyOwnerModel;

  val: Function = safeVal;
  ownerDetail: boolean = false;

  getOwnershipType (type: number) {
    if (type) {
      return (PropertyOwnershipType[type].match(/[A-Z][a-z]+/g)).join(' ');
    }
    return '';

  }
}
