<template>
  <div :class="{'deleted-block': showDeleted}">
    <ul class="flex-tabs list-unstyled">
      <li
        :class="{ 'active' : tabsProfile['showProfile']}"
        @click="showTabs('showProfile', tabsProfile)">
        <span>Profile</span>
      </li>
      <li
        v-if="!addAgency"
        :class="{ 'active' : tabsProfile['showEmployees']}"
        @click="showTabs('showEmployees', tabsProfile)">
        <span>Employees</span>
      </li>
      <li
        v-if="!addAgency"
        :class="{ 'active' : tabsProfile['showBundles']}"
        @click="showTabs('showBundles', tabsProfile)">
        <span>Bundles</span>
      </li>
      <!-- <li :class="{ 'active' : tabsProfile['showGeo']}" @click="show('showGeo')">
        <span>Geo</span>
      </li> -->
    </ul>
    <div
      v-bar
      class="detail-content">
      <div class="tab-content">
        <!-- Tab 1 -->
        <div
          :class="{ 'active' : tabsProfile['showProfile']}"
          class="tab-pane"
          style="padding-bottom: 10px;">
          <form
            data-vv-scope="profile_form"
            @submit.prevent="updateOrCreate('profile_form')">
            <div
              v-if="!addAgency"
              class="data-section no-border">
              <div class="section-content padding-t-10">
                <div class="fluid-data-table flex-option two-col margin-b-0">
                  <div class="fluid-cell-wrap">
                    <div class="fluid-cell">
                      <div
                        class="attribute">
                        Created
                      </div>
                      <div
                        v-if="getDateAndTime(agency.created.time, 'DD.MM.YYYY', $store.getters['authStatesModule/lang'])"
                        class="value"
                        notranslate>
                        {{ getDateAndTime(agency.created.time, "DD.MM.YYYY", $store.getters['authStatesModule/lang']) }}
                      </div>
                      <div
                        v-else
                        class="value">&nbsp;</div>
                    </div>
                  </div>
                  <div class="fluid-cell-wrap">
                    <div class="fluid-cell">
                      <div
                        class="attribute">
                        Updated
                      </div>
                      <div
                        v-if="agency.updated || updated"
                        class="value"
                        notranslate>
                        {{ getDateAndTime(updated ? new Date() : agency.updated.time, "DD.MM.YYYY", $store.getters['authStatesModule/lang']) }}
                      </div>
                      <div
                        v-else
                        class="value">&nbsp;</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <!-- Identity Section -->
            <div
              class="data-section stand-out"
            >
              <div
                class="section-label cursor-show"
                @click.stop="showIdentity = !showIdentity">
                <div class="label-copy">Identity</div>
                <div class="section-controls">
                  <button
                    v-tooltip.top="{ content: 'Toggle section', delay: { show: 700, hide: 100 }}"
                    class="btn btn-sm btn-default cursor-none"
                    type="button">
                    <i
                      :class="{'fa-angle-up': showIdentity, 'fa-angle-down': !showIdentity}"
                      class="fa"/>
                  </button>
                </div>
              </div>
              <div
                v-if="showIdentity"
                class="section-content">
                <div
                  v-if="!addAgency"
                  class="form-group">
                  <div class="">
                    <label>Id:</label><var
                      notranslate
                      agencyId>{{ agency.id }}</var>
                  </div>
                  <div class="">
                    <label class="css-input css-checkbox css-checkbox-primary">
                      <input
                        :checked="agency.isEnabled"
                        v-model="agency.isEnabled"
                        type="checkbox"><span/> Active
                    </label>
                  </div>
                </div>
                <div class="form-group">
                  <div
                    :class="{ 'has-error' : errors.has('profile_form.name') }"
                    class="">
                    <div class="">
                      <label for="name">Name</label>
                      <input
                        v-validate="'required'"
                        id="name"
                        v-model="agency.primaryInfo['name']"
                        class="form-control"
                        type="text"
                        name="name"
                        data-vv-scope="profile_form"
                      >
                    </div>
                    <div
                      v-show="errors.has('profile_form.name')"
                      class="help-block text-right animated fadeInDown">{{
                      errors.first('profile_form.name') }}
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <!-- / Identity Section -->
            <!-- Geo Section -->
            <geo
              ref="geoSuggest"
              :addArea="addArea"
              :getSearchSuggestions="getGeoSearchSuggestions"
              :openMapAndDraw="openMapAndDraw"
              :restrictions="agency.geoRestriction"
              :stc="stc"
              :showSearchAreas="showSearchAreas"
              :closeAreasCLick="closeAreasCLick"
              :removeShape="remove_shape"
              :removeAddressItem="remove_address_item"
              :mapIsLoaded="mapIsLoaded"
            />
            <!-- / Geo Section -->
            <!-- Contact Section -->
            <div
              class="data-section stand-out"
            >
              <div
                class="section-label cursor-show"
                @click.stop="showContactInfo = !showContactInfo">
                <div class="label-copy">Contact Info</div>
                <div class="section-controls">
                  <button
                    v-tooltip.top="{ content: 'Toggle section', delay: { show: 700, hide: 100 }}"
                    class="btn btn-sm btn-default cursor-none"
                    type="button">
                    <i
                      :class="{'fa-angle-up': showContactInfo, 'fa-angle-down': !showContactInfo}"
                      class="fa"/>
                  </button>
                </div>
              </div>
              <div
                v-if="showContactInfo"
                class="section-content">
                <div class="form-group row">
                  <div class="col-xs-12">
                    <div class="">
                      <autocomplete
                        ref="autocomplete_profile"
                        :setData="setStreet"
                        :onSearch="getSearchSuggestions"
                        :itemHighlighted="'highlightedName'">
                        <template
                          slot="products"
                          slot-scope="{ item }">
                          <span class="suggestion_type">{{ get_icon(item.suggestionType) }}</span>
                        </template>
                      </autocomplete>
                    </div>
                  </div>
                </div>
                <div class="form-group row">
                  <div
                    :class="{ 'has-error' : errors.has('profile_form.street') }"
                    class="col-xs-6">
                    <div class="">
                      <label for="street">Street</label>
                      <input
                        v-validate="'required'"
                        id="street"
                        v-model="agency.address.street"
                        class="form-control"
                        type="text"
                        name="street"
                        data-vv-scope="profile_form"
                      >
                    </div>
                    <div
                      v-show="errors.has('profile_form.street')"
                      class="help-block text-right animated fadeInDown">{{
                      errors.first('profile_form.street') }}
                    </div>
                  </div>
                  <div class="col-xs-6">
                    <div class="">
                      <label for="streetNumber">Street number</label>
                      <input
                        id="streetNumber"
                        v-model="agency.address.streetNumber"
                        class="form-control"
                        type="text"
                        name="streetNumber"
                        data-vv-scope="profile_form"
                      >
                    </div>
                  </div>
                </div>
                <div class="form-group row">
                  <div
                    :class="{ 'has-error' : errors.has('profile_form.postcode') }"
                    class="col-xs-3">
                    <div class="">
                      <label for="postcode">Zip</label>
                      <input
                        v-number-input
                        v-validate="'required'"
                        id="postcode"
                        v-model="agency.address.zip"
                        class="form-control"
                        name="postcode"
                        data-vv-scope="profile_form">
                    </div>
                    <div
                      v-show="errors.has('profile_form.postcode')"
                      class="help-block text-right animated fadeInDown">{{
                      errors.first('profile_form.postcode') }}
                    </div>
                  </div>
                  <div
                    :class="{ 'has-error' : errors.has('profile_form.cityName') }"
                    class="col-xs-6">
                    <div class="">
                      <label for="cityName">City</label>
                      <input
                        v-validate="'required'"
                        id="cityName"
                        v-model="agency.address.locality"
                        class="form-control"
                        type="text"
                        name="cityName"
                        data-vv-scope="profile_form"
                      >
                    </div>
                    <div
                      v-show="errors.has('profile_form.cityName')"
                      class="help-block text-right animated fadeInDown">{{
                      errors.first('profile_form.cityName') }}
                    </div>
                  </div>
                  <div class="col-xs-3">
                    <div class="">
                      <label for="country">Country</label>
                      <select
                        id="country"
                        v-model="agency.address.countryCode"
                        class="form-control"
                        name="country"
                        size="1">
                        <option
                          v-for="(country, cnKey) in countries"
                          :value="country.text"
                          :key="cnKey">
                          {{ country.text }}
                        </option>
                      </select>
                    </div>
                  </div>
                </div>
                <div class="form-group">
                  <div class="row margin-b-10">
                    <div
                      :class="{ 'has-error' : errors.has('profile_form.phone') }"
                      class="col-xs-12">
                      <label for="phone">Phone</label>
                      <the-mask
                        v-validate="{regex: /^(\+41\s+\(0\)\s+[0-9]+[0-9]+\ [0-9]+[0-9]+[0-9]+\ [0-9]+[0-9]+\ [0-9]+[0-9])$/ }"
                        id="phone"
                        v-model="agency.contactInfo['workPhone']"
                        class="form-control"
                        name="phone"
                        data-vv-scope="profile_form"
                        masked
                        mask="+41 (0) ## ### ## ##"/>
                      <div
                        v-show="errors.has('profile_form.phone')"
                        class="help-block text-right animated fadeInDown">{{
                        errors.first('profile_form.phone') }}
                      </div>
                    </div>
                  </div>
                  <div class="row margin-b-10">
                    <div
                      :class="{ 'has-error' : errors.has('profile_form.cell') }"
                      class="col-xs-12">
                      <label for="cell">Cell</label>
                      <the-mask
                        v-validate="{regex: /^(\+41\s+\(0\)\s+[0-9]+[0-9]+\ [0-9]+[0-9]+[0-9]+\ [0-9]+[0-9]+\ [0-9]+[0-9])$/ }"
                        id="cell"
                        v-model="agency.contactInfo['mobilePhone']"
                        class="form-control"
                        name="cell"
                        data-vv-scope="profile_form"
                        masked
                        mask="+41 (0) ## ### ## ##"/>
                      <div
                        v-show="errors.has('profile_form.cell')"
                        class="help-block text-right animated fadeInDown">{{
                        errors.first('profile_form.cell') }}
                      </div>
                    </div>
                  </div>
                  <div class="row margin-b-10">
                    <div
                      :class="{ 'has-error' : errors.has('profile_form.url') }"
                      class="col-xs-12">
                      <label for="url">Website</label>
                      <input
                        v-validate="{url: {require_protocol: true }}"
                        id="url"
                        v-model="agency.contactInfo['websiteUrl']"
                        name="url"
                        data-vv-scope="profile_form"
                        class="form-control"
                        type="text"
                      >
                      <div
                        v-show="errors.has('profile_form.url')"
                        class="help-block text-right animated fadeInDown">{{
                        errors.first('profile_form.url') }}
                      </div>
                    </div>
                  </div>
                  <div class="row margin-b-10">
                    <div class="col-xs-12">
                      <label for="remarks">Remarks</label>
                      <input
                        id="remarks"
                        v-model="agency.contactInfo['remarks']"
                        class="form-control"
                        type="text"
                      >
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <!-- / Contact Section -->
            <!-- Controls Section style="position: fixed; bottom: 0; width: 100%; background-color: #fff;" -->
            <div
              v-if="!showDeleted"
              class="data-section no-border margin-b-20">
              <button
                v-if="addAgency"
                :disabled="$store.getters['globalStatesModule/loadingButton']"
                class="btn btn-block btn-sm btn-success"
                type="submit">
                <i
                  v-if="$store.getters['globalStatesModule/loadingButton']"
                  class="fa fa-circle-o-notch fa-spin"/>Add agency
              </button>
              <button
                v-if="!addAgency"
                :disabled="$store.getters['globalStatesModule/loadingButton']"
                class="btn btn-block btn-sm btn-success"
                type="submit">
                <i
                  v-if="$store.getters['globalStatesModule/loadingButton']"
                  class="fa fa-circle-o-notch fa-spin"/>Update agency
              </button>
              <button
                v-show="alphaFeature"
                type="button"
                class="btn btn-block btn-sm btn-default alpha-feature feature-on-block">
                Delete Agency
              </button>
            </div>
          </form>
          <!-- / Controls Section -->
        </div>
        <!-- / Tab 1 -->
        <!-- 2 Tab -->
        <div
          :class="{ 'active' : tabsProfile['showEmployees']}"
          class="tab-pane">
          <!-- Section -->
          <div
            v-if="employees"
            class="data-section stand-out">
            <div class="section-content">
              <div class="">
                <table class="table table-striped table-small-head font-s13">
                  <thead>
                    <tr>
                      <th
                        class="width20percent"
                        rowspan="1"
                        colspan="1">Last name</th>
                      <th class="width20percent">First name</th>
                      <th class="width30percent" >Created date</th>
                      <th class="width10percent">Role</th>
                      <th
                        v-if="!showDeleted"
                        class="width10percent">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr
                      v-for="(employee, employeeKey) in sortedEmployees"
                      :key="employeeKey"
                      class="hovertr"
                      @click.stop="redirectToEmployee(employee)">
                      <td class="font-w600"><var lastName>{{ employee.lastName }}</var></td>
                      <td><var firstName>{{ employee.firstName }}</var></td>
                      <td><var createdTime>{{ formatDate(employee.createdTime) }}</var></td>
                      <td><var role>{{ getEmployeeRole(employee.role) }}</var></td>
                      <td v-if="!showDeleted">
                        <span
                          v-if="employee.isEnabled"
                          class="label label-success">Active</span>
                        <span
                          v-if="!employee.isEnabled"
                          class="label label-danger">Inactive</span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
          <!-- / Section -->
        </div>
        <!-- / 2 Tab -->
        <!-- 3 Tab -->
        <div
          :class="{ 'active' : tabsProfile['showBundles']}"
          class="tab-pane">
          <form
            v-if="!addAgency"
            data-vv-scope="bundle_form"
            @submit.prevent="addNewBundle('bundle_form')">
            <div class="data-section stand-out">
              <div
                class="section-label cursor-show"
                @click.stop="showNewLicence = !showNewLicence">
                <div class="label-copy">Add new bundle</div>
                <div class="section-controls">
                  <button
                    v-tooltip.top="{ content: 'Toggle section', delay: { show: 700, hide: 100 }}"
                    class="btn btn-sm btn-default cursor-none"
                    type="button">
                    <i
                      :class="{'fa-angle-up': showNewLicence, 'fa-angle-down': !showNewLicence}"
                      class="fa"/>
                  </button>
                </div>
              </div>
              <div
                v-if="showNewLicence"
                class="section-content">
                <div
                  :class="{ 'has-error' : errors.has('bundle_form.bundle') }"
                  class="form-group row">
                  <div class="col-xs-12">
                    <label for="bundle" >Select bundle:</label>
                    <select
                      v-validate="'required'"
                      id="bundle"
                      v-model="newBundle.bundleId"
                      class="form-control input-sm"
                      name="bundle"
                      data-vv-scope="bundle_form"
                      size="1">
                      <option
                        v-for="(bundle, bundleKey) in licencingOptions.bundles"
                        :value="bundle.id"
                        :key="bundleKey">
                        <var name>{{ bundle.name }}</var>
                      </option>
                    </select>
                    <div
                      v-show="errors.has('bundle_form.bundle')"
                      class="help-block text-right animated fadeInDown">{{
                      errors.first('bundle_form.bundle') }}
                    </div>
                  </div>
                </div>
                <div class="form-group row">
                  <div class="col-xs-12">
                    <label class="control-label">Start/end time</label>
                    <div class="input-daterange input-group">
                      <datepicker
                        :input-class="'form-control input-sm'"
                        :typeable="true"
                        :calendar-class="'leftside-datepicker'"
                        :disabledDates="disabledDatesStartDate"
                        :highlighted="bundleDatesHighlighted"
                        v-model="newBundle.startDate"
                        :placeholder="'Start date'"/>
                      <span class="input-group-addon"><i class="fa fa-chevron-right"/></span>
                      <datepicker
                        :input-class="'form-control input-sm'"
                        :typeable="true"
                        :disabledDates="disabledDatesEndDate"
                        :calendar-class="'rightside-datepicker'"
                        v-model="newBundle.endDate"
                        :highlighted="bundleDatesHighlighted"
                        :placeholder="'End date'"/>
                    </div>
                  </div>
                </div>
                <div
                  v-if="!showDeleted"
                  class="form-group row">
                  <div class="col-xs-6">
                    <button
                      :disabled="addingBundle"
                      class="btn btn-sm btn-success"
                      type="submit">
                      <i
                        v-if="addingBundle"
                        class="fa fa-circle-o-notch fa-spin"/>Add bundle
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </form>
          <div
            v-if="agencyLicences && agencyLicences.length"
            class="data-section">
            <div class="section-content">
              <div class="section-label">
                <div class="label-copy with-tabs">
                  <span class="">Bundles:</span>
                  <span
                    :class="{ 'active' : tabsLicences['showUsed']}"
                    class="label-tab"
                    @click="showTabs('showUsed', tabsLicences)">Used</span>
                  <span
                    :class="{ 'active' : tabsLicences['showUnused']}"
                    class="label-tab"
                    @click="showTabs('showUnused', tabsLicences)">Unused</span>
                </div>
              </div>
            </div>
            <div class="tab-content">
              <div
                :class="{ 'active' : tabsLicences['showUsed']}"
                class="tab-pane">
                <div class="section-content">
                  <div style="margin-left: -10px; margin-right: -10px;">
                    <table class="table table-striped">
                      <thead>
                        <tr class="table-small-head">
                          <th
                            class="width30ercent"
                            rowspan="1"
                            colspan="1">Name</th>
                          <th class="width40percent">Start\End</th>
                          <th class="width30percent"/>
                        </tr>
                      </thead>
                      <tbody>
                        <tr
                          v-for="(bundle, bundleId) in usedLicences"
                          :key="bundleId"
                          class="hovertr">
                          <td class="font-w600 font-s12">
                            <var bundleId>{{ getBundleName(bundle.bundleId) }}</var> <i
                              v-tooltip.right="getFeatures(bundle.bundleId)"
                              class="fa fa-question-circle-o"/>
                            <div v-if="checkExpired(bundle.endDate)"><span class="label label-danger">Inactive</span></div>
                          </td>
                          <td>
                            <div>
                              <datepicker
                                :input-class="'form-control input-sm'"
                                v-model="bundle.startDate"
                                :disabledDates="getDisabledDatesEnd(bundle)"
                                :typeable="true"
                                :calendar-class="'leftside-datepicker'"
                                :placeholder="'Date'"/>
                            </div>
                            <div>
                              <datepicker
                                :input-class="'form-control input-sm'"
                                v-model="bundle.endDate"
                                :disabledDates="getDisabledDatesStart(bundle)"
                                :typeable="true"
                                :calendar-class="'leftside-datepicker'"
                                :placeholder="'Date'"/>
                            </div>
                          </td>
                          <td>
                            <div
                              v-if="!showDeleted"
                              class="text-right">
                              <button
                                v-tooltip.top="{ content: 'Update licence', delay: { show: 700, hide: 100 }}"
                                v-if="$store.getters['authStatesModule/userAgency'].access.profile.update"
                                :disabled="(updatingLicence && (selectedBundleId === bundle.id)) || !bundle.isEnabled"
                                type="button"
                                class="btn btn-xs btn-success"
                                @click="updateLicence(bundle)">
                                <i
                                  :class="{'fa-spin': updatingLicence && (selectedBundleId === bundle.id)}"
                                  class="fa fa-refresh"/>
                              </button>
                              <button
                                v-tooltip.top="{ content: 'Remove licence', delay: { show: 700, hide: 100 }}"
                                :disabled="(removingLicence && (selectedBundleId === bundle.id)) || !bundle.isEnabled"
                                type="button"
                                class="btn btn-xs btn-danger"
                                @click="removeLicence(bundle)">
                                <i
                                  :class="{'fa-spin': removingLicence && (selectedBundleId === bundle.id)}"
                                  class="fa fa-close"/>
                              </button>
                            </div>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
              <div
                :class="{ 'active' : tabsLicences['showUnused']}"
                class="tab-pane">
                <div class="section-content">
                  <div style="margin-left: -10px; margin-right: -10px;">
                    <table class="table table-striped">
                      <thead>
                        <tr class="table-small-head">
                          <th
                            class="width30ercent"
                            rowspan="1"
                            colspan="1">Name</th>
                          <th class="width40percent">Start\End</th>
                          <th class="width30percent"/>
                        </tr>
                      </thead>
                      <tbody>
                        <tr
                          v-for="(bundle, bundleId) in unusedLicences"
                          :key="bundleId"
                          class="hovertr">
                          <td class="font-w600 font-s12">
                            <var bundleId>{{ getBundleName(bundle.bundleId) }}</var> <i
                              v-tooltip.right="getFeatures(bundle.bundleId)"
                              class="fa fa-question-circle-o"/>
                            <div v-if="checkExpired(bundle.endDate)"><span class="label label-danger">Inactive</span></div>
                          </td>
                          <td>
                            <div>
                              <datepicker
                                :input-class="'form-control input-sm'"
                                v-model="bundle.startDate"
                                :disabledDates="getDisabledDatesEnd(bundle)"
                                :typeable="true"
                                :calendar-class="'leftside-datepicker'"
                                :placeholder="'Date'"/>
                            </div>
                            <div>
                              <datepicker
                                :input-class="'form-control input-sm'"
                                v-model="bundle.endDate"
                                :disabledDates="getDisabledDatesStart(bundle)"
                                :typeable="true"
                                :calendar-class="'leftside-datepicker'"
                                :placeholder="'Date'"/>
                            </div>
                          </td>
                          <td>
                            <div
                              v-if="!showDeleted"
                              class="text-right">
                              <button
                                v-if="$store.getters['authStatesModule/userAgency'].access.profile.update"
                                :disabled="(updatingLicence && (selectedBundleId === bundle.id)) || !bundle.isEnabled"
                                type="button"
                                class="btn btn-xs btn-success"
                                @click="updateLicence(bundle)">
                                <i
                                  :class="{'fa-spin': updatingLicence && (selectedBundleId === bundle.id)}"
                                  class="fa fa-refresh"/>
                              </button>
                              <button
                                :disabled="(removingLicence && (selectedBundleId === bundle.id)) || !bundle.isEnabled"
                                type="button"
                                class="btn btn-xs btn-danger"
                                @click="removeLicence(bundle)">
                                <i
                                  :class="{'fa-spin': removingLicence && (selectedBundleId === bundle.id)}"
                                  class="fa fa-close"/>
                              </button>
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
        <!-- / 3 Tab -->
      </div>
    </div>
  </div>
</template>
