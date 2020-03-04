import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';
import Base from './../base';
import template from './template.vue';
import { getDuration } from '../sharedFunctions';
@Component({
  name: 'GetTimeUtc',
  mixins: [template],
})
export default class GetTimeUtc extends Base {
  @Prop()
  publicationTimeUtc: Date | undefined;

  @Prop()
  deletedTimeUtc: Date | undefined;

  getDuration: Function = getDuration;
}
