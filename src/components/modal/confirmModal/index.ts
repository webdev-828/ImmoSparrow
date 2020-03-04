import Vue from 'vue';
import template from './template.vue';
import { Component, Prop } from 'vue-property-decorator';

@Component({
  mixins: [template],
  name: 'ConfirmModal',
})
export default class ConfirmModal extends Vue {

  @Prop()
  showModal: boolean;

  @Prop({ default: 'Message' })
  title: string;

  @Prop({ default: 'Confirm your action?' })
  text: string;

  @Prop()
  onSubmit: Function;

  @Prop()
  onCancel: Function;
}
