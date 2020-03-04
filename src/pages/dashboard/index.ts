import Vue from 'vue';
import { Component, Watch } from 'vue-property-decorator';
import template from './Dashboard.vue';
import { getUserContext } from './../../store/modules/authStatesModule';
import store from './../../store';
import Chart from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import BaseComponent, { IWorkaspaceStore } from '../../components/base';
import * as globalState from '../../store/modules/globalStatesModule';
import { getEmployeeContext } from '../../store/modules/authStatesModule';

import { getDateAndTime } from '../../components/sharedFunctions';
import { TotalAdsChart, NewAdsPerDay, GeoLocalChart, CompetitorComparisonChart, BuyPerMonth, RentPerMonth, InboxChart, Subscriptions } from '../../components/dashboardDiagrams';
import { $dataStorage } from '@immosparrow/cockpit-api-v2';
import { mapGetters } from 'vuex';
Chart.defaults.global.plugins.datalabels = false;

interface Diagram {
  id: string;
  options: OptionsDiagram;
  staticOptions: StaticDiagramOptions;
}

interface StaticDiagramOptions {
  size: number;
  alpha: boolean;
}

interface OptionsDiagram {
  stats: 'unrestricted' | 'workspace';
  type: string;
}

class DiagramDataOptions {
  options: OptionsDiagram;
  constructor({ stats = 'unrestricted', type = undefined }: OptionsDiagram) {
    this.options = { stats, type };
  }
}

interface Config {
  hiddenDiagrams: Diagram[];
  visibleDiagrams: Diagram[];
}

@Component({
  mixins: [template],
  components: { TotalAdsChart, NewAdsPerDay, GeoLocalChart, CompetitorComparisonChart, BuyPerMonth, RentPerMonth, InboxChart, Subscriptions },
  computed: mapGetters({ workspace : 'authStatesModule/employeeContext' }),
})
export default class Dashboard extends BaseComponent {

  refreshTime: number = 60000;
  interval: any = null;
  refreshActive: boolean = false;
  editSidbarActive: boolean = false;
  widgetSidebarPresented: boolean = false;
  dragging: boolean = false;
  getDateAndTime: Function = getDateAndTime;
  filterBy: {name: string, alpha: boolean}[] = [
    {
      name: 'All',
      alpha: false,
    },
    {
      name: 'Search',
      alpha: false,
    },
    {
      name: 'Inbox',
      alpha: false,
    },
    {
      name: 'Marketradar',
      alpha: true,
    },
    {
      name: 'PricePredictor',
      alpha: true,
    },
  ];
  selectedFilter: string = 'All';
  loadDiagramData: boolean = true;
  defoultListDiagrams: Config = {
    hiddenDiagrams: [],
    visibleDiagrams: [
      {
        id: 'subscriptions',
        options: {
          stats: 'unrestricted',
          type: 'Search',
        },
        staticOptions: {
          size: 2,
          alpha: false,
        },
      },
      {
        id: 'competitorComparisonChart',
        options: {
          stats: 'unrestricted',
          type: 'Search',
        },
        staticOptions: {
          size: 1,
          alpha: false,
        },
      },
      {
        id: 'buyPerMonth',
        options: {
          stats: 'unrestricted',
          type: 'Search',
        },
        staticOptions: {
          size: 1,
          alpha: false,
        },
      },
      {
        id: 'rentPerMonth',
        options: {
          stats: 'unrestricted',
          type: 'Search',
        },
        staticOptions: {
          size: 1,
          alpha: false,
        },
      },
      {
        id: 'inboxChart',
        options: {
          type: 'Inbox',
          stats: 'workspace',
        },
        staticOptions: {
          size: 1,
          alpha: false,
        },
      },
      {
        id: 'totalAdsChart',
        options: {
          stats: 'unrestricted',
          type: 'Search',
        },
        staticOptions: {
          size: 1,
          alpha: false,
        },
      },
      {
        id: 'newAdsPerDay',
        options: {
          stats: 'unrestricted',
          type: 'Search',
        },
        staticOptions: {
          size: 1,
          alpha: false,
        },
      },
      {
        id: 'geoLocalChart',
        options: {
          stats: 'unrestricted',
          type: 'Search',
        },
        staticOptions: {
          size: 1,
          alpha: false,
        },
      },
    ],
  };
  listDiagrams: Config = null;

  sortableOptions: Object = {
    animation: 200,
    group: 'items',
    ghostClass: 'sortable-ghost',
    scroll: true,
    pull: true,
    disabled: true,
    allowDuplicates: false,
    filter: '.hidden',
  };
  workspace: any;

  get employeeName () {
    const emp = getEmployeeContext(store);
    return `${emp.employee.firstName} ${emp.employee.lastName}`;
  }

  onStart () {
    this.dragging = true;
  }

  toggleRemove(id: string, status: boolean) {
    const element = document.getElementById(`${status ? 'g' : 'r'}${id}`);
    const getArray = this.listDiagrams[status ? 'visibleDiagrams' : 'hiddenDiagrams'];
    const setArray = this.listDiagrams[status ? 'hiddenDiagrams' : 'visibleDiagrams'];
    const elementPosition = getArray.findIndex(el => el.id === id);
    element.classList.add('animated', 'zoomOut', 'faster');
    setTimeout(() => {
      element.classList.remove('zoomOut', 'faster');
      element.classList.add('bounceIn');
      setArray.push(getArray[elementPosition]);
      getArray.splice(elementPosition, 1);
      this.saveDiagramsStatus();
    },         300);
    setTimeout(() => {
      element.classList.remove('animated', 'bounceIn');
    },         800);
  }

  onRemove(e: any) {
    this.saveDiagramsStatus();
  }

  onRestore(e: any) {
    const diagram = e.item.getAttribute('data-type');
    if (this.$refs[`${diagram}diagram`][0].callCreateChart) {
      this.$refs[`${diagram}diagram`][0].callCreateChart();
      this.saveDiagramsStatus();
    }
  }

  onEnd (e: any) {
    this.dragging = false;
    this.saveDiagramsStatus();
  }

  checkIfAllOptionsExist(data: Config) {
    Object.keys(data).forEach((key: string) => {
      const arrayDiagrams = data[key];
      if (arrayDiagrams.length) {
        arrayDiagrams.forEach((diagramData: Diagram, index: number) => {
          data[key][index].options = new DiagramDataOptions(diagramData.options).options;
          const visDiagram = this.defoultListDiagrams.visibleDiagrams;
          const diagramIndex = visDiagram.findIndex(diagram => diagram.id === diagramData.id);
          data[key][index].staticOptions = visDiagram[diagramIndex].staticOptions;
        });
      }
    });
  }

  checkIfAllDiagramExist(data: Config) {
    this.defoultListDiagrams.visibleDiagrams.forEach((defoultDiagram) => {
      const visibleIndex = data.visibleDiagrams.findIndex(diagram => diagram.id === defoultDiagram.id);
      const hiddenIndex = data.hiddenDiagrams.findIndex(diagram => diagram.id === defoultDiagram.id);
      if (visibleIndex === -1 && hiddenIndex === -1) {
        this.listDiagrams.visibleDiagrams.unshift(defoultDiagram);
        this.saveDiagramsStatus();
      }
    });
  }

  async created() {
    this.$root.$on('currentEmployeeLoaded', async () => {
      const getLocalData = await $dataStorage.employee.get<Config>(IWorkaspaceStore.dashboardSettings);
      this.listDiagrams = getLocalData ? getLocalData : { ...this.defoultListDiagrams };
      this.checkIfAllDiagramExist(this.listDiagrams);
      this.checkIfAllOptionsExist(this.listDiagrams);
      this.loadDiagramData = false;
      globalState.commitSetSearchSidebar(store, true);
      this.interval = setInterval(() => this.getDashboardStats(), this.refreshTime);
    });
    this.$root.$on('noEmployeeSelected', async () => {
      this.loadDiagramData = true;
    });
    if (this.workspace) {
      const getLocalData = await $dataStorage.employee.get<Config>(IWorkaspaceStore.dashboardSettings);
      this.listDiagrams = getLocalData ? getLocalData : { ...this.defoultListDiagrams };
      this.checkIfAllDiagramExist(this.listDiagrams);
      this.checkIfAllOptionsExist(this.listDiagrams);
      this.loadDiagramData = false;
      globalState.commitSetSearchSidebar(store, true);
      this.interval = setInterval(() => this.getDashboardStats(), this.refreshTime);
    }
  }

  changeRefreshTime(refresh: number) {
    this.refreshTime = refresh;
    clearInterval(this.interval);
    this.interval = setInterval(() => this.getDashboardStats(), this.refreshTime);
  }

  destroyed () {
    clearInterval(this.interval);
  }

  manualRefresh: boolean = false;
  manualRefreshDashboardStats () {
    this.manualRefresh = true;
    this.getDashboardStats();
    this.manualRefresh = false;
  }

  getDashboardStats () {
    if (this.listDiagrams) {
      this.listDiagrams.visibleDiagrams.forEach((diagram) => {
        if ((!this.manualRefresh && (diagram.id !== 'buyPerMonth' && diagram.id !== 'rentPerMonth')) || this.manualRefresh) {
          if (this.$refs[`${diagram.id}diagram`] && this.$refs[`${diagram.id}diagram`][0] && this.$refs[`${diagram.id}diagram`][0].getData) {
            this.$refs[`${diagram.id}diagram`][0].getData();
          }
        }
      });

      this.listDiagrams.hiddenDiagrams.forEach((diagram) => {
        if ((!this.manualRefresh && (diagram.id !== 'buyPerMonth' && diagram.id !== 'rentPerMonth')) || this.manualRefresh) {
          if (!this.$refs[`${diagram.id}diagram`] && this.$refs[`${diagram.id}diagram`][0] && this.$refs[`${diagram.id}diagram`][0].getData) {
            this.$refs[`${diagram.id}diagram`][0].getData();
          }
        }
      });

      this.refreshActive = true;
      setTimeout(() => {
        this.refreshActive = false;
      }, 2000);
    }
  }

  filterDiagrams(diagrams: Diagram[], filter: string) {
    if (filter !== 'All') {
      return diagrams.filter(diagram => diagram.options.type === filter);
    }

    return diagrams;
  }

  toggleEditSidebar() {
    this.editSidbarActive = !this.editSidbarActive;
    if (!this.editSidbarActive) {
      this.selectedFilter = 'All';
    }
    this.widgetSidebarPresented = false;
    this.sortableOptions['disabled'] = !this.editSidbarActive;
  }

  saveDiagramsStatus() {
    $dataStorage.employee.set(IWorkaspaceStore.dashboardSettings, this.listDiagrams);
  }
}
