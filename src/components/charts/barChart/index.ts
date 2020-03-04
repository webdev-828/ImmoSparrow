import { Component, Prop, Vue, Watch } from 'vue-property-decorator';
import { mixins } from 'vue-class-component';
import template from './BarChartTemplate.vue';
import { BarChartSource } from '@/models';
import ChartMixin from '@/mixins/chart';

@Component({
  mixins: [template],
})
export default class BarChartComponent extends mixins(ChartMixin) {
  @Prop({ required: true })
  source: BarChartSource[];
  @Prop({ required: true })
  title: string;
  @Prop({ required: true })
  chartId: string;

  mounted() {
    this.renderChart();
  }

  get validItems() {
    return this.source.filter(x => !!x.value);
  }
  get chartOptions(): any {
    return {
      type: 'bar',
      data: {
        labels: this.pluckField('legend'),
        datasets: [{
          data: this.pluckField('value'),
          borderColor: [
            'rgba(0, 0, 0, .02)',
            'rgba(0, 0, 0, .02)',
            'rgba(0, 0, 0, .02)',
          ],
          backgroundColor: this.pluckField('color'),
          borderWidth: [2, 2, 2],
        }],
      },
      options: {
        scales: {
          yAxes: [{
            display: true,
            ticks: { beginAtZero: true },
          }],
          xAxes: [{
            display: false,
            ticks: { fontSize: 10 },
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
  }

  pluckField(field: string) {
    return this.source.map(item => item[field]);
  }
  renderChart() {
    this.createChart(`#${this.chartId}`, this.chartOptions, 'Average Prices');
  }

  @Watch('source')
  onSourceChanged() {
    this.renderChart();
  }
}
