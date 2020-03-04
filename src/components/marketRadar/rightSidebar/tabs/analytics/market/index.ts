import { Component, Watch, Vue } from 'vue-property-decorator';
import template from './MarketAnalyticsTemplate.vue';
import { PubStatsPubCountPerQuarterModel } from '@immosparrow/cockpit-api-v2';
import store from '@store';
import { getSimilarObjects, getStatistics } from '@/store/modules/marketRadar';
import { MinMax } from '@/models';
import _ from 'lodash';

@Component({
  mixins: [template],
})
export default class MarketAnalyticsTab extends Vue {
  marketAnyQuarterComparision: boolean = false;
  marketAnyDataset: Object = null;
  marketAnyYearMax: number = null;
  marketAnyChange: number = null;
  marketAnyAverage: number = null;
  marketAnyAmplitude: MinMax = null;
  marketOnlyActiveQuarterComparision: boolean = false;
  marketOnlyActiveDataset: Object = null;
  marketOnlyActiveYearMax: number = null;
  marketOnlyActiveChange: number = null;
  marketOnlyActiveAverage: number = null;
  marketOnlyActiveAmplitude: MinMax = null;

  get statistics() {
    return getStatistics(store);
  }
  get marketAny() {
    return this.statistics.market.all;
  }
  get marketOnlyActive() {
    return this.statistics.market.onlyActive;
  }

  calculateQuarterDiff(stats: PubStatsPubCountPerQuarterModel[], maxYear: number) {
    const previousYear = stats.find(x => x.year === maxYear - 1 && x.quarterNumber === 1);
    const currentYear = stats.find(x => x.year === maxYear && x.quarterNumber === 1);

    if (!currentYear || !previousYear) return null;
    const diff = ((currentYear.count / previousYear.count) - 1) * 100;

    return diff;
  }
  calculateAverageValue(stats: PubStatsPubCountPerQuarterModel[]) {
    const sum = _.sumBy(stats, 'count');
    return sum / stats.length;
  }
  calculateChartOffset(stats: PubStatsPubCountPerQuarterModel[]) {
    const values = _.map(stats, 'count');
    let min = Math.min(...values) - 100;
    let max = Math.max(...values) + 100;
    max = Math.ceil(max / 100) * 100;
    min = Math.floor(min / 100) * 100;
    if (min < 0) {
      min = 0;
    }
    return { min, max };
  }
  createChartDataset(stats: PubStatsPubCountPerQuarterModel[]) {
    const dataset: { [key: string]: number } = {};
    stats.slice().reverse().forEach((record) => {
      const key = `Q${record.quarterNumber}\`${record.year - 2000}\``;
      dataset[key] = record.count;
    });

    return dataset;
  }

  @Watch('marketAny', { immediate: true, deep: true })
  onMarketAnyStatisticsLoaded() {
    if (!this.marketAny.length) return;
    this.marketAnyDataset = null;
    this.marketAnyChange = null;
    this.marketAnyAverage = null;
    this.marketAnyAmplitude = null;
    this.marketAnyYearMax = this.marketAny[0].year;

    const calculation = this.calculateQuarterDiff(this.marketAny, this.marketAnyYearMax);
    this.marketAnyDataset = this.createChartDataset(this.marketAny);
    this.marketAnyAmplitude = this.calculateChartOffset(this.marketAny);
    this.marketAnyAverage = this.calculateAverageValue(this.marketAny);
    this.marketAnyQuarterComparision = !!calculation;

    if (calculation !== null) {
      this.marketAnyChange = calculation;
    }
  }

  @Watch('marketOnlyActive', { immediate: true, deep: true })
  onMarketOnlyActiveStatisticsLoaded() {
    if (!this.marketOnlyActive.length) return;
    this.marketOnlyActiveDataset = null;
    this.marketOnlyActiveChange = null;
    this.marketOnlyActiveAverage = null;
    this.marketOnlyActiveAmplitude = null;
    this.marketOnlyActiveYearMax = this.marketOnlyActive[0].year;

    const calculation = this.calculateQuarterDiff(this.marketOnlyActive, this.marketOnlyActiveYearMax);
    this.marketOnlyActiveDataset = this.createChartDataset(this.marketOnlyActive);
    this.marketOnlyActiveAmplitude = this.calculateChartOffset(this.marketOnlyActive);
    this.marketOnlyActiveAverage = this.calculateAverageValue(this.marketOnlyActive);
    this.marketOnlyActiveQuarterComparision = !!calculation;

    if (calculation !== null) {
      this.marketOnlyActiveChange = calculation;
    }
  }
}
