<template>
  <main
    id="main-container"
    class="no-head-state no-head-vb">
    <div v-bar>
      <div>
        <div class="content bg-gray-lighter">
          <div class="block">
            <div
              class="block-content"
              style="padding: 0;">
              <div class="flex-header">
                <div class="image-section">
                  <div v-if="shortInfo.url">
                    <img
                      :src="apiUrl + shortInfo.url"
                      class="uploadedImg"
                      alt="uploaded image">
                  </div>
                  <div v-else>
                    <img
                      class="uploadedImg"
                      src="../../../static/img/avatars/avatar10.jpg"
                      alt="Avatar">
                  </div>
                </div>
                <div
                  v-if="shortInfo"
                  class="name-section">
                  <div class="font-s18 font-w600"><var username>{{ shortInfo.firstName }} {{ shortInfo.lastName }}</var></div>
                </div>
              </div>
              <div class="fancy-shadow">
                <ul
                  class="flex-tabs list-unstyled no-shadow"
                  style="width: 600px;">
                  <li
                    :class="{active: tabs['profileGlobal']}"
                    @click="toggle('profileGlobal')">
                    <span>Global</span>
                  </li>
                  <li
                    :class="{active: tabs['updatePassword']}"
                    @click="toggle('updatePassword')">
                    <span>Update password</span>
                  </li>
                  <li
                    :class="{active: tabs['profileLead']}"
                    @click="toggle('profileLead')">
                    <span>Lead</span>
                  </li>
                  <!-- <li
                    v-if="alphaFeature"
                    :class="{active: tabs['profileTemplates']}"
                    @click="toggle('profileTemplates')">
                    <span>Templates<span class="alpha-feature feature-on-text"/></span>
                  </li>
                  <li
                    v-if="alphaFeature"
                    :class="{active: tabs['profileEmail']}"
                    @click="toggle('profileEmail')">
                    <span>Email<span class="alpha-feature feature-on-text"/></span>
                  </li> -->
                </ul>
              </div>
              <tab1
                v-if="tabs['profileGlobal']"
                :user="user"
                :setShortInfo="setShortInfo"
                class="tabs-content padding-20"/>
              <tab2
                v-if="tabs['updatePassword']"
                class="tabs-content padding-20"/>
              <tab3
                v-if="tabs['profileLead']"
                :updateUserData="updateUserData"
                :notificationSettings="user.notificationSettings"
                class="tabs-content padding-20"/>
              <tab4
                v-if="tabs['profileTemplates']"
                class="tabs-content padding-20"/>
              <tab5
                v-if="tabs['profileEmail']"
                class="tabs-content padding-20"/>
            </div>
          </div>
        </div>
      </div>
    </div>
  </main>
</template>
