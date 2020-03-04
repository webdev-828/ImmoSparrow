export { default as Chart } from 'chart.js';

export interface ChartData {
  type: string;
  data: any;
  options: Chart.ChartOptions;
}

export interface CurrentBuy {
  house: number;
  apartment: number;
}
export interface CurrentRent{
  house: string;
  apartment: string;
}

export interface Diagram {
  id: string;
  options: {
    hidden: boolean;
    stats?: 'unrestricted' | 'workspace';
  };
}
