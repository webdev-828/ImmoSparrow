import { Component } from 'vue-property-decorator';
import { mixins } from 'vue-class-component';
import template from './LeftSidebarTemplate.vue';
import store from '@store';
import { getIsShownLeftSidebar, getLeftSidebarActiveTab } from '@store/modules/sidebars';
import GlobalMixin from '@/mixins/global';

@Component({
  mixins: [template],
  inject: ['$validator'],
})
export default class SideTab extends mixins(GlobalMixin) {
  get isShown() {
    return getIsShownLeftSidebar(store);
  }
  get activeTab() {
    return getLeftSidebarActiveTab(store);
  }
}
