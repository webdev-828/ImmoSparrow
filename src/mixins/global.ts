import Vue from 'vue';
import Component from 'vue-class-component';
import { FileResponse, ILicensingBundleNestedModel } from '@immosparrow/cockpit-api-v2';
import store from '@store';
import { setSidebarActiveTab } from '@store/modules/sidebars';
import { MinMaxValue, MinMax } from '@/models';
import { EventBus } from '../EventBus';
import moment from 'moment';
import accounting from 'accounting';

@Component
export default class GlobalMixin extends Vue {
  currentYear = new Date().getFullYear();
  defaultMinMaxValuesForFields = {
    price: { min: 1000, max: 5000000 },
    rooms: { min: 1, max: 14 },
    livingSpace: {
      100: { min: 20, max: 600 },
      200: { min: 10, max: 400 },
    },
    propertyArea: { min: 50, max: 5000 },
    builtYear: { min: 1800, max: this.currentYear + 20 },
  };

  // METHODS
  getFieldMinMax(field: string, value: number, customLimits?: MinMax): MinMaxValue {
    const result = new MinMaxValue();
    if (!value) return result;

    let limits = this.defaultMinMaxValuesForFields[field];
    if (customLimits) {
      limits = customLimits;
    }
    result.value = value;

    switch (field) {
      case 'price':
      case 'propertySpace':
        result.min = Math.max(this.getPercent(value, 90), limits.min);
        result.max = Math.min(this.getPercent(value, 110), limits.max);
        break;
      case 'livingSpace':
        result.min = Math.max(value - 30, limits.min);
        result.max = Math.min(value + 30, limits.max);
        break;
      case 'rooms':
        result.min = Math.min(value - 1, limits.max);
        result.max = Math.max(value + 1, limits.min);
        break;
      case 'builtYear':
        result.min = Math.min(value - 10, limits.max);
        result.max = Math.max(value + 10, limits.min);
        break;
    }
    return result;
  }
  getPercent(value: number, percent: number) {
    return Math.floor(percent / 100 * value);
  }
  showSuccessMessage(text: string) {
    this.$notify({
      text,
      group: 'actions',
      type: 'success',
      duration: 2500,
    });
  }
  showErrorMessage(text: string, duration: number = 2500) {
    this.$notify({
      text,
      duration,
      group: 'actions',
      type: 'error',
      speed: 1,
    });
  }
  setActiveTab(name: string, level: number, isRight: boolean = false) {
    setSidebarActiveTab(store, { level, isRight, tabName: name });
    EventBus.$emit('map:removePois');
  }
  saveBlobFile(fileBlob: FileResponse, fileName: string) {
    const a = document.createElement('a');
    const url = window.URL.createObjectURL(fileBlob);
    document.body.appendChild(a);
    a.href = url;
    a.download = fileName;
    a.click();
    window.URL.revokeObjectURL(url);
    a.remove();
  }
  getImageBase64(url: string) {
    return new Promise((resolve) => {
      const img = new Image();
      img.crossOrigin = 'Anonymous';
      img.onload = function () {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        canvas.height = img.height;
        canvas.width = img.width;
        ctx.drawImage(img, 0, 0);
        resolve(canvas.toDataURL());
      };
      img.src = url;
    });
  }
  getDay(date: Date) {
    moment.locale(localStorage.getItem('lang'));
    return moment(date).format('dddd');
  }
  getDate(date: Date) {
    moment.locale(localStorage.getItem('lang'));
    return moment.utc(date.getTime()).local().format('DD.MM.YYYY');
  }
  getTime(date: Date) {
    return moment.utc(date.getTime()).local().format('HH:mm');
  }
  getDateDaysDiff(pubTime: Date, deletedTime?: Date) {
    let now = moment(new Date());
    if (deletedTime) {
      now = moment(deletedTime);
    }
    return Math.round(moment.duration(now.diff(pubTime)).asDays());
  }
  uppercaseFirstLetter(text: string) {
    return text.charAt(0).toUpperCase() + text.slice(1);
  }
  formatMoney(text: string | number) {
    try {
      return accounting.formatMoney(`${text}`, '', 0, '\'', ',');
    } catch {
      return '';
    }
  }
  nextField(field: any, isSelect: boolean = false) {
    const el = document.getElementsByName(field)[0] as HTMLInputElement;
    if (isSelect) {
      el.click();
    } else {
      el.focus();
      el.select();
    }
  }
  getBundles(bundles: ILicensingBundleNestedModel[]) {
    let names: string = '';
    bundles.forEach((b) => {
      if (bundles.indexOf(b) === bundles.length - 2) { // one behind last one
        names += `"${b.name}" or `;
      } else if ((bundles.indexOf(b) === bundles.length - 1)) { // last one
        names += `"${b.name}"`;
      } else {
        names += `"${b.name}", `; // all others
      }
    });
    return `${names}.`;
  }
  rawCategories: { [name: number]: string } = {
    1021: window['Localize'].translate('Detached Houses'),
    1025: window['Localize'].translate('Multi Family Houses'),
    1030: window['Localize'].translate('Residential Building With Secondary Use'),
    1040: window['Localize'].translate('Building With Partial Residential Use'),
    7100: window['Localize'].translate('No Heating'),
    7101: window['Localize'].translate('Stove Heating'),
    7102: window['Localize'].translate('Self Contained Central Heating'),
    7103: window['Localize'].translate('Building Central Heating'),
    7104: window['Localize'].translate('Multiple Building Central Heating'),
    7105: window['Localize'].translate('Public Distant Heating'),
    7109: window['Localize'].translate('Other Heating'),
  };
}
