import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';
import template from './template.vue';

@Component({
  name: 'EditableText',
  mixins: [template],
})

export default class EditableText extends Vue {
  @Prop()
  text: string;

  @Prop()
  onSubmit: Function;

  newText: string = null;
  editable: boolean = false;

  created() {
    this.newText = this.text;
  }

  cancel() {
    this.newText = this.text;
    this.editable = false;
  }

  submit() {
    if (this.onSubmit) {
      this.onSubmit(this.newText);
    }
    this.editable = false;
  }
}
