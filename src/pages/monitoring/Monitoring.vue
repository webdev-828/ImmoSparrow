<template>
  <div>
    <div
      id="head-container"
      class="bg-white">
      <div
        class="main-section">
        <div
          class="title-section">
          <span>Monitoring</span>
        </div>
        <div class="info-section">
          <small><span>5 active</span>, <span>1 muted</span></small>
        </div>
        <div
          class="control-section">
          <div class="btn-toolbar">
            <div class="btn-group">
              <div class="input-group">
                <input
                  v-model="searchForString"
                  placeholder="Search by (name, tag, area)"
                  type="text"
                  class="form-control input-sm search-header-input">
                <span class="input-group-addon">
                  <i class="fa fa-search"/>
                </span>
              </div>
            </div>
            <div class="btn-group">
              <button
                type="button"
                class="btn btn-sm btn-success"
                @click.stop="addMonitorSidebar=true">
                <i class="fa fa-plus"/> Add Monitor
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
        v-bar
        style="position: absolute; z-index: 1">
        <div>
          <div class="objects-list">
            <div class="block">
              <div
                class="block-content">
                <div class="row">
                  <div class="col-sm-12">
                    <div v-if="!loading">
                      <table class="table table-condensed">
                        <thead>
                          <tr>
                            <th>Mute</th>
                            <th>Name</th>
                            <th>Tags</th>
                            <th>Areas</th>
                            <th>Threshold</th>
                          </tr>
                        </thead>
                        <tbody>
                          <!-- Separate Alerted Sector -->
                          <tr>
                            <td
                              colspan="5"
                              class="">
                              <div class="td-separator highlighted"><span>Alerted</span></div>
                            </td>
                          </tr>
                          <!-- / Separate Alerted Sector -->
                          <tr
                            v-for="(i, index) in ['Zurich combo','Bern Apartments below 1m']"
                            :key="index"
                            class="hovertr"
                            @click.stop="monitorSidebar=true">
                            <td>
                              <button
                                v-tooltip.top="{ content: 'Mute', delay: { show: 700, hide: 100 }}"
                                type="button"
                                class="btn btn-xs btn-danger"
                                @click.stop><i class="fa fa-bell"/></button>
                            </td>
                            <td class="font-w600">{{ i }}</td>
                            <td
                              v-if="index == 0"
                              class="font-w600">
                              <span
                                v-for="(i, index) in ['Favorite','Monitored']"
                                :key="index"
                                class="label label-default margin-r-5">{{ i }}</span>
                            </td>
                            <td
                              v-if="index == 1"
                              class="font-w600">
                              <span
                                v-for="(i, index) in ['On Sale','Apartment Empty']"
                                :key="index"
                                class="label label-default margin-r-5">{{ i }}</span>
                            </td>
                            <td
                              v-if="index == 2"
                              class="font-w600">
                              <span
                                v-for="(i, index) in ['Favorite', 'No Price','Apartment Empty','Interested']"
                                :key="index"
                                class="label label-default margin-r-5">{{ i }}</span>
                            </td>
                            <td
                              v-if="index == 0">Radius</td>
                            <td
                              v-if="index == 1">Locality</td>
                            <td
                              v-if="index == 2">Radius</td>
                            <td>Alert</td>
                          </tr>
                          <!-- Separate Alerted Sector -->
                          <tr>
                            <td
                              colspan="5"
                              class="">
                              <div class="td-separator"><span>Monitored</span></div>
                            </td>
                          </tr>
                          <!-- / Separate Alerted Sector -->
                          <tr
                            v-for="(i, index) in ['Lake houses','Mountain view apartments','My house price down']"
                            :key="index"
                            class="hovertr"
                            @click.stop="monitorSidebar=true">
                            <td>
                              <button
                                v-tooltip.top="{ content: 'Mute', delay: { show: 700, hide: 100 }}"
                                v-if="index == 0 || index == 2"
                                type="button"
                                class="btn btn-xs btn-default"
                                @click.stop><i class="fa fa-bell"/></button>
                              <button
                                v-tooltip.top="{ content: 'Unmute', delay: { show: 700, hide: 100 }}"
                                v-if="index == 1"
                                type="button"
                                class="btn btn-xs btn-primary"
                                @click.stop><i class="fa fa-bell-slash"/></button>
                            </td>
                            <td class="font-w600">{{ i }}</td>
                            <td
                              v-if="index == 0"
                              class="font-w600">
                              <span
                                v-for="(i, index) in ['Favorite','Monitored','On Sale','No Price','Apartment Empty','Interested']"
                                :key="index"
                                class="label label-default margin-r-5">{{ i }}</span>
                            </td>
                            <td
                              v-if="index == 1"
                              class="font-w600">
                              <span
                                v-for="(i, index) in ['On Sale','Apartment Empty','Interested']"
                                :key="index"
                                class="label label-default margin-r-5">{{ i }}</span>
                            </td>
                            <td
                              v-if="index == 2"
                              class="font-w600">
                              <span
                                v-for="(i, index) in ['Favorite', 'No Price','Apartment Empty','Interested']"
                                :key="index"
                                class="label label-default margin-r-5">{{ i }}</span>
                            </td>
                            <td
                              v-if="index == 0">Radius</td>
                            <td
                              v-if="index == 1">Radius</td>
                            <td
                              v-if="index == 2">Locality</td>
                            <td>Warning</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
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
    <!-- Add Monitor Sidebar -->
    <aside
      v-move
      v-if="addMonitorSidebar"
      id="sidebar-object-fixed-2"
      class="active sidebar-shadow just-header-vb">
      <div class="side-panel">
        <div class="detail-header">
          <div class="title">
            <div class="centering-block">
              <div>
                <span class="font-w600">Add Monitor</span>
              </div>
            </div>
          </div>
          <div class="controls">
            <button
              v-tooltip.bottom="{ content: 'Close panel', delay: { show: 700, hide: 100 }}"
              class="btn btn-sm btn-default"
              type="button"
              @click="addMonitorSidebar=false">
              <i class="fa fa-close"/>
            </button>
          </div>
        </div>
        <div>
          <div
            v-bar
            class="detail-content">
            <div class="tab-content">
              <div
                class="tab-pane active"
                style="padding-bottom: 10px;">
                <form>
                  <!-- Base -->
                  <div class="data-section stand-out">
                    <div class="section-content">
                      <div class="form-group row margin-b-10">
                        <div class="col-md-12">
                          <div>
                            <label for="first_name">Name</label>
                            <input
                              id="first_name"
                              type="text"
                              name="first_name"
                              data-vv-scope="profile_form"
                              class="form-control"
                              data-vv-id="2"
                              aria-required="true"
                              aria-invalid="false"
                              value="">
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <!-- / Base -->
                  <!-- Buildings Alerted -->
                  <div class="data-section stand-out">
                    <div
                      class="section-label cursor-show">
                      <div class="label-copy">Buildings Alerted</div>
                      <div class="section-controls">
                        <button class="btn btn-sm btn-default has-tooltip cursor-none">
                          <i class="fa fa-angle-up"/>
                        </button>
                      </div>
                    </div>
                    <div
                      class="section-content">
                      <div class="form-group">
                        <div class="input-group tamed-input-group">
                          <span class="input-group-addon input-icon"><i class="fa fa-tag"/></span>
                          <multiselect
                            :placeholder="'Property name, address, tag…'"
                            :options="optionsDemo"
                            :group-select="false"
                            :multiple="false"
                            :limit="1"
                            :allow-empty="false"
                            :limit-text="limitText"
                            :taggable="true"
                            :show-labels="false"
                            :clear-on-select="true"
                            :close-on-select="true"
                            class="multiselect-sm"
                            name="property type"
                            track-by="id"
                            openDirection="bottom"
                          />
                        </div>
                      </div>
                      <div class="form-group">
                        <div>
                          <span
                            v-for="(i, index) in ['Eine Klasse für sich – Luxuriöse Terrassenwohnung mit Seeblick','Sehr schöne 4.5 Zi-Whg (keine Makleranfragen)','Ruhe an bester Lage']"
                            :key="index"
                            class="multiselect__tag"><span notranslate="">{{ i }}</span> <i class="multiselect__tag-icon"/></span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <!-- / Buildings Alerted -->
                  <!-- Tags -->
                  <div class="data-section stand-out">
                    <div
                      class="section-label cursor-show">
                      <div class="label-copy">Tags</div>
                      <div class="section-controls">
                        <button class="btn btn-sm btn-default has-tooltip cursor-none">
                          <i class="fa fa-angle-up"/>
                        </button>
                      </div>
                    </div>
                    <div
                      class="section-content">
                      <div class="form-group">
                        <div class="input-group tamed-input-group">
                          <span class="input-group-addon input-icon"><i class="fa fa-tag"/></span>
                          <multiselect
                            :placeholder="'demo'"
                            :options="optionsDemo"
                            :group-select="false"
                            :multiple="false"
                            :limit="1"
                            :allow-empty="false"
                            :limit-text="limitText"
                            :taggable="true"
                            :show-labels="false"
                            :clear-on-select="true"
                            :close-on-select="true"
                            class="multiselect-sm"
                            name="property type"
                            track-by="id"
                            openDirection="bottom"
                          />
                        </div>
                      </div>
                      <div class="form-group">
                        <div>
                          <span
                            v-for="(i, index) in ['Favorite','Monitored','On Sale']"
                            :key="index"
                            class="multiselect__tag"><span notranslate="">{{ i }}</span> <i class="multiselect__tag-icon"/></span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <!-- / Tags -->
                  <!-- Type -->
                  <div class="data-section stand-out">
                    <div
                      class="section-label cursor-show">
                      <div class="label-copy">Type</div>
                      <div class="section-controls">
                        <div class="btn-group">
                          <button
                            type="button"
                            data-toggle="dropdown"
                            aria-haspopup="true"
                            aria-expanded="false"
                            class="btn btn-sm btn-default dropdown-toggle">
                            <span v-if="types['fluctuation']">Fluctuation</span>
                            <span v-if="types['rentalPrice']">RentalPrice</span>
                            <span v-if="types['vacancy']">Vacancy</span>
                            <span v-if="types['portfolioPrice']">PortfolioPrice</span> <span class="caret"/>
                          </button>
                          <ul class="dropdown-menu dropdown-menu-right fancy-shadow">
                            <li
                              :class="{active: types['fluctuation']}"
                              class="dropdown-list-item"
                              @click="toggleType('fluctuation')"><a href="#">Fluctuation</a></li>
                            <li
                              :class="{active: types['rentalPrice']}"
                              class="dropdown-list-item"
                              @click="toggleType('rentalPrice')"><a href="#">RentalPrice</a></li>
                            <li
                              :class="{active: types['vacancy']}"
                              class="dropdown-list-item"
                              @click="toggleType('vacancy')"><a href="#">Vacancy</a></li>
                            <li
                              :class="{active: types['portfolioPrice']}"
                              class="dropdown-list-item"
                              @click="toggleType('portfolioPrice')"><a href="#">PortfolioPrice</a></li>
                          </ul>
                        </div>
                        <button class="btn btn-sm btn-default has-tooltip cursor-none">
                          <i class="fa fa-angle-up"/>
                        </button>
                      </div>
                    </div>
                    <div
                      class="section-content">
                      <div
                        v-if="types['fluctuation']"
                        class="form-inline">
                        Notify me, if the fluctuation!
                        <select class="form-control">
                          <option
                            v-for="(i, index) in ['around','inside']"
                            :key="index"
                            value="0">{{ i }}</option>
                        </select>
                        a building is going
                        <select class="form-control">
                          <option
                            v-for="(i, index) in ['up','down']"
                            :key="index"
                            value="0">{{ i }}</option>
                        </select>
                      </div>
                      <div
                        v-if="types['rentalPrice']"
                        class="form-inline">
                        Notify me, if the rentalprices around my building are
                        <select class="form-control">
                          <option
                            v-for="(i, index) in ['higher','lower','higher or lower']"
                            :key="index"
                            value="0">{{ i }}</option>
                        </select>
                        by
                        <select class="form-control">
                          <option
                            v-for="(i, index) in ['10%','20%']"
                            :key="index"
                            value="0">{{ i }}</option>
                        </select>
                        then the ones of my building
                      </div>
                      <div
                        v-if="types['vacancy']"
                        class="form-inline">
                        Notify me, if the vacancy
                        <select class="form-control">
                          <option
                            v-for="(i, index) in ['around','inside']"
                            :key="index"
                            value="0">{{ i }}</option>
                        </select>
                        a building is going
                        <select class="form-control">
                          <option
                            v-for="(i, index) in ['up','down']"
                            :key="index"
                            value="0">{{ i }}</option>
                        </select>
                      </div>
                      <div
                        v-if="types['portfolioPrice']"
                        class="form-inline">
                        Notify me, if the value of my portfolio is going
                        <select class="form-control">
                          <option
                            v-for="(i, index) in ['up','down']"
                            :key="index"
                            value="0">{{ i }}</option>
                        </select>
                      </div>
                    </div>
                  </div>
                  <!-- / Type -->
                  <!-- Trigger -->
                  <div class="data-section stand-out">
                    <div
                      class="section-label cursor-show">
                      <div class="label-copy">Trigger</div>
                    </div>
                    <div
                      class="section-content">
                      <div class="row">
                        <div class="col-xs-6">
                          <div class="from-group margin-b-10">
                            <label>Warning</label>
                            <select
                              class="form-control">
                              <option
                                v-for="(i, index) in ['above 50%','above 60%']"
                                :key="index">{{ i }}</option>
                            </select>
                          </div>
                        </div>
                        <div class="col-xs-6">
                          <div class="from-group">
                            <label>Alert</label>
                            <select
                              class="form-control">
                              <option
                                v-for="(i, index) in ['above 70%','above 80%']"
                                :key="index">{{ i }}</option>
                            </select>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <!-- / Trigger -->
                  <!-- Areas -->
                  <div class="data-section stand-out">
                    <div
                      class="section-label cursor-show">
                      <div class="label-copy">Area</div>
                      <div class="section-controls">
                        <div class="btn-group">
                          <button
                            type="button"
                            data-toggle="dropdown"
                            aria-haspopup="true"
                            aria-expanded="false"
                            class="btn btn-sm btn-default dropdown-toggle">Radius <span class="caret"/>
                          </button>
                          <ul class="dropdown-menu dropdown-menu-right fancy-shadow">
                            <li
                              v-for="(i, index) in ['Radius','Locality','Travel distance']"
                              :key="index"
                              class="dropdown-list-item"><a href="#">{{ i }}</a></li>
                          </ul>
                        </div>
                        <button class="btn btn-sm btn-default has-tooltip cursor-none">
                          <i class="fa fa-angle-up"/>
                        </button>
                      </div>
                    </div>
                    <div
                      class="section-content">
                      <div class="form-group">
                        <div class="form-inline">
                          Monitor
                          <select class="form-control">
                            <option
                              v-for="(i, index) in ['5','4']"
                              :key="index"
                              value="0">{{ i }}</option>
                          </select>
                          km area around each building of a tag we want to check
                        </div>
                      </div>
                    </div>
                  </div>
                  <!-- / Areas -->
                  <!-- Alert By -->
                  <div class="data-section stand-out">
                    <div
                      class="section-label cursor-show">
                      <div class="label-copy">Alert By</div>
                      <div class="section-controls">
                        <button class="btn btn-sm btn-default has-tooltip cursor-none">
                          <i class="fa fa-angle-up"/>
                        </button>
                      </div>
                    </div>
                    <div
                      class="section-content">
                      <div class="form-group">
                        <div>
                          <label class="css-input css-checkbox css-checkbox-primary">
                            <input
                              type="checkbox"
                              checked><span/> Notification Center
                          </label>
                        </div>
                        <div>
                          <label class="css-input css-checkbox css-checkbox-primary">
                            <input type="checkbox"><span/> Email (karl@yahoo.com)
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>
                  <!-- / Alert By -->
                  <!-- Controls -->
                  <div class="data-section no-border margin-b-20">
                    <button
                      type="submit"
                      class="btn btn-block btn-sm btn-success">Add Monitor
                    </button>
                  </div>
                  <!-- / Controls -->
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </aside>
    <!-- / Add Monitor Sidebar -->
    <!-- Monitor Sidebar -->
    <aside
      v-move
      v-if="monitorSidebar"
      id="sidebar-object-fixed"
      class="active sidebar-shadow just-header-vb">
      <div class="side-panel">
        <div class="detail-header">
          <div class="title">
            <div class="centering-block">
              <div>
                <span class="font-w600">Zurich Combo</span>
              </div>
            </div>
          </div>
          <div class="controls">
            <button
              v-tooltip.bottom="{ content: 'Mute', delay: { show: 700, hide: 100 }}"
              class="btn btn-sm btn-default margin-r-10"
              type="button">
              <i class="fa fa-bell"/>
            </button>
            <span>
              <button
                v-tooltip.bottom="{ content: 'Previous monitor', delay: { show: 700, hide: 100 }}"
                class="btn btn-sm btn-default"
                type="button">
                <i class="fa fa-arrow-left"/><br>
              </button>
              <button
                v-tooltip.bottom="{ content: 'Next monitor', delay: { show: 700, hide: 100 }}"
                class="btn btn-sm btn-default margin-r-10"
                type="button">
                <i class="fa fa-arrow-right"/>
              </button>
            </span>
            <button
              v-tooltip.bottom="{ content: 'Close panel', delay: { show: 700, hide: 100 }}"
              class="btn btn-sm btn-default"
              type="button"
              @click="monitorSidebar=false">
              <i class="fa fa-close"/>
            </button>
          </div>
        </div>
        <div>
          <div
            v-bar
            class="detail-content">
            <div class="tab-content">
              <div
                class="tab-pane active"
                style="padding-bottom: 10px;">
                <form>
                  <!-- Base -->
                  <div class="data-section stand-out">
                    <div class="section-content">
                      <div class="form-group row margin-b-10">
                        <div class="col-md-12">
                          <div>
                            <label for="first_name">Name</label>
                            <input
                              id="first_name"
                              type="text"
                              name="first_name"
                              data-vv-scope="profile_form"
                              class="form-control"
                              data-vv-id="2"
                              aria-required="true"
                              aria-invalid="false"
                              value="">
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <!-- / Base -->
                  <!-- Buildings Alerted -->
                  <div class="data-section stand-out">
                    <div
                      class="section-label cursor-show">
                      <div class="label-copy">Buildings Alerted</div>
                      <div class="section-controls">
                        <button class="btn btn-sm btn-default has-tooltip cursor-none">
                          <i class="fa fa-angle-up"/>
                        </button>
                      </div>
                    </div>
                    <div
                      class="section-content">
                      <div class="form-group">
                        <div class="input-group tamed-input-group">
                          <span class="input-group-addon input-icon"><i class="fa fa-tag"/></span>
                          <multiselect
                            :placeholder="'Property name, address, tag…'"
                            :options="optionsDemo"
                            :group-select="false"
                            :multiple="false"
                            :limit="1"
                            :allow-empty="false"
                            :limit-text="limitText"
                            :taggable="true"
                            :show-labels="false"
                            :clear-on-select="true"
                            :close-on-select="true"
                            class="multiselect-sm"
                            name="property type"
                            track-by="id"
                            openDirection="bottom"
                          />
                        </div>
                      </div>
                      <div class="form-group">
                        <div>
                          <span
                            v-for="(i, index) in ['Eine Klasse für sich – Luxuriöse Terrassenwohnung mit Seeblick','Sehr schöne 4.5 Zi-Whg (keine Makleranfragen)','Ruhe an bester Lage']"
                            :key="index"
                            class="multiselect__tag"><span notranslate="">{{ i }}</span> <i class="multiselect__tag-icon"/></span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <!-- / Buildings Alerted -->
                  <!-- Tags -->
                  <div class="data-section stand-out">
                    <div
                      class="section-label cursor-show">
                      <div class="label-copy">Tags</div>
                      <div class="section-controls">
                        <button class="btn btn-sm btn-default has-tooltip cursor-none">
                          <i class="fa fa-angle-up"/>
                        </button>
                      </div>
                    </div>
                    <div
                      class="section-content">
                      <div class="form-group">
                        <div class="input-group tamed-input-group">
                          <span class="input-group-addon input-icon"><i class="fa fa-tag"/></span>
                          <multiselect
                            :placeholder="'demo'"
                            :options="optionsDemo"
                            :group-select="false"
                            :multiple="false"
                            :limit="1"
                            :allow-empty="false"
                            :limit-text="limitText"
                            :taggable="true"
                            :show-labels="false"
                            :clear-on-select="true"
                            :close-on-select="true"
                            class="multiselect-sm"
                            name="property type"
                            track-by="id"
                            openDirection="bottom"
                          />
                        </div>
                      </div>
                      <div class="form-group">
                        <div>
                          <span
                            v-for="(i, index) in ['Favorite','Monitored','On Sale']"
                            :key="index"
                            class="multiselect__tag"><span notranslate="">{{ i }}</span> <i class="multiselect__tag-icon"/></span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <!-- / Tags -->
                  <!-- Type -->
                  <div class="data-section stand-out">
                    <div
                      class="section-label cursor-show">
                      <div class="label-copy">Type</div>
                      <div class="section-controls">
                        <div class="btn-group">
                          <button
                            type="button"
                            data-toggle="dropdown"
                            aria-haspopup="true"
                            aria-expanded="false"
                            class="btn btn-sm btn-default dropdown-toggle">
                            <span v-if="types['fluctuation']">Fluctuation</span>
                            <span v-if="types['rentalPrice']">RentalPrice</span>
                            <span v-if="types['vacancy']">Vacancy</span>
                            <span v-if="types['portfolioPrice']">PortfolioPrice</span> <span class="caret"/>
                          </button>
                          <ul class="dropdown-menu dropdown-menu-right fancy-shadow">
                            <li
                              :class="{active: types['fluctuation']}"
                              class="dropdown-list-item"
                              @click="toggleType('fluctuation')"><a href="#">Fluctuation</a></li>
                            <li
                              :class="{active: types['rentalPrice']}"
                              class="dropdown-list-item"
                              @click="toggleType('rentalPrice')"><a href="#">RentalPrice</a></li>
                            <li
                              :class="{active: types['vacancy']}"
                              class="dropdown-list-item"
                              @click="toggleType('vacancy')"><a href="#">Vacancy</a></li>
                            <li
                              :class="{active: types['portfolioPrice']}"
                              class="dropdown-list-item"
                              @click="toggleType('portfolioPrice')"><a href="#">PortfolioPrice</a></li>
                          </ul>
                        </div>
                        <button class="btn btn-sm btn-default has-tooltip cursor-none">
                          <i class="fa fa-angle-up"/>
                        </button>
                      </div>
                    </div>
                    <div
                      class="section-content">
                      <div
                        v-if="types['fluctuation']"
                        class="form-inline">
                        Notify me, if the fluctuation
                        <select class="form-control">
                          <option
                            v-for="(i, index) in ['around','inside']"
                            :key="index"
                            value="0">{{ i }}</option>
                        </select>
                        a building is going
                        <select class="form-control">
                          <option
                            v-for="(i, index) in ['up','down']"
                            :key="index"
                            value="0">{{ i }}</option>
                        </select>
                      </div>
                      <div
                        v-if="types['rentalPrice']"
                        class="form-inline">
                        Notify me, if the rentalprices around my building are
                        <select class="form-control">
                          <option
                            v-for="(i, index) in ['higher','lower','higher or lower']"
                            :key="index"
                            value="0">{{ i }}</option>
                        </select>
                        by
                        <select class="form-control">
                          <option
                            v-for="(i, index) in ['10%','20%']"
                            :key="index"
                            value="0">{{ i }}</option>
                        </select>
                        then the ones of my building
                      </div>
                      <div
                        v-if="types['vacancy']"
                        class="form-inline">
                        Notify me, if the vacancy
                        <select class="form-control">
                          <option
                            v-for="(i, index) in ['around','inside']"
                            :key="index"
                            value="0">{{ i }}</option>
                        </select>
                        a building is going
                        <select class="form-control">
                          <option
                            v-for="(i, index) in ['up','down']"
                            :key="index"
                            value="0">{{ i }}</option>
                        </select>
                      </div>
                      <div
                        v-if="types['portfolioPrice']"
                        class="form-inline">
                        Notify me, if the value of my portfolio is going
                        <select class="form-control">
                          <option
                            v-for="(i, index) in ['up','down']"
                            :key="index"
                            value="0">{{ i }}</option>
                        </select>
                      </div>
                      <div class="form-group row margin-t-10">
                        <div class="col-md-12">
                          <div>
                            <label for="last_name">Threshhold</label>
                            <div class="form-group">
                              <div class="tabs-input">
                                <div class="input-tab">
                                  <label class="css-input css-radio css-radio-primary">
                                  <input type="radio"><span class="highlight-bar"/><span class="caption">Alert</span></label>
                                </div>
                                <div class="input-tab">
                                  <label class="css-input css-radio css-radio-primary">
                                    <input
                                      type="radio"
                                      checked><span class="highlight-bar"/><span class="caption">Warning</span>
                                  </label>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <!-- / Type -->
                  <!-- Trigger -->
                  <div class="data-section stand-out">
                    <div
                      class="section-label cursor-show">
                      <div class="label-copy">Trigger</div>
                    </div>
                    <div
                      class="section-content">
                      <div class="row">
                        <div class="col-xs-6">
                          <div class="from-group margin-b-10">
                            <label>Warning</label>
                            <select
                              class="form-control">
                              <option
                                v-for="(i, index) in ['above 50%','above 60%']"
                                :key="index">{{ i }}</option>
                            </select>
                          </div>
                        </div>
                        <div class="col-xs-6">
                          <div class="from-group">
                            <label>Alert</label>
                            <select
                              class="form-control">
                              <option
                                v-for="(i, index) in ['above 70%','above 80%']"
                                :key="index">{{ i }}</option>
                            </select>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <!-- / Trigger -->
                  <!-- Areas -->
                  <div class="data-section stand-out">
                    <div
                      class="section-label cursor-show">
                      <div class="label-copy">Area</div>
                      <div class="section-controls">
                        <div class="btn-group">
                          <button
                            type="button"
                            data-toggle="dropdown"
                            aria-haspopup="true"
                            aria-expanded="false"
                            class="btn btn-sm btn-default dropdown-toggle">Radius <span class="caret"/>
                          </button>
                          <ul class="dropdown-menu dropdown-menu-right fancy-shadow">
                            <li
                              v-for="(i, index) in ['Radius','Locality','Travel distance']"
                              :key="index"
                              class="dropdown-list-item"><a href="#">{{ i }}</a></li>
                          </ul>
                        </div>
                        <button class="btn btn-sm btn-default has-tooltip cursor-none">
                          <i class="fa fa-angle-up"/>
                        </button>
                      </div>
                    </div>
                    <div
                      class="section-content">
                      <div class="form-group">
                        <div class="form-inline">
                          Monitor
                          <select class="form-control">
                            <option
                              v-for="(i, index) in ['5','4']"
                              :key="index"
                              value="0">{{ i }}</option>
                          </select>
                          km area around each building of a tag we want to check
                        </div>
                      </div>
                    </div>
                  </div>
                  <!-- / Areas -->
                  <!-- Alert By -->
                  <div class="data-section stand-out">
                    <div
                      class="section-label cursor-show">
                      <div class="label-copy">Alert By</div>
                      <div class="section-controls">
                        <button class="btn btn-sm btn-default has-tooltip cursor-none">
                          <i class="fa fa-angle-up"/>
                        </button>
                      </div>
                    </div>
                    <div
                      class="section-content">
                      <div class="form-group">
                        <div>
                          <label class="css-input css-checkbox css-checkbox-primary">
                            <input
                              type="checkbox"
                              checked><span/> Notification Center
                          </label>
                        </div>
                        <div>
                          <label class="css-input css-checkbox css-checkbox-primary">
                            <input type="checkbox"><span/> Email (karl@yahoo.com)
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>
                  <!-- / Alert By -->
                  <!-- Controls -->
                  <div class="data-section no-border margin-b-20">
                    <button
                      type="submit"
                      class="btn btn-block btn-sm btn-info margin-b-10">Update Monitor
                    </button>
                    <button
                      type="button"
                      class="btn btn-block btn-sm btn-default">Delete Monitor
                    </button>
                  </div>
                  <!-- / Controls -->
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </aside>
    <!-- / Monitor Sidebar -->
  </div>
</template>
