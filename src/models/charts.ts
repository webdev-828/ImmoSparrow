export class DoughnutChartItem {
  label: string;
  backgroundColor: string;
  count: number;

  constructor(label: string, hue: number, count: number) {
    this.label = label;
    this.backgroundColor = `hsl(${hue}, 75%, 60%)`;
    this.count = count;
  }
}
