import Vue from 'vue';
import { Component } from 'vue-property-decorator';
import template from './Teams.vue';
import {
  $team, $agency, IEntitySearchQuery, EntitySearchQuery,
  ITeamLightModel, IEntitySearchResult, EntitySearchQueryDeletedStatus,
  ITeamModel, TeamModel, $newObj, TeamMemberRole, TeamLightModel,
} from '@immosparrow/cockpit-api-v2';
import { getAgency } from '../../store/modules/adminModule';
import { commitProfileRightSidebar } from '../../store/modules/globalStatesModule';
import store from '../../store';
import TeamProfile from '../../components/teamProfile';
import { employeeName } from '../../components/sharedFunctions';
import ConfirmModal from '../../components/modal/confirmModal';

@Component({
  mixins: [template],
  components: { TeamProfile, ConfirmModal },
})

export default class Vendors extends Vue {

  teams: IEntitySearchResult<ITeamLightModel> = { items: [] };
  addNew: boolean = false;
  selectedIndex: number = null;
  selectedTeam: ITeamModel = $newObj(TeamModel);
  loadElement: boolean = false;

  loading: boolean = false;

  teamSearchQuery: string = '';
  searchLoading: boolean = false;
  searchFinished: boolean = false;

  employeeName: Function = employeeName;

  deleteTeam: ITeamLightModel = undefined;
  deletingTeam: boolean = false;
  showModal: boolean = false;

  moveEmployee(team: any, employeeId: string, role: string) { // role is readonly - that's why we have any
    team.members.find((emp: any) => emp.employeeId === employeeId).role = TeamMemberRole[role];
    $team(team.id).updateTeamMemberRole(employeeId, TeamMemberRole[role]);
  }

  get checkNext() {
    const ind = this.selectedIndex + 1;
    return this.teams.items[ind];
  }

  created () {
    this.closeTeam();
    this.loadTeams();
  }

  loadTeams () {
    this.loading = true;
    const agency = getAgency(store);
    const query: IEntitySearchQuery = new EntitySearchQuery();
    query.text = this.teamSearchQuery;
    query.pageSize = 100;
    query.page = 0;
    query.deletedStatus = EntitySearchQueryDeletedStatus.Default;
    $agency(agency.id).findTeams(query)
      .then((res) => {
        setTimeout(() => {
          this.teams = res;
          this.searchLoading = false;
          this.loading = false;
        },           500);
      });
  }

  getMembers(team: ITeamLightModel) {
    return team.members.filter((member) => {
      return member.role === TeamMemberRole.Regular;
    });
  }
  getManagers(team: ITeamLightModel) {
    return team.members.filter((member) => {
      return member.role === TeamMemberRole.Manager;
    });
  }

  addNewTeam () {
    this.addNew = true;
    commitProfileRightSidebar(store, true);
  }

  getTeam (id: string, index: number) {
    commitProfileRightSidebar(store, true);
    this.loadElement = true;
    $team(id).get()
      .then((res) => {
        this.selectedTeam = res;
        this.selectedIndex = index;
        this.addNew = false;
        this.loadElement = false;
      });
  }

  closeTeam() {
    this.selectedTeam = $newObj(TeamModel);
    commitProfileRightSidebar(store, false);
    this.selectedIndex = null;
  }

  nextPrevTeam(next: boolean) {
    const newIndex = next ? this.selectedIndex + 1 : this.selectedIndex - 1;
    this.getTeam(this.teams.items[newIndex].id, newIndex);
  }

  updateTeam (updatedTeam: ITeamModel) {
    const item = this.teams.items.find(team => team.id === updatedTeam.id);
    if (item) {
      item.name = updatedTeam.name;
      this.selectedTeam.name = updatedTeam.name;
      item.members = updatedTeam.members;
      this.teams.items[this.teams.items.indexOf(item)] = item;
    }
  }

  searchFor() {
    if (this.teamSearchQuery) {
      this.searchFinished = false;
      this.searchLoading = true;
      this.loadTeams();
      this.searchFinished = true;
    }
  }

  clearSearch() {
    this.loading = true;
    this.teamSearchQuery = '';
    this.searchFinished = false;
    this.loadTeams();
  }

  checkMemberRole(role: number) {
    return TeamMemberRole[role];
  }

  deleteTeamModal (team: ITeamLightModel) {
    this.deleteTeam = team;
    this.showModal = true;
  }
  cancelDeletion () {
    this.deleteTeam = undefined;
    this.showModal = false;
  }
  deleteTeamConfirm () {
    this.deletingTeam = true;
    this.showModal = false;
    $team(this.deleteTeam.id).delete().then(() => {
      setTimeout(() => {
        Vue.prototype.$notify({
          group: 'actions',
          type: 'success',
          duration: 2500,
          text: 'Team successfully removed',
        });
        this.deletingTeam = false;
        this.deleteTeam = undefined;
        this.loadTeams();
      },         1000);
    });
  }
}
