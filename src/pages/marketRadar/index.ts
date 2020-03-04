import { Component, Vue } from 'vue-property-decorator';
import template from './MarketRadar.vue';
import AdsMapComponent from '@components/marketRadar/ads/map';
import MRLeftSidebar from '@components/marketRadar/leftSiderbar';
import MRRightSidebar from '@components/marketRadar/rightSidebar';

@Component({
  mixins: [template],
  components: {
    amap: AdsMapComponent,
    'mr-left-sidebar': MRLeftSidebar,
    'mr-right-sidebar': MRRightSidebar,
  },
})
export default class AdsComponent extends Vue {
}
