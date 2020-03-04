<template>
  <div class="no-scroll-screen vb-content">
    <legalPersonDetails
      v-if="modal.legal"
      :closeModal="closeModal"
      :legalPerson="legalPerson"/>
    <masterDetails
      v-if="modal.master"
      :currentMaster="currentMaster"
      :closeModal="closeModal"
      :masterSubmit="masterSubmit" />
    <div class="side-by-side-control">
      <div class="side-col">
        <div class="col-controls has-feedback">
          <autocomplete
            ref="autocomplete_search_lp"
            :setData="setPersonFilter"
            :onSearch="getSearchSuggestionsLP"
            :onClean="getLegalPersons"
            :placeholder="'Please enter name, locality...'"
            :itemHighlighted="'primaryInfo.companyName'">
            <template
              slot="person"
              slot-scope="{ item }">
              <span class="suggestion_autocomplete">{{ get_icon(70) }}</span>
            </template>
          </autocomplete>
          <div class="right-side">
            <div
              class="dropdown"
              style="display: inline-block;">
              <button
                id=""
                :class="filterMaster.id ? 'btn-primary' : 'btn-default'"
                class="btn btn-sm dropdown-toggle"
                type="button"
                data-toggle="dropdown"
                aria-haspopup="true"
                aria-expanded="true">
                <span
                  v-if="!filterMaster.id"
                  class="margin-r-5">{{ lPFilter.selected }}</span>
                <span
                  v-else
                  class="margin-r-5">Filter: <var companyName>{{ filterMaster.primaryInfo.companyName }}</var></span>
                <span class="caret"/>
              </button>
              <ul
                class="dropdown-menu dropdown-menu-right fancy-shadow font-s13"
                aria-labelledby="">
                <li>
                  <button
                    v-for="(filter, id) in lPFilter.val"
                    :key="id"
                    class="btn-in-dropdown"
                    @click="filterList('lp', filter)">{{ filter.text }}</button>
                </li>
              </ul>
            </div>
          </div>
        </div>
        <div class="col-tbl">
          <div class="tbl-head">
            <table class="table table-bordered">
              <thead>
                <tr>
                  <th style="width: 40%;">Name</th>
                  <th style="width: 24%;">Locality</th>
                  <th style="width: 24%;">Street</th>
                  <th style="width: 12%;"/>
                </tr>
              </thead>
            </table>
          </div>
          <div class="tbl-scroll">
            <table class="table table-hover">
              <tbody v-if="legalPersons">
                <tr
                  v-for="legalPerson in legalPersons"
                  :class="{'selected': linkedLegalPersons.includes(legalPerson.id)}"
                  :key="legalPerson.id"
                  @click="toggleLinkedLP(legalPerson.id)" >
                  <td style="width: 35%;"><var companyName>{{ legalPerson.primaryInfo.companyName }}</var></td>
                  <td style="width: 26%;"><var street>{{ legalPerson.primaryInfo.street }}</var></td>
                  <td style="width: 27%;"><var locality>{{ legalPerson.primaryInfo.locality }}</var></td>
                  <td style="width: 12%;">
                    <button
                      v-tooltip.top="{ content: 'Show details', delay: { show: 700, hide: 100 }}"
                      class="btn btn-xs btn-default"
                      type="button"
                      @click.stop="legalPersonDetail(legalPerson)">
                      <i class="fa fa-eye"/>
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
      <!-- Middle -->
      <div class="middle-col">
        <button
          class="btn btn-block btn-sm btn-primary"
          type="button"
          @click="linkItems">Link</button>
        <button
          class="btn btn-block btn-sm btn-default"
          type="button"
          @click="unlinkItems()">Unlink</button>
      </div>
      <!-- / Middle -->
      <div class="side-col">
        <div class="col-controls">
          <div class="left-side">
            <div class="form-group has-feedback">
              <autocomplete
                ref="autocomplete_search_master"
                :setData="setMasterFilter"
                :onSearch="getSearchSuggestionsMaster"
                :onClean="getLegalPersonsMasters"
                :placeholder="'Please enter name, locality...'"
                :itemHighlighted="'primaryInfo.companyName'">
                <template
                  slot="person"
                  slot-scope="{ item }">
                  <span class="suggestion_autocomplete">{{ get_icon(70) }}</span>
                </template>
              </autocomplete>
            </div>
          </div>
          <div class="right-side">
            <button
              class="btn btn-sm btn-success"
              type="button"
              @click.stop="legalPersonMasterDetail()">
              Add Master
            </button>
            <div
              class="dropdown"
              style="display: inline-block;">
              <button
                class="btn btn-sm btn-default dropdown-toggle"
                type="button"
                data-toggle="dropdown"
                aria-haspopup="true"
                aria-expanded="true">
                <span class="margin-r-5">{{ masterFilterVal.selected }}</span>
                <span class="caret"/>
              </button>
              <ul
                class="dropdown-menu dropdown-menu-right fancy-shadow font-s13"
                aria-labelledby="">
                <li>
                  <button
                    v-for="(filter, id) in masterFilterVal.val"
                    :key="id"
                    class="btn-in-dropdown"
                    @click="filterList('master', filter)">{{ filter.text }}</button>
                </li>
              </ul>
            </div>
          </div>
        </div>
        <div class="col-tbl">
          <div class="tbl-head">
            <table class="table table-bordered">
              <thead>
                <tr>
                  <th style="width: 40%;">Name</th>
                  <th style="width: 30%;">Locality</th>
                  <th style="width: 15%;">LP</th>
                  <th style="width: 15%;"/>
                </tr>
              </thead>
            </table>
          </div>
          <div class="tbl-scroll">
            <table class="table table-hover">
              <tbody>
                <tr
                  v-for="masterLegalPerson in masterLegalPersons"
                  :class="{'selected': linkedMaster === masterLegalPerson.id}"
                  :key="masterLegalPerson.id"
                  @click="toggleLinkedMaster(masterLegalPerson.id)">
                  <td style="width: 40%;"><var companyName>{{ masterLegalPerson.primaryInfo.companyName }}</var></td>
                  <td style="width: 30%;">
                    <var
                      v-if="masterLegalPerson.address"
                      address>{{ masterLegalPerson.address.street }} {{ masterLegalPerson.address.streetNumber }}</var>
                  </td>
                  <td style="width: 15%;">{{ masterLegalPerson.legalPersonCount }}</td>
                  <td style="width: 15%;">
                    <button
                      v-tooltip.top="{ content: 'Show related persons', delay: { show: 700, hide: 100 }}"
                      :class="filterMaster.id === masterLegalPerson.id ? 'btn-primary' : 'btn-default'"
                      class="btn btn-xs"
                      type="button"
                      @click.stop="filterByMaster(masterLegalPerson)">
                      <i class="fa fa-sitemap"/>
                    </button>
                    <button
                      v-tooltip.top="{ content: 'Edit master details', delay: { show: 700, hide: 100 }}"
                      class="btn btn-xs btn-default"
                      type="button"
                      @click.stop="legalPersonMasterDetail(masterLegalPerson.id)">
                      <i class="fa fa-pencil"/>
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
