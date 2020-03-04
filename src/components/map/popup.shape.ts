import Vue from 'vue';
import template from './popup.shape_template.vue';
import { Component, Watch, Prop } from 'vue-property-decorator';

@Component({
  mixins: [template],
  components: {
  },
})
export default class PopupShapeComponent extends Vue {

  @Prop()
  updateShapeName: Function;

  @Prop()
  closePopup: Function;

  @Prop()
  shape: any;

  @Prop()
  polygonSymbol: any;

  shapeModel: any;
  shapeModelName: string = '';

  created() {
    this.shapeModel = this.shape;
    this.shapeModelName = this.shapeModel.name;
  }

  @Watch('shapeModelName', { deep: true, immediate: true })
  ss(val: any) {
    this.$emit('shape_model_changed', this.shapeModelName);
  }

}
