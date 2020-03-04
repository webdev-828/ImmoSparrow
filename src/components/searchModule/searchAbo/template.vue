<template>
  <div class="">
    <modal
      v-show="showIncDecModal"
      ref="modal"
      :modalShow="showIncDecModal">
      <template slot="close">
        <button
          class="btn btn-sm btn-default"
          @click="closeIncDecModal()"><i class="fa fa-close"/></button>
      </template>
      <template slot="title">Min price change</template>
      <template slot="text">
        <div class="form-group margin-b-10">
          <div class="input-group">
            <input
              v-focus
              v-model="minPriceChangePercentage"
              :min="0"
              :max="100"
              :disabled="!isEmpty(minPriceChangeValue) && minPriceChangeValue !== ''"
              name="minPriceChange"
              class="form-control height40"
              type="number"
              placeholder="Percentage"
              @keyup.enter="changeMinPrice()">
            <span class="input-group-addon"> % </span>
          </div>
        </div>
        <div class="form-group margin-b-10">
          <div class="input-group">
            <input
              v-focus
              v-model="minPriceChangeValue"
              :min="0"
              :disabled="!isEmpty(minPriceChangePercentage) && minPriceChangePercentage !== ''"
              name="minPriceChange"
              class="form-control height40"
              type="number"
              placeholder="Amount"
              @keyup.enter="changeMinPrice()">
            <span class="input-group-addon">chf</span>
          </div>
        </div>
      </template>
      <template slot="slot_actions">
        <button
          class="btn btn-sm btn-default"
          type="button"
          data-dismiss="modal"
          @click="closeIncDecModal()"> Cancel
        </button>
        <button
          :disabled="(!minPriceChangePercentage && !minPriceChangeValue) || (minPriceChangePercentage < 1 && minPriceChangeValue < 1)"
          class="btn btn-sm btn-primary"
          type="button"
          data-dismiss="modal"
          @click="changeMinPrice()">Extend
        </button>
      </template>
    </modal>
    <modal
      v-show="showDaysModal"
      ref="modal"
      :modalShow="showDaysModal">
      <template slot="title">Days on market</template>
      <template slot="close">
        <button
          class="btn btn-sm btn-default"
          @click="closeDurationModal()"><i class="fa fa-close"/></button>
      </template>
      <template slot="text">
        <div class="form-group margin-b-10">
          <input
            v-focus
            v-model="durationDays"
            :min="0"
            name="minPriceChange"
            class="form-control height40"
            type="number"
            placeholder="Days"
            @keyup.enter="addDurationDays()">
        </div>
      </template>
      <template slot="slot_actions">
        <button
          class="btn btn-sm btn-default"
          type="button"
          data-dismiss="modal"
          @click="closeDurationModal()"> Cancel
        </button>
        <button
          :disabled="!durationDays || durationDays < 1"
          class="btn btn-sm btn-primary"
          type="button"
          data-dismiss="modal"
          @click="addDurationDays()">Extend
        </button>
      </template>
    </modal>
    <form
      class=""
      data-vv-scope="searchAbo_form"
      @submit.prevent="saveSubscription('searchAbo_form')">
      <div class="">
        <div class="data-section stand-out no-walls">
          <div class="section-label">
            <div class="label-copy">Search Subscription</div>
          </div>
          <div class="section-content">
            <div class="row">
              <div class="col-xs-6">
                <div
                  :class="{ 'has-error' : errors.has('searchAbo_form.subscription name') }"
                  class="form-group margin-b-10">
                  <input
                    v-validate="'required'"
                    v-model="searchSub.name"
                    type="text"
                    data-vv-scope="searchAbo_form"
                    name="subscription name"
                    placeholder="Name of subscription"
                    class="form-control height40">
                  <div
                    v-show="errors.has('searchAbo_form.subscription name')"
                    class="help-block animated fadeInDown req_error">{{
                    errors.first('searchAbo_form.subscription name') }}
                  </div>
                </div>
              </div>
              <div class="col-xs-6">
                <div class="form-group margin-b-10">
                  <div class="form-group margin-b-10">
                    <input
                      v-model="searchSub.description"
                      type="text"
                      placeholder="Description"
                      class="form-control height40">
                  </div>
                </div>
              </div>
              <div class="col-xs-12">
                <div
                  :class="{'has-error': triggersRequired}"
                  class="form-group margin-b-10">
                  <div class="input-group tamed-input-group">
                    <span class="input-group-addon input-icon"><i class="fa fa-cogs"/></span>
                    <multiselect
                      id="criteria"
                      :custom-label="getTriggerName"
                      :options="criteriaOptions"
                      :show-labels="false"
                      :clear-on-select="true"
                      :multiple="false"
                      :limit="1"
                      :limit-text="limitText"
                      :taggable="true"
                      :close-on-select="true"
                      openDirection="bottom"
                      placeholder="Criteria"
                      track-by="type"
                      @input="updateSelectedCriteria"
                    />
                  </div>
                  <div
                    v-if="triggersRequired"
                    class="help-block req_error">This field is required</div>
                </div>
              </div>
              <div class="col-xs-12">
                <div
                  v-if="selectedCriteria.length"
                  class="form-group margin-b-10">
                  <div
                    v-hide-multiselect-elements
                    class="" >
                    <span
                      v-for="(a, index) in selectedCriteria"
                      :key="index"
                      class="multiselect__tag">
                      <i
                        v-if="a.type === 3 || a.type === 4"
                        aria-hidden="true"
                        tabindex="2"
                        class="fa fa-pencil-square-o extendTrigger percentage_hover"
                        @click.stop="priceIncreaseDecrease(index)"/>
                      <i
                        v-if="a.type === 7"
                        aria-hidden="true"
                        tabindex="2"
                        class="fa fa-pencil-square-o extendTrigger percentage_hover"
                        @click.stop="onMarketDays(index)"/>
                      <span @click="removeCriteria(index)">{{ getTriggerName(a) }}</span>
                      <span
                        v-show="(a.type === 3 || a.type === 4) && (!isEmpty(a.change) || !isEmpty(a.changePercentage))"
                        class="percentage_hover"
                        @click="removeMinChange(index)"> by min <var
                          notranslate
                          priceChange>{{ a.change.min ? a.change.min + "chf" : a.changePercentage.min + "%" }}</var> </span>
                      <span
                        v-show="a.type === 7 && !isEmpty(a.change)"
                        class="percentage_hover"
                        @click="removeDurationDays(index)"> - min <var
                          notranslate
                          priceChange>{{ a.change.min ? a.change.min + " days" : "" }}</var> </span>
                      <i
                        aria-hidden="true"
                        tabindex="1"
                        class="multiselect__tag-icon"
                        @click="removeCriteria(index)"/>
                    </span>
                  </div>
                  <div
                    v-remove-multi-tag-holder
                    class="tags_holder_helper">and <span/> more</div>
                  <div
                    v-show-multi-tag-holder
                    class="tags_holder_helper_less">Show less</div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="data-section stand-out no-walls no-z">
          <div class="section-label">
            <div class="label-copy">Create Alert</div>
          </div>
          <div class="section-content">
            <div class="form-group margin-b-10">
              <div class="input-group tamed-input-group">
                <span class="input-group-addon input-icon"><i class="fa fa-user"/></span>
                <multiselect
                  id="contacts"
                  :custom-label="contactsLabel"
                  v-model="selectedContact"
                  :options="contacts.items"
                  :show-labels="false"
                  :close-on-select="true"
                  placeholder="Select existing contact"
                  track-by="id"
                  openDirection="bottom">
                  <template
                    slot="singleLabel"
                    slot-scope="props">
                    <div><span
                      class="option__title"
                      notranslate>{{ props.option.firstName + " " + props.option.lastName }}</span></div>
                  </template>
                  <template
                    slot="option"
                    slot-scope="props" >
                    <div
                      class="option__desc"
                      notranslate
                      @click="showCreateNewContact = false"><span class="option__title">{{ props.option.firstName + " " + props.option.lastName }}</span></div>
                  </template>
                </multiselect>
              </div>
            </div>
            <div class="form-group margin-b-10">
              <span
                class="create-contact"
                @click="createNewCon()"><i :class="!showCreateNewContact || selectedContact ? 'fa fa-plus' : 'fa fa-minus'"/><h6 class="padding-l-10">Create new contact</h6></span>
            </div>
            <div
              v-if="showCreateNewContact && !selectedContact"
              class="animated fadeIn">
              <div class="row">
                <div class="col-xs-6">
                  <div class="form-group margin-b-10">
                    <div class="input-group tamed-input-group">
                      <span class="input-group-addon input-icon"><i class="fa fa-handshake-o"/></span>
                      <multiselect
                        id="salutation"
                        v-model="selectedSal"
                        :options="salutations"
                        :show-labels="false"
                        :close-on-select="true"
                        placeholder="Salutation"
                        label="text"
                        track-by="value"
                        openDirection="bottom"/>
                    </div>
                  </div>
                  <div class="form-group margin-b-10">
                    <input
                      v-validate="'required|min:2|max:50'"
                      v-model="newContact.primaryInfo.firstName"
                      type="text"
                      data-vv-scope="searchAbo_form"
                      placeholder="First Name"
                      name="first name"
                      class="form-control height40">
                    <div
                      v-show="errors.has('searchAbo_form.first name')"
                      class="help-block animated fadeInDown req_error">{{
                      errors.first('searchAbo_form.first name') }}
                    </div>
                  </div>
                  <div class="form-group margin-b-10">
                    <input
                      v-validate="'required|min:2|max:50'"
                      v-model="newContact.primaryInfo.lastName"
                      type="text"
                      placeholder="Last Name"
                      data-vv-scope="searchAbo_form"
                      name="last name"
                      class="form-control height40">
                    <div
                      v-show="errors.has('searchAbo_form.last name')"
                      class="help-block animated fadeInDown req_error">{{
                      errors.first('searchAbo_form.last name') }}
                    </div>
                  </div>
                </div>
                <div class="col-xs-6">
                  <div class="form-group margin-b-10">
                    <the-mask
                      v-validate="{regex: /^(\+41\s+\(0\)\s+[0-9]+[0-9]+\ [0-9]+[0-9]+[0-9]+\ [0-9]+[0-9]+\ [0-9]+[0-9])$/ }"
                      v-model="newContact.contactInfo.mobilePhone"
                      type="text"
                      placeholder="Phone"
                      class="form-control"
                      name="mobilePhone"
                      data-vv-scope="searchAbo_form"
                      style="height: 42px;"
                      masked
                      mask="+41 (0) ## ### ## ##"/>
                    <div
                      v-show="errors.has('searchAbo_form.last name')"
                      class="help-block animated fadeInDown req_error">{{
                      errors.first('searchAbo_form.mobilePhone') }}
                    </div>
                  </div>
                  <div class="form-group margin-b-10">
                    <input
                      v-validate="'email'"
                      v-model="newContact.contactInfo.email"
                      type="text"
                      placeholder="Email"
                      data-vv-scope="searchAbo_form"
                      name="email"
                      class="form-control height40">
                    <div
                      v-show="errors.has('searchAbo_form.email')"
                      class="help-block animated fadeInDown req_error">{{
                      errors.first('searchAbo_form.email') }}
                    </div>
                  </div>
                  <div class="form-group margin-b-10">
                    <input
                      v-model="newContact.address.street"
                      type="text"
                      placeholder="Street"
                      class="form-control height40">
                  </div>
                  <div class="form-group margin-b-10">
                    <input
                      v-model="newContact.address.streetNumber"
                      type="text"
                      placeholder="Street number"
                      class="form-control height40">
                  </div>
                  <div class="form-group row">
                    <div class="col-sm-6">
                      <input
                        v-model="newContact.address.zip"
                        type="text"
                        placeholder="Zip"
                        class="form-control height40">
                    </div>
                    <div class="col-sm-6">
                      <input
                        v-model="newContact.address.locality"
                        type="text"
                        placeholder="Locality"
                        class="form-control height40">
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="data-section stand-out no-walls no-z">
          <div class="section-label">
            <div class="label-copy">Inbox Initialization</div>
            <div class="section-controls">
              <div
                class="dropdown"
                style="display: inline;">
                <button
                  notranslate
                  class="btn btn-sm btn-default button-dropdown"
                  type="button">
                  i
                </button>
                <ul
                  class="dropdown-menu top-150 dropdown-menu-right fancy-shadow width-270"
                  aria-labelledby="dropdownMenu3">
                  <li>
                    <div class="font-s12 padding-10">
                      Maximum number of pre-existing ads that should appear in this subscription (old active ads). Enter 0 to include only ads that are published as of now. <br >
                      <div class="font-s11 margin-t-10">
                        <strong>Note:</strong> This limitation only refers to the initial load of ads in your inbox. The number of ads you will receive in the future will not be affected.
                      </div>
                    </div>
                  </li>
                </ul>
              </div>
            </div>
          </div>
          <div class="section-content">
            <div class="row">
              <div class="col-xs-12">
                <div
                  :class="{ 'has-error' : errors.has('searchAbo_form.max items') }"
                  class="form-group margin-b-10">
                  <input
                    v-validate="{ numeric: true, min_value: 0, max_value: 1000 }"
                    v-focus
                    v-model="searchSub.maxInitialLeadCount"
                    name="max items"
                    class="form-control height40"
                    data-vv-scope="searchAbo_form"
                    type="number"
                    placeholder="Maximum inbox items">
                  <div
                    v-show="errors.has('searchAbo_form.max items')"
                    class="help-block animated fadeInDown req_error">{{
                    errors.first('searchAbo_form.max items') }}
                  </div>
                </div>
              </div>
            </div>
            <div class="form-group margin-b-10">
              <div :class="{ 'padding-t-0': showCreateNewContact }">
                <div class="text-right">
                  <button
                    :disabled="loading"
                    class="btn btn-sm btn-default"
                    type="button"
                    @click="$root.$emit('closeModal')">
                    Close
                  </button>
                  <button
                    v-if="$route.params.subId && !showCreateNewContact && checkIfContactSub()"
                    :disabled="updatingSub"
                    class="btn btn-sm btn-info"
                    type="submit"
                    @click="updateSub = true">
                    <i
                      v-if="updatingSub && updateSub"
                      class="fa fa-circle-o-notch fa-spin"/> Update
                  </button>
                  <button
                    :disabled="loading"
                    class="btn btn-sm btn-success"
                    type="submit"
                    @click="updateSub = false">
                    <i
                      v-if="loading && !updateSub"
                      class="fa fa-circle-o-notch fa-spin"/> {{ $route.params.subId ? "Save as new" : "Save" }}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </form>
  </div>
</template>
<script>
</script>
