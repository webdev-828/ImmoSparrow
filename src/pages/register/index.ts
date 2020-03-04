import Vue from 'vue';
import { Component } from 'vue-property-decorator';
import register from './Register.vue';
import store from '../../store';
import * as auth from '../../store/modules/authStatesModule';
import {
    RecipientInvitationModel,
    IRecipientInvitationModel,
    IInvitationResponse,
    InvitationResponse,
    IUserProfileModel,
    $newObj, UserProfileModel,
    IUserRegistrationProof, UserRegistrationProof,
    $authUser, UserPasswordCredential,
    UserPrimaryInfo,
    RegisterUserProfileResult,
    InvitationType, $anonymousUser,
} from '@immosparrow/cockpit-api-v2';
import Login from '../login';
import * as globalState from '../../store/modules/globalStatesModule';

export interface AcceptInvitationModel {
  response: IInvitationResponse;
  secretId: string;
}

Component.registerHooks([
  'beforeRouteLeave',
]);

@Component({
  mixins: [register],
  components: {
    Login,
  },
})
export default class Register extends Vue {

  step: number = 0;
  invitation: IRecipientInvitationModel  = new RecipientInvitationModel();
  loaded: boolean = false;
  acceptInvitationData: AcceptInvitationModel = {
    response: new InvitationResponse(),
    secretId: '',
  };
  invitationMode: boolean = false;
  profile: IUserProfileModel = $newObj(UserProfileModel);
  proof: IUserRegistrationProof = $newObj(UserRegistrationProof);
  accepting: boolean = false;
  declining: boolean = false;
  noInvitation: boolean = false;
  allowTransition: boolean = false;
  localize: any = window['Localize'];

  created () {
    globalState.commitSetLoadingButton(store, false);
    if (this.$route.query.secretId) {
      const secretId = this.$route.query.secretId.toString();
      $anonymousUser.invitations.get(secretId)
        .then((res: any) => {
          if (res) {
            this.invitation = res;
            this.loaded = true;
          } else {
            this.changeAllowTransition();
            this.$router.push({ name: 'Login' });
          }
        });
    } else {
      this.loaded = true;
      this.noInvitation = true;
    }
  }

  register (registerInfo: any) {
    this.profile = $newObj(UserProfileModel);
    this.profile.email = registerInfo.email;
    this.profile.primaryInfo = $newObj(UserPrimaryInfo);
    this.profile.primaryInfo.firstName = registerInfo.firstName;
    this.profile.primaryInfo.lastName = registerInfo.lastName;

    this.proof.invitationSecretId = this.$route.query.secretId.toString();
    const registerModel = {
      password: registerInfo.password,
      profile: this.profile,
      proof: this.proof,
    };
    auth.dispatchRegisterUser(store, registerModel)
        .then((res: any) => {
          switch (res) {
            case RegisterUserProfileResult.Success:
              Vue.prototype.$notify({
                group: 'actions',
                type: 'success',
                duration: 2500,
                text: 'You have registered successfully',
              });
              const model = new UserPasswordCredential({
                email: registerInfo.email,
                password: registerInfo.password,
                persistent: false,
              });
              auth.dispatchLogin(store, model)
                      .then(() => {
                        $authUser.getContext()
                            .then((res) => {
                              auth.commitSetUserContext(store, res);
                              this.acceptInvitation();
                            });
                      });
              break;
            case RegisterUserProfileResult.DuplicatedEmail:
              this.$root.$emit('showDuplicateEmail');
              break;
            case RegisterUserProfileResult.InvalidProof:
              Vue.prototype.$notify({
                group: 'actions',
                type: 'error',
                duration: 2500,
                text: 'Invalid invitation secret ID or the invitation was already used to register a user',
              });
              break;
          }
        });
  }

  acceptInvitation () {
    this.acceptInvitationData.secretId = this.$route.query.secretId.toString();
    this.accepting = true;
    $authUser.invitations.accept(this.acceptInvitationData.secretId, this.acceptInvitationData.response)
      .then((res) => {
        setTimeout(() => {
          if (res) {
            this.loaded = true;
            this.accepting = false;
            Vue.prototype.$notify({
              group: 'actions',
              type: 'success',
              duration: 2500,
              text: 'You have accepted the invitation',
            });
            this.$root.$emit('stopLoading');
            if (auth.getUserContext(store)) {
              auth.commitSetUserContext(store, null);
              $authUser.getContext()
                      .then((res) => {
                        auth.commitSetUserContext(store, res);
                        this.$router.push({ name: 'Dashboard' });
                      });
            } else {
              this.$router.push({ name: 'Login' });
            }
          }
        },         1000);
      })
      .catch((err) => {
        this.invitationMode = true;
      });
  }

  declineInvitation () {
    this.acceptInvitationData.secretId = this.$route.query.secretId.toString();
    this.declining = true;
    $anonymousUser.invitations.reject(this.acceptInvitationData.secretId, this.acceptInvitationData.response)
      .then((res) => {
        setTimeout(() => {
          this.declining = false;
          if (res) {
            Vue.prototype.$notify({
              group: 'actions',
              type: 'success',
              duration: 2500,
              text: 'You have declined the invitation',
            });
            if (auth.getUserContext(store)) {
              this.$router.push({ name: 'Dashboard' });
            } else {
              this.$router.push({ name: 'Login' });
            }
          } else {
            Vue.prototype.$notify({
              group: 'actions',
              type: 'error',
              duration: 2500,
              text: 'Error while trying to decline the invitation',
            });
          }
        },         1000);
      });
  }

  getInvType (type: number) {
    switch (type) {
      case InvitationType.Agency_BecomeOwner:
        return 'owner';
      case InvitationType.Agency_ReceiveOwnership:
        return 'ownership';
      case InvitationType.Employee_BecomeEmployee:
        return 'employee';
    }
  }

  goToPage(page: string) {
    this.changeAllowTransition();
    this.$router.push({ path: `/${page}` });
  }

  changeAllowTransition() {
    this.allowTransition = true;
  }

  beforeRouteLeave(to: any, from: any, next: any) {
    if (from.query && from.query.secretId && !this.allowTransition) {
      next(false);
    } else {
      next();
    }
  }
}
