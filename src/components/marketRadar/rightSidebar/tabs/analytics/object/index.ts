import { Component, Watch } from 'vue-property-decorator';
import { mixins } from 'vue-class-component';
import template from './ObjectAnalyticsTemplate.vue';
import ChartMixin from '@/mixins/chart';
import { getPropertyCategories, getSimilarObjects } from '@store/modules/marketRadar';
import store from '@store';
import { Publication } from '@/models';
import { DoughnutChartItem } from '@models/charts';
import { IPubPropertyCategory, IPubPropertyType, PubPropertyType } from '@immosparrow/cockpit-api-v2';

@Component({
  mixins: [template],
})
export default class ObjectAnalyticsTab extends mixins(ChartMixin) {
  chart: Chart = null;

  mounted() {
    if (this.propertyCategories.length) {
      this.renderChart();
    }
  }

  get ads(): Publication[] {
    return getSimilarObjects(store);
  }
  get selectedAds(): Publication[] {
    return this.ads.filter((ad: Publication) => ad.selected);
  }
  get selectedPropertyTypeIds(): string[] {
    const allSelectedPropertyIds = this.selectedAds.map((publication: Publication) => {
      return publication?.primaryInfo?.basicInfo?.propertyTypeId || null;
    });
    return [... new Set(allSelectedPropertyIds)];
  }
  get propertyCategories(): IPubPropertyCategory[] {
    return getPropertyCategories(store);
  }

  getPropertyTypeById(id: string): PubPropertyType {
    let foundPropertyType = null;
    this.propertyCategories.forEach((propertyCategory: IPubPropertyCategory) => {
      propertyCategory.propertyTypes.forEach((propertyType: IPubPropertyType) => {
        if (propertyType.id === id) {
          foundPropertyType = propertyType;
        }
      });
    });
    return foundPropertyType;
  }
  countSelectedAdsWithId(id: string): number {
    return this.selectedAds.filter((ad: Publication) => {
      return ad?.primaryInfo?.basicInfo?.propertyTypeId === id;
    }).length;
  }
  generateChartData(chartItems: DoughnutChartItem[]) {
    this.doughnutGraphOptions.data.labels = [];
    this.doughnutGraphOptions.data.datasets = [{
      label: null,
      data: [],
      backgroundColor: [],
      borderWidth: [],
    }];
    this.selectedPropertyTypeIds.forEach((id: string) => {
      const propertyType: PubPropertyType = this.getPropertyTypeById(id);
      if (propertyType) {
        this.doughnutGraphOptions.data.labels.push(propertyType.name);
      }
    });
    chartItems.forEach((item: DoughnutChartItem) => {
      const dataSet = this.doughnutGraphOptions.data.datasets[0];
      dataSet.data.push(item.count);
      dataSet.backgroundColor.push(item.backgroundColor);
      dataSet.borderWidth.push(0);
    });
  }
  renderChart() {
    this.createChart('#propertyTypes', this.doughnutGraphOptions, 'propertyTypes');
  }

  @Watch('selectedAds', { immediate: true })
  onSelectedAdsChange() {
    if (this.selectedAds && this.propertyCategories.length) {
      let hue = 0;
      const colorStep = Math.floor(310 / this.selectedPropertyTypeIds.length);
      const chartData: DoughnutChartItem[] = [];
      this.selectedPropertyTypeIds.forEach((id: string) => {
        const propertyType: PubPropertyType = this.getPropertyTypeById(id);
        chartData.push(new DoughnutChartItem(propertyType.name, hue, this.countSelectedAdsWithId(id)));
        hue += colorStep;
      });
      this.generateChartData(chartData);
      this.renderChart();
    }
  }
}
