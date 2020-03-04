import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';
import template from './tab3.template.vue';
import Base from '../../base';
import { $authUser, IUserNotificationSettings, UserNotificationFrequency } from '@immosparrow/cockpit-api-v2';

@Component({
  name: 'Tab3',
  mixins: [template],
})

export default class Tab3 extends Base {
  selectedNotificationFrequency: UserNotificationFrequency = UserNotificationFrequency.EveryMorning;

  notifications = [
    {
      id: UserNotificationFrequency.Never,
      value: 'never',
    },
    {
      id: UserNotificationFrequency.Immediately,
      value: 'immediately',
    },
    {
      id: UserNotificationFrequency.EveryMorning,
      value: 'every morning',
    },
    {
      id: UserNotificationFrequency.TwiceADay,
      value: 'twice a day',
    },
    {
      id: UserNotificationFrequency.OnceAWeek,
      value: 'once a week',
    },
  ];

  @Prop()
  notificationSettings: IUserNotificationSettings;

  @Prop()
  updateUserData: Function;

  created() {
    if (this.notificationSettings && this.notificationSettings.leadsNotificationFrequency !== undefined) {
      this.selectedNotificationFrequency = this.notificationSettings.leadsNotificationFrequency;
    }
  }

  async updateNotification() {
    const result = await $authUser.profile.updateNotificationSettings({ leadsNotificationFrequency: this.selectedNotificationFrequency });
    if (result) {
      this.showSuccessMessage('Your notification settings was successfully updated!');
      this.updateUserData();
    }
  }
}
