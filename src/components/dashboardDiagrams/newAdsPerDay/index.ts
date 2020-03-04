import Vue from 'vue';
import { Prop } from 'vue-property-decorator';
import template from './index.template.vue';
import Base from '../../base';
import {
  $pubs,
  IWorkspacePubStats,
  PubPublisherClass,
  PubStatsAvgPricesPerSqrMeterPerMonthQuery, PubStatsPubCountPerDayModel,
} from '@immosparrow/cockpit-api-v2';
import DashboardMixin from '../../../mixins/dashboard';
import Component, { mixins } from 'vue-class-component';
import moment from 'moment';
import { formatDBNumbers } from '../../sharedFunctions';
import { ChartData, Chart, Diagram } from '../interfaces';

@Component({
  name: 'NewAdsPerDay',
  mixins: [template],
})
export default class NewAdsPerDay extends mixins(DashboardMixin) {
  @Prop()
  diagram: Diagram;

  data: IWorkspacePubStats<PubStatsPubCountPerDayModel>;
  newAdsPerDay: number = 0;

  gettingData: boolean = false;

  adsPerDayChart?: Chart;
  adsPerDayChartOptions: ChartData = {
    type: 'line',
    data: {
      labels: [],
      datasets: [
        {
          label: 'Buy',
          data: [],
          borderColor: 'rgb(117,176,235)',
          backgroundColor: 'rgba(117,176,235,0.2)',
        },
        {
          label: 'Rent',
          data: [],
          borderColor: 'rgb(171,227,125)',
          backgroundColor: 'rgba(171,227,125,0.2)',
        },
      ],
    },
    options: {
      scales: {
        yAxes: [{
          display: true,
          ticks: {
            beginAtZero: true,
            callback(value: any, index: any, values: any) {
              return formatDBNumbers(value);
            },
          },
        }],
        xAxes: [{
          display: true,
          ticks: {
            fontSize: 10,
          },
        }],
      },
      legend: {
        display: false,
      },
      tooltips: {
        mode: 'index',
        intersect: false,
      },
      hover: {
        mode: 'index',
        intersect: false,
      },
    },
  };

  mounted () {
    this.callCreateChart();
    this.getData();
  }

  callCreateChart() {
    this.createChart('#adsPerDayChart', this.adsPerDayChartOptions, 'adsPerDayChart');
  }

  getData() {
    if (!this.gettingData) {
      this.gettingData = true;
      const dayQuery = new PubStatsAvgPricesPerSqrMeterPerMonthQuery();
      dayQuery.interval.max = new Date();
      dayQuery.interval.min = new Date();
      dayQuery.interval.min.setDate(dayQuery.interval.max.getDate() - 14);
      $pubs.stats.getPublicationsCountPerDay(dayQuery)
        .then((res) => {
          this.data = res;
          this.gettingData = false;
          this.parseData(this.diagram.options.stats);
        });
    }
  }

  parseData(stats: 'unrestricted' | 'workspace') {
    this.resetData();
    const data = this.data[stats];
    const today = new Date();
    if (data.items.slice(-1)[0]) {
      const lastItemDate = data.items.slice(-1)[0].date.getTime();
      data.items.forEach((item) => {
        const formatedLabel = moment(item.date).format('D');
        if (!this.adsPerDayChartOptions.data.labels.includes(formatedLabel) && item.date.getTime() !== lastItemDate) {
          this.adsPerDayChartOptions.data.labels.push(formatedLabel);
        }
        if (formatedLabel === moment(today).format('D')) {
          this.newAdsPerDay = item.buyCount + item.rentCount;
        }
        this.adsPerDayChartOptions.data.datasets[0].data[this.adsPerDayChartOptions.data.labels.indexOf(formatedLabel)] = item.buyCount;
        this.adsPerDayChartOptions.data.datasets[1].data[this.adsPerDayChartOptions.data.labels.indexOf(formatedLabel)] = item.rentCount;
      });
    }
    if (this.adsPerDayChart) {
      this.adsPerDayChart.update();
    }
  }

  updateStats(stats: 'unrestricted' | 'workspace') {
    this.parseData(stats);
    this.updateGlobalStatus(this.diagram, stats);
  }

  resetData() {
    this.newAdsPerDay = 0;
    this.adsPerDayChartOptions.data.datasets[0].data = [];
    this.adsPerDayChartOptions.data.datasets[1].data = [];
  }
}
