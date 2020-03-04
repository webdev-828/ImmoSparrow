import Vue from 'vue';
import { Prop } from 'vue-property-decorator';
import template from './index.template.vue';
import Base from '../../base';
import {
  $newObj,
  $pubs, IWorkspacePubStats,
  PubPublisherClass,
  PubStatsAvgPricesPerSqrMeterPerMonthQuery, PubStatsGeoLocalizedPubCountModel, PubStatsGeoLocalizedPubCountQuery,
} from '@immosparrow/cockpit-api-v2';
import DashboardMixin from '../../../mixins/dashboard';
import Component, { mixins } from 'vue-class-component';
import moment from 'moment';
import { formatDBNumbers } from '../../sharedFunctions';
import { ChartData, Chart, Diagram } from '../interfaces';

@Component({
  name: 'GeoLocalChart',
  mixins: [template],
})
export default class GeoLocalChart extends mixins(DashboardMixin) {
  @Prop()
  diagram: Diagram;

  data: IWorkspacePubStats<PubStatsGeoLocalizedPubCountModel>;
  dataset: number[] | Chart.ChartPoint[] = [];
  totalCount: number = 0;

  gettingData: boolean = false;

  geoLocalChart?: Chart;
  geoLocalChartOptions: ChartData = {
    type: 'doughnut',
    data: {
      labels: ['Exact', 'GeoLocalized', 'Inaccurate'],
      datasets: [
        {
          label: 'Total ads count',
          data: [0, 0, 0],
          backgroundColor: [
            '#FAD02C',
            '#00A081',
            '#B3AA99',
          ],
          borderWidth: [1, 1, 1],
        },
      ],
    },
    options: {
      plugins: {
        datalabels: {
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
    this.createChart('#geoLocalChart', this.geoLocalChartOptions, 'geoLocalChart');
  }

  getData() {
    if (!this.gettingData) {
      this.gettingData = true;
      const geoQuery = $newObj(PubStatsGeoLocalizedPubCountQuery);
      geoQuery.startDate = new Date();
      geoQuery.startDate.setDate(geoQuery.startDate.getDate() - 7);
      $pubs.stats.getGeoLocalizedPubCount(geoQuery)
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
    this.geoLocalChart.data.datasets[0].data[0] = data.exactCount;
    this.geoLocalChart.data.datasets[0].data[1] = data.geoLocalizedCount;
    this.geoLocalChart.data.datasets[0].data[2] = data.nonGeoLocalizedCount;
    this.dataset = this.geoLocalChart.data.datasets[0].data;
    this.totalCount  = data.totalCount;
    if (this.geoLocalChart) {
      this.geoLocalChart.update();
    }
  }

  updateStats(stats: 'unrestricted' | 'workspace') {
    this.parseData(stats);
    this.updateGlobalStatus(this.diagram, stats);
  }

  resetData() {
    this.dataset = [];
    this.totalCount = 0;
  }
}
