import { Component, Watch, Prop } from 'vue-property-decorator';
import template from './color_picker_template.vue';
import Base from './../base';

@Component({
  mixins: [template],
  components: {

  },
})
export default class ColorPickerComponent extends Base {

  @Prop()
  setColor: Function;

  defaultColor: string = '';
  showAllColors: boolean = false;
  get style() {

    return{
      'background-color': this.defaultColor,

    };
  }

  get_color(color: string) {

    const a = [];

    for (const i in this.get_colors()[color]) {
      a.push(this.get_colors()[color][i]);
    }
    return a;
  }

  get_style(color: string) {
    return{
      'background-color': color,
      width: '30px',
      height: '30px',

    };
  }

  created() {
    this.defaultColor = this.get_random_color();
    this.$emit('default_color', this.defaultColor);
  }
}
