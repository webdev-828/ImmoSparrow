import Vue from 'vue';
import { Component, Watch } from 'vue-property-decorator';
import template from './Users.vue';
import Paginate from 'vuejs-paginate';
import Profile from '../../components/profile';
import {
  IEntitySearchResult,
  IUserLightModel,
  UserModel,
  IUserModel,
  $newObj,
  UserQuery,
  UserDevAccessLevel,
  EntitySearchQueryDeletedStatus,
  $user, $users,
} from '@immosparrow/cockpit-api-v2';
import { getSavedUser, commitSavedUser } from './../../store/modules/adminModule';
import store from '../../store';
import * as globalState from '../../store/modules/globalStatesModule';
import ConfirmModal from '../../components/modal/confirmModal';
import { displayAddress } from '../../components/sharedFunctions';
import { safeVal } from '@immosparrow/cockpit-lib-core';
import RedirectMixin from '../../mixins/redirect';

@Component({
  mixins: [template, RedirectMixin],
  components: {
    Profile,
    Paginate,
    ConfirmModal,
  },
})
export default class Users extends Vue {

  users: IEntitySearchResult<IUserLightModel> = null;
  user: IUserModel = new UserModel;
  newUser: IUserModel = new UserModel();

  activeNo: number = 0;
  inActiveNo: number = 0;
  pages: number = 0;
  searchForString: string = '';
  searchLoading: boolean = false;
  searchFinished: boolean = false;
  addingUser: boolean = false;
  loadElement: boolean = false;
  perPage: number = 10;
  pageNum: number = 0;
  selectedIndex: number = -1;
  loading: boolean = false;
  firstLoadElement: boolean = false;
  $refs: {
    usersPagination: any,
  };
  displayAddress: Function = displayAddress;
  deletingUser: boolean = false;
  deleteUser: IUserLightModel = undefined;
  showModal: boolean = false;
  val: Function = safeVal;
  showDeleted: boolean = false;

  created() {
    this.loadUsers();
    globalState.commitSetSearchSidebar(store, true);
  }

  closeUser() {
    this.user = new UserModel();
    globalState.commitProfileRightSidebar(store, false);
    this.selectedIndex = -1;
  }
  closeNewUser() {
    this.addingUser = false;
    globalState.commitProfileRightSidebar(store, false);
    this.user = new UserModel();
  }

  deleted() {
    this.showDeleted = !this.showDeleted;
    this.nextPage(0, -1);
  }

  loadUsers() {
    const self = this;
    self.loading = true;
    this.showDeleted = false;
    $users.find({
      text: '',
      page: 0,
      pageSize: this.perPage,
      sort: '+lastName',
    })
    .then((result) => {
      const res = result;
      this.users = res;
      this.pages = res.pageCount;
      this.activeNo = res.totalItemCount;
      this.inActiveNo = res.entityCounts.totalCount - this.activeNo;
      self.loading = false;
      const user = getSavedUser(store);

      if (user) {
        commitSavedUser(store, undefined);
        this.user = user;
        this.firstLoadElement = true;
        globalState.commitProfileRightSidebar(store, true);
      }
      if (!this.searchFor) {
        setTimeout(() => {
          self.searchLoading = false;
        },         500);
      }
    });

  }

  async unDelete(id: string) {
    const result = await $user(id).undelete();
    if (result) {
      if (this.user.id === id) {
        this.user = new UserModel();
      }
      this.nextPage(this.pageNum, undefined, true);
      this.$notify({
        text: 'User was successfully restored',
        group: 'actions',
        type: 'success',
        duration: 2500,
      });
    }
  }

  @Watch('perPage')
  reload_with_new_number() {
    this.nextPage(this.pageNum, undefined);
  }

  nextPage(pageNum: number, index: number, deleteLoad?: boolean) {
    if (!deleteLoad) {
      this.loading = true;
    }

    if (pageNum === 0) {
      this.pageNum = 0;
    } else {
      this.pageNum = pageNum - 1;
    }
    if (this.searchForString !== '') {
      return this.searchFor(this.pageNum);
    }

    this.$refs.usersPagination.selected = this.pageNum;

    const data = {
      text: '',
      page: this.pageNum,
      pageSize: this.perPage,
      sort: '+lastName',
      deletedStatus: EntitySearchQueryDeletedStatus.Existing,
    };

    if (this.showDeleted) {
      data.deletedStatus = EntitySearchQueryDeletedStatus.Deleted;
    }

    setTimeout(() => {
      $users.find(data)
        .then((result) => {
          const res = result;
          this.users = res;
          this.pages = res.pageCount;
          if (!deleteLoad) {
            this.loading = false;
          }
        })
        .then(() => {
          if (index !== undefined && index !== -1) {
            this.getUser(index);
          }
        });
    },         1000);
  }

  getUser(index: number) {
    if (index !== -1) {
      this.loadElement = true;
      this.addingUser = false;
      this.selectedIndex = index;
      const id = this.users.items[this.selectedIndex]['id'];
      $user(id).get().then((res) => {
        this.user = res;
          // this.users.items[index] = this.user as IUserLightModel;
        globalState.commitProfileRightSidebar(store, true);
        this.loadElement = false;
      });
    } else {
      this.loadElement = false;
    }
  }

  nextItem (index: number, next: boolean) {
    this.loadElement = true;
    this.selectedIndex = index;
    if (next) {
      if (this.perPage - 1 === index) {
        let pgNum = this.pageNum;
        pgNum += 2;
        this.nextPage(pgNum, 0);
      } else {
        this.selectedIndex += 1 ;
      }
    } else {
      if (index === 0) {
        let pgNum = this.pageNum;
        pgNum -= 1;
        this.nextPage(pgNum, this.perPage - 1);
      } else {
        this.selectedIndex -= 1;
      }
    }
    this.getUser(this.selectedIndex);
  }

  searchFor(pageNum: number) {
    const self = this;
    self.searchFinished = false;
    this.searchLoading = true;

    const searchQuery = $newObj(UserQuery);
    searchQuery.page = pageNum;
    searchQuery.pageSize = this.perPage;
    searchQuery.text = self.searchForString;

    if (this.showDeleted) {
      searchQuery.deletedStatus = EntitySearchQueryDeletedStatus.Deleted;
    }
    $users.find(searchQuery).then((res) => {
      setTimeout(() => {
        self.users = res;
        self.pages = res.pageCount;
        self.pageNum = res.page;
        self.searchLoading = false;
        self.searchFinished = true;
        this.loading = false;
        this.$refs.usersPagination.selected = pageNum;
      },         500);
    }).catch((e) => {
      // tslint:disable-next-line
      console.log(e);
      self.searchLoading = false;
      self.searchFinished = true;
    });
  }

  changePerPage(i: number) {
    // this.searchForString = "";
    this.perPage = i;
    this.pageNum = 0;
  }

  clearSearch() {
    this.searchForString = '';
    this.searchFinished = false;
    this.nextPage(0, -1);
  }

  addUser() {
    globalState.commitProfileRightSidebar(store, true);
    this.addingUser = true;
    this.newUser = new UserModel();
  }

  deleteUserModal (user: IUserLightModel) {
    this.deleteUser = user;
    this.showModal = true;
  }
  cancelDeletion () {
    this.deleteUser = undefined;
    this.showModal = false;
  }

  deleteUserConfirm () {
    this.deletingUser = true;
    this.showModal = false;
    $user(this.deleteUser.id).delete(undefined).then((res) => {
      if (res) {
        setTimeout(() => {
          Vue.prototype.$notify({
            group: 'actions',
            type: 'success',
            duration: 2500,
            text: 'User successfully removed',
          });
          if (this.deleteUser.isEnabled) {
            this.activeNo = this.activeNo - 1;
          } else {
            this.inActiveNo = this.inActiveNo - 1;
          }
          this.deletingUser = false;
          this.deleteUser = undefined;
          const numberPage = this.users.items.length === 1 ? this.pageNum - 1 : this.pageNum;
          this.searchFor(numberPage < 0 ? 0 : numberPage);
        },         1000);
      } else {
        this.deletingUser = false;
        this.deleteUser = undefined;
      }
    });
  }

  getDevRole (level: number) {
    return UserDevAccessLevel[level];
  }

  checkEnd (index: number) {
    const idx = index + 1;
    const pgNum = this.pageNum + 1;
    if (this.users.items[idx] || pgNum !== this.pages) {
      return true;
    }
    return false;

  }

}
