<template>
  <div class="modal-open">
    <div
      id="modal-fadein"
      class="modal fade in display_block zi-90000">
      <div
        class="background-modal"
        @click="toggleUserModal(false)"/>
      <div
        class="modal-dialog modal-sm"
        style="width: 90%;">
        <div class="modal-content">
          <div class="data-section no-border">
            <div class="section-label">
              <div class="label-copy">
                Update invitation status
              </div>
              <div class="section-controls">
                <button
                  type="button"
                  class="btn btn-sm btn-default"
                  @click.stop="toggleUserModal(false)"><i class="fa fa-close"/></button>
              </div>
            </div>
            <div class="section-content">
              <div class="form-group margin-b-15">
                <div class="margin-b-10 font-s12">{{ updateType === 1 ? 'Sent to' : 'Has been accepted by' }} :
                  <span v-if="selectedUser">{{ getUserInfo(selectedUser) }}</span>
                  <span v-else>{{ getAcceptedUserInfo() }}</span>
                </div>
                <autocomplete
                  ref="autocomplete_search"
                  :placeholder="'Select new user'"
                  :onSearch="getSearchSuggestions"
                  :setData="setUserData"
                  :itemHighlighted="'highlightedName'"
                  :tagPosition="'top'"
                  class="search-autocomp">
                  <template
                    slot="history"
                    slot-scope="{ item }">
                    <span>{{ getUserInfo(item) }}</span>
                  </template>
                </autocomplete>
              </div>
              <div class="padding-b-10 text-right">
                <button
                  :disabled="!selectedUser"
                  class="btn btn-sm btn-primary"
                  type="button"
                  data-dismiss="modal"
                  @click.stop="setNewInvitationStatus(selectedUser)">update
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
