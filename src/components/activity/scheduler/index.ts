// tslint:disable
import Vue from 'vue';
import { Component, Prop, Watch } from 'vue-property-decorator';
import template from './template.vue';
import moment from 'moment';
import modal from '../../modal';
import { ActivityModel, OptionModel } from '../../../models/global';
import EventItem from './eventItem';
import _ from 'lodash';
import {
  IPipelineEntryActivityQuery, $pipelines,
  PipelineEntryActivityQuery, $newObj, PipelineEntryActivityQueryStatuses,
} from '@immosparrow/cockpit-api-v2';

@Component({
  name: 'Scheduler',
  mixins: [template],
  components: {
    modal,
    EventItem,
  },
})

export default class Scheduler extends Vue {

  @Prop({ default: function(): any { return new Date(); } })
  minDate: [Date, Object];
  @Prop({ default: function(): any { return null; } })
  maxDate: [Date, Object];
  @Prop()
  item: ActivityModel;

  today: any = moment();
  showDialog: boolean = false;
  previousTime: string = null;

  disabledDatesStartDate: any = {
    to: new Date(Date.now() - 8640000),
  };
  timeRange: Array<any> = [0, 23]
  day: any = null;
  now: any = moment(new Date());

  durationOptions: OptionModel[] = [
    { text: '10min', value: 10 },
    { text: '30min', value: 30 },
    { text: '1h', value: 60 },
    { text: '3h', value: 180 },
    { text: '5h', value: 300 },
  ];
  showTimeError: boolean = false;

  allEvents: Array<ActivityModel> = [];

  get activity () {
    return this.item;
  }

  get isPrevAllowed() {
    if (this.minDate ) {
      const mDate = moment(this.minDate);
      const prevRef = moment(this.activity.date).subtract(1, 'days');
      return mDate.isSameOrBefore(prevRef, 'day');
    }
    return true
  }
  get isNextAllowed() {
    const afterRef = moment(this.activity.date).add(1, 'days');
    if (this.maxDate) {
      const mDate = moment(this.maxDate);
      return mDate.isSameOrAfter(afterRef, 'day');
    }
    return !moment().isSameOrAfter(afterRef, 'day');
  }

  get times() {
    let times = [];
    for (let i = this.timeRange[0]; i < this.timeRange[1] + 1; i++ ) {
      const momentTime = moment(i, 'HH');
      times.push(momentTime);
    }
    return times;
  }
  get hourClass() {
    const minutes = Math.round(this.now.minutes() / 10) * 10;
    return 'has-marker is-' + minutes;
  }

  get getDayEvents () {
    return this.day.events.filter((event: ActivityModel) => {
      return event.startTime && moment(event.date).isSame(this.activity.date, 'day' );
    });
  }

  mounted() {
    //  Initial setup - load all employee activities
    const query: IPipelineEntryActivityQuery = $newObj(PipelineEntryActivityQuery);
    query.maxItemCount = 100;
    query.statuses = PipelineEntryActivityQueryStatuses.Any;

    /* if (this.selectedPipeline.id) {
      query.pipelineId = this.selectedPipeline.id;
    } else {
      query.pipelineId = undefined;
    } */
    $pipelines.findEntryActivities(query)
      .then((res) => {
        res.items.forEach(item => {
          this.allEvents.push({
            id: item.id,
            date: item.timeUtc,
            startTime:  moment(item.timeUtc, 'HH:mm'),
            duration: this.durationOptions.find((option: OptionModel) => option.value === item.durationMinutes) || null,
            subject: item.subject,
            message: item.message,
            type: item.type,
            overlaps: 0,
            color: this.activity.id !== item.id ? '#b4bfd0' : '',
          });
        });
        this.buildCalendar();
        this.createNewEvent();
      });
  }

  created () {
    setTimeout(() => {
      let hours = moment().hours();
      if (hours <= 21) {
        hours += 2;
      }
      const el = document.getElementById(`slot-${hours}`);
      if (el) {
        el.scrollIntoView({ block: 'end',  behavior: 'smooth' });
      }
    },        500);
  }

  @Watch('allEvents')
  activeE() {
    this.buildCalendar();
  }
  @Watch('item', { deep: true })
  activityChange() {
    this.activity.startTime = moment(this.activity.startTime, 'HH:mm');
    let el = this.allEvents.find(item => item.id === this.item.id || !item.id);
    if (el) {
      this.allEvents[this.allEvents.indexOf(el)] = this.activity;
    }
    this.buildCalendar();
  }

  @Watch('activity.startTime')
  validateStartTime () {
    if (this.activity.startTime) {
      if (parseInt(moment(this.activity.startTime, 'HH:mm').format('HH')) >= 0) {
        this.showTimeError = false;
      } else {
        this.showTimeError = true;
      }
    } else {
      this.showTimeError = true;
    }
  }

  cancelDialog () {
    this.showDialog = false;
    if (this.previousTime) {
      this.activity.startTime = moment(this.previousTime, 'HH:mm');
    } else {
      this.activity.startTime = moment(this.item.date, 'HH:mm');
    }
  }

  openDialog(time: any) {
    this.showDialog = true;
    this.previousTime = this.activity.startTime;
    this.activity.startTime = moment(time, 'HH').format('HH:mm');
  }

  createEvent () {
    this.$validator.validateAll('scheduler_form').then((result) => {
      if (result) {
        this.createNewEvent();
      }
    });
  }

  createNewEvent () {
    this.showDialog = false;
    this.activity.startTime = moment(this.activity.startTime, 'HH:mm');
    let ac = this.allEvents.find((item: ActivityModel) => item.id === this.activity.id || item.id === '');
    if (ac) {
      this.allEvents[this.allEvents.indexOf(ac)] = this.activity;
    } else {
      this.allEvents.push(this.activity);
    }
    this.$emit('changeDate', this.activity);
  }

  prev() {
    this.activity.date = new Date(moment(this.activity.date).subtract(1, 'days'));
    this.$emit('changeDate', this.activity);
  }
  next() {
    this.activity.date = new Date(moment(this.activity.date).add(1, 'days'));
    this.$emit('changeDate', this.activity);
  }
  goToToday() {
    this.activity.date = new Date();
    this.$emit('changeDate', this.activity);
  }

  checkIfToday(date: any) {
    return date ? moment(date).isSame(this.today, 'day') : false;
  }

  getStartTime (time: any) {
    return time ? moment(time).hours() : null;
  }

  buildCalendar() {
    let now = moment();
    const today = moment(this.activity.date);
    const dayEvents = this.allEvents.filter( e => moment(e.date).isSame(today, 'day') )
    const mappedEvents = dayEvents.map((event: ActivityModel) => {
        event.overlaps = dayEvents.filter(e => moment(event.startTime, 'HH:mm').isBetween(moment(e.startTime, 'HH:mm'), this.getEndTime(e) ) && e !== event ).length;
        return event;
    });
    this.day = {
        d: today,
        isPast: today.isBefore( now, 'day' ),
        isToday: today.isSame( now, 'day' ),
        availableTimes: this.times,
        events: mappedEvents
    };
  }

  getEndTime (event: ActivityModel) {
    let hrs = event['duration'] && event['duration'].value ? event['duration'].value / 60 : 0;
    let parsedMin = parseInt(moment(event['startTime']).format('mm'));
    return moment(event['startTime']).add(hrs, 'hours').minute(parsedMin);
  }
}
