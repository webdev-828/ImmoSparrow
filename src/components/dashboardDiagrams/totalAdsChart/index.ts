import Vue from 'vue';
import { Prop } from 'vue-property-decorator';
import template from './index.template.vue';
import Base from '../../base';
import {
  $pubs,
  IWorkspacePubStats,
  PubPublisherClass,
  PubStatsPubCountPerPublisherClassModel,
} from '@immosparrow/cockpit-api-v2';
import DashboardMixin from '../../../mixins/dashboard';
import Component, { mixins } from 'vue-class-component';
import { Chart, ChartData, Diagram } from '../interfaces';
import set = Reflect.set;

@Component({
  name: 'TotalAdsChart',
  mixins: [template],
})
export default class TotalAdsChart extends mixins(DashboardMixin) {
  @Prop()
  diagram: Diagram;

  data: IWorkspacePubStats<PubStatsPubCountPerPublisherClassModel>;
  dataset: number[] | Chart.ChartPoint[] = [];

  gettingData: boolean = false;

  totalAdsChart?: Chart;
  totalAdsChartOptions: ChartData = {
    type: 'doughnut',
    data: {
      labels: ['Professional', 'Non-Professional', 'Unknown', 'Uncertain', 'NotProcessed'],
      datasets: [
        {
          label: 'Total ads count',
          data: [0, 0, 0, 0, 0],
          backgroundColor: [
            '#75B0EB',
            '#ABE37D',
            '#c9c9c9',
            '#f3b760',
            '#FAD02C',
          ],
          borderWidth: [1, 1, 1, 1, 1],
        },
      ],
    },
    options: {
      plugins: {
        datalabels: {
          clamp: true,
          display: true,
          formatter: (value: any, ctx: any) => {
            let sum = 0;
            const dataArr = ctx.chart.data.datasets[0].data;
            dataArr.map((data: any) => {
              sum += data;
            });
            const percentage = `${(value * 100 / sum).toFixed(1)}%`;
            return percentage;
          },
          color: '#fff',
          font: {
            size: 9,
            weight: 'bold',
          },
        },
      },
      tooltips: {
        callbacks: {
          label(tooltipItem: any, data: any) {
            return data['datasets'][0]['data'][tooltipItem['index']].toLocaleString(undefined, { maximumFractionDigits: 2 }) || '0';
          },
        },
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
    this.createChart('#totalAdsChart', this.totalAdsChartOptions, 'totalAdsChart');
  }

  getData() {
    if (!this.gettingData) {
      this.gettingData = true;
      $pubs.stats.getPublicationsCountPerPublisherClass()
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
    data.results.forEach((item) => {
      if (item.isActive) {
        switch (item.publisherClass) {
          case PubPublisherClass.Unknown: // Unknown
            this.totalAdsChartOptions.data.datasets[0].data[2] += item.count;
            break;
          case PubPublisherClass.Professional:
            this.totalAdsChartOptions.data.datasets[0].data[0] += item.count;
            break;
          case PubPublisherClass.NonProfessional:
            this.totalAdsChartOptions.data.datasets[0].data[1] += item.count;
            break;
          case PubPublisherClass.Uncertain: // Uncertain
            this.totalAdsChartOptions.data.datasets[0].data[3] += item.count;
            break;
          case PubPublisherClass.NotProcessed:
            this.totalAdsChartOptions.data.datasets[0].data[4] += item.count;
            break;
        }
      }
    });
    this.dataset = this.totalAdsChartOptions.data.datasets[0].data;

    if (this.totalAdsChart) {
      this.totalAdsChart.update();
    }
  }

  updateStats(stats: 'unrestricted' | 'workspace') {
    this.parseData(stats);
    this.updateGlobalStatus(this.diagram, stats);
  }

  resetData() {
    const data = this.totalAdsChartOptions.data.datasets[0].data;
    if (data) {
      data.forEach((value: number, i: number) => data[i] = 0);
    }
    this.dataset = [];
  }
}
