import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';
import template from './template.vue';
import {
    IPipelineEntryLightModel,
    PipelineEntryCustomField,
    IPipelineEntryCustomField,
    mval as val,
    $pipelineEntry,
    $newObj,
  } from '@immosparrow/cockpit-api-v2';
import * as globalState from '../../../../store/modules/globalStatesModule';
import store from '../../../../store';
import BasicInfo from '../../basicInfo';

@Component({
  name: 'ObjectTab',
  mixins: [template],
  components: {
    BasicInfo,
  },
})

export default class ObjectTab extends Vue {

  @Prop({ default: null })
  item: IPipelineEntryLightModel;

  sectionBasic: boolean = true;
  sectionBuilding: boolean = true;
  sectionProperty: boolean = true;
  showCustomObjectInfo: boolean = true;
  addObjectField: boolean = false;
  addedObjectField: boolean = false;

  val: Function = val;

  openDetailView () {
    globalState.commitSetNextItem(store, false);
    globalState.commitShowRightSidebar(store, true);
  }

  objectField:IPipelineEntryCustomField = $newObj(PipelineEntryCustomField);
  cancelObjectField () {
    this.addObjectField = !this.addObjectField;
    this.objectField = $newObj(PipelineEntryCustomField);
  }
  addNewObjectField (form: string) {
    this.$validator.validateAll(form).then((valid) => {
      if (valid) {
        if (!this.item.entityModifiableInfo.buildingInfo.customFields) {
          this.item.entityModifiableInfo.buildingInfo.customFields = [];
        }
        this.item.entityModifiableInfo.buildingInfo.customFields.push(this.objectField);
        this.updateObjectInfo('objectInfoForm');
        this.cancelObjectField();
      }
    });
  }

  deleteObjectField (field: PipelineEntryCustomField) {
    this.item.entityModifiableInfo.buildingInfo.customFields.splice(this.item.entityModifiableInfo.buildingInfo.customFields.indexOf(field), 1);
    this.updateObjectInfo('objectInfoForm');
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
      } else {
        this.sectionBuilding = true;
      }
    });
  }

}
