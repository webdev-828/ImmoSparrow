import Vue from 'vue';
import Component from 'vue-class-component';
import Chart from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import { formatDBNumbers } from '../components/sharedFunctions';
import { Diagram } from '../components/dashboardDiagrams/interfaces';

@Component
export default class DashboardMixin extends Vue {
  formatDBNumbers: Function = formatDBNumbers;

  createChart(chartId: any, chartData: any, chartName: string) {
    const ctx = document.querySelector(chartId);
    if (ctx) {
      this[chartName] = new Chart(ctx, {
        plugins: [ChartDataLabels],
        type: chartData.type,
        data: chartData.data,
        options: chartData.options,
      });
    }
  }

  updateGlobalStatus(item: Diagram, newStatus: 'unrestricted' | 'workspace') {
    item.options.stats = newStatus;
    this.$emit('saveDiagramsStatus');
  }
}
