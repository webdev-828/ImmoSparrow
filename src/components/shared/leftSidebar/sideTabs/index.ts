import { Component, Prop, Vue } from 'vue-property-decorator';
import template from './Template.vue';
import store from '@store';
import { toggleSidebar, getLeftSidebarActiveTab, setSidebarActiveTab } from '@store/modules/sidebars';
import { getIsMapLoaded } from '@store/modules/map';
import { SidebarTab } from '@models/components';

@Component({
  mixins: [template],
})
export default class SideTab extends Vue {
  @Prop({ required: true, default: (): SidebarTab[] => [] })
  tabs: SidebarTab[];

  get activeTab() {
    return getLeftSidebarActiveTab(store);
  }
  get isMapLoaded() {
    return getIsMapLoaded(store);
  }

  toggleSidebar() {
    toggleSidebar(store, false);
  }
  formatName(name: string) {
    return name.charAt(0).toUpperCase() + name.slice(1);
  }
  changeTab(tab: string) {
    setSidebarActiveTab(store, { tabName: tab, level: 1 });
  }
}
