import Vue from 'vue';
import Component from 'vue-class-component';
import { DoughnutChartItem } from '@models/charts';
import Chart from 'chart.js';

@Component
export default class ChartMixin extends Vue {
  doughnutGraphOptions: any = {
    type: 'doughnut',
    data: {
      labels: [],
      datasets: [{
        label: null,
        data: [],
        backgroundColor: [],
        borderWidth: [],
      }],
    },
    options: {
      tooltips: {
        callbacks: {},
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
  createChart(chartId: any, chartData: any, chartName: string) {
    const context = document.querySelector(chartId);
    if (context) {
      if (this[chartName]) {
        this[chartName].destroy();
      }
      this[chartName] = new Chart(context, {
        type: chartData.type,
        data: chartData.data,
        options: chartData.options,
      });
    }
  }
}
