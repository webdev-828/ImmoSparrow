<template>
  <div
    v-if="loaded"
    class="searchSidebar">
    <aside
      id="side-overlay"
      class="active">
      <button
        class="back-button-extra btn btn-default pull-right side-overlay--button"
        type="button"
        @click="searchSidebarToggle()">
        <i class="arrow"/>
      </button>
      <div class="pull-right side-overlay--button nav_h">
        <a
          :class="{active: tabs['search']}"
          class="btn"
          @click="toggle('search')">
          <span class="si si-magnifier"/>
        </a><br>
        <a
          :class="{active: tabs['bookmarks']}"
          class="btn"
          @click="toggle('bookmarks')">
          <span class="si si-star"/>
        </a><br>
        <a
          :class="{active: tabs['history']}"
          class="btn"
          @click="toggle('history')">
          <span class="si si-reload"/>
        </a><br>
        <a
          :class="{active: tabs['docs']}"
          class="btn"
          @click="toggle('docs')">
          <span class="si si-doc"/>
        </a><br>
      </div>
      <div
        v-bar
        class="side-overlay--inner">
        <div>
          <div class="side-content remove-padding-t">
            <div
              :class="{'hidden':!tabs['search']}"
              class="block-content tab-content">
              <div class="tab-pane fade fade-right in active">
                <div class="block pull-r-l">
                  <div class="block-content block-content-narrow">
                    <form
                      class="form-horizontal push-10-t"
                      data-vv-scope="profile_form" >
                      <h2 class="content-heading">
                      <i class="fa fa-map-marker"/> Search</h2>
                      <div class="form-group">
                        <div class="col-xs-12">
                          <div class="input-group">
                            <span class="input-group-addon ch">
                              <i class="fa fa-map-marker"/>
                            </span>

                            <autocomplete
                              ref="autocomplete_search"
                              :setData="setStreet"
                              :onSearch="getSearchSuggestions"
                              :itemHighlighted="'highlightedName'"
                              class="ac"/>
                          </div>
                          <span v-if="transparencyAddress.name != undefined">
                            <span
                              :key="transparencyAddress.uniqueidentifier"
                              class="multiselect__tag">
                              <span>
                                <i
                                  v-show="$store.getters['searchStatesModule/addressLoading']"
                                  class="fa fa-circle-o-notch fa-spin"/>
                                <span
                                  class="mouse-pointer"
                                  @click="setStreet(transparencyAddress, 200)">{{ transparencyAddress.name }}</span>
                              </span>
                              <i
                                aria-hidden="true"
                                tabindex="1"
                                class="multiselect__tag-icon"
                                @click="remove_address_item()"/>
                              <i
                                :class="{'fa fa-star': isAddressBookmarked(transparencyAddress), 'fa fa-star-o': !isAddressBookmarked(transparencyAddress)}"
                                aria-hidden="true"
                                tabindex="1"
                                @click="bookmark(transparencyAddress)"/>
                            </span>
                          </span>
                        </div>

                      </div>
                      <div
                        :class="{'block-opt-hidden': showMore, 'block-content--margin': !showMore}"
                        class="block pull-r-l ">
                        <div
                          class="block-header bg-gray-lighter"
                          @click="showMore = !showMore">
                          <ul class="block-options">
                            <li>
                              <button
                                type="button"
                                data-toggle="block-option"
                                data-action="content_toggle">
                                <i :class="{'si si-arrow-down': showMore, 'si si-arrow-up': !showMore,}"/>
                              </button>
                            </li>
                          </ul>
                          <h3 class="block-title">More Options...</h3>
                        </div>
                        <div class="block-content padding-20">
                          <div class="form-group">
                            <label class="col-xs-12 control-label text-left padding-b-10">Rooms</label>
                            <div class="col-sm-12">
                              <multiselect
                                id="rooms"
                                v-model="roomsMin"
                                :options="roomsOptions"
                                :show-labels="false"
                                :clear-on-select="false"
                                openDirection="bottom"
                                placeholder="Plase select"/>
                            </div>

                          </div>
                          <div class="form-group">
                            <label
                              class="col-xs-12 control-label text-left padding-b-10"
                              for="area">Living Area
                            </label>
                            <div
                              :class="{ 'has-error' : errors.has('profile_form.areaMin') }"
                              class="col-sm-12">
                              <input
                                v-validate="'numeric'"
                                id="area"
                                v-model="searchData.livingArea.min"
                                class="form-control"
                                placeholder="Please enter living area"
                                type="text"
                                name="area"
                                data-vv-scope="profile_form">
                              <div
                                v-show="errors.has('profile_form.areaMin')"
                                class="help-block text-left animated fadeInDown"> Please enter a number
                              </div>
                            </div>
                          </div>

                          <div class="form-group">
                            <label
                              class="col-xs-12 control-label text-left padding-b-10"
                              for="yards">Yards</label>
                            <div
                              :class="{ 'has-error' : errors.has('profile_form.areaMin') }"
                              class="col-sm-12">
                              <input
                                v-validate="'numeric'"
                                id="yards"
                                v-model="searchData.livingArea.min"
                                class="form-control"
                                placeholder="Please enter yards"
                                type="text"
                                name="yards"
                                data-vv-scope="profile_form">
                              <div
                                v-show="errors.has('profile_form.areaMin')"
                                class="help-block text-left animated fadeInDown"> Please enter a number
                              </div>
                            </div>
                          </div>

                          <div class="form-group">
                            <div class="col-sm-12">
                              <label class="css-input css-checkbox css-checkbox-primary">
                                <input
                                  :checked="false"
                                  type="checkbox">
                                <span/> Include historic ads
                              </label>
                            </div>
                          </div>

                        </div>
                      </div>
                    </form>
                  </div>
                </div>
              </div>
            </div>
            <div
              :class="{'hidden':!tabs['history']}"
              class="block-content tab-content">
              <div class="tab-pane fade fade-right in active">
                <div class="block pull-r-l">
                  <div class="block-content block-content-narrow">
                    <form
                      class="form-horizontal push-10-t"
                      data-vv-scope="profile_form" >
                      <h2 class="content-heading">
                        <i class="fa fa-map-marker"/> History

                        <i
                          v-show="$store.getters['searchStatesModule/addressLoading']"
                          class="fa fa-circle-o-notch fa-spin pull-right"/>
                        <i
                          v-if="transparency_history.length"
                          v-show="!$store.getters['searchStatesModule/addressLoading']"
                          class="fa fa-trash empty pull-right"
                          @click="empty_history(false)"/>

                      </h2>

                      <div
                        v-for="history in desc(transparency_history, 'date', 'desc')"
                        :key="history.date"
                        :class="{minimize: is_minimized(history.date, 'history')}"
                        class="block pull-r-l">
                        <div class="block-header bg-gray-lighter">
                          <ul class="block-options">
                            <li>
                              <button
                                type="button"
                                @click="minimize(history.date, 'history')">
                                <i
                                  :class="{'si-arrow-down': is_minimized(history.date, 'history'), 'si-arrow-up': !is_minimized(history.date, 'history')}"
                                  class="si"/>
                              </button>
                            </li>
                          </ul>
                          <h3 class="block-title">{{ format_date(history.date) }}</h3>
                        </div>
                        <div class="block-content block-content-full">
                          <ul class="nav-users remove-margin-b">
                            <li
                              v-for="(address, index) in desc(history.data, 'time', 'desc') "
                              :key="index">
                              <a>
                                <span
                                  :class="{'fa fa-star': isAddressBookmarked(address), 'fa fa-star-o': !isAddressBookmarked(address)}"
                                  aria-hidden="true"
                                  tabindex="1"
                                  @click="bookmark(address)"/>
                                <span
                                  class="link"
                                  @mousedown="setStreet(address, 200)">{{ address.name }}</span>
                                <div class="font-w400 text-muted"><small>{{ address['time'] | moment("from") }}</small></div>
                              </a>
                            </li>
                          </ul>

                        </div>
                      </div>
                    </form>

                  </div>
                </div>
              </div>
            </div>
            <div
              :class="{'hidden':!tabs['bookmarks']}"
              class="block-content tab-content">
              <div class="tab-pane fade fade-right in active">
                <div class="block pull-r-l">
                  <div class="block-content block-content-narrow">
                    <div
                      class="form-horizontal push-10-t"
                      data-vv-scope="profile_form" >
                      <h2 class="content-heading">
                        <i class="fa fa-star"/> Bookmarks

                        <i
                          v-show="$store.getters['searchStatesModule/addressLoading']"
                          class="fa fa-circle-o-notch fa-spin pull-right"/>
                        <i
                          v-if="bkmrks.length"
                          v-show="!$store.getters['searchStatesModule/addressLoading']"
                          class="fa fa-trash empty pull-right"
                          @click="empty_bookmarks(false)"/>

                      </h2>
                      <div
                        v-for="history in desc(bkmrks, 'date', 'desc')"
                        :key="history.date"
                        :class="{minimize: is_minimized(history.date, 'bookmarks')}"
                        class="block pull-r-l ">
                        <div class="block-header bg-gray-lighter">
                          <ul class="block-options">
                            <li>
                              <button
                                type="button"
                                @click="minimize(history.date, 'bookmarks')">
                                <i
                                  :class="{'si-arrow-down': is_minimized(history.date, 'bookmarks'), 'si-arrow-up': !is_minimized(history.date, 'bookmarks')}"
                                  class="si"/>
                              </button>
                            </li>
                          </ul>
                          <h3 class="block-title">{{ format_date(history.date) }}</h3>
                        </div>
                        <div class="block-content block-content-full">

                          <ul class="nav-users remove-margin-b">
                            <li
                              v-for="(address, index) in desc(history.data, 'time', 'desc') "
                              :key="index">
                              <a v-if="address != undefined && editing != address.uniqueIdentifier" >
                                <span
                                  class="fa fa-remove pull-right"
                                  @mousedown="bookmark(address)"/>
                                <span
                                  class="fa fa-edit pull-left"
                                  @mousedown="edit_bookmark(address, 'form')"/>
                                <span
                                  class="link"
                                  @click="setStreet(address, 200);">{{ address.name }}</span>
                                <div class="font-w400 text-muted"><small>{{ address['time'] | moment("from") }}</small></div>
                              </a>

                              <a v-if="editing == address.uniqueIdentifier">
                                <input
                                  v-model="address.name"
                                  class="form-control"
                                  @keyup.enter="edit_bookmark(address, 'save', history.date)" >
                                <i
                                  v-if="editing == address.uniqueIdentifier"
                                  class="fa fa-save pull-right editing"
                                  @click="edit_bookmark(address, 'save', history.date)"/>
                              </a>

                            </li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div
              :class="{'hidden':!tabs['docs']}"
              class="block-content tab-content">
              <div class="tab-pane fade fade-right in active">
                <div class="block pull-r-l">
                  <div class="block-content block-content-narrow">
                    <form
                      class="form-horizontal push-10-t"
                      data-vv-scope="profile_form" >
                      <h2 class="content-heading">
                        <i class="fa fa-file"/> Docs
                        <i
                          v-if="documents.length"
                          class="fa fa-trash empty pull-right"
                          @click="empty_docs(false)"/>

                      </h2>

                      <div
                        v-for="history in desc(documents, 'date', 'desc')"
                        :key="history.date"
                        :class="{minimize: is_minimized(history.date, 'docs')}"
                        class="block pull-r-l ">
                        <div class="block-header bg-gray-lighter">
                          <ul class="block-options">
                            <li>
                              <button
                                type="button"
                                @click="minimize(history.date, 'docs')">
                                <i
                                  :class="{'si-arrow-down': is_minimized(history.date, 'docs'), 'si-arrow-up': !is_minimized(history.date, 'docs')}"
                                  class="si"/>
                              </button>
                            </li>
                          </ul>
                          <h3 class="block-title">{{ format_date(history.date) }}</h3>
                        </div>

                        <div class="block-content block-content-full">
                          <ul class="nav-users remove-margin-b">
                            <li
                              v-for="(address, index) in desc(history.data, 'time', 'desc') "
                              :key="index">
                              <a >
                                <span
                                  class="fa fa-remove pull-right"
                                  @mousedown="remove_doc(address)"/>
                                <span
                                  class="link"
                                  @click="setStreet(address, 200);print_(address)">{{ address.name }}</span>
                                <div class="font-w400 text-muted"><small>{{ address['time'] | moment("from") }}</small></div>
                              </a>
                            </li>
                          </ul>

                        </div>
                      </div>
                    </form>

                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </aside>
    <modal
      v-if="tabs['bookmarks']"
      ref="modal"
      :modalShow="showModal">

      <template slot="close">
        <button
          type="button"
          class="btn btn-sm btn-default"
          @click="showModal = false;"><i class="fa fa-close"/>
        </button>
      </template>
      <template slot="title">
        Are you sure?
      </template>

      <template slot="text">
        <p>You are about to delete all of you bookmarks. Are you sure? This action can not be undone</p>
      </template>
      <template slot="slot_actions">

        <button
          class="btn btn-sm btn-default"
          type="button"
          data-dismiss="modal"
          @click="showModal = false;">No
        </button>

        <button
          class="btn btn-sm btn-primary"
          type="button"
          data-dismiss="modal"
          @click="empty_bookmarks(true) "><i class="fa fa-check"/> Yes
        </button>
      </template>
    </modal>

    <modal
      v-if="tabs['history']"
      ref="modal"
      :modalShow="showModal">

      <template slot="close">
        <button
          type="button"
          class="btn btn-sm btn-default"
          @click="showModal = false;"><i class="fa fa-close"/>
        </button>
      </template>
      <template slot="title">
        Are you sure?
      </template>

      <template slot="text">
        <p>You are about to delete all of you history. Are you sure? This action can not be undone</p>
      </template>
      <template slot="slot_actions">

        <button
          class="btn btn-sm btn-default"
          type="button"
          data-dismiss="modal"
          @click="showModal = false;">No
        </button>

        <button
          class="btn btn-sm btn-primary"
          type="button"
          data-dismiss="modal"
          @click="empty_history(true) "><i class="fa fa-check"/> Yes
        </button>
      </template>
    </modal>

    <modal
      v-if="tabs['docs']"
      ref="modal"
      :modalShow="showModal">

      <template slot="close">
        <button
          type="button"
          class="btn btn-sm btn-default"
          @click="showModal = false;"><i class="fa fa-close"/>
        </button>
      </template>
      <template slot="title">
        Are you sure?
      </template>

      <template slot="text">
        <p>You are about to delete all of you docs. Are you sure? This action can not be undone</p>
      </template>
      <template slot="slot_actions">

        <button
          class="btn btn-sm btn-default"
          type="button"
          data-dismiss="modal"
          @click="showModal = false;">No
        </button>

        <button
          class="btn btn-sm btn-primary"
          type="button"
          data-dismiss="modal"
          @click="empty_docs(true) "><i class="fa fa-check"/> Yes
        </button>
      </template>
    </modal>

  </div>
</template>
<script>
</script>
