<template>
  <div class="tab-pane active padding-b-20">
    <div>
      <basic-info
        :item="item"
        @openDetailView="openDetailView"/>
      <form
        id="objectInfoForm"
        data-vv-scope="objectInfoForm"
        @submit.prevent="updateObjectInfo('objectInfoForm')">
        <!-- Contact Section -->
        <div class="data-section stand-out">
          <div
            class="section-label cursor-show"
            @click="showContactInfo=!showContactInfo">
            <div class="label-copy">Contact Info</div>
            <div class="section-controls">
              <button
                v-tooltip.top="{ content: 'Toggle section', delay: { show: 700, hide: 100 }}"
                class="btn btn-sm btn-default"
                type="button">
                <i
                  :class="{'fa-angle-up': showContactInfo, 'fa-angle-down': !showContactInfo}"
                  class="fa"/>
              </button>
            </div>
          </div>
          <div
            v-if="showContactInfo && val(item, item => item.entityModifiableInfo)"
            class="section-content">
            <div class="form-group">
              <div class="row margin-b-10">
                <div
                  :class="{'has-error': errors.has('objectInfoForm.organization name')}"
                  class="col-xs-12">
                  <label for="phone">Organization Name</label>
                  <input
                    v-validate="{ max: 100 }"
                    v-model="item.entityModifiableInfo.contactInfo.organizationName"
                    notranslate
                    type="text"
                    class="form-control"
                    name="organization name"
                    data-vv-scope="objectInfoForm">
                  <div
                    v-show="errors.has('objectInfoForm.organization name')"
                    class="help-block">{{ errors.first('objectInfoForm.organization name') }}
                  </div>
                </div>
              </div>
              <div class="row margin-b-10">
                <div
                  :class="{'has-error': errors.has('objectInfoForm.person name')}"
                  class="col-xs-12">
                  <label for="phone">Person Name</label>
                  <input
                    v-validate="{ max: 100 }"
                    v-model="item.entityModifiableInfo.contactInfo.personalName"
                    notranslate
                    type="text"
                    class="form-control"
                    name="person name"
                    data-vv-scope="objectInfoForm">
                  <div
                    v-show="errors.has('objectInfoForm.person name')"
                    class="help-block">{{ errors.first('objectInfoForm.person name') }}
                  </div>
                </div>
              </div>
              <div class="row margin-b-10">
                <div
                  :class="{'has-error': errors.has('objectInfoForm.email')}"
                  class="col-xs-12">
                  <label for="email">Email</label>
                  <input
                    v-validate="'email|max:256'"
                    v-model="item.entityModifiableInfo.contactInfo.contactInfo.email"
                    notranslate
                    type="text"
                    class="form-control"
                    name="email"
                    data-vv-scope="objectInfoForm">
                  <div
                    v-show="errors.has('objectInfoForm.email')"
                    class="help-block">{{ errors.first('objectInfoForm.email') }}
                  </div>
                </div>
              </div>
            </div>
            <Address
              :formScope="'objectInfoForm'"
              :address="item.entityModifiableInfo.contactInfo.address"
              :fullScreen="false"/>
            <div
              v-if="val(item, item => item.entityModifiableInfo.contactInfo.contactInfo)"
              class="form-group">
              <div class="row margin-b-10">
                <div
                  class="col-xs-12"> <!-- has-error -->
                  <label for="phone">Phone</label>
                  <the-mask
                    id="phone"
                    v-model="item.entityModifiableInfo.contactInfo.contactInfo.workPhone"
                    notranslate
                    class="form-control"
                    name="phone"
                    data-vv-scope="objectInfoForm"
                    masked
                    mask="+41 (0) ## ### ## ##"/>
                    <!-- <div
                      class="help-block text-right animated fadeInDown">Enter valid phone number
                    </div> -->
                </div>
              </div>
              <div class="row margin-b-10">
                <div
                  class="col-xs-12">
                  <label for="cell">Cell</label>
                  <the-mask
                    id="cell"
                    v-model="item.entityModifiableInfo.contactInfo.contactInfo.mobilePhone"
                    notranslate
                    class="form-control"
                    name="cell"
                    data-vv-scope="profile_form"
                    masked
                    mask="+41 (0) ## ### ## ##"/>
                </div>
              </div>
              <div class="row margin-b-10">
                <div class="col-xs-12">
                  <label for="url">Website</label>
                  <input
                    id="url"
                    v-model="item.entityModifiableInfo.contactInfo.contactInfo.websiteUrl"
                    notranslate
                    class="form-control"
                    type="text"
                  >
                </div>
              </div>
              <div class="row margin-b-10">
                <div class="col-xs-12">
                  <label for="remarks">Remarks</label>
                  <input
                    id="remarks"
                    v-model="item.entityModifiableInfo.contactInfo.remarks"
                    notranslate
                    class="form-control"
                    type="text"
                  >
                </div>
              </div>
            </div>
          </div>
        </div>
        <!-- / Contact Section -->
        <!-- Cutom Section -->
        <div
          class="data-section stand-out">
          <div
            class="section-label cursor-show"
            @click="showCustomContactInfo=!showCustomContactInfo">
            <div class="label-copy">Custom Data</div>
            <div class="section-controls">
              <button
                :disabled="item.isDeleted"
                type="button"
                class="btn btn-sm btn-success"
                @click.stop="addContactField=!addContactField"><i class="fa fa-plus"/> Add Field</button>
              <button
                v-tooltip.top="{ content: 'Toggle section', delay: { show: 700, hide: 100 }}"
                class="btn btn-sm btn-default"
                type="button">
                <i
                  :class="{'fa-angle-up': showCustomContactInfo, 'fa-angle-down': !showCustomContactInfo}"
                  class="fa"/>
              </button>
            </div>
          </div>
          <div
            v-if="showCustomContactInfo"
            class="section-content">
            <div
              v-if="val(item, item => item.entityModifiableInfo.contactInfo.customFields)"
              class="row margin-b-10">
              <div
                v-for="(field, fieldKey) in item.entityModifiableInfo.contactInfo.customFields"
                :key="fieldKey"
                class="col-xs-12">
                <label notranslate>{{ field.name }}</label>
                <div class="input-group">
                  <input
                    v-model="field.value"
                    notranslate
                    type="text"
                    class="form-control">
                  <span class="input-group-btn">
                    <button
                      class="btn btn-default"
                      type="button"
                      @click="deleteContactField(field)"><i class="fa fa-close"/></button>
                  </span>
                </div>
              </div>
            </div>
            <div
              v-if="addContactField"
              class="stand-plate bg-warning-light fancy-shadow">
              <div class="plate-title">Add Field</div>
              <form
                id="addContactField"
                data-vv-scope="addContactField"
                @submit.prevent="addNewContactField('addContactField')">
                <div class="plate-content">
                  <div
                    :class="{'has-error': errors.has('addContactField.name')}"
                    class="form-group">
                    <label>Name</label>
                    <input
                      v-validate="{ required: true, max: 50 }"
                      v-model="contactField.name"
                      name="name"
                      data-vv-scope="addContactField"
                      notranslate
                      type="text"
                      class="form-control input-sm">
                    <div
                      v-show="errors.has('addContactField.name')"
                      class="help-block">{{ errors.first('addContactField.name') }}
                    </div>
                  </div>
                  <div class="form-group">
                    <label>Value</label>
                    <input
                      v-model="contactField.value"
                      notranslate
                      type="text"
                      class="form-control input-sm">
                  </div>
                </div>
                <div class="plate-controls">
                  <button
                    type="button"
                    class="btn btn-sm btn-default"
                    @click="cancelContactField()">Cancel</button>
                  <button
                    type="submit"
                    class="btn btn-sm btn-success">Add new Field</button>
                </div>
              </form>
            </div>
          </div>
        </div>
        <!-- / Cutom Section -->
        <!-- Buttons Section -->
        <div class="data-section">
          <div
            class="section-content padding-t-10">
            <div class="form-group">
              <button
                :disabled="updatingEntry || item.isDeleted"
                type="submit"
                class="btn btn-block btn-sm btn-success">
                <i
                  v-if="updatingEntry"
                  class="fa fa-circle-o-notch fa-spin"/> Update</button>
            </div>
          </div>
        </div>
      </form>
      <!-- / Buttons Section -->
    </div>
  </div>
</template>
