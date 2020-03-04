import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';
import template from './template.vue';
import moment from 'moment';
import { ActivityModel } from '../../../../models/global';
import { PipelineEntryActivityType } from '@immosparrow/cockpit-api-v2';

@Component({
  name: 'EventItem',
  mixins: [template],
})
export default class EventItem extends Vue {

  @Prop({ default: {} })
  event: ActivityModel;

  @Prop({ default: true })
  hasDynamicSize: Boolean;

  ancestorHeight: number = 0;

  get activityType () {
    switch (this.event.type) {
      case PipelineEntryActivityType.Call:
        return 'fa-phone';
      case PipelineEntryActivityType.Deadline:
        return 'fa-clock-o';
      case PipelineEntryActivityType.Email:
        return 'fa-envelope';
      case PipelineEntryActivityType.Lunch:
        return 'fa-coffee';
      case PipelineEntryActivityType.Meeting:
        return 'fa-users';
      case PipelineEntryActivityType.Task:
        return 'fa-tasks';
    }
  }

  get displayHeight () {
    let hrs = this.event['duration'] && this.event['duration'].value ? this.event['duration'].value / 60 : 1;
    const parsedHour = parseInt(moment(this.event['startTime']).format('HH'));
    let parsedMin = parseInt(moment(this.event['startTime']).format('mm'));
    if ((parsedHour + hrs) >= 24) {
      hrs = 24 - parsedHour;
      parsedMin = 0;
    }
    const endTime = moment(this.event['startTime']).add(hrs, 'hours'); // .add(parsedMin, 'minutes');
    const end = endTime && endTime.hours() > 0 ? moment(endTime) : moment(endTime).add(1, 'days');
    let hours = end.diff(this.event['startTime'], 'hours', true);
    hours = hours > 24 ? hours - 24 : hours;
    const bordersOffset = hours;
    return (hours * this.ancestorHeight) + bordersOffset;
  }

  get eventStyles () {
    const styles = [];
    styles.push({
      backgroundColor: this.event.color,
      color: this.event.color,
    });
    if (this.hasDynamicSize) {
      styles.push({
        height: `${this.displayHeight}px`,
      });
      if (this.event.overlaps > 0) {
        const width = 100 / (this.event.overlaps + 1);
        styles.push({
          width: `${width}%`,
          left: `${width}%`,
        });
      }
      if (moment(this.event['startTime']).minutes() > 0) {
        const distance = (this.ancestorHeight / 60) * moment(this.event['startTime']).minutes();
        styles.push({
          top: `${distance}px`,
        });
      }
    }
    return styles;
  }

  get eventClasses () {
    return {
      'is-overlapping': this.event['overlaps'] > 0,
    };
  }

  mounted () {
    if (this.hasDynamicSize) {
      this.getAndSetAncestorHeight();
      window.addEventListener('resize', this.getAndSetAncestorHeight);
    }
  }

  beforeDestroy () {
    if (this.hasDynamicSize) {
      window.removeEventListener('resize', this.getAndSetAncestorHeight);
    }
  }

  getAndSetAncestorHeight () {
    this.ancestorHeight = this.findAncestor(this.$refs.event_block, 'v-cal-day__hour-content').offsetHeight;
  }

  findAncestor (el: any, cls: any) {
    let tempEl = el;
    while ((tempEl = tempEl.parentElement) && !tempEl.classList.contains(cls));
    return tempEl;
  }
}
