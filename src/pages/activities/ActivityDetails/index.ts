import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';
import template from './template.vue';
import {
  IPipelineEntryActivityModel,
  $pipelineEntryActivity,
  PipelineEntryActivityStatus,
} from '@immosparrow/cockpit-api-v2';
import activity from '../../../components/activity';
import ConfirmModal from '../../../components/modal/confirmModal';
import { getDateAndTime } from '../../../components/sharedFunctions';
@Component({
  name: 'ActivityDetails',
  mixins: [template],
  components: {
    activity,
    ConfirmModal,
  },
})

export default class ActivityDetails extends Vue {

  @Prop({ default: null })
  activity: IPipelineEntryActivityModel;

  @Prop({ default: false })
  addActivity: boolean;

  @Prop({ default: false })
  editActivity: boolean;

  @Prop({ default: false })
  fromPipeDetails: boolean;

  @Prop({ default: true })
  isOwner: boolean;

  @Prop({ default: false })
  loadElement: boolean;

  showModal: boolean = false;
  getDateAndTime: Function = getDateAndTime;

  downloading: boolean = false;

  deleteActivity () {
    this.showModal = false;
    $pipelineEntryActivity(this.activity.id).delete()
    .then(() => {
      this.$emit('closeActivityDetail');
      Vue.prototype.$notify({
        group: 'actions',
        type: 'success',
        duration: 2500,
        text: 'Activity successfully deleted',
      });
      this.$root.$emit('refreshActivities');
      this.$root.$emit('refreshSelEntry');
      this.$root.$emit('refreshActivityOverdue');
      this.$root.$emit('refreshActivitiesList');
    });
  }

  changeStatus () {
    this.activity.status === PipelineEntryActivityStatus.Pending ? this.activity.status = PipelineEntryActivityStatus.Completed : this.activity.status = PipelineEntryActivityStatus.Pending;
    $pipelineEntryActivity(this.activity.id).updateStatus(this.activity.status)
      .then((res: boolean) => {
        if (res) {
          this.$root.$emit('refreshActivities');
          this.$root.$emit('refreshSelEntry');
          this.$root.$emit('refreshActivitiesList');
        }
      });
  }
  get checkCompleted() {
    return this.activity.status === PipelineEntryActivityStatus.Completed;
  }

  exportCalendar (type: string) {
    this.downloading = true;
    $pipelineEntryActivity(this.activity.id).exportCalendar()
      .then((res) => {
        const saveBlob = (function () {
          const a = document.createElement('a');
          document.body.appendChild(a);
          return function (blob: any, fileName: string) {
            const url = window.URL.createObjectURL(blob);
            a.href = url;
            a.download = fileName;
            a.click();
            window.URL.revokeObjectURL(url);
          };
        }());
        const name = res.fileName || `Export_${this.getDateAndTime(new Date(), 'DDMMYYYY_hhmm')}.${type}`; // .ics || .pst
        saveBlob(res.data, name);
        this.downloading = false;
      }).catch(() => this.downloading = false);
  }
}
