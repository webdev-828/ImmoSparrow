<template>
  <div :class="{'deleted-block': showDeleted}">
    <ul class="flex-tabs list-unstyled">
      <li
        :class="{ 'active no-hover' : tabsProfile['showProfile']}"
        @click="showTabs('showProfile', tabsProfile)">
        <span>Profile</span>
      </li>
      <li
        v-if="!addEmployee"
        :class="{ 'active no-hover' : tabsProfile['showBundles']}"
        @click="showTabs('showBundles', tabsProfile)">
        <span>Bundle/area</span>
      </li>
    </ul>
    <div
      v-bar
      v-if="loaded"
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
              v-if="!addEmployee"
              class="data-section">
              <div class="section-content padding-t-10">
                <div class="fluid-data-table flex-option two-col margin-b-0">
                  <div class="fluid-cell-wrap">
                    <div class="fluid-cell">
                      <div
                        class="attribute">
                        Created
                      </div>
                      <div
                        v-if="getDateAndTime(employee.created.time, 'DD.MM.YYYY', $store.getters['authStatesModule/lang'])"
                        class="value"
                        notranslate>
                        {{ getDateAndTime(employee.created.time, "DD.MM.YYYY", $store.getters['authStatesModule/lang']) }}
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
                        v-if="employee.updated || updated"
                        class="value"
                        notranslate>
                        {{ getDateAndTime(updated ? new Date() : employee.updated.time, "DD.MM.YYYY", $store.getters['authStatesModule/lang']) }}
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
            <div class="data-section stand-out">
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
                  v-if="!addEmployee"
                  class="form-group">
                  <div>
                    <label>Id:</label> <var id>{{ employee.id }}</var>
                  </div>
                  <div class="">
                    <label class="css-input css-checkbox css-checkbox-primary">
                      <input
                        :checked="employee.isEnabled"
                        v-model="employee.isEnabled"
                        type="checkbox"><span/> Active
                    </label>
                  </div>
                </div>
                <div
                  :class="{ 'has-error' : errors.has('profile_form.email') }"
                  class="form-group row">
                  <div class="col-xs-12">
                    <div
                      v-if="addEmployee"
                      class="">
                      <label
                        id="email"
                        for="email">Email</label>
                      <input
                        v-validate="'required|email|unique'"
                        id="email"
                        v-model="employee.contactInfo['email']"
                        class="form-control"
                        type="text"
                        name="email"
                        data-vv-scope="profile_form">
                    </div>
                    <div
                      v-else
                      class="">
                      <label for="email">Email</label>
                      <input
                        v-validate="'required|email'"
                        id="email"
                        v-model="employee.contactInfo['email']"
                        class="form-control"
                        type="text"
                        name="email"
                        data-vv-scope="profile_form">
                    </div>
                    <div
                      v-show="errors.has('profile_form.email')"
                      class="help-block text-right animated fadeInDown">{{
                      errors.first('profile_form.email') }}
                    </div>
                  </div>
                </div>
                <div
                  :class="{ 'has-error' : errors.has('profile_form.first_name') }"
                  class="form-group row">
                  <div class="col-md-12">
                    <div class="">
                      <label
                        id="first_name"
                        for="first_name">First name</label>
                      <input
                        v-validate="'required'"
                        id="first_name"
                        v-model="employee.primaryInfo['firstName']"
                        class="form-control"
                        type="text"
                        name="first_name"
                        data-vv-scope="profile_form">
                    </div>
                    <div
                      v-show="errors.has('profile_form.first_name')"
                      class="help-block text-right animated fadeInDown">{{
                      errors.first('profile_form.first_name') }}
                    </div>
                  </div>
                </div>
                <div
                  :class="{ 'has-error' : errors.has('profile_form.last_name') }"
                  class="form-group row">
                  <div class="col-md-12">
                    <div class="">
                      <label
                        id="last_name"
                        for="last_name">Last name</label>
                      <input
                        v-validate="'required'"
                        id="last_name"
                        v-model="employee.primaryInfo['lastName']"
                        class="form-control"
                        type="text"
                        name="last_name"
                        data-vv-scope="profile_form"
                      >
                    </div>
                    <div
                      v-show="errors.has('profile_form.last_name')"
                      class="help-block text-right animated fadeInDown">{{
                      errors.first('profile_form.last_name') }}
                    </div>
                  </div>
                </div>
                <div class="form-group row">
                  <div class="col-xs-12">
                    <div class="">
                      <label for="title">Title</label>
                      <input
                        id="title"
                        v-model="employee.primaryInfo['title']"
                        class="form-control"
                        type="text">
                    </div>
                  </div>
                </div>
                <div class="form-group row">
                  <div class="col-xs-12">
                    <div class="">
                      <label for="country">Role</label>
                      <select
                        id="role"
                        v-model="employee.role"
                        class="form-control"
                        name="role"
                        size="1">
                        <option
                          v-for="(role, roleKey) in employeeRoles"
                          :value="role.value"
                          :key="roleKey">
                          {{ role.text }}
                        </option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <!-- / Identity Section -->
            <!-- Contact Section -->
            <div class="data-section stand-out">
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
                <Address
                  :formScope="'profile_form'"
                  :address="employee.address"/>
                <div
                  :class="{'has-error': errors.first('profile_form.phone')}"
                  class="form-group row">
                  <div class="col-xs-12">
                    <div class="">
                      <label for="phone">Phone</label>
                      <the-mask
                        v-validate="{regex: /^(\+41\s+\(0\)\s+[0-9]+[0-9]+\ [0-9]+[0-9]+[0-9]+\ [0-9]+[0-9]+\ [0-9]+[0-9])$/ }"
                        id="phone"
                        v-model="employee.contactInfo.workPhone"
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
                </div>
                <div
                  :class="{'has-error': errors.first('profile_form.cell')}"
                  class="form-group row">
                  <div class="col-xs-12">
                    <div class="">
                      <label for="cell">Cell</label>
                      <the-mask
                        v-validate="{regex: /^(\+41\s+\(0\)\s+[0-9]+[0-9]+\ [0-9]+[0-9]+[0-9]+\ [0-9]+[0-9]+\ [0-9]+[0-9])$/ }"
                        id="cell"
                        v-model="employee.contactInfo.mobilePhone"
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
                </div>
                <div class="form-group row">
                  <div class="col-xs-6">
                    <div class="">
                      <label for="skypename">Skype Name</label>
                      <input
                        id="skypename"
                        v-model="employee.contactInfo.skypeName"
                        class="form-control"
                        type="text">
                    </div>
                  </div>
                  <div class="col-xs-6">
                    <div class="">
                      <label for="remarks">Remarks</label>
                      <input
                        id="remarks"
                        v-model="employee.primaryInfo.remarks"
                        class="form-control"
                        type="text"
                      >
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div
              v-if="addEmployee"
              class="data-section">
              <div class="section-label">
                <label class="css-input css-checkbox css-checkbox-primary">
                  <input
                    :checked="showInvitation"
                    v-model="showInvitation"
                    type="checkbox"><span/> Send invitation
                </label>
              </div>
              <div
                v-if="showInvitation"
                class="section-content">
                <div
                  :class="{ 'has-error' : errors.has('profile_form.firstName') }"
                  class="form-group row">
                  <div class="col-xs-12 padding-top-6">
                    <div class="">
                      <label
                        id="firstName"
                        for="firstName">First Name</label>
                      <input
                        v-validate="'required'"
                        id="firstName"
                        v-model="invitation.recipient.firstName"
                        class="form-control"
                        type="text"
                        name="firstName"
                        data-vv-scope="profile_form">
                    </div>
                    <div
                      v-show="errors.has('profile_form.firstName')"
                      class="help-block text-right animated fadeInDown">{{
                      errors.first('profile_form.firstName') }}
                    </div>
                  </div>
                </div>
                <div
                  :class="{ 'has-error' : errors.has('profile_form.lastName') }"
                  class="form-group row">
                  <div class="col-xs-12 padding-top-6">
                    <div class="">
                      <label
                        id="lastName"
                        for="lastName">Last Name</label>
                      <input
                        v-validate="'required'"
                        id="lastName"
                        v-model="invitation.recipient.lastName"
                        class="form-control"
                        type="text"
                        name="lastName"
                        data-vv-scope="profile_form">
                    </div>
                    <div
                      v-show="errors.has('profile_form.lastName')"
                      class="help-block text-right animated fadeInDown">{{
                      errors.first('profile_form.lastName') }}
                    </div>
                  </div>
                </div>
                <div
                  :class="{ 'has-error' : errors.has('profile_form.recipient_email') }"
                  class="form-group row">
                  <div class="col-xs-12" >
                    <div class="padding-t-10">
                      <label
                        id="recipient_email"
                        for="recipient_email">Email</label>
                      <input
                        v-validate="'required'"
                        id="recipient_email"
                        v-model="employeeEmail"
                        class="form-control"
                        type="text"
                        name="recipient_email"
                        data-vv-scope="profile_form">
                    </div>
                    <div
                      v-show="errors.has('profile_form.recipient_email')"
                      class="help-block text-right animated fadeInDown">{{
                      errors.first('profile_form.recipient_email') }}
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
                v-if="addEmployee && !showInvitation"
                :disabled="$store.getters['globalStatesModule/loadingButton']"
                class="btn btn-block btn-sm btn-success"
                type="submit">
                <i
                  v-if="$store.getters['globalStatesModule/loadingButton']"
                  class="fa fa-circle-o-notch fa-spin"/> Add employee
              </button>
              <button
                v-if="!addEmployee"
                :disabled="$store.getters['globalStatesModule/loadingButton']"
                class="btn btn-block btn-sm btn-success"
                type="submit">
                <i
                  v-if="$store.getters['globalStatesModule/loadingButton']"
                  class="fa fa-circle-o-notch fa-spin"/> Update profile
              </button>
              <button
                v-show="alphaFeature"
                type="button"
                class="btn btn-block btn-sm btn-default alpha-feature feature-on-block">
                Delete Employee
              </button>
              <button
                v-if="addEmployee && showInvitation"
                :disabled="$store.getters['globalStatesModule/loadingButton']"
                class="btn btn-block btn-sm btn-info"
                type="submit">
                <i
                  v-if="$store.getters['globalStatesModule/loadingButton']"
                  class="fa fa-circle-o-notch fa-spin"/> Add employee and send invitation
              </button>
            </div>
          </form>
          <!-- / Controls Section -->
          <!-- Section -->
          <form
            v-if="!addEmployee"
            data-vv-scope="invitation_form"
            @submit.prevent="sendInvitation('invitation_form')">
            <div class="data-section stand-out">
              <div
                class="section-label cursor-show"
                @click.stop="showInvitation = !showInvitation">
                <div class="label-copy">Invitation status</div>
                <div class="section-controls">
                  <button
                    v-tooltip.top="{ content: 'Toggle section', delay: { show: 700, hide: 100 }}"
                    class="btn btn-sm btn-default cursor-none"
                    type="button">
                    <i
                      :class="{'fa-angle-up': showInvitation, 'fa-angle-down': !showInvitation}"
                      class="fa"/>
                  </button>
                </div>
              </div>
              <div
                v-if="showInvitation"
                class="section-content">
                <div class="form-group row">
                  <template v-if="!employee.invitation || employee.invitation['status'] === 5 || employee.invitation['status'] === 2 || employee.invitation['status'] === 4">
                    <div v-if="!showDeleted">
                      <div
                        :class="{ 'has-error' : errors.has('invitation_form.firstName') }"
                        class="col-xs-6 padding-top-6">
                        <div class="">
                          <label for="firstName">First Name</label>
                          <input
                            v-validate="'required'"
                            id="firstName"
                            v-model="invitation.recipient.firstName"
                            class="form-control"
                            type="text"
                            name="firstName"
                            data-vv-scope="invitation_form">
                        </div>
                        <div
                          v-show="errors.has('invitation_form.firstName')"
                          class="help-block text-right animated fadeInDown">{{
                          errors.first('invitation_form.firstName') }}
                        </div>
                      </div>
                      <div
                        :class="{ 'has-error' : errors.has('invitation_form.lastName') }"
                        class="col-xs-6 padding-top-6">
                        <div class="">
                          <label for="lastName">Last Name</label>
                          <input
                            v-validate="'required'"
                            id="lastName"
                            v-model="invitation.recipient.lastName"
                            class="form-control"
                            type="text"
                            name="lastName"
                            data-vv-scope="invitation_form">
                        </div>
                        <div
                          v-show="errors.has('invitation_form.lastName')"
                          class="help-block text-right animated fadeInDown">{{
                          errors.first('invitation_form.lastName') }}
                        </div>
                      </div>
                      <div
                        :class="{ 'has-error' : errors.has('invitation_form.recipient_email') }"
                        class="col-xs-12">
                        <div class="padding-t-10">
                          <label for="recipient_email">Email</label>
                          <input
                            v-validate="'required'"
                            id="recipient_email"
                            v-model="employeeEmail"
                            class="form-control"
                            type="text"
                            name="recipient_email"
                            data-vv-scope="invitation_form">
                        </div>
                        <div
                          v-show="errors.has('invitation_form.recipient_email')"
                          class="help-block text-right animated fadeInDown">{{
                          errors.first('invitation_form.recipient_email') }}
                        </div>
                      </div>
                      <div class="col-xs-12">
                        <div class="padding-t-10">
                          <button
                            :disabled="sendingInvitation"
                            type="submit"
                            class="btn btn-sm btn-info">
                            <i
                              v-if="sendingInvitation"
                              class="fa fa-circle-o-notch fa-spin"/>
                            <span>Send invitation</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </template>
                  <template v-if="employee.invitation">
                    <template v-if="employee.invitation['status'] === 1 && !showDeleted">
                      <template v-if="employee.invitation.request.recipient">
                        <div class="col-xs-6 padding-top-6">
                          <div class="">
                            <label for="">First Name</label>
                            <input
                              v-model="employee.invitation.request.recipient.firstName"
                              disabled
                              class="form-control"
                              type="text">
                          </div>
                        </div>
                        <div class="col-xs-6 padding-top-6">
                          <div class="">
                            <label for="">Last Name</label>
                            <input
                              v-model="employee.invitation.request.recipient.lastName"
                              disabled
                              class="form-control"
                              type="text">
                          </div>
                        </div>
                      </template>
                      <div
                        v-else
                        class="col-xs-12">
                        <div class="padding-t-10">
                          <label for="">Name</label>
                          <input
                            v-model="employee.invitation.request.recipientName"
                            disabled
                            class="form-control"
                            type="text">
                        </div>
                      </div>
                      <div class="col-xs-12">
                        <div class="padding-t-10">
                          <label for="">Email</label>
                          <input
                            v-model="employee.invitation.email"
                            disabled
                            class="form-control"
                            type="text">
                        </div>
                      </div>
                      <div class="col-xs-12">
                        <div class="padding-t-10">
                          <a
                            :disabled="sendingInvitation"
                            type="button"
                            class="btn btn-sm btn-danger"
                            @click="cancelInvitation()">
                            <i
                              v-if="sendingInvitation"
                              class="fa fa-circle-o-notch fa-spin"/>
                            <span>Cancel invitation</span>
                          </a>
                        </div>
                      </div>
                    </template>
                    <template v-if="employee.invitation['status'] === 3">
                      <div class="col-xs-12 padding-top-6">
                        <label
                          for="phone"
                          class="label-icon">Sent to
                          <a @click.stop="redirectToUser(employee.user.id)">
                            <strong>
                              <var
                                v-if="employee.invitation.request.recipient"
                                recipientName>{{ employee.invitation.request.recipient.firstName + ' ' + employee.invitation.request.recipient.lastName }}</var>
                              <var
                                v-else
                                recipientName>{{ employee.invitation.request.recipientName }}</var>
                            </strong>
                          </a> <var email>({{ employee.invitation.email }})</var>
                          <div
                            v-show="alphaFeature"
                            class="btn-block alpha-feature feature-on-block">
                            <button
                              class="btn-icon gray"
                              type="button"
                              @click.stop="toggleUserModal(true, 1)"><i class="fa fa-edit fa-x"/></button>

                            <button
                              class="btn-icon gray"
                              type="button"
                              @click.stop="unlinkInvitationUser(1)"><i class="fa fa-times-circle fa-x"/></button>
                          </div>

                        </label>
                      </div>

                      <div class="col-xs-12 padding-top-6">
                        <label
                          v-if="employee.invitation.acceptedUser"
                          for="acceptedUser"
                          class="label-icon">Has been accepted by
                          <a @click.stop="redirectToUser(employee.invitation.acceptedUser.id)">
                            <strong>
                              <var
                                acceptedUser>{{ employee.invitation.acceptedUser.firstName }} {{ employee.invitation.acceptedUser.lastName }}</var>
                            </strong>
                          </a> <var email>({{ employee.invitation.acceptedUser.email }})</var>
                          <div
                            v-show="alphaFeature"
                            class="btn-block alpha-feature feature-on-block">
                            <button
                              class="btn-icon gray"
                              type="button"
                              @click.stop="toggleUserModal(true, 2)"><i class="fa fa-edit fa-x"/></button>

                            <button
                              class="btn-icon gray"
                              type="button"
                              @click.stop="unlinkInvitationUser(2)"><i class="fa fa-times-circle fa-x"/></button>
                          </div>
                        </label>

                        <employee-modal
                          v-if="showModal"
                          :invitation="employee.invitation"
                          :setNewInvitationStatus="setNewInvitationStatus"
                          :updateType="updateType"
                          :toggleUserModal="toggleUserModal"
                        />
                      </div>
                    </template>
                  </template>
                </div>
              </div>
            </div>
          </form>
          <!-- / Section -->
        </div>
        <!-- / Tab 1 -->
        <!-- Tab 2 -->
        <div
          :class="{ 'active' : tabsProfile['showBundles']}"
          class="tab-pane"
          style="padding-bottom: 10px;">
          <form
            data-vv-scope="bundleArea_form"
            @submit.prevent="updateBundleArea('bundleArea_form')">
            <!-- Area Section -->
            <div class="data-section stand-out margin-b-10">
              <div
                class="section-label cursor-show"
                @click="showArea = !showArea">
                <div class="label-copy">Area</div>
                <div class="section-controls">
                  <button
                    v-tooltip.top="{ content: 'Toggle section', delay: { show: 700, hide: 100 }}"
                    class="btn btn-sm btn-default cursor-none"
                    type="button">
                    <i
                      :class="{'fa-angle-up': showArea, 'fa-angle-down': !showArea}"
                      class="fa"/>
                  </button>
                </div>
              </div>
              <div
                v-if="showArea"
                class="section-content zindex10">
                <geo
                  ref="geoSuggest"
                  :addArea="addArea"
                  :getSearchSuggestions="getGeoSearchSuggestions"
                  :openMapAndDraw="openMapAndDraw"
                  :restrictions="employee.geoRestriction"
                  :stc="stc"
                  :showSearchAreas="showSearchAreas"
                  :closeAreasCLick="closeAreasCLick"
                  :removeShape="remove_shape"
                  :removeAddressItem="remove_address_item"
                  :mapIsLoaded="mapIsLoaded"
                />
              </div>
            </div>
            <!-- Area Section -->
            <!-- Bundles Section -->
            <div class="data-section stand-out margin-b-10">
              <div
                class="section-label cursor-show"
                @click="showBundles = !showBundles">
                <div class="label-copy">Bundles</div>
                <div class="section-controls">
                  <button
                    v-tooltip.top="{ content: 'Toggle section', delay: { show: 700, hide: 100 }}"
                    class="btn btn-sm btn-default cursor-none"
                    type="button">
                    <i
                      :class="{'fa-angle-up': showBundles, 'fa-angle-down': !showBundles}"
                      class="fa"/>
                  </button>
                </div>
              </div>
              <div
                v-if="showBundles"
                class="section-content">
                <div class="">
                  <template v-if="unlocatedLicenses.length && !employee.licenseId">
                    <label class="">Select a license:</label>
                    <div
                      class=""
                      style="border: 1px solid #e6e6e6; border-radius: 4px;">
                      <multiselect
                        v-model="selectedLicense"
                        :options="unlocatedLicenses"
                        :show-labels="false"
                        placeholder="Bundles"
                        openDirection="bottom">
                        <template
                          slot="singleLabel"
                          slot-scope="props">
                          <var selectedName>{{ bundleName( props.option ) }}</var>
                        </template>
                        <template
                          slot="option"
                          slot-scope="props">
                          <var name>{{ bundleName( props.option ) }}</var>
                        </template>
                      </multiselect>
                    </div>
                  </template>
                  <template v-if="employee.licenseId">
                    <div
                      class="margin-b-10"
                      style="border: 1px solid #e6e6e6; border-radius: 4px;">
                      <multiselect
                        v-model="selectedLicense"
                        :disabled="true"
                        :options="unlocatedLicenses"
                        :show-labels="false"
                        placeholder="Bundles"
                        openDirection="bottom">
                        <template
                          slot="singleLabel"
                          slot-scope="props">
                          <var selectedName>{{ bundleName( props.option ) }}</var>
                        </template>
                      </multiselect>
                    </div>
                    <div v-if="!showDeleted">
                      <button
                        class="btn btn-sm btn-danger"
                        type="button"
                        @click="removeLicense()">
                        <span>Remove license</span>
                      </button>
                    </div>
                  </template>
                  <div
                    v-if="!employee.licenseId && !unlocatedLicenses.length"
                    class="empty-msg-wrapper">
                    <div class="empty-msg">
                      <p class="text-muted font-s13">
                        No licenses available
                      </p>
                    </div>
                  </div>
                  <div class="">
                    <div v-if="!loading && selectedLicense">
                      <table
                        v-for="(group, groupKey) in includedFeatures"
                        :key="groupKey"
                        class="table table-striped table-condensed margin-b-0">
                        <thead>
                          <tr>
                            <th class="">{{ group.groupName }}</th>
                            <th class="width20percent text-right"/>
                          </tr>
                        </thead>
                        <tbody>
                          <tr
                            v-for="(feature, featureKey) in group.features"
                            :key="featureKey"
                            class="hovertr">
                            <td class="">{{ getFeatureName(feature) }}</td>
                            <td class="width20percent text-right">
                              <label class="css-input switch switch-sm switch-primary margin0">
                                <input
                                  v-model="feature.included"
                                  type="checkbox"><span/>
                              </label>
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <!-- Bundles Section -->
            <div class="data-section no-border margin-b-20">
              <button
                :disabled="$store.getters['globalStatesModule/loadingButton']"
                class="btn btn-block btn-sm btn-success"
                type="submit">
                <i
                  v-if="$store.getters['globalStatesModule/loadingButton']"
                  class="fa fa-circle-o-notch fa-spin"/> Update profile
              </button>
            </div>
          </form>
        </div>
        <!-- / Tab 2 -->
      </div>
    </div>
  </div>
</template>
