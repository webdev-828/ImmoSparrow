<template>
  <div :class="{'deleted-block': showDeleted}">
    <ul class="flex-tabs list-unstyled">
      <li
        :class="{ 'active' : tabsProfile['showProfile']}"
        @click="showTabs('showProfile', tabsProfile)">
        <span>Profile</span>
      </li>
      <li
        v-if="!addUser && !showDeleted"
        :class="{ 'active' : tabsProfile['showPassword']}"
        @click="showTabs('showPassword', tabsProfile)">
        <span>Password</span>
      </li>
      <li
        v-if="!addUser"
        :class="{ 'active' : tabsProfile['showAgencies']}"
        @click="showTabs('showAgencies', tabsProfile)">
        <span>Agencies</span>
      </li>
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
              v-if="!addUser"
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
                        v-if="getDateAndTime(user.created.time, 'DD.MM.YYYY', $store.getters['authStatesModule/lang'])"
                        class="value"
                        notranslate>
                        {{ getDateAndTime(user.created.time, "DD.MM.YYYY", $store.getters['authStatesModule/lang']) }}
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
                        v-if="user.updated || udpated"
                        class="value"
                        notranslate>
                        {{ getDateAndTime(udpated ? new Date() : user.updated.time, "DD.MM.YYYY", $store.getters['authStatesModule/lang']) }}
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
                  v-if="!addUser"
                  class="form-group">
                  <div
                    v-if="!isUserProfile"
                    class="">
                    <label>Id:</label> <var id>{{ user.id }}</var>
                  </div>
                  <div class="">
                    <label class="css-input css-checkbox css-checkbox-primary">
                      <input
                        :checked="user.isEnabled"
                        v-model="user.isEnabled"
                        type="checkbox"><span/> Active
                    </label>
                  </div>
                </div>
                <div
                  :class="{ 'has-error' : errors.has('profile_form.email') }"
                  class="form-group row">
                  <div class="col-xs-12">
                    <div
                      v-if="addUser"
                      class="">
                      <label for="email">Email</label>
                      <input
                        v-validate="'required|email|unique'"
                        id="email"
                        v-model="user.email"
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
                        v-model="user.email"
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
                  v-if="addUser"
                  :class="{ 'has-error' : errors.has('profile_form.password') }"
                  class="form-group row">
                  <div class="col-xs-12">
                    <div class="">
                      <label for="url">Password</label>
                      <input
                        v-validate="{ required: true, min: 8, regex: passRegex }"
                        id="password"
                        ref="password"
                        v-model="password"
                        class="form-control"
                        type="password"
                        name="password"
                        autocomplete="off"
                        data-vv-scope="profile_form">
                    </div>
                    <div
                      v-show="errors.has('profile_form.password')"
                      class="help-block text-right animated fadeInDown">{{
                      errors.first('profile_form.password') }}
                    </div>
                  </div>
                </div>
                <div
                  v-if="addUser"
                  :class="{ 'has-error' : errors.has('profile_form.password-confirm') }"
                  class="form-group row">
                  <div class="col-xs-12">
                    <div class="">
                      <label for="url">Confirm password</label>
                      <input
                        v-validate="'required|confirmed:password'"
                        id="new_password"
                        v-model="newPassword"
                        class="form-control"
                        type="password"
                        name="password-confirm"
                        autocomplete="off"
                        data-vv-scope="profile_form">
                    </div>
                    <div
                      v-show="errors.has('profile_form.password-confirm')"
                      class="help-block text-right animated fadeInDown">{{
                      errors.first('profile_form.password-confirm') }}
                    </div>
                  </div>
                </div>
                <div class="form-group row">
                  <div class="col-xs-6">
                    <div class="">
                      <label for="salutation">Salutation</label>
                      <select
                        id="salutation"
                        v-model="user.primaryInfo.salutation"
                        class="form-control"
                        name="salutation"
                        size="1"
                        data-vv-scope="profile_form">
                        <option
                          v-for="(sal, salKey) in salutations"
                          :value="sal.text"
                          :key="salKey">
                          {{ sal.text }}
                        </option>
                      </select>
                    </div>
                  </div>
                  <div class="col-xs-6">
                    <div class="">
                      <label for="role">User role</label>
                      <select
                        id="role"
                        v-model="user.role"
                        class="form-control"
                        name="role"
                        size="1"
                        data-vv-scope="profile_form">
                        <option
                          v-for="(role, roleKey) in userRoles"
                          :value="role.value"
                          :key="roleKey">
                          {{ role.text }}
                        </option>
                      </select>
                    </div>
                  </div>
                </div>
                <div
                  :class="{ 'has-error' : errors.has('profile_form.first_name') }"
                  class="form-group row">
                  <div class="col-md-12">
                    <div class="">
                      <label for="first_name">First name</label>
                      <input
                        v-validate="'required'"
                        id="first_name"
                        v-model="user.primaryInfo.firstName"
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
                      <label for="last_name">Last name</label>
                      <input
                        v-validate="'required'"
                        id="last_name"
                        v-model="user.primaryInfo.lastName"
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
                        v-model="user.primaryInfo.title"
                        class="form-control"
                        type="text">
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
                @click="showContactInfo = !showContactInfo">
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
                <AddressTemplate :address="user.address"/>
                <div class="form-group row">
                  <div
                    :class="{ 'has-error' : errors.has('profile_form.phone') }"
                    class="col-xs-12">
                    <div class="">
                      <label for="phone">Phone</label>
                      <the-mask
                        v-validate="{regex: /^(\+41\s+\(0\)\s+[0-9]+[0-9]+\ [0-9]+[0-9]+[0-9]+\ [0-9]+[0-9]+\ [0-9]+[0-9])$/ }"
                        id="phone"
                        v-model="user.contactInfo.workPhone"
                        class="form-control"
                        name="phone"
                        data-vv-scope="profile_form"
                        masked
                        mask="+41 (0) ## ### ## ##"/>
                    </div>
                    <div
                      v-show="errors.has('profile_form.phone')"
                      class="help-block text-right animated fadeInDown">{{
                      errors.first('profile_form.phone') }}
                    </div>
                  </div>
                </div>
                <div class="form-group row">
                  <div
                    :class="{ 'has-error' : errors.has('profile_form.cell') }"
                    class="col-xs-12">
                    <div class="">
                      <label for="cell">Cell</label>
                      <the-mask
                        v-validate="{regex: /^(\+41\s+\(0\)\s+[0-9]+[0-9]+\ [0-9]+[0-9]+[0-9]+\ [0-9]+[0-9]+\ [0-9]+[0-9])$/ }"
                        id="cell"
                        v-model="user.contactInfo.mobilePhone"
                        class="form-control"
                        name="cell"
                        data-vv-scope="profile_form"
                        masked
                        mask="+41 (0) ## ### ## ##"/>
                    </div>
                    <div
                      v-show="errors.has('profile_form.cell')"
                      class="help-block text-right animated fadeInDown">{{
                      errors.first('profile_form.cell') }}
                    </div>
                  </div>
                </div>
                <div class="form-group row">
                  <div class="col-xs-6">
                    <div class="">
                      <label for="skypename">Skype Name</label>
                      <input
                        id="skypename"
                        v-model="user.contactInfo.skypeName"
                        class="form-control"
                        type="text">
                    </div>
                  </div>
                  <div class="col-xs-6">
                    <div class="">
                      <label for="url">Website</label>
                      <input
                        id="url"
                        v-model="user.contactInfo.websiteUrl"
                        class="form-control"
                        type="text"
                      >
                    </div>
                  </div>
                </div>
                <div class="form-group row">
                  <div class="col-xs-6">
                    <div class="">
                      <label for="lang">Language</label>
                      <select
                        id="lang"
                        v-model="user.settings.ui.languageCode"
                        class="form-control"
                        name="lang"
                        size="1"
                        data-vv-scope="profile_form">
                        <option
                          v-for="(lang, langKey) in languages"
                          :value="lang.text"
                          :key="langKey">
                          {{ lang.text }}
                        </option>
                      </select>
                    </div>
                  </div>
                  <div class="col-xs-6">
                    <div class="">
                      <label for="remarks">Remarks</label>
                      <input
                        id="remarks"
                        v-model="user.adminInfo.remarks"
                        class="form-control"
                        type="text"
                      >
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <!-- / Contact Section -->
            <div class="data-section stand-out">
              <div
                class="section-label cursor-show"
                @click="showNewFeatures = !showNewFeatures">
                <div class="label-copy">New features info</div>
                <div class="section-controls">
                  <button
                    v-tooltip.top="{ content: 'Toggle section', delay: { show: 700, hide: 100 }}"
                    class="btn btn-sm btn-default cursor-none"
                    type="button">
                    <i
                      :class="{'fa-angle-up': showNewFeatures, 'fa-angle-down': !showNewFeatures}"
                      class="fa"/>
                  </button>
                </div>
              </div>
              <div
                v-if="showNewFeatures"
                class="section-content">
                <div class="form-group row">
                  <div class="col-xs-12">
                    <label for="newFeat">Feature type</label>
                    <select
                      id="newFeat"
                      v-model="user.adminInfo.devSettings.accessLevel"
                      class="form-control"
                      name="newFeat"
                      size="1"
                      data-vv-scope="profile_form">
                      <option
                        v-for="(level, levelKey) in accessLevels"
                        :value="level.value"
                        :key="levelKey">
                        {{ level.text }}
                      </option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
            <!-- Controls Section -->
            <div
              class="data-section no-border margin-b-20">
              <button
                v-if="addUser"
                :disabled="$store.getters['globalStatesModule/loadingButton']"
                class="btn btn-block btn-sm btn-success"
                type="submit">
                <i
                  v-if="$store.getters['globalStatesModule/loadingButton']"
                  class="fa fa-circle-o-notch fa-spin"/> Add user
              </button>
              <button
                v-else
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
                Delete User
              </button>
            </div>
            <!-- / Controls Section -->
          </form>
        </div>
        <!-- / Tab 1 -->
        <!-- 2 Tab -->
        <div
          v-if="!addUser"
          :class="{ 'active' : tabsProfile['showPassword']}"
          class="tab-pane">
          <div class="block block-themed">
            <div class="block-content">
              <form
                class="form-horizontal push-10-t push-10"
                data-vv-scope="pass_form"
                @submit.prevent="updatePassword('pass_form')">

                <div
                  v-if="isUserProfile"
                  :class="{ 'has-error' : errors.has('pass_form.current_password') || !passwordOk }"
                  class="form-group col-xs-12">
                  <div class="">
                    <input
                      v-validate="'required'"
                      id="current_password"
                      v-model="currentPassword"
                      class="form-control"
                      type="password"
                      name="current_password"
                      autocomplete="off"
                      data-vv-scope="pass_form"

                    >
                    <label for="url">Current password</label>
                  </div>

                  <div
                    v-show="errors.has('pass_form.current_password') || !passwordOk"
                    class="help-block text-right animated fadeInDown">{{
                    errors.first('pass_form.current_password') }}
                  </div>
                </div>
                <div
                  :class="{ 'has-error' : errors.has('pass_form.password') }"
                  class="form-group col-xs-12">
                  <div class="">
                    <label for="url">New password</label>
                    <input
                      v-validate="{ required: true, min: 8, regex: passRegex }"
                      id="password"
                      v-model="password"
                      class="form-control"
                      type="password"
                      name="password"
                      autocomplete="off"
                      data-vv-scope="pass_form"
                    >
                  </div>

                  <div
                    v-show="errors.has('pass_form.password')"
                    class="help-block text-right animated fadeInDown">{{
                    errors.first('pass_form.password') }}
                  </div>
                </div>

                <div
                  :class="{ 'has-error' : errors.has('pass_form.password_confirmation') }"
                  class="form-group col-xs-12">
                  <div class="">
                    <label for="url">Confirm new password</label>
                    <input
                      v-validate="'required|confirmed:password'"
                      id="new_password"
                      v-model="newPassword"
                      class="form-control"
                      type="password"
                      name="password_confirmation"
                      autocomplete="off"
                      data-vv-scope="pass_form"
                    >
                  </div>

                  <div
                    v-show="errors.has('pass_form.password_confirmation')"
                    class="help-block text-right animated fadeInDown">{{
                    errors.first('pass_form.password_confirmation') }}
                  </div>

                </div>

                <div class="form-group col-xs-12">
                  <button
                    :disabled="!newPassword || !password || $store.getters['globalStatesModule/loadingButton']"
                    class="btn btn-sm btn-success"
                    type="submit">
                    <i
                      v-if="$store.getters['globalStatesModule/loadingButton']"
                      class="fa fa-circle-o-notch fa-spin"/>
                    <span> Update password</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
        <!-- / 2 Tab -->
        <!-- 3 Tab -->
        <div
          v-if="!addUser"
          :class="{ 'active' : tabsProfile['showAgencies']}"
          class="tab-pane">
          <div
            v-for="(agency, agencyKey) in agencies"
            :key="agencyKey"
            class="data-section stand-out">
            <div class="section-label">
              <div class="label-copy"><var agencyName>{{ agency.agency.name }}</var></div>
              <div
                v-if="!showDeleted"
                class="section-controls" >
                <button
                  class="btn btn-sm btn-default"
                  type="button"
                  @click.stop="getAgency(agency)">Profile</button>
              </div>
            </div>
            <div class="section-content">
              <div class="table-flex-col">
                <div class="table-col">
                  <div class="flex-row">
                    <div class="poperty-data">Status</div>
                    <div class="value-data">
                      <span
                        v-if="agency.agency.isActive"
                        class="label label-success">Active</span>
                      <span
                        v-if="!agency.agency.isActive"
                        class="label label-danger">Inactive</span>
                    </div>
                  </div>
                  <div class="flex-row">
                    <div class="poperty-data">Address</div>
                    <div class="value-data"><var address>{{ displayAddress(agency.agency.address) }}</var></div>
                  </div>
                  <div class="flex-row">
                    <div class="poperty-data">Owner</div>
                    <div class="value-data"><var ownerUser>{{ agency.agency.ownerUser ? agency.agency.ownerUser.firstName + " " + agency.agency.ownerUser.lastName : "" }}</var></div>
                  </div>
                  <div
                    v-if="agency.employee"
                    class="flex-row hovertr"
                    @click="redirectToEmployee(agency.employee.id, agency.agency.id)">
                    <div class="poperty-data">Employee</div>
                    <div
                      class="value-data">
                      {{ agency.employee.firstName }} {{ agency.employee.lastName }}
                    </div>
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
