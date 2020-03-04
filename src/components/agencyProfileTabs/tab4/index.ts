import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';
import template from './index.template.vue';
import {
  $agency, $newObj, IEntitySearchQuery, EntitySearchQuery,
  $pipelineDef, PipelineDefModel, IPipelineStepDef,
  PipelineStepDef,
} from '@immosparrow/cockpit-api-v2';

@Component({
  name: 'Tab4',
  mixins: [template],
})

export default class Tab4 extends Vue {

  @Prop()
  agencyId: string;

  stepsLimit: number = 8;

  pipelineDef: PipelineDefModel = $newObj(PipelineDefModel);
  updating: boolean = false;

  created() {
    const query: IEntitySearchQuery = $newObj(EntitySearchQuery);
    $agency(this.agencyId).findPipelineDefs(query)
      .then((res) => {
        if (res.items && res.items.length) {
          $pipelineDef(res.items[0].id).get().then((res2) => {
            this.pipelineDef = res2;
          });
        }
      });
  }
  addStep (index: number) {
    if (this.pipelineDef.steps.length < this.stepsLimit) {
      const newStep = $newObj(PipelineStepDef);
      newStep.id = Math.random().toString(16).substring(2, 7) + Math.random().toString(36).substring(2, 7);
      this.pipelineDef.steps.splice(index, 0, newStep);
    } else {
      Vue.prototype.$notify({
        group: 'actions',
        type: 'warn',
        duration: 5000,
        text: 'You can not add more than 8 columns',
      });
    }
  }
  deleteStep (index: number) {
    this.$validator.errors.items = [];
    this.pipelineDef.steps.splice(index, 1);
  }
  moveStep (pos: number,  newPos: number) {
    this.$validator.errors.items = [];
    const newSteps = this.pipelineDef.steps;
    const b = newSteps[pos];
    newSteps[pos] = newSteps[newPos];
    newSteps[newPos] = b;
    Vue.set(this.pipelineDef, 'steps', newSteps);
    this.$forceUpdate();
  }
  updateDefintion () {
    if (!this.pipelineDef) {
      return;
    }
    this.$validator.validateAll('step_form').then((isValid) => {
      if (isValid) {
        this.updating = true;
        $pipelineDef(this.pipelineDef.id).update(this.pipelineDef)
          .then((res) => {
            setTimeout(() => {
              this.updating = false;
              Vue.prototype.$notify({
                group: 'actions',
                type: res ? 'success' : 'error',
                duration: 2500,
                text: res ? 'Pipeline definition succesfully updated' : 'Error while trying to update pipeline defintion',
              });
            },        1000);
          });
      }
    });
  }
}
