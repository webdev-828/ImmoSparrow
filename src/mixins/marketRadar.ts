import Vue from 'vue';
import Component from 'vue-class-component';
import {
  ApartmentLightModel, GeoAreaSet, PubTransactionType,
  GeoAreaAddressPart, GeoAddressPartType, PubPropertyWellKnownCategory,
} from '@immosparrow/cockpit-api-v2';
import { GeoSearch, MarketRadarModel } from '@/models';

@Component
export default class MarketRadarMixin extends Vue {
  convertGeoSearchModel(geoSearch: GeoSearch, addressId: string) {
    const searchArea = <GeoAreaSet>{
      isEmpty: false,
      addressParts: [],
      shapes: [],
    };
    if (geoSearch.radius) {
      const radius = <GeoAreaAddressPart>{
        id: addressId,
        type: GeoAddressPartType.EntranceAddress,
        radius: geoSearch.radius,
      };
      searchArea.addressParts.push(radius);
    }
    if (geoSearch.area) {
      delete geoSearch.area.geom;
      searchArea.addressParts.push(geoSearch.area);
    }
    return searchArea;
  }

  getApartmentTitle(obj: ApartmentLightModel) {
    if (!obj.primaryInfo.level && !obj.primaryInfo.position) {
      return [obj.address.govId.ewid, obj.primaryInfo.physNumber].join(' ');
    }
    if (obj.primaryInfo.level && obj.primaryInfo.position) {
      return `${obj.primaryInfo.level}(${obj.primaryInfo.position})`;
    }
    if (!obj.primaryInfo.position && obj.primaryInfo.level) {
      return obj.primaryInfo.level;
    }
    if (!obj.primaryInfo.level && obj.primaryInfo.position) {
      return `${obj.address.govId.ewid} ${obj.primaryInfo.physNumber} (${obj.primaryInfo.position})`;
    }
  }

  generateEntryName(formModel: MarketRadarModel, addressName: string) {
    let searchType = 'Rent';
    if (formModel.transactionType === PubTransactionType.Buy) {
      searchType = 'Buy';
    }

    let category = 'House';
    if (formModel.propertyType.id === PubPropertyWellKnownCategory.Apartment) {
      category = 'Apartment';
    }

    let rooms = '';
    if (formModel.rooms.min && formModel.rooms.max) {
      rooms = `Rooms [t]${formModel.rooms.min} - ${formModel.rooms.max}[/t]`;
    } else if (!formModel.rooms.min && formModel.rooms.max) {
      rooms = `Up to [t]${formModel.rooms.max} rooms[/t]`;
    } else {
      if (formModel.rooms.min) {
        rooms = `From [t]${formModel.rooms.min} rooms[/t]`;
      }
    }

    let livingArea = '';
    if (formModel.livingSpace.min && formModel.livingSpace.max) {
      livingArea = `Living area [t]${formModel.livingSpace.min} - ${formModel.livingSpace.max}[/t]`;
    } else if (!formModel.livingSpace.min && formModel.livingSpace.max) {
      livingArea = `Living area up to [t]${formModel.livingSpace.max}[/t][sq2]`;
    } else {
      if (formModel.livingSpace.min) {
        livingArea = `Living area from [t]${formModel.livingSpace.min}[/t][sq2]`;
      }
    }

    let propertyArea = '';
    if (formModel.propertyType.id !== PubPropertyWellKnownCategory.Apartment) {
      if (formModel.propertyArea.min && formModel.propertyArea.max) {
        propertyArea = `Property area [t]${formModel.propertyArea.min} - ${formModel.propertyArea.max}[/t]`;
      } else if (!formModel.propertyArea.min && formModel.propertyArea.max) {
        propertyArea = `Property area up to [t]${formModel.propertyArea.max}[/t][sq2]`;
      } else {
        if (formModel.propertyArea.min) {
          propertyArea = `Property area from [t]${formModel.propertyArea.min}[/t][sq2]`;
        }
      }
    }
    let price = '';
    if (formModel.price.min && formModel.price.max) {
      price = `Price [t]${formModel.price.min} - ${formModel.price.max}[/t]`;
    } else if (!formModel.price.min && formModel.price.max) {
      price = `Price up to [t]${formModel.price.max}[/t]`;
    } else {
      if (formModel.price.min) {
        price = `Price from [t]${formModel.price.min}[/t]`;
      }
    }

    const address = addressName;
    let where = `${searchType} ${category} [t]${address},[/t] ${price} ${rooms} ${livingArea} ${propertyArea}`;
    if (where.length >= 200) {
      where = `${searchType} ${category} [t]${address},[/t] ${price} ${rooms} ${livingArea}`;
      if (where.length >= 200) {
        where = `${searchType} ${category} [t]${address},[/t] ${price} ${rooms}`;
        if (where.length >= 200) {
          where = `${searchType} ${category} [t]${address},[/t]`;
        }
      }
    }
    return where;
  }
}
