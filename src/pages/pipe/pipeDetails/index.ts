import Vue from 'vue';
import { Component, Prop, Watch } from 'vue-property-decorator';
import template from './template.vue';
import {
    PipelineModel, ITeamLightModel,
    $pipelines, EntityType, $newObj, EntityOwnerModel,
    $employee, IEntitySearchQuery, EntitySearchQuery, $pipeline, IPipelineModel,
} from '@immosparrow/cockpit-api-v2';
import { getEmployeeContext } from '../../../store/modules/authStatesModule';
import store from '../../../store';
@Component({
  name: 'PipeDetails',
  mixins: [template],
})

export default class PipeDetails extends Vue {

  @Prop({ default: null })
  editPipeId: string;

  pipeAssign: object = {
    me: true,
    teams: false,
    agency: false,
  };

  $refs: {
    newPipe: any,
  };

  loading: boolean = false;

  teams: ITeamLightModel[] = [];
  selectedTeam: ITeamLightModel = null;
  pipeline: IPipelineModel = $newObj(PipelineModel);

  created () {
    const emp = this.empCtx;
    const query: IEntitySearchQuery = new EntitySearchQuery();
    query.text = '';
    query.pageSize = 100;
    query.page = 0;

    $employee(emp.employee.id).teams()
      .then((res) => {
        this.teams = res;
      });
    this.$nextTick(() => {
      this.$refs.newPipe.focus();
    });
  }

  get empCtx () {
    return getEmployeeContext(store);
  }

  @Watch('editPipeId', { immediate: true })
  loadPipe () {
    const emp = this.empCtx;
    if (this.editPipeId) {
      $pipeline(this.editPipeId).get()
        .then((res) => {
          this.pipeline = res;
          $employee(emp.employee.id).teams()
            .then((res2) => {
              this.teams = res2;
              if (this.pipeline.owner) {
                this.revertAssignOwner();
              }
            });
        });
    }
  }

  showPipeAssign(tab: string) {
    this.selectedTeam = null;
    for (const i in this.pipeAssign) {
      if (i === tab) {
        this.pipeAssign[i] = true;
      } else {
        this.pipeAssign[i] = false;
      }
    }
  }
  createNewPipe () {
    this.loading = true;
    this.pipeline.isEnabled = true;

    this.pipeline.owner = $newObj(EntityOwnerModel);

    this.assignOwner();

    $pipelines.create(this.pipeline)
      .then((res) => {
        const newPipe = res;
        this.loading = false;
        Vue.prototype.$notify({
          group: 'actions',
          type: 'success',
          duration: 2500,
          text: 'Pipe successfully created',
        });
        this.pipeline = $newObj(PipelineModel);
        this.selectedTeam = null;
        this.$emit('reloadPipelines', newPipe);
      });
  }

  updatePipe () {
    this.loading = true;
    this.assignOwner();
    $pipeline(this.pipeline.id).update(this.pipeline)
      .then((res) => {
        this.loading = false;
        if (res) {
          Vue.prototype.$notify({
            group: 'actions',
            type: 'success',
            duration: 2500,
            text: 'Pipe successfully updated',
          });
          this.$emit('reloadPipelines', this.pipeline);
        } else {
          Vue.prototype.$notify({
            group: 'actions',
            type: 'error',
            duration: 2500,
            text: 'Error while trying to update pipe',
          });
        }
      });
  }

  assignOwner () {
    if (this.pipeAssign['me']) {
      this.pipeline.owner.ownerType = EntityType.Employee;
      const emp = this.empCtx;
      this.pipeline.owner.ownerId = emp.employee.id;
    } else if (this.pipeAssign['teams']) {
      this.pipeline.owner.ownerType = EntityType.Team;
      this.pipeline.owner.ownerId = this.selectedTeam.id;
    } else if (this.pipeAssign['agency']) {
      const agency = this.empCtx.agency.id;
      this.pipeline.owner.ownerType = EntityType.Agency;
      this.pipeline.owner.ownerId = agency;
    }
  }

  revertAssignOwner () {
    switch (this.pipeline.owner.ownerType) {
      case EntityType.Employee:
        this.showPipeAssign('me');
        break;
      case EntityType.Agency:
        this.showPipeAssign('agency');
        break;
      case EntityType.Team:
        this.showPipeAssign('teams');
        const team = this.teams.find(item => item.id === this.pipeline.owner.ownerId);
        if (team) {
          this.selectedTeam = team;
        }
        break;
    }
  }

  checkOwnerType(type: number) {
    return EntityType[type];
  }

  closePipeDetails () {
    this.pipeline = $newObj(PipelineModel);
    this.$emit('closePipeDetails');
  }
}
