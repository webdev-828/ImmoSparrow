import { Component, Vue } from 'vue-property-decorator';
import { mixins } from 'vue-class-component';
import template from './DocumentationTemplate.vue';
import * as api from '@immosparrow/cockpit-api-v2';
import store from '@store';
import {
  getMarketRadarModel, getBuildingInfo, getPricePrediction, getSimilarObjects,
} from '@/store/modules/marketRadar';
import { getFullAddress } from '@/store/modules/main';
import RatingsMixin from '@/mixins/ratings';
import GlobalMixin from '@/mixins/global';
import { Publication } from '@/models';

@Component({
  mixins: [template],
})
export default class DocumentationTab extends mixins(GlobalMixin, RatingsMixin) {
  uploadSection: boolean = false;
  exportType: string = 'pptx';
  displayParagraphSettings: api.IDisplayParagraphSettings = <api.DisplayParagraphSettings>{
    includeOverview: true,
    includeImages: true,
    includePricePrediction: true,
    includeSimilarOffers: true,
    includePriceHistory: true,
    includeSelectedObjects: true,
    includeMarketSituation: true,
    includeMacroLocation: true,
    includePublicTransport: true,
    includeEducation: true,
    includeView: true,
    includeShopping: true,
    includeImmissions: true,
    includeConstructionSites: true,
  };
  documentPages: any = [
    { name: 'Overview', included: true },
    { name: 'Images', included: true },
    { name: 'Price Prediction', included: false },
    { name: 'Similar Offers', included: false },
    { name: 'Price History', included: true },
    { name: 'Selected Objects', included: true },
    { name: 'Market Situation', included: true },
    { name: 'Macrolocation', included: true },
    { name: 'Public Transport', included: true },
    { name: 'Education', included: true },
    { name: 'View / Silence', included: false },
    { name: 'Shopping / Services', included: true },
    { name: 'Immissions', included: true },
    { name: 'Construction Sites', included: false },
  ];
  documentImages: any = [
    { src: 'c3df5d72-1641-a9e2-d6f0-6251191e48aa', selected: true },
    { src: '23c14291-9eac-a4c0-0556-68cf743dc606', selected: false },
    { src: '00120873-4e51-819c-ff7b-fab2cb6997a3', selected: false },
    { src: '89c255e4-64f3-52b8-5b24-a780bcdd1075', selected: false },
    { src: '2d22e880-fe63-650f-f5a1-3c0c7350d2ee', selected: false },
  ];
  presentationImages: any = [
    { src: 'd571bf65-0450-9789-2b3d-e799098fb4fc', selected: true, title: 'Corridor' },
    { src: '7907678a-41e9-b1f6-9553-1e60e911cd28', selected: true, title: 'Living Room' },
    { src: '8a95d8ba-868c-a2a6-9441-7931d5846ff5', selected: true, title: 'View Outside' },
    { src: 'cd78cd81-c657-c67a-f844-b33d902bf628', selected: true, title: 'Library' },
    { src: 'a2951a80-8f68-dd52-7ed4-5c4fd0cdf101', selected: false, title: 'Kitchen' },
    { src: '045f24c5-bc04-cb80-4a31-6ba05c672ad4', selected: false, title: 'No image' },
  ];
  wizardSteps: object = {
    paragraphs: true,
    images: false,
    params: false,
  };
  customersFullName: string = '';
  proposalPrice: number = null;
  proposalPricePerSqm: number = null;

  get model() {
    return getMarketRadarModel(store);
  }
  get fullAddress() {
    return getFullAddress(store);
  }
  get buildingInfo() {
    return getBuildingInfo(store);
  }
  get ads(): Publication[] {
    return getSimilarObjects(store);
  }
  get selectedAds(): Publication[] {
    return this.ads.filter((ad: Publication) => ad.selected);
  }
  get prediction() {
    return getPricePrediction(store);
  }
  get comparisonObjects() {
    const objectsForCompare: api.PropertyComparisonObject[] = [];
    this.selectedAds.slice(0, 3).forEach((ad) => {
      const obj = <api.PropertyComparisonObject>{
        price: ad.financialInfo?.totalPriceCalculated,
        pricePerSqrMeter: ad.financialInfo?.pricePerSqrMeterCalculated,
        livingArea: ad.primaryInfo?.layout?.size?.areaLiving?.value,
      };
      if (ad?.pictures?.length) {
        obj.picture = ad.pictures[0].url;
      }
      const publicationTime = ad.trackingInfo?.publicationInterval?.publicationTimeUtc;
      if (publicationTime) {
        obj.daysOnMarket = this.getDateDaysDiff(publicationTime);
      }
      objectsForCompare.push(obj);
    });
    return objectsForCompare;
  }
  get nearestSelectedObjects(): api.NearestSelectedObject[] {
    const selectedObjects: api.NearestSelectedObject[] = [];
    this.selectedAds.forEach((ad: Publication) => {
      const selectedObject = <api.NearestSelectedObject>{
        address: this.formatAddress(ad.address),
        price: ad?.financialInfo?.price?.value,
        roomsCount: ad?.primaryInfo?.layout?.rooms?.roomCount?.value,
        livingArea: ad?.primaryInfo?.layout?.size?.areaLiving?.value,
        propertyArea: ad?.primaryInfo?.layout?.size?.areaProperty?.value,
        builtYear: ad?.primaryInfo?.basicInfo?.builtYear?.value?.item1,
        renovationYear: ad?.primaryInfo?.basicInfo?.builtYear?.value?.item1,
      };
      selectedObjects.push(selectedObject);
    });
    return selectedObjects;
  }
  get nearestImmissions(): api.NearestImmission[] {
    const nearestImmissions: api.NearestImmission[] = [];
    this.mobileTransmitters.forEach((transmitter: api.PoiLightModel) => {
      if (transmitter.distance < 100) {
        const immission: api.NearestImmission = <api.NearestImmission>{
          distance: transmitter.distance,
          type: transmitter.name,
        };
        nearestImmissions.push(immission);
      }
    });
    return nearestImmissions;
  }

  // METHODS
  showTab(tab: string) {
    for (const i in this.wizardSteps) {
      this.wizardSteps[i] = (i === tab);
    }
    this.$el.querySelector('.scroll-anchor').scrollIntoView({ behavior: 'smooth' });
  }
  createRatingsObject(score: number, title: string): api.NearestShopping {
    return <api.NeighborhoodRating>{ score, title };
  }
  getNearest(items: any[]) {
    if (items.length) {
      return items.filter((item: any) => {
        return item.distance < 100;
      });
    }
    return [];
  }
  async download() {
    let file = null;
    let fileName = '';

    if (this.exportType === 'pptx') {
      file = await this.generatePptxReport();
      fileName = 'Presentation.pptx';
    } else {
      file = await this.generateMarketRadarFullExport();
      fileName = `Report.${this.exportType}`;
    }
    this.saveBlobFile(file, fileName);
  }
  async generatePptxReport() {
    const propertyInfo: api.IPropertyInfo = <api.PropertyInfo>{
      address: this.fullAddress,
      propertyCategory: this.model.propertyType.id,
      propertyCategoryName: this.model.propertyType.name,
      builtYear: this.model.builtYear.value,
      roomCount: this.model.rooms.value,
      livingArea: this.model.livingSpace.value,
    };

    if (this.model.propertyType.id === api.PubPropertyWellKnownCategory.House) {
      propertyInfo.propertyArea = this.model.propertyArea.value;
    }

    const renovationYear = this.model.renovationYear.value;
    if (renovationYear) {
      propertyInfo.renovationYear = renovationYear;
    }

    const transaction = this.model.transaction;
    if (transaction.active) {
      propertyInfo.cubature = transaction.cubature;
      propertyInfo.bathroomsCount = transaction.bathroomsCount;
      propertyInfo.garageCount = transaction.garageCount;
      propertyInfo.houseType = transaction.houseType.name;
      propertyInfo.quality = transaction.constructionQuality.name;
      propertyInfo.condition = transaction.buildingCondition.name;
      propertyInfo.microLocation = transaction.microLocation.name;
    }

    if (transaction.active) {
      propertyInfo.garageCount = transaction.garageCount;
      propertyInfo.bathroomsCount = transaction.bathroomsCount;
    }

    const query: api.IMarketRadarPptxExportModel = <api.MarketRadarPptxExportModel>{
      propertyInfo,
      // That's the new charts, waiting the Valentin
      // salesChart?: string | undefined;
      // priceChart?: string | undefined;
      // TODO:
      // mainPropertyPicture?: string | undefined;
      // squarePropertyPicture?: string | undefined;
      // mapWithPoi?: string | undefined;
      // poiDistance?: PointOfInterestDistance | undefined;
      customersFullName: this.customersFullName,
      floors: this.buildingInfo.primaryInfo.floorCount,
      marketPrice: this.prediction.transaction?.price?.value,
      marketPricePerSqrMeter: this.prediction.transaction?.pricePerSqm?.value,
      offerPrice: this.proposalPrice,
      offerPricePerSqrMeter: this.proposalPricePerSqm,
    };

    // TODO: Not working due to CORS policy
    // const promises: Promise<void>[] = [];
    // if (this.selectedAds.length) {
    //   const comparisonObjects = [...this.comparisonObjects];
    //   comparisonObjects.forEach((obj: api.PropertyComparisonObject) => {
    //     const promise = this.getImageBase64(obj.picture).then((base64: string) => {
    //       obj.picture = base64;
    //     });
    //     promises.push(promise);
    //   });
    //   query.comparisonObjects = comparisonObjects;
    // }
    // await Promise.all(promises);
    return api.$properties.exportMarketRadarPptx(query);
  }
  async generateMarketRadarFullExport() {
    const totalNeighborhoodRating: api.NeighborhoodRating = this.createRatingsObject(this.overallRating, this.neighborhoodTitleString);
    const silenceRating: api.NeighborhoodRating = this.createRatingsObject(this.noiseRating, this.noiseTitleString);
    const viewRating: api.NeighborhoodRating = this.createRatingsObject(this.viewRating, this.viewTitleString);
    const shoppingRating: api.NeighborhoodRating = this.createRatingsObject(this.shoppingRating, this.shoppingTitleString);
    const immissionsRating: api.NeighborhoodRating = this.createRatingsObject(this.immissionsRating, this.immissionsTitleString);
    const educationRating: api.NeighborhoodRating = this.createRatingsObject(this.educationRating, this.educationTitleString);
    const connectivityRating: api.NeighborhoodRating = this.createRatingsObject(this.connectivityRating, this.connectivityTitleString);
    const nearestPublicTransport: api.NearestConnectivity = <api.NearestConnectivity>{
      distance: this.connectivity?.distancePublicTransportStop,
    };
    const shoppings = this.shops.map((shop: api.PoiLightModel) => {
      return <api.NearestShopping>{
        name: shop.name,
        address: this.formatAddress(shop.address),
        distance: shop.distance,
      };
    });

    const query: api.MarketRadarFullExportModel = <api.MarketRadarFullExportModel>{
      totalNeighborhoodRating,
      silenceRating,
      viewRating,
      shoppingRating,
      immissionsRating,
      educationRating,
      connectivityRating,
      nearestPublicTransport,
      shoppings: this.getNearest(shoppings),
      kindergartens: this.getNearest(this.kindergardens),
      primarySchools: this.getNearest(this.primarySchools),
      secondarySchools: this.getNearest(this.secondarySchools),
      highSchools: this.getNearest(this.highschools),
      paragraphSettings: this.displayParagraphSettings,
      selectedObjects: this.nearestSelectedObjects,
      immissions: this.nearestImmissions,
      nearestHighwayDistance: this.connectivity?.distanceToNearestRoadNetworkNode,
      // TODO: buildingProjects are Construction Sites. API endpoint is WIP.
      // buildingProjects: null,
      // publicTransport: null,
      // highways: null,
    };

    const documentType = this.exportType === 'pdf' ? api.DocumentFormat.Pdf : api.DocumentFormat.Word;

    return api.$properties.exportMarketRadarFull(query, documentType);
  }
}
