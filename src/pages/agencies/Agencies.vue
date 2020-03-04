<template>
  <div>
    <div
      id="head-container"
      class="bg-white">
      <div
        class="main-section">
        <div
          class="title-section">
          <span>Agencies</span>
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
                v-if="$store.getters['authStatesModule/userContext'].access.globalPermissions.agencies.create"
                type="button"
                class="btn btn-sm btn-success"
                @click.stop="addAgency">
                <i class="fa fa-plus"/> Add Agency
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
    <main
      id="main-container"
      class="standard-vb table-page">
      <div
        v-if="showSearchAreas"
        class="map_">
        <!--<a class="btn btn-warning close_map"><i class="fa fa-close"></i></a>-->
        <agency-map-component />
      </div>
      <confirm-modal
        :showModal="showModal"
        :title="'Delete Agency'"
        :text="'Are you sure you want to delete this agency'"
        :onSubmit="deleteAgencyConfirm"
        :onCancel="cancelDeletion"/>
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
                              class="width20percent"
                              rowspan="1"
                              colspan="1">Name</th>
                            <th class="width20percent">Owner</th>
                            <th class="width40percent">Address</th>
                            <th class="width40percent">Registration method</th>
                            <th
                              v-if="!showDeleted"
                              class="width10percent">Status</th>
                            <th
                              class="width10percent text-right">Action</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr
                            v-for="(agency, agencyKey) in agencies.items"
                            :key="agencyKey"
                            :class="{'selected': selectedIndex === agencyKey && !firstLoadElement}"
                            class="hovertr"
                            @click.stop="getAgency(agencyKey)">

                            <td class="font-w600"><var
                              agencyname
                              notranslate>{{ agency.name }}</var></td>
                            <td><var
                              agencyname
                              notranslate>{{ agency.ownerUser ? agency.ownerUser.firstName + " " + agency.ownerUser.lastName : "" }}</var></td>
                            <td><var
                              address
                              notranslate> {{ agency.address && agency.address['street'] ? agency.address.street + " " + agency.address.streetNumber + ", " + agency.address.zip + " " + agency.address.locality : "" }}</var></td>
                            <td>
                              <span
                                v-if="agency.registrationMethod === 1"
                                class="label label-success">
                                Access key
                              </span>
                            </td>
                            <td v-if="!showDeleted">
                              <span
                                v-if="agency.isEnabled"
                                class="label label-success">Active</span>
                              <span
                                v-if="!agency.isEnabled"
                                class="label label-danger">Inactive</span>
                            </td>
                            <td
                              v-if="!showDeleted"
                              class="text-right">
                              <button
                                v-tooltip.top="{ content: 'Delete Agency', delay: { show: 700, hide: 100 }}"
                                v-if="agency.isEnabled"
                                :disabled="deletingAgency && (deleteAgency && deleteAgency.id === agency.id)"
                                class="btn btn-xs btn-default"
                                @click.stop="deleteAgencyModal(agency)">
                                <i
                                  v-if="deletingAgency && (deleteAgency && deleteAgency.id === agency.id)"
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
                                @click.stop="unDelete(agency.id)">
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
                      ref="agenciesPagination"
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
    <!-- New Agency Sidebars -->
    <aside
      v-move
      v-if="(agency.id && !addingAgency) || loadElement"
      id="sidebar-object-fixed"
      class="active sidebar-shadow">
      <div
        v-show="loadElement"
        class="preloader">
        <i class="fa fa-circle-o-notch fa-spin"/>
      </div>
      <div
        v-if="agency.id && !addingAgency"
        :class="{'with-header-button': firstLoadElement && this.$route.params.from}"
        class="side-panel">
        <div class="detail-header">
          <div class="title">
            <div class="centering-block">
              <div class="block__with-image">
                <img
                  class="img-avatar img-avatar32"
                  src="static/img/avatars/avatar10.jpg"
                  alt="">
                <var
                  class="title-line font-w600 push-10-l"
                  notranslate
                  name>{{ agency.primaryInfo['name'] }}</var>
              </div>
            </div>
          </div>
          <div class="controls">
            <span v-if="!firstLoadElement">
              <button
                v-tooltip.bottom="{ content: 'Previous agency', delay: { show: 700, hide: 100 }}"
                v-if="selectedIndex !== 0 || pageNum !== 0"
                :disabled="loading"
                class="btn btn-sm btn-default"
                type="button"
                @click="nextItem(selectedIndex, false)">
                <i class="fa fa-arrow-left"/><br>
              </button>
              <button
                v-tooltip.bottom="{ content: 'Next agency', delay: { show: 700, hide: 100 }}"
                v-if="checkEnd(selectedIndex, 'agencies')"
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
              @click="closeAgency()">
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
          @click.stop="unDelete(agency.id)">
          Agency deleted. Click to Restore
        </button>
        <agency-profile
          :showDeleted="showDeleted"
          :agencyProfile="agency"
          @searchFor="nextPage(pageNum + 1)"
          @loadAgencies="loadAgencies()"
          @closeAgency="closeAgency()"/>
      </div>
    </aside>
    <!--  -->
    <aside
      v-move
      v-if="addingAgency"
      id="sidebar-object-fixed"
      class="active sidebar-shadow">
      <div class="side-panel">
        <div class="detail-header">
          <div class="title">
            <div class="centering-block">
              <div class="block__with-image">
                <img
                  :alt="agency.name ? agency.name : 'New agency'"
                  class="img-avatar img-avatar32"
                  src="static/img/avatars/avatar10.jpg">
                <span
                  v-if="agency.name"
                  class="title-line font-w600 push-10-l"><var
                    agencyName
                    notranslate>{{ agency.name }}</var></span>
                <span
                  v-else
                  class="font-w600 push-10-l">New agency</span>
              </div>
            </div>
          </div>
          <div class="controls">
            <button
              v-tooltip.bottom="{ content: 'Close panel', delay: { show: 700, hide: 100 }}"
              class="btn btn-sm btn-default margin-l-10"
              type="button"
              @click="closeNewAgency">
              <i class="fa fa-close"/>
            </button>
          </div>
        </div>
        <agency-profile
          :agencyProfile="newAgency"
          :addAgency="true"
          @closeNewAgency="closeNewAgency()"
          @loadAgencies="loadAgencies()"/>
      </div>
    </aside>
    <!-- / New Agency Sidebars -->
  </div>
</template>
