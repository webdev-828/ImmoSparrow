<template>
  <div>
    <div
      id="head-container"
      class="bg-white">
      <div
        class="main-section">
        <div
          class="title-section">
          <span>Employees</span>
        </div>
        <div class="info-section">
          <small><var activeNo>{{ activeNo }}</var> <span>active</span>, <var inActiveNo>{{ inActiveNo }}</var> <span>inactivated</span></small>
        </div>
        <div
          class="control-section">
          <div class="btn-toolbar">
            <div class="btn-group">
              <div class="input-group">
                <input
                  v-model="searchStr"
                  placeholder="Search by (first name, last name, email, company )"
                  type="text"
                  class="form-control input-sm search-header-input"
                  @keyup.enter="searchFor(0)">
                <span
                  v-if="!searchLoading"
                  class="input-group-addon">
                  <i
                    class="fa fa-search"
                    @click="searchFor(0)"/>
                </span>
                <span
                  v-if="searchLoading"
                  class="input-group-addon">
                  <i class="fa fa-circle-o-notch fa-spin"/>
                </span>
                <span
                  v-if="searchFinished"
                  class="input-group-addon bg-gray-light"
                  @click="clearSearch">
                  <i class="fa fa-remove"/>
                </span>
              </div>
            </div>
            <div class="btn-group">
              <button
                :class="{'active': showDeleted}"
                type="button"
                class="btn btn-sm btn-default"
                @click="deleted()">
                <span v-if="!showDeleted"><i class="fa fa-eye"/> Show deleted</span>
                <span v-if="showDeleted"><i class="fa fa-eye-slash"/> Hide deleted</span>
              </button>
            </div>
            <div class="btn-group">
              <button
                v-for="(i, index) in [10,20,50]"
                :key="index"
                :class="i == perPage ? 'active':''"
                class="btn btn-sm btn-default"
                @click.stop="changePerPage(i)">{{ i }}
              </button>
            </div>
            <div class="btn-group">
              <button
                v-if="$store.getters['authStatesModule/userAgency'].access.employees.create"
                type="button"
                class="btn btn-sm btn-success"
                @click.stop="addEmployee">
                <i class="fa fa-plus"/> Add Employee
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
    <main
      id="main-container"
      class="standard-vb table-page">
      <confirmModal
        :showModal="showModal"
        :text="removeText"
        :title="'Delete employee'"
        :onCancel="closeModal"
        :onSubmit="removeEmployee"/>
      <confirmModal
        :showModal="showSuperviseModal"
        :text="'Are you sure you want to supervise this employee?'"
        :title="'Supervise employee'"
        :onCancel="() => showSuperviseModal = false"
        :onSubmit="confirmSelectEmployee"/>
      <div
        v-if="showSearchAreas"
        class="map_">
        <agency-map-component />
      </div>
      <div
        v-bar
        style="position: absolute; z-index: 1">
        <div v-close-rightSidebar>
          <div class="content">
            <div class="block">
              <div class="block-content">
                <div class="row">
                  <div class="col-sm-12">
                    <div v-if="!loading">
                      <table class="table table-striped table-condensed table-vcenter">
                        <thead>
                          <tr>
                            <th class="width30percent">Last name</th>
                            <th
                              class="width30percent"
                              rowspan="1"
                              colspan="1">First name</th>
                            <th class="width20percent">Role</th>
                            <th class="width20percent">Bundle</th>
                            <th
                              v-if="!showDeleted"
                              class="width10percent">Status</th>
                            <th
                              colspan="2"
                              class="width5percent text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr
                            v-for="(employee, employeeKey) in employees.items"
                            :key="employeeKey"
                            :class="{'selected': selectedIndex === employeeKey && !firstLoadElement}"
                            class="hovertr"
                            @click.stop="getEmployee(employeeKey)">
                            <td class="font-w600"><var lastName>{{ employee.lastName }}</var></td>
                            <td class="font-w600"><var firstName>{{ employee.firstName }}</var></td>
                            <td>{{ getEmployeeRole(employee.role) }}</td>
                            <td><var license>{{ employee.license ? getBundleName(employee.license.bundleId) : "" }}</var></td>
                            <td v-if="!showDeleted">
                              <span
                                v-if="employee.isEnabled"
                                class="label label-success">Active</span>
                              <span
                                v-if="!employee.isEnabled"
                                class="label label-danger">Inactive</span>
                            </td>
                            <td v-if="$store.getters['authStatesModule/userContext'] && ($store.getters['authStatesModule/userContext'].access.globalPermissions.agencies.readList || $store.getters['authStatesModule/userContext'].access.globalPermissions.users.readList)">
                              <div
                                v-if="!showDeleted" >
                                <button
                                  type="button"
                                  class="btn btn-xs btn-default"
                                  @click.stop="superviseEmployee(employee)"><span>Supervise</span>
                                </button>
                              </div>
                            </td>
                            <td
                              v-if="!showDeleted"
                              class="text-right">
                              <button
                                v-tooltip.top="{ content: 'Delete Employee', delay: { show: 700, hide: 100 }}"
                                class="btn btn-xs btn-default"
                                @click.stop="deleteEmployee(employee)">
                                <i
                                  v-if="!showModal && removeEmployeeData && (removeEmployeeData.id === employee.id)"
                                  class="fa fa-refresh fa-spin"/>
                                <i
                                  v-else
                                  class="fa fa-trash"/>
                              </button>
                            </td>
                            <td
                              v-else
                              class="text-right">
                              <button
                                class="btn btn-xs btn-danger"
                                @click.stop="unDelete(employee.id)">
                                <i class="si si-reload"/> Restore
                              </button>
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                    <div
                      v-if="loading"
                      class="text-center">
                      <i class="fa fa-circle-o-notch fa-spin spn"/>
                    </div>
                    <paginate
                      ref="employeesPagination"
                      :page-count="pages"
                      :page-range="3"
                      :margin-pages="2"
                      :click-handler="nextPage"
                      :prev-text="'Prev'"
                      :next-text="'Next'"
                      :container-class="'pagination to-the-right'"
                      :page-class="'page-item'"/>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
    <!-- New Users Sidebars -->
    <aside
      v-move
      v-if="(employee.id && !addingEmployee && $store.getters['globalStatesModule/profileRightSidebar']) || loadElement"
      id="sidebar-object-fixed"
      class="active sidebar-shadow">
      <div
        v-show="loadElement"
        class="preloader">
        <i class="fa fa-circle-o-notch fa-spin"/>
      </div>
      <div
        v-if="employee.id && !addingEmployee && $store.getters['globalStatesModule/profileRightSidebar']"
        class="side-panel with-header-button">
        <div class="detail-header">
          <div class="title">
            <div class="centering-block">
              <div>
                <img
                  class="img-avatar img-avatar32"
                  src="static/img/avatars/avatar10.jpg"
                  alt="">
                <var class="font-w600 push-10-l">{{ employee.primaryInfo.firstName }} {{ employee.primaryInfo.lastName }}</var>
              </div>
            </div>
          </div>
          <div class="controls">
            <span v-if="!firstLoadElement">
              <button
                v-tooltip.bottom="{ content: 'Previous employee', delay: { show: 700, hide: 100 }}"
                v-if="selectedIndex !== 0 || pageNum !== 0"
                :disabled="loading"
                class="btn btn-sm btn-default"
                type="button"
                @click="nextItem(selectedIndex, false)">
                <i class="fa fa-arrow-left"/><br>
              </button>
              <button
                v-tooltip.bottom="{ content: 'Next employee', delay: { show: 700, hide: 100 }}"
                v-if="checkEnd(selectedIndex)"
                :disabled="loading"
                class="btn btn-sm btn-default"
                type="button"
                @click="nextItem(selectedIndex, true)">
                <i class="fa fa-arrow-right"/><br>
              </button>
            </span>
            <button
              v-tooltip.bottom="{ content: 'Close panel', delay: { show: 700, hide: 100 }}"
              class="btn btn-sm btn-default margin-l-10"
              data-toggle="layout"
              data-action="side_overlay_close"
              type="button"
              @click="closeEmployee()">
              <i class="fa fa-close"/>
            </button>
          </div>
        </div>
        <button
          v-if="!$route.params.from || !firstLoadElement || ($route.params.from && $route.params.from !== 'agencies')"
          class="btn btn-block btn-sm btn-default"
          type="button"
          @click="redirectToAgency()">
          <i class="fa fa-chevron-left"/> To agency<br>
        </button>
        <button
          v-if="firstLoadElement && $route.params.from"
          class="btn btn-block btn-sm btn-default"
          type="button"
          @click="redirectBack($route.params.id, $route.params.from)">
          <i class="fa fa-chevron-left"/> Back to {{ $route.params.from }}<br>
        </button>
        <button
          v-if="showDeleted"
          class="btn btn-block btn-xs btn-danger"
          type="button"
          @click.stop="unDelete(employee.id)">
          Employee deleted. Click to Restore
        </button>
        <employee-profile
          :showDeleted="showDeleted"
          :employeeProfile="employee"
          @searchFor="searchFor(0)"
          @loadAgencies="loadAgencies()"
          @closeEmployee="closeEmployee()"/>
      </div>
    </aside>
    <!--  -->
    <aside
      v-move
      v-if="addingEmployee && $store.getters['globalStatesModule/profileRightSidebar']"
      id="sidebar-object-fixed"
      class="active sidebar-shadow">
      <div class="side-panel">
        <div class="detail-header">
          <div class="title">
            <div class="centering-block">
              <div>
                <img
                  class="img-avatar img-avatar32"
                  src="static/img/avatars/avatar10.jpg">
                <span class="font-w600 push-10-l">Add Employee</span>
              </div>
            </div>
          </div>
          <div class="controls">
            <button
              v-tooltip.bottom="{ content: 'Close panel', delay: { show: 700, hide: 100 }}"
              class="btn btn-sm btn-default margin-l-10"
              type="button"
              @click="closeNewEmployee()">
              <i class="fa fa-close"/>
            </button>
          </div>
        </div>
        <employee-profile
          :employeeProfile="newEmployee"
          :addEmployee="true"
          @closeNewEmployee="closeNewEmployee()"
          @loadEmployees="loadEmployees()"/>
      </div>
    </aside>
    <!-- / New Users Sidebars -->
  </div>
</template>
