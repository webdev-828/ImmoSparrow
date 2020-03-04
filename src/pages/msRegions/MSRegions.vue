<template>
  <div>
    <div
      id="head-container"
      class="bg-white">
      <div class="main-section">
        <div class="title-section">MS-Regions</div>
        <div class="info-section">
          <small>{{ totalItemCount > 0 ? totalItemCount : 'no' }} areas</small>
        </div>
        <div class="control-section">
          <div class="btn-toolbar">
            <div class="btn-group">
              <div class="input-group">
                <input
                  v-model="textSearch"
                  placeholder="Search by (region, agency)"
                  type="text"
                  class="form-control input-sm search-header-input"
                  @keyup.enter="searchFor()">
                <span class="input-group-addon cursor-show">
                  <i
                    class="fa fa-search"
                    @click="searchFor()"/>
                </span>
                <span
                  v-if="searchFinished"
                  class="input-group-addon bg-gray-light cursor-show"
                  @click="searchFor(true)">
                  <i class="fa fa-remove"/>
                </span>
              </div>
            </div>
            <div
              v-if="filterAgencyName"
              class="btn-group">
              <button
                type="button"
                class="btn btn-sm btn-primary"
                @click="filterByAgency()">Filter: {{ filterAgencyName }} <i class="fa fa-close"/></button>
            </div>
            <div
              v-if="bundles.length"
              class="btn-group">
              <button
                type="button"
                class="btn btn-sm btn-default dropdown-toggle"
                data-toggle="dropdown"
                aria-expanded="false">
                <span
                  v-if="selectedBundle"
                  notranslate>{{ selectedBundle.name }}</span>
                <span v-else>All packages</span>
                <span class="caret"/>
              </button>
              <ul class="dropdown-menu dropdown-menu-right">
                <li class="dropdown-header">Filter by bundle</li>
                <li
                  v-for="bundle in bundles"
                  :key="bundle.id"><button
                    class="btn-in-dropdown"
                    notranslate
                    @click="selectBundle(bundle)">{{ bundle.name }}</button></li>
              </ul>
            </div>
            <div class="btn-group">
              <button
                class="btn btn-sm btn-default dropdown-toggle"
                type="button"
                data-toggle="dropdown"
                notranslate>{{ selectedFilter }} <span class="caret"/></button>
              <ul class="dropdown-menu dropdown-menu-right">
                <li
                  v-for="filter in filters"
                  :key="filter.name"
                  :class="{ 'selected': filter.name === selectedFilter }">
                  <a
                    class="cursor-show"
                    notranslate
                    @click.prevent="filerByAvailableAgencyCount(filter)"
                  >{{ filter.name }}</a>
                </li>
              </ul>
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
        <agency-map-component />
      </div>
      <div
        v-bar
        style="position: absolute; z-index: 1">
        <div>
          <div class="content">
            <div class="block">
              <div class="block-content">
                <div class="row">
                  <div class="col-sm-12">
                    <table class="table table-condensed">
                      <thead v-if="msRegions.length">
                        <tr>
                          <th
                            rowspan="1"
                            colspan="1">Id</th>
                          <th class="width20percent">Name</th>
                          <th class="width30percent">Agencies</th>
                          <th class="width10percent">Agencies No.</th>
                          <th>Max Slots</th>
                          <th>Available</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr
                          v-for="(region, index) in msRegions"
                          :key="region.id"
                          :class="{ 'danger': ( region.maxAgencyCount || 0 ) <= (region.agencyCount || 0 ) }"
                        >
                          <td notranslate>{{ region.officialId }}</td>
                          <td notranslate>{{ region.name }}</td>
                          <td>
                            <div v-if="region.agencies">
                              <ol class="list-unstyled margin-b-5 btn-list">
                                <li
                                  v-for="(agency, index) in region.agencies"
                                  v-if="index < 3 || showMoreAgencies === region.id"
                                  :key="agency.id"
                                >
                                  <div class="btn-group">
                                    <button
                                      :class="{'btn-primary': selectedAgency.id === agency.id}"
                                      type="button"
                                      class="btn btn-xs btn-default"
                                      notranslate
                                      @click="selectAgency(agency.id)">{{ agency.name }}</button>
                                    <button
                                      :class=" msRegionQuery.agencyId && msRegionQuery.agencyId === agency.id ? 'btn-primary' : 'btn-default'"
                                      type="button"
                                      class="btn btn-xs"
                                      @click="filterByAgency(agency)"><i class="fa fa-filter"/></button>
                                  </div>
                                </li>
                              </ol>
                              <div v-if="region.agencies.length > 3">
                                <button
                                  v-if="showMoreAgencies !== region.id"
                                  type="button"
                                  class="btn btn-xs btn-link"
                                  @click="showMoreAgencies = region.id">
                                  <span
                                    class="font-w600">+{{ region.agencies.length - 3 }} agencies</span>
                                  <i class="fa fa-caret-down"/>
                                </button>
                                <button
                                  v-else
                                  type="button"
                                  class="btn btn-xs btn-link"
                                  @click="showMoreAgencies = ''">
                                  <span class="font-w600">Show less</span>
                                  <i class="fa fa-caret-up"/>
                                </button>
                              </div>
                            </div>
                            <div v-else>
                              There no agencies for this region.
                            </div>
                          </td>
                          <td>{{ region.agencyCount }}</td>
                          <td>
                            <form
                              :data-vv-scope="`maxAgencyCount${region.id}`"
                              @keydown.enter.prevent="updateAgencyMaxCount(region, index, Number($event.target.value))">
                              <button
                                :disabled="!region.maxAgencyCount"
                                :class="{'disabled': !region.maxAgencyCount}"
                                type="button"
                                class="btn btn-sm btn-default"
                                @click="updateAgencyMaxCount(region, index, region.maxAgencyCount - 1)">
                                <i class="fa fa-minus"/>
                              </button>
                              <div
                                :class="{'has-error': errors.has(`maxAgencyCount${region.id}.maxAgencyCount`)}"
                                class="input-group absolute-error">
                                <input
                                  v-validate="'required|min_value:1|max_value:1000'"
                                  :value="region.maxAgencyCount || 0"
                                  :data-vv-scope="`maxAgencyCount${region.id}`"
                                  name="maxAgencyCount"
                                  class="form-control input-sm text-center"
                                  style="display: inline-block; width: 70px;"
                                  @change="updateAgencyMaxCount(region, index, Number($event.target.value))">
                                <div class="help-block" >
                                  {{ errors.first(`maxAgencyCount${region.id}.maxAgencyCount`) }}
                                </div>
                              </div>
                              <button
                                :disabled="region.maxAgencyCount >= 1000"
                                type="button"
                                class="btn btn-sm btn-default"
                                @click="updateAgencyMaxCount(region, index, region.maxAgencyCount + 1)">
                                <i class="fa fa-plus"/>
                              </button>
                            </form>
                          </td>
                          <td>{{ getAvailableAgencies(region.agencyCount, region.maxAgencyCount) }}</td>
                        </tr>
                        <tr>
                          <td colspan="6">
                            <div
                              v-if="loading"
                              class="list-spinner"
                              style="text-align: center">
                              <i class="fa fa-circle-o-notch fa-spin spn"/>
                            </div>
                            <div
                              v-if="!loading && !msRegions.length"
                              style="text-align: center">
                              <div style="font-size: 40px;">
                                <i class="fa fa-info-circle"/>
                              </div>
                              <div>No ms-regions to display</div>
                            </div>
                          </td>
                        </tr>
                      </tbody>
                    </table>
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
      v-if="selectedAgency.id"
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
                <var
                  class="font-w600 push-10-l"
                  notranslate
                  name>{{ selectedAgency.primaryInfo['name'] }}</var>
              </div>
            </div>
          </div>
          <div class="controls">
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
        <agency-profile
          :agencyProfile="selectedAgency"
          @searchFor="getMsRegionData()"
          @loadAgencies="getMsRegionData()"
        />
      </div>
    </aside>
  </div>
</template>
