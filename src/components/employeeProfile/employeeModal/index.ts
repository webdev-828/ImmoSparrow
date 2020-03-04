import Vue from 'vue';
import template from './template.vue';
import Component from 'vue-class-component';
import Address from '../../address';
import { Prop } from 'vue-property-decorator';
import Debounce from 'debounce-decorator';
import { SingleCall } from '../../call';
import { $users, InvitationModel, IUserLightModel } from '@immosparrow/cockpit-api-v2';
import Base from '../../base';
import { UpdateInviteType } from '../index';

@Component({
  name: 'EmployeeModal',
  mixins: [template],
  components: { Address },
})
export default class EmployeeModal extends Base {
  @Prop()
  toggleUserModal: Function;

  @Prop()
  invitation: InvitationModel;

  @Prop()
  setNewInvitationStatus: Function;

  @Prop()
  updateType: UpdateInviteType;

  selectedUser: IUserLightModel = null;

  @Debounce(250)
  async getSearchSuggestions () {
    const ref = 'autocomplete_search';
    const singleCall = new SingleCall($users.find);
    const results = await singleCall.invoke({
      text: this.$parent.$refs[ref]['model'],
      maxItemCount: 6,
    });
    const { items } = results;
    this.autocompleteOptions = items;
    this.$parent.$refs[ref]['options'] = items;
    this.$parent.$refs[ref]['loadingData'] = false;
  }

  setUserData(user: IUserLightModel) {
    this.selectedUser = user;
  }

  getUserInfo(user: IUserLightModel): string {
    return `${ user.primaryInfo.firstName } ${ user.primaryInfo.lastName } (${ user.email })`;
  }

  getAcceptedUserInfo() {
    return this.updateType === UpdateInviteType.Accepted ?
      `${ this.invitation.acceptedUser.firstName } ${ this.invitation.acceptedUser.lastName } (${ this.invitation.acceptedUser.email })` :
      `${ this.invitation.request.recipient.firstName } ${ this.invitation.request.recipient.firstName } (${ this.invitation.email })`;
  }
}
