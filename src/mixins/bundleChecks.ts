import Component from 'vue-class-component';
import Vue from 'vue';
import store from '@store/index';
import { getEmployeeContext } from '@/store/modules/authStatesModule';

@Component
export default class BundleChecks extends Vue {

  get empCtx () {
    return getEmployeeContext(store);
  }

  get basicSearch () {
    return this.empCtx?.features?.search?.basic?.isAvailable;
  }

  get searchAreaAddressParts () {
    return this.empCtx?.features?.search?.areaAddressPart?.isAvailable;
  }

  get searchTravelTime () {
    return this.empCtx?.features?.search?.travelTime?.isAvailable;
  }

  get searchAreaAddressPartRadius () {
    return this.empCtx?.features?.search?.areaAddressPartRadius?.isAvailable;
  }

  get searchAreaShape () {
    return this.empCtx?.features?.search?.areaShape?.isAvailable;
  }

  get searchAreaViewport () {
    return this.empCtx?.features?.search?.areaViewport?.isAvailable;
  }

  get searchAreaAddressPartFromMap () {
    return this.empCtx?.features?.search?.areaAddressPartFromMap?.isAvailable;
  }

  get searchSites () {
    return this.empCtx?.features?.search?.sites?.isAvailable;
  }

  get searchPublisherClasses () {
    return this.empCtx?.features?.search?.publisherClasses?.isAvailable;
  }

  get searchPublishers () {
    return this.empCtx?.features?.search?.publishers?.isAvailable;
  }

  get searchPublicationStatuses () {
    return this.empCtx?.features?.search?.publicationStatuses?.isAvailable;
  }

  get searchInhabitantsInfo () {
    return this.empCtx?.features?.search?.inhabitantsInfo?.isAvailable;
  }

  get searchOwnerInfo () {
    return this.empCtx?.features?.search?.ownerInfo?.isAvailable;
  }

  get searchNeighborhood () {
    return this.empCtx?.features?.search?.neighbourhood?.isAvailable;
  }

  get basicPipe () {
    return this.empCtx?.features?.pipeline?.basic?.isAvailable;
  }

  get basicLeads () {
    return this.empCtx?.features?.leads?.basic?.isAvailable;
  }

  get basicPP () {
    return this.empCtx?.features?.pricePredictor?.basic?.isAvailable;
  }

  get ppDocumentation () {
    return this.empCtx?.features?.pricePredictor?.documentation?.isAvailable;
  }

  get ppNeighborhood () {
    return this.empCtx?.features?.pricePredictor?.neighbourhood?.isAvailable;
  }

  get ppPubPrice () {
    return this.empCtx?.features?.pricePredictor?.pubPricePredictionType?.isAvailable;
  }

  get ppTransPrice () {
    return this.empCtx?.features?.pricePredictor?.transPricePredictionType?.isAvailable;
  }

  get basicMR () {
    return this.empCtx?.features?.marketRadar?.basic?.isAvailable;
  }
}
