import Vue from 'vue';
import { Component } from 'vue-property-decorator';
Component.registerHooks([
  'beforeRouteLeave',
]);
import template from './Search.vue';
import OverviewList from '../../components/searchModule/overviewList/';
import MapRightSidebar from '../../components/searchModule/mapRightSidebar/';
import SearchMap from '../../components/map/search';
import LeftSidebar from '../../components/searchModule/leftSidebar/leftSidebar';
import store from '../../store';
import { PubModel, $newObj, GeoCoordinates } from '@immosparrow/cockpit-api-v2';
import * as globalState from '../../store/modules/globalStatesModule';
interface TravelTime {
  by: string; color: string; pointId: string; rushHour: boolean; rushHourStartTime: string; time: number;
}
export interface Polygon {
  center: number[]; color: string; drawStyle: string; geom: { coordinates: []; type: string }; id: string; inifinite: boolean; name: string;
}

@Component({
  mixins: [template],
  components: {
    OverviewList,
    SearchMap,
    LeftSidebar,
    MapRightSidebar,
  },
})
export default class Search extends Vue {
  mapSearchResults: { time: number, items: { id: string; coordinates: GeoCoordinates }[] } = null;
  showAd: PubModel = new PubModel();
  travelTimeData: TravelTime = null;
  travelPolygon: { geo: []; id: string } = null;
  addressForTheMap: { geom: { coordinates: []; type: string }, id: string, color: string } = null;
  addressForRemoveFromMap: { id: string; time: number } = null;
  shapeForRemoveFromMap: { id: string; time: number } = null;
  addressForRemoveFromList: { id: string; time: number } = null;
  layerToRemoveById: { id: string; time: number } = null;
  addressFromMapObject: { name: string; id: string; color: string; type: number; geom: any; fromClick: boolean; time: number } = null;
  shapeFromMap: Polygon = null;
  symbolLayerFromMap: { shape: Polygon, time: number } = null;
  travelPolygonPoint: { id: string; geom: { coordinates: [] }; color: string } = null;
  setTravelPointValue: boolean = false;
  interactWithLayersOnMap: string = '';
  drawPolygonMode: { type: string; time: number } = null;
  layerWithRadius: { id: string; radius: number; time: number; isShape: boolean; geom?: any } = null;
  shapeWithUpdatedRadius: { geom: any; id: string } = null;
  addressWithRadiusUpdated: { id: string; time: number, geometry: { type: string; coordinates: [number[]] } } = null;
  viewPortForSearchShapes: { id: string, color: string, name: string, polygon: [], show: boolean } = null;
  viewPortForSearchMap: { id: string, color: string, name: string, polygon: [], show: boolean } = null;
  getViewPortModel: { time: number } = null;
  resetMap: { time: number } = null;
  mapInteraction: { val: boolean; time: number } = null;
  mapToSearchArea: { val: boolean; time: number } = null;
  searchArealLayersVisibility: { val: boolean; time: number } = null;
  shapeToDrawOnMap: { geom: { coordinates: []; type: string }, id: string, color: string, name: string } = null;
  setAdsInViewport(results: { id: string; coordinates: GeoCoordinates }[]) {
    this.mapSearchResults = {
      time: new Date().getTime(),
      items: results,
    };
  }
  selectAd(ad: PubModel) {
    this.showAd = ad;
    globalState.commitShowMapRightSidebar(store, true);
  }

  created() {
    // const self = this;
    this.$root.$on('remove_all_results', () => {
      // self.results = [];
      globalState.commitShowMapRightSidebar(store, false);
      document.getElementsByClassName('switch_style')[0].className = 'switch_style mapboxgl-ctrl-group mapboxgl-ctrl';
    });
  }

  beforeRouteLeave(to: any, from: any, next: any) {
    this.$root.$emit('agencyWorkspaceRestriction', false);
    next();
  }

  // left sidebar action
  addAddressShapeToMap(address: { geom: { coordinates: []; type: string }, id: string, color: string; time: number }) {
    this.addressForTheMap = address;
  }
  removeAddressFromMap(id: string) {
    this.addressForRemoveFromMap = {
      id,
      time: new Date().getTime(),
    };
  }
  // left sidebar actions end

  // map actions start
  addressFromMap(address: { name: string; id: string; color: string; type: number; geom: any; fromClick: boolean; time: number }) {
    this.addressFromMapObject = address;
  }
  addressFromMapRemove(o: { id: string; time: number }) {
    this.addressForRemoveFromList = o;
  }
  // map actions end

  circleCreated(circle: Polygon) {
    this.shapeFromMap = circle;
  }

  polygonCreated(polygon: Polygon) {
    this.shapeFromMap = polygon;
  }

  removeShapeFromMap(shape: { id: string; time: number }) {
    this.shapeForRemoveFromMap = shape;
  }

  addSymbolLayer(data: { shape: Polygon, time: number }) {
    this.symbolLayerFromMap = data;
  }

  travelTimeUpdate(data: TravelTime) {
    this.travelTimeData = data;
  }
  travelPolygonCreated(data: { geo: any; id: string }) {
    this.travelPolygon = data;
  }
  removeLayerById(id: string) {
    this.layerToRemoveById = {
      id,
      time: new Date().getTime(),
    };
  }
  travelPolygonPointCreated(point: { id: string; geom: { coordinates: [] }; color: string }) {
    this.travelPolygonPoint = point;
  }
  setTravelPoint(value: boolean) {
    this.setTravelPointValue = value;
  }
  interactWithMap(interactWith: string) {
    this.interactWithLayersOnMap = interactWith;
  }
  startPolygonDraw(val: string) {
    this.drawPolygonMode = { type: val, time: new Date().getTime() };
  }
  addOrUpdateLayerWithRadius(o: { id: string; radius: number, isShape: boolean; geom?: any }) {
    this.layerWithRadius = {
      id: o.id,
      radius: o.radius,
      time: new Date().getTime(),
      isShape: o.isShape,
      geom: o.geom,
    };
  }

  updateShapeGeometry(o: { geom: any; id: string }) {
    this.shapeWithUpdatedRadius = o;
  }

  layerWithRadiusUpdated(o: { id: string; time: number, geometry: { type: string; coordinates: [number[]] } }) {
    this.addressWithRadiusUpdated = o;
  }

  addViewPortToSearchShapes(o: { id: string, color: string, name: string, polygon: [], show: boolean }) {
    this.viewPortForSearchShapes = o;
  }

  addViewPortToTheMap(o: { id: string, color: string, name: string, polygon: [], show: boolean }) {
    this.viewPortForSearchMap = o;
  }

  getViewPort() {
    this.getViewPortModel = { time: new Date().getTime() };
  }

  resetMapStyle() {
    this.resetMap = { time: new Date().getTime() };
  }
  setInteractWithMap(v: boolean) {
    this.mapInteraction = { val: v, time: new Date().getTime() };
  }

  changeSearchArealLayersVisibility(v: boolean) {
    this.searchArealLayersVisibility = { val: v, time: new Date().getTime() };
  }
  addShapeToMap(o: { geom: { coordinates: []; type: string }, id: string, color: string, name: string }) {
    this.shapeToDrawOnMap = o;
  }
  fitMapToSearchArea(v: boolean) {
    this.mapToSearchArea = { val: v, time: new Date().getTime() };
  }

}
