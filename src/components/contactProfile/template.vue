<template>
  <div>
    <ul class="flex-tabs list-unstyled">
      <li
        :class="{ 'active no-hover' : tabsProfile['showProfile']}"
        @click="show('showProfile')">
        <span>Profile</span>
      </li>
    </ul>
    <div
      v-bar
      class="detail-content">
      <div class="tab-content">
        <!-- Tab 1 -->
        <div
          :class="{ 'active' : tabsProfile['showProfile']}"
          class="tab-pane">
          <form
            data-vv-scope="profile_form"
            @submit.prevent="updateOrCreate('profile_form')">
            <div
              v-if="!addContact"
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
                        v-if="getDateAndTime(contact.created.time, 'DD.MM.YYYY', $store.getters['authStatesModule/lang'])"
                        class="value"
                        notranslate>
                        {{ getDateAndTime(contact.created.time, "DD.MM.YYYY", $store.getters['authStatesModule/lang']) }}
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
                        v-if="contact.updated || updated"
                        class="value"
                        notranslate>
                        {{ getDateAndTime(updated ? new Date() : contact.updated.time, "DD.MM.YYYY", $store.getters['authStatesModule/lang']) }}
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
                @click="showIdentity = !showIdentity">
                <div class="label-copy">Identity</div>
                <div class="section-controls">
                  <button
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
                <form
                  data-vv-scope="profile_form"
                  @submit.prevent="updateOrCreate('profile_form')">
                  <div
                    v-if="!addContact"
                    class="form-group">
                    <div class="col-xs-12 padding-top-6">
                      <label>Id:</label> <var id>{{ contact.id }}</var>
                    </div>
                  </div>
                  <div
                    :class="{ 'has-error' : errors.has('profile_form.email') }"
                    class="form-group row">
                    <div class="col-xs-12">
                      <div>
                        <label for="email">Email</label>
                        <input
                          v-validate="addContact ? 'email|unique' : 'email'"
                          id="email"
                          v-model="contact.contactInfo['email']"
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
                  <div class="form-group row">
                    <div class="col-xs-6">
                      <div class="">
                        <label for="salutation">Salutation</label>
                        <select
                          id="salutation"
                          v-model="contact.primaryInfo.salutation"
                          class="form-control"
                          name="salutation"
                          size="1"
                          data-vv-scope="profile_form">
                          <option
                            value=""
                            disabled
                            hidden/>
                          <option
                            v-for="(sal, salKey) in salutations"
                            :value="sal.text"
                            :key="salKey">
                            {{ sal.text }}
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
                          v-validate="{ required: true, min: 2, max: 50 }"
                          id="first_name"
                          v-model="contact.primaryInfo['firstName']"
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
                          v-validate="{ required: true, min: 2, max: 50 }"
                          id="last_name"
                          v-model="contact.primaryInfo['lastName']"
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
                          v-model="contact.primaryInfo['title']"
                          class="form-control"
                          type="text">
                      </div>
                    </div>
                  </div>
                </form>
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
                          <span class="suggestion_autocomplete">{{ get_icon(item.suggestionType) }}</span>
                        </template>
                      </autocomplete>
                    </div>
                  </div>
                </div>
                <div class="form-group row">
                  <div class="col-xs-6">
                    <div class="">
                      <label for="street">Street</label>
                      <input
                        id="street"
                        v-model="contact.address.street"
                        class="form-control"
                        type="text"
                        name="street"
                        data-vv-scope="profile_form"
                      >
                    </div>
                  </div>
                  <div class="col-xs-6">
                    <div class="">
                      <label for="streetNumber">Street number</label>
                      <input
                        id="streetNumber"
                        v-model="contact.address.streetNumber"
                        class="form-control"
                        type="text"
                        name="streetNumber"
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
                        id="postcode"
                        v-model="contact.address.zip"
                        class="form-control"
                        name="postcode"
                      >
                    </div>
                  </div>
                  <div
                    :class="{ 'has-error' : errors.has('profile_form.cityName') }"
                    class="col-xs-6">
                    <div class="">
                      <label for="cityName">City</label>
                      <input
                        id="cityName"
                        v-model="contact.address.locality"
                        class="form-control"
                        type="text"
                        name="cityName"
                      >
                    </div>
                  </div>
                  <div class="col-xs-3">
                    <div class="">
                      <label for="country">Country</label>
                      <select
                        id="country"
                        v-model="contact.address.countryCode"
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
                <div class="form-group row">
                  <div
                    :class="{ 'has-error' : errors.has('profile_form.phone') }"
                    class="col-xs-12">
                    <div class="">
                      <label for="phone">Phone</label>
                      <the-mask
                        v-validate="{regex: /^(\+41\s+\(0\)\s+[0-9]+[0-9]+\ [0-9]+[0-9]+[0-9]+\ [0-9]+[0-9]+\ [0-9]+[0-9])$/ }"
                        id="phone"
                        v-model="contact.contactInfo.workPhone"
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
                <div class="form-group row">
                  <div
                    :class="{ 'has-error' : errors.has('profile_form.cell') }"
                    class="col-xs-12">
                    <div class="">
                      <label for="cell">Cell</label>
                      <the-mask
                        v-validate="{regex: /^(\+41\s+\(0\)\s+[0-9]+[0-9]+\ [0-9]+[0-9]+[0-9]+\ [0-9]+[0-9]+\ [0-9]+[0-9])$/ }"
                        id="cell"
                        v-model="contact.contactInfo.mobilePhone"
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
                        v-model="contact.contactInfo.skypeName"
                        class="form-control"
                        type="text">
                    </div>
                  </div>
                  <div class="col-xs-6">
                    <div class="">
                      <label for="remarks">Remarks</label>
                      <input
                        id="remarks"
                        v-model="contact.primaryInfo.remarks"
                        class="form-control"
                        type="text"
                      >
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <!-- / Contact Section -->
            <!-- Controls Section -->
            <div
              class="data-section no-border stand-out margin-b-20">
              <div class="section-content">
                <button
                  v-if="addContact"
                  :disabled="$store.getters['globalStatesModule/loadingButton']"
                  class="btn btn-block btn-sm btn-success"
                  type="submit">
                  <i
                    v-if="$store.getters['globalStatesModule/loadingButton']"
                    class="fa fa-circle-o-notch fa-spin"/> Add contact
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
              </div>
            </div>
            <!-- / Controls Section -->
          </form>
        </div>
        <!-- / Tab 1 -->
      </div>
    </div>
  </div>
</template>
