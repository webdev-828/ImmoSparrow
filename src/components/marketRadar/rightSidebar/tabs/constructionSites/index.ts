import { Component, Vue } from 'vue-property-decorator';
import template from './ConstructionSitesTemplate.vue';

@Component({
  mixins: [template],
})
export default class ConstructionSitesTab extends Vue {
  selectedBuildingSite: any = true;
}
