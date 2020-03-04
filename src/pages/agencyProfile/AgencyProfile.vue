<template>
  <main
    id="main-container"
    class="no-head-state no-head-vb">
    <div v-bar>
      <div>
        <div class="content">
          <div class="block">
            <div
              class="block-content"
              style="padding: 0;">
              <div class="flex-header">
                <div class="image-section">
                  <div v-if="userAgency && userAgency.logo">
                    <img
                      :src="apiUrl + userAgency.logo.url"
                      class="uploadedImg"
                      alt="uploaded image">
                  </div>
                  <div v-else>
                    <img
                      class="uploadedImg"
                      src="../../../static/img/icons/Invest inactive.png"
                      alt="Avatar">
                  </div>
                </div>
                <div
                  v-if="userAgency"
                  class="name-section">
                  <div class="font-s18 font-w600"><var
                    agencyname
                    notranslate>{{ userAgency.primaryInfo.name }}</var></div>
                  <div
                    v-if="userAgency.address"
                    class="font-s13">
                    <var
                      address
                      notranslate>{{ userAgency.address.street }} {{ userAgency.address.streetNumber }}, {{ userAgency.address.zip }} {{ userAgency.address.locality }}</var>
                  </div>
                </div>
              </div>
              <div class="fancy-shadow">
                <ul
                  class="flex-tabs list-unstyled no-shadow"
                  style="width: 600px;">
                  <li
                    v-if="isOwner || isAdmin"
                    :class="{active: tabs['profileGlobal']}"
                    @click="toggle('profileGlobal')">
                    <span>Global</span>
                  </li>
                  <li
                    v-if="alphaFeature"
                    :class="{active: tabs['profilePipe']}"
                    @click="toggle('profilePipe')">
                    <span>Pipe<span class="alpha-feature feature-on-text"/></span>
                  </li>
                  <li
                    v-if="alphaFeature"
                    :class="{active: tabs['profileTemplates']}"
                    @click="toggle('profileTemplates')">
                    <span>Templates<span class="alpha-feature feature-on-text"/></span>
                  </li>
                  <!-- <li
                    v-if="alphaFeature"
                    :class="{active: tabs['profileEmail']}"
                    @click="toggle('profileEmail')">
                    <span>Email<span class="alpha-feature feature-on-text"/></span>
                  </li> -->
                </ul>
              </div>
              <Tab1
                v-if="tabs['profileGlobal']"
                :agencyInfo="userAgency" />
              <Tab2 v-if="tabs['profileTemplates']"/>
              <!-- <Tab3 v-if="tabs['profileEmail']"/> -->
              <Tab4
                v-if="tabs['profilePipe']"
                :agencyId="userAgency.id"/>
            </div>
          </div>
        </div>
      </div>
    </div>
  </main>
</template>
