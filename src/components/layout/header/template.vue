<template>
  <header
    v-close-rightSidebar
    id="header-navbar"
    :class="{'staging-header' : env}"
    class="content-mini content-mini-full">
    <ul class="nav-header pull-right">
      <li>
        <div class="btn-group">
          <button
            v-tooltip.bottom="{ content: 'Profile', delay: { show: 700, hide: 100 }}"
            class="btn btn-default btn-image dropdown-toggle"
            data-toggle="dropdown"
            type="button">
            <img
              v-if="userContext.photo"
              :src="apiUrl + userContext.photo.url"
              alt="Avatar">
            <img
              v-else
              src="../../../../static/img/avatars/avatar10.jpg"
              alt="Avatar">
            <span class="caret"/>
          </button>
          <ul class="dropdown-menu dropdown-menu-right font-s13">
            <li
              v-if="userContext && userContext.identity"
              class="dropdown-header font-s600"
              style="color: #2c343f; letter-spacing: .5px;"
              notranslate>{{ userContext.identity.firstName }} {{ userContext.identity.lastName }}</li>
            <li>
              <router-link
                to="/profile"
                exact>
                <i class="si si-user pull-right"/>Profile
              </router-link>
            </li>
            <li>
              <router-link
                to="/logout"
                exact>
                <i class="si si-logout pull-right"/>Log out
              </router-link>
            </li>
          </ul>
        </div>
      </li>
    </ul>
    <ul class="nav-header pull-right">
      <li>
        <div class="btn-group">
          <button
            class="btn btn-default dropdown-toggle"
            data-toggle="dropdown"
            type="button">
            <i
              v-if="!$store.getters['authStatesModule/superviseMode']"
              class="fa fa-television"/>
            <span
              v-tooltip="'Supervising employee'"
              v-else
              style="margin-top: 4px;"
              class="label label-primary fancy-label pull-left push-5-r"
            > SUP</span>
            <span
              class="hidden-xs"
              notranslate>{{ employeeName }}</span>
            <span class="caret"/>
          </button>
          <ul
            v-if="userAgency"
            class="dropdown-menu dropdown-menu-right">
            <li class="dropdown-header bg-gray-lighter font-s11">Agencies</li>
            <li
              v-for="(agency, aKey) in getAgencies"
              :class="{'selected':
                (
                  (empCtx &&
                  empCtx.employee &&
                  agency.employee &&
                  (agency.employee.id === empCtx.employee.id)) ||
                  (!empCtx && userAgency.agency.id === agency.agency.id)
              )}"
              :key="aKey">
              <a
                style="display: flex; align-items: baseline;"
                notranslate
                @click="selectAgency(agency)">
                <div class="agency-img">
                  <img
                    v-if="agency.agency.logo"
                    :src="apiUrl + agency.agency.logo.url"
                    class="uploadedImg"
                    alt="uploaded image">
                  <img
                    v-else
                    class="uploadedImg"
                    src="../../../../static/img/icons/Invest inactive.png"
                    alt="Avatar">
                </div>
                <var
                  style="flex-grow: 1; padding-right: 10px;"
                  name>{{ agency.agency.name }}</var>
                <span
                  v-tooltip="'Owner'"
                  v-if="agency.isOwner"
                  class="label label-danger fancy-label pull-right push-5-r">OWN</span>
                <span
                  v-if="agency.employee"
                  :class="agencyLabel(agency.employee.role)"
                  class="label fancy-label pull-right">
                  <span
                    v-tooltip="'Admin'"
                    v-if="empRole(agency.employee.role) === 'Admin'">ADM</span>
                  <span
                    v-tooltip="'Manager'"
                    v-if="empRole(agency.employee.role) === 'Manageer'">MNG</span>
                  <span
                    v-tooltip="'Supervisor'"
                    v-if="empRole(agency.employee.role) === 'Supervisor'">SUP</span>
                  <span
                    v-tooltip="'Employee'"
                    v-if="empRole(agency.employee.role) === 'Employee'">EMP</span>
                </span>
              </a>
            </li>
          </ul>
        </div>
      </li>
    </ul>
    <ul class="nav-header pull-right">
      <li>
        <div class="btn-group">
          <a
            class="btn btn-sm btn-default dropdown-toggle"
            data-toggle="dropdown"
            style="color: #666">
            {{ lang.key }}
            <span class="caret"/>
          </a>
          <ul class="dropdown-menu dropdown-menu-right">
            <li
              v-for="oneLang in langs"
              v-if="oneLang.key !== 'IT' || (oneLang.key === 'IT' && alphaFeature)"
              :key="oneLang.key"
              @click="setLangauge(oneLang)">
              <a :class="{'alpha-feature feature-on-block': oneLang.key === 'IT'}">{{ oneLang.key }}</a>
            </li>
          </ul>
        </div>
      </li>
    </ul>
    <div
      v-if="userContext.devSettings && userContext.devSettings.accessLevel !== 0"
      class="pull-right">
      <label class="css-input switch switch-sm switch-success">
        <input
          :checked="$store.getters['globalStatesModule/showNewFeatures']"
          type="checkbox"
          @click="toggleShowNewFeatures()"><span/> <span class="hidden-xs">New Features</span>
      </label>
    </div>
    <ul class="nav-header pull-left">
      <li
        v-show="alphaFeature"
        class="alpha-feature feature-on-block">
        <div class="btn-group open">
          <button
            type="button"
            class="btn btn-default btn-notification"
            @click="showNC">
            <i class="fa fa-bell"/>
            <span class="badge badge-danger">4</span>
          </button>
          <ul
            v-show="ncDeployed"
            id="n-center"
            class="filter-dropdown dropdown-menu">
            <li>
              <div>
                <div
                  class="flex-head fancy-shadow"
                  @click.stop>
                  <div class="data-section">
                    <div class="section-label">
                      <div class="label-copy">
                        Notifications
                      </div>
                      <div class="section-controls">
                        <div class="btn-group">
                          <button
                            v-for="(i, index) in ['All','Subscriptions','Pipe','Account','Server']"
                            :key="index"
                            :class="{ 'active' : index == 0 }"
                            type="button"
                            class="btn btn-sm btn-default"
                            @click="newNotification">
                            {{ i }}
                          </button>
                        </div>
                        <button
                          type="button"
                          class="btn btn-sm btn-default margin-l-10"
                          @click="showNC">
                          <i
                            class="fa fa-close"/>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
                <div
                  class="flex-scroll show-scrollbar"
                  style="width: 100%;">
                  <div class="tab-content">
                    <div class="tab-pane active">
                      <div class="n-table">
                        <table class="table table-condensed">
                          <tbody>
                            <tr>
                              <td colspan="3">
                                <strong>Today, 28 January 2019</strong>
                              </td>
                            </tr>
                            <tr
                              v-for="(i, index) in notifications"
                              :key="index"
                              :id="'row'+index"
                              :class="{'danger': i.urgent}">
                              <td
                                class="text-muted font-s12"
                                style="width: 40px">{{ i.time }}</td>
                              <td>
                                <span
                                  v-if="index < 4"
                                  class="text-primary">&bull;</span>
                                {{ i.text }}
                              </td>
                              <td class="text-right"><span class="text-muted font-s12">{{ i.from }}</span></td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </li>
          </ul>
        </div>
      </li>
      <li>
        <intercom />
      </li>
      <!--<li-->
      <!--v-show="$store.getters['globalStatesModule/showNewFeatures'] && empCtx.devSettings"-->
      <!--:class="{showSearch:showSearch}"-->
      <!--class="js-header-search header-search">-->
      <!--<div class="form-horizontal">-->
      <!--<div class="form-material form-material-primary input-group remove-margin-t remove-margin-b width100percent beta-feature feature-on-block" >-->
      <!--<autocomplete-->
      <!--ref="autocomplete"-->
      <!--:setData="setStreet"-->
      <!--:includeInSuggestions="includeInSuggestions"-->
      <!--:noCustomSearch="true"-->
      <!--:itemHighlighted="'highlightedName'"-->
      <!--:searchedAddress="searchString"-->
      <!--@modelChanged="searchStringChanged">-->
      <!--<template-->
      <!--slot="products"-->
      <!--slot-scope="{ item }">-->
      <!--<span class="product_small">-->
      <!--{{ get_icon(item.suggestionType) }}-->
      <!--</span>-->
      <!--<span-->
      <!--v-for="product in get_products(item.suggestionType)"-->
      <!--:key="product"-->
      <!--class=""-->
      <!--@mousedown="setProduct(item, product, get_products(item.suggestionType));">-->
      <!--<img-->
      <!--:src="'../../../../static/img/icons/' + product + '.png'"-->
      <!--width="12" >-->
      <!--</span>-->
      <!--</template>-->
      <!--</autocomplete>-->
      <!--</div>-->
      <!--</div>-->
      <!--</li>-->
      <li>
        <h6 class="push-10-t">{{ $store.getters['globalStatesModule/currentWorkspace'] }}</h6>
      </li>
    </ul>
  </header>
</template>
