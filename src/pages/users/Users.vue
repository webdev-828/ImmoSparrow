<template>
  <div>
    <div
      id="head-container"
      class="bg-white">
      <div
        class="main-section">
        <div
          class="title-section">
          <span>Users</span>
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
                  v-model="searchForString"
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
                v-if="$store.getters['authStatesModule/userContext'].access.globalPermissions.users.create"
                type="button"
                class="btn btn-sm btn-success"
                @click.stop="addUser">
                <i class="fa fa-plus"/> Add User
              </button>
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
        :title="'Delete User'"
        :text="'Are you sure you want to delete this user?'"
        :onCancel="cancelDeletion"
        :onSubmit="deleteUserConfirm"/>
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
                            <th
                              class="width10percent"
                              rowspan="1"
                              colspan="1">Last name</th>
                            <th
                              class="width10percent"
                              rowspan="1"
                              colspan="1">First name</th>
                            <th class="width12percent">Email</th>
                            <th class="width25percent">Address</th>
                            <th class="width10percent">Phone</th>
                            <th class="width15percent">Feature type</th>
                            <th
                              v-if="!showDeleted"
                              class="width10percent">Status</th>
                            <th
                              class="width5percent text-right">Action</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr
                            v-for="(user, userKey) in users.items"
                            :key="userKey"
                            :class="{'selected': selectedIndex === userKey}"
                            class="hovertr"
                            @click.stop="getUser(userKey)">
                            <td class="font-w600"><var
                              v-if="user.primaryInfo && user.primaryInfo.lastName"
                              lastname>{{ user.primaryInfo.lastName }}</var></td>
                            <td class="font-w600"><var
                              v-if="user.primaryInfo && user.primaryInfo.firstName"
                              firstname>{{ user.primaryInfo.firstName }}</var></td>
                            <td><var email>{{ user.email }}</var></td>
                            <td><var address>{{ displayAddress(user.address) }}</var></td>
                            <td><var workPhone>{{ user.contactInfo ? user.contactInfo.workPhone : "" }}</var></td>
                            <td><var accessLevel>{{ val(user, user => user.adminInfo.devSettings.accessLevel, user => getDevRole(user), "" ) }}</var></td>
                            <td v-if="!showDeleted">
                              <span
                                v-if="user.isEnabled"
                                class="label label-success">Active</span>
                              <span
                                v-if="!user.isEnabled"
                                class="label label-danger">Inactive</span>
                            </td>
                            <td
                              v-if="!showDeleted"
                              class="text-right">
                              <button
                                v-tooltip.top="{ content: 'Delete User', delay: { show: 700, hide: 100 }}"
                                v-if="user.isEnabled"
                                :disabled="deletingUser && (deleteUser && deleteUser.id === user.id)"
                                class="btn btn-xs btn-default"
                                @click.stop="deleteUserModal(user)">
                                <i
                                  v-if="deletingUser && (deleteUser && deleteUser.id === user.id)"
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
                                @click.stop="unDelete(user.id)">
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
                      ref="usersPagination"
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
      v-if="(user.id && !addingUser && $store.getters['globalStatesModule/profileRightSidebar']) || loadElement"
      id="sidebar-object-fixed"
      class="active sidebar-shadow">
      <div
        v-show="loadElement"
        class="preloader">
        <i class="fa fa-circle-o-notch fa-spin"/>
      </div>
      <div
        v-if="user.id && !addingUser && $store.getters['globalStatesModule/profileRightSidebar']"
        :class="{'with-header-button': firstLoadElement && this.$route.params.from}"
        class="side-panel">
        <div class="detail-header">
          <div class="title">
            <div class="centering-block">
              <div>
                <img
                  class="img-avatar img-avatar32"
                  src="static/img/avatars/avatar10.jpg"
                  alt="">
                <var
                  class="font-w600 push-10-l"
                  fullName>{{ user.primaryInfo && user.primaryInfo.firstName ? user.primaryInfo.firstName : "" }} {{ user.primaryInfo && user.primaryInfo.lastName ? user.primaryInfo.lastName : "" }}</var>
              </div>
            </div>
          </div>
          <div class="controls">
            <span v-if="!firstLoadElement">
              <button
                v-tooltip.bottom="{ content: 'Previous user', delay: { show: 700, hide: 100 }}"
                v-if="selectedIndex !== 0 || pageNum !== 0"
                :disabled="loading"
                class="btn btn-sm btn-default"
                type="button"
                @click="nextItem(selectedIndex, false)">
                <i class="fa fa-arrow-left"/><br>
              </button>
              <button
                v-tooltip.bottom="{ content: 'Next user', delay: { show: 700, hide: 100 }}"
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
              @click="closeUser()">
              <i class="fa fa-close"/>
            </button>
          </div>
        </div>
        <button
          v-if="firstLoadElement && this.$route.params.from"
          class="btn btn-block btn-sm btn-default"
          type="button"
          @click="redirectBack($route.params.id, $route.params.from)">
          <i class="fa fa-chevron-left"/> Back to {{ $route.params.from }}<br>
        </button>
        <button
          v-if="showDeleted"
          class="btn btn-block btn-xs btn-danger"
          type="button"
          @click.stop="unDelete(user.id)">
          User deleted. Click to Restore
        </button>
        <profile
          :showDeleted="showDeleted"
          :userProfile="user"
          @searchFor="searchFor(pageNum)"
          @loadUsers="loadUsers()"
          @closeUser="closeUser()"/>
      </div>
    </aside>
    <!--  -->
    <aside
      v-move
      v-if="addingUser && $store.getters['globalStatesModule/profileRightSidebar']"
      id="sidebar-object-fixed"
      class="active sidebar-shadow">
      <div class="side-panel">
        <div class="detail-header">
          <div class="title">
            <div class="centering-block">
              <div>
                <img
                  class="img-avatar img-avatar32"
                  src="static/img/avatars/avatar10.jpg"
                  alt="">
                <span class="font-w600 push-10-l">Add User</span>
                <!-- This old code does not work here, don't understand why — so I just made a simple header line above - Vladimir -->
                <!-- <span class="font-w600 push-10-l">{{ user.primaryInfo.firstName || user.primaryInfo.lastName ? user.primaryInfo.firstName : "New" }} {{ user.primaryInfo.lastName || user.primaryInfo.firstName? user.primaryInfo.lastName : "user" }}</span> -->
              </div>
            </div>
          </div>
          <div class="controls">
            <button
              v-tooltip.bottom="{ content: 'Close panel', delay: { show: 700, hide: 100 }}"
              class="btn btn-sm btn-default margin-l-10"
              type="button"
              @click="closeNewUser">
              <i class="fa fa-close"/>
            </button>
          </div>
        </div>
        <profile
          :userProfile="newUser"
          :addUser="true"
          @closeNewUser="closeNewUser()"
          @loadUsers="loadUsers()"/>
      </div>
    </aside>
    <!-- / New Users Sidebars -->
  </div>
</template>
