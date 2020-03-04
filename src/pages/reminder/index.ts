import Vue from 'vue';
import { Component } from 'vue-property-decorator';
import template from './Reminder.vue';
import { $anonymousUser } from '@immosparrow/cockpit-api-v2';

const validation = {
  en: {
    custom: {
      email: {
        required: 'Please enter email.',
        email: 'Email should be valid.',
      },
    },
  },
};

@Component({
  mixins: [template],
})

export default class Reminder extends Vue {
  passRegex: RegExp = new RegExp('^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\\$%\\^&\\*\\(\\)\\[\\]\\{\\}\\<\\>\\-\\_\\=\\+\\.\\?])');
  currentEmail: string = '';
  newPassword: string = '';
  sending: boolean = false;

  mounted() {
    this.$validator.dictionary.merge(validation);
  }

  async validateAndSubmit({ target }: {target: HTMLFormElement}) {
    const validResult = await this.$validator.validateAll('forgotPasswordForm');
    if (validResult) {
      this.sending = true;
      const res = await $anonymousUser.profile.resetPassword(this.currentEmail, this.newPassword);
      this.sending = false;
      if (res) {
        this.$notify({
          text: `Please check your email-inbox. We sent a confirmation email to ${ this.currentEmail }`,
          group: 'actions',
          type: 'success',
          duration: 5000,
        });
        this.$router.push('/login');
      } else {
        this.$notify({
          text: 'Sorry, current email does not exist.',
          group: 'actions',
          type: 'error',
          duration: 2500,
        });
      }
    }
  }
}
