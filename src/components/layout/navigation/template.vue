<template>
  <div
    v-close-rightSidebar
    id="cssmenu"
    :class="{'collapsed': !menucollapsed}"
    class="small">
    <button
      class="btn btn-block btn-lg btn-link text-white visible-xs visible-sm"
      type="button"
      @click="menucollapsed=!menucollapsed">
      <i
        :class="{'fa-close': !menucollapsed, 'fa-bars': menucollapsed}"
        class="fa"/>
    </button>
    <ul @click="menucollapsed=true">
      <li>
        <router-link
          to="/"
          class="h5 text-white padding-l-15 hidden-xs hidden-sm">
          <img
            src="../../../assets/favicons/favicon-32x32.png"
            alt="ImmoSparrow"
            title="ImmoSparrow">
        </router-link>
      </li>
      <li
        v-show-submenu
        v-if="$store.getters['authStatesModule/userContext'] && ($store.getters['authStatesModule/userContext'].access.globalPermissions.agencies.readList || $store.getters['authStatesModule/userContext'].access.globalPermissions.users.readList)"
        class="has-sub">
        <a href="javascript: void(0)">
          <!-- <img
            :src="$route.path === '/users' || $route.path === '/agencies' || $route.path === '/legal-person' ? '../../../../static/img/icons/settings.png' : '../../../../static/img/icons/settings inactive.png'"
            class="menuIcons"> -->
          <span
            :class="$route.path === '/users' || $route.path === '/agencies' || $route.path === '/vendors' ? 'active' : 'inactive'"
            class="menu-icon icon-admin"/>
        </a>
        <ul
          v-if="$store.getters['authStatesModule/userContext'].access.globalPermissions.users.readList || $store.getters['authStatesModule/userContext'].access.globalPermissions.agencies.readList"
          class="sub">
          <li>
            <a
              href="javascript: void(0)"
              class="lead_item has_submenu"><span>Admin</span></a>
            <router-link
              v-if="$store.getters['authStatesModule/userContext'].access.globalPermissions.agencies.readList"
              :exact="true"
              to="/agencies"
              class="text-white">
              <span class="sidebar-mini-hide">Agencies</span>
            </router-link>
            <router-link
              :exact="true"
              to="/ms-regions"
              class="text-white">
              <span class="sidebar-mini-hide">MS-Regions</span>
            </router-link>
            <router-link
              v-if="$store.getters['authStatesModule/userContext'].access.globalPermissions.users.readList"
              :exact="true"
              to="/users"
              class="text-white">
              <span class="sidebar-mini-hide">Users</span>
            </router-link>
            <!-- <router-link
              :exact="true"
              to="/vendors"
              class="text-white">
              <span class="sidebar-mini-hide">Vendors</span>
            </router-link> -->
            <router-link
              v-if="alphaFeature"
              :exact="true"
              to="/api-user"
              class="text-white">
              <span class="sidebar-mini-hide alpha-feature feature-on-text">API-User</span>
            </router-link>
          </li>
        </ul>
      </li>
      <li
        v-show-submenu
        v-if="isAdmin || $store.getters['authStatesModule/userContext'].access.globalPermissions.users.readList || $store.getters['authStatesModule/userContext'].access.globalPermissions.agencies.readList"
        v-show="($store.getters['authStatesModule/userAgency'] && $store.getters['authStatesModule/userAgency'].access &&
          ($store.getters['authStatesModule/userAgency'].access.profile.read ||
          $store.getters['authStatesModule/userAgency'].access.employees.readList)) &&
        ($store.getters['adminStates/agency'] && $store.getters['adminStates/agency'].primaryInfo.name)"
        class="has-sub">
        <a href="#">
          <span
            :class="$route.path === '/employees' || $route.path === '/agencyProfile' || $route.path === '/wizard' ? 'active' : 'inactive'"
            class="menu-icon icon-agency"/>
        </a>
        <ul class="sub">
          <li>
            <a
              href="javascript: void(0)"
              class="lead_item has_submenu">
              <var
                notranslate
                agencyName>
                {{ $store.getters['adminStates/agency'] ? $store.getters['adminStates/agency'].primaryInfo['name'] : "" }}
              </var>
            </a>
            <router-link
              v-if="$store.getters['authStatesModule/userAgency'].access.profile.read"
              :exact="true"
              to="/agencyProfile"
              class="text-white">
              <span class="sidebar-mini-hide">Profile</span>
            </router-link>
            <router-link
              :exact="true"
              to="/teams"
              class="text-white">
              <span class="sidebar-mini-hide">Teams</span>
            </router-link>
            <router-link
              v-show="alphaFeature"
              :exact="true"
              to="/performance"
              class="text-white">
              <span class="sidebar-mini-hide margin-r-5"><span class="alpha-feature feature-on-text">Performance</span></span>
            </router-link>
            <router-link
              v-if="$store.getters['authStatesModule/userAgency'].access.employees.readList"
              :exact="true"
              to="/employees"
              class="text-white">
              <span class="sidebar-mini-hide">Employees</span>
            </router-link>
          </li>
        </ul>
      </li>
      <!-- <li
        v-show-submenu
        v-if="alphaFeature"
        class="has-sub rest">
        <router-link
          :exact="true"
          to="/notificationCenter">
          <span class="alpha-feature feature-on-block">
            <i
              :class="[($route.path === '/notificationCenter' ? 'active' : 'inactive'), (notificationIn ? 'animated swing' : '')]"
              class="menu-icon fa fa-bell-o"/>
          </span>
          <span
            :class="notificationIn ? 'animated rubberBand' : ''"
            class="badge badge-danger">
            <span v-if="notificationIn">16</span>
            <span v-else>15</span>
          </span>
        </router-link>
        <ul class="sub">
          <li>
            <router-link
              :exact="true"
              to="/notificationCenter"
              style="cursor: pointer;">
              <span
                class="sidebar-mini-hide"
                @click="incomingNotification()">Notification Center</span>
            </router-link>
          </li>
        </ul>
      </li> -->
      <li
        v-show-submenu
        class="has-sub rest">
        <router-link
          :exact="true"
          to="/">
          <span
            :class="$route.path === '/' ? 'active' : 'inactive'"
            class="menu-icon icon-dashboard"/>
        </router-link>
        <ul class="sub">
          <li>
            <router-link
              :exact="true"
              to="/"
              style="cursor: pointer;" >
              <span
                class="sidebar-mini-hide">Dashboard</span>
            </router-link>
          </li>
        </ul>
      </li>
      <li
        v-show-submenu
        v-if="alphaFeature"
        class="has-sub">
        <router-link
          :exact="true"
          to="/portfolio">
          <span class="alpha-feature feature-on-block">
            <i
              :class="$route.path === '/portfolio' ? 'active' : 'inactive'"
              class="menu-icon icon-portfolio"
              style="font-size: 26px;"/>
          </span>
        </router-link>
        <ul class="sub">
          <li>
            <router-link
              :exact="true"
              to="/portfolio"
              style="cursor: pointer;" >
              <span
                class="sidebar-mini-hide alpha-feature feature-on-text">Portfolio</span>
            </router-link>
          </li>
          <li>
            <router-link
              :exact="true"
              to="/monitoring"
              style="cursor: pointer;" >
              <span
                class="sidebar-mini-hide alpha-feature feature-on-text">Monitoring</span>
            </router-link>
          </li>
        </ul>
      </li>
      <li
        v-show-submenu
        class="has-sub">
        <router-link
          :exact="true"
          to="/search"
          style="padding-bottom: 12px;">
          <span
            :class="$route.path === '/search' ? 'active' : 'inactive'"
            class="menu-icon si si-magnifier"
            style="font-size: 23px;"/>
        </router-link>
        <ul class="sub">
          <li>
            <router-link
              :exact="true"
              to="/search"
              style="cursor: pointer;">
              Search
            </router-link>
          </li>
        </ul>
      </li>

      <li
        v-show-submenu
        class="has-sub">
        <a href="#">
          <span
            :class="$route.path === '/inbox' || $route.path === '/contacts' ? 'active' : 'inactive'"
            class="menu-icon icon-inbox"/>
        </a>
        <ul class="sub">
          <li>
            <a
              href="javascript: void(0)"
              class="lead_item has_submenu">Leads</a>
            <router-link
              :exact="true"
              to="/inbox"
              class="text-white">
              <span class="sidebar-mini-hide">Inbox</span>
            </router-link>
            <router-link
              :exact="true"
              to="/contacts"
              class="text-white">
              <span class="sidebar-mini-hide">Contacts</span>
            </router-link>
          </li>
        </ul>
      </li>

      <li
        v-show-submenu
        v-if="betaFeature"
        class="has-sub">
        <a href="#">
          <span
            class="beta-feature feature-on-text"
            style="display: inline-block; height: 24px;">
            <i
              :class="$route.path === '/pipe' || $route.path === '/activities' ? 'active' : 'inactive'"
              class="menu-icon icon-pipe"/>
          </span>
        </a>
        <ul class="sub ">
          <li>
            <a
              href="javascript: void(0)"
              class="lead_item has_submenu">Pipe/Activities</a>
            <router-link
              :exact="true"
              to="/pipe"
              class="text-white">
              <span class="sidebar-mini-hide margin-r-5 beta-feature feature-on-text">Pipe</span>
            </router-link>
            <router-link
              :exact="true"
              to="/activities"
              class="text-white">
              <span class="sidebar-mini-hide margin-r-5 beta-feature feature-on-text">Activities</span>
            </router-link>
          </li>
        </ul>
      </li>

      <li
        v-show-submenu
        v-if="betaFeature"
        class="has-sub">
        <router-link
          :exact="true"
          to="/market-radar-address">
          <span class="beta-feature feature-on-block">
            <i
              :class="$route.path === '/market-radar-address' ? 'active' : 'inactive'"
              class="menu-icon icon-marketradar"/>
          </span>
        </router-link>
        <ul class="sub">
          <li>
            <a
              href="javascript: void(0)"
              class="lead_item has_submenu">Market radar</a>
            <router-link
              :exact="true"
              to="/market-radar-address"
              class="text-white">
              <span class="sidebar-mini-hide margin-r-5"><span class="beta-feature feature-on-text">Address</span></span>
            </router-link>
            <router-link
              v-if="alphaFeature"
              :exact="true"
              to="/market-radar-overall"
              class="text-white">
              <span class="sidebar-mini-hide alpha-feature feature-on-text">Overall</span>
            </router-link>
            <!-- <router-link to="/areas" :exact="true" class="text-white">
              <span class="sidebar-mini-hide">Areas</span>
            </router-link> -->
          </li>
        </ul>
      </li>
      <!--<li class="has-sub" v-show-submenu>
        <a href="#">
          <img class="menuIcons"
               :src="$route.path === '/transparency' ? '../../../../static/img/icons/Transparency.png' : '../../../../static/img/icons/Transparency inactive.png'"/>
        </a>
        <ul class="sub">
          <li>
            <a href="javascript: void(0)" class="lead_item has_submenu">Real Estate</a>
            <router-link to="/transparency" :exact="true" class="text-white">
              <span class="sidebar-mini-hide">transparency</span>
            </router-link>
          </li>
        </ul>
      </li>-->

      <li
        v-show-submenu
        class="has-sub">
        <router-link
          :exact="true"
          to="/price-prediction">
          <span
            :class="$route.path === '/price-prediction' ? 'active' : 'inactive'"
            class="menu-icon icon-priceprediction"/>
        </router-link>
        <!--<ul class="sub">
          <li>
            <router-link to="/price-prediction" :exact="true">
              Price Prediction
            </router-link>
          </li>
        </ul>-->
        <ul class="sub">
          <li>
            <a
              href="javascript: void(0)"
              class="lead_item has_submenu">Real Estate</a>
            <router-link
              :exact="true"
              to="/price-prediction">
              Price Prediction
            </router-link>
          </li>
        </ul>
      </li>

      <li
        v-show-submenu
        v-if="alphaFeature"
        class="has-sub">
        <router-link
          :exact="true"
          to="/surface">
          <span class="alpha-feature feature-on-block">
            <i
              :class="$route.path === '/surface' ? 'active' : 'inactive'"
              class="menu-icon icon-surface"/>
          </span>
        </router-link>
        <ul class="sub">
          <li>
            <router-link
              :exact="true"
              to="/surface"
              style="cursor: pointer;" >
              <span
                class="sidebar-mini-hide alpha-feature feature-on-text">Surface</span>
            </router-link>
          </li>
        </ul>
      </li>

    </ul>
  </div>
</template>
