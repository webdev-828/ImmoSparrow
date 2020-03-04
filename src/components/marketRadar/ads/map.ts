import MapComponent, { new_counter } from '../../map';
import store from '../../../store';
import { Component, Watch, Prop } from 'vue-property-decorator';
import * as search from '../../../store/modules/searchStatesModule';
import { cc } from '../../map/radius';
import Vue from 'vue';
import PopupMultipleEntrancesComponent from '../../map/popup.multiple.e';
import * as api from '@immosparrow/cockpit-api-v2';
import mapboxgl, { Point, Popup } from 'mapbox-gl';
import Tooltip from '../../map/tooltip';
import moment from 'moment';
import { PolygonGeoJsonOptions } from '@targomo/core/typings/api/payload';
import { TargomoClient, SRID } from '@targomo/core';
import PopupMultipleAdsComponent from '../../map/popups/popup.multipleAds';
import { setTimeout } from 'timers';
import { getSearchedAddress, setSearchedAddress } from '@/store/modules/main';
import { getMapPoint } from '@/store/modules/map';
import { getBuildingInfo, getSimilarObjects, setSelectedAd, setSimilarObjects } from '@/store/modules/marketRadar';
import { EventBus } from '@/EventBus';
import { MapShape, Publication } from '../../../models';
import { setIsEnabledRightSidebar } from '../../../store/modules/sidebars';
const tgmClient = new TargomoClient('westcentraleurope', 'FBTLI0O1DTZNSIJQTU8R101440813');
interface TravelTime {
  by: string; color: string; pointId: string; rushHour: boolean; rushHourStartTime: string; time: number;
}
window.onbeforeunload = function () {
  search.commitResetState(store);
};

let lastFeatureIdClicked: string = '';
let popupsOnTheMapIds: string[] = [];
let lastFeatureId: string = '';
const popupsOnTheMap = {};
@Component({
  mixins: [],
  components: {},
})

export default class AdsMapComponent extends MapComponent {
  popups: Array<Popup> = [];
  popupsData: {
    longitude: number;
    latitude: number;
    ads: api.IPubLightModel[];
  }[] = [];
  hoveredPopup: string = '';
  clickedShape: string = '';
  hoverPopupHtml: HTMLElement = null;
  // activePopupHtml: HTMLElement = null;
  hoveredStateId: string = null;
  // clickedStateId: number = null;
  buildingIsClicked: boolean = false;
  buildingLoading: boolean = false;
  address: api.IGeoSuggestion;
  lastFsIdHover: string = '';
  lastFsLayerTypeHover: string = '';
  lastFsLayerId: string = '';
  created() {
    EventBus.$on('map:drawRadiusAroundPoint', (radius: number) => {
      this.drawRadiusAroundPoint(radius);
    });
    EventBus.$on('map:removeRadiusPoint', () => {
      this.removeRadius();
    });
    EventBus.$on('map:drawShape', this.drawAddressPartShape);
    EventBus.$on('map:removeShape', this.removeShape);
    EventBus.$on('map:removeShape', this.restrictionId = null);
    EventBus.$on('map:highlight', this.highlightOnMap);
    this.counter = new_counter(1);
  }
  @Watch('mapLoaded')
  watchMapLoaded() {
    this.map.on('click', this.buildingClick);
    this.map.on('mousemove', this.buildingsHover);
    this.map.on('mouseleave', (e: any) => {
      try {
        this.map.setPaintProperty(this.lastFsLayerId, this.d3 && !this.satelliteView ? 'fill-extrusion-color' : 'fill-color', ['case',
          ['==', ['get', 'uniqueidentifier'], lastFeatureId], '#cbc7c3',
          ['==', ['get', 'uniqueidentifier'], lastFeatureIdClicked], '#cbc7c3', '#cbc7c3',
        ]);
      } catch { }
    });
  }
  // this is market radar main point for address (entrence selected)
  @Watch('building')
  watchMapPoint() {

    if (this.building) {
      this.setObject(this.mapPoint);
    } else {
      this.setObject(null);
    }
  }

  async getClusterData(clusterData: string[]) {
    const results: api.PubLightModel[] = await api.$pubs.getMultiple(clusterData);
    return results;
  }
  get sourceFeatures() {
    return this.map.querySourceFeatures('marketRadarPointsSource');
  }
  highlightOnMap(adId: string) {

    if (!adId) {
      // in ca case of close on right sidebar and mouse leave on right sidebar
      if (this.activePopupHtml) {
        this.activePopupHtml.classList.remove('active-item');
        this.activePopupHtml = null;
      }
      if (this.clickedStateId) {
        this.map.setFeatureState({ source: 'marketRadarPointsSource', id: this.clickedStateId }, { clicked: false });
        this.clickedStateId = null;
      }
      if (this.selectedAdId != null) {
        this.selectedAdId = null;
      }
      return;
    }
    if (this.activePopupHtml) {
      this.activePopupHtml.classList.remove('active-item');
    }
    if (this.clickedStateId) {
      this.map.setFeatureState({ source: 'marketRadarPointsSource', id: this.clickedStateId }, { clicked: false });
    }
    const features = this.map.querySourceFeatures('marketRadarPointsSource');
    for (let i = 0; i < features.length; i += 1) {
      const props = features[i].properties;
      const id = props.itemId;
      // console.log(props.itemId);
      if (id === adId) {
        // console.log(adId);
        // console.log(props);
        if (!props.cluster) {
          this.activePopupHtml = document.getElementsByClassName(`popup-${features[i].geometry.coordinates[0]}-${features[i].geometry.coordinates[1]}`)[0] as HTMLElement;
          if (this.activePopupHtml) {
            this.activePopupHtml.classList.add('active-item');
            this.clickedStateId = features[i].id;
            this.map.setFeatureState({ source: 'marketRadarPointsSource', id: this.clickedStateId }, { clicked: true });
          }
        }
      }
    }
  }

  selectedAdId: string = null;
  generatePopupHtml(o: Publication[], featureId: number): Vue {
    const self = this;
    return new Vue({
      name: 'popupWithSliderAds',
      data: {
        featureId,
        adsDotData: o,
      },
      components: {
        popUp: PopupMultipleAdsComponent,
      },
      methods: {
        openAds(adInfo: api.PubLightModel, hidePopup?: boolean) {

          const { longitude, latitude } = adInfo.address.coordinates;
          const coordinate = `${longitude}-${latitude}`;
          if (hidePopup) {
            search.commitOpenedPopapDetailId(store, '');
          }
          self.selectedAdId = adInfo.id;
          EventBus.$emit('map:highlight', adInfo.id);
          api.$publication(adInfo.id).get().then((pub) => {
            setSelectedAd(self.$store, pub);
          });
        },
        removeActive() {
          // this.$root.$emit('hide_object');
          this.$root.$emit('setPopupState', { type: 'active' });
        },
      },
      template: "<pop-up :adsInfo='adsDotData' :openAds='openAds' :removeActive='removeActive'/>",
    });
  }

  @Watch('similarObjects')
  marketRadarAdsWatch(newValues: api.Publication[], oldValues: api.Publication) {

    const self = this;
    const adsWithCoordinates: any = [];
    const adsWithNoCoordinates: object[] = [];

    if (this.popups.length) {
      this.popups.forEach((popup) => {
        popup.remove();
      });
    }
    this.popupsData = [];
    this.popups = [];
    if (!this.similarObjects.length || (JSON.stringify(newValues) === JSON.stringify(oldValues))) {
      if (this.map.getSource('marketRadarPointsSource') || this.map.getLayer('marketRadarPoints')) {
        this.map.removeLayer('marketRadarPoints');
        this.map.removeLayer('cluster');
        this.map.removeLayer('cluster-count');
        this.map.removeSource('marketRadarPointsSource');
        popupsOnTheMapIds = [];
        if (Object.keys(popupsOnTheMap).length) {
          for (const e in popupsOnTheMap) {
            popupsOnTheMap[e].remove();
          }
        }
      }
    }

    if (this.similarObjects.length) {
      this.map.setPaintProperty(this.restrictionId, 'fill-color', 'rgba(250,250,250,1)');
      this.$root.$emit('map_change_size', 'small');
      document.getElementsByClassName('switch_style')[0].className = 'switch_style mapboxgl-ctrl-group mapboxgl-ctrl on_left second';
    } else {
      this.$root.$emit('map_change_size', 'big');
    }
    for (const i in this.similarObjects) {

      if (this.similarObjects[i].address.coordinates !== undefined) {
        adsWithCoordinates.push({
          id: new Date().getTime() + i,
          type: 'Feature',
          geometry: {
            type: 'Point',
            coordinates: [this.similarObjects[i].address.coordinates.longitude, this.similarObjects[i].address.coordinates.latitude],
          },
          itemId: this.similarObjects[i].id,
          properties: {
            icon: 'monument',
            itemId: this.similarObjects[i].id,
            greyOut: !this.similarObjects[i].trackingInfo.publicationInterval.isActive,
            clicked: false,
          },
        });
        const findDuplication = this.popupsData.findIndex(x => x.longitude === this.similarObjects[i].address.coordinates.longitude && x.latitude === this.similarObjects[i].address.coordinates.latitude);

        if (findDuplication === -1) {
          this.popupsData.push({
            longitude: this.similarObjects[i].address.coordinates.longitude,
            latitude: this.similarObjects[i].address.coordinates.latitude,
            ads: [this.similarObjects[i]],
          });
        } else {
          this.popupsData[findDuplication].ads.push(this.similarObjects[i]);
        }

      } else {
        adsWithNoCoordinates.push({
          id: this.similarObjects[i].id,
          coordinates: undefined,
        });
      }
    }

    if (this.popups.length) {
      this.popups.forEach((popup) => {
        popup.addTo(this.map);
      });
    }
    if (adsWithCoordinates.length) {
      // try {

      const ads = {
        type: 'geojson',
        data: {
          type: 'FeatureCollection',
          features: adsWithCoordinates,
        },
      };

      // this.map.addSource('marketRadarPointsSource', ads);
      this.clusterSource = {
        type: 'geojson',
        data: {
          type: 'FeatureCollection',
          features: adsWithCoordinates,

        },
        cluster: true,
        clusterMaxZoom: 11, // Max zoom to cluster points on
        clusterRadius: this.clusterRadius, // Radius of each cluster when clustering points (defaults to 50)
      };

      if (this.map.getSource('marketRadarPointsSource') !== undefined) {
        this.map.getSource('marketRadarPointsSource').setData(this.clusterSource);
      } else {
        this.map.addSource('marketRadarPointsSource', this.clusterSource);
      }
      // this.map.addSource('marketRadarPointsSource', this.clusterSource);
      this.cluster = {
        id: 'cluster',
        type: 'circle',
        source: 'marketRadarPointsSource',
        filter: ['has', 'point_count'],
        minzoom: 1,
        paint: {
          'circle-color': ['case',
            ['boolean', ['feature-state', 'hover'], false],
            '#1d86ce',
            '#51bbd6',
          ],
          'circle-radius': [
            'step',
            ['get', 'point_count'],
            20, 100,
            30, 750,
            40,
          ],
        },
      };
      if (self.map.getLayer('cluster') === undefined) {
        self.map.addLayer(this.cluster);
        this.mapLayerIds.push('cluster');
      }

      this.clusterSymbol = {
        id: 'cluster-count',
        type: 'symbol',
        source: 'marketRadarPointsSource',
        filter: ['>=', 'point_count', 2],
        layout: {
          'text-field': '{point_count_abbreviated}',
          'text-font': ['DIN Offc Pro Medium', 'Arial Unicode MS Bold'],
          'text-size': 12,
        },
        paint: {
          'text-color': '#fafafa',
        },
      };
      if (self.map.getLayer('cluster-count') === undefined) {
        self.map.addLayer(this.clusterSymbol);
        this.mapLayerIds.push('cluster-count');
      }
      this.map.on('click', 'cluster', (e: any) => {
        const features = this.map.queryRenderedFeatures(e.point, { layers: ['cluster'] });
        const clusterId = features[0].properties.cluster_id;
        this.map.getSource('marketRadarPointsSource').getClusterExpansionZoom(clusterId, (err: any, zoom: any) => {
          // updateMarkers();
          if (err) {
            return;
          }
          this.map.easeTo({
            zoom,
            center: features[0].geometry.coordinates,
          });
        });
      });
      const mousemove = (e: any) => {
        // console.log(e);
        if (e.features.length > 0) {
          if (this.hoveredStateId) {
            this.map.setFeatureState({ source: 'marketRadarPointsSource', id: this.hoveredStateId }, { hover: false });
          }
          this.hoveredStateId = e.features[0].id;
          this.map.setFeatureState({ source: 'marketRadarPointsSource', id: this.hoveredStateId }, { hover: true });
        }
        this.map.getFeatureState({ source: 'marketRadarPointsSource', id: this.hoveredStateId });
        this.map.getCanvas().style.cursor = 'pointer';
      };

      const mouseleave = () => {
        this.map.getCanvas().style.cursor = '';
        if (this.hoveredStateId) {
          this.map.setFeatureState({ source: 'marketRadarPointsSource', id: this.hoveredStateId }, { hover: false });
        }
        this.hoveredStateId = null;
      };
      this.map.on('mousemove', 'cluster', (e: any) => {
        mousemove(e);
      });

      // this.map.on('mousemove', 'marketRadarPoints', (e: any) => {
      //  mousemove(e);
      // });

      this.map.on('mouseleave', 'cluster', () => {
        mouseleave();
      });

      const colorExpressionPoint = [
        'case',
        ['==', ['get', 'greyOut'], true], '#999',
        ['==', ['feature-state', 'clicked'], true], '#ff2b14',
        '#11b4da',
      ];

      const up = {
        id: 'marketRadarPoints',
        type: 'circle',
        source: 'marketRadarPointsSource',
        filter: ['!has', 'point_count'],
        paint: {
          'circle-color': colorExpressionPoint,
          'circle-radius': 6,
          'circle-stroke-width': 1,
          'circle-stroke-color': '#fff',
        },
      };

      this.markers.push(up);
      this.markerSources.push(ads);
      // we need to add actual makret radar address to the points for clusters as well
      adsWithCoordinates.push({
        id: 2222222222222,
        type: 'Feature',
        geometry: {
          type: 'Point',
          coordinates: [this.mapPoint.coordinates.longitude, this.mapPoint.coordinates.latitude],
        },
        itemId: this.mapPoint.id,
        properties: {
          icon: 'monument',
          itemId: this.mapPoint.id,
        },
      });
      // if (this.map.getLayer('cluster')) {
      const coordsMin = [Math.min.apply(Math, adsWithCoordinates.map((o: any) => {
        return o.geometry.coordinates[0];
      })), Math.min.apply(Math, adsWithCoordinates.map((o: any) => {
        return o.geometry.coordinates[1];
      }))];
      const coordsMax = [Math.max.apply(Math, adsWithCoordinates.map((o: any) => {
        return o.geometry.coordinates[0];
      })), Math.max.apply(Math, adsWithCoordinates.map((o: any) => {
        return o.geometry.coordinates[1];
      }))];
      this.map.fitBounds([coordsMin, coordsMax], { padding: 120 });
      this.map.addLayer(up);
      this.mapLayerIds.push('marketRadarPoints');
      this.mapLayerIds.push('marketRadarPointsSource');
      // this.$root.$emit('marketRadarAdsInViewport', results);

      // this is turned off because we need to remove everything (right, left sidebar and all data in order to display new buidling info)
      // this.map.off('click', this.buildingClick);
      // this.map.off('mousemove', this.buildingsHover);

      this.map.on('click', 'marketRadarPoints', (e: any) => {
        if (this.clickedStateId !== e.features[0].id) {
          self.selectedAdId = e.features[0].properties.itemId;
          EventBus.$emit('map:highlight', e.features[0].properties.itemId);
          api.$publication(e.features[0].properties.itemId).get().then((pub) => {
            setSelectedAd(this.$store, pub);
          });
        }
      });

      // Change the cursor to a pointer when the mouse is over the places layer.
      this.map.on('mousemove', 'marketRadarPoints', () => {
        this.map.getCanvas().style.cursor = 'pointer';
      });

      // Change it back to a pointer when it leaves.
      this.map.on('mouseleave', 'marketRadarPoints', () => {
        this.map.getCanvas().style.cursor = '';
      });

      const updateMarkers = () => {
        // timeout must be set here because map features does not detected that they dont belong to a cluster anymore.
        setTimeout(() => {
          const features = this.map.querySourceFeatures('marketRadarPointsSource');
          for (let i = 0; i < features.length; i += 1) {
            const coords = features[i].geometry.coordinates;
            const props = features[i].properties;
            const id = props.itemId;
            // console.log(props);
            const o = this.similarObjects.filter((e) => {
              if (e.id === props.itemId) {
                return e;
              }
            });
            // console.log(o);
            if (!props.cluster) {
              // console.log('razbijen je klaster');
              if (o.length) {
                const html = self.generatePopupHtml(o, features[i].id).$mount();
                const popup = self.generatePopup(coords, html);
                if (popupsOnTheMapIds.indexOf(id) === -1) {
                  popup.addTo(this.map);
                  popupsOnTheMapIds.unshift(id);
                  popupsOnTheMap[id] = popup;
                  // console.log(popupsOnTheMap);
                }
              }
            } else {
              const clusterSource = this.map.getSource('marketRadarPointsSource');

              clusterSource.getClusterLeaves(features[i].properties.cluster_id, 100000000, 0, (err: any, aFeatures: any) => {
                aFeatures.filter((f: any) => {
                  if (popupsOnTheMap[f.itemId]) {
                    popupsOnTheMap[f.itemId].remove();
                    popupsOnTheMapIds.filter((e, index) => {
                      if (e === f.itemId) {
                        popupsOnTheMapIds.splice(index, 1);
                      }
                    });
                  }
                });
              });
            }
          }
        }, 100);
      };

      this.map.once('idle', (e: any) => {
        updateMarkers();
        this.map.on('zoomend', updateMarkers);
      });

    }
  }

  get building() {
    return getBuildingInfo(this.$store);
  }
  get mapPoint() {
    return getMapPoint(this.$store);
  }

  get similarObjects() {
    return getSimilarObjects(this.$store);
  }

  async setObject(address?: api.IGeoSuggestion) {

    if (address != null) {
      // set building shape and hilight building
      this.highlightBuilding(this.building, address);
      this.setBuildingAreaShape();

      const geojson = {
        type: 'FeatureCollection',
        features: [{
          type: 'Feature',
          geometry: {
            type: 'Point',
            coordinates: [address.coordinates.longitude, address.coordinates.latitude],
          },
        }],
      };

      const pointSource = {
        type: 'geojson',
        data: geojson,
      };
      const pointLayer = {
        id: 'point',
        type: 'circle',
        source: 'point',
        paint: {
          'circle-radius': 10,
          'circle-color': '#ff2b14',
          'circle-stroke-width': 1,
          'circle-stroke-color': '#fff',
        },
      };
      // do not zoom if already zoomed
      if (!this.map.getLayer('point')) {
        this.map.setZoom(18);
        this.mapZoom = 18;
        this.map.setCenter([address.coordinates.longitude, address.coordinates.latitude]);
      }

      try {
        this.map.addSource('point', pointSource);
        this.map.addLayer(pointLayer);

        this.markers.push(pointLayer);
        this.markerSources.push(pointSource);

      } catch (err) {
        this.map.getSource('point').setData(geojson);
      }
    } else {

      // remove point  if any
      this.map.removeLayer('point');
      this.map.removeSource('point');
      this.removeRadius();
      this.removeShape('geoAreaShape');

      // remove building if any
      this.removeBuildingAreaShape();
      this.map.getCanvas().style.cursor = 'pointer';

      this.map.setPaintProperty(this.lastFsLayerId, this.d3 && !this.satelliteView ? 'fill-extrusion-color' : 'fill-color', ['case',
        ['==', ['get', 'uniqueidentifier'], lastFeatureId], '#cbc7c3',
        ['==', ['get', 'uniqueidentifier'], lastFeatureIdClicked], '#cbc7c3', '#cbc7c3',
      ]);
      lastFeatureId = '';
      lastFeatureIdClicked = '';

      this.map.on('click', this.buildingClick);
      this.map.on('mousemove', this.buildingsHover);
    }

  }
  // radius add/remove start
  removeRadius() {
    try {
      this.map.removeLayer('radius');
      this.map.removeSource('radius');
    } catch { }
  }
  drawRadiusAroundPoint(radius: number) {
    try {
      this.map.removeLayer('radius');
      this.map.removeSource('radius');
    } catch { }

    let source = null;
    if (this.mapPoint.coordinates) {
      source = cc([this.mapPoint.coordinates.longitude, this.mapPoint.coordinates.latitude], radius);
    } else {
      const c = this.mapPoint.coordinates;
      source = cc([c.longitude, c.latitude], radius);
    }

    const radiusLayer = {
      source,
      id: 'radius',
      type: 'fill',
      layout: {},
      paint: {
        'fill-color': '#d61683',
        'fill-opacity': 0.3,
        'fill-outline-color': '#ccc',
      },
      'data.uniqueIdentifier': { id: this.mapPoint.id },
    };
    // when second parametar is defined, that means that layer that you are drwaing is below layer in second parametar
    this.map.addLayer(radiusLayer, this.layersForHover[0]);
    this.$emit('radiusSource', source.data.features[0].geometry);
    this.removeShape('geoAreaShape');
  }
  // radius remove/add end
  restrictionId: string = null;
  // draw locality, canton, district start
  drawAddressPartShape(shape: MapShape) {
    this.restrictionId = shape.id;
    this.map.addSource(shape.id, {
      type: 'geojson',
      data: shape.geom,
    });
    const polygonLayer = {
      id: shape.id,
      type: 'fill',
      source: shape.id,
      paint: {
        'fill-color': '#87CEEB',
        'fill-opacity': 0.6,
        'fill-outline-color': '#000',
      },
      properties: {
        type: 'withSourceId',
      },
    };
    this.map.addLayer(polygonLayer, this.layersForHover[0]);
    this.mapLayerIds.push(shape.id);
    this.removeRadius();
  }
  // draw locality, canton, district end

  /*
    building map interactions
    1. set property area
    2. remove buidling area
    3. select building from mapbox layers (ac-*)
    4. building click
    5. building hover
  */

  setBuildingAreaShape(building?: api.BuildingModel) {

    try {

      if (this.map.getLayer('buildingAreaShapeLayer')) {
        this.map.removeLayer('buildingAreaShapeLayer');
        this.map.removeSource('buildingAreaShapeLayer');
      }

      this.map.addLayer({
        id: 'buildingAreaShapeLayer',
        type: 'fill',
        source: {
          type: 'geojson',
          data: {
            type: 'Feature',
            geometry: building ? building.realProperty.primaryInfo.geom : this.building.realProperty.primaryInfo.geom,
          },
        },
        layout: {},
        paint: {
          'fill-color': '#98a6b2',
          'fill-opacity': 0.3,
          'fill-outline-color': '#000',
        },
      });
    } catch (err) {
      // console.log(err);
    }

  }

  removeBuildingAreaShape() {
    if (this.map.getLayer('buildingAreaShapeLayer')) {
      this.map.removeLayer('buildingAreaShapeLayer');
      this.map.removeSource('buildingAreaShapeLayer');
    }
  }

  highlightBuilding(building: api.BuildingModel, address: api.IGeoSuggestion) {
    // 2d layers are queried
    let l = this.layersForHover;
    // if map is in 3d, 3d layers are queried
    if (this.d3) {
      l = this.layersForHover3d;
    } else {
      if (this.satelliteView) {
        // satelite layers are queried
        l = this.layersForHoverSatellite;
      }
    }

    // if there is a popup from clicked remove it
    // this.popup.remove();
    // query mapbox for buidling coordinates on selected layers
    const fs = this.map.queryRenderedFeatures([address.coordinates.longitude, address.coordinates.latitude], { layers: l });
    if (fs.length) {
      const f = fs[0];
      if (f.properties.uniqueidentifier !== lastFeatureIdClicked) {
        lastFeatureIdClicked = f.properties.uniqueidentifier;
        // self.lastFsIdHover = lastFeatureIdClicked;
        // self.lastFsLayerTypeHover = f.layer.type;
        this.map.getCanvas().style.cursor = 'pointer';

        // LEAVE IT FOR NOW - this.$root.$emit('selectedLayer', f.layer.id);
        this.map.setPaintProperty(this.d3 ? 'av3d' : f.layer.id, this.d3 ? 'fill-extrusion-color' : 'fill-color', ['case',
          ['==', ['get', 'uniqueidentifier'], f.properties.uniqueidentifier], '#5a636e', '#cbc7c3']);

      } else {
        this.map.getCanvas().style.cursor = '';
      }
    }
  }
  buildingClick(e: any) {
    this.map.getCanvas().style.cursor = '';
    this.buildingIsClicked = true;
    if (this.buildingLoading) {
      return;
    }

    let l = this.layersForHover;

    if (this.d3) {
      l = this.layersForHover3d;
    } else {
      if (this.satelliteView) {
        l = this.layersForHoverSatellite;
      }
    }

    this.popup.remove();
    const self = this;
    const fs = this.map.queryRenderedFeatures(e.point, { layers: l });

    if (fs.length) {
      setSimilarObjects(this.$store, []);
      this.$root.$emit('map_change_size', 'big');
      try {
        this.map.removeLayer('radius');
        this.map.removeSource('radius');
      } catch { }
      try {
        this.map.removeLayer('point');
        this.map.removeLayer('buildingAreaShapeLayer');
        this.map.removeSource('point');
        this.map.removeSource('buildingAreaShapeLayer');
      } catch {
      }

      try {
        this.map.removeLayer('marketRadarPoints');
        this.map.removeSource('marketRadarPointsSource');
      } catch {
      }
      if (this.mapLayerIds.length) {
        for (let i = 0, l = this.mapLayerIds.length; i < l; i += 1) {
          try {
            this.map.removeLayer(this.mapLayerIds[i]);
            this.map.removeSource(this.mapLayerIds[i]);
          } catch {

          }
        }
        this.mapLayerIds = [];
      }
      popupsOnTheMapIds = [];
      if (Object.keys(popupsOnTheMap).length) {
        for (const e in popupsOnTheMap) {
          popupsOnTheMap[e].remove();
        }
      }
      this.buildingLoading = true;

      const f = fs[0];
      if (f.properties.uniqueidentifier !== lastFeatureIdClicked) {
        lastFeatureIdClicked = f.properties.uniqueidentifier;
        this.map.getCanvas().style.cursor = 'pointer';

        this.map.setPaintProperty(this.d3 ? 'av3d' : f.layer.id, this.d3 ? 'fill-extrusion-color' : 'fill-color', ['case',
          ['==', ['get', 'uniqueidentifier'], f.properties.uniqueidentifier], '#5a636e', '#cbc7c3']);

      } else {
        this.map.getCanvas().style.cursor = '';
      }

      this.tooltip.remove();
      const popupComponent = new Vue({

        name: 'popup_tooltip_app',
        data: {
          loader: true,
          tooltip: '',
        },
        components: {
          popUp: Tooltip,
        },
        methods: {
          closePopup() {
            self.tooltip.remove();
          },
        },
        parent: this,
        template: '<pop-up ref="popup_tooltip" v-bind:loader="loader" v-bind:tooltip="tooltip" v-bind:closePopup="closePopup"/>',
      }).$mount();

      const coordinates = <mapboxgl.LngLatLike>[e.lngLat.lng, e.lngLat.lat];

      // Ensure that if the map is zoomed out such that multiple
      // copies of the feature are visible, the popup appears
      // over the copy being pointed to.
      while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
        coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
      }

      // Need to be triggered somehow DO NOT REMOVE!
      setTimeout(() => { this.tooltip.setLngLat(coordinates).setDOMContent(popupComponent.$el).addTo(this.map); }, 100);

      api.$building(f.properties.uniqueidentifier).get().then((data: api.BuildingModel) => {

        this.tooltip.remove();
        // this is used to show right sidebar with building information
        if (data.entrances.length > 1) {

          const popupComponent = new Vue({

            name: 'popup_entrances_app',
            data: {
              // entrances: data.entrances,
              // pictures: data.pictures,
              building: data,
              lat: e.lngLat.lat,
              lng: e.lngLat.lng,
              // entrence: null,
            },
            components: {
              popUp: PopupMultipleEntrancesComponent,
            },
            methods: {
              setEntrance(o: any, index: number) {
                self.$root.$emit('onSelectEnterence', index - 1);
                getEntrenceData(o, data);
                self.popup.remove();
              },
            },
            parent: this,
            template: '<pop-up ref="popup_entrances" v-bind:building="building" v-bind:setEntrence="setEntrance" v-bind:lat="lat" v-bind:lng="lng" />',
          }).$mount();

          // Need to be triggered somehow DO NOT REMOVE!
          // setTimeout(function () {
          const coordinates = <mapboxgl.LngLatLike>[e.lngLat.lng, e.lngLat.lat];

          // Ensure that if the map is zoomed out such that multiple
          // copies of the feature are visible, the popup appears
          // over the copy being pointed to.
          while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
            coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
          }

          this.popup.setLngLat(coordinates)
            .setDOMContent(popupComponent.$el)
            .addTo(this.map);

          search.commitAddressLoading(store, false);

        } else {

          if (data.entrances.length) {
            getEntrenceData(data.entrances[0], data);
          } else {
            // just add marker
            this.setBuildingAreaShape(data);
            this.clickedShape = data.id;
            // add point to the map, no matter if we got any entrances or not
            this.setObject({
              name: '',
              uniqueIdentifier: data.id,
              coordinates: new api.GeoCoordinates({
                longitude: e.lngLat.lng,
                latitude: e.lngLat.lat,
              }),
            });

            Vue.prototype.$notify({
              group: 'actions',
              type: 'error',
              duration: 5000,
              text: 'Building does not have any entrances or any address details.',
            });
            self.tooltip.remove();
            setSearchedAddress(self.$store, null);
            setIsEnabledRightSidebar(this.$store, false);
            this.removeBuildingAreaShape();

          }
        }

        function getEntrenceData(entrance: api.EntranceLightModel, b: api.BuildingModel) {
          if (entrance) {

            const suggestion = {
              uniqueIdentifier: entrance.address.entranceAddressId || entrance.address.streetId || entrance.address.localityId || entrance.id || f.properties.uniqueidentifier,
              name: `${entrance.address.street} ${entrance.address.streetNumber}, ${entrance.address.zip} ${entrance.address.locality}`,
              coordinates: new api.GeoCoordinates({
                longitude: entrance.address.coordinates ? entrance.address.coordinates.longitude : e.lngLat.lng,
                latitude: entrance.address.coordinates ? entrance.address.coordinates.latitude : e.lngLat.lat,
              }),
            };
            self.clickedShape = entrance.id;
            setSearchedAddress(self.$store, <any>suggestion);

            self.address = {};
            self.address.coordinates = {};
            self.address.name = `${entrance.address.street} ${entrance.address.streetNumber}, ${entrance.address.zip} ${entrance.address.locality}`;
            self.address.uniqueIdentifier = entrance.address.entranceAddressId || entrance.address.streetId || entrance.address.localityId || f.properties.uniqueidentifier;

            self.address.coordinates = new api.GeoCoordinates({
              longitude: entrance.address.coordinates ? entrance.address.coordinates.longitude : e.lngLat.lng,
              latitude: entrance.address.coordinates ? entrance.address.coordinates.latitude : e.lngLat.lat,
            });

            self.setObject(self.address);
            self.setBuildingAreaShape(b);
          } else {
            search.commitAddressLoading(store, false);
          }
        }

        this.buildingLoading = false;

      }).catch((err) => {
        this.buildingLoading = false;
        search.commitAddressLoading(store, false);
        self.tooltip.remove();

      });
    } else {
      this.buildingLoading = false;
    }

  }
  buildingsHover(e: any) {

    if (this.buildingLoading) {
      return;
    }
    let l = this.layersForHover;

    if (this.d3) {
      l = this.layersForHover3d;
    } else {
      if (this.satelliteView) {
        l = this.layersForHoverSatellite;
      }
    }

    const fs = this.map.queryRenderedFeatures(e.point, { layers: l });

    if (fs.length) {
      this.map.getCanvas().style.cursor = 'pointer';

      const f = fs[0];

      if (f.properties.uniqueidentifier !== lastFeatureId) {
        lastFeatureId = f.properties.uniqueidentifier;
        this.lastFsIdHover = lastFeatureId;
        this.lastFsLayerTypeHover = f.layer.type;
        this.lastFsLayerId = f.layer.id;
        this.map.getCanvas().style.cursor = 'pointer';

        this.map.setPaintProperty(f.layer.id, this.d3 && !this.satelliteView ? 'fill-extrusion-color' : 'fill-color', ['case',
          ['==', ['get', 'uniqueidentifier'], f.properties.uniqueidentifier], '#5a636e',
          ['==', ['get', 'uniqueidentifier'], lastFeatureIdClicked], '#5a636e', '#cbc7c3',
        ]);

      }

    } else {

      this.map.getCanvas().style.cursor = '';
      try {
        if (lastFeatureIdClicked !== '') {
          this.map.setPaintProperty(this.lastFsLayerId, this.d3 && !this.satelliteView ? 'fill-extrusion-color' : 'fill-color', ['case',
            ['==', ['get', 'uniqueidentifier'], lastFeatureIdClicked], '#5a636e', '#cbc7c3',
          ]);
        } else {
          this.map.setPaintProperty(this.lastFsLayerId, this.d3 && !this.satelliteView ? 'fill-extrusion-color' : 'fill-color', ['case',
            ['==', ['get', 'uniqueidentifier'], lastFeatureId], '#cbc7c3',
            ['==', ['get', 'uniqueidentifier'], lastFeatureIdClicked], '#cbc7c3', '#cbc7c3',
          ]);
        }
      } catch { }
      lastFeatureId = '';
    }
  }
  /* @Prop()
  newBuildingModel: api.BuildingModel;

  @Prop({ default: null })
  drawToolActivated: { active: boolean; time: number } = null;

  @Prop({ default: null })
  viewportToolActivated: { active: boolean; time: number } = null;

  @Prop({ default: null })
  shapeForMap: { id: string; geo: any, time: number };

  @Prop({ default: null })
  shapeForRemoveFromMap: { id: string; time: number } = null;

  @Prop({ default: [] })
  similarObjects: Array<api.IPubLightModel> = null;

  @Prop({ default: null })
  viewPortForSearchMap: { id: string, color: string, name: string, polygon: [], show: boolean };

  @Prop({ default: null })
  setTravelPointValue: { active: boolean; time: number } = null;

  @Prop({ default: null })
  travelTimeData: TravelTime;

  @Prop({ default: null })
  adToShow: { id: string; time: number };

  @Prop({ default: null })
  marketRadarActivePointRemove: number;

  @Prop({ default: null })
  drawnShapeForMap: { shape: api.GeoAreaShape, time: number } = null;

  @Prop({ default: 0 })
  nextIdForMapShapesAndViewports: number;

  @Prop({ default: [] })
  idsToRemove: string[];

  @Prop({ default: false })
  addressIsFromAutocomplete: { v: boolean; time: string };

  address: api.IGeoSuggestion;
  lastFsIdHover: string = '';
  lastFsLayerTypeHover: string = '';
  clickedShape: string = '';

  buildingLoading: boolean = false;
  lastFsLayerId: string = '';
  popups: Array<Popup> = [];
  popupsData: {
    longitude: number;
    latitude: number;
    ads: api.IPubLightModel[];
  }[] = [];
  hoveredPopup: string = '';
  hoverPopupHtml: HTMLElement = null;
  activePopupHtml: HTMLElement = null;

  created() {
    EventBus.$on('map:drawRadiusAroundPoint', (radius: number) => {
      this.drawRadiusAroundPoint(radius);
    });
    EventBus.$on('map:removeRadiusPoint', () => {
      this.removeRadiusPoint();
    });
  }
  destroyed() {
    search.commitResetState(store);
  }

  get searchedAddress() {
    return getSearchedAddress(store);
  }
  get mapPoint() {
    return getMapPoint(store);
  }

  setLayers(address: any) {

    const self = this;

    try {
      self.setObject(address.uniqueIdentifier, null, address);
    } catch (err) {
      search.commitResetState(store);

    }
  }

  get_color(): string {

    let color = this.colors()[Math.floor(Math.random() * this.colors().length)];

    if (this.colorsUsed.length === this.colors().length) {
      color = '#' + `${Math.floor(Math.random() * 16777215).toString(16)}`;
    }

    if (this.colorsUsed.indexOf(color) === -1) {
      this.colorsUsed.push(color);

    } else {
      color = '#' + `${Math.floor(Math.random() * 16777215).toString(16)}`;
      this.colorsUsed.push(color);
    }

    return color;

  }

  async setObject(id: string, e: any, address: api.IGeoSuggestion) {

    try {

      const geojson = {
        type: 'FeatureCollection',
        features: [{
          type: 'Feature',
          geometry: {
            type: 'Point',
            coordinates: [address.coordinates.longitude, address.coordinates.latitude],
          },
        }],
      };

      const pointSource = {
        type: 'geojson',
        data: geojson,
      };
      const pointLayer = {
        id: 'point',
        type: 'circle',
        source: 'point',
        paint: {
          'circle-radius': 10,
          'circle-color': '#d61683',
          'circle-stroke-width': 1,
          'circle-stroke-color': '#fff',
        },
      };
      // do not zoom if already zoomed
      console.log(this.map.getLayer('point'));
      if (!this.map.getLayer('point')) {
        this.map.setZoom(18);
        this.mapZoom = 18;
        this.map.setCenter([address.coordinates.longitude, address.coordinates.latitude]);
      }

      try {
        this.map.addSource('point', pointSource);
        this.map.addLayer(pointLayer);

        this.markers.push(pointLayer);
        this.markerSources.push(pointSource);

      } catch (err) {
        this.map.getSource('point').setData(geojson);
      }

    } catch (err) {
      search.commitAddressLoading(store, false);
    }

  }

  setBuildingShape(b: api.BuildingModel) {
    const self = this;
    try {

      if (this.map.getLayer('bl')) {
        this.map.removeLayer('bl');
        this.map.removeSource('bl');
      }

      this.map.addLayer({
        id: 'bl',
        type: 'fill',
        source: {
          type: 'geojson',
          data: {
            type: 'Feature',
            geometry: b.realProperty.primaryInfo.geom,
          },
        },
        layout: {},
        paint: {
          'fill-color': '#98a6b2',
          'fill-opacity': 0.3,
          'fill-outline-color': '#000',
        },
      });

    } catch (err) {
      // console.log(err);
    }

  }

  get mapAndAddress() {
    return {
      loaded: this.mapLoaded,
      address: this.marketRadarSearchedAddress,
    };
  }
  buildingIsClicked: boolean = false;
  buildingsClick(e: any) {
    this.map.getCanvas().style.cursor = '';
    this.buildingIsClicked = true;
    if (this.buildingLoading) {
      return;
    }

    let l = this.layersForHover;

    if (this.d3) {
      l = this.layersForHover3d;
    } else {
      if (this.satelliteView) {
        l = this.layersForHoverSatellite;
      }
    }

    this.popup.remove();
    const self = this;
    const fs = this.map.queryRenderedFeatures(e.point, { layers: l });

    if (fs.length) {
      this.$emit('removeSimilarObjects');
      try {
        this.map.removeLayer('radius');
        this.map.removeSource('radius');
      } catch { }
      try {
        this.map.removeLayer('point');
        this.map.removeLayer('bl');
        this.map.removeSource('point');
        this.map.removeSource('bl');
      } catch {
      }

      try {
        this.map.removeLayer('marketRadarPoints');
        this.map.removeSource('marketRadarPointsSource');
      } catch {
      }
      if (this.mapLayerIds.length) {
        for (let i = 0, l = this.mapLayerIds.length; i < l; i += 1) {
          try {
            this.map.removeLayer(this.mapLayerIds[i]);
            this.map.removeSource(this.mapLayerIds[i]);
          } catch {

          }
        }
        this.mapLayerIds = [];
      }
      popupsOnTheMapIds = [];
      if (Object.keys(popupsOnTheMap).length) {
        for (const e in popupsOnTheMap) {
          popupsOnTheMap[e].remove();
        }
      }
      this.buildingLoading = true;

      const f = fs[0];
      if (f.properties.uniqueidentifier !== lastFeatureIdClicked) {
        lastFeatureIdClicked = f.properties.uniqueidentifier;
        // self.lastFsIdHover = lastFeatureIdClicked;
        // self.lastFsLayerTypeHover = f.layer.type;
        this.map.getCanvas().style.cursor = 'pointer';

        this.$root.$emit('selectedLayer', f.layer.id);
        this.map.setPaintProperty(this.d3 ? 'av3d' : f.layer.id, this.d3 ? 'fill-extrusion-color' : 'fill-color', ['case',
          ['==', ['get', 'uniqueidentifier'], f.properties.uniqueidentifier], '#5a636e', '#cbc7c3']);

      } else {
        this.map.getCanvas().style.cursor = '';
      }

      this.tooltip.remove();
      const popupComponent = new Vue({

        name: 'popup_tooltip_app',
        data: {
          loader: true,
          tooltip: '',
        },
        components: {
          popUp: Tooltip,
        },
        methods: {
          closePopup() {
            self.tooltip.remove();
          },
        },
        parent: this,
        template: '<pop-up ref="popup_tooltip" v-bind:loader="loader" v-bind:tooltip="tooltip" v-bind:closePopup="closePopup"/>',
      }).$mount();

      const coordinates = <mapboxgl.LngLatLike>[e.lngLat.lng, e.lngLat.lat];

      // Ensure that if the map is zoomed out such that multiple
      // copies of the feature are visible, the popup appears
      // over the copy being pointed to.
      while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
        coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
      }

      // Need to be triggered somehow DO NOT REMOVE!
      setTimeout(() => { this.tooltip.setLngLat(coordinates).setDOMContent(popupComponent.$el).addTo(this.map); }, 100);

      search.commitAddressLoading(store, true);
      api.$building(f.properties.uniqueidentifier).get().then((data: api.BuildingModel) => {

        this.tooltip.remove();
        // this is used to show right sidebar with building information
        if (data.entrances.length > 1) {

          const popupComponent = new Vue({

            name: 'popup_entrances_app',
            data: {
              // entrances: data.entrances,
              // pictures: data.pictures,
              building: data,
              lat: e.lngLat.lat,
              lng: e.lngLat.lng,
              // entrence: null,
            },
            components: {
              popUp: PopupMultipleEntrancesComponent,
            },
            methods: {
              setEntrance(o: any, index: number) {
                self.$root.$emit('onSelectEnterence', index - 1);
                getEntrenceData(o, data);
                self.popup.remove();
              },
            },
            parent: this,
            template: '<pop-up ref="popup_entrances" v-bind:building="building" v-bind:setEntrence="setEntrance" v-bind:lat="lat" v-bind:lng="lng" />',
          }).$mount();

          // Need to be triggered somehow DO NOT REMOVE!
          // setTimeout(function () {
          const coordinates = <mapboxgl.LngLatLike>[e.lngLat.lng, e.lngLat.lat];

          // Ensure that if the map is zoomed out such that multiple
          // copies of the feature are visible, the popup appears
          // over the copy being pointed to.
          while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
            coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
          }

          this.popup.setLngLat(coordinates)
            .setDOMContent(popupComponent.$el)
            .addTo(this.map);

          search.commitAddressLoading(store, false);

        } else {

          if (data.entrances.length) {
            getEntrenceData(data.entrances[0], data);
          } else {
            // just add marker
            search.commitAddressLoading(store, false);
            this.setBuildingShape(data);

            if (this.clickedShape !== '') {
              // self.$root.$emit('remove_shape', self.clickedShape);

            }
            // self.$root.$emit('remove_address_item');
            // self.$root.$emit('showObject', false);

            this.clickedShape = data.id;

            this.$emit('killHistory');
            search.commitSearchingForMarketRadarAddress(store, api.$newObj(api.GeoSuggestion));

            this.setObject(f.properties.uniqueidentifier, null, {
              name: '',
              uniqueIdentifier: data.id,
              coordinates: new api.GeoCoordinates({
                longitude: e.lngLat.lng,
                latitude: e.lngLat.lat,
              }),
            });

            Vue.prototype.$notify({
              group: 'actions',
              type: 'error',
              duration: 5000,
              text: 'Building does not have any entrances or any address details.',
            });
            self.tooltip.remove();

          }
        }

        function getEntrenceData(entrance: api.EntranceLightModel, b: api.BuildingModel) {
          if (entrance) {

            if (self.clickedShape !== '') {
              self.$root.$emit('remove_shape', self.clickedShape);
            }
            self.$root.$emit('remove_address_item');
            self.$root.$emit('showObject', false);

            const suggestion = {
              uniqueIdentifier: entrance.address.entranceAddressId || entrance.address.streetId || entrance.address.localityId || entrance.id || f.properties.uniqueidentifier,
              name: `${entrance.address.street} ${entrance.address.streetNumber}, ${entrance.address.zip} ${entrance.address.locality}`,
              coordinates: new api.GeoCoordinates({
                longitude: entrance.address.coordinates ? entrance.address.coordinates.longitude : e.lngLat.lng,
                latitude: entrance.address.coordinates ? entrance.address.coordinates.latitude : e.lngLat.lat,
              }),
            };
            self.$emit('killHistory');
            search.commitSearchingForMarketRadarAddress(store, <any>suggestion);
            self.clickedShape = entrance.id;

            self.address.name = `${entrance.address.street} ${entrance.address.streetNumber}, ${entrance.address.zip} ${entrance.address.locality}`;
            self.address.uniqueIdentifier = entrance.address.entranceAddressId || entrance.address.streetId || entrance.address.localityId || f.properties.uniqueidentifier;

            self.address.coordinates = new api.GeoCoordinates({
              longitude: entrance.address.coordinates ? entrance.address.coordinates.longitude : e.lngLat.lng,
              latitude: entrance.address.coordinates ? entrance.address.coordinates.latitude : e.lngLat.lat,
            });

            self.setObject(f.properties.uniqueidentifier, null, self.address);
            self.setBuildingShape(b);
          } else {

            search.commitAddressLoading(store, false);
          }
        }

        this.buildingLoading = false;

      }).catch((err) => {
        this.buildingLoading = false;
        search.commitAddressLoading(store, false);

        Vue.prototype.$notify({
          group: 'actions',
          type: 'error',
          duration: 2500,
          text: 'No building found.',
        });
        self.tooltip.remove();

      });
    } else {
      this.buildingLoading = false;
    }

  }
  buildingsHover(e: any) {

    if (this.buildingLoading) {
      return;
    }
    let l = this.layersForHover;

    if (this.d3) {
      l = this.layersForHover3d;
    } else {
      if (this.satelliteView) {
        l = this.layersForHoverSatellite;
      }
    }

    const fs = this.map.queryRenderedFeatures(e.point, { layers: l });

    if (fs.length) {
      this.map.getCanvas().style.cursor = 'pointer';

      const f = fs[0];

      if (f.properties.uniqueidentifier !== lastFeatureId) {
        lastFeatureId = f.properties.uniqueidentifier;
        this.lastFsIdHover = lastFeatureId;
        this.lastFsLayerTypeHover = f.layer.type;
        this.lastFsLayerId = f.layer.id;
        this.map.getCanvas().style.cursor = 'pointer';

        this.map.setPaintProperty(f.layer.id, this.d3 && !this.satelliteView ? 'fill-extrusion-color' : 'fill-color', ['case',
          ['==', ['get', 'uniqueidentifier'], f.properties.uniqueidentifier], '#5a636e',
          ['==', ['get', 'uniqueidentifier'], lastFeatureIdClicked], '#5a636e', '#cbc7c3',
        ]);

      }

    } else {

      this.map.getCanvas().style.cursor = '';
      try {
        if (lastFeatureIdClicked !== '') {
          this.map.setPaintProperty(this.lastFsLayerId, this.d3 && !this.satelliteView ? 'fill-extrusion-color' : 'fill-color', ['case',
            ['==', ['get', 'uniqueidentifier'], lastFeatureIdClicked], '#5a636e', '#cbc7c3',
          ]);
        } else {
          this.map.setPaintProperty(this.lastFsLayerId, this.d3 && !this.satelliteView ? 'fill-extrusion-color' : 'fill-color', ['case',
            ['==', ['get', 'uniqueidentifier'], lastFeatureId], '#cbc7c3',
            ['==', ['get', 'uniqueidentifier'], lastFeatureIdClicked], '#cbc7c3', '#cbc7c3',
          ]);
        }
      } catch { }
      lastFeatureId = '';
    }
  }
  load() {

    this.map.on('click', this.buildingsClick);
    this.map.on('mousemove', this.buildingsHover);
    this.map.on('mouseleave', (e: any) => {
      try {
        this.map.setPaintProperty(this.lastFsLayerId, this.d3 && !this.satelliteView ? 'fill-extrusion-color' : 'fill-color', ['case',
          ['==', ['get', 'uniqueidentifier'], lastFeatureId], '#cbc7c3',
          ['==', ['get', 'uniqueidentifier'], lastFeatureIdClicked], '#cbc7c3', '#cbc7c3',
        ]);
      } catch { }
    });

  }

  @Watch('mapAndAddress', { immediate: true })
  ma() {
    const self = this;
    try {

      if (this.mapAndAddress.loaded && this.mapAndAddress.address !== undefined) {

        this.address = this.mapAndAddress.address;
        if (!this.buildingIsClicked || this.mapSize === 'big') {
          self.map.setCenter([self.address.coordinates.longitude, self.address.coordinates.latitude]);
          self.map.panTo([self.address.coordinates.longitude, self.address.coordinates.latitude]);
          this.map.setZoom(16);
          this.mapZoom = 16;
        }
        self.setLayers(self.address);

        self.map.setPaintProperty(self.d3 ? 'av3d' : 'av', self.d3 ? 'fill-extrusion-color' : 'fill-color', '#cbc7c3');

      } else {
        try {
          self.map.removeLayer('point');
          self.map.removeSource('point');

        } catch (err) {
          search.commitAddressLoading(store, false);
        }
      }
    } catch (err) {
      search.commitAddressLoading(store, false);

    }
  }

  @Watch('mapLoaded')
  ml() {
    if (this.mapLoaded) {
      this.load();
    }
  }

  @Watch('mapPoint')
  watchMarketRadarPoint() {

    this.setObject(this.mapPoint.id, null, this.mapPoint);
    /*const geojson = {
      type: 'FeatureCollection',
      features: [{
        type: 'Feature',
        geometry: {
          type: 'Point',
          coordinates: [this.mapPoint.coordinates.longitude, this.mapPoint.coordinates.latitude],
        },
      }],
    };

    const pointSource = {
      type: 'geojson',
      data: geojson,
    };
    const pointLayer = {
      id: this.mapPoint.id,
      type: 'circle',
      source: 'point',
      paint: {
        'circle-radius': 10,
        'circle-color': '#d61683',
        'circle-stroke-width': 1,
        'circle-stroke-color': '#fff',
      },
    };

    try {
      this.map.addSource('point', pointSource);
      this.map.addLayer(pointLayer);

      this.markers.push(pointLayer);
      this.markerSources.push(pointSource);

    } catch (err) {
      this.map.getSource('point').setData(geojson);
    }
    try {
      this.map.removeLayer('marketRadarPoints');
      this.map.removeSource('marketRadarPointsSource');
    } catch { }

    this.map.setZoom(18);
    this.mapZoom = 18;
    this.map.setCenter([this.mapPoint.coordinates.longitude, this.mapPoint.coordinates.latitude]);
    this.setBuildingShape();
  }

  drawRadiusAroundPoint(radius: number) {
    try {
      this.map.removeLayer('radius');
      this.map.removeSource('radius');
    } catch { }

    let source = null;
    if (this.searchedAddress.coordinates) {
      source = cc([this.searchedAddress.coordinates.longitude, this.searchedAddress.coordinates.latitude], radius);
    } else {
      const c = this.mapPoint.coordinates;
      source = cc([c.longitude, c.latitude], radius);
    }

    const circleLayer = {
      source,
      id: 'radius',
      type: 'fill',
      layout: {},
      paint: {
        'fill-color': '#d61683',
        'fill-opacity': 0.3,
        'fill-outline-color': '#ccc',
      },
      'data.uniqueIdentifier': { id: this.searchedAddress.uniqueIdentifier },
    };
    this.map.addLayer(circleLayer, this.layersForHover[0]);
    this.$emit('radiusSource', source.data.features[0].geometry);
  }

  removeRadiusPoint() {
    try {
      this.map.removeLayer('radius');
      this.map.removeSource('radius');
    } catch { }
  }

  captureViewPort() {
    const c: string = this.get_random_color();
    const bounds = this.map.getBounds();
    const e = new mapboxgl.LngLatBounds(bounds._sw, bounds._ne);

    const polygon = [

      [e.getNorthWest().lng, e.getNorthWest().lat],
      [bounds._ne.lng, bounds._ne.lat],
      [e.getSouthEast().lng, e.getSouthEast().lat],
      [bounds._sw.lng, bounds._sw.lat],

      [e.getNorthWest().lng, e.getNorthWest().lat],

    ];
    const id = 'viewport_' + `${this.counter.next().toString()}`;

    this.$emit('addViewPortToSearchShapes', {
      id,
      polygon,
      name: 'Viewport',
      show: true,
      color: c,
    });
  }

  @Watch('marketRadarPointToRemove')
  watchMarketRadarPointToRemove() {
    try {
      this.map.removeLayer('bl');
      this.map.removeSource('bl');
    } catch { }
    this.map.setStyle('mapbox://styles/ascarix/cjoe973rf8rf82rmi5fcykj8w');
    if (this.popups.length) {
      this.popups.forEach((popup) => {
        popup.remove();
      });
    }
    this.popupsData = [];
    this.popups = [];
    // this.map.setCenter([8.2275, 46.8182]);
    // this.map.panTo([8.2275, 46.8182]);
    // this.map.setZoom(7.5);
  }

  @Watch('shapeForMap')
  watchShapeForMap() {
    this.map.addSource(this.shapeForMap.id, {
      type: 'geojson',
      data: this.shapeForMap.geo,
    });

    const polygonLayer = {
      id: this.shapeForMap.id,
      type: 'fill',
      source: this.shapeForMap.id,
      paint: {
        'fill-color': '#87CEEB',
        'fill-opacity': 0.6,
      },
      properties: {
        type: 'withSourceId',
      },
    };

    this.map.addLayer(polygonLayer, this.layersForHover[0]);
    this.mapLayerIds.push(this.shapeForMap.id);
  }

  @Watch('shapeForRemoveFromMap')
  watchShapeForRemoveFromMap() {
    if (this.map.getSource(this.shapeForRemoveFromMap.id) || this.map.getLayer(this.shapeForRemoveFromMap.id)) {
      this.map.removeLayer(this.shapeForRemoveFromMap.id);
      this.map.removeSource(this.shapeForRemoveFromMap.id);
    }
  }

  hoveredStateId: string = null;
  async getClusterData(clusterData: string[]) {
    const results: api.PubLightModel[] = await api.$pubs.getMultiple(clusterData);
    return results;
  }
  @Watch('similarObjects')
  marketRadarAdsWatch() {
    const self = this;
    const adsWithCoordinates: any = [];
    const adsWithNoCoordinates: object[] = [];
    // console.log(this.similarObjects.length);
    if (this.similarObjects && !this.similarObjects.length) {
      if (this.map.getSource('marketRadarPointsSource') || this.map.getLayer('marketRadarPoints')) {
        this.map.removeLayer('marketRadarPoints');
        this.map.removeLayer('cluster');
        this.map.removeLayer('cluster-count');
        this.map.removeSource('marketRadarPointsSource');
        popupsOnTheMapIds = [];
        if (Object.keys(popupsOnTheMap).length) {
          for (const e in popupsOnTheMap) {
            popupsOnTheMap[e].remove();
          }
        }
      }
      if (this.popups.length) {
        this.popups.forEach((popup) => {
          popup.remove();
        });
      }
      return;
    }
    if (this.popups.length) {
      this.popups.forEach((popup) => {
        popup.remove();
      });
    }
    this.popupsData = [];
    this.popups = [];
    // console.log(this.similarObjects);

    if (this.map.getSource('marketRadarPointsSource') || this.map.getLayer('marketRadarPoints')) {
      this.map.removeLayer('marketRadarPoints');
      this.map.removeSource('marketRadarPointsSource');
    }
    this.map.on('click', this.buildingsClick);
    this.map.on('mousemove', this.buildingsHover);
    for (const i in this.similarObjects) {

      if (this.similarObjects[i].address.coordinates !== undefined) {

        // let r = Math.random() >= 0.5;
        // console.log(r);
        adsWithCoordinates.push({
          type: 'Feature',
          geometry: {
            type: 'Point',
            coordinates: [this.similarObjects[i].address.coordinates.longitude, this.similarObjects[i].address.coordinates.latitude],
          },
          itemId: this.similarObjects[i].id,
          properties: {
            icon: 'monument',
            itemId: this.similarObjects[i].id,
            greyOut: !this.similarObjects[i].trackingInfo.publicationInterval.isActive,
          },
        });
        const findDuplication = this.popupsData.findIndex(x => x.longitude === this.similarObjects[i].address.coordinates.longitude && x.latitude === this.similarObjects[i].address.coordinates.latitude);

        if (findDuplication === -1) {
          this.popupsData.push({
            longitude: this.similarObjects[i].address.coordinates.longitude,
            latitude: this.similarObjects[i].address.coordinates.latitude,
            ads: [this.similarObjects[i]],
          });
        } else {
          this.popupsData[findDuplication].ads.push(this.similarObjects[i]);
        }

      } else {
        adsWithNoCoordinates.push({
          id: this.similarObjects[i].id,
          coordinates: undefined,
        });
      }
    }

    const generatePopup = (coordinate: [number, number], html: Vue) => {
      const popup = new mapboxgl.Popup({
        closeOnClick: false,
        closeButton: false,
        className: `custom-popup popup-${coordinate[0]}-${coordinate[1]}`,
      })
        .setLngLat(coordinate)
        .setDOMContent(html.$el);
      // this.popups.push(popup);
      return popup;
    };
    // console.log(this.popupsData);

    if (this.popups.length) {
      this.popups.forEach((popup) => {
        popup.addTo(this.map);
      });
    }
    if (adsWithCoordinates.length) {
      // try {

      const ads = {
        type: 'geojson',
        data: {
          type: 'FeatureCollection',
          features: adsWithCoordinates,
        },
      };

      // this.map.addSource('marketRadarPointsSource', ads);
      this.clusterSource = {
        type: 'geojson',
        data: {
          type: 'FeatureCollection',
          features: adsWithCoordinates,

        },
        cluster: true,
        clusterMaxZoom: 11, // Max zoom to cluster points on
        clusterRadius: this.clusterRadius, // Radius of each cluster when clustering points (defaults to 50)
      };

      if (this.map.getSource('marketRadarPointsSource') !== undefined) {
        this.map.getSource('marketRadarPointsSource').setData(this.clusterSource);
      } else {

        this.map.addSource('marketRadarPointsSource', this.clusterSource);
      }
      this.cluster = {
        id: 'cluster',
        type: 'circle',
        source: 'marketRadarPointsSource',
        filter: ['has', 'point_count'],
        minzoom: 1,
        paint: {
          'circle-color': ['case',
            ['boolean', ['feature-state', 'hover'], false],
            '#1d86ce',
            '#51bbd6',
          ],
          'circle-radius': [
            'step',
            ['get', 'point_count'],
            20, 100,
            30, 750,
            40,
          ],
        },
      };
      if (self.map.getLayer('cluster') === undefined) {
        self.map.addLayer(this.cluster);
        this.mapLayerIds.push('cluster');
      }

      this.clusterSymbol = {
        id: 'cluster-count',
        type: 'symbol',
        source: 'marketRadarPointsSource',
        filter: ['>=', 'point_count', 2],
        layout: {
          'text-field': '{point_count_abbreviated}',
          'text-font': ['DIN Offc Pro Medium', 'Arial Unicode MS Bold'],
          'text-size': 12,
        },
        paint: {
          'text-color': '#fafafa',
        },
      };
      if (self.map.getLayer('cluster-count') === undefined) {
        self.map.addLayer(this.clusterSymbol);
        this.mapLayerIds.push('cluster-count');
      }
      this.map.on('click', 'cluster', (e: any) => {
        const features = this.map.queryRenderedFeatures(e.point, { layers: ['cluster'] });
        const clusterId = features[0].properties.cluster_id;
        this.map.getSource('marketRadarPointsSource').getClusterExpansionZoom(clusterId, (err: any, zoom: any) => {
          if (err) {
            return;
          }

          this.map.easeTo({
            zoom,
            center: features[0].geometry.coordinates,
          });
        });
      });
      const mousemove = (e: any) => {
        if (e.features.length > 0) {
          if (this.hoveredStateId) {
            this.map.setFeatureState({ source: 'marketRadarPointsSource', id: this.hoveredStateId }, { hover: false });
          }
          this.hoveredStateId = e.features[0].id;
          this.map.setFeatureState({ source: 'marketRadarPointsSource', id: this.hoveredStateId }, { hover: true });
        }
        this.map.getCanvas().style.cursor = 'pointer';
      };

      const mouseleave = () => {
        this.map.getCanvas().style.cursor = '';
        if (this.hoveredStateId) {
          this.map.setFeatureState({ source: 'marketRadarPointsSource', id: this.hoveredStateId }, { hover: false });
        }
        this.hoveredStateId = null;
      };
      this.map.on('mousemove', 'cluster', (e: any) => {
        mousemove(e);
      });

      this.map.on('mouseleave', 'cluster', () => {
        mouseleave();
      });
      const colorExpressionPoint = [
        'case', ['==', ['get', 'greyOut'], true], '#999',
        ['==', ['get', 'greyOut'], false], '#11b4da',
        '#fff',
      ];

      const up = {
        id: 'marketRadarPoints',
        type: 'circle',
        source: 'marketRadarPointsSource',
        filter: ['!has', 'point_count'],
        paint: {

          'circle-color': colorExpressionPoint,

          'circle-radius': 8,
          'circle-stroke-width': 1,
          'circle-stroke-color': '#fff',
        },
      };

      this.markers.push(up);
      this.markerSources.push(ads);

      const forFit = [];
      adsWithCoordinates.push({
        type: 'Feature',
        geometry: {
          type: 'Point',
          coordinates: [this.address.coordinates.longitude, this.address.coordinates.latitude],
        },
        itemId: this.address.uniqueIdentifier,
        properties: {
          icon: 'monument',
          itemId: this.address.uniqueIdentifier,
        },
      });
      // if (this.map.getLayer('cluster')) {
      const coordsMin = [Math.min.apply(Math, adsWithCoordinates.map((o: any) => {
        return o.geometry.coordinates[0];
      })), Math.min.apply(Math, adsWithCoordinates.map((o: any) => {
        return o.geometry.coordinates[1];
      }))];
      const coordsMax = [Math.max.apply(Math, adsWithCoordinates.map((o: any) => {
        return o.geometry.coordinates[0];
      })), Math.max.apply(Math, adsWithCoordinates.map((o: any) => {
        return o.geometry.coordinates[1];
      }))];
      this.map.fitBounds([coordsMin, coordsMax], { padding: 120 });
      this.map.addLayer(up);
      this.mapLayerIds.push('marketRadarPoints');
      this.mapLayerIds.push('marketRadarPointsSource');
      // this.$root.$emit('marketRadarAdsInViewport', results);

      // this.map.off('click', this.buildingsClick);
      // this.map.off('mousemove', this.buildingsHover);

      this.map.on('click', 'marketRadarPoints', (e: any) => {
        this.$emit('showAd', e.features[0].properties.itemId);
      });

      // Change the cursor to a pointer when the mouse is over the places layer.
      this.map.on('mousemove', 'marketRadarPoints', () => {
        this.map.getCanvas().style.cursor = 'pointer';
      });

      // Change it back to a pointer when it leaves.
      this.map.on('mouseleave', 'marketRadarPoints', () => {
        this.map.getCanvas().style.cursor = '';
      });
      // }

      // const markers = {};
      // let markersOnScreen = {};

      const updateMarkers = () => {
        const newMarkers = {};
        // setTimeout(() => {
        const features = this.map.querySourceFeatures('marketRadarPointsSource');
        for (let i = 0; i < features.length; i += 1) {
          const coords = features[i].geometry.coordinates;
          const props = features[i].properties;
          const id = props.itemId;
          // console.log(props);
          const o = this.similarObjects.filter((e) => {
            if (e.id === props.itemId) {
              return e;
            }
          });
          // console.log(o);

          if (!props.cluster) {
            if (o.length) {
              const html = new Vue({
                name: 'popupWithSliderAds',
                data: {
                  adsDotData: o,
                },
                components: {
                  popUp: PopupMultipleAdsComponent,
                },
                methods: {
                  openAds(adInfo: api.PubLightModel, hidePopup?: boolean) {

                    const { longitude, latitude } = adInfo.address.coordinates;
                    const coordinate = `${longitude}-${latitude}`;
                    if (hidePopup) {
                      search.commitOpenedPopapDetailId(store, '');
                    }

                    if (self.activePopupHtml) {
                      self.activePopupHtml.classList.remove('active-item');
                    }
                    self.activePopupHtml = document.getElementsByClassName(`popup-${longitude}-${latitude}`)[0] as HTMLElement;
                    if (self.activePopupHtml) {
                      self.activePopupHtml.classList.add('active-item');
                    }
                    self.$emit('showAd', adInfo.id);
                    // this.$root.$emit('show_object', adInfo.id);
                  },
                  removeActive() {
                    // this.$root.$emit('hide_object');
                    this.$root.$emit('setPopupState', { type: 'active' });
                  },
                },
                template: "<pop-up :adsInfo='adsDotData' :openAds='openAds' :removeActive='removeActive'/>",
              }).$mount();
              const popup = generatePopup(coords, html);
              if (popupsOnTheMapIds.indexOf(id) === -1) {
                popup.addTo(this.map);
                popupsOnTheMapIds.unshift(id);
                popupsOnTheMap[id] = popup;
                // console.log(popupsOnTheMap);
              }
            }
          } else {
            const clusterSource = this.map.getSource('marketRadarPointsSource');

            clusterSource.getClusterLeaves(features[i].properties.cluster_id, 100000000, 0, (err: any, aFeatures: any) => {
              aFeatures.filter((f: any) => {
                if (popupsOnTheMap[f.itemId]) {
                  popupsOnTheMap[f.itemId].remove();
                  popupsOnTheMapIds.filter((e, index) => {
                    if (e === f.itemId) {
                      popupsOnTheMapIds.splice(index, 1);
                    }
                  });
                }
              });
            });
          }
        }
      };

      this.map.on('idle', (e: any) => {
        // if (e.sourceId !== 'marketRadarPointsSource' || !e.isSourceLoaded) return;
        this.map.on('move', updateMarkers);
        this.map.on('moveend', updateMarkers);
        // this.map.on('zoom', updateMarkers);
        updateMarkers();
      });

    }
  }

  drawPolygonMode: { type: string; time: number };

  @Watch('drawToolActivated')
  watchDrawToolActivated() {
    if (this.drawToolActivated.active) {
      this.map.on('dragstart', () => {
        this.map.getCanvas().style.cursor = 'grabbing';
      });

      this.map.on('dragend', () => {
        this.map.getCanvas().style.cursor = 'crosshair';
      });
      this.map.on('mousemove', () => {
        this.map.getCanvas().style.cursor = 'crosshair';
      });

      this.draw_shape('draw_polygon', true);
      this.currentDrawStyle = 'draw_polygon';
      this.map.off('click', this.buildingsClick);
      this.map.off('mousemove', this.buildingsHover);
      this.infiniteDraw = true;
    } else {
      this.infiniteDraw = false;

      this.map.on('dragstart', () => {
        this.map.getCanvas().style.cursor = 'grabbing';
      });

      this.map.on('dragend', () => {
        this.map.getCanvas().style.cursor = '';
      });
      this.map.on('mousemove', () => {
        this.map.getCanvas().style.cursor = '';
      });

      this.currentDrawStyle = '';
      this.map.on('click', this.buildingsClick);
      this.map.on('mousemove', this.buildingsHover);
      this.draw_shape('simple_select', false);
    }
  }
  @Watch('viewportToolActivated')
  watchViewportToolActivated() {
    if (this.viewportToolActivated.active) {
      this.captureViewPort();
      this.map.on('moveend', this.captureViewPort);
    } else {
      this.map.off('moveend', this.captureViewPort);
    }
  }

  @Watch('viewPortForSearchMap')
  watchViewPortForSearchMap() {
    const l: any = {
      id: this.viewPortForSearchMap.id,
      type: 'fill',
      source: {
        type: 'geojson',
        data: {
          type: 'Feature',
          geometry: {
            type: 'Polygon',
            coordinates: [this.viewPortForSearchMap.polygon],
          },
        },
      },
      layout: {},
      paint: {
        'fill-color': this.viewPortForSearchMap.color,
        'fill-opacity': 0.3,
      },

    };
    this.map.addLayer(l);
    this.mapLayerIds.push(this.viewPortForSearchMap.id);
    // this.$root.$emit('addSymbolLayer', this.viewPortForSearchMap);
  }

  @Watch('travelTimeData')
  watchTravelTimeData() {
    search.commitAddressLoading(store, true);

    const time: number = this.travelTimeData.time;
    const pointId: any = this.travelTimeData.pointId;
    const color: string = this.travelTimeData.color;

    const c = this.map.getSource('point')._data.features[0].geometry.coordinates;

    const sources = [{
      lng: c[0],
      lat: c[1],
      id: pointId,
    }];

    const toSend: {
      travelType: string,
      travelEdgeWeights: number[],
      serializer: string
      srid: any,
      simplify: number,
      rushHour?: boolean,
      transitMaxTransfers?: number,
      transitFrameTime?: number,
      transitFrameDate?: number,
    } = {
      travelType: this.travelTimeData.by.toLowerCase(),                   // Either 'walk', 'bike', 'car' or 'transit'
      travelEdgeWeights: [time * 60],   // Array of distinct travel times in seconds
      serializer: 'geojson',
      srid: SRID.SRID_4326,
      simplify: 100, // 100m max is 500m on Douglas-Peucker,

    };

    if (this.travelTimeData.rushHour) {
      toSend.rushHour = this.travelTimeData.rushHour;
    }
    if (this.travelTimeData.by.toLowerCase() === 'transit' && this.travelTimeData.rushHourStartTime) {
      toSend.transitMaxTransfers = 5;
      toSend.transitFrameTime = parseInt(this.travelTimeData.rushHourStartTime, 36);
      toSend.transitFrameDate = moment(new Date(), 'YYYYMMDD').format('YYYYMMDD');
    }

    tgmClient.polygons.fetch(sources, <PolygonGeoJsonOptions>toSend).then((a: any) => {
      this.addTravelPolygons(a.features, time, color, pointId, 'point');
      this.$emit('travelPolygonCreated', {
        geo: a.features,
        id: pointId,
      });

      search.commitAddressLoading(store, false);
    });
  }

  @Watch('marketRadarActivePointRemove')
  watchMarketRadarActivePointRemove() {
    if (this.activePopupHtml) {
      this.activePopupHtml.classList.remove('active-item');
    }
  }
  @Watch('drawnShapeForMap')
  watchDrawnShapeForMap() {
    const l: any = {
      id: this.drawnShapeForMap.shape.key,
      type: 'fill',
      source: {
        type: 'geojson',
        data: {
          type: 'Feature',
          geometry: {
            type: 'Polygon',
            coordinates: this.drawnShapeForMap.shape.geom.coordinates,
          },
        },
      },
      layout: {},
      paint: {
        'fill-color': this.drawnShapeForMap.shape.color,
        'fill-opacity': 0.6,
      },

    };
    this.mapLayerIds.push(this.drawnShapeForMap.shape.key);
    this.map.addLayer(l);
  }

  @Watch('nextIdForMapShapesAndViewports')
  watchNextIdForMapShapesAndViewports() {
    // this.startIdForMapShapesAndViewports = this.nextIdForMapShapesAndViewports;
    this.counter = new_counter(this.nextIdForMapShapesAndViewports);
  }
  @Watch('idsToRemove', { immediate: true })
  watchidsToRemove() {
    if (this.idsToRemove.length) {
      for (const i in this.idsToRemove) {
        try {
          this.map.removeLayer(this.idsToRemove[i]);
        } catch {
        }
        try {
          this.map.removeSource(this.idsToRemove[i]);
        } catch {
        }
      }
    }
  }
  @Watch('addressIsFromAutocomplete', { deep: true })
  watchAddressIsFromAutocomplete() {
    if (this.addressIsFromAutocomplete.v) {
      this.buildingIsClicked = false;
    }
  }
  @Watch('newBuildingModel')
  watchNewBuildingModel() {
    if (this.newBuildingModel && this.newBuildingModel.id) {
      this.setBuildingShape(this.newBuildingModel);
      let l = this.layersForHover;

      if (this.d3) {
        l = this.layersForHover3d;
      } else {
        if (this.satelliteView) {
          l = this.layersForHoverSatellite;
        }
      }
      const features = this.map.queryRenderedFeatures({ layers: l });
      for (let i = 0, l = features.length; i < l; i += 1) {
        if (features[i].properties.uniqueidentifier === this.newBuildingModel.id) {
          const f = features[i];
          if (f.properties.uniqueidentifier !== lastFeatureId) {
            lastFeatureId = f.properties.uniqueidentifier;
            this.lastFsIdHover = lastFeatureId;
            this.lastFsLayerTypeHover = f.layer.type;
            this.lastFsLayerId = f.layer.id;
            this.map.getCanvas().style.cursor = 'pointer';

            this.map.setPaintProperty(f.layer.id, this.d3 && !this.satelliteView ? 'fill-extrusion-color' : 'fill-color', ['case',
              ['==', ['get', 'uniqueidentifier'], f.properties.uniqueidentifier], '#5a636e',
              ['==', ['get', 'uniqueidentifier'], lastFeatureIdClicked], '#5a636e', '#cbc7c3',
            ]);

          }
        }
      }
    }
  } */
}
