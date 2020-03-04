import Vue from 'vue';
import { Component, Watch } from 'vue-property-decorator';
import template from './Pipeline.vue';
import store from '../../store';
import * as pipelineModule from '../../store/modules/pipeline';
import * as globalState from '../../store/modules/globalStatesModule';
import { getEmployeeContext } from '../../store/modules/authStatesModule';
import {
  dipsatchGetRealEstatePortals,
  getRealEstatePortals,
} from '../../store/modules/searchModule';
import {
  IEntitySearchResult, IPipelineLightModel, IPipelineEntryLightModel,
  $newObj, PipelineEntryStatus, mval as val, PipelineEntryQueryStatuses,
  IPipelineModel, EntitySearchQuery, $pipelineEntry,
  IPipelineEntryQuery, PipelineEntryQuery,
  PipelineEntryTimelineStatus, PipelineLightModel,
  EntitySearchQueryDeletedStatus, $pipeline, EntityType,
  IPipelineStepDef, PipelineEntryQueryEntityStatuses,
  EmployeeIdentityInPipline, PipelineStepDef, PipelineEntryQueryState,
} from '@immosparrow/cockpit-api-v2';
import {
  displayAddress, getGoogleStreetViewImage, formatDate,
} from '../../components/sharedFunctions';
import EntryDetails from './entryDetails';
import Modal from '../../components/modal';
import ConfirmModal from '../../components/modal/confirmModal';
import ObjectComponent from '../../components/searchModule/object';
import ActivityOverdue from './activityOverdue';
import _ from 'lodash';
import PipeDetails from './pipeDetails';
import PipeSearch from './pipeSearch';
import gsap from 'gsap';
import FilterDropdown from '../../components/shared/filterDropdown';
import { FilterDropdownModel } from '../../components/shared/filterDropdown/model';

export interface IPipeLineEntries {
  step: IPipelineStepDef;
  entries: IPipelineEntryLightModel[];
}
export interface PipeTypes {
  started: boolean;
  my: boolean;
  private: boolean;
  team: boolean;
  agency: boolean;
  favorites: boolean;
}

Vue.use(gsap);

@Component({
  name: 'Pipeline',
  mixins: [template],
  components: {
    Modal,
    ObjectComponent,
    ActivityOverdue,
    EntryDetails,
    PipeDetails,
    FilterDropdown,
    ConfirmModal,
    PipeSearch,
  },
})

export default class Pipeline extends Vue {

  sortableOptions: Object = {
    animation: 200,
    group: 'items',
    scroll: true,
    pull: true,
    sort: true,
    allowDuplicates: false,
    draggable: '.pipe-item-draggable',
  };

  tabsPipeFilter: PipeTypes = {
    started: true,
    my: false,
    private: false,
    team: false,
    agency: false,
    favorites: false,
  };

  $refs: {
    editTitle: any,
  };

  displayAddress: Function = displayAddress;
  getGoogleStreetViewImage: Function = getGoogleStreetViewImage;
  formatDate: Function = formatDate;
  val: Function = val;
  pipeSearch: string = '';

  dragging: boolean = false;
  draggingEl: IPipelineEntryLightModel = null;
  dragElement: IPipelineEntryLightModel = null;

  showDeletePipe: boolean = false;
  previousId: string = null;
  pipeForDelete: any = null;

  activitySection: string = null;
  editTitle: boolean = false;

  loading: boolean = false;
  showModal: boolean = false;
  selectedEntry: IPipelineEntryLightModel = null;
  leadDelete: boolean = false;
  delayTimer: any = null;
  addDealInList: boolean = false;

  members: FilterDropdownModel[] = [];
  selectedMember: FilterDropdownModel = { text: '', value: '' };

  entriesFilterOptions: FilterDropdownModel[] = [
    { value: PipelineEntryQueryStatuses.Any, text: 'All Items' },
    { value: PipelineEntryQueryStatuses.InProgress, text: 'In Progress' },
    { value: PipelineEntryQueryStatuses.Lost, text: 'Lost' },
    { value: PipelineEntryQueryStatuses.Won, text: 'Won' },
    { value: EntitySearchQueryDeletedStatus.Deleted, text: 'Deleted' },
    { value: PipelineEntryQueryState.LongRunning, text: 'Long running' },
  ];
  selectedEntryFilter: FilterDropdownModel = { value: PipelineEntryQueryStatuses.InProgress, text: 'In Progress' };
  entryState: boolean = false;

  pipelines: IEntitySearchResult<IPipelineLightModel> = { items: [] };
  selectedPipeline: { pipeline: IPipelineModel, entries: IPipelineEntryLightModel[] } =
    {
      pipeline: null,
      entries: [],
    };

  moveToPipeline: IPipelineLightModel = $newObj(PipelineLightModel);
  modalLoading: boolean = false;
  showPipeModal: boolean = false;

  pipelineEntries: IPipeLineEntries[] = [];
  employees: EmployeeIdentityInPipline[] = [];

  editPipeId: string = '';

  created () {
    globalState.commitShowRightSidebar(store, false);
    this.loading = true;
    const query = $newObj(EntitySearchQuery);
    query.text = '';

    pipelineModule.dispatchGetPipelines(store, query)
      .then((res: IEntitySearchResult<IPipelineLightModel>) => {
        this.pipelines = res;
        this.updateSelectedFilters();
        if (this.$route.query.id) {
          const pipe = this.pipelines.items.find(pipe => pipe.id === this.$route.query.id);
          if (pipe) {
            this.getPipeline(pipe.id);
          } else {
            this.loading = false;
          }
        } else {
          this.selectedPipeline.pipeline = pipelineModule.getSelectedPipeline(store);
          if (this.selectedPipeline.pipeline && this.selectedPipeline.pipeline.id) {
            this.getPipeline(this.selectedPipeline.pipeline.id);
          } else {
            this.loading = false;
          }
        }
      });
    this.$root.$on('refreshPipeEntry', (entry: IPipelineEntryLightModel) => {
      const step = this.pipelineEntries.find(item => item.step.id === entry.stepId);
      if (step && this.pipelineEntries[this.pipelineEntries.indexOf(step)]) {
        this.pipelineEntries[this.pipelineEntries.indexOf(step)].entries
          .forEach((item: IPipelineEntryLightModel) => {
            if (item.id === entry.id) {
              item.entityModifiableInfo = _.cloneDeep(entry.entityModifiableInfo);
            }
          });
      }
    });
    this.$root.$on('refreshSelEntry', () => {
      this.refreshSelectedEntry(1, undefined);
    });

    if (!getRealEstatePortals(store).length) {
      dipsatchGetRealEstatePortals(store);
    }
  }

  beforeDestroy () {
    this.saveFilters();
    this.$root.$off('refreshPipeEntry');
    this.$root.$off('refreshSelEntry');
  }

  get currentEmployee() {
    return getEmployeeContext(store).employee;
  }

  get allPipelines() {
    return this.pipelines.items
      .filter((item) => {
        if (item.owner) {
          if (this.tabsPipeFilter.agency) {
            return item.owner.ownerType === EntityType.Agency;
          }
          if (this.tabsPipeFilter.favorites) {
            return item.tags && item.tags.includes('my-favorites');
          }
          if (this.tabsPipeFilter.my) {
            return item.owner.ownerType === EntityType.Employee && item.owner.ownerId === this.currentEmployee.id;
          }
          if (this.tabsPipeFilter.private) {
            return item.owner.ownerType === EntityType.Employee && item.owner.ownerId !== this.currentEmployee.id;
          }
          if (this.tabsPipeFilter.team) {
            return item.owner.ownerType === EntityType.Team;
          }
        }
        return item;
      })
      .filter((item) => {
        return item.name.toLowerCase().includes(this.pipeSearch.toLowerCase());
      })
      .sort((a, b) => {
        return a.name.localeCompare(b.name);
      });
  }

  get availablePipelines () {
    return this.pipelines.items
      .filter((item) => {
        if (item.id !== this.selectedPipeline.pipeline.id) {
          return item;
        }
      })
      .sort((a, b) => {
        return a.name.localeCompare(b.name);
      });
  }

  get sidebarChanged () {
    return globalState.getShowPipeDetails(store);
  }

  get filteredEmployees () {
    return this.employees.map((item) => {
      return {
        text: item.lastName,
        additionalText: item.firstName,
        value: item.id,
        count: item.activeEntryCount,
      };
    })
    .sort((a, b) => {
      return a.text.localeCompare(b.text);
    });
  }

  get selectedOwner () {
    return {
      value: this.selectedEntry.assignedEmployee.employee.id,
      text: this.selectedEntry.assignedEmployee.employee.lastName,
      additionalText: this.selectedEntry.assignedEmployee.employee.firstName,
    };
  }

  get filteredOwners () {
    const owners: FilterDropdownModel[] = this.employees.map((item) => {
      return {
        text: `${item.lastName} ${item.firstName}`,
        value: item.id,
        count: this.getEmpCount(item.id),
      };
    })
    .filter(item => this.selectedPipeline.entries.find(el => el.assignedEmployee.employee.id === item.value))
    .sort((a, b) => {
      return a.text.localeCompare(b.text);
    });
    owners.unshift({ value: 'All', text: 'Show All' });
    return owners;
  }

  get deletedEntry () {
    return this.dragElement && this.dragElement.isDeleted;
  }

  @Watch('sidebarChanged')
  closingDetails () {
    if (!globalState.getShowPipeDetails(store)) {
      this.editTitle = false;
    }
  }

  getEmpCount(id: string) {
    let cnt = 0;
    this.selectedPipeline.entries.forEach((item) => {
      if (item.assignedEmployee.employee.id === id) {
        cnt += 1;
      }
    });
    return cnt;
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

  checkIfOwner (item: IPipelineEntryLightModel) {
    return !item.isDeleted &&
      item.status ===  PipelineEntryStatus.InProgress &&
      this.val(item, (item: IPipelineEntryLightModel) => item.assignedEmployee.employee.id === this.currentEmployee.id);
  }

  pipeSearchDeploy () {
    gsap.to('.pipe-item', { duration: 0.5, y: 100, ease: 'power1', stagger: 0.2 });
  }

  saveFilters () {
    pipelineModule.commitSetPipeFilters(store, {
      ownerFilter: this.selectedMember,
      entryFilter: this.selectedEntryFilter,
      entryState: this.entryState,
    });
  }

  reloadPipelines () {
    this.addDealInList = false;
    this.editPipeId = '';
    const query = $newObj(EntitySearchQuery);
    query.text = '';
    pipelineModule.dispatchGetPipelines(store, query)
      .then((res: IEntitySearchResult<IPipelineLightModel>) => {
        if (this.selectedPipeline?.pipeline?.id) {
          this.getAllEmployees(this.selectedPipeline.pipeline.id);
        }
        this.pipelines = res;
      });
  }

  changeEntryState () {
    this.entryState = !this.entryState;
    this.getPipelineEntries();
  }

  selectEntryFilter (filter: FilterDropdownModel) {
    this.selectedEntryFilter = filter;
    this.getPipelineEntries();
  }

  getPipelineEntries() {
    this.loading = true;
    const queryObj: IPipelineEntryQuery = $newObj(PipelineEntryQuery);
    queryObj.entityTypes = -1;
    if (this.selectedEntryFilter.text === 'Deleted') {
      queryObj.deletedStatus = EntitySearchQueryDeletedStatus.Deleted;
      queryObj.statuses = PipelineEntryQueryStatuses.Any;
    } else if (this.selectedEntryFilter.text === 'Long running') {
      queryObj.state = PipelineEntryQueryState.LongRunning;
      queryObj.statuses = PipelineEntryQueryStatuses.Any;
    } else {
      queryObj.deletedStatus = EntitySearchQueryDeletedStatus.Default;
      queryObj.statuses = this.selectedEntryFilter.value as number;
      if (this.selectedEntryFilter.text === 'All Items') {
        queryObj.deletedStatus = EntitySearchQueryDeletedStatus.All;
      }
    }
    queryObj.entityStatuses = this.entryState ? PipelineEntryQueryEntityStatuses.Active : PipelineEntryQueryEntityStatuses.Any;

    $pipeline(this.selectedPipeline.pipeline.id).entries.find(queryObj)
      .then((res2) => {
        res2.items;
        this.selectedPipeline.entries = res2.items;
        this.updateOwnerFilter();
        // pipelineModule.commitSetSelectedPipeline(store, this.selectedPipeline.pipeline);
        this.loadEntries();
      });
  }

  selectMember(member: FilterDropdownModel) {
    this.selectedMember = member;
    this.saveFilters();
    this.loadEntries();
  }

  loadEntries () {
    this.pipelineEntries = [];
    if (this.selectedPipeline && this.selectedPipeline.pipeline) {
      this.selectedPipeline.pipeline.definition.steps.forEach((step) => {
        let newStep: IPipelineStepDef = $newObj(PipelineStepDef);
        newStep = step;
        this.pipelineEntries.push({ step: newStep, entries: [] });
      });
      const allEntries = this.selectedPipeline.entries;
      allEntries.forEach((lead) => {
        if (!lead.stepId) {
          lead.stepId = this.selectedPipeline.pipeline.definition.steps[0].id;
        }
        const stepFound = this.pipelineEntries.find(item => item.step.id === lead.stepId);
        if (stepFound) {
          this.pipelineEntries[this.pipelineEntries.indexOf(stepFound)].entries.push(lead);
        } else {
          if (!this.pipelineEntries.find(item => item.step.name === 'Unassigned')) {
            this.pipelineEntries.unshift({ step: { id: 'unassigned', name: 'Unassigned' }, entries: [] });
          }
          const unassignedEntries = this.pipelineEntries.find(item => item.step.name === 'Unassigned');
          this.pipelineEntries[this.pipelineEntries.indexOf(unassignedEntries)].entries.push(lead);
        }
        if (!lead.order) {
          lead.order = null;
        }
      });
      this.sortEntries();
      this.$forceUpdate();
      this.loading = false;
      if (this.$route.query.entryId) {
        const entry = allEntries.find(entry => entry.id === this.$route.query.entryId);
        if (entry) {
          this.selectLead(entry, null);
        }
      }
    } else {
      this.loading = false;
    }
  }

  onStart (evt: any) {
    this.dragging = true;
    this.dragElement = this.selectedPipeline.entries.find(item => item.id === evt.item.id);
  }

  onEnd (evt: any) {
    this.dragging = false;
    this.dragElement = null;
    if (this.draggingEl) {
      if (evt.to.id === 'deleteArea') {
        this.leadDelete = true;
        this.previousId = this.draggingEl.stepId;
        this.showModal = true;
      } else if (evt.to.id === 'loseArea') {
        this.draggingEl.status = PipelineEntryStatus.Lost;
        this.updateLeadStatus(this.draggingEl);
        this.updatePipeActiveCount(false);
      } else if (evt.to.id === 'winArea') {
        this.draggingEl.status = PipelineEntryStatus.Won;
        this.updateLeadStatus(this.draggingEl);
        this.updatePipeActiveCount(false);
      } else if (evt.to.id === 'reopenArea') {
        this.draggingEl.status = PipelineEntryStatus.InProgress;
        this.updateLeadStatus(this.draggingEl);
        this.updatePipeActiveCount(true);
      } else if (evt.to.id === 'pipeArea') {
        this.previousId = this.draggingEl.stepId;
        this.modalLoading = false;
        this.showPipeModal = true;
      } else {
        this.draggingEl.stepId = evt.to.id;
        this.draggingEl.order = this.calculateOrder(this.draggingEl);
        $pipeline(this.selectedPipeline.pipeline.id).entries.update([this.draggingEl])
          .then((res) => {
            if (this.selectedEntry && this.draggingEl.id === this.selectedEntry.id) {
              this.selectedEntry.stepId = this.draggingEl.stepId;
            }
            this.checkUnassignedColumn();
            this.draggingEl = null;
          });
      }
    }
  }

  calculateOrder (el: IPipelineEntryLightModel): number {
    const stepIndex = this.pipelineEntries.findIndex(item => item.step.id === el.stepId);
    let newInd: number = 0;
    if (stepIndex) {
      const entries = this.pipelineEntries[stepIndex].entries;

      const a = entries[entries.indexOf(el) - 1];
      const b = entries[entries.indexOf(el) + 1];

      if (a && b) {
        newInd = parseFloat(((a.order + b.order) / 2).toPrecision(4));
      } else if (a) {
        newInd = a.order + 1;
      } else if (b) {
        newInd = b.order - 1;
      }
    }
    return newInd;
  }

  checkUnassignedColumn() {
    const unassigned = this.pipelineEntries.find(column => column.step.name === 'Unassigned');
    if (unassigned && unassigned.entries.length === 0) {
      this.pipelineEntries.splice(this.pipelineEntries.indexOf(unassigned), 1);
    }
  }

  checkMove (evt: any) {
    if (!this.draggingEl) {
      this.draggingEl = evt.draggedContext.element;
    }
  }

  showDeleteLead (item: IPipelineEntryLightModel) {
    this.draggingEl = item;
    this.showModal = true;
    this.leadDelete = true;
  }

  deleteLead () {
    this.showModal = false;
    this.loading = true;
    $pipeline(this.selectedPipeline.pipeline.id).entries.delete([this.draggingEl.id])
    .then((res) => {
      if (res) {
        if (this.draggingEl.status === PipelineEntryStatus.InProgress) {
          this.updatePipeActiveCount(false);
        }
        Vue.prototype.$notify({
          group: 'actions',
          type: 'success',
          duration: 2500,
          text: 'Entry successfully removed from pipeline',
        });
      } else {
        Vue.prototype.$notify({
          group: 'actions',
          type: 'error',
          duration: 2500,
          text: 'Error while trying to remove entry from pipeline',
        });
      }
      this.draggingEl = null;
      this.leadDelete = false;
      this.loading = false;
      this.getPipelineEntries();
      this.selectedEntry = null;
      globalState.commitShowPipeDetails(store, false);
      globalState.commitShowRightSidebar(store, false);
    });
  }

  updatePipeActiveCount (inc: boolean) {
    this.pipelines.items.forEach((item, index) => {
      if (item.id === this.selectedPipeline.pipeline.id) {
        if (inc) {
          this.pipelines.items[index].activeEntryCount += 1;
        } else {
          this.pipelines.items[index].activeEntryCount -= 1;
        }
      }
    });
    if (this.moveToPipeline.id) {
      this.pipelines.items.forEach((item, index) => {
        if (item.id === this.moveToPipeline.id) {
          this.pipelines.items[index].activeEntryCount += 1;
        }
      });
    }
  }

  updateLeadStatus (item: IPipelineEntryLightModel) {
    this.showModal = false;
    this.loading = true;
    $pipeline(this.selectedPipeline.pipeline.id).entries.update([item])
      .then((res) => {
        this.draggingEl = null;
        if (res) {
          this.getPipelineEntries();
          Vue.prototype.$notify({
            group: 'actions',
            type: 'success',
            duration: 2500,
            text: 'Entry status successfully updated',
          });
        } else {
          Vue.prototype.$notify({
            group: 'actions',
            type: 'error',
            duration: 2500,
            text: 'Error while trying to update entry status',
          });
          this.loading = false;
        }
      });
  }

  closeModal () {
    this.showModal = false;
    if (this.previousId) {
      this.draggingEl.stepId = this.previousId;
      $pipeline(this.selectedPipeline.pipeline.id).entries.update([this.draggingEl]);
    }
    this.draggingEl = null;
    this.loadEntries();
  }

  async getAllEmployees (pipeId: string) {
    return $pipeline(pipeId).getAllEmployeesInPipeline()
    .then((res) => {
      return this.employees = res;
    });
  }

  getPipeline (pipeId: string) {
    this.selectedPipeline.pipeline = null;
    this.selectedPipeline.entries = [];
    $pipeline(pipeId).get()
      .then((res) => {
        this.selectedPipeline.pipeline = res;
        if (this.selectedPipeline.pipeline && this.selectedPipeline.pipeline.id) {
          this.selectedMember = { text: '', value: '' };
          pipelineModule.commitSetSelectedPipeline(store, this.selectedPipeline.pipeline);
          this.getAllEmployees(pipeId)
            .then(() => {
              this.getPipelineEntries();
            })
            .catch(() => {
              this.getPipelineEntries();
            });
        } else {
          this.loading = false;
        }
      });
  }

  updateOwnerFilter () {
    const filters = pipelineModule.getPipeFilters(store);
    if (filters.ownerFilter) {
      const owner = this.filteredOwners.find(item => item.value === filters.ownerFilter.value);
      if (owner || filters.ownerFilter.value === 'All') {
        this.selectedMember.value = filters.ownerFilter.value;
        this.selectedMember.text = filters.ownerFilter.text;
      } else {
        this.selectedMember = { text: '', value: '' };
      }
    } else {
      this.selectedMember = { text: '', value: '' };
    }
  }

  selectPipeline (pipe: IPipelineLightModel) {
    this.selectedEntry = null;
    globalState.commitShowPipeDetails(store, false);
    this.loading = true;
    this.getPipeline(pipe.id);
  }

  updateSelectedFilters () {
    const filters = pipelineModule.getPipeFilters(store);
    this.entryState = filters.entryState;
    if (filters.entryFilter) {
      this.selectedEntryFilter = filters.entryFilter;
    }
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
        this.reloadPipelines();
      });
  }

  deletePipe (pipe: any) {
    this.showDeletePipe = true;
    this.pipeForDelete = pipe;
  }

  confirmDeletePipe () {
    this.showDeletePipe = false;
    $pipeline(this.pipeForDelete.id).delete()
      .then((res) => {
        if (res) {
          Vue.prototype.$notify({
            group: 'actions',
            type: 'success',
            duration: 2500,
            text: 'Pipeline successfully deleted',
          });
        }
        this.pipelines.items.forEach((item, index) => {
          if (item.id === this.pipeForDelete.id) {
            this.pipelines.items.splice(index, 1);
          }
        });
        if (this.selectedPipeline.pipeline && this.pipeForDelete.id === this.selectedPipeline.pipeline.id) {
          this.pipelineEntries = [];
          this.selectedPipeline =  {
            pipeline: null,
            entries: [],
          };
        }
        this.pipeForDelete = null;
        pipelineModule.commitSetSelectedPipeline(store, null);
      });
  }

  getLeadCompleteStatusNumber () {
    const step = this.selectedPipeline.pipeline.definition.steps.find((step) => {
      return this.selectedEntry.stepId === step.id;
    });
    return this.selectedPipeline.pipeline.definition.steps.indexOf(step) + 1;
  }

  checkLeadCompleteStatus (step: IPipelineStepDef) {
    const leadStep = this.selectedPipeline.pipeline.definition.steps.find((step) => {
      return this.selectedEntry.stepId === step.id;
    });
    const leadInd = this.selectedPipeline.pipeline.definition.steps.indexOf(leadStep);
    const stepInd = this.selectedPipeline.pipeline.definition.steps.indexOf(step);
    if (stepInd <= leadInd) {
      return true;
    }
    return false;

  }

  moveToStep (stepId: string) {
    this.selectedEntry.stepId = stepId;
    clearTimeout(this.delayTimer);
    this.delayTimer = setTimeout(() => {
      if (this.selectedPipeline?.pipeline?.id) {
        $pipeline(this.selectedPipeline.pipeline.id).entries.update([this.selectedEntry]);
        this.selectedPipeline.entries.forEach((item) => {
          if (item.id === this.selectedEntry.id) {
            item.stepId = stepId;
          }
        });
        this.loadEntries();
      }
    },                           1000);
  }

  sortEntries () {
    this.selectedPipeline.pipeline.definition.steps.forEach((step) => {
      const findStep = this.pipelineEntries.find(item => item.step.id === step.id);
      if (findStep) {
        this.pipelineEntries[this.pipelineEntries.indexOf(findStep)].entries = this.pipelineEntries[this.pipelineEntries.indexOf(findStep)].entries
        .filter(entry => !this.selectedMember.text || (entry.assignedEmployee.employee.id === this.selectedMember.value) || (!entry.assignedEmployee.employee.firstName) || this.selectedMember.value === 'All')
        .sort((a, b) => {
          return a.order - b.order;
        });
      }
    });
  }

  selectSearchResult (lead: IPipelineEntryLightModel) {
    if (!this.selectedPipeline.pipeline || (this.selectedPipeline.pipeline && this.selectedPipeline.pipeline.id !== lead.pipeline.id)) {
      this.getPipeline(lead.pipeline.id);
    }
    this.selectLead(lead, null);
  }

  selectLead (lead: IPipelineEntryLightModel, id: string) {
    globalState.commitShowPipeDetails(store, false);
    this.selectedEntry = null;
    this.selectedEntry = _.cloneDeep(lead);
    this.activitySection = id;
    setTimeout(() => {  // when loading from selectSearchResult - mutation is not executed properly
      globalState.commitShowPipeDetails(store, true);
    },         100);
  }

  refreshSelectedEntry (activityLength: number, item: IPipelineEntryLightModel) {
    const entry = item && item.id ? item : this.selectedEntry;
    if (entry && entry.id) {
      $pipelineEntry(entry.id).get()
        .then((res: IPipelineEntryLightModel) => {
          const step = this.pipelineEntries.find(item => item.step.id === entry.stepId);
          if (this.pipelineEntries[this.pipelineEntries.indexOf(step)]) {
            const entries = this.pipelineEntries[this.pipelineEntries.indexOf(step)].entries;
            entries.forEach((item: IPipelineEntryLightModel, ind: number) => {
              if (item.id === entry.id) {
                entries[ind].timelineInfo.status = res.timelineInfo.status;
                if (!activityLength) {
                  entries[ind].isArchived = false;
                }
                this.$forceUpdate();
              }
            });
          }
        });
    }
  }

  closeObjectRightSidebar() {
    globalState.commitShowRightSidebar(store, false);
  }

  winLoseAction (win: boolean) {
    if (win) {
      this.selectedEntry.status = PipelineEntryStatus.Won;
    } else {
      this.selectedEntry.status = PipelineEntryStatus.Lost;
    }
    this.updateLeadStatus(this.selectedEntry);
    this.updatePipeActiveCount(false);
  }

  reopenEntry () {
    this.selectedEntry.status = PipelineEntryStatus.InProgress;
    if (this.selectedEntry.isDeleted) {
      this.selectedEntry.isDeleted = false;
      $pipeline(this.selectedPipeline.pipeline.id).entries.undelete([this.selectedEntry.id])
        .then(() => {
          this.updateLeadStatus(this.selectedEntry);
          this.updatePipeActiveCount(true);
        });
    } else {
      this.updateLeadStatus(this.selectedEntry);
    }
  }

  getEntryStatus (status: number) {
    return PipelineEntryStatus[status];
  }

  checkTimelineStatus (status: number) {
    return PipelineEntryTimelineStatus[status];
  }

  checkActivities (status: number, empty: boolean) {
    if (empty) {
      return PipelineEntryTimelineStatus[status] === 'Empty' || PipelineEntryTimelineStatus[status] === 'None';
    }
    return PipelineEntryTimelineStatus[status] === 'DueToday' ||
            PipelineEntryTimelineStatus[status] === 'Overdue' ||
            PipelineEntryTimelineStatus[status] === 'Upcoming';
  }

  timelineStatusClasses (status: number) {
    switch (PipelineEntryTimelineStatus[status]) {
      case 'Overdue':
        return 'status-overdue';
      case 'DueToday':
        return 'status-dueToday';
      case 'Upcoming':
        return 'status-dueToday';
      default:
        return 'status-empty';
    }
  }
  entryStatusLabelClass(status: number) {
    switch (PipelineEntryStatus[status]) {
      case 'Won':
        return 'label label-success';
      case 'Lost':
        return 'label label-danger';
      default:
        return 'label label-default';
    }
  }

  openCreatePipe () {
    this.addDealInList = !this.addDealInList;
  }

  closeMoveToPipeModal () {
    this.showPipeModal = false;
    this.draggingEl.stepId = this.previousId;
    this.moveToPipeline = $newObj(PipelineLightModel);
    $pipeline(this.selectedPipeline.pipeline.id).entries.update([this.draggingEl]);
    this.draggingEl = null;
    this.loadEntries();
  }

  moveToPipe () {
    this.modalLoading = true;
    $pipelineEntry(this.draggingEl.id).move(this.moveToPipeline.id)
      .then((res: boolean) => {
        if (res) {
          this.selectedPipeline.entries.splice(this.selectedPipeline.entries.indexOf(this.draggingEl), 1);
          this.updatePipeActiveCount(false);
          this.modalLoading = false;
          this.closeMoveToPipeModal();
        }
      });
  }

  editTitleName () {
    this.editTitle = true;
    setTimeout(() => {
      if (this.$refs.editTitle) {
        this.$refs.editTitle.focus();
      }
    },         1);
  }

  updateSelectedEntry () {
    this.editTitle = false;
    $pipeline(this.selectedPipeline.pipeline.id).entries.update([this.selectedEntry])
      .then((res: boolean) => {
        if (res) {
          const step = this.pipelineEntries.find(item => item.step.id === this.selectedEntry.stepId);
          this.pipelineEntries[this.pipelineEntries.indexOf(step)].entries.forEach((item: IPipelineEntryLightModel) => {
            if (item.id === this.selectedEntry.id) {
              item.name = this.selectedEntry.name;
            }
          });
          setTimeout(() => {
            Vue.prototype.$notify({
              group: 'actions',
              type: 'success',
              duration: 2500,
              text: 'Entry successfully updated',
            });
          },         1000);
        }
      });
  }

  ownerType (type: number) {
    switch (type) {
      case EntityType.Employee:
        return 'fa fa-user';
      case EntityType.Agency:
        return 'fa fa-briefcase';
      case EntityType.Team:
        return 'fa fa-group';
      default:
        return 'fa fa-user';
    }
  }

  assignEmployee(emp: FilterDropdownModel) {
    $pipelineEntry(this.selectedEntry.id).assignToEmployee(emp.value as string)
      .then((res) => {
        if (res) {
          this.selectedEntry.assignedEmployee.employee.id = emp.value as string;
          this.selectedEntry.assignedEmployee.employee.firstName = emp.additionalText;
          this.selectedEntry.assignedEmployee.employee.lastName = emp.text;
          this.getPipelineEntries();
          this.getAllEmployees(this.selectedPipeline.pipeline.id);
          Vue.prototype.$notify({
            group: 'actions',
            type: 'success',
            duration: 2500,
            text: `Entry successfully assigned to ${emp.text} ${emp.additionalText}`,
          });
        }
      });
  }
}
