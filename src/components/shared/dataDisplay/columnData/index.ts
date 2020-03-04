import { Component, Prop, Vue } from 'vue-property-decorator';
import template from './columnData.vue';
import { KeyValueList } from '@/models';

@Component({
  mixins: [template],
})
export default class ColumnData extends Vue {
  @Prop({ required: true })
  title: string;
  @Prop({ required: true })
  dataList: KeyValueList[];
}
