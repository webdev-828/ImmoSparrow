import { Component, Watch } from 'vue-property-decorator';
import { mixins } from 'vue-class-component';
import template from './LeftTemplate.vue';
import * as api from '@immosparrow/cockpit-api-v2';
import * as MRStore from '@store/modules/marketRadar';
import {
  getIsLoading, setIsLoading, getSearchedAddress, setSearchedAddress,
  getIsAddressLoading, setIsAddressLoading, setFullAddress, getFullAddress, clearAddressParts, getAddressParts,
} from '@/store/modules/main';
import { getIsMapLoaded, setMapPoint } from '@store/modules/map';
import { getLeftSidebarActiveTab, setSidebarState, setIsEnabledRightSidebar } from '@store/modules/sidebars';
import store from '@store';
import { MarketRadarModel } from '@models/form';
import { SidebarTab } from '@models/components';
import GlobalMixin from '@/mixins/global';
import { HistoryItem, Publication, MapShape } from '@/models';
import MarketRadarMixin from '@/mixins/marketRadar';
import { ErrorField } from 'vee-validate';
import _ from 'lodash';
import FeatureChecks from '@/mixins/featureChecks';
import { EventBus } from '@/EventBus';

class Modal {
  show: boolean;
  item: string;
}
@Component({
  mixins: [template],
})
export default class LeftBar extends mixins(GlobalMixin, MarketRadarMixin, FeatureChecks) {
  modal: Modal = {
    item: '',
    show: false,
  };
  sidebarTabs: SidebarTab[] = [
    { name: 'bookmarks', icon: 'si-star', visible: false },
    { name: 'history', icon: 'si-clock', visible: false },
  ];
  dropdownActive = {
    portfolioSearch: false,
    similarOffers: true,
    pricePredcion: true,
    pricingInfo: true,
    adsSettings: true,
  };
  minimized = {
    ads: true,
    apartments: true,
    similarObjects: true,
  };
  selectedAd: api.PubLightModel = null;
  selectedApartment: api.ApartmentLightModel = null;
  loadingFromHistory: boolean = false;
  isAnalysingInProgress: boolean = false;
  removingHistoryInProgress: boolean = false;
  removingBookmarksInProgress: boolean = false;
  yearsList: number[] = [];
  propTypes: api.IPubPropertyCategory[] = [
    { name: 'Apartment', id: api.PubPropertyWellKnownCategory.Apartment },
    { name: 'House', id: api.PubPropertyWellKnownCategory.House },
  ];
  approved = {
    mandatory: {
      propertyType: false,
      rooms: false,
      livingSpace: false,
      propertyArea: false,
      builtYear: false,
    },
    optional: {
      price: false,
      renovationYear: false,
    },
    transaction: {
      cubature: false,
      garageCount: false,
      bathroomsCount: false,
      houseType: false,
      constructionQuality: false,
      buildingCondition: false,
      microLocation: false,
    },
  };
  portfolioItemsDummy = [
    {
      image: 'https://axresources.azurewebsites.net/image/get/f38649e4-e998-e6ca-6f7a-483971868305/?mw=100&mh=100&q=90',
      title: 'Schmucke 3.5-Zimmer Wohnung mit bezauberndem Garten',
      address: 'Sennhüttenstrasse 5, 8907 Wettswil',
    },
    {
      image: 'https://axresources.azurewebsites.net/image/get/7529bc21-cfee-f57d-f18b-385fef293b33/?mw=100&mh=100&q=90',
      title: '4.5-Zimmer-Wohnungen - "Am Chrebsbach',
      address: 'Ohringerstrasse 117, 8472 Seuzach',
    },
    {
      image: 'https://axresources.azurewebsites.net/image/get/60bcafba-8d87-8b40-daad-765856803de4/?mw=100&mh=100&q=90',
      title: 'STEUERGÜNSTIGES UND MODERNES WOHNEN',
      address: '8173 Neerach',
    },
    {
      image: 'https://axresources.azurewebsites.net/image/get/0ed8e720-e11f-2648-449a-247ab9633719/?mw=100&mh=100&q=90',
      title: '6.5-Z-Wohnung auf einem Geschoss - "Am Chrebsbach',
      address: 'Ohringerstrasse 117, 8472 Seuzach',
    },
    {
      image: 'https://axresources.azurewebsites.net/image/get/ea20d9b8-31a6-52b3-db3b-832018f9fe4e/?mw=100&mh=100&q=90',
      title: 'Grosse und sonnige Familienwohnung im Minergiestandard',
      address: 'Geerenstrasse 23A, 8604 Volketswil',
    },
  ];

  created() {
    this.setActiveTab('search', 1);
    this.setActiveTab('address', 2);
    setSearchedAddress(store, null);
    this.reset();

    if (!this.history.length) {
      this.getHistory();
    }
    if (!this.bookmarks.length) {
      this.getBookmarks();
    }

    this.yearsList = [];
    for (let i = 0; i < 100; i += 1) {
      this.yearsList.push(this.currentYear - i);
    }
  }

  // COMPUTEDS
  get formModel(): MarketRadarModel {
    return MRStore.getFormModel(store);
  }
  get searchModel(): MarketRadarModel {
    return MRStore.getMarketRadarModel(store);
  }
  get activeTab() {
    return getLeftSidebarActiveTab(store);
  }
  get activeTabL1(): string {
    return this.activeTab.level1;
  }
  get activeTabL2(): string {
    return this.activeTab.level2;
  }
  get activeTabL3(): string {
    return this.activeTab.level3;
  }
  get bookmarks(): HistoryItem[] {
    return MRStore.getBookmarks(store);
  }
  get history(): HistoryItem[] {
    return MRStore.getHistory(store);
  }
  get isLoading(): boolean {
    return getIsLoading(store);
  }
  get isMapLoaded(): boolean {
    return getIsMapLoaded(store);
  }
  get searchedAddress(): api.GeoSuggestion {
    return getSearchedAddress(store);
  }
  get fullAddress(): api.GeoAddress {
    return getFullAddress(store);
  }
  get isAddressLoading(): boolean {
    return getIsAddressLoading(store);
  }
  get ads(): api.PubLightModel[] {
    console.log(MRStore.getAds(store))
    return MRStore.getAds(store);
  }
  get buildingInfo(): api.BuildingModel {
    return MRStore.getBuildingInfo(store);
  }
  get apartments(): api.ApartmentLightModel[] {
    if (!this.buildingInfo) return [];
    return this.buildingInfo.apartments;
  }
  get formErrors(): ErrorField[] {
    return this.$validator.errors.items;
  }
  get minMaxInput() {
    if (!this.formModel) return;
    return {
      price: {
        defaultLimits: this.defaultMinMaxValuesForFields.price,
        values: this.formModel.price,
      },
      rooms: {
        defaultLimits: this.defaultMinMaxValuesForFields.rooms,
        values: this.formModel.rooms,
      },
      livingSpace: {
        defaultLimits: this.defaultMinMaxValuesForFields.livingSpace[this.formModel.propertyType.id],
        values: this.formModel.livingSpace,
      },
      propertyArea: {
        defaultLimits: this.defaultMinMaxValuesForFields.propertyArea,
        values: this.formModel.propertyArea,
      },
      builtYear: {
        defaultLimits: this.defaultMinMaxValuesForFields.builtYear,
        values: this.formModel.builtYear,
      },
      renovationYear: {
        defaultLimits: this.defaultMinMaxValuesForFields.builtYear,
        values: this.formModel.renovationYear,
      },
    };
  }
  get validatorLivingSpace() {
    const limits = this.getMinMaxForField('livingSpace');
    return { required: true, min_value: limits.min, max_value: limits.max };
  }
  get validatorRenovationBuild() {
    return { min_value: this.formModel.builtYear.value, max_value: this.getMinMaxForField('builtYear').max };
  }
  get isAllApproved() {
    if (this.formErrors.length) return false;
    for (const key in this.approved.mandatory) {
      if (key === 'propertyArea' && this.formModel.propertyType.id === api.PubPropertyWellKnownCategory.Apartment) {
        continue;
      }
      if (!this.approved.mandatory[key]) return false;
    }
    if (this.formModel.transaction.active) {
      for (const key in this.approved.transaction) {
        if (!this.approved.transaction[key]) return false;
      }
    }
    for (const key in this.approved.optional) {
      if (this.formModel[key].active) {
        if (!this.approved.optional[key]) return false;
      }
    }
    return true;
  }
  get statistics() {
    return MRStore.getStatistics(store);
  }
  get loadedAddressParts() {
    return getAddressParts(store);
  }

  // METHODS
  async analyse(approveAll: boolean = false) {
    if (approveAll) {
      this.approveAll();
    }
    await this.$validator.validateAll();
    if (this.formErrors.length && !this.loadingFromHistory) return;

    this.$nextTick(() => {
      const model = Object.assign({}, this.formModel);
      MRStore.setMarketRadarModel(store, model);
      this.fetchSimilarObject();
      this.fetchAnalytics();
    });

    if (!this.loadingFromHistory) {
      const payload = { name: this.generateEntryName(this.formModel, this.searchedAddress.name), query: this.formModel };
      MRStore.dispatchCreateHistoryEntry(store, payload).then(() => {
        this.getHistory();
      });
    }
  }
  fetchSimilarObject() {
    const query: api.IPubQuery = this.modelToPubQuery();
    if (MRStore.getSimilarObjects(this.$store).length) {
      MRStore.setSimilarObjects(store, []);
    }
    api.$pubs.find(query).then((publication: api.ISearchResult<api.PubLightModel>) => {
      if (publication?.items.length) {
        const similarObjects: Publication[] = [];
        for (const i in publication.items) {
          similarObjects.push(new Publication(publication.items[i]));
        }
        this.setActiveTab('similarObjects', 1, true);
        MRStore.setSimilarObjects(store, similarObjects);
      }
    });

    const queryAny = _.cloneDeep(query);
    queryAny.publicationStatuses = api.PubQueryStatuses.Any;
    api.$pubs.stats.getPubCountPerQuarter(queryAny).then((statistics: api.PubStatsPubCountPerQuarterModel[]) => {
      MRStore.setMarketAnyStatisticModel(store, statistics);
    });

    const queryOnlyActive = _.cloneDeep(query);
    queryOnlyActive.publicationStatuses = api.PubQueryStatuses.Active;
    api.$pubs.stats.getPubCountPerQuarter(queryOnlyActive).then((statistics: api.PubStatsPubCountPerQuarterModel[]) => {
      MRStore.setMarketOnlyActiveStatisticModel(store, statistics);
    });
  }
  async fetchAnalytics() {
    MRStore.setPredictionIsLoading(store, true);
    const queryAds: api.IPropertyPubPricePredictionQuery = api.$newObj(api.PropertyPubPricePredictionQuery);
    queryAds.addressId = this.searchedAddress.uniqueIdentifier;
    queryAds.builtYear = this.formModel.builtYear.value;
    queryAds.livingArea = this.formModel.livingSpace.value;
    queryAds.propertyArea = this.formModel.propertyArea.value;
    queryAds.propertyCategory = this.formModel.propertyType.id;
    queryAds.roomCount = this.formModel.rooms.value;
    queryAds.transactionType = this.formModel.transactionType;
    queryAds.renovationYear = this.formModel.renovationYear.value;

    if (this.formModel.transaction.active) {
      const transaction = this.formModel.transaction;
      const query: api.IPropertyTransPricePredictionQuery = api.$newObj(api.PropertyTransPricePredictionQuery);
      query.addressId = this.searchedAddress.uniqueIdentifier;
      query.builtYear = this.formModel.builtYear.value;
      query.livingArea = this.formModel.livingSpace.value;
      query.propertyArea = this.formModel.propertyArea.value;
      query.propertyCategory = this.formModel.propertyType.id;
      query.roomCount = this.formModel.rooms.value;
      query.transactionType = this.formModel.transactionType;
      query.microLocation = transaction.microLocation.id;
      query.quality = transaction.constructionQuality.id;
      query.garageCount = transaction.garageCount;
      query.cubature = transaction.cubature;
      query.bathroomsCount = transaction.bathroomsCount;
      query.condition = transaction.buildingCondition.id;
      query.houseType = transaction.houseType.id;

      const transactionAnalytics = await api.$properties.getTransPricePrediction(query);
      MRStore.setPredictionTransaction(store, transactionAnalytics[0].price);
    }

    const responses = await Promise.all([
      api.$properties.getPubPricePrediction(queryAds),
      api.$pubs.stats.getPubPricesForCountryAndCanton(this.modelToPubQuery(), this.fullAddress.stateId),
    ]);

    const adsPrediction = responses[0];
    MRStore.setPredictionStatistics(store, adsPrediction.stats);
    if (adsPrediction) {
      MRStore.setPredictionAds(store, adsPrediction.price);
    }

    const statistics = responses[1];
    MRStore.setCountryStatisticModel(store, statistics.country);
    MRStore.setCantonStatisticModel(store, statistics.canton);
    MRStore.setPredictionIsLoading(store, false);
  }
  modelToPubQuery() {
    const query: api.IPubQuery = api.$newObj(api.PubQuery);
    query.transactionType = this.formModel.transactionType;
    query.propertyCategoryIds = [this.formModel.propertyType.id];
    query.price = this.formModel.price;
    query.roomCount = this.formModel.rooms;
    query.livingArea = this.formModel.livingSpace;
    query.propertyArea = this.formModel.propertyArea;
    query.builtYear = this.formModel.builtYear;
    query.publisherTypes = api.PubQueryPublisherTypes.Any;
    query.publicationStatuses = api.PubQueryStatuses.Any;
    query.searchArea = this.convertGeoSearchModel(this.formModel.geoSearch, this.searchedAddress.uniqueIdentifier);

    const historicAds = this.formModel.historicAds;
    if (this.formModel.activeAds && historicAds.active) {
      query.publicationStatuses = api.PubQueryStatuses.Any;
    } else {
      if (this.formModel.activeAds) {
        query.publicationStatuses = api.PubQueryStatuses.Active;
      } else {
        query.publicationStatuses = api.PubQueryStatuses.Inactive;
        query.inactivePublicationTime = <api.SearchQueryRangeOfDateTime>{
          min: new Date(`${historicAds.yearFrom}-1-1`),
          max: new Date(`${historicAds.yearTo}-12-31`),
        };
      }
    }
    query.maxItemCount = 100;
    delete query.pageSize;
    delete query.page;
    return query;
  }
  approveAll() {
    for (const key in this.approved.mandatory) {
      this.approved.mandatory[key] = true;
    }
    if (this.formModel.transaction.active) {
      for (const key in this.approved.transaction) {
        this.approved.transaction[key] = true;
      }
    }
    for (const key in this.approved.optional) {
      if (this.formModel[key].value) {
        this.approved.optional[key] = true;
      }
    }
  }
  disApproveAll() {
    for (const key in this.approved.mandatory) {
      this.approved.mandatory[key] = false;
    }
    for (const key in this.approved.transaction) {
      this.approved.transaction[key] = false;
    }
    for (const key in this.approved.optional) {
      this.approved.optional[key] = false;
    }
  }
  getBookmarks() {
    MRStore.dispatchGetBookmarks(store).then(() => {
      this.sidebarTabs[0].visible = !!this.bookmarks.length;
    });
  }
  getHistory() {
    MRStore.dispatchGetHistory(store).then(() => {
      this.sidebarTabs[1].visible = !!this.history.length;
    });
  }
  async searchAgain(historyEntry: HistoryItem) {
    this.reset();
    this.setActiveTab('search', 1);
    this.setActiveTab('address', 2);
    setIsLoading(store, true);
    setIsAddressLoading(store, true);
    const history = await api.$queryLists.marketRadar.$entry(historyEntry.id).get();
    const historyQuery: MarketRadarModel = history.query as MarketRadarModel;
    const entranceId = historyQuery.searchArea.addressParts.find(x => x.type === api.GeoAddressPartType.EntranceAddress).id;
    const address = await api.$geo.getAddress(entranceId);
    const suggestion: api.GeoSuggestion = new api.GeoSuggestion({
      uniqueIdentifier: entranceId,
      name: `${address.street} ${address.streetNumber}, ${address.zip} ${address.locality}`,
      coordinates: new api.GeoCoordinates({
        longitude: address.coordinates.longitude,
        latitude: address.coordinates.latitude,
      }),
    });
    this.loadingFromHistory = true;
    setSearchedAddress(store, suggestion);
    await this.loadAddress(true);

    if (this.apartments.length) {
      this.selectedApartment = this.apartments[0];
      this.setActiveTab('apartments', 3);
    }
    if (this.ads.length) {
      this.selectedAd = this.ads[0];
      this.setActiveTab('ads', 3);
    }

    const model = new MarketRadarModel();
    model.searchArea = historyQuery.searchArea;
    model.geoSearch = historyQuery.geoSearch;
    model.transactionType = historyQuery.transactionType;
    model.propertyType = historyQuery.propertyType;
    model.price = historyQuery.price;
    model.rooms = historyQuery.rooms;
    model.livingSpace = historyQuery.livingSpace;
    model.propertyArea = historyQuery.propertyArea;
    model.builtYear = historyQuery.builtYear;
    model.renovationYear = historyQuery.renovationYear;
    model.activeAds = historyQuery.activeAds;
    model.historicAds = historyQuery.historicAds;
    model.transaction = historyQuery.transaction;
    MRStore.setFormModel(store, model);

    if (model.geoSearch.radius) {
      EventBus.$emit('map:drawRadiusAroundPoint', model.geoSearch.radius);
    }
    const area = model.geoSearch.area;
    if (area) {
      const response = await api.$geo.getAddressPart(area.id);
      const shape: MapShape = {
        id: 'geoAreaShape',
        name: area.name,
        geom: response.geom,
        type: area.type,
        addressId: this.searchedAddress.uniqueIdentifier,
      };
      EventBus.$emit('map:drawShape', shape);
    }

    setIsLoading(store, false);
    this.analyse(true).then(() => {
      this.loadingFromHistory = false;
    });
  }
  toggleIsFavoriteHistoryEntry(historyEntry: HistoryItem) {
    MRStore.dispatchToggleIsFavoriteHistoryEntry(store, historyEntry)
      .then(() => {
        this.sidebarTabs[0].visible = !!this.bookmarks.length;
        this.sidebarTabs[1].visible = !!this.history.length;
      });
  }
  editBookmarkName(payload: { entry: HistoryItem, name: string }) {
    MRStore.dispatchEditBookmarkEntryName(store, payload).then(() => {
      payload.entry.name = payload.name;
    });
  }
  async removeFromHistory(historyEntry: HistoryItem) {
    this.$set(historyEntry, 'isDeleting', true);
    await MRStore.dispatchRemoveHistoryEntry(store, historyEntry.id);
    this.sidebarTabs[1].visible = !!this.history.length;
    this.$set(historyEntry, 'isDeleting', false);
  }
  removeAddressItem() {
    setSearchedAddress(store, null);
    this.reset();
  }
  reset(fromAutocomplete?: boolean) {
    this.disApproveAll();
    this.loadingFromHistory = false;
    clearAddressParts(store);
    setMapPoint(store, null);
    setIsEnabledRightSidebar(store, false);

    if (!fromAutocomplete) {
      MRStore.dispatchReset(store);
      setFullAddress(store, null);
    }
  }
  setIsTransaction(transaction: boolean) {
    this.formModel.transaction.active = transaction;
    if (transaction) {
      this.formModel.transactionType = api.PubTransactionType.Buy;
      this.$nextTick(() => {
        this.$validator.validateAll('marketRadarFormTransaction');
      });
    }
  }
  async loadAddress(fromHistory: boolean = false) {
    setMapPoint(store, {
      coordinates: this.searchedAddress.coordinates,
      id: this.searchedAddress.uniqueIdentifier,
    });
    const response = await Promise.all([
      api.$pubs.findByEntrance(this.searchedAddress.uniqueIdentifier),
      api.$building(this.searchedAddress.uniqueIdentifier).get(),
      api.$geo.getAddress(this.searchedAddress.uniqueIdentifier),
    ]);
    const ads = response[0] || [];
    const buildingInfo = response[1] as api.BuildingModel;
    const fullAddress = response[2] as api.GeoAddress;
    MRStore.setAds(store, ads);
    MRStore.setBuildingInfo(store, buildingInfo);
    setFullAddress(store, fullAddress);
    setIsAddressLoading(store, false);
    setIsEnabledRightSidebar(store, true);
    setSidebarState(store, { visible: true, isRight: true });

    if (fromHistory) return;

    const model = new MarketRadarModel();
    const addressPart: api.GeoAreaAddressPart = api.$newObj(api.GeoAreaAddressPart);
    addressPart.id = this.searchedAddress.uniqueIdentifier;
    addressPart.type = api.GeoAddressPartType.EntranceAddress;

    const locality = await api.$geo.getAddressPart(fullAddress.localityId);
    this.loadedAddressParts.Locality = locality;
    model.geoSearch.area = <api.GeoAreaAddressPart>{
      id: fullAddress.localityId,
      type: api.GeoAddressPartType.Locality,
      geom: locality.geom,
    };
    const shape: MapShape = {
      id: 'geoAreaShape',
      name: locality.name,
      geom: locality.geom,
      type: api.GeoSuggestionType.Canton,
      addressId: this.searchedAddress.uniqueIdentifier,
    };
    EventBus.$emit('map:drawShape', shape);

    if (ads.length) {
      this.selectedAd = ads[0];
      this.setActiveTab('ads', 3);
      model.price.value = this.selectedAd.financialInfo.totalPriceCalculated;
    } else if (this.apartments.length) {
      this.setActiveTab('apartments', 3);
    }
    if (this.apartments.length) {
      this.selectedApartment = this.apartments[0];
      model.rooms.value = this.selectedApartment.primaryInfo.roomCount;
      model.livingSpace.value = this.selectedApartment.primaryInfo.livingArea;
    }

    model.searchArea.addressParts = [addressPart];
    model.transactionType = api.PubTransactionType.Buy;
    model.propertyType = this.propTypes[+(this.apartments?.length === 1)];
    model.propertyArea.value = buildingInfo?.realProperty?.primaryInfo?.area || null;
    model.builtYear.value = buildingInfo?.primaryInfo?.builtYear || null;

    const livingSpaceLimits = this.defaultMinMaxValuesForFields['livingSpace'];
    model.livingSpace = this.getFieldMinMax('livingSpace', model.livingSpace.value, livingSpaceLimits[model.propertyType.id]);
    model.rooms = this.getFieldMinMax('rooms', model.rooms.value);

    MRStore.setFormModel(store, model);
    this.$validator.validateAll();
  }
  setPricingInfoTab(tab: string) {
    this.setActiveTab(tab, 3);
    this.minimized[tab] = true;
  }
  getMinMaxForField(field: string) {
    const limits = this.defaultMinMaxValuesForFields[field];
    const propType = this.formModel.propertyType;
    if (field === 'livingSpace') {
      return propType ? limits[propType.id] : limits[200];
    }
    return limits;
  }
  selectAd(ad: api.PubLightModel) {
    this.selectedAd = ad;
    const livingSpace = this.selectedAd.primaryInfo.layout.size.areaLiving.value;
    this.formModel.price = this.getFieldMinMax('price', this.selectedAd.financialInfo.totalPriceCalculated);
    this.formModel.rooms = this.getFieldMinMax('rooms', this.selectedAd.primaryInfo.layout.rooms.roomCount.value);
    this.formModel.livingSpace = this.getFieldMinMax('livingSpace', livingSpace, this.getMinMaxForField('livingSpace'));
    this.minimized.ads = true;
  }
  selectApartment(apartment: api.ApartmentLightModel) {
    this.selectedApartment = apartment;
    const livingSpace = this.selectedApartment.primaryInfo.livingArea;
    this.formModel.rooms = this.getFieldMinMax('rooms', this.selectedApartment.primaryInfo.roomCount);
    this.formModel.livingSpace = this.getFieldMinMax('livingSpace', livingSpace, this.getMinMaxForField('livingSpace'));
    this.minimized.apartments = true;
  }
  toggleModal(name: string, visible: boolean) {
    this.modal.show = visible;
    this.modal.item = visible ? name : '';
  }
  closeModalAndToggleSearch() {
    this.setActiveTab('search', 1);
    this.setActiveTab('address', 2);
    this.toggleModal(null, false);
  }
  modalAction() {
    switch (this.modal.item) {
      case 'history':
        this.removingHistoryInProgress = true;
        MRStore.dispatchRemoveAllHistory(store).then(() => {
          this.removingHistoryInProgress = false;
          this.sidebarTabs[1].visible = false;
          this.closeModalAndToggleSearch();
        });
        break;
      case 'bookmarks':
        this.removingBookmarksInProgress = true;
        MRStore.dispatchRemoveAllBookmarks(store).then(() => {
          this.removingBookmarksInProgress = false;
          this.sidebarTabs[0].visible = false;
          this.closeModalAndToggleSearch();
        });
        break;
    }
  }

  // WATCHERS
  @Watch('searchedAddress')
  onAddressChange() {
    if (!this.searchedAddress || this.loadingFromHistory) return;
    setIsAddressLoading(store, true);
    this.loadAddress();
    this.setActiveTab('overview', 1, true);
  }

  @Watch('formModel', { deep: true })
  onModelChange() {
    if (!this.formModel) return;
    this.$nextTick(async () => {
      await this.$validator.validateAll();
      if (this.formErrors.length) return;
      if (!this.formModel.geoSearch.area && !this.formModel.geoSearch.radius) return;
      this.fetchSimilarObject();
    });
    if (!this.formModel.activeAds && !this.formModel.historicAds.active) {
      this.formModel.historicAds.active = true;
    }
    if (!this.formModel.activeAds && !this.formModel.historicAds.active) {
      this.formModel.activeAds = true;
    }
  }
}
