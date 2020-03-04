import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';
import template from './template.vue';
import {
  IPipelineEntryNoteModel,
  $pipelineEntryNote,
  PipelineEntryNoteModel,
} from '@immosparrow/cockpit-api-v2';
import ConfirmModal from '../../../components/modal/confirmModal';
@Component({
  name: 'NoteDetails',
  mixins: [template],
  components: {
    ConfirmModal,
  },
})

export default class NoteDetails extends Vue {

  @Prop({ default: null })
  note: IPipelineEntryNoteModel;

  @Prop({ default: true })
  isOwner: boolean;

  showModal: boolean = false;
  editing: boolean = false;

  deleteNote () {
    this.showModal = false;
    $pipelineEntryNote(this.note.id).delete()
    .then(() => {
      this.$emit('closeNoteDetail');
      Vue.prototype.$notify({
        group: 'actions',
        type: 'success',
        duration: 2500,
        text: 'Note successfully deleted',
      });
      this.$root.$emit('refreshActivities');
    });
  }
  updateNote(form: string) {
    this.$validator.validateAll(form).then((result) => {
      if (result) {
        this.editing = true;
        $pipelineEntryNote(this.note.id).update(this.note as PipelineEntryNoteModel)
          .then(() => {
            setTimeout(() => {
              Vue.prototype.$notify({
                group: 'actions',
                type: 'success',
                duration: 2500,
                text: 'Note successfully updated',
              });
              this.editing = false;
              this.$root.$emit('refreshActivities');
              this.$emit('closeNoteDetail');
            },         1000);
          });
      }
    });
  }
}
