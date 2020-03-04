<template>
  <div>
    <confirmModal
      :showModal="showModal"
      :title="'Delete contact'"
      :text="'Are you sure you want to delete this contact?'"
      :onSubmit="removeContact"
      :onCancel="closeModal"/>
    <div
      id="head-container"
      class="bg-white">
      <div
        class="main-section">
        <div
          class="title-section">
          <span>Contacts</span>
        </div>
        <div class="info-section">
          <small><var activeNo>{{ activeNo }}</var> <span>active</span>, <var inActiveNo>{{ inActiveNo }}</var> <span>inactivated</span></small>
        </div>
        <div
          class="control-section">
          <div class="btn-toolbar">
            <div class="btn-group">
              <div class="input-group">
                <input
                  v-model="searchForString"
                  placeholder="Search by (first name, last name, email, company )"
                  type="text"
                  class="form-control input-sm search-header-input"
                  @keyup.enter="searchFor(0)">
                <span
                  v-if="!searchLoading"
                  class="input-group-addon">
                  <i
                    class="fa fa-search"
                    @click="searchFor(0)"/>
                </span>
                <span
                  v-if="searchLoading"
                  class="input-group-addon">
                  <i class="fa fa-circle-o-notch fa-spin"/>
                </span>
                <span
                  v-if="searchFinished"
                  class="input-group-addon bg-gray-light"
                  @click="clearSearch">
                  <i class="fa fa-remove"/>
                </span>
              </div>
            </div>
            <div class="btn-group">
              <button
                v-for="(i, index) in [10,20,50]"
                :key="index"
                :class="i == perPage ? 'active':''"
                class="btn btn-sm btn-default"
                @click.stop="changePerPage(i)">{{ i }}
              </button>
            </div>
            <div class="btn-group">
              <button
                type="button"
                class="btn btn-sm btn-success"
                @click.stop="addContact">
                <i class="fa fa-plus"/> Add Contact
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
    <main
      id="main-container"
      class="standard-vb table-page">
      <div
        v-bar
        style="position: absolute; z-index: 1">
        <div v-close-rightSidebar>
          <div class="content">
            <div class="block">
              <div class="block-content">
                <div class="row">
                  <div class="col-sm-12">
                    <div v-if="!loading">
                      <table class="table table-striped table-condensed table-vcenter">
                        <thead>
                          <tr>
                            <th
                              class="width20percent"
                              rowspan="1"
                              colspan="1">last Name</th>
                            <th
                              class="width20percent"
                              rowspan="1"
                              colspan="1">first Name</th>
                            <th class="width30percent">Address</th>
                            <th class="width20percent">Email</th>
                            <th
                              class="width10percent text-right">Action</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr
                            v-for="(contact, contactKey) in allContacts"
                            :key="contactKey"
                            :class="{'selected': selectedIndex === contactKey}"
                            class="hovertr"
                            @click.stop="getContact(contactKey)">

                            <td class="font-w600"><var
                              v-if="contact.firstName"
                              lastName>{{ contact.lastName }}</var></td>
                            <td class="font-w600"><var
                              v-if="contact.lastName"
                              firstName>{{ contact.firstName }}</var></td>
                            <td><var
                              address
                              notranslate> {{ contact.address && contact.address['street'] ? contact.address.street + " " + contact.address.streetNumber + ", " + contact.address.zip + " " + contact.address.locality : "" }}</var></td>
                            <td><var email>{{ contact.email }}</var></td>
                            <td
                              class="text-right">
                              <button
                                v-tooltip.top="{ content: 'Delete Contact', delay: { show: 700, hide: 100 }}"
                                class="btn btn-xs btn-default"
                                @click.stop="deleteContact(contact)">
                                <i
                                  v-if="!showModal && (contactRemove && contactRemove.id === contact.id)"
                                  class="fa fa-refresh fa-spin"/>
                                <i
                                  v-else
                                  class="fa fa-trash"/>
                              </button>
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                    <div
                      v-if="loading"
                      class="text-center">
                      <i class="fa fa-circle-o-notch fa-spin spn"/>
                    </div>
                    <paginate
                      ref="contactsPagination"
                      :page-count="pages"
                      :page-range="3"
                      :margin-pages="2"
                      :click-handler="nextPage"
                      :prev-text="'Prev'"
                      :next-text="'Next'"
                      :container-class="'pagination to-the-right'"
                      :page-class="'page-item'"/>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
    <!-- New Users Sidebars -->
    <aside
      v-move
      v-if="(contact.id && !addingContact && $store.getters['globalStatesModule/profileRightSidebar']) || loadElement"
      id="sidebar-object-fixed"
      class="active sidebar-shadow">
      <div
        v-show="loadElement"
        class="preloader">
        <i class="fa fa-circle-o-notch fa-spin"/>
      </div>
      <div
        v-if="contact.id && !addingContact && $store.getters['globalStatesModule/profileRightSidebar']"
        class="side-panel">
        <div class="detail-header">
          <div class="title">
            <div class="centering-block">
              <div>
                <img
                  class="img-avatar img-avatar32"
                  src="static/img/avatars/avatar10.jpg"
                  alt="">
                <var class="font-w600 push-10-l">{{ contact.primaryInfo ? contact.primaryInfo.firstName + ' ' + contact.primaryInfo.lastName : "" }}</var>
              </div>
            </div>
          </div>
          <div class="controls">
            <button
              v-if="selectedIndex !== 0 || pageNum !== 0"
              class="btn btn-sm btn-default"
              type="button"
              @click="nextItem(selectedIndex, false)">
              <i class="fa fa-arrow-left"/><br>
            </button>
            <button
              v-if="checkEnd(selectedIndex)"
              class="btn btn-sm btn-default"
              type="button"
              @click="nextItem(selectedIndex, true)">
              <i class="fa fa-arrow-right"/><br>
            </button>
            <button
              class="btn btn-sm btn-default margin-l-10"
              data-toggle="layout"
              data-action="side_overlay_close"
              type="button"
              @click="closeContact()">
              <i class="fa fa-close"/>
            </button>
          </div>
        </div>
        <contact-profile
          :contactProfile="contact"
          :contactListId="contactListId"
          @searchFor="searchFor(pageNum + 1)"
          @loadContacts="loadContacts()"
          @closeContact="closeContact()"/>
      </div>
    </aside>
    <!--  -->
    <aside
      v-move
      v-if="addingContact && $store.getters['globalStatesModule/profileRightSidebar']"
      id="sidebar-object-fixed"
      class="active sidebar-shadow">
      <div class="side-panel">
        <div class="detail-header">
          <div class="title">
            <div class="centering-block">
              <div>
                <img
                  class="img-avatar img-avatar32"
                  src="static/img/avatars/avatar10.jpg">
                <span class="font-w600 push-10-l">Add Contact</span>
              </div>
            </div>
          </div>
          <div class="controls">
            <button
              class="btn btn-sm btn-default margin-l-10"
              type="button"
              @click="closeNewContact()">
              <i class="fa fa-close"/>
            </button>
          </div>
        </div>
        <contact-profile
          :contact_profile="newContact"
          :contactListId="contactListId"
          :addContact="true"
          @closeNewContact="closeNewContact()"
          @loadContacts="loadContacts()" />
      </div>
    </aside>
    <!-- / New Users Sidebars -->
  </div>
</template>
