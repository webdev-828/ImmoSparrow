import Vue from 'vue';
import { Component, Watch } from 'vue-property-decorator';
import store from '../../../store';
import template from './template.vue';
import * as globalState from '../../../store/modules/globalStatesModule';
import Paginate from 'vuejs-paginate';
import * as searchModule from '../../../store/modules/searchModule';
import { mval as val,
        $newObj,
        ISearchResult,
        IPubLightModel,
        PubLightModel,
        IPubQuery,
        $pubs,
        PubLightModelFields,
        PubQuery } from '@immosparrow/cockpit-api-v2';
import ListItem from './listItem/';
import ObjectComponent from '../object/';
import Modal from '../../modal';

@Component({
  mixins: [template],
  components: {
    Paginate,
    ListItem,
    ObjectComponent,
    Modal,
  },
  filters: {
    currency(amount: number) {
      return amount && amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, "'");
    },
  },
})
export default class OverviewList extends Vue {

  pages: number = 0;
  perPage: number = 10;
  pageNum: number = 0;
  searchResults: ISearchResult<IPubLightModel> = { items: [] };
  searchData: IPubQuery = new PubQuery();

  selectedIndex: number = -1;
  selectedItemId: string = null;
  allAds: number = 0;
  $refs: {
    topPagination: any,
    bottomPagination: any,
  };
  loading: boolean = false;
  maps: any = [];
  val: Function = val;
  showHistoryFirst: boolean = false;

  shareLink: string = '';
  showShareLinkModal: boolean = false;

  get getPage () {
    return (this.pageNum * this.perPage) + 1;
  }

  created () {
    globalState.commitShowRightSidebar(store, false);

    if (!this.$route.query.id) {
      this.$root.$on('searchModuleResultsOList', (data: any) => {
            // this.searchResults = data;
        Vue.set(this, 'searchResults', data);
        if (this.searchResults.totalItemCount) {
          Vue.set(this, 'pageNum', 0);
          if (this.$refs.topPagination) {
            this.$refs.topPagination.selected = this.pageNum;
          }

          if (this.$refs.bottomPagination) {
            this.$refs.bottomPagination.selected = this.pageNum;
          }
          Vue.set(this, 'searchResults', data);
          this.pages = this.searchResults['accessiblePageCount'];
        }
      });
    } else {
      this.loading = true;
      const ids: any = this.$route.query.id;
      const allIds: string[] = [];
      if (ids.length > 30) {
        allIds.push(ids.toLowerCase());
      } else {
        for (const i in ids) {
          allIds.push(ids[i].toLowerCase());
        }
      }
      $pubs.getMultiple(allIds).then((res) => {
        res.forEach((item) => {
          this.searchResults.items.push(item);
        });
        this.searchResults.accessibleTotalItemCount = res.length;
        this.searchResults.totalItemCount = res.length;
        this.loading = false;
      });
    }
  }

  mounted () {
    document.addEventListener('keyup', (evt: any) => {
      if (globalState.getOverviewList(store)) {
        if (evt.keyCode === 38) {
          if (this.pageNum !== 0 || this.selectedIndex !== 0) {
            this.selectedIndex -= 1;
            this.selectItem(this.selectedIndex, true, false);
          }
        } else if (evt.keyCode === 40) {
          const nextIndex = this.selectedIndex + 1;
          if (this.pageNum !== this.searchResults.pageCount - 1 || this.searchResults.items[nextIndex]) {
            this.selectedIndex += 1;
            this.selectItem(this.selectedIndex, true, false);
          }
        }
      }
    });
  }

  closeRightSidebar() {
    this.selectedIndex = -1;
    globalState.commitShowRightSidebar(store, false);
  }

  getResults () {
    if (this.searchResults.totalItemCount <= 500) {
      return this.searchResults.totalItemCount;
    }
    return 500;

  }

  selectItem (index: number, arrow: boolean, switchHistory: boolean, countElements?: number) {
    if (index !== 0 && index % 10 === 0) {
      this.pageNum += 2;
      this.nextPage(this.pageNum, 0);
      globalState.commitShowRightSidebar(store, true);
    } else if (index === -1 && this.pageNum > 0) {
        // this.page_num--;
      this.nextPage(this.pageNum, 9);
      globalState.commitShowRightSidebar(store, true);
    } else {
      this.selectedIndex = index;
      this.showHistoryFirst = switchHistory;
      this.selectedItemId = this.searchResults.items[index].id;
      if (arrow) {
        this.$nextTick(() => {
          const el = document.getElementById(`#item${index}`);
          if (el) {
            el.scrollIntoView({ block: 'end', behavior: 'smooth' });
          }
        });
      }
      globalState.commitShowRightSidebar(store, true);
    }
    globalState.commitSetNextItem(store, countElements !== 1 && this.searchResults.pageCount !== undefined);
    if (this.pageNum === this.searchResults.pageCount - 1) {
      const nextIndex = this.selectedIndex + 1;
      if (!this.searchResults.items[nextIndex]) {
        globalState.commitSetNextItem(store, false);
      }
    }
  }

  @Watch('per_page')
    reload_with_new_number() {
    this.nextPage(this.pageNum, -1);
  }

  nextPage(pageNum: number, index: number) {
    if (pageNum === 0) {
      this.pageNum = 0;
    } else {
      this.pageNum = pageNum - 1;
    }

    this.loading = true;
    if (this.$refs.topPagination) {
      this.$refs.topPagination.selected = this.pageNum;
    }
    if (this.$refs.bottomPagination) {
      this.$refs.bottomPagination.selected = this.pageNum;
    }

    this.selectedIndex = -1;
    this.searchData = searchModule.getSearchData(store).query;
      // let sortBy = searchModule.getSearchData(store).;
    this.searchData.page = this.pageNum;
    this.searchData.pageSize = this.perPage;

    $pubs.find(this.searchData, PubLightModelFields.All).then((data) => {
      const self = this;
      self.searchResults = data;
      self.pages = self.searchResults['accessiblePageCount'];
      self.loading = false;
    }).then(() => {
      if (index !== -1) {
        this.selectedIndex = index;
        if (this.selectedItemId && // this.selectedItem.primaryInfo.basicInfo.title !== undefined &&
          this.searchResults && this.searchResults.items) {
          this.selectedItemId = this.searchResults.items[this.selectedIndex].id;
          this.$nextTick(() => {
            const el = document.getElementById(`#item${index}`);
            if (el) {
              el.scrollIntoView({ block: 'end', behavior: 'smooth' });
            }
          });
        }
      }
    });
  }

  closeObjectRightSidebar() {
    this.selectedItemId = null;
    this.selectedIndex = -1;
    globalState.commitShowRightSidebar(store, false);
  }

  copyToClipboard (ref: string) {
    const copiedValue = this.$refs[ref];
    copiedValue.setAttribute('type', 'text');
    copiedValue.select();
    document.execCommand('copy');
    copiedValue.setAttribute('type', 'hidden');
    if (ref === 'link') {
      this.$notify({
        text: 'Link copied to clipboard',
        group: 'actions',
        type: 'success',
        duration: 2500,
      });
      this.showShareLinkModal = false;
    }
  }

  shareAdLink (id: string) {
    this.showShareLinkModal = true;
    this.shareLink = `${window.location.origin}/publications/details?id=${id}`;
  }
}
