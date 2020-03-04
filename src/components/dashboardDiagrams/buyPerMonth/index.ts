import Vue from 'vue';
import { Prop } from 'vue-property-decorator';
import template from './index.template.vue';
import Base from '../../base';
import {
  $newObj,
  $pubs, DataPointOfStatsAvgValueExtOfDouble, IWorkspacePubStats,
  PubPublisherClass, PubStatsAvgPricesPerSqrMeterPerMonthModel,
  PubStatsAvgPricesPerSqrMeterPerMonthQuery, PubStatsCompetitorComparisonModel, PubStatsGeoLocalizedPubCountQuery,
} from '@immosparrow/cockpit-api-v2';
import DashboardMixin from '../../../mixins/dashboard';
import Component, { mixins } from 'vue-class-component';
import moment from 'moment';
import { formatDBNumbers } from '../../sharedFunctions';
import { ChartData, CurrentBuy, Chart, Diagram } from '../interfaces';

@Component({
  name: 'BuyPerMonth',
  mixins: [template],
})
export default class BuyPerMonth extends mixins(DashboardMixin) {
  @Prop()
  diagram: Diagram;

  data: IWorkspacePubStats<PubStatsAvgPricesPerSqrMeterPerMonthModel>;

  currentBuy: CurrentBuy = {
    house: 0,
    apartment: 0,
  };

  buyPerMonth?: Chart;
  buyPerMonthOptions: ChartData = {
    type: 'line',
    data: {
      labels: [],
      datasets: [
        {
          label: 'House',
          data: [],
          borderColor: 'rgb(92,144,210)',
          backgroundColor: 'rgba(92,144,210,0.2)',
        },
        {
          label: 'Apartment',
          data: [],
          borderColor: 'rgb(210,106,93)',
          backgroundColor: 'rgba(210,106,93,0.2)',
        },
      ],
    },
    options: {
      scales: {
        yAxes: [{
          display: true,
          ticks: {
            fontSize: 10,
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

  gettingData: boolean = false;

  mounted () {
    this.callCreateChart();
    this.getData();
  }

  callCreateChart() {
    this.createChart('#buyPerMonth', this.buyPerMonthOptions, 'buyPerMonth');
  }

  getData() {
    if (!this.gettingData) {
      this.gettingData = true;
      const query = new PubStatsAvgPricesPerSqrMeterPerMonthQuery();
      query.interval.max = new Date();
      query.interval.min = new Date();
      query.interval.min.setMonth(query.interval.min.getMonth() - 11);
      $pubs.stats.getPublicationsAveragePricesPerSqrMeterPerMonth(query)
        .then((res) => {
          this.gettingData = false;
          if (res) {
            this.data = res;
            this.parseData(this.diagram.options.stats);
          }
        });
    }
  }

  parseData(stats: 'unrestricted' | 'workspace') {
    const data = this.data[stats];
    const currentMonth = moment().format('MMM');
    let excludeLastMonth = false;
    data.buy.house.points.forEach((point: DataPointOfStatsAvgValueExtOfDouble) => {
      const formatedLabel = moment(point.timeUtc).format('MMM');
      const diff = Math.round(moment.duration(moment().diff(moment(point.timeUtc))).asDays());
      if (currentMonth === formatedLabel && diff <= 10) {
        excludeLastMonth = true;
      } else {
        if (!this.buyPerMonthOptions.data.labels.includes(formatedLabel)) {
          this.buyPerMonthOptions.data.labels.push(formatedLabel);
        }
        this.buyPerMonthOptions.data.datasets[0].data[this.buyPerMonthOptions.data.labels.indexOf(formatedLabel)] = Math.floor(point.value.avg);
      }
    });
    if (data.buy.house.points.length) {
      if (excludeLastMonth) {
        this.currentBuy.house = Math.floor(data.buy.house.points[data.buy.house.points.length - 2].value.avg);
      } else {
        this.currentBuy.house = Math.floor(data.buy.house.points[data.buy.house.points.length - 1].value.avg);
      }
    }
    excludeLastMonth = false;
    data.buy.apartment.points.forEach((point: DataPointOfStatsAvgValueExtOfDouble) => {
      const diff = Math.round(moment.duration(moment().diff(moment(point.timeUtc))).asDays());
      const formatedLabel = moment(point.timeUtc).format('MMM');
      if (currentMonth === formatedLabel && diff <= 10) {
        excludeLastMonth = true;
      } else {
        if (!this.buyPerMonthOptions.data.labels.includes(formatedLabel)) {
          this.buyPerMonthOptions.data.labels.push(formatedLabel);
        }
        this.buyPerMonthOptions.data.datasets[1].data[this.buyPerMonthOptions.data.labels.indexOf(formatedLabel)] = Math.floor(point.value.avg);
      }
    });
    if (data.buy.apartment.points.length) {
      if (excludeLastMonth) {
        this.currentBuy.apartment = Math.floor(data.buy.apartment.points[data.buy.apartment.points.length - 2].value.avg);
      } else {
        this.currentBuy.apartment = Math.floor(data.buy.apartment.points[data.buy.apartment.points.length - 1].value.avg);
      }
    }
    if (this.buyPerMonth) {
      this.buyPerMonth.update();
    }
  }

  updateStats(stats: 'unrestricted' | 'workspace') {
    this.parseData(stats);
    this.updateGlobalStatus(this.diagram, stats);
  }
}
