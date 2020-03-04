import Vue from 'vue';
import { Prop } from 'vue-property-decorator';
import template from './index.template.vue';
import Base from '../../base';
import {
  $newObj,
  $pubs, IWorkspacePubStats,
  PubPublisherClass,
  PubStatsAvgPricesPerSqrMeterPerMonthQuery, PubStatsCompetitorComparisonModel, PubStatsGeoLocalizedPubCountQuery,
} from '@immosparrow/cockpit-api-v2';
import DashboardMixin from '../../../mixins/dashboard';
import Component, { mixins } from 'vue-class-component';
import moment from 'moment';
import { formatDBNumbers } from '../../sharedFunctions';
import { ChartData, Chart, Diagram } from '../interfaces';

@Component({
  name: 'CompetitorComparisonChart',
  mixins: [template],
})
export default class CompetitorComparisonChart extends mixins(DashboardMixin) {
  @Prop()
  diagram: Diagram;

  data: IWorkspacePubStats<PubStatsCompetitorComparisonModel>;
  competitorComparison: PubStatsCompetitorComparisonModel = $newObj(PubStatsCompetitorComparisonModel);

  gettingData: boolean = false;

  competitorComparisonChart?: Chart;
  competitorComparisonChartOptions: ChartData = {
    type: 'doughnut',
    data: {
      labels: ['Immosparrow Only', 'MetaSearches'],
      datasets: [
        {
          data: [0, 0],
          backgroundColor: [
            '#75B0EB',
            '#EA8FE3',
          ],
          borderWidth: [1, 1],
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
            const percentage = value > 0 ? `${(value * 100 / sum).toFixed(1)}%` : '';
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
      },
    },
  };

  mounted () {
    this.callCreateChart();
    this.getData();
  }

  callCreateChart() {
    this.createChart('#competitorComparisonChart', this.competitorComparisonChartOptions, 'competitorComparisonChart');
  }

  getData() {
    if (!this.gettingData) {
      this.gettingData = true;
      $pubs.stats.getCompetitorComparison()
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
    this.competitorComparisonChartOptions.data.datasets[0].data[0] = data.immoSparrowActiveCount;
    this.competitorComparison = data;
    this.competitorComparisonChartOptions.data.datasets[0].data[1] = data.metaSearchActiveCount;
    if (this.competitorComparisonChart) {
      this.competitorComparisonChart.update();
    }
  }

  updateStats(stats: 'unrestricted' | 'workspace') {
    this.parseData(stats);
    this.updateGlobalStatus(this.diagram, stats);
  }

  resetData() {
    const data = this.competitorComparisonChartOptions.data.datasets[0].data;
    if (data) {
      data.forEach((value: number, i: number) => data[i] = 0);
    }
  }
}
