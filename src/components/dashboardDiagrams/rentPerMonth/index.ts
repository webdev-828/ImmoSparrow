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
import { Chart, CurrentRent, ChartData, Diagram } from '../interfaces';

@Component({
  name: 'RentPerMonth',
  mixins: [template],
})
export default class RentPerMonth extends mixins(DashboardMixin) {
  @Prop()
  diagram: Diagram;

  data: IWorkspacePubStats<PubStatsAvgPricesPerSqrMeterPerMonthModel>;

  gettingData: boolean = false;

  currentRent: CurrentRent = {
    house: '0',
    apartment: '0',
  };

  rentPerMonth?: Chart;
  rentPerMonthOptions: ChartData = {
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

  mounted () {
    this.callCreateChart();
    this.getData();
  }

  callCreateChart() {
    this.createChart('#rentPerMonth', this.rentPerMonthOptions, 'rentPerMonth');
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
          if (res) {
            this.data = res;
            this.gettingData = false;
            this.parseData(this.diagram.options.stats);
          }
        });
    }
  }

  parseData(stats: 'unrestricted' | 'workspace') {
    const data = this.data[stats];
    const currentMonth = moment().format('MMM');
    let excludeLastMonth = false;
    data.rent.house.points.forEach((point: DataPointOfStatsAvgValueExtOfDouble) => {
      const diff = Math.round(moment.duration(moment().diff(moment(point.timeUtc))).asDays());
      const formatedLabel = moment(point.timeUtc).format('MMM');
      if (currentMonth === formatedLabel && diff <= 10) {
        excludeLastMonth = true;
      } else {
        if (!this.rentPerMonthOptions.data.labels.includes(formatedLabel)) {
          this.rentPerMonthOptions.data.labels.push(formatedLabel);
        }
        this.rentPerMonthOptions.data.datasets[0].data[this.rentPerMonthOptions.data.labels.indexOf(formatedLabel)] = point.value.avg.toFixed(2);
      }
    });
    if (data.rent.house.points.length) {
      if (excludeLastMonth) {
        this.currentRent.house = data.rent.house.points[data.rent.house.points.length - 2].value.avg.toFixed(2);
      } else {
        this.currentRent.house = data.rent.house.points[data.rent.house.points.length - 1].value.avg.toFixed(2);
      }
    }
    excludeLastMonth = false;
    data.rent.apartment.points.forEach((point: DataPointOfStatsAvgValueExtOfDouble) => {
      const diff = Math.round(moment.duration(moment().diff(moment(point.timeUtc))).asDays());
      const formatedLabel = moment(point.timeUtc).format('MMM');
      if (currentMonth === formatedLabel && diff <= 10) {
        excludeLastMonth = true;
      } else {
        if (!this.rentPerMonthOptions.data.labels.includes(formatedLabel)) {
          this.rentPerMonthOptions.data.labels.push(formatedLabel);
        }
        this.rentPerMonthOptions.data.datasets[1].data[this.rentPerMonthOptions.data.labels.indexOf(formatedLabel)] = point.value.avg.toFixed(2);
      }
    });
    if (data.rent.apartment.points.length) {
      if (excludeLastMonth) {
        this.currentRent.apartment = data.rent.apartment.points[data.rent.apartment.points.length - 2].value.avg.toFixed(2);
      } else {
        this.currentRent.apartment = data.rent.apartment.points[data.rent.apartment.points.length - 1].value.avg.toFixed(2);
      }
    }
    if (this.rentPerMonth) {
      this.rentPerMonth.update();
    }
  }

  updateStats(stats: 'unrestricted' | 'workspace') {
    this.parseData(stats);
    this.updateGlobalStatus(this.diagram, stats);
  }
}
