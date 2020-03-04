<template>
  <div>
    <div
      v-bar
      class="detail-content">
      <div class="tab-content">
        <form
          id="teamForm"
          data-vv-scope="teamForm"
          @submit.prevent="addOrUpdateTeam('teamForm')">
          <div
            class="tab-pane active">
            <div class="data-section stand-out margin-b-20">
              <div class="section-content">
                <div
                  :class="{ 'has-error' : errors.has('teamForm.team name') }"
                  class="form-group">
                  <label for="teamName">Team Name</label>
                  <input
                    v-validate="{ required: true, min: 2, max: 30 }"
                    id="teamName"
                    v-model="team.name"
                    name="team name"
                    data-vv-scope="teamForm"
                    class="form-control">
                  <div
                    v-show="errors.has('teamForm.team name')"
                    class="help-block text-right animated fadeInDown">{{
                    errors.first('teamForm.team name') }}
                  </div>
                </div>
                <div class="form-group">
                  <label for="teamName">Employees</label>
                  <div class="input-group tamed-input-group margin-b-10">
                    <span class="input-group-addon input-icon"><i class="fa fa-tag"/></span>
                    <multiselect
                      :placeholder="'Select by name'"
                      :options="sortedEmployees"
                      :group-select="false"
                      :multiple="false"
                      :limit="1"
                      :allow-empty="false"
                      :taggable="true"
                      :show-labels="false"
                      :clear-on-select="true"
                      :close-on-select="true"
                      :custom-label="employeeName"
                      class="multiselect-sm"
                      name="firstName"
                      track-by="id"
                      openDirection="bottom"
                      @input="addMember"
                    />
                  </div>
                  <div>
                    <span
                      v-if="!members.length"
                      class="font-s12 text-muted">Add Employees from the list</span>
                    <span
                      v-for="(member, index) in members"
                      v-else
                      :key="index"
                      class="multiselect__tag"
                      @click="removeMember(member.employee)"><span notranslate="">{{ employeeName(member.employee) }}</span> <i class="multiselect__tag-icon"/>
                    </span>
                  </div>
                </div>
                <div class="form-group">
                  <table class="table table-condensed table-bordered margin-b-10">
                    <thead>
                      <tr>
                        <th class="width50percent">Members</th>
                        <th>Managers</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td>
                          <span
                            v-if="!members.length"
                            class="font-s12 text-muted">Add Employee to populate Members list</span>
                          <ol
                            v-else
                            class="list-unstyled margin-b-5 btn-list members">
                            <li
                              v-for="(member, index) in members.filter(item => checkMemberRole(item.role) === 'Regular')"
                              :key="index">
                              <div
                                class="btn-group">
                                <button
                                  class="btn btn-xs btn-default"
                                  type="button"
                                  @click.stop>{{ employeeName(member.employee) }}</button>
                                <button
                                  v-tooltip.top="{ content: 'Move to Managers', delay: { show: 700, hide: 100 }}"
                                  class="btn btn-xs btn-default bg-white"
                                  type="button"
                                  @click.stop="moveEmployee(member.employeeId, 'Manager')">
                                  <i
                                    :class="checkMemberRole(member.role) === 'Regular' ? 'fa-long-arrow-right' : 'fa-long-arrow-left'"
                                    class="fa"/>
                                </button>
                              </div>
                            </li>
                          </ol>
                        </td>
                        <td>
                          <ol class="list-unstyled margin-b-5 btn-list managers">
                            <li
                              v-for="(member, index) in members.filter(item => checkMemberRole(item.role) === 'Manager')"
                              :key="index">
                              <div
                                class="btn-group">
                                <button
                                  class="btn btn-xs btn-default"
                                  type="button"
                                  @click.stop>{{ employeeName(member.employee) }}</button>
                                <button
                                  v-tooltip.top="{ content: 'Move to Managers', delay: { show: 700, hide: 100 }}"
                                  class="btn btn-xs btn-default bg-white"
                                  type="button"
                                  @click.stop="moveEmployee(member.employeeId, 'Regular')">
                                  <i
                                    :class="checkMemberRole(member.role) === 'Regular' ? 'fa-long-arrow-right' : 'fa-long-arrow-left'"
                                    class="fa"/>
                                </button>
                              </div>
                            </li>
                          </ol>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                  <div class="font-s12 text-muted">Promote members to managers by moving them to the right column. New Employees are automatically added to the <mark>Members</mark> list.</div>
                </div>
              </div>
            </div>
            <div class="data-section no-border margin-b-20">
              <button
                v-if="addNew"
                :disabled="$store.getters['globalStatesModule/loadingButton']"
                type="submit"
                class="btn btn-block btn-sm btn-success">
                <i
                  v-if="$store.getters['globalStatesModule/loadingButton']"
                  class="fa fa-circle-o-notch fa-spin"/> Add Team</button>
              <template v-else>
                <button
                  :disabled="$store.getters['globalStatesModule/loadingButton']"
                  type="submit"
                  class="btn btn-block btn-sm btn-success">
                  <i
                    v-if="$store.getters['globalStatesModule/loadingButton']"
                    class="fa fa-circle-o-notch fa-spin"/> Update Team</button>
                <button
                  :disabled="deletingTeam"
                  type="button"
                  class="btn btn-block btn-sm btn-default"
                  @click="deleteTeam()">
                  <i
                    v-if="deletingTeam"
                    class="fa fa-circle-o-notch fa-spin marging-r-5"/>Delete Team</button>
              </template>
            </div>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>
