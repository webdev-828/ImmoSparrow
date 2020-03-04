import Vue from 'vue';
import { Component, Prop, Watch } from 'vue-property-decorator';
import template from './template.vue';
import {
  IEmployeeLightModel, $agency, $newObj,
  $team, TeamModel, ITeamModel, TeamMember, ITeamMember,
  IEntitySearchQuery, EntitySearchQuery, TeamMemberRole,
} from '@immosparrow/cockpit-api-v2';
import { getAgency } from '../../store/modules/adminModule';
import { commitSetLoadingButton } from '../../store/modules/globalStatesModule';
import store from '../../store';
import _ from 'lodash';
import { employeeName } from '../sharedFunctions';

@Component({
  name: 'TeamProfile',
  mixins: [template],
})

export default class TeamProfile extends Vue {

  @Prop({ default: false })
  addNew: boolean;

  @Prop({ default() { return $newObj(TeamModel); } })
  editTeam: ITeamModel;

  employees: IEmployeeLightModel[] = [];
  members: ITeamMember[] = []; // team.members is not reactive
  team: ITeamModel = $newObj(TeamModel);

  employeeName: Function = employeeName;

  get sortedEmployees () {
    return this.employees.sort((a, b) => {
      return a.lastName.localeCompare(b.lastName);
    });
  }

  @Watch('editTeam', { deep: true })
  setTeam() {
    const agency = getAgency(store);
    const query: IEntitySearchQuery = new EntitySearchQuery();
    query.text = '';
    query.pageSize = 100;
    query.page = 0;
    $agency(agency.id).findEmployees(query)
      .then((res) => {
        this.employees = res.items;
        this.members = [];
        this.team = $newObj(TeamModel);
        if (!this.addNew) {
          this.team = _.cloneDeep(this.editTeam);
        }
        this.team.members = this.team.members || [];
        this.team.members.forEach((member) => {
          this.loadMember(member);
        });
      });
  }

  created () {
    commitSetLoadingButton(store, false);
    this.setTeam();
  }

  addOrUpdateTeam (form: string) {
    this.$validator.validateAll(form).then((result) => {
      if (result) {
        commitSetLoadingButton(store, true);
        this.team.members = this.members as TeamMember[];
        this.team.isEnabled = true;
        if (this.addNew) {
          const agency = getAgency(store);
          $agency(agency.id).createTeam(this.team)
            .then((res) => {
              commitSetLoadingButton(store, false);
              if (res) {
                Vue.prototype.$notify({
                  group: 'actions',
                  type: 'success',
                  duration: 2500,
                  text: 'Team successfully created',
                });
                this.$emit('loadTeams');
                this.$emit('closeTeam');
              }
            });
        } else {
          $team(this.team.id).update(this.team as TeamModel)
            .then(() => {
              commitSetLoadingButton(store, false);
              Vue.prototype.$notify({
                group: 'actions',
                type: 'success',
                duration: 2500,
                text: 'Team successfully updated',
              });
              const updateTeam = _.cloneDeep(this.team);
              this.$emit('updateTeam', updateTeam);
            });
        }
      }
    });
  }

  deletingTeam: boolean = false;
  deleteTeam() {
    this.deletingTeam = true;
    $team(this.team.id).delete()
      .then(() => {
        this.deletingTeam = false;
        this.$emit('loadTeams');
        this.$emit('closeTeam');
      });
  }

  moveEmployee(employeeId: string, role: string) {
    this.members.find((emp: any) => emp.employeeId === employeeId).role = TeamMemberRole[role];
  }

  loadMember(member: ITeamMember) {
    this.members.unshift(member);
    const emp = this.employees.find(e => e.id === member.employeeId);
    if (emp) {
      this.employees.splice(this.employees.indexOf(emp), 1);
    }
  }

  addMember (emp: IEmployeeLightModel) {
    if (!this.members.find(e => e.employeeId === emp.id)) {
      this.members.unshift({
        employee: emp,
        employeeId: emp.id,
        role: TeamMemberRole.Regular,
      });
      this.employees.splice(this.employees.indexOf(emp), 1);
    }
  }

  removeMember (emp: IEmployeeLightModel) {
    this.employees.unshift(emp);
    const el = this.members.find(item => item.employeeId === emp.id);
    this.members.splice(this.members.indexOf(el), 1);
  }

  checkMemberRole(role: number) {
    return TeamMemberRole[role];
  }
}
