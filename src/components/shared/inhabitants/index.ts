import { Component, Prop, Watch } from 'vue-property-decorator';
import template from './template.vue';
import {
  IPubModel, PubModel, IPropertyInhabitantModel,
  $publication, PropertyInhabitantLegalPersonType,
  GetInhabitantsResultCode, $newObj, $entrance,
} from '@immosparrow/cockpit-api-v2';
import { safeVal } from '@immosparrow/cockpit-lib-core';
import PhoneMixin from '@/mixins/phoneParser';
import { mixins } from 'vue-class-component';
import BundleChecks from '@/mixins/bundleChecks';
@Component({
  name: 'Inhabitants',
  mixins: [template, PhoneMixin],
})
export default class Inhabitants extends mixins(BundleChecks) {

  @Prop({ default: () => $newObj(PubModel) })
  item: IPubModel;

  @Prop()
  entrenceId: string;

  inhabitantsMinified: boolean = true;
  inhabitantsSection: boolean = false;
  unavailableInhabitantsService: boolean = false;
  inhabitants: IPropertyInhabitantModel[] = [];
  val: Function = safeVal;

  created() {
    this.loadInhabitantsInfo();
  }

  loadInhabitantsInfo() {
    if (this.searchInhabitantsInfo) {
      if (this.val(this.item, (item: PubModel) => item.runtimeServices.propertyIhabitantsInfoService.serviceStatus)) {
        this.inhabitantsSection = true;
        $publication(this.item.id).getInhabitants().then((res) => {
          if (res.code === GetInhabitantsResultCode.Success) {
            this.unavailableInhabitantsService = false;
            this.inhabitants = res.result;
          } else {
            this.unavailableInhabitantsService = true;
          }
        });
      }
    }
  }

  @Watch('item')
  changeItem() {
    if (this.item) {
      this.inhabitants = [];
      this.inhabitantsSection = false;
      this.loadInhabitantsInfo();
      this.unavailableInhabitantsService = false;
    }
  }
  @Watch('entrenceId', { immediate: true })
  changeEntranceId() {
    if (this.entrenceId) {
      this.unavailableInhabitantsService = false;
      $entrance(this.entrenceId).getInhabitants().then((res) => {
        if (res.code === GetInhabitantsResultCode.Success) {
          this.inhabitants = res.result;
          if (this.inhabitants.length) {
            this.inhabitantsSection = true;
          } else {
            this.inhabitantsSection = false;
          }
        } else {
          this.unavailableInhabitantsService = true;
        }
      });
    }
    this.inhabitantsMinified = true;
  }

  inhabitantType (type: number) {
    return PropertyInhabitantLegalPersonType[type];
  }
}
