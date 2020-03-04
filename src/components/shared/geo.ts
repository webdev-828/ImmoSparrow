import autocomplete from '../addressAutocomplete';
import Modal from '../modal';
import Base from '../base';
import template from './geo.template.vue';
import { Component, Prop, Watch } from 'vue-property-decorator';
import { AgencyModel, GeoAreaSet, GeoAreaShape } from '@immosparrow/cockpit-api-v2';
import Vue from 'vue';
import _ from 'lodash';
@Component({
  name: 'SharedGeo',
  mixins: [template],
  components: {
    autocomplete,
    Modal,
  },
})
export default class SharedGeo extends Base {

  @Prop()
  setGeoAddress: Function;

  @Prop()
  getSearchSuggestions: Function;

  @Prop()
  openMapAndDraw: Function;

  @Prop()
  addArea: Function;

  @Prop()
  stc: Function;

  @Prop()
  showSearchAreas: boolean;

  @Prop()
  closeAreasCLick: Function;

  @Prop()
  removeShape: Function;

  @Prop()
  restrictions: any;

  @Prop()
  removeAddressItem: Function;

  @Prop()
  mapIsLoaded: boolean;

  locationType: string = 'Address';
  object: any = {};
  controls: any = {
    Address: true,
    TravelTime: false,
    Radius: false,
    ManualDraw: false,
    ViewPort: false,
    PolygonSelect: false,
  };

  interactWith: object = {
    Address: 'Zip/Locality',
    TravelTime: 'Travel Time',
    Radius: 'Radius',
    ManualDraw: 'Manual Draw',
    ViewPort: 'ViewPort',
    po_communes: 'Commune',
    po_cantons: 'Canton',
    po_districts: 'District',
    po_market_regions: 'Market region',
    po_ms_regions: 'Ms Region',
  };

  viewPortNameEdit: boolean = false;
  currentShape: any = {};
  viewPorts: any[] = [];
  viewPort: any = null;
  what: string;
  emitInteract: boolean;
  draw: string;

  destroyed() {
    // this.$delete(this.restrictions, "geoRestriction");
    // Vue.delete(this.restrictions);
    // delete this.object;
    // this.object = {};
    // this.object.geoRestriction.shapes = [];
    // this.object.geoRestriction.addressParts = [];
    this.currentShape = {};
    this.viewPorts = [];
    this.viewPort = null;
    this.what = '';
    this.viewPortNameEdit = false;

  }
  showControl(what: string, emitInteract?: boolean, draw?: string) {

    this.openMapAndDraw();
    const i = setInterval(() => {
      if (this.mapIsLoaded) {
        clearInterval(i);
        for (const i in this.controls) {
          this.controls[i] = false;
        }

        this.controls[what] = true;
        this.$root.$emit('interact', {
          bool: emitInteract,
          with: what,
        });
        this.$root.$emit('startDraw', draw);

        this.locationType = what;

        if (what === 'ViewPort') {
          this.$root.$emit('getViewPort');
          this.viewPortNameEdit = true;

        }

        if (what !== 'Radius' && what !== 'ManualDraw') {
          this.$root.$emit('infiniteDrawOff');
        }

        // console.log(this.currentShape.id);
        if (this.currentShape.id) {
          this.$root.$emit('removeLayerById', this.currentShape.id);
          this.currentShape = {};
          this.viewPortNameEdit = false;
        }
      }
    },                    1);

  }

  created() {

    if (this.restrictions !== undefined) {
      const restrictions = _.cloneDeep(this.restrictions);
      Vue.set(this.object, 'geoRestriction', restrictions);
      this.$forceUpdate();

    } else {
      if (this.object.geoRestriction === undefined) {
        Vue.set(this.object, 'geoRestriction', new GeoAreaSet());
        Vue.set(this.object.geoRestriction, 'addressParts', []);
        Vue.set(this.object.geoRestriction, 'shapes', []);
      } else {
        if (this.object.geoRestriction.addressParts === undefined) {
          Vue.set(this.object.geoRestriction, 'addressParts', []);
        }
        if (this.object.geoRestriction.shapes === undefined) {
          Vue.set(this.object.geoRestriction, 'shapes', []);
        }
      }
    }

    this.$nextTick(() => {

      const self = this;
      if (self.$refs.autocomplete_geo !== undefined) {
        self.$refs.autocomplete_geo.$refs['search_element'].onfocus = function () {
          self.openMapAndDraw();
        };
      }
    });

    this.$root.$on('shape_created', (shape: any) => {
      if (shape.infinite && (shape.drawStyle === 'draw_polygon' || shape.drawStyle === 'draw_radius')) {
        this.currentShape = shape;
        this.currentShape.name = shape.drawStyle === 'draw_polygon' ? 'Polygon name' : 'Radius name';
        this.viewPortNameEdit = true;

        setTimeout(() => {
          const el = document.getElementById('shapeName') as HTMLInputElement;
          el.focus();
          el.select();
        },         100);

        return;
      }
    });

    this.$root.$on('showViewPort', (viewPort: any) => {

      if (!viewPort.show) {
        this.showControl('Address');
        return;
      }

      this.viewPort = viewPort;
      this.viewPortNameEdit = true;
      setTimeout(() => {
        const el = document.getElementById('viewportName') as HTMLInputElement;
        if (el) {
          el.focus();
          el.select();
        }
      },         100);

    });

    this.$root.$emit('getViewPort');

  }

  addViewport(shape: any) {

    const g = new GeoAreaShape();
    g.name = shape.name;
    g.geom = [shape.polygon];
    g.color = this.get_random_color();
    g['id'] = shape.id;

    this.$emit('addToShapes', g);
    this.object.geoRestriction.shapes.unshift(g);
    this.$forceUpdate();
  }

  addShape(shape: any) {

    const g = new GeoAreaShape();
    g.name = shape.name;
    g.geom = shape.geom.coordinates;
    g.color = shape.color;
    g['id'] = shape.id;

    this.object.geoRestriction.shapes.unshift(g);
    this.$emit('addToShapes', g);
    this.$forceUpdate();
  }

  @Watch('currentShape', { immediate: true, deep: true })
  cs() {

    if (this.currentShape.name && this.currentShape.id) {
      this.$root.$emit('addSymbolLayer', this.currentShape);
    }
  }

  @Watch('restrictions', { immediate: true, deep: true })
  wres () {

    if (this.object.geoRestriction) {
      const restrictions = _.cloneDeep(this.restrictions);
      Vue.set(this.object, 'geoRestriction', restrictions);
      this.$forceUpdate();

    }

  }

  setType(value: number, what: string) {
    this.locationType = what;
    this.$root.$emit('changeSearchParams', value);
  }

}
