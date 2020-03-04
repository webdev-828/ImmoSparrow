<template>
  <div>
    <!-- Delete sub modal -->
    <confirm-modal
      :showModal="showDeleteModal"
      :title="'Delete Subscription'"
      :text="'Are you sure you want to delete this subscription?'"
      :onSubmit="updateSub"
      :onCancel="cancelModal"/>
    <!-- Deactivate sub modal -->
    <confirm-modal
      :showModal="showDeactivateModal"
      :title="'Please confirm'"
      :text="deactivate ? 'Are you sure you want to deactivate this subscription?' : 'Are you sure you want to activate this subscription?'"
      :onSubmit="activateSub"
      :onCancel="cancelModal"/>
    <div class="flex-head fancy-shadow">
      <div class="data-section">
        <div class="section-label">
          <div class="label-copy">Abo</div>
          <div class="section-controls">
            <button
              v-tooltip.top="{
                content: showDisabled(), delay: { show: 700, hide: 100 }
              }"
              :class="{'bg-primary-lighter': showSidebarDisabled, 'btn-default': !showSidebarDisabled}"
              class="btn btn-sm"
              type="button"
              @click="switchHideDeleted()">
              <i
                :class="{'fa-eye': !showSidebarDisabled, 'fa-eye-slash': showSidebarDisabled}"
                class="fa"/>
            </button>
            <button
              v-tooltip.top="{ content: 'Filter list', delay: { show: 700, hide: 100 }}"
              :class="{'bg-primary-lighter': showSidebarFilter, 'btn-default': !showSidebarFilter}"
              class="btn btn-sm"
              type="button"
              @click="showSidebarFilter=!showSidebarFilter"><i class="fa fa-filter"/></button>
            <button
              v-tooltip.top="{ content: 'Search in subscriptions', delay: { show: 700, hide: 100 }}"
              :class="{'bg-primary-lighter': showSidebarSearch, 'btn-default': !showSidebarSearch}"
              class="btn btn-sm"
              type="button"
              @click="showSidebarSearch = !showSidebarSearch">
              <i class="fa fa-search"/>
            </button>
          </div>
        </div>
        <div
          v-if="showSidebarSearch"
          class="section-content">
          <div class="margin-b-10">
            <input
              ref="sidebarSearch"
              v-model="searchText"
              class="form-control"
              type="text"
              name=""
              placeholder="Search in subscriptions">
          </div>
        </div>
        <div
          v-if="showSidebarFilter"
          class="section-content">
          <div class="margin-b-10">
            <div class="form-group">
              <multiselect
                id="contacts"
                :custom-label="contactsLabel"
                v-model="selectedContact"
                :options="contacts"
                :show-labels="false"
                :close-on-select="true"
                notranslate
                placeholder="Filter by client name"
                track-by="id"
                openDirection="bottom"/>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div
      v-bar
      class="flex-scroll">
      <div class="tab-content">
        <div class="tab-pane active">
          <div
            class="side-panel"
            style="margin-bottom: 50px;">
            <!-- Data Section -->
            <div class="data-section stand-out">
              <div class="section-content">
                <ul class="list list-selectable overcome-borders">
                  <li
                    v-for="(sub, subKey) in filteredSubs"
                    :key="subKey">
                    <div>
                      <div
                        v-if="!sub.edit"
                        class="font-w600"
                        notranslate>{{ sub.item.name }}</div>
                      <div
                        v-else
                        class="label-copy margin-r-5">
                        <textarea
                          v-model="sub.item.name"
                          class="form-control font-s13"
                          style="width: 85%;"
                          rows="2"
                          @keyup.enter="renameSubName(sub)"/>
                      </div>
                      <div class="font-s12 font-w400 text-muted margin-b-5">
                        <span notranslate>{{ formatSubDate(sub.item.createdTime) }}</span>
                        <span
                          v-if="sub.item.contact"
                          notranslate>
                          <span class="padding-l-4 padding-r-4">&middot;</span>
                          <i class="fa fa-vcard"/> {{ sub.item.contact.firstName + " " + sub.item.contact.lastName }}
                        </span>
                      </div>
                      <!--  -->
                      <div class="additional-controlls">
                        <div class="btn-group">
                          <button
                            v-tooltip.bottom="{
                              content: 'Search again',
                              delay: { show: 700, hide: 100 },
                            }"
                            v-if="!sub.edit"
                            class="btn btn-sm btn-default bg-white"
                            type="button"
                            @click="loadSearchData(sub.item.id)">
                            <i class="glyphicon glyphicon-repeat"/>
                          </button>
                          <button
                            v-tooltip.bottom="{
                              content: 'Edit name',
                              delay: { show: 700, hide: 100 },
                            }"
                            v-if="!sub.edit"
                            class="btn btn-sm btn-default bg-white"
                            type="button"
                            @click="sub.edit=!sub.edit">
                            <i class="glyphicon glyphicon-pencil"/>
                          </button>
                          <button
                            v-tooltip.bottom="{
                              content: 'Edit search abo',
                              delay: { show: 700, hide: 100 },
                            }"
                            v-if="!sub.edit"
                            class="btn btn-sm btn-default bg-white"
                            type="button"
                            @click="editInSearch(sub.item)">
                            <i class="glyphicon glyphicon-share"/>
                          </button>
                          <button
                            v-else
                            class="btn btn-sm btn-default bg-white"
                            type="button"
                            @click="renameSubName(sub)">
                            <i class="glyphicon glyphicon-ok"/>
                          </button>
                          <button
                            v-tooltip.bottom="{
                              content: 'To Inbox',
                              delay: { show: 700, hide: 100 },
                            }"
                            v-if="!sub.edit"
                            class="btn btn-sm btn-default bg-white"
                            type="button"
                            @click="editInInbox(sub.item)">
                            <i class="glyphicon glyphicon-download-alt"/>
                          </button>
                          <button
                            v-tooltip.bottom="{
                              content: 'Deactivate',
                              delay: { show: 700, hide: 100 },
                            }"
                            v-if="sub.item.isEnabled"
                            v-show="!sub.edit"
                            class="btn btn-sm btn-default bg-white"
                            type="button"
                            @click="showDeactivateSub(sub.item, true)">
                            <i class="fa fa-toggle-on"/>
                          </button>
                          <button
                            v-tooltip.bottom="'Activate'"
                            v-else
                            v-show="!sub.edit"
                            class="btn btn-sm btn-default bg-white"
                            type="button"
                            @click="showDeactivateSub(sub.item, false)">
                            <i class="fa fa-toggle-off"/>
                          </button>
                          <button
                            v-tooltip.bottom="{
                              content: 'Delete',
                              delay: { show: 700, hide: 100 },
                            }"
                            v-show="!sub.edit"
                            class="btn btn-sm btn-default bg-white"
                            type="button"
                            @click="deleteSub(sub.item)">
                            <i class="fa fa-trash"/>
                          </button>
                        </div>
                      </div>
                      <!--  -->
                    </div>
                    <!-- <div v-else>
                                  <div class="caption margin-b-10"><span class="text-muted">Item removed.</span> <a href="#" @click="updateSub(sub.item, false)">Restore</a></div>
                                </div> -->
                  </li>
                </ul>
              </div>
            </div>
            <!-- End Data Section -->
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
</script>
