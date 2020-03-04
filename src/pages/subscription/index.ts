import Vue from 'vue';
import { Component } from 'vue-property-decorator';
import template from './Subscription.vue';
@Component({
  name: 'Subscription',
  mixins: [template],
})

export default class Subscription extends Vue {
}
