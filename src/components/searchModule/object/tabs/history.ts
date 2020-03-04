import { Component, Watch, Prop } from 'vue-property-decorator';
import Base from '../../../base';
import template from './history.template.vue';
import autocomplete from '../../../addressAutocomplete';
import modal from '../../../modal';
import VueSlider from 'vue-slider-component';
import Chart from 'chart.js';
import RadialProgress from './../../../transparencyModule/radial.progress.vue';
import { formatDate, getVendorClass, formatPrice, getPersonName } from '../../../sharedFunctions';
import {
  IPubSiteStatusInfo, IPubSiteModel, IPubPublisherModel, PubModel,
  IPubPublisherStatusInfo, PubSiteInfo, mval as val, PubSiteCostType,
} from '@immosparrow/cockpit-api-v2';
import * as searchModule from '../../../../store/modules/searchModule';
import store from '../../../../store';
import moment from 'moment';
import GetTimeUtc from '../../../getTimeUtc';
import PhoneMixin from '../../../../mixins/phoneParser';

interface Dates {
  dateStart: string;
  dateFinish: string;
  active: false;
}

interface TooltipsData {
  free: number[];
  paid: number[];
  private: number[];
  unknown: number[];
}

@Component({

  mixins: [template, PhoneMixin],
  components: {
    autocomplete,
    modal,
    VueSlider,
    GetTimeUtc,
    'radial-progress-bar': RadialProgress,
  },
})
export default class History extends Base {

  @Prop({ default: new PubModel() })
  item: PubModel;

  val: Function = val;
  formatDate: Function = formatDate;
  formatPrice: Function = formatPrice;
  getVendorClass: Function = getVendorClass;
  getPersonName: Function = getPersonName;

  diagramDynamicHeight = 200;

  @Prop({ default: false })
  showPortalsFS: boolean;

  @Prop({ default: false })
  showPriceFS: boolean;

  portalsCollapsed: boolean = false;
  vendorHistoryCollapsed: boolean = false;
  portalsInfo: { portal: IPubSiteModel, info: PubSiteInfo }[] = [];
  vendorsInfo: { vendor: IPubPublisherModel, info: IPubPublisherStatusInfo, show: boolean }[] = [];
  tooltipsData: any = {};
  publishersInfo: { info: IPubPublisherStatusInfo, show: false }[] = [];

  @Prop({ default: null })
  activeTooltipData: {
    title: string,
    data: TooltipsData,
  };

  portalsChartOptions: any = {
    type: 'line',
    data: {
      labels: [],
      datasets: [
        {
          type: 'line',
          // label: "Free",
          data: [],
          backgroundColor: '#999999',
          steppedLine: true,
        },
        {
          type: 'line',
          // label: "Paid",
          data: [],
          backgroundColor: '#5c90d2',
          steppedLine: true,
        },
        {
          type: 'line',
          // label: "NonPublic",
          data: [],
          backgroundColor: '#d26a5c',
          steppedLine: true,
        },
        {
          type: 'line',
          // label: "Unknown",
          data: [],
          backgroundColor: '#70b9eb',
          steppedLine: true,
        },
      ],
    },
    options: {
      responsive: true,
      legend: {
        display: false,
      },
      tooltips: {
        mode: 'index',
        intersect: false,
        enabled: false,
        custom: (tooltipModel: any) => {
          const tooltipEl = this.$refs.portalsChartTooltip;
          const fullScreenTooltip: any = this.$parent.$refs['fullScreenTooltip'];
          const chartEl = document.getElementById('portalsChart');
          const fullScreenEl = document.getElementById('fullScreenPortalsChart');

          if (tooltipModel.opacity.toString() === '0') {
            this.activeTooltipData.title = null;
            if (this.showPortalsFS) {
              fullScreenTooltip.style.opacity = '0';
            } else {
              tooltipEl.style.opacity = '0';
            }
            return;
          }
          if (tooltipModel.title) {
            if (this.showPortalsFS) {
              if (fullScreenEl.offsetWidth < tooltipModel.caretX + tooltipEl.offsetWidth) {
                fullScreenTooltip.style.left = 'initial';
                fullScreenTooltip.style.right = '0';
              } else {
                fullScreenTooltip.style.right = 'initial';
                fullScreenTooltip.style.left = `${tooltipModel.caretX}px`;
              }
            } else {
              if (chartEl.offsetWidth < tooltipModel.caretX + tooltipEl.offsetWidth) {
                tooltipEl.style.left = 'initial';
                tooltipEl.style.right = '0';
              } else {
                tooltipEl.style.right = 'initial';
                tooltipEl.style.left = `${tooltipModel.caretX}px`;
              }
            }
            this.activeTooltipData.data = this.tooltipsData[tooltipModel.title[0]];
            this.activeTooltipData.title = tooltipModel.title[0];
            if (this.showPortalsFS) {
              fullScreenTooltip.style.opacity = '1';
              fullScreenTooltip.style.top = `${tooltipModel.caretY}px`;
            } else {
              tooltipEl.style.opacity = '1';
              tooltipEl.style.top = `${tooltipModel.caretY}px`;
            }
          }
        },
      },
      hover: {
        mode: 'index',
        intersect: false,
      },
      scales: {
        yAxes: [{
          ticks: {
            stepSize: 1,
            beginAtZero: true,
          },
          stacked: true,
        }],
        xAxes: [
          {
            ticks: {
              beginAtZero: true,
              source: 'labels',
              autoSkip: true,
              // minRotation: 20,
              autoSkipPadding: 200,
              padding: 10,
              // maxTicksLimit: 5,
            },
            display: true,
            type: 'time',
            time: {
              parser: 'DD.MM.YYYY',
              tooltipFormat: 'DD.MM.YYYY',
              unit: 'day',
              stepSize: 1,
              displayFormats: {
                day: 'DD.MM.YYYY',
              },
            },
          },
        ],
      },
    },
  };

  priceChartOptions: any = {
    type: 'line',
    data: {
      labels: [],
      datasets: [{
        label: 'Price',
        data: [],
        borderColor: 'rgb(92,144,210)',
        backgroundColor: 'rgba(92,144,210,0.2)',
        steppedLine: true,
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
              return formatPrice(value);
            },
            suggestedMin: 0,
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
        callbacks: {
          label(tooltipItem: any, data: any) {
            const price = formatPrice(tooltipItem.yLabel);
            return `Price: ${price}`;
          },
        },
      },
      hover: {
        mode: 'index',
        intersect: false,
      },
    },
  };

  myChart: any = null;
  priceChart: any = null;

  mounted() {
    this.createChart('#portalsChart', this.portalsChartOptions, 'myChart');
    this.createChart('#priceChart', this.priceChartOptions, 'priceChart');
    this.setPortalsChartHeight();
  }

  setPortalsChartHeight() {
    const countData = this.portalsChartOptions.data.datasets.length;
    if (countData > 9) {
      this.diagramDynamicHeight = 200 + (10 * countData - 9);
    } else {
      this.diagramDynamicHeight = 200;
    }
  }

  createChart(chartId: any, chartData: any, chartName: string) {
    const ctx = document.querySelector(chartId);
    if (ctx) {
      this[chartName] = new Chart(ctx, {
        type: chartData.type,
        data: chartData.data,
        options: chartData.options,
      });
    }
  }

  @Watch('item', { immediate: true, deep: true })
  loadData() {
    this.portalsInfo = [];
    this.vendorsInfo = [];
    this.portalsChartOptions.data.labels = [];
    this.portalsChartOptions.data.datasets[0].data = [];
    this.portalsChartOptions.data.datasets[1].data = [];
    this.portalsChartOptions.data.datasets[2].data = [];
    this.portalsChartOptions.data.datasets[3].data = [];
    this.priceChartOptions.data.labels = [];
    this.priceChartOptions.data.datasets[0].data = [];
    this.publishersInfo = [];

    const ph = this.item.trackingInfo.getPriceHistory(true);
    if (ph) {
      if (ph.points && ph.points.length) {
        ph.points.sort((a: any, b: any) => {
          return a.timeUtc - b.timeUtc;
        });
        if (!this.item.trackingInfo.publicationInterval.deleteTimeUtc) {
          const currentPoint = {
            timeUtc: new Date(),
            value: ph.points[ph.points.length - 1].value,
          };
          ph.points.push(currentPoint);
        } else {
          const lastPoint = {
            timeUtc: this.item.trackingInfo.publicationInterval.deleteTimeUtc,
            value: ph.points[ph.points.length - 1].value,
          };
          ph.points.push(lastPoint);
        }

        ph.points.forEach((el: any) => {
          const formatedLabel = moment(el.timeUtc).format('DD.MM.YYYY');
          if (!this.priceChartOptions.data.labels.includes(formatedLabel)) {
            this.priceChartOptions.data.labels.push(formatedLabel);
          }
          this.priceChartOptions.data.datasets[0].data[this.priceChartOptions.data.labels.indexOf(formatedLabel)] = el.value;
        });
        if (this.priceChart) {
          this.priceChart.update();
        }
      }
    }

    const sitesInfo = this.item.trackingInfo.sites;
    const allPortals = searchModule.getRealEstatePortals(store);
    sitesInfo.forEach((portal: any) => {
      allPortals.forEach((p) => {
        if (portal.siteId === p.id) {
          this.portalsInfo.push({
            portal: p,
            info: portal,
          });
        }
      });
    });

    const dates: {
      free: Dates[],
      paid: Dates[],
      private: Dates[],
      unknown: Dates[],
    } = {
      free: [],
      paid: [],
      private: [],
      unknown: [],
    };

    const filterByType = (
      p: { portal: IPubSiteModel, info: PubSiteInfo },
      type: string,
    ) => {
      const { publicationTimeUtc, isActive, deleteTimeUtc } = p.info.publicationInterval;
      const startDate = moment(publicationTimeUtc).format('DD.MM.YYYY');
      let endDate = moment(!isActive ? deleteTimeUtc : new Date()).format('DD.MM.YYYY');
      endDate = moment(startDate).isSame(endDate) ? null : endDate;
      dates[type].push({ dateStart: startDate, dateFinish: endDate, active: isActive });

      if (!this.portalsChartOptions.data.labels.includes(startDate)) {
        this.portalsChartOptions.data.labels.push(startDate);
      }

      if (endDate && !this.portalsChartOptions.data.labels.includes(endDate)) {
        this.portalsChartOptions.data.labels.push(endDate);
      }
    };

    this.portalsInfo.forEach((p) => {
      switch (p.portal.costType) {
        case (PubSiteCostType.Free): filterByType(p, 'free'); break;
        case (PubSiteCostType.Paid): filterByType(p, 'paid'); break;
        case (PubSiteCostType.NonPublic): filterByType(p, 'private'); break;
        case (PubSiteCostType.Unknown): filterByType(p, 'unknown'); break;
      }
    });

    Object.keys(dates).forEach((key: string) => {
      dates[key].sort((a: any, b: any) => {
        return a.dateStart - b.dateStart;
      });
    });

    this.portalsChartOptions.data.labels.sort((a: any, b: any) => {
      const newA = a.split('.').reverse().join('.');
      const newB = b.split('.').reverse().join('.');
      if (newA < newB) {
        return -1;
      } if (newA > newB) {
        return 1;
      }
      return 0;

    });

    this.portalsChartOptions.data.labels.forEach((label: string) => {
      this.tooltipsData[label] = {
        free: [0, 0, 0],
        paid: [0, 0, 0],
        private: [0, 0, 0],
        unknown: [0, 0, 0],
      };
    });

    Object.keys(dates).forEach((key: string) => {
      dates[key].forEach((data: Dates) => {
        const { labels } = this.portalsChartOptions.data;
        const startDataPosition = labels.indexOf(data.dateStart);
        this.tooltipsData[data.dateStart][key][0] = this.tooltipsData[data.dateStart][key][0] + 1;

        if (data.dateFinish) {
          const finishDataPosition = labels.indexOf(data.dateFinish);
          const finishPosition = data.active ? 1 : 2;
          this.tooltipsData[data.dateFinish][key][finishPosition] = this.tooltipsData[data.dateFinish][key][finishPosition] + 1;

          if (finishDataPosition - startDataPosition > 1) {
            const dif = finishDataPosition - startDataPosition;
            for (let i = startDataPosition + 1; i < startDataPosition + dif; i += 1) {
              this.tooltipsData[labels[i]][key][1] = this.tooltipsData[labels[i]][key][1] + 1;
            }
          }
        }
      });
    });

    Object.keys(this.tooltipsData).forEach((data: string) => {
      Object.keys(this.tooltipsData[data]).forEach((type: string, index: number) => {
        const dataFull = this.tooltipsData[data][type];
        this.portalsChartOptions.data.datasets[index].data[this.portalsChartOptions.data.labels.indexOf(data)] = dataFull[0] + dataFull[1];
      });
    });

    this.setPortalsChartHeight();

    if (this.myChart) {
      this.myChart.update();
    }

    const allInfo = this.item.trackingInfo.getPublisherStatusInfo();
    allInfo.forEach((info: any) => {
      this.publishersInfo.push({ info, show: false });
    });

    this.$forceUpdate();
  }

  get getSortedPublishersInfo() {
    return this.publishersInfo
      .sort((a, b) => {
        const aDate = moment(a.info.publicationInterval.publicationTimeUtc).format('DD.MM.YYYY');
        const bDate = moment(b.info.publicationInterval.publicationTimeUtc).format('DD.MM.YYYY');
        return aDate - bDate;
      })
      .sort((a, b) => {
        return Number(a.info.publicationInterval.isActive) - Number(b.info.publicationInterval.isActive);
      }).reverse();
  }

  get getSortedPortalsInfo() {
    return this.portalsInfo
      .sort((a, b) => {
        const aDate = moment(a.info.publicationInterval.publicationTimeUtc).format('DD.MM.YYYY');
        const bDate = moment(b.info.publicationInterval.publicationTimeUtc).format('DD.MM.YYYY');
        return aDate - bDate;
      })
      .sort((a, b) => {
        return Number(a.info.publicationInterval.isActive) - Number(b.info.publicationInterval.isActive);
      }).reverse();
  }

  getPortalName(id: number) {
    const allPortals = searchModule.getRealEstatePortals(store);
    const portal = allPortals.find((item) => {
      return item.id === id;
    });
    if (portal) {
      return portal.name;
    }
    return '';

  }

  removeDuplicates(sites: IPubSiteStatusInfo[]) {
    const portalsList: string[] = [];
    sites.forEach((site) => {
      const name = this.getPortalName(site.siteId);
      if (!portalsList.includes(name)) {
        portalsList.push(name);
      }
    });
    return portalsList;
  }

  showFullScreenPortals() {
    this.showPortalsFS = !this.showPortalsFS;
    if (this.showPortalsFS) {
      this.$emit('showFullScreenPortals', this.portalsChartOptions, this.tooltipsData);
    }
  }

  showFullScreenPrice() {
    this.showPriceFS = !this.showPriceFS;
    if (this.showPriceFS) {
      this.$emit('showFullScreenPrice', this.priceChartOptions);
    }
  }
}
