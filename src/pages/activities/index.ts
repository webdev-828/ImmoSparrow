import Vue from 'vue';
import { Component, Watch } from 'vue-property-decorator';
import template from './Activities.vue';
import Paginate from 'vuejs-paginate';
import { $pipelines,
  IPipelineEntryActivityQuery,
  PipelineEntryActivityQuery,
  IPipelineEntryActivityLightModel,
  IEntitySearchResult,
  $newObj, $agency,
  IPipelineLightModel,
  PipelineLightModel,
  mval as val, IEmployeeLightModel,
  PubLightModel,
  IPipelineEntryLightModel,
  PipelineEntryActivityQueryStatuses,
  PipelineEntryActivityStatus,
  IPipelineEntryActivityModel,
  PipelineEntryActivityModel,
  PipelineEntryActivitySearchResult,
  EntitySearchQuery,
  IPipelineEntryActivitySearchResult,
  $pipelineEntryActivity,
  $pipelineEntry, $pipeline,
  ISearchQueryRangeOfDateTime,
  PipelineEntryActivityLightModel,
  EmployeeIdentity,
  SearchQueryRangeOfDateTime,
  PipelineEntryActivityType,
} from '@immosparrow/cockpit-api-v2';
import moment from 'moment';
import ActivityDetails from './ActivityDetails/';
import * as pipelineModule from '../../store/modules/pipeline';
import store from '../../store';
import EntryDetails from '../pipe/entryDetails';
import * as globalState from '../../store/modules/globalStatesModule';
import { getEmployeeContext } from '../../store/modules/authStatesModule';
import ObjectComponent from '../../components/searchModule/object';
import { getDuration, employeeName } from '../../components/sharedFunctions';
import ConfirmModal from '../../components/modal/confirmModal';
import FilterDropdown from '../../components/shared/filterDropdown';
import { FilterDropdownModel } from '../../components/shared/filterDropdown/model';
import _ from 'lodash';

export interface PipeTypes {
  started: boolean;
  favorites: boolean;
}

@Component({
  name: 'Activities',
  mixins: [template],
  components: {
    Paginate,
    ActivityDetails,
    ConfirmModal,
    EntryDetails,
    ObjectComponent,
    FilterDropdown,
  },
})

export default class Activities extends Vue {

  activities: IPipelineEntryActivitySearchResult = { items: [] };
  perPage: number = 10;
  pages: number = 0;
  pageNum: number = 0;
  loading: boolean = false;
  searchForString: string = '';
  searchLoading: boolean = false;
  searchFinished: boolean = false;
  loadElement: boolean = false;
  selectedIndex: number = -1;

  statusFilter: number = PipelineEntryActivityQueryStatuses.Pending;
  timeFilter: ISearchQueryRangeOfDateTime = $newObj(SearchQueryRangeOfDateTime);
  selectedTimeFilter: string = '';
  selectedStatusFilter: string = 'planned';

  showModal: boolean = false;

  owners: IEmployeeLightModel[] = [];
  selectedOwner: FilterDropdownModel = { text: '', value: '' };

  pipelines: IEntitySearchResult<IPipelineLightModel> = { items: [] };
  selectedPipeline: IPipelineLightModel = $newObj(PipelineLightModel);
  pipeSearch: string = '';

  tabsPipeFilter: PipeTypes = {
    started: true,
    favorites: false,
  };

  startDate: Date = new Date();
  endDate: Date = new Date();

  $refs: {
    activitiesPagination: any,
  };

  activity: IPipelineEntryActivityModel = $newObj(PipelineEntryActivityModel);

  selectedItems: IPipelineEntryActivityLightModel[] = [];
  selectedEntry: IPipelineEntryLightModel = null;

  addActivity: boolean = false;
  editActivity: boolean = false;

  val: Function = val;
  getDuration: Function = getDuration;
  employeeName: Function = employeeName;

  rangeMin: Date = null;
  rangeMax: Date = null;

  disabledDatesRangeMax: any = {
    // to: new Date(2011, 0, 1),
    // from: new Date(new Date().getFullYear() + 1, 0, 1),
  };
  disabledDatesRangeMin: any = {
    // to: new Date(2011, 0, 1),
    // from: new Date(new Date().getFullYear() + 1, 0, 1),
  };

  created () {
    globalState.commitShowRightSidebar(store, false);
    this.$root.$on('refreshActivitiesList', () => {
      this.loadActivities(false);
    });

    this.$root.$on('refreshPipeEntry', (entry: IPipelineEntryLightModel) => {
      this.activities.items.forEach((item: IPipelineEntryActivityLightModel) => {
        if (item.pipelineEntry.id === entry.id) {
          item.pipelineEntry.entityModifiableInfo = _.cloneDeep(entry.entityModifiableInfo);
        }
      });
    });

    const agency = getEmployeeContext(store).agency.id;
    $agency(agency).findEmployees({
      pageSize: 100,
      page: 0,
      text: '',
      sort: '+lastName',
    }).then((res) => {
      this.owners = res.items;
      this.owners.unshift({ lastName: 'Show All', firstName: '', id: 'All' });
    });

    this.loadPipelines();
    this.loadActivities(true);
  }

  beforeDestroy () {
    this.$root.$off('refreshActivitiesList');
    this.$root.$off('refreshPipeEntry');
  }

  get allPipelines() {
    return this.pipelines.items
      .filter(item => item.pendingEntryActivityCount)
      .filter((item) => {
        if (this.tabsPipeFilter.favorites) {
          return item.tags && item.tags.includes('my-favorites');
        }
        return item;
      });
  }

  get filteredOwners () {
    return this.owners.map((item) => {
      return {
        text: `${item.lastName} ${item.firstName}`,
        value: item.id,
      };
    });
  }

  @Watch('perPage')
  reloadWithNewNumber() {
    this.nextPage(this.pageNum, undefined);
  }

  @Watch('rangeMin')
  minRangeTime () {
    Vue.set(this.disabledDatesRangeMax, 'to', this.rangeMin);
  }

  @Watch('rangeMax')
  maxRangeTime () {
    Vue.set(this.disabledDatesRangeMin, 'from', this.rangeMax);
  }

  loadActivities (firstPage: boolean) {
    const self = this;
    if (firstPage) {
      self.loading = true;
    }
    const query: IPipelineEntryActivityQuery = $newObj(PipelineEntryActivityQuery);
    query.pageSize = self.perPage;
    query.page = firstPage ? 0 : self.pageNum;
    query.text = self.searchForString ? self.searchForString : undefined;
    query.statuses = this.statusFilter;
    query.timeRangeUtc = this.timeFilter;

    const emp = getEmployeeContext(store);
    if (!this.selectedOwner.value || this.selectedOwner.value === 'All') {
      query.assignedEmployeeId = undefined;
    } else {
      query.assignedEmployeeId = this.selectedOwner.value as string || emp.employee.id || undefined;
    }

    if (this.selectedStatusFilter === 'overdue') {
      query.timeRangeUtc = $newObj(SearchQueryRangeOfDateTime);
      query.timeRangeUtc.max = new Date();
      query.timeRangeUtc.max.setUTCHours(new Date().getUTCHours(), new Date().getUTCMinutes(), 0);
    }

    if (this.selectedPipeline.id === 'Show All') {
      query.pipelineId = undefined;
    } else {
      query.pipelineId = this.selectedPipeline.id;
    }
    $pipelines.findEntryActivities(query)
      .then((res: PipelineEntryActivitySearchResult) => {
        self.activities = res;
        self.pages = res.pageCount;
        self.searchLoading = false;
        if (self.$refs.activitiesPagination) {
          self.$refs.activitiesPagination.selected = query.page;
        }
        self.loading = false;
        if (!self.searchForString) {
          setTimeout(() => {
            self.searchLoading = false;
          },         500);
        }
      });
  }

  nextPage(pageNum: number, index: number) {
    this.loading = true;
    if (pageNum === 0) {
      this.pageNum = 0;
    } else {
      this.pageNum = pageNum - 1;
    }
    if (this.searchForString !== '') {
      return this.searchFor();
    }

    this.loadActivities(false);
  }

  searchFor() {
    if (this.searchForString !== '') {
      const self = this;
      self.searchFinished = false;
      this.searchLoading = true;
      self.loadActivities(false);
      self.searchFinished = true;
    }
  }

  getActivity(index: number) {
    this.loadElement = true;
    globalState.commitShowPipeDetails(store, false);
    this.editActivity = false;
    this.activity = null;
    this.addActivity = false;
    this.selectedIndex = index;
    if (this.selectedIndex !== -1) {
      const id = this.activities.items[this.selectedIndex]['id'];
      $pipelineEntryActivity(id).get()
        .then((res: PipelineEntryActivityModel) => {
          if (res) {
            this.activity = res;
            this.editActivity = true;
            this.loadElement = false;
          } else {
            this.loadElement = false;
          }
        })
        .catch(() =>  this.loadElement = false);
    } else {
      this.loadElement = false;
    }
  }

  getPipeEntry(item: IPipelineEntryActivityLightModel) {
    globalState.commitShowPipeDetails(store, false);
    this.closeActivityDetail();
    this.selectedEntry = null;
    $pipelineEntry(item.pipelineEntry.id).get()
      .then((res: IPipelineEntryLightModel) => {
        if (res) {
          this.selectedEntry = res;
          this.selectedEntry.publication = $newObj(PubLightModel);
          this.selectedEntry.publication.id = item.pipelineEntry.publication.id;
          globalState.commitShowPipeDetails(store, true);
        }
      });
  }

  closeObjectRightSidebar() {
    globalState.commitShowRightSidebar(store, false);
  }

  applyRangeFilter () {
    this.statusFilter = PipelineEntryActivityQueryStatuses.Any;
    this.selectedStatusFilter = '';
    this.selectedTimeFilter = '';
    if (this.rangeMin) {
      this.timeFilter.min = moment(this.rangeMin).startOf('day');
    }
    if (this.rangeMax) {
      this.timeFilter.max = moment(this.rangeMax).endOf('day');
    }
    this.loadActivities(true);
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

  changeStatus (item: IPipelineEntryActivityLightModel) {
    item.status = item.status === PipelineEntryActivityStatus.Pending ? PipelineEntryActivityStatus.Completed : PipelineEntryActivityStatus.Pending;
    $pipelineEntryActivity(item.id).updateStatus(item.status)
      .then((res: boolean) => {
        if (res) {
          if ((this.statusFilter === PipelineEntryActivityQueryStatuses.Pending && item.status === PipelineEntryActivityStatus.Completed) ||
              (this.statusFilter === PipelineEntryActivityQueryStatuses.Completed && item.status === PipelineEntryActivityStatus.Pending)) {
            this.activities.items.splice(this.activities.items.indexOf(item as PipelineEntryActivityLightModel), 1);
          }
          this.loadPipelines();
          this.getCounters();
        }
      });
  }

  checkTime(time: Date) {
    const date = moment(time);
    const now = moment().startOf('day');
    const diff = now.diff(date, 'days');
    if (diff >= 1) {
      return 'overdue';
    }
    if (diff === 0) {
      const todaysTime = moment();
      const hDiff = todaysTime.diff(time, 'minutes');
      if (hDiff <= 0) {
        return 'ontime';
      }
      return 'overdue';
    }
    return null;
  }

  checkCompleted(status: number) {
    return status === PipelineEntryActivityStatus.Completed;
  }

  checkStatusFilter (status: string) {
    return status === this.selectedStatusFilter;
  }

  setStatusFilter (status: string) {
    this.timeFilter = $newObj(SearchQueryRangeOfDateTime);
    this.selectedTimeFilter = '';
    if (this.selectedStatusFilter === status) {
      this.statusFilter = PipelineEntryActivityQueryStatuses.Any;
      this.selectedStatusFilter = '';
    } else if (status === 'done') {
      this.statusFilter = PipelineEntryActivityQueryStatuses.Completed;
      this.selectedStatusFilter = status;
    } else {
      this.statusFilter = PipelineEntryActivityQueryStatuses.Pending;
      this.selectedStatusFilter = status;
    }
    this.loadActivities(true);
  }

  setTimeFilter (time: string) {
    this.statusFilter = PipelineEntryActivityQueryStatuses.Any;
    this.selectedStatusFilter = '';
    if (this.selectedTimeFilter === time) {
      this.selectedTimeFilter = '';
      this.timeFilter = $newObj(SearchQueryRangeOfDateTime);
    } else {
      this.selectedTimeFilter = time;
      this.timeFilter.min = moment().toDate();
      this.timeFilter.max = moment().toDate();
      switch (time) {
        case 'Tomorrow':
          this.timeFilter.min.setDate(this.timeFilter.min.getDate() + 1);
          this.timeFilter.max.setDate(this.timeFilter.max.getDate() + 1);
          break;
        case 'This Week':
          this.timeFilter.min = moment().startOf('isoWeek').toDate();
          this.timeFilter.max = moment().endOf('isoWeek').toDate();
          break;
        case 'Next Week':
          this.timeFilter.min = moment().add(1, 'weeks').startOf('isoWeek').toDate();
          this.timeFilter.max = moment().add(1, 'weeks').endOf('isoWeek').toDate();
          break;
      }
      this.timeFilter.min.setHours(0, 0, 0);
      this.timeFilter.max.setHours(23, 59, 0);
    }
    this.loadActivities(true);
  }

  resetRange () {
    this.timeFilter.min = null;
    this.timeFilter.max = null;
    this.rangeMin = null;
    this.rangeMax = null;
    this.$forceUpdate();
    this.loadActivities(true);
  }

  getActivityType(item: IPipelineEntryActivityLightModel) {
    if (item.type !== undefined) {
      switch (item.type) {
        case PipelineEntryActivityType.Call:
          return `<span class="label label-success"><i class='fa fa-phone'></i> Call</span>`;
        case PipelineEntryActivityType.Meeting:
          return `<span class="label label-default"><i class='fa fa-users'></i> Meeting</span>`;
        case PipelineEntryActivityType.Task:
          return `<span class="label label-default bg-amethyst"><i class='fa fa-tasks'></i> Task</span>`;
        case PipelineEntryActivityType.Deadline:
          return `<span class="label label-danger"><i class='fa fa-clock-o'></i> Deadline</span>`;
        case PipelineEntryActivityType.Email:
          return `<span class="label label-success"><i class='fa fa-envelope-o'></i> Email</span>`;
        case PipelineEntryActivityType.Lunch:
          return `<span class="label label-success"><i class='fa fa-clock-o'></i> Lunch</span>`;
      }
    }
  }

  getDueDate(date: Date) {
    const d = moment(date).format('YYYY-MM-DD');
    const today = moment().format('YYYY-MM-DD');
    const diff = moment(today).diff(d, 'days');
    if (diff === 0) {
      return 'Today';
    }
    if (diff === 1) {
      return 'Yesterday';
    }
    if (diff === -1) {
      return 'Tomorrow';
    }
    return moment(date).format('DD.MM.YYYY');
  }

  formatDuration(minutes: number) {
    if (minutes < 60) {
      return `${minutes}min`;
    }
    return `${minutes / 60}h`;
  }

  closeActivityDetail () {
    this.addActivity = false;
    this.editActivity = false;
    this.activity = $newObj(PipelineEntryActivityModel);
  }

  createNewActivity () {
    this.addActivity = true;
    this.editActivity = false;
    this.activity = null;
  }

  show(tab: string) {
    for (const i in this.tabsPipeFilter) {
      if (i === tab) {
        this.tabsPipeFilter[i] = true;
      } else {
        this.tabsPipeFilter[i] = false;
      }
    }
  }
  selectPipeline (pipe: IPipelineLightModel) {
    this.selectedPipeline = pipe;
    this.loadActivities(true);
  }

  addToSelected (e: any, activity: IPipelineEntryActivityLightModel) {
    e.stopPropagation();
    if (this.selectedItems.indexOf(activity) !== -1) {
      this.selectedItems.splice(this.selectedItems.indexOf(activity), 1);
    } else {
      this.selectedItems.push(activity);
    }
  }

  addAllToSelected () {
    this.activities.items.forEach((item: IPipelineEntryActivityLightModel) => {
      if (this.selectedItems.indexOf(item) !== -1) {
        this.selectedItems.splice(this.selectedItems.indexOf(item), 1);
      } else {
        this.selectedItems.push(item);
      }
    });
  }

  addToFav (pipe: any) {
    if (pipe.tags && pipe.tags.includes('my-favorites')) {
      pipe.tags = [];
    } else {
      pipe.tags = [];
      pipe.tags.push('my-favorites');
    }
    $pipeline(pipe.id).update(pipe)
    .then(() => {
      const query = $newObj(EntitySearchQuery);
      query.text = '';
      pipelineModule.dispatchGetPipelines(store, query)
        .then((res: IEntitySearchResult<IPipelineLightModel>) => {
          this.pipelines = res;
        });
    });
  }

  deleteSelected () {
    const promises: any[] = [];
    this.showModal = false;
    this.selectedItems.forEach((item: PipelineEntryActivityLightModel) => {
      const promise = $pipelineEntryActivity(item.id).delete();
      promises.push(promise);
      this.activities.items.splice(this.activities.items.indexOf(item), 1);
    });
    Promise.all(promises)
      .then(() => {
        this.selectedItems = [];
        this.loadActivities(true);
      });
  }
  markSelected () {
    const promises: any[] = [];
    this.selectedItems.forEach((item: IPipelineEntryActivityLightModel) => {
      item.status === PipelineEntryActivityStatus.Pending ? item.status = PipelineEntryActivityStatus.Completed : item.status = PipelineEntryActivityStatus.Pending;
      const promise = $pipelineEntryActivity(item.id).updateStatus(item.status);
      promises.push(promise);
      this.activities.items.splice(this.activities.items.indexOf(item as PipelineEntryActivityLightModel), 1);
    });
    Promise.all(promises)
      .then(() => {
        this.selectedItems = [];
        this.loadPipelines();
        this.loadActivities(true);
      });
  }

  loadPipelines () {
    const query = $newObj(EntitySearchQuery);
    query.text = '';
    pipelineModule.dispatchGetPipelines(store, query)
      .then((res: IEntitySearchResult<IPipelineLightModel>) => {
        this.pipelines = res;
      });
  }

  getCounters () {
    const self = this;
    const query: IPipelineEntryActivityQuery = $newObj(PipelineEntryActivityQuery);
    query.pageSize = self.perPage;
    query.page = 0;
    query.text = self.searchForString ? self.searchForString : undefined;
    query.statuses = this.statusFilter;
    query.timeRangeUtc = this.timeFilter;

    if (this.selectedStatusFilter === 'overdue') {
      query.timeRangeUtc = $newObj(SearchQueryRangeOfDateTime);
      query.timeRangeUtc.max = new Date();
      query.timeRangeUtc.max.setUTCHours(new Date().getUTCHours(), new Date().getUTCMinutes(), 0);
    }

    if (this.selectedPipeline.id) {
      query.pipelineId = this.selectedPipeline.id;
    } else {
      query.pipelineId = undefined;
    }
    $pipelines.findEntryActivities(query)
      .then((res: PipelineEntryActivitySearchResult) => {
        this.activities.overdueItemCount = res.overdueItemCount;
        this.activities.totalItemCount = res.totalItemCount;
      });
  }

  selectOwner(member: FilterDropdownModel) {
    this.selectedOwner = member;
    this.loadActivities(true);
  }

  empInitials(emp: EmployeeIdentity) {
    if (emp.firstName && emp.lastName) {
      return `${emp.firstName.charAt(0).toUpperCase()}${emp.lastName.charAt(0).toUpperCase()}`;
    }
    return emp.firstName;
  }
}
