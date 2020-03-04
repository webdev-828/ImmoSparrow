import Vue from 'vue';
import { Component, Watch } from 'vue-property-decorator';
import template from './Contacts.vue';
import Paginate from 'vuejs-paginate';
import ContactProfile from '../../components/contactProfile';
import { IEntitySearchResult,
        IContactLightModel,
        IContactModel,
        ContactModel,
        $contact,
        $contactLists,
        $contactList,
        EntitySearchQueryEnabledStatus,
        EntitySearchQueryDeletedStatus } from '@immosparrow/cockpit-api-v2';
import store from '../../store';
import * as globalState from '../../store/modules/globalStatesModule';
import ConfirmModal from '../../components/modal/confirmModal';

@Component({
  mixins: [template],
  components: {
    ContactProfile,
    Paginate,
    ConfirmModal,
  },
})
export default class Contacts extends Vue {

  contacts: IEntitySearchResult<IContactLightModel> = null;
  contact: IContactModel = new ContactModel();
  newContact: IContactModel = new ContactModel();

  activeNo: number = 0;
  inActiveNo: number = 0;
  pages: number = 0;
  searchForString: string = '';
  searchLoading: boolean = false;
  searchFinished: boolean = false;
  addingContact: boolean = false;
  loadElement: boolean = false;
  perPage: number = 10;
  pageNum: number = 0;
  selectedIndex: number = -1;
  loading: boolean = false;
  $refs: {
    contactsPagination: any,
  };
  contactListId: string = '';
  showModal: boolean = false;
  contactRemove: IContactLightModel = null;

  created() {
    this.loadContacts();
    globalState.commitSetSearchSidebar(store, true);
  }

  get allContacts () {
    return this.contacts.items.filter(item => !item.isDeleted);
  }

  closeModal () {
    this.contactRemove = null;
    this.showModal = false;
  }
  deleteContact (contact: IContactLightModel) {
    this.contactRemove = contact;
    this.showModal = true;
  }
  async removeContact () {
    if (await $contact(this.contactRemove.id).delete()) {
      this.contacts.items.splice(this.contacts.items.indexOf(this.contactRemove), 1);
      if (this.contactRemove.isEnabled) {
        this.activeNo = this.activeNo - 1;
      } else {
        this.inActiveNo = this.inActiveNo - 1;
      }
      this.contactRemove = null;
    }
    this.showModal = false;
  }

  closeContact() {
    this.contact = new ContactModel();
    globalState.commitProfileRightSidebar(store, false);
    this.selectedIndex = -1;
  }
  closeNewContact() {
    this.addingContact = false;
    globalState.commitProfileRightSidebar(store, false);
    this.contact = new ContactModel();
  }

  getContacts () {
    const self = this;
    $contactList(this.contactListId).contacts.find({
      text: '',
      page: 0,
      pageSize: this.perPage,
      enabledStatus: EntitySearchQueryEnabledStatus.All,
      deletedStatus: EntitySearchQueryDeletedStatus.Existing,
      sort: '+lastName',
    })
    .then((res) => {
      this.contacts = res;
      this.pages = res.pageCount;
      this.activeNo = res.totalItemCount;
      if (res.entityCounts) {
        this.inActiveNo = res.entityCounts.totalCount - this.activeNo;
      } else {
        this.inActiveNo = 0;
      }
      self.loading = false;
      self.searchLoading = false;
    });
  }

  loadContacts() {
    const self = this;
    self.loading = true;
    $contactLists.find({ text: '' })
      .then((res1) => {
        if (res1 && res1.items.length) {
          this.contactListId = res1.items[0].id;
          this.getContacts();
        } else {
          $contactLists.create({ name: 'Default contact list' })
            .then((res2) => {
              this.contactListId = res2.id;
              this.getContacts();
            });
        }
      });
  }

  @Watch('perPage')
  reloadWithNewNumber() {
    this.nextPage(this.pageNum, undefined);
  }

  nextPage(pageNum: number, index: number, deleteContact?: boolean) {
    if (!deleteContact) {
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

    this.$refs.contactsPagination.selected = this.pageNum;

    setTimeout(() => {
      $contactList(this.contactListId).contacts.find({
        text: '',
        page: this.pageNum,
        pageSize: this.perPage,
        enabledStatus: EntitySearchQueryEnabledStatus.All,
        deletedStatus: EntitySearchQueryDeletedStatus.Existing,
        sort: '+lastName',
      })
        .then((res) => {
          this.contacts = res;
          this.pages = res.pageCount;
          if (!deleteContact) {
            this.loading = false;
          }
        })
        .then(() => {
          if (index !== undefined && index !== -1) {
            this.getContact(index);
          }
        });
    },         1000);
  }

  getContact(index: number) {
    if (index !== -1) {
      this.loadElement = true;
      this.addingContact = false;
      this.selectedIndex = index;
      const id = this.contacts.items[this.selectedIndex]['id'];
      $contact(id).get()
        .then((res) => {
          this.contact = res;
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
        this.selectedIndex += 1;
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
    this.getContact(this.selectedIndex);
  }

  searchFor(pageNum: number) {
    const self = this;
    self.searchFinished = false;
    this.searchLoading = true;

    let pNum = 0;
    if (pageNum > 0) {
      pNum = pageNum - 1;
    }

    if (self.searchForString) {
      $contactList(this.contactListId).contacts.find({
        text: this.searchForString,
        page: pNum,
        pageSize: this.perPage,
        enabledStatus: EntitySearchQueryEnabledStatus.All,
        deletedStatus: EntitySearchQueryDeletedStatus.Existing,
        sort: '+lastName',
      })
        .then((result) => {
          const res = result;
          setTimeout(() => {
            self.contacts = res;
            self.pages = res.pageCount;
            self.searchLoading = false;
            self.searchFinished = true;

          },         500);
        });

    } else {
      self.loadContacts();
    }
  }

  changePerPage(i: number) {
    this.perPage = i;
    this.pageNum = 0;
  }

  clearSearch() {
    this.searchForString = '';
    this.searchFinished = false;
    this.nextPage(0, -1);
  }

  addContact() {
    this.searchForString = '';
    this.searchFinished = false;
    this.$refs.contactsPagination.selected = 0;
    globalState.commitProfileRightSidebar(store, true);
    this.addingContact = true;
    this.newContact = new ContactModel();
  }

  checkEnd (index: number) {
    const idx = index + 1;
    const pgNum = this.pageNum + 1;
    if (this.contacts.items[idx] || pgNum !== this.pages) {
      return true;
    }
    return false;
  }
}
