import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';
import template from './NotificationCenter.vue';
@Component({
  name: 'NotificationCenter',
  mixins: [template],
})

export default class NotificationCenter extends Vue {
  loading: boolean = false;
}
