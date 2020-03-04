import Vue from 'vue';
import { Component, Prop, Watch } from 'vue-property-decorator';
import template from './Agencies.vue';
import Paginate from 'vuejs-paginate';
import AgencyProfile from '../../components/agencyProfile';
import { getSavedAgency, commitSetSavedAgency, dispatchGetAgency, getAgency } from '../../store/modules/adminModule';
import {
  AgencyModel, IAgencyModel, AgencyQuery, $agencies,
  IEntitySearchResult, IAgencyLightModel, $newObj, EntitySearchQueryDeletedStatus, $agency,
} from '@immosparrow/cockpit-api-v2';
import store from '../../store';
import * as globalState from '../../store/modules/globalStatesModule';
import AgencyMapComponent from './../../components/map/agency';
import ConfirmModal from '../../components/modal/confirmModal';
import RedirectMixin from '../../mixins/redirect';

@Component({
  mixins: [template, RedirectMixin],
  components: {
    AgencyProfile,
    Paginate,
    AgencyMapComponent,
    ConfirmModal,
  },
})
export default class Agencies extends Vue {

  agencies: IEntitySearchResult<IAgencyLightModel> = null;
  agency: IAgencyModel = new AgencyModel;
  newAgency: AgencyModel = new AgencyModel();

  activeNo: number = 0;
  inActiveNo: number = 0;
  pages: number = 0;
  searchForString: string = '';
  searchLoading: boolean = false;
  showSearchAreas: boolean = false;
  searchFinished: boolean = false;
  addingAgency: boolean = false;
  loadElement: boolean = false;
  perPage: number = 10;
  pageNum: number = 0;
  selectedIndex: number = -1;
  loading: boolean = false;
  $refs: {
    agenciesPagination: any,
  };

  deletingAgency: boolean = false;
  firstLoadElement: boolean = false;
  deleteAgency: IAgencyLightModel = undefined;
  showModal: boolean = false;
  showDeleted: boolean = false;

  created() {
    this.loadAgencies();
    globalState.commitSetSearchSidebar(store, true);

    this.$root.$on('showSearchAreas', (value: boolean) => {
      this.showSearchAreas = value;
    });
  }

  closeAgency() {
    try {
      this.agency = new AgencyModel();
      // globalState.commitProfileRightSidebar(store, false);
      this.selectedIndex = -1;

      this.$root.$emit('profile_is_closed', true);
      globalState.commitProfileRightSidebar(store, false);
    } catch {

    }
  }
  closeNewAgency() {
    try {
      this.addingAgency = false;
      globalState.commitProfileRightSidebar(store, false);
      this.agency = new AgencyModel();
      this.$root.$emit('profile_is_closed', true);
    } catch {

    }
  }

  loadAgencies() {
    const self = this;
    self.loading = true;
    const query = $newObj(AgencyQuery);
    query.text = '';
    query.enabledStatus = 2;
    query.pageSize = this.perPage;
    query.page = 0;
    this.showDeleted = false;
    const agency = getSavedAgency(store);
    if (agency) {
      query.text = agency.primaryInfo.name;
      this.searchForString = agency.primaryInfo.name;
      this.searchFinished = true;
    }

    $agencies.find(query)
    .then((res: IEntitySearchResult<IAgencyLightModel>) => {
      this.agencies = res;
      this.pages = res.pageCount;
      this.activeNo = res.entityCounts.enabledCount;
      this.inActiveNo = res.entityCounts.totalCount - this.activeNo;
      self.loading = false;

      if (agency) {
        if (agency.created) {
          agency.created.time = new Date(agency.created.time);
        }
        if (agency.updated) {
          agency.updated.time = new Date(agency.updated.time);
        }
        commitSetSavedAgency(store, undefined);
        this.selectedIndex = -1;
        this.agency = agency;
        this.firstLoadElement = true;
        dispatchGetAgency(store, agency.id).then(() => {
          globalState.commitProfileRightSidebar(store, true);
        });
      }
      if (!this.searchForString) {
        setTimeout(() => {
          self.searchLoading = false;
        },         500);
      }
    });

  }

  @Watch('perPage')
  reloadWithNewNumber() {
    this.nextPage(this.pageNum, undefined);
  }

  deleted() {
    this.showDeleted = !this.showDeleted;
    this.nextPage(0, -1);
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

    this.$refs.agenciesPagination.selected = this.pageNum;

    const data = {
      text: '',
      page: this.pageNum,
      pageSize: this.perPage,
      deletedStatus: EntitySearchQueryDeletedStatus.Existing,
    };

    if (this.showDeleted) {
      data.deletedStatus = EntitySearchQueryDeletedStatus.Deleted;
    }

    setTimeout(() => {
      $agencies.find(data)
        .then((res: IEntitySearchResult<IAgencyLightModel>) => {
          this.agencies = res;
          this.pages = res.pageCount;
          if (!deleteLoad) {
            this.loading = false;
          }
        })
        .then(() => {
          if (index !== undefined && index !== -1) {
            this.getAgency(index);
          }
        });
    },         1000);
  }

  getAgency(index: number) {
    this.loadElement = true;
    this.firstLoadElement = false;
    this.addingAgency = false;
    this.selectedIndex = index;
    if (this.selectedIndex !== -1) {
      const id = this.agencies.items[this.selectedIndex]['id'];
      dispatchGetAgency(store, id).then(() => {
        this.agency.id = '';
        this.agency = getAgency(store);
        this.agencies[index] = this.agency;
        globalState.commitProfileRightSidebar(store, true);
        this.loadElement = false;
      });
    }
  }

  async unDelete(id: string) {
    const result = await $agency(id).undelete();
    if (result) {
      if (this.agency.id === id) {
        this.agency = new AgencyModel();
      }
      this.nextPage(this.pageNum, undefined, true);
      this.$notify({
        text: 'Agency was successfully restored',
        group: 'actions',
        type: 'success',
        duration: 2500,
      });
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
    this.getAgency(this.selectedIndex);
  }

  searchFor(pageNum: number, loadByPage?: boolean) {
    const self = this;
    self.searchFinished = false;
    this.searchLoading = true;
    const data = {
      text: self.searchForString,
      page: pageNum,
      pageSize: this.perPage,
      deletedStatus: EntitySearchQueryDeletedStatus.Existing,
    };

    if (this.showDeleted) {
      data.deletedStatus = EntitySearchQueryDeletedStatus.Deleted;
    }

    if (self.searchForString || loadByPage) {

      $agencies.find(data)
      .then((res: IEntitySearchResult<IAgencyLightModel>) => {
        setTimeout(() => {
          self.agencies = res;
          self.pages = res.pageCount;
          self.pageNum = res.page;
          self.searchLoading = false;
          self.searchFinished = true;
          this.loading = false;
          this.$refs.agenciesPagination.selected = pageNum;
        },         500);
      }).catch((e) => {
        // tslint:disable-next-line
        console.log(e);
      });

    } else {
      self.loadAgencies();
    }
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

  addAgency() {
    this.newAgency = new AgencyModel();
    this.addingAgency = true;
    globalState.commitProfileRightSidebar(store, true);
  }

  deleteAgencyModal (agency: IAgencyLightModel) {
    this.deleteAgency = agency;
    this.showModal = true;
  }
  cancelDeletion () {
    this.deleteAgency = undefined;
    this.showModal = false;
  }

  deleteAgencyConfirm () {
    this.deletingAgency = true;
    this.showModal = false;
    $agency(this.deleteAgency.id).delete(undefined)
    .then((res) => {
      if (res) {
        setTimeout(() => {
          Vue.prototype.$notify({
            group: 'actions',
            type: 'success',
            duration: 2500,
            text: 'Agency successfully removed',
          });
          if (this.deleteAgency.isEnabled) {
            this.activeNo = this.activeNo - 1;
          } else {
            this.inActiveNo = this.inActiveNo - 1;
          }
          this.deletingAgency = false;
          this.deleteAgency = undefined;
          const numberPage = this.agencies.items.length === 1 ? this.pageNum - 1 : this.pageNum;
          this.searchFor(numberPage < 0 ? 0 : numberPage, true);
        },         1000);
      } else {
        this.deletingAgency = false;
        this.deleteAgency = undefined;
      }
    });
  }

  checkEnd (index: number) {
    const idx = index + 1;
    const pgNum = this.pageNum + 1;
    if (this.agencies.items[idx] || pgNum !== this.pages) {
      return true;
    }
    return false;

  }
}
