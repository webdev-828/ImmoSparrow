import { Component, Prop } from 'vue-property-decorator';
import { mixins } from 'vue-class-component';
import template from './ListItemTemplate.vue';
import GlobalMixin from '@/mixins/global';
import { HistoryItem } from '@/models';

@Component({
  mixins: [template],
})
export default class SideTab extends mixins(GlobalMixin) {
  @Prop({ default: 'history' })
  type: 'history' | 'bookmark';
  @Prop({ required: true })
  item: HistoryItem;

  editName: boolean = false;

  get isHistory() {
    return this.type === 'history';
  }
  get formatedName() {
    const name = this.item.name;
    if (name.indexOf('[t]') > -1) {
      return name.replace(/\[t\]/g, '<span notranslate>').replace(/\[\/t\]/g, '</span>').replace(/\[sq2\]/g, 'm<sup>2</sup>');
    }
    return `<span notranslate>${name}</span>`;
  }
  get formatedNameForEdit() {
    return this.item.name.replace(/\[t\]/g, '').replace(/\[\/t\]/g, '').replace(/\[sq2\]/g, '');
  }

  sendAction(actionName: string, param?: any) {
    this.$emit(actionName, param ? param : this.item);
  }
  saveName(newName: string) {
    if (!newName) return;
    this.editName = false;
    const payload = { entry: this.item, name: newName };
    this.sendAction('editBookmarkName', payload);
  }
}
