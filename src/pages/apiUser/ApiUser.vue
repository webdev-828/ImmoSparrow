<template>
  <div>
    <div
      id="head-container"
      class="bg-white">
      <div
        class="main-section">
        <div
          class="title-section">
          <span>API-Users</span>
        </div>
        <div class="info-section">
          <small><span>12 active</span>, <span>2 inactivated</span></small>
        </div>
        <div
          class="control-section">
          <div class="btn-toolbar">
            <div class="btn-group">
              <div class="input-group">
                <input
                  v-model="searchForString"
                  placeholder="Search by (first name, last name, key )"
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
            <div
              v-show="alphaFeature"
              class="btn-group">
              <button
                :class="{'active': showDeleted}"
                type="button"
                class="btn btn-sm btn-default alpha-feature feature-on-block"
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
                class="btn btn-sm btn-default">{{ i }}
              </button>
            </div>
            <div class="btn-group">
              <button
                type="button"
                class="btn btn-sm btn-success"
                @click.stop="addApiUserSidebar=true">
                <i class="fa fa-plus"/> Add API-User
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
                      <table class="table table-striped table-condensed">
                        <thead>
                          <tr>
                            <th>First Name</th>
                            <th>Last Name</th>
                            <th>Address</th>
                            <th>Access Keys</th>
                            <th>Wizard</th>
                            <th class="text-right">Action</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr
                            class="hovertr"
                            @click.stop="apiUserSidebar=true">
                            <td class="font-w600">Jörg</td>
                            <td class="font-w600">Trommler</td>
                            <td>Kopfhölzistrasse 133, 1609 Le Jordil</td>
                            <td>
                              <div
                                v-for="(i, index) in keys"
                                :key="index"
                                class="margin-b-5">
                                <div class="segmented-label">
                                  <span class="label label-default">{{ i.name }}</span><span
                                    :class="{'label-danger': i.expired, 'label-success': !i.expired}"
                                    class="label">
                                    <i
                                      :class="{'fa-warning': i.expired, 'fa-check': !i.expired}"
                                      class="fa"/> <span v-if="i.expired">Expired on</span>
                                    <span v-else>Active untill</span> 19 Oct 2019
                                  </span>
                                </div>
                              </div>
                            </td>
                            <td>Enabled</td>
                            <td class="text-right">
                              <button
                                v-tooltip.top="{ content: 'Delete Api User', delay: { show: 700, hide: 100 }}"
                                class="btn btn-xs btn-default">
                                <i class="fa fa-trash"/>
                              </button>
                            </td>
                          </tr>
                          <tr
                            class="hovertr"
                            @click.stop="apiUserSidebar=true">
                            <td class="font-w600">Philipp</td>
                            <td class="font-w600">Hoffmann</td>
                            <td>Wiesenstrasse 109, 8241 Barzheim</td>
                            <td>
                              <div
                                v-for="(i, index) in keys2"
                                :key="index"
                                class="margin-b-5">
                                <div class="segmented-label">
                                  <span class="label label-default">{{ i.name }}</span><span
                                    :class="{'label-danger': i.expired, 'label-success': !i.expired}"
                                    class="label">
                                    <i
                                      :class="{'fa-warning': i.expired, 'fa-check': !i.expired}"
                                      class="fa"/> <span v-if="i.expired">Expired on</span>
                                    <span v-else>Active untill</span> 19 Oct 2019
                                  </span>
                                </div>
                              </div>
                            </td>
                            <td>Disabled</td>
                            <td class="text-right">
                              <button
                                v-tooltip.top="{ content: 'Delete Api User', delay: { show: 700, hide: 100 }}"
                                class="btn btn-xs btn-default">
                                <i class="fa fa-trash"/>
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
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
    <!-- API-User Sidebar -->
    <aside
      v-move
      v-if="apiUserSidebar"
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
                <span class="font-w600 push-10-l">Jörg Trommler</span>
              </div>
            </div>
          </div>
          <div class="controls">
            <button
              v-tooltip.bottom="{ content: 'Close panel', delay: { show: 700, hide: 100 }}"
              class="btn btn-sm btn-default margin-l-10"
              type="button"
              @click="apiUserSidebar=false">
              <i class="fa fa-close"/>
            </button>
          </div>
        </div>
        <div>
          <ul class="flex-tabs list-unstyled">
            <li
              :class="{active: tabsItem['profile']}"
              @click="show('profile')">
              <span>Profile</span>
            </li>
            <li
              :class="{active: tabsItem['extAPI']}"
              @click="show('extAPI')">
              <span>ExtAPI</span>
            </li>
            <li
              :class="{active: tabsItem['wizard']}"
              @click="show('wizard')">
              <span>Wizard</span>
            </li>
          </ul>
          <div
            v-bar
            class="detail-content">
            <div class="tab-content">
              <!-- Profile Tab -->
              <div
                v-if="tabsItem['profile']"
                class="tab-pane active padding-b-20">
                <form>
                  <div class="data-section stand-out">
                    <div class="section-label">
                      <div class="label-copy">Identity &amp; Address</div>
                      <div class="section-controls">
                        <button
                          type="button"
                          class="btn btn-sm btn-default"
                          @click="identitySection=!identitySection">
                          <i
                            :class="{'fa-angle-up':identitySection, 'fa-angle-down':!identitySection}"
                            class="fa"/>
                        </button>
                      </div>
                    </div>
                    <div
                      v-if="identitySection"
                      class="section-content">
                      <div class="form-group row margin-b-10">
                        <div class="col-md-12">
                          <div>
                            <label for="first_name">First name</label>
                            <input
                              id="first_name"
                              type="text"
                              name="first_name"
                              data-vv-scope="profile_form"
                              class="form-control"
                              data-vv-id="2"
                              aria-required="true"
                              aria-invalid="false"
                              value="Jörg">
                          </div>
                        </div>
                      </div>
                      <div class="form-group row">
                        <div class="col-md-12">
                          <div>
                            <label for="last_name">Last name</label>
                            <input
                              id="last_name"
                              type="text"
                              name="last_name"
                              data-vv-scope="profile_form"
                              class="form-control"
                              data-vv-id="3"
                              aria-required="true"
                              aria-invalid="false"
                              value="Trommler">
                          </div>
                        </div>
                      </div>

                      <div class="row">
                        <div class="form-group margin-b-10 col-xs-8">
                          <label for="street">Street</label>
                          <input
                            id="street"
                            type="text"
                            name="street"
                            class="form-control"
                            value="Zürichstrasse">
                        </div>
                        <div class="form-group margin-b-10 col-xs-4">
                          <label for="streetNumber">Street number</label>
                          <input
                            id="streetNumber"
                            type="text"
                            name="streetNumber"
                            class="form-control"
                            value="15">
                        </div>
                        <div class="form-group margin-b-10 col-xs-3">
                          <label for="postcode">Zip</label>
                          <input
                            id="postcode"
                            name="postcode"
                            class="form-control"
                            value="1742">
                        </div>
                        <div class="form-group margin-b-10 col-xs-6">
                          <label for="cityName">City</label>
                          <input
                            id="cityName"
                            type="text"
                            name="cityName"
                            class="form-control"
                            value="Autigny">
                        </div>
                        <div class="form-group margin-b-10 col-xs-3">
                          <label for="country">Country</label>
                          <select
                            id="country"
                            name="country"
                            size="1"
                            class="form-control">
                            <option value="CH">
                              CH
                            </option>
                          </select>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div class="data-section no-border margin-b-20">
                    <button
                      type="button"
                      class="btn btn-block btn-sm btn-info">Update Info</button>
                    <button
                      type="button"
                      class="btn btn-block btn-sm btn-default"
                      @click="addApiUserSidebar=false">
                      Delete Api-User
                    </button>
                  </div>
                </form>
              </div>
              <!-- / Profile Tab -->
              <!-- extAPI Tab -->
              <div
                v-if="tabsItem['extAPI']"
                class="tab-pane active padding-b-20">
                <form>
                  <div class="data-section stand-out">
                    <div class="section-label">
                      <div class="label-copy">Access Points</div>
                      <div class="section-controls">
                        <button
                          v-tooltip.top="{ content: 'Add Section', delay: { show: 700, hide: 100 }}"
                          type="button"
                          class="btn btn-sm btn-success"
                          @click="addSegment">
                          <i class="fa fa-plus"/>
                        </button>
                        <!-- <button
                          type="button"
                          class="btn btn-sm btn-default"
                          @click="extApiSection=!extApiSection">
                          <i
                            :class="{'fa-angle-up':extApiSection, 'fa-angle-down':!extApiSection}"
                            class="fa"/>
                        </button> -->
                      </div>
                    </div>
                    <div
                      v-if="extApiSection"
                      class="section-content padding-t-0">
                      <div class="table-in-data-section-container">
                        <table class="table fix-sides-in-data-section">
                          <thead>
                            <tr class="table-small-head">
                              <th class="width50percent">Section</th>
                              <th class="width30percent">Expires</th>
                              <th/>
                            </tr>
                          </thead>
                          <tbody>
                            <tr
                              v-show="addApiLine"
                              id="newApiLine">
                              <td>
                                <div>
                                  <select class="form-control input-sm">
                                    <option>Monitoring</option>
                                    <option>Service name 2</option>
                                    <option>Service name 3</option>
                                    <option>Service name 4</option>
                                    <option>Service name 5</option>
                                  </select>
                                </div>
                              </td>
                              <td>
                                <div>
                                  <datepicker
                                    :input-class="'form-control input-sm'"
                                    :typeable="true"
                                    :calendar-class="'rightside-datepicker'"
                                    :placeholder="'Date'"/>
                                </div>
                              </td>
                              <td style="padding-left: 0;">
                                <div class="text-right">
                                  <button
                                    v-tooltip.top="{ content: 'Update', delay: { show: 700, hide: 100 }}"
                                    type="button"
                                    class="btn btn-sm btn-success">
                                    <i class="fa fa-refresh"/>
                                  </button>
                                  <button
                                    v-tooltip.top="{ content: 'Remove', delay: { show: 700, hide: 100 }}"
                                    type="button"
                                    class="btn btn-sm btn-default"
                                    @click="addApiLine=false">
                                    <i class="fa fa-trash"/>
                                  </button>
                                </div>
                              </td>
                            </tr>
                            <tr
                              v-for="(i, index) in keys"
                              :key="index">
                              <td>
                                <div
                                  :class="{'has-error': i.expired}">
                                  <select class="form-control input-sm">
                                    <option>{{ i.name }}</option>
                                    <option>Service name 2</option>
                                    <option>Service name 3</option>
                                    <option>Service name 4</option>
                                    <option>Service name 5</option>
                                  </select>
                                </div>
                                <div
                                  v-if="i.expired"
                                  class="help-block">Section access expired</div>
                              </td>
                              <td>
                                <div
                                  :class="{'has-error': i.expired}">
                                  <datepicker
                                    :input-class="'form-control input-sm'"
                                    :typeable="true"
                                    :calendar-class="'rightside-datepicker'"
                                    :placeholder="'Date'"
                                    :value="i.date"/>
                                </div>
                              </td>
                              <td style="padding-left: 0;">
                                <div class="text-right">
                                  <button
                                    v-tooltip.top="{ content: 'Update', delay: { show: 700, hide: 100 }}"
                                    type="button"
                                    class="btn btn-sm btn-success">
                                    <i class="fa fa-refresh"/>
                                  </button>
                                  <button
                                    v-tooltip.top="{ content: 'Remove', delay: { show: 700, hide: 100 }}"
                                    type="button"
                                    class="btn btn-sm btn-default">
                                    <i class="fa fa-trash"/>
                                  </button>
                                </div>
                              </td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                </form>
              </div>
              <!-- / extAPI Tab -->
              <!-- Wizard Tab -->
              <div
                v-if="tabsItem['wizard']"
                class="tab-pane active padding-b-20">
                <form>
                  <div class="data-section stand-out margin-b-20 no-z">
                    <div class="section-label">
                      <div class="label-copy">Wizard</div>
                      <div class="section-controls">
                        <label class="css-input switch switch-sm switch-success">
                          Enable <input
                            :checked="wizardEnable"
                            type="checkbox"
                            @click="wizardEnable=!wizardEnable"><span/>
                        </label>
                      </div>
                    </div>
                    <div
                      v-if="wizardEnable"
                      class="section-content">
                      <div class="form-group">
                        <label>API Key</label>
                        <input
                          disabled
                          class="form-control"
                          value="dkdsfkk2934828jdas-99232CH">
                      </div>
                      <div class="form-group">
                        <label>Company Name</label>
                        <input
                          class="form-control">
                      </div>
                      <div class="form-group">
                        <label>Guest Email</label>
                        <input
                          class="form-control"
                          type="email">
                      </div>
                      <div class="form-group">
                        <label>Type</label>
                        <select
                          :disabled="!wizardEnable"
                          class="form-control">
                          <option
                            v-for="(i, index) in ['Modal','Embedded']"
                            :key="index">{{ i }}</option>
                        </select>
                      </div>
                      <div class="form-group">
                        <label>Style</label>
                        <select
                          :disabled="!wizardEnable"
                          class="form-control">
                          <option
                            v-for="(i, index) in ['Blue','Red','Green']"
                            :key="index">{{ i }}</option>
                        </select>
                      </div>
                      <div class="form-group">
                        <label>Custom CSS</label>
                        <textarea
                          :disabled="!wizardEnable"
                          class="form-control"
                          rows="10"
                          placeholder="Paste in custome code"/>
                      </div>
                    </div>
                  </div>
                </form>
              </div>
              <!-- / Wizard Tab -->
            </div>
          </div>
        </div>
      </div>
    </aside>
    <!-- / API-User Sidebar -->
    <!-- Add API-User Sidebar -->
    <aside
      v-move
      v-if="addApiUserSidebar"
      id="sidebar-object-fixed"
      class="active sidebar-shadow just-header-vb">
      <div class="side-panel">
        <div class="detail-header fancy-shadow">
          <div class="title">
            <div class="centering-block">
              <div>
                <span class="font-w600 push-10-l">Add Api-User</span>
              </div>
            </div>
          </div>
          <div class="controls">
            <button
              v-tooltip.bottom="{ content: 'Close panel', delay: { show: 700, hide: 100 }}"
              class="btn btn-sm btn-default margin-l-10"
              type="button"
              @click="addApiUserSidebar=false">
              <i class="fa fa-close"/>
            </button>
          </div>
        </div>
        <div>
          <div
            v-bar
            class="detail-content">
            <div class="tab-content">
              <!-- Profile Tab -->
              <div
                class="tab-pane active padding-b-20">
                <form>
                  <div class="data-section stand-out">
                    <div class="section-label">
                      <div class="label-copy">Identity &amp; Address</div>
                      <div class="section-controls">
                        <!-- <button
                          type="button"
                          class="btn btn-sm btn-default"
                          @click="identitySection=!identitySection">
                          <i
                            :class="{'fa-angle-up':identitySection, 'fa-angle-down':!identitySection}"
                            class="fa"/>
                        </button> -->
                      </div>
                    </div>
                    <div
                      v-if="identitySection"
                      class="section-content">
                      <div class="form-group row margin-b-10">
                        <div class="col-md-12">
                          <div>
                            <label for="first_name">First name</label>
                            <input
                              id="first_name"
                              type="text"
                              name="first_name"
                              data-vv-scope="profile_form"
                              class="form-control"
                              data-vv-id="2"
                              aria-required="true"
                              aria-invalid="false">
                          </div>
                        </div>
                      </div>
                      <div class="form-group row">
                        <div class="col-md-12">
                          <div>
                            <label for="last_name">Last name</label>
                            <input
                              id="last_name"
                              type="text"
                              name="last_name"
                              data-vv-scope="profile_form"
                              class="form-control"
                              data-vv-id="3"
                              aria-required="true"
                              aria-invalid="false">
                          </div>
                        </div>
                      </div>

                      <div class="row">
                        <div class="form-group margin-b-10 col-xs-8">
                          <label for="street">Street</label>
                          <input
                            id="street"
                            type="text"
                            name="street"
                            class="form-control">
                        </div>
                        <div class="form-group margin-b-10 col-xs-4">
                          <label for="streetNumber">Street number</label>
                          <input
                            id="streetNumber"
                            type="text"
                            name="streetNumber"
                            class="form-control">
                        </div>
                        <div class="form-group margin-b-10 col-xs-3">
                          <label for="postcode">Zip</label>
                          <input
                            id="postcode"
                            name="postcode"
                            class="form-control">
                        </div>
                        <div class="form-group margin-b-10 col-xs-6">
                          <label for="cityName">City</label>
                          <input
                            id="cityName"
                            type="text"
                            name="cityName"
                            class="form-control">
                        </div>
                        <div class="form-group margin-b-10 col-xs-3">
                          <label for="country">Country</label>
                          <select
                            id="country"
                            name="country"
                            size="1"
                            class="form-control">
                            <option value="CH">
                              CH
                            </option>
                          </select>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div class="data-section no-border margin-b-20">
                    <button
                      type="button"
                      class="btn btn-block btn-sm btn-success">Add API-User</button>
                    <button
                      type="button"
                      class="btn btn-block btn-sm btn-default"
                      @click="addApiUserSidebar=false">
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
              <!-- / Profile Tab -->
            </div>
          </div>
        </div>
      </div>
    </aside>
    <!-- / Add API-User Sidebar -->
  </div>
</template>
