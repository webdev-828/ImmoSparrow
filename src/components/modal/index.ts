import Vue from 'vue';
import template from './template.vue';
import { Component, Prop, Watch } from 'vue-property-decorator';

@Component({
  mixins: [template],
  name: 'ModalComponent',
  components: {
  },
})
export default class ModalComponent extends Vue {

  @Prop()
  modalShow: boolean;

  @Prop()
  loadingResults: boolean;

  @Prop({ default: false })
  bigModal: boolean;

  @Prop()
  onCloseModal: Function;

  showModal: boolean = false;

  @Watch('modalShow')
  sm() {
    this.modalShow ? this.showModal = true : this.showModal = false;
  }

  closeModal() {
    if (this.onCloseModal) {
      this.onCloseModal();
    }
  }
}
