import Vue from 'vue';
import { Component, Prop, Watch } from 'vue-property-decorator';
import template from './template.vue';
import { PipelineEntryActivityModel,
        IPipelineEntryActivityModel,
        PipelineEntryActivityType,
        PipelineEntryActivityStatus,
        $pipelineEntryActivity,
        IEntitySearchResult,
        EntitySearchQuery,
        IPipelineLightModel,
        PipelineEntryQuery,
        IPipelineEntryLightModel,
        IPipelineEntryQuery,
        $pipelineEntry,
        $pipeline,
        mval as val,
        $newObj } from '@immosparrow/cockpit-api-v2';
import * as pipelineModule from '../../store/modules/pipeline';
import store from '../../store';
import Scheduler from './scheduler';
import { ActivityModel, OptionModel } from '../../models/global';
import VeeValidate from 'vee-validate';
import moment from 'moment';

Vue.use(VeeValidate, {
  events: 'blur',
});

@Component({
  name: 'ActivityComponent',
  mixins: [template],
  components: {
    Scheduler,
  },
})

export default class ActivityComponent extends Vue {

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

  val: Function = val;

  activityType: object = {
    Call: true,
    Meeting: false,
    Task: false,
    Deadline: false,
    Email: false,
    Lunch: false,
  };
  editing: boolean = false;

  newActivity: IPipelineEntryActivityModel = $newObj(PipelineEntryActivityModel);
  activityDate: Date = new Date();
  startTime: string = moment().format('HH:mm');
  endTime: string = '';
  pipeRequired: boolean = false;
  entryRequired: boolean = false;

  durationMinutes: OptionModel = { text: 'Duration', value: undefined };
  durationOptions: OptionModel[] = [
    { text: '10min', value: 10 },
    { text: '30min', value: 30 },
    { text: '1h', value: 60 },
    { text: '3h', value: 180 },
    { text: '5h', value: 300 },
  ];
  disabledDatesStartDate: any = {
    to: new Date(Date.now() - 8640000),
  };

  selectedPipeline: IPipelineLightModel = null;
  selectedEntry: any = null;
  entries: Array<IPipelineEntryLightModel> = [];
  pipelines: Array<IPipelineLightModel> = [];

  get activeViewProps() {
    const props = {
      startTime: moment(this.startTime, 'HH:mm'),
      duration: this.durationMinutes ? this.durationMinutes : { text: 'Duration', value: undefined },
      date: this.activityDate,
      subject: this.newActivity.subject,
      message: this.newActivity.message,
      type: this.newActivity.type,
      id: this.newActivity.id,
    };
    return props;
  }

  created () {
    if (this.editActivity) {
      this.newActivity = this.activity;
      this.operateActivityType(PipelineEntryActivityType[this.newActivity.type]);
      this.activityDate = this.newActivity.timeUtc;
      if (this.newActivity.timeUtc) {
        this.startTime = moment(this.newActivity.timeUtc, 'HH:mm').format('HH:mm');
      }
      this.durationMinutes = this.durationOptions.find((item: OptionModel) => item.value === this.newActivity.durationMinutes);
    } else {
      this.newActivity = $newObj(PipelineEntryActivityModel);
      this.newActivity.type = PipelineEntryActivityType.Call;
      const query = $newObj(EntitySearchQuery);
      query.text = '';
      pipelineModule.dispatchGetPipelines(store, query)
        .then((res: IEntitySearchResult<IPipelineLightModel>) => {
          this.pipelines = res.items;
        });
    }
  }

  operateActivityType(tab: string) {
    for (const i in this.activityType) {
      this.activityType[i] = i === tab;
      this.newActivity.type = PipelineEntryActivityType[tab];
    }
  }

  addNewActivity (form: string) {
    this.$validator.validateAll(form).then((result) => {
      if (result) {
        this.newActivity.status = PipelineEntryActivityStatus.Pending;
        if (this.activityDate && this.startTime) {
          this.newActivity.timeUtc = this.activityDate;
          const startT = moment(this.startTime, 'HH:mm');
          this.newActivity.timeUtc.setHours(parseInt(startT.format('HH')), parseInt(startT.format('mm')), 0);
          this.newActivity.timeUtc = new Date(this.newActivity.timeUtc.toUTCString());
        }
        if (this.durationMinutes && this.durationMinutes.value) {
          this.newActivity.durationMinutes = this.durationMinutes.value;
        }
        if (this.addActivity && !this.fromPipeDetails) {
          if (!this.selectedPipeline) {
            this.pipeRequired = true;
            this.$el.querySelector('#activity_form').scrollIntoView({ behavior: 'smooth' });
            return;
          }
          if (!this.selectedEntry) {
            this.entryRequired = true;
            this.$el.querySelector('#activity_form').scrollIntoView({ behavior: 'smooth' });
            return;
          }
          this.editing = true;
          $pipelineEntry(this.selectedEntry.id).createActivity(this.newActivity)
            .then((res) => {
              this.$root.$emit('refreshActivities');
              this.$root.$emit('refreshActivitiesList');
              setTimeout(() => {
                this.editing = false;
                this.resetForm();
                Vue.prototype.$notify({
                  group: 'actions',
                  type: 'success',
                  duration: 2500,
                  text: 'Activity successfully created',
                });
              },         1000);
            });
        } else if (this.editActivity) {
          this.editing = true;
          $pipelineEntryActivity(this.newActivity.id).update(this.newActivity as PipelineEntryActivityModel)
            .then(() => {
              setTimeout(() => {
                Vue.prototype.$notify({
                  group: 'actions',
                  type: 'success',
                  duration: 2500,
                  text: 'Activity successfully updated',
                });
                this.editing = false;
                this.$root.$emit('refreshActivities');
                this.$root.$emit('refreshSelEntry');
                this.$root.$emit('refreshActivityOverdue');
                this.$root.$emit('refreshActivitiesList');
                this.$emit('closeActivityDetail');
              },         1000);
            });
        } else {
          this.editing = true;
          this.$emit('createActivity', this.newActivity);
          this.$root.$emit('refreshActivitiesList');
          setTimeout(() => {
            this.editing = false;
            Vue.prototype.$notify({
              group: 'actions',
              type: 'success',
              duration: 2500,
              text: 'Activity successfully created',
            });
            this.resetForm();
          },         1000);
        }
      } else {
        this.$el.querySelector('#activity_form').scrollIntoView({ behavior: 'smooth' });
      }
    });
  }

  resetForm () {
    this.newActivity = $newObj(PipelineEntryActivityModel);
    this.newActivity.type = PipelineEntryActivityType.Call;
    this.operateActivityType('Call');
    this.selectedPipeline = null;
    this.selectedEntry = null;
    this.startTime = moment().format('HH:mm');
    this.activityDate = new Date();
    this.pipeRequired = false;
    this.entryRequired = false;
    this.$nextTick(() => {
      this.$validator.reset();
    });
  }

  selectPipeline (pipe: IPipelineLightModel) {
    const queryObj: IPipelineEntryQuery = $newObj(PipelineEntryQuery);
    queryObj.entityTypes = -1;
    this.entries = [];
    this.selectedEntry = null;
    this.pipeRequired = false;
    $pipeline(pipe.id).entries.find(queryObj)
      .then((res2) => {
        this.entries = res2.items;
      });
  }

  entryName(item: IPipelineEntryLightModel): string {
    return item.name || this.val(item, (item: IPipelineEntryLightModel) => item.publication.primaryInfo.basicInfo.title) || 'undefined';
  }

  changeDate(activity: ActivityModel) {
    this.activityDate = new Date(activity.date);
    if (activity.startTime) {
      this.startTime = moment(activity.startTime).format('HH:mm');
    }
    if (activity.duration) {
      this.durationMinutes = this.durationOptions.find((item: OptionModel) => item.value === activity.duration.value);
    } else {
      this.durationMinutes = { text: 'Duration', value: undefined };
    }
    if (activity.subject) {
      this.newActivity.subject = activity.subject;
    }
    this.newActivity.message = activity.message;
  }
}
