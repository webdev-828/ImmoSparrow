import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';
import template from './template.vue';
import {
    IPipelineEntryLightModel,
    $pipelineEntry,
    PipelineEntryActivityStatus,
    PipelineEntryActivityLightModel,
    $pipelineEntryActivity,
    PipelineEntryActivityQueryStatuses,
  } from '@immosparrow/cockpit-api-v2';
import { getActivityType } from '../../../components/sharedFunctions';

@Component({
  name: 'ActivityOverdue',
  mixins: [template],
})

export default class ActivityOverdue extends Vue {

  @Prop({ default: null })
  lead: IPipelineEntryLightModel;

  @Prop({ default: true })
  isOwner: boolean;

  getActivityType: Function = getActivityType;
  activityOverdue: PipelineEntryActivityLightModel[] = [];

  created () {
    this.$root.$on('refreshActivityOverdue', () => {
      this.loadActivities();
    });

    if (this.lead) {
      this.loadActivities();
    }
  }

  beforeDestroy () {
    this.$root.$off('refreshActivityOverdue');
  }

  loadActivities () {
    if (this.lead.isArchived) {
      $pipelineEntry(this.lead.id).getActivities(PipelineEntryActivityQueryStatuses.Pending)
        .then((res: PipelineEntryActivityLightModel[]) => {
          this.activityOverdue = res;
          this.activityOverdue.sort((a: any, b: any) => {
            const aDate = a.timeUtc || a.createdTime;
            const bDate = b.timeUtc || b.createdTime;
            return aDate - bDate;
          }).reverse();
        });
    }
  }

  changeStatus (item: any) {
    item.status = PipelineEntryActivityStatus.Completed;
    $pipelineEntryActivity(item.id).updateStatus(item.status)
      .then((res: boolean) => {
        if (res) {
          this.activityOverdue.splice(this.activityOverdue.indexOf(item), 1);
          this.$root.$emit('updateActivityTimeline', item);
          this.$emit('refreshSelectedEntry', this.activityOverdue.length, this.lead);
        }
      });
  }

  checkStatus(status: number) {
    return status === PipelineEntryActivityStatus.Completed;
  }
}
