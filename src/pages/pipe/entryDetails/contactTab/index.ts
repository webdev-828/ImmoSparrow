import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';
import template from './template.vue';
import {
    IPipelineEntryLightModel,
    IPipelineEntryCustomField,
    PipelineEntryCustomField,
    $newObj,
    mval as val,
    $pipelineEntry,
  } from '@immosparrow/cockpit-api-v2';
import * as globalState from '../../../../store/modules/globalStatesModule';
import store from '../../../../store';
import BasicInfo from '../../basicInfo';
import Address from '../../../../components/address';

@Component({
  name: 'ContactTab',
  mixins: [template],
  components: {
    BasicInfo,
    Address,
  },
})

export default class ContactTab extends Vue {

  @Prop({ default: null })
  item: IPipelineEntryLightModel;

  val: Function = val;

  sectionBasic: boolean = true;
  showContactInfo: boolean = true;
  showCustomContactInfo: boolean = true;
  addContactField: boolean = false;

  contactField: IPipelineEntryCustomField = $newObj(PipelineEntryCustomField);

  cancelContactField () {
    this.addContactField = !this.addContactField;
    this.contactField = $newObj(PipelineEntryCustomField);
  }

  addNewContactField (form: string) {
    this.$validator.validateAll(form).then((valid) => {
      if (valid) {
        if (!this.item.entityModifiableInfo.contactInfo.customFields) {
          this.item.entityModifiableInfo.contactInfo.customFields = [];
        }
        this.item.entityModifiableInfo.contactInfo.customFields.push(this.contactField);
        this.updateObjectInfo('objectInfoForm');
        this.cancelContactField();
      }
    });
  }

  deleteContactField (field: PipelineEntryCustomField) {
    this.item.entityModifiableInfo.contactInfo.customFields.splice(this.item.entityModifiableInfo.contactInfo.customFields.indexOf(field), 1);
    this.updateObjectInfo('objectInfoForm');
  }

  openDetailView () {
    globalState.commitSetNextItem(store, false);
    globalState.commitShowRightSidebar(store, true);
  }

  updatingEntry: boolean = false;
  updateObjectInfo (form: string) {
    this.$validator.validateAll(form).then((valid) => {
      if (valid) {
        this.updatingEntry = true;
        $pipelineEntry(this.item.id).updateEntityModifiableInfo(this.item.entityModifiableInfo)
          .then((res: boolean) => {
            if (res) {
              this.$root.$emit('refreshPipeEntry', this.item);
              this.$root.$emit('refreshActivities');
              setTimeout(() => {
                Vue.prototype.$notify({
                  group: 'actions',
                  type: 'success',
                  duration: 2500,
                  text: 'Entry successfully updated',
                });
                this.updatingEntry = false;
              },         1000);
            }
          });
      }
    });
  }

}
