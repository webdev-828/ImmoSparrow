<template>
  <aside
    v-if="currentMaster"
    id="sidebar-object-fixed"
    class="active sidebar-shadow">
    <form
      class="side-panel"
      @submit.stop.prevent="validateAndSubmit"
      @keydown.enter.prevent="">
      <div class="flex-head fancy-shadow">
        <div class="detail-header">
          <div class="title">
            <div class="centering-block full-width">
              <var
                v-if="currentMaster.id"
                class="font-w600"
                companyName>
                {{ currentMaster.primaryInfo.companyName }}
              </var>
              <div v-else>
                Add Master
              </div>
            </div>
          </div>
          <div class="controls">
            <button
              v-tooltip.top="{ content: 'Close panel', delay: { show: 700, hide: 100 }}"
              class="btn btn-sm btn-default"
              type="button"
              @click="closeModal('master')">
              <i class="fa fa-close"/>
            </button>
          </div>
        </div>
        <ul class="flex-tabs no-shadow list-unstyled">
          <li class="active">
            <span>Overview</span>
          </li>
        </ul>
      </div>
      <div
        v-bar
        class="flex-scroll">
        <div class="tab-content">
          <div class="tab-pane active">
            <div>
              <!-- Data Section -->
              <div class="data-section stand-out padding-t-10">
                <div class="section-content">
                  <div
                    :class="{'has-error': errors.first('company-name')}"
                    class="form-group">
                    <label for="name">Name</label>
                    <input
                      v-validate="'required'"
                      id="name"
                      v-model="currentMaster.primaryInfo.companyName"
                      name="company-name"
                      class="form-control form-control">
                    <div class="help-block" >
                      {{ errors.first('company-name') }}
                    </div>
                  </div>
                  <div
                    v-if="currentMaster.id"
                    class="form-group">
                    <div class="row">
                      <div class="col-xs-12">
                        <label for="id">ID</label>
                        <input
                          id="id"
                          :value="currentMaster.id"
                          disabled
                          class="form-control form-control ">
                      </div>
                    </div>
                  </div>
                  <div class="form-group">
                    <Address :address="currentMaster.address"/>
                  </div>
                  <div class="row">
                    <div class="form-group col-xs-6">
                      <label for="email">Email</label>
                      <input
                        id="email"
                        v-model="currentMaster.contactInfo.email"
                        class="form-control form-control">
                    </div>
                    <div
                      :class="{'has-error': errors.first('website-url')}"
                      class="form-group col-xs-6">
                      <label for="website">Website</label>
                      <input
                        v-validate="{url: {require_protocol: true }}"
                        id="website"
                        v-model="currentMaster.contactInfo.websiteUrl"
                        name="website-url"
                        class="form-control form-control">
                      <div class="help-block" >
                        {{ errors.first('website-url') }}
                      </div>
                    </div>
                    <div
                      :class="{ 'has-error' : errors.has('phone') }"
                      class="form-group col-xs-6">
                      <label for="phone">Phone</label>
                      <the-mask
                        v-validate="{regex: /^(\+41\s+\(0\)\s+[0-9]+[0-9]+\ [0-9]+[0-9]+[0-9]+\ [0-9]+[0-9]+\ [0-9]+[0-9])$/ }"
                        id="phone"
                        :class="{ 'has-error' : errors.has('phone') }"
                        v-model="currentMaster.contactInfo.phone1"
                        name="phone"
                        class="form-control form-control"
                        masked
                        mask="+41 (0) ## ### ## ##"/>
                      <div
                        v-show="errors.has('phone')"
                        class="help-block text-right animated fadeInDown">{{
                        errors.first('phone') }}
                      </div>
                    </div>
                    <div
                      :class="{ 'has-error' : errors.has('cell') }"
                      class="form-group col-xs-6">
                      <label for="cell">Cell</label>
                      <the-mask
                        v-validate="{regex: /^(\+41\s+\(0\)\s+[0-9]+[0-9]+\ [0-9]+[0-9]+[0-9]+\ [0-9]+[0-9]+\ [0-9]+[0-9])$/ }"
                        id="cell"
                        :class="{ 'has-error' : errors.has('cell') }"
                        v-model="currentMaster.contactInfo.mobilePhone1"
                        name="cell"
                        class="form-control form-control"
                        masked
                        mask="+41 (0) ## ### ## ##"/>
                      <div
                        v-show="errors.has('cell')"
                        class="help-block text-right animated fadeInDown">{{
                        errors.first('cell') }}
                      </div>
                    </div>
                  </div>
                  <div class="form-group">
                    <div class="row">
                      <div class="col-xs-12">
                        <button
                          class="btn btn-sm btn-block btn-success"
                          type="submit">
                          {{ currentMaster.id ? 'Update Master' : 'Add Master' }}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <!-- End Data Section -->
            </div>
          </div>
        </div>
      </div>
    </form>
  </aside>
</template>
