import {
  IPubPropertyCategory, PubTransactionType,
  GeoAreaShape, GeoAreaAddressPart, GeoAreaSet,
} from '@immosparrow/cockpit-api-v2';
import { MinMax } from './index';

export class MinMaxFields {
  defaultLimits: MinMax;
  values: {
    min: number | string,
    max: number | string,
    value?: number | string,
  };
}

export class GeoSearch {
  area: GeoAreaAddressPart;
  radius: number;
  shapes: GeoAreaShape[];
  viewports: any[];
  transports: { by: string, time: number }[];

  constructor() {
    this.area = null;
    this.radius = null;
    this.shapes = [];
    this.viewports = [];
    this.transports = [];
  }
}

export class MinMaxValue {
  min: number;
  max: number;
  value: number;

  constructor() {
    this.min = null;
    this.max = null;
    this.value = null;
  }
}

export class TransactionModel {
  active: boolean;
  cubature: number;
  garageCount: number;
  bathroomsCount: number;
  houseType: { id: number; name: string };
  constructionQuality: { id: number; name: string };
  buildingCondition: { id: number; name: string };
  microLocation: { id: number; name: string };

  constructor() {
    this.active = false;
    this.cubature = null;
    this.garageCount = null;
    this.bathroomsCount = null;
    this.houseType = null;
    this.constructionQuality = null;
    this.buildingCondition = null;
    this.microLocation = null;
  }
}

export class MarketRadarModel {
  searchArea: GeoAreaSet;
  geoSearch: GeoSearch;
  transactionType: PubTransactionType;
  propertyType: IPubPropertyCategory;
  price: MinMaxValue;
  rooms: MinMaxValue;
  livingSpace: MinMaxValue;
  propertyArea: MinMaxValue;
  builtYear: MinMaxValue;
  renovationYear: MinMaxValue;
  activeAds: boolean;
  historicAds: {
    active: boolean,
    yearFrom: number,
    yearTo: number,
  };
  transaction: TransactionModel;

  constructor() {
    this.geoSearch = new GeoSearch();
    this.price = new MinMaxValue();
    this.rooms = new MinMaxValue();
    this.livingSpace = new MinMaxValue();
    this.propertyArea = new MinMaxValue();
    this.builtYear = new MinMaxValue();
    this.renovationYear = new MinMaxValue();
    this.activeAds = true;
    this.transaction = new TransactionModel();

    this.searchArea = <GeoAreaSet>{
      addressParts: [],
      shapes: [],
    };

    const year = new Date().getFullYear();
    this.historicAds = {
      active: true,
      yearFrom: year - 4,
      yearTo: year,
    };
  }
}
