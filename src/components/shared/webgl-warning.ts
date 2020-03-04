import autocomplete from '../addressAutocomplete';
import Modal from '../modal';
import Base from '../base';
import template from './webgl-warning-template.vue';
import { Component, Prop, Watch } from 'vue-property-decorator';
import { AgencyModel, GeoAreaSet, GeoAreaShape } from '@immosparrow/cockpit-api-v2';
import Vue from 'vue';
import _ from 'lodash';
@Component({
  name: 'SharedGeo',
  mixins: [template],
  components: {
  },
})
export default class WebglWarning extends Base {

}
