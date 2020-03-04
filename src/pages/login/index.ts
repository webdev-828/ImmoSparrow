import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';
import template from './Login.vue';
import {
  IRecipientInvitationModel, UserPasswordCredential, $anonymousUser,
  $authUser, UserDevAccessLevel, IUserAgencyModel,
} from '@immosparrow/cockpit-api-v2';
import store from '../../store';
import { commitShowNewFeatures, commitResetState } from './../../store/modules/globalStatesModule';
import * as auth from './../../store/modules/authStatesModule';
import { getAgency, dispatchGetAgency } from '../../store/modules/adminModule';

@Component({
  mixins: [template],
})

export default class Login extends Vue {

  loginInfo: UserPasswordCredential = new UserPasswordCredential({
    email: '',
    password: '',
    persistent: false,
  });

  registerInfo: any = {
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
  };

  loading: boolean = false;
  error: boolean = false;
  register: boolean = false;

  acceptTerms: boolean = false;

  showDuplicateEmail: boolean = false;

  passRegex: RegExp = new RegExp('^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\\$%\\^&\\*\\(\\)\\[\\]\\{\\}\\<\\>\\-\\_\\=\\+\\.\\?])');

  @Prop({ default: false })
  invitationMode: boolean;

  @Prop({ default: null })
  invitation: IRecipientInvitationModel;

  @Prop()
  changeAllowTransition: Function;

  get loginError (): boolean {
    return auth.getLoginError(store);
  }
  get hasEmail (): boolean {
    return this.loginInfo.email.length > 0;
  }
  get hasPassword (): boolean {
    return this.loginInfo.password.length > 0;
  }
  get registerHasFirstName (): boolean {
    return this.registerInfo.firstName.length > 0;
  }
  get registerHasLastName (): boolean {
    return this.registerInfo.lastName.length > 0;
  }
  get registerHasEmail (): boolean {
    return this.registerInfo.email.length > 0;
  }
  get registerHasPassword (): boolean {
    return this.registerInfo.password.length > 0;
  }
  get registerHasConfirmPassword (): boolean {
    return this.registerInfo.confirmPassword.length > 0;
  }

  async created () {
    if (this.$route.name === 'Register') {
      this.register = true;
      if (this.invitation && this.invitation.request) {
        if (this.invitation.request.recipient) {
          this.registerInfo.firstName = this.invitation.request.recipient.firstName;
          this.registerInfo.lastName = this.invitation.request.recipient.lastName;
        }
        this.registerInfo.email = this.invitation.email;
      }
    }

    if (this.$route.query.resetId) {
      const resetComplete = await $anonymousUser.profile.completePasswordReset(this.$route.query.resetId as string);
      await auth.dispatchLogout(store);
      if (resetComplete) {
        this.$notify({
          text: 'Your password was successfully changed. Please try to login.',
          group: 'actions',
          type: 'success',
          duration: 5000,
        });
        // this.$router.push({ query: null });
      } else {
        this.$notify({
          text: 'There was a problem with the password change. Please try to reset your password again.',
          group: 'actions',
          type: 'error',
          duration: 5000,
        });
        this.$router.push('/reminder');
      }
    }

    commitResetState(store);
    auth.commitResetState(store);
    this.$forceUpdate();

    this.$root.$on('showDuplicateEmail', () => {
      setTimeout(() => {
        this.showDuplicateEmail = true;
      },         1000);
    });
  }

  login () {
    const self = this;
    auth.commitLoginError(store, false);
    this.$validator.validateAll('loginForm').then((result) => {
      if (result) {
        this.loading = true;
        auth.dispatchLogin(store, this.loginInfo)
        .then(() => {
          if (this.loginError) {
            this.loading = false;
          } else {
            $authUser.getContext()
            .then((res) => {
              auth.commitSetUserContext(store, res);
              if (res && res.devSettings && res.devSettings.accessLevel === UserDevAccessLevel.Developer) {
                commitShowNewFeatures(store, true);
              }
              if (this.invitationMode) {
                if (this.changeAllowTransition) {
                  this.changeAllowTransition();
                }
                this.$emit('acceptInvitation');
              } else {
                self.loading = false;
                  // window.location.href = "/";
                const user = auth.getUserContext(store);
                const empCtx = auth.getEmployeeContext(store);
                if (!empCtx && user.agencies.length) {
                  this.selectAgency(user.agencies[0]);
                } else {
                  self.$router.push(self.$router['history'].current.query.redirect || '/');
                }
              }
            });
          }
        })
        .catch((e: any) => {
          this.loading = false;
        });

      }
    });
  }

  selectAgency (agency: IUserAgencyModel) {
    const ag = getAgency(store);
    if (!ag || (ag && ag.id !== agency.agency.id)) {
      dispatchGetAgency(store, agency.agency.id)
        .then(() => {
          $authUser.clearCurrentEmployee();
          auth.commitSetEmployeeContext(store, null);
          auth.commitSetUserAgency(store, agency);
          if (agency.employee) {
            const selectedEmployee = agency.employee;
            auth.commitSetEmployeeContext(store, null);
            const accessMode: number = selectedEmployee.role;
            $authUser.setCurrentEmployee(selectedEmployee.id, accessMode);
            $authUser.getCurrentWorkspaceContext()
              .then((res) => {
                auth.commitSetEmployeeContext(store, res);
                this.$root.$emit('currentEmployeeLoaded');
                auth.commitSetNoEmployeeStatus(store, undefined);
                auth.commitSetSuperviseMode(store, false);
                this.$router.push(this.$router['history'].current.query.redirect || '/');
              });
          } else {
            this.$router.push('/');
          }
        });
    } else {
      this.$router.push('/');
    }
  }

  registerUser () {
    const self = this;
    this.$validator.validateAll('registerForm').then((result) => {
      if (result) {
        this.loading = true;
        if (this.changeAllowTransition) {
          this.changeAllowTransition();
        }

        self.$emit('register', this.registerInfo);
        setTimeout(() => {
          self.loading = false;
        },         2000);
      }
    });
  }
}
