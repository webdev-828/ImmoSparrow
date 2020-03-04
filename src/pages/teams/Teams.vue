<template>
  <div>
    <div
      id="head-container"
      class="bg-white">
      <div class="main-section">
        <div class="title-section">Teams</div>
        <div class="info-section">
          <small><var teamCount>{{ teams.items.length }}</var>{{ teams.items.length === 1 ? " group" : " groups" }}</small>
        </div>
        <div class="control-section">
          <div class="btn-toolbar">
            <div class="btn-group">
              <div class="input-group">
                <input
                  v-model="teamSearchQuery"
                  placeholder="Team/employee name"
                  type="text"
                  class="form-control input-sm search-header-input"
                  @keyup.enter="searchFor()">
                <span
                  v-if="!searchLoading"
                  class="input-group-addon cursor-show">
                  <i
                    class="fa fa-search"
                    @click="searchFor()"/>
                </span>
                <span
                  v-if="searchLoading"
                  class="input-group-addon">
                  <i class="fa fa-circle-o-notch fa-spin"/>
                </span>
                <span
                  v-if="searchFinished"
                  class="input-group-addon bg-gray-light cursor-show"
                  @click="clearSearch">
                  <i class="fa fa-remove"/>
                </span>
              </div>
            </div>
            <div class="btn-group">
              <button
                class="btn btn-sm btn-success"
                type="button"
                @click="addNewTeam()"><i class="fa fa-plus"/> Add Team</button>
            </div>
          </div>
        </div>
      </div>
    </div>
    <main
      id="main-container"
      class="standard-vb table-page">
      <confirm-modal
        :showModal="showModal"
        :title="'Delete Team'"
        :text="'Are you sure you want to delete this team?'"
        :onCancel="cancelDeletion"
        :onSubmit="deleteTeamConfirm"/>
      <div
        v-bar
        style="position: absolute; z-index: 1">
        <div v-close-rightSidebar>
          <div class="content">
            <div class="block">
              <div class="block-content">
                <div class="row">
                  <div class="col-sm-12">
                    <table
                      v-if="!loading"
                      class="table table-condensed">
                      <thead>
                        <tr>
                          <th>Name</th>
                          <th class="width30percent">Members</th>
                          <th class="width30percent">Managers</th>
                          <th>Ratio</th>
                          <th>Total</th>
                          <th class="width10percent text-right">Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr
                          v-for="(team, teamIndex) in teams.items"
                          :key="teamIndex"
                          :class="{'selected': selectedIndex === teamIndex}"
                          class="hovertr"
                          @click.stop="getTeam(team.id, teamIndex)">
                          <td notranslate>{{ team.name }}</td>
                          <td>
                            <ol
                              class="list-unstyled margin-b-5 btn-list members">
                              <li
                                v-for="(member, index) in getMembers(team)"
                                :key="index">
                                <div class="btn-group">
                                  <button
                                    class="btn btn-xs btn-default"
                                    type="button"
                                    notranslate
                                    @click.stop>{{ employeeName(member.employee) }}</button>
                                  <button
                                    v-tooltip.top="{ content: 'Move to Managers', delay: { show: 700, hide: 100 }}"
                                    class="btn btn-xs btn-default bg-white"
                                    type="button"
                                    @click.stop="moveEmployee(team, member.employeeId, 'Manager')">
                                    <i
                                      :class="checkMemberRole(member.role) === 'Regular' ? 'fa-long-arrow-right' : 'fa-long-arrow-left'"
                                      class="fa"/>
                                  </button>
                                </div>
                              </li>
                            </ol>
                          </td>
                          <td>
                            <ol
                              class="list-unstyled margin-b-5 btn-list managers">
                              <li
                                v-for="(member, index) in getManagers(team)"
                                :key="index">
                                <div
                                  class="btn-group">
                                  <button
                                    class="btn btn-xs btn-default"
                                    type="button"
                                    notranslate
                                    @click.stop>{{ employeeName(member.employee) }}</button>
                                  <button
                                    v-tooltip.top="{ content: 'Move to Members', delay: { show: 700, hide: 100 }}"
                                    class="btn btn-xs btn-default bg-white"
                                    type="button"
                                    @click.stop="moveEmployee(team, member.employeeId, 'Regular')">
                                    <i
                                      :class="checkMemberRole(member.role) === 'Regular' ? 'fa-long-arrow-right' : 'fa-long-arrow-left'"
                                      class="fa"/>
                                  </button>
                                </div>
                              </li>
                            </ol>
                          </td>
                          <td>{{ getMembers(team).length }}/{{ getManagers(team).length }}</td>
                          <td>{{ getMembers(team).length + getManagers(team).length }}</td>
                          <td class="text-right">
                            <button
                              v-tooltip.top="{ content: 'Delete Team', delay: { show: 700, hide: 100 }}"
                              v-if="team.isEnabled"
                              :disabled="deletingTeam && (deleteTeam && deleteTeam.id === team.id)"
                              class="btn btn-xs btn-default"
                              @click.stop="deleteTeamModal(team)">
                              <i
                                v-if="deletingTeam && (deleteTeam && deleteTeam.id === team.id)"
                                class="fa fa-refresh fa-spin"/>
                              <i
                                v-else
                                class="fa fa-trash"/>
                            </button>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                    <div
                      v-if="loading"
                      class="text-center">
                      <i class="fa fa-circle-o-notch fa-spin spn"/>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
    <aside
      v-move
      v-if="$store.getters['globalStatesModule/profileRightSidebar']"
      id="sidebar-object-fixed"
      class="active sidebar-shadow just-header-vb">
      <div
        v-if="loadElement"
        class="preloader">
        <i class="fa fa-circle-o-notch fa-spin"/>
      </div>
      <div
        v-else
        class="side-panel">
        <div class="detail-header">
          <div class="title">
            <div class="centering-block">
              <div v-if="addNew">Add Team</div>
              <div
                v-else
                notranslate>{{ selectedTeam.name }}</div>
            </div>
          </div>
          <div class="controls">
            <template v-if="!addNew">
              <button
                v-tooltip.bottom="{ content: 'Previous team', delay: { show: 700, hide: 100 }}"
                v-if="selectedIndex !== 0"
                class="btn btn-sm btn-default"
                type="button"
                @click="nextPrevTeam(false)">
                <i class="fa fa-arrow-left"/><br>
              </button>
              <button
                v-tooltip.bottom="{ content: 'Next team', delay: { show: 700, hide: 100 }}"
                v-if="checkNext"
                class="btn btn-sm btn-default"
                type="button"
                @click="nextPrevTeam(true)">
                <i class="fa fa-arrow-right"/><br>
              </button>
            </template>
            <button
              v-tooltip.bottom="{ content: 'Close panel', delay: { show: 700, hide: 100 }}"
              class="btn btn-sm btn-default margin-l-10"
              data-toggle="layout"
              data-action="side_overlay_close"
              type="button"
              @click="closeTeam()">
              <i class="fa fa-close"/>
            </button>
          </div>
        </div>
        <team-profile
          :addNew="addNew"
          :editTeam="selectedTeam"
          @updateTeam="updateTeam"
          @loadTeams="loadTeams"
          @closeTeam="closeTeam"
        />
      </div>
    </aside>
  </div>
</template>
