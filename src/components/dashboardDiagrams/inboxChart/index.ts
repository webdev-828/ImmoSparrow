import Vue from 'vue';
import { Prop } from 'vue-property-decorator';
import template from './index.template.vue';
import Base from '../../base';
import { $authUser, $pubs, IWorkspaceStats, PubPublisherClass } from '@immosparrow/cockpit-api-v2';
import DashboardMixin from '../../../mixins/dashboard';
import Component, { mixins } from 'vue-class-component';
import { formatDBNumbers } from '../../sharedFunctions';
import * as auth from '../../../store/modules/authStatesModule';
import store from '../../../store';
import { ChartData, Chart, Diagram } from '../interfaces';

@Component({
  name: 'InboxChart',
  mixins: [template],
})
export default class InboxChart extends mixins(DashboardMixin) {
  @Prop()
  diagram: Diagram;

  dataset: number[] | Chart.ChartPoint[] = [];

  gettingData: boolean = false;

  inboxChart?: Chart;
  inboxChartOptions: ChartData = {
    type: 'bar',
    data: {
      labels: ['Total Leads', 'Total Unread', 'Total Today', 'Unread Today'],
      datasets: [
        {
          // label: ["Total leads count", "Total unread leads count", "Total today leads count", "Total today unread leads count"],
          data: [],
          backgroundColor: [
            '#7FE5F0',
            '#00C59D',
            '#f3b760',
            '#C9C0F9',
          ],
          borderWidth: [1, 1, 1, 1],
        },
      ],
    },
    options: {
      tooltips: {
        callbacks: {
        },
      },
      scales: {
        xAxes: [{
          display: false,
        }],
        yAxes: [{
          ticks: {
            beginAtZero: true,
            callback(value: any, index: any, values: any) {
              return formatDBNumbers(value);
            },
          },
        }],
      },
      legend: {
        display: false,
        position: 'bottom',
        labels: {
          padding: 20,
          fontSize: 10,
        },
      },
    },
  };

  mounted () {
    this.callCreateChart();
    this.getData();
  }

  callCreateChart() {
    this.createChart('#inboxChart', this.inboxChartOptions, 'inboxChart');
  }

  created() {
    this.$root.$on('currentEmployeeLoaded', () => {
      this.getData();
    });
  }

  getData() {
    if (auth.getEmployeeContext(store)) {
      if (!this.gettingData) {
        this.gettingData = true;
        $authUser.getCurrentWorkspaceStats()
          .then((res: IWorkspaceStats) => {
            this.resetData();
            this.inboxChartOptions.data.datasets[0].data[0] = res.leads.allTime.existingLeadCount;
            this.inboxChartOptions.data.datasets[0].data[1] = res.leads.allTime.newLeadCount;
            this.inboxChartOptions.data.datasets[0].data[2] = res.leads.today.existingLeadCount;
            this.inboxChartOptions.data.datasets[0].data[3] = res.leads.today.newLeadCount;
            this.dataset = this.inboxChartOptions.data.datasets[0].data;
            this.gettingData = false;

            if (this.inboxChart) {
              this.inboxChart.update();
            }
          });
      }
    }
  }

  resetData() {
    const data = this.inboxChartOptions.data.datasets[0].data;
    if (data) {
      data.forEach((value: number, i: number) => data[i] = 0);
    }

    this.dataset = [];
  }
}
