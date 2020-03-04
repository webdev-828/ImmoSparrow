import template from './template.vue';
import { Vue, Component } from 'vue-property-decorator';

@Component({
  name: 'Notification',
  mixins: [template],
})

export default class Notification extends Vue {}
