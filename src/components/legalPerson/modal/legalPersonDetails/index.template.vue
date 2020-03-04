<template>
  <aside
    id="sidebar-object-fixed"
    class="active sidebar-shadow">
    <div class="side-panel">
      <div class="flex-head fancy-shadow">
        <div class="detail-header">
          <div class="title">
            <div class="centering-block full-width">
              <var
                class="font-w600"
                companyName>{{ legalPerson.primaryInfo.companyName }}</var>
            </div>
          </div>
          <div class="controls">
            <button
              v-tooltip.top="{ content: 'Close panel', delay: { show: 700, hide: 100 }}"
              class="btn btn-default"
              type="button"
              @click="closeModal('legal')">
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
                  <div class="form-group">
                    <div class="row">
                      <div class="col-xs-12">
                        <label for="name">Name</label>
                        <input
                          id="name"
                          :value="legalPerson.primaryInfo.companyName"
                          class="form-control input-sm"
                          disabled>
                      </div>
                    </div>
                  </div>
                  <div class="form-group">
                    <div class="row">
                      <div class="col-xs-12">
                        <label for="id">ID</label>
                        <input
                          id="id"
                          :value="legalPerson.id"
                          class="form-control input-sm"
                          disabled>
                      </div>
                    </div>
                  </div>
                  <div class="form-group">
                    <div class="row margin-smaller">
                      <div class="col-xs-6 col-margin-smaller">
                        <label for="street">Street</label>
                        <input
                          id="street"
                          :value="legalPerson.address.street"
                          class="form-control input-sm"
                          disabled>
                      </div>
                      <div class="col-xs-6 col-margin-smaller">
                        <label for="streetNumber">Street number</label>
                        <input
                          id="streetNumber"
                          :value="legalPerson.address.streetNumber"
                          class="form-control input-sm"
                          disabled>
                      </div>
                    </div>
                  </div>
                  <div class="form-group">
                    <div class="row margin-smaller">
                      <div class="col-xs-5 col-margin-smaller">
                        <label for="cityName">City</label>
                        <input
                          id="cityName"
                          :value="legalPerson.address.locality"
                          class="form-control input-sm"
                          disabled>
                      </div>
                      <div class="col-xs-3 col-margin-smaller">
                        <label for="postcode">Zip</label>
                        <input
                          id="postcode"
                          :value="legalPerson.address.zip"
                          class="form-control input-sm"
                          disabled>
                      </div>
                      <div class="col-xs-4 col-margin-smaller">
                        <label for="country">Country</label>
                        <input
                          id="country"
                          :value="legalPerson.address.countryCode"
                          class="form-control input-sm"
                          disabled>
                      </div>
                    </div>
                  </div>
                  <div class="form-group">
                    <div class="row">
                      <div class="col-xs-12">
                        <label for="email">Email</label>
                        <input
                          id="email"
                          :value="legalPerson.contactInfo.email"
                          class="form-control input-sm"
                          disabled>
                      </div>
                    </div>
                  </div>
                  <div class="form-group">
                    <div class="row">
                      <div class="col-xs-12">
                        <label for="website">Website</label>
                        <input
                          id="website"
                          :value="legalPerson.contactInfo.websiteUrl"
                          class="form-control input-sm"
                          disabled>
                      </div>
                    </div>
                  </div>
                  <div class="form-group">
                    <div class="row">
                      <div class="col-xs-12">
                        <label for="phone">Phone</label>
                        <input
                          id="phone"
                          :value="legalPerson.contactInfo.mobilePhone1"
                          class="form-control input-sm"
                          disabled>
                      </div>
                    </div>
                  </div>
                  <div class="form-group">
                    <div class="row">
                      <div class="col-xs-12">
                        <label for="cell">Cell</label>
                        <input
                          id="cell"
                          :value="legalPerson.contactInfo.phone1"
                          class="form-control input-sm"
                          disabled>
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
    </div>
  </aside>
</template>
