import { Component, Prop, Vue } from 'vue-property-decorator';
import template from './RightSidebarTemplate.vue';
import store from '@store';
import { getSearchedAddress, setSearchedAddress } from '@store/modules/main';
import {
  getIsShownRightSidebar, getRightSidebarActiveTab,
  toggleSidebar, getIsEnabledRightSidebar, setIsEnabledRightSidebar,
} from '@store/modules/sidebars';

@Component({
  mixins: [template],
})
export default class RightSidebar extends Vue {
  @Prop({ required: true })
  asideId: string;
  @Prop({ default: (): string[] => [] })
  additionalClasses: string[];
  @Prop({ default: false })
  disableToggling: boolean;

  get isEnabled() {
    return getIsEnabledRightSidebar(store);
  }
  get isVisible() {
    return getIsShownRightSidebar(store);
  }
  get activeTab() {
    return getRightSidebarActiveTab(store);
  }
  get searchedAddress() {
    return getSearchedAddress(store);
  }

  toggleSidebar() {
    toggleSidebar(store, true);

    const searchSidebar = document.querySelector('#sidebar-object-fixed-2');

    if (searchSidebar.classList.contains('active')) {
      searchSidebar.classList.remove('active');

      document.getElementsByClassName('switch_style')[0].className = 'switch_style mapboxgl-ctrl-group mapboxgl-ctrl second';
      this.$root.$emit('map_change_size', 'big');

    } else {
      searchSidebar.classList.add('active');
      document.getElementsByClassName('switch_style')[0].className = 'switch_style mapboxgl-ctrl-group mapboxgl-ctrl on_left second';
      this.$root.$emit('map_change_size', 'small');

    }
  }
  closeSidebar() {
    this.$emit('closed');

    const mapSearchSidebar = document.querySelector('#sidebar-object-fixed-2');

    if (mapSearchSidebar) {
      if (!mapSearchSidebar.classList.contains('active')) {

        this.$root.$emit('map_change_size', 'big');
      }
    } else  {
      this.$root.$emit('map_change_size', 'big');
    }
    document.getElementsByClassName('switch_style')[0].className = 'switch_style mapboxgl-ctrl-group mapboxgl-ctrl';
  }
}
