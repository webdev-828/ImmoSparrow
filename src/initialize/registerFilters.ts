import Vue from 'vue';
import moment from 'moment';
import accounting from 'accounting';

Vue.filter('sort_desc', (data: any) => {
  data.sort((date1: any, date2: any) => {
    if (date1.time > date2.time) return -1;
    if (date1.time < date2.time) return 1;
    return 0;
  });
  return data;
});

Vue.filter('moment', (data: string, format: string) => {
  return moment(data).format(format);
});

Vue.filter('money', (text: string) => {
  try {
    return accounting.formatMoney(text, '', 0, '\'', ',');
  } catch {
    return '';
  }
});

Vue.filter('longDigits', (text: string) => {
  if (!text) return '';
  const parts = text.toString().split('.');
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
  return parts.join('');
});
