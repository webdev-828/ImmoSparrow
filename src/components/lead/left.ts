import { Component } from 'vue-property-decorator';
import template from './template.vue';
import Base from './../base';
@Component({
  mixins: [template],
  components: {
  },
})
export default class LeftLead extends Base {

  created () {

  }

  show_leads() {

    this.$root.$emit('show_leads', true);

    /*searchModule.dispatchFind(store, {searchQuery: this.searchData, sortBy: this.sortBy.value, page: this.page_num, pageSize: this.per_page})
      .then(() => {
        let self = this;
        globalState.commitSetLoadingButton(store, false);
        console.log("Successfull search");
        globalState.commitShowMapRightSidebar(store, false);
        globalState.commitShowOverviewList(store, true);
        self.searchSidebarToggle();
        // self.showOverviewList = true;
      });*/

  }

}
