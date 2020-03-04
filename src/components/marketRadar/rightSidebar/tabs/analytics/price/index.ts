import { Component } from 'vue-property-decorator';
import { mixins } from 'vue-class-component';
import template from './PriceAnalyticsTemplate.vue';
import store from '@/store';
import { getMarketRadarModel, getPricePrediction, getStatistics } from '@/store/modules/marketRadar';
import { MarketRadarModel, BarChartSource } from '@/models';
import GlobalMixin from '@/mixins/global';

@Component({
  mixins: [template],
})
export default class PriceAnalyticsTab extends mixins(GlobalMixin) {
  get marketRadarModel(): MarketRadarModel {
    return getMarketRadarModel(store);
  }
  get prediction() {
    return getPricePrediction(store);
  }
  get statistics() {
    return getStatistics(store);
  }
  get countryStats() {
    return this.statistics.country;
  }
  get cantonStats() {
    return this.statistics.canton;
  }
  get adsStats() {
    return this.statistics.ads;
  }
  get averagePricesChartSource(): BarChartSource[] {
    const country = this.prepareChartValue(this.countryStats?.avgPrice);
    const canton = this.prepareChartValue(this.cantonStats?.avgPrice);
    const ads = this.prepareChartValue(this.adsStats?.avgPrice);
    return [
      {
        color: '#ff6b6b',
        value: country,
        legend: 'Switzerland',
        legendValue: this.formatMoney(country),
      },
      {
        color: '#516173',
        value: canton,
        legend: 'Canton',
        legendValue: this.formatMoney(canton),
      },
      {
        color: '#c5d0de',
        value: ads,
        legend: 'Ads',
        legendValue: this.formatMoney(ads),
      },
    ];
  }
  get averageSqrtPricesChartSource(): BarChartSource[] {
    const country = this.prepareChartValue(this.countryStats?.avgPricePerSqrMeter);
    const canton = this.prepareChartValue(this.cantonStats?.avgPricePerSqrMeter);
    const ads = this.prepareChartValue(this.adsStats?.avgPricePerSqrMeter);
    return [
      {
        color: '#ff6b6b',
        value: country,
        legend: 'Switzerland',
        legendValue: this.formatMoney(country),
      },
      {
        color: '#516173',
        value: canton,
        legend: 'Canton',
        legendValue: this.formatMoney(canton),
      },
      {
        color: '#c5d0de',
        value: ads,
        legend: 'Ads',
        legendValue: this.formatMoney(ads),
      },
    ];
  }
  get pricePercentDecrease(): BarChartSource[] {
    const country = this.prepareChartValue(this.countryStats?.priceDecreasedPercentage);
    const canton = this.prepareChartValue(this.cantonStats?.priceDecreasedPercentage);
    const ads = this.prepareChartValue(this.adsStats?.priceDecreasedPercentage);
    return [
      {
        color: '#ff6b6b',
        value: country,
        legend: 'Switzerland',
        legendValue: `${country}%`,
      },
      {
        color: '#516173',
        value: canton,
        legend: 'Canton',
        legendValue: `${canton}%`,
      },
      {
        color: '#c5d0de',
        value: ads,
        legend: 'Ads',
        legendValue: `${ads}%`,
      },
    ];
  }
  get pricePercentIncrease(): BarChartSource[] {
    const country = this.prepareChartValue(this.countryStats?.priceIncreasedPercentage);
    const canton = this.prepareChartValue(this.cantonStats?.priceIncreasedPercentage);
    const ads = this.prepareChartValue(this.adsStats?.priceIncreasedPercentage);
    return [
      {
        color: '#ff6b6b',
        value: country,
        legend: 'Switzerland',
        legendValue: `${country}%`,
      },
      {
        color: '#516173',
        value: canton,
        legend: 'Canton',
        legendValue: `${canton}%`,
      },
      {
        color: '#c5d0de',
        value: ads,
        legend: 'Ads',
        legendValue: `${ads}%`,
      },
    ];
  }

  prepareChartValue(value: number) {
    return Math.round(value || null);
  }
}
