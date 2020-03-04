import { Component } from 'vue-property-decorator';
import Profile from '../../components/profile';
import BaseComponent from '../../components/base';
import { Tab1, Tab2, Tab3, Tab4, Tab5 } from '../../components/myProfileTabs';
import template from './MyProfile.vue';
import store from '../../store';
import * as globalState from '../../store/modules/globalStatesModule';
import {
  IUserProfileModel, $newObj, UserProfileModel, $authUser,
  ModifiableAddress, UserContactInfo, ImageInfo,
} from '@immosparrow/cockpit-api-v2';

class ShortInfo {
  firstName = '';
  lastName = '';
  url?: string;
}

@Component({
  name: 'UserProfileComponent',
  mixins: [template],
  components: {
    Profile, Tab1, Tab2, Tab3, Tab4, Tab5,
  },
})

export default class UserProfileComponent extends BaseComponent {

  user: IUserProfileModel = $newObj(UserProfileModel);
  loaded: boolean = false;
  shortInfo = new ShortInfo();

  mounted() {
    this.updateUserData();
    globalState.commitSetSearchSidebar(store, true);
  }

  updateUserData() {
    $authUser.profile.get().then((res) => {
      this.user = res;
      this.user.photo = this.user.photo || $newObj(ImageInfo);
      this.user.address = this.user.address || $newObj(ModifiableAddress);
      this.user.contactInfo = this.user.contactInfo || $newObj(UserContactInfo);

      this.setShortInfo(this.user);

      this.loaded = true;
    });
  }

  async setShortInfo(user: IUserProfileModel) {
    const userData = user;
    const { firstName, lastName } = userData.primaryInfo;
    this.shortInfo = {
      firstName,
      lastName,
      url: userData.photo ? userData.photo.url : undefined,
    };
  }

  created() {
    if (this.$route.params.tab) {
      switch (this.$route.params.tab) {
        case 'lead':
          this.toggle('profileLead');
          break;
        case 'templates':
          this.toggle('profileTemplates');
          break;
        case 'email':
          this.toggle('profileEmail');
          break;
        case 'updatePassword':
          this.toggle('updatePassword');
          break;
        default:
          this.$router.push('/profile');
          this.toggle('profileGlobal');
          break;
      }
    } else {
      this.toggle('profileGlobal');
    }
  }
}
