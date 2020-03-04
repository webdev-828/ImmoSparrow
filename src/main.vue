<template>
  <div id="app">
    <div
      v-if="$store.getters['globalStatesModule/pageLoader']"
      id="page-loader"/>
    <notification />
    <div
      v-if="!$route.meta.plainLayout && $store.getters['authStatesModule/userContext']"
      id="page-container"
      :class="{
        'sidebar-mini':!$store.getters['globalStatesModule/sidebar'],
        'sidebar-o-xs': $store.getters['globalStatesModule/sidebar'],
        'mode mode-upgrade-plan': dataNoEmployee
      }"
      class="sidebar-l sidebar-o side-scroll header-navbar-fixed">
      <spinner-loader />
      <navigation />
      <nav-header />
      <router-view/>
      <webgl-warning
        v-if="!webgl"
      />
    </div>
    <nav-footer />
    <div v-if="$route.meta.plainLayout">
      <router-view/>
    </div>
    <feature-modal
      v-if="dataNoEmployee"
      :pageName="dataNoEmployee.pageName"
      :moduleName="dataNoEmployee.moduleName"
      :feature="'basic'"/>
    <modal
      v-show="showUpdateModal"
      ref="modal"
      :modalShow="showUpdateModal">
      <template slot="title">
        <h3 class="block-title">Message</h3>
      </template>
      <template slot="text">
        <span>{{ 'There is a new version '+ version +' of this aplication available. You have to logout and login again to see the changes.' }}</span>
      </template>
      <template slot="slot_actions">
        <button
          class="btn btn-sm btn-primary"
          type="button"
          data-dismiss="modal"
          @click="confirmIAmOkWithUpdate"><i class="fa fa-check"/> Ok
        </button>
      </template>
    </modal>
  </div>
</template>
<style lang="scss">
  @import "./assets/scss/style.scss";
</style>
