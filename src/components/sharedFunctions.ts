import * as searchModule from '../store/modules/searchModule';
import store from '../store';
import moment from 'moment';
import { PubPublisherClass, GeoAddressQuality,
  ILicensingBundleNestedModel, PubPublisherPrimaryInfo,
  PipelineEntryActivityType, IEmployeeLightModel, IPipelineEntryLightModel } from '@immosparrow/cockpit-api-v2';
import { safeVal } from '@immosparrow/cockpit-lib-core';
import { getEmployeeContext } from '@/store/modules/authStatesModule';

export function getMainCategory1(mainIds: number[], subIds: string[]) {
  const t = searchModule.getPropertyTypes(store);
  const names: string[] = [];
  if (mainIds.length) {
    const n = t.filter(t1 => mainIds.indexOf(t1.id) > -1);

    for (const i in n) {
      names.push(n[i].name);
    }
  } else {
    if (subIds.length) {
      for (const i in t) {
        for (const e in t[i].propertyTypes) {
          const n = t[i].propertyTypes.filter(t1 => subIds.indexOf(t1.id) > -1);

          for (const i in n) {
            if (!names.includes(n[i].name)) {
              names.push(n[i].name);
            }
          }

        }
      }
    }
  }
  if (names.toString()) {
    return (names.toString().match(/[A-Z][a-z]+/g)).join(' ');
  }
  return '';

}

export function formatDate(date: Date) {
  return moment(date).format('DD.MM.YYYY');
}

export function getDay(date: Date, lang: string) {
  moment.locale(lang);
  return  moment(date).format('dddd');
}

export function getDateAndTime(date: Date, format: string, lang: string) {
  moment.locale(lang);
  return moment.utc(date.getTime()).local().format(format);
}

export function getAddressQuality(q: number) {
  return GeoAddressQuality[q];
}
export function getDuration(pubTime: Date, deletedTime: Date) {
  let now = moment(new Date());
  if (deletedTime) {
    now = moment(deletedTime);
  }
  return Math.round(moment.duration(now.diff(pubTime)).asDays());
}
export function formatPrice(price: number) {
  if (price) {
    const roundPrice = Math.round(price);
    return roundPrice.toString().replace(/\B(?=(\d{3})+(?!\d))/g, "'");
  }
  return '';

}
export function formatDBNumbers(price: number) {
  if (price) {
    const roundPrice = price;
    return roundPrice.toString().replace(/\B(?=(\d{3})+(?!\d))/g, "'");
  }
  return 0;

}
export function getVendorClass(vendorClass: number) {
  if (vendorClass >= 0) {
    return (PubPublisherClass[vendorClass].match(/[A-Z][a-z]+/g)).join(' ');
  }
  return '';

}
export function showTabs(tab: string, tabsProfile: object) {
  for (const i in tabsProfile) {
    if (i === tab) {
      tabsProfile[i] = true;
    } else {
      tabsProfile[i] = false;
    }
  }
}

export function displayAddress(address: any) {
  let addr = '';
  if (address !== undefined) {
    if (address.street || address.streetNumber) {
      addr = `${address.street}${address.streetNumber != null ? ` ${address.streetNumber}` : ''}, ${address.zip} ${address.locality}${address.stateShort ? `, ${address.stateShort}` : ''}`;
    } else if (address.zip || address.locality) {
      addr = `${address.zip} ${address.locality}, ${address.stateShort}`;
    }
    if (addr.length >= 50) {
      return `${addr.substring(0, 50)}...`;
    }
    return addr;

  }
}
export function getBundles(bundles: ILicensingBundleNestedModel[]) {
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

export function getPersonName(item: PubPublisherPrimaryInfo): string {
  let name = '';
  if (item) {
    if (safeVal(item, (item: PubPublisherPrimaryInfo) => item.organization.name)) {
      name = item.organization.name;
    } else if (safeVal(item, (item: PubPublisherPrimaryInfo) => item.person.name)) {
      name = item.person.name;
    } else if (safeVal(item, (item: PubPublisherPrimaryInfo) => item.personOrOrganization.name)) {
      name = item.personOrOrganization.name;
    }
  }
  return name;
}

export async function getGoogleStreetViewImage(lat: number, lng: number): Promise<string> {
  return fetch(`https://maps.googleapis.com/maps/api/streetview/metadata?location=${lat},${lng}&size=500x400&key=AIzaSyBP13wW7gtbz3AQeneSFnqbpuWfthC4pHY&pitch=5&source=outdoor`)
    .then((data: any) => {
      return data.json();
    }).then((data: any) => {
      if (data.status === 'OK') {
        return `https://maps.googleapis.com/maps/api/streetview?location=${lat},${lng}&size=500x400&key=AIzaSyBP13wW7gtbz3AQeneSFnqbpuWfthC4pHY&pitch=5&source=outdoor`;
      }
      return 'static/img/house-placeholder-scaled.png';
    });
}

export function getActivityType(item: any) {
  if (item.type !== undefined) {
    switch (item.type) {
      case PipelineEntryActivityType.Call:
        return 'fa fa-phone';
      case PipelineEntryActivityType.Meeting:
        return 'fa fa-users';
      case PipelineEntryActivityType.Task:
        return 'fa fa-tasks';
      case PipelineEntryActivityType.Deadline:
        return 'fa fa-clock-o';
      case PipelineEntryActivityType.Email:
        return 'fa fa-envelope-o';
      case PipelineEntryActivityType.Lunch:
        return 'fa fa-clock-o';
    }
  } else {
    if (item.files) {
      return 'fa fa-paperclip';
    }
    if (item.content || item.subject) {
      return 'fa fa-file-text';
    }
  }
}
export function employeeName(emp: IEmployeeLightModel) {
  return `${emp.lastName} ${emp.firstName}`;
}
