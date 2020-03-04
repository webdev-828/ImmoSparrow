<template>
  <div id="dashboard-diagrams">
    <div
      id="head-container"
      class="bg-image bg-custom text-white">
      <div
        class="main-section">
        <div
          class="title-section">
          <span>Dashboard</span>
        </div>
        <div
          v-if="$store.getters['authStatesModule/employeeContext'] && $store.getters['authStatesModule/employeeContext'].employee"
          notranslate
          class="info-section">
          <small>{{ employeeName }}</small>
        </div>
        <div
          class="control-section">
          <var
            class="font-s13 font-w600 margin-r-5"
            date>{{ getDateAndTime(new Date(), "dddd, D. MMMM", $store.getters['authStatesModule/lang']) }}</var>
          <span
            class="font-s13 margin-r-5"
            style="opacity: .5;">|</span>
          <div class="btn-group">
            <button
              :disabled="loadDiagramData"
              class="btn btn-sm btn-default dropdown-toggle bg-white"
              data-toggle="dropdown"
              type="button">
              Refresh <span class="hidden-xs">every</span><var
                notranslate
                refreshTime>: {{ refreshTime / 1000 }}s</var>
              <span class="caret"/>
            </button>
            <ul class="dropdown-menu dropdown-menu-right">
              <li class="dropdown-header bg-gray-lighter font-s11">Refresh Rate</li>
              <li>
                <a
                  notranslate
                  href="#"
                  @click="changeRefreshTime(30000)">30s</a>
              </li>
              <li>
                <a
                  notranslate
                  href="#"
                  @click="changeRefreshTime(60000)">60s</a>
              </li>
            </ul>
          </div>
          <button
            v-tooltip="'Refresh Now'"
            :disabled="refreshActive || loadDiagramData"
            class="btn btn-sm btn-default bg-white"
            @click="manualRefreshDashboardStats()">
            <i
              :class="{'fa-spin': refreshActive}"
              class="fa fa-refresh text-muted"/>
          </button>
          <span
            class="font-s13 margin-r-5"
            style="opacity: .5;">|</span>
          <button
            :disabled="loadDiagramData"
            class="btn btn-sm btn-default bg-white"
            type="button"
            @click="toggleEditSidebar()">
            <span class="hidden-xs">Edit</span>
            <span class="visible-xs">
              <i class="fa fa-pencil"/>
            </span>
          </button>
        </div>
      </div>
    </div>
    <main
      v-if="!loadDiagramData"
      id="main-container"
      :class="{'with-second-sidebar edit-mode': editSidbarActive}"
      class="standard-vb">
      <div
        v-bar
        style="position: absolute; z-index: 1">
        <div>
          <div class="content padding-t-10">
            <draggable
              :list="listDiagrams.visibleDiagrams"
              v-bind="sortableOptions"
              class="dash-row in-field"
              @add="onRestore"
              @start="onStart"
              @end="onEnd">
              <div
                v-for="diagram in listDiagrams.visibleDiagrams"
                v-if="!diagram.staticOptions.alpha || alphaFeature"
                :id="`g${diagram.id}`"
                :key="`g${diagram.id}`"
                :data-type="diagram.id"
                :fixed="true"
                :class="{'is-shaking': editSidbarActive, 'double-size': diagram.staticOptions.size === 2}"
                class="dash-item-wrap">
                <div
                  :class="{'alpha-feature feature-on-block': diagram.staticOptions.alpha}"
                  class="dash-item bg-white">
                  <button
                    class="btn btn-xs btn-danger remove-item"
                    type="button"
                    @click="toggleRemove(diagram.id, true)"><i class="fa fa-close"/></button>
                  <component
                    :ref="`${diagram.id}diagram`"
                    :diagram="diagram"
                    :is="diagram.id"
                    @saveDiagramsStatus="saveDiagramsStatus"/>
                  <button
                    class="btn btn-block btn-sm btn-default btn-use"
                    type="button"
                    @click="toggleRemove(diagram.id, false)">Use on Dash</button>
                </div>
              </div>
            </draggable>
          </div>
        </div>
      </div>
    </main>
    <aside
      v-if="!loadDiagramData"
      id="side-overlay"
      :class="{'active': editSidbarActive, 'presented': widgetSidebarPresented}">
      <div class="side-panel">
        <div class="flex-head fancy-shadow">
          <div class="data-section">
            <div class="section-label">
              <div class="label-copy">Widgets</div>
              <div class="section-controls">
                <div
                  class="dropdown"
                  style="display: inline-block;">
                  <button
                    id="dropdownMenu1"
                    type="button"
                    data-toggle="dropdown"
                    aria-haspopup="true"
                    aria-expanded="true"
                    class="btn btn-sm btn-default dropdown-toggle">
                    {{ selectedFilter }} <span class="caret"/></button>
                  <ul
                    aria-labelledby="dropdownMenu1"
                    class="dropdown-menu dropdown-menu-right fancy-shadow">
                    <li
                      v-for="filter in filterBy"
                      v-if="!filter.alpha || alphaFeature"
                      :key="filter.name"
                      class="dropdown-list-item">
                      <button
                        :class="{'alpha-feature feature-on-block': filter.alpha}"
                        class="dropdown-item__button"
                        @click="selectedFilter = filter.name">{{ filter.name }}</button>
                    </li>
                  </ul>
                </div>
                <button
                  id="flash-on-action"
                  class="btn btn-sm btn-default btn-mobile margin-r-10"
                  type="button"
                  @click="widgetSidebarPresented=!widgetSidebarPresented">
                  <i
                    :class="{'fa-chevron-up': widgetSidebarPresented, 'fa-chevron-down': !widgetSidebarPresented}"
                    class="fa"/>
                </button>
                <button
                  v-tooltip.top="'Close'"
                  class="btn btn-sm btn-default"
                  type="button"
                  @click="toggleEditSidebar()">
                  <i class="fa fa-close"/>
                </button>
              </div>
            </div>
          </div>
        </div>
        <div class="flex-scroll bg-gray-light">
          <div class="tab-content">
            <div class="tab-pane active">
              <div class="side-panel">
                <div class="data-section no-border">
                  <div class="section-content padding-t-10">
                    <draggable
                      :list="listDiagrams.hiddenDiagrams"
                      v-bind="sortableOptions"
                      class="dash-row in-sidebar"
                      @start="onStart"
                      @add="onRemove"
                      @end="onEnd">
                      <div
                        v-for="diagram in filterDiagrams(listDiagrams.hiddenDiagrams, selectedFilter)"
                        v-if="!diagram.staticOptions.alpha || alphaFeature"
                        :id="`r${diagram.id}`"
                        :data-type="diagram.id"
                        :key="`r${diagram.id}`"
                        :fixed="true"
                        :class="{'is-shaking': editSidbarActive, 'double-size': diagram.staticOptions.size === 2}"
                        class="dash-item-wrap">
                        <div
                          :class="{'alpha-feature feature-on-block': diagram.staticOptions.alpha}"
                          class="dash-item bg-white">
                          <button
                            class="btn btn-xs btn-danger remove-item"
                            type="button"
                            @click="toggleRemove(diagram.id, true)"><i class="fa fa-close"/></button>
                          <component
                            :ref="`${diagram.id}diagram`"
                            :diagram="diagram"
                            :is="diagram.id"
                            @saveDiagramsStatus="saveDiagramsStatus"/>
                          <button
                            class="btn btn-block btn-sm btn-default btn-use"
                            type="button"
                            @click="toggleRemove(diagram.id, false)">Use on Dash</button>
                        </div>
                      </div>
                    </draggable>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </aside>
  </div>
</template>
