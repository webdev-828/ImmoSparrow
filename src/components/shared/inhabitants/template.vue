<template>
  <div>
    <div class="data-section stand-out">
      <div
        class="section-label cursor-show"
        @click.stop="inhabitantsSection=!inhabitantsSection">
        <div class="label-copy">Inhabitants <var notranslate>{{ inhabitants.length ? "[" + inhabitants.length + "]" : "" }}</var></div>
        <div class="section-controls">
          <div
            class="dropdown"
            style="display: inline;">
            <button
              notranslate
              class="btn btn-sm btn-default button-dropdown"
              type="button">
              i
            </button>
            <ul
              class="dropdown-menu top-150 dropdown-menu-right fancy-shadow"
              aria-labelledby="dropdownMenu3">
              <li>
                <div class="font-s12 padding-10">
                  Source: Local / Search.ch
                </div>
              </li>
            </ul>
          </div>
          <button
            v-tooltip.top="{ content: 'Toggle section', delay: { show: 700, hide: 100 }}"
            v-if="searchInhabitantsInfo"
            class="btn btn-sm btn-default cursor-none"><i
              :class="{'fa-angle-up' : inhabitantsSection, 'fa-angle-down' : !inhabitantsSection}"
              class="fa"/>
          </button>
          <v-popover
            v-else
            class="popover-inline"
            placement="top">
            <button class="btn btn-sm btn-default">
              <i class="fa fa-angle-down"/>
            </button>
            <template
              v-if="empCtx"
              slot="popover">
              <popover
                :bundle="'search'"
                :feature="'inhabitantsInfo'" />
            </template>
          </v-popover>
        </div>
      </div>
    </div>
    <template v-if="inhabitantsSection && searchInhabitantsInfo">
      <div
        v-if="val(item, item => item.runtimeServices.propertyIhabitantsInfoService.serviceStatus) || entrenceId"
        class="data-section">
        <div class="section-content">
          <div
            v-for="(inhabitant, iKey) in inhabitants"
            v-if="(iKey < 1 || !inhabitantsMinified)"
            :key="iKey"
            class="fluid-data-table flex-option">
            <div class="fluid-cell-wrap">
              <div class="fluid-cell head-cell">
                <div
                  class="attribute">
                  Name
                </div>
                <div
                  v-if="inhabitantType(inhabitant.type) === 'Person'"
                  class="value"
                  notranslate>
                  {{ val(inhabitant, inhabitant => inhabitant.person.firstName, "") }} {{ val(inhabitant, inhabitant => inhabitant.person.lastName, "") }} {{ val(inhabitant, inhabitant => inhabitant.person.maidenName, "") }}
                </div>
                <div
                  v-if="inhabitantType(inhabitant.type) === 'Organisation'"
                  class="value"
                  notranslate>
                  {{ val(inhabitant, inhabitant => inhabitant.organization.title, "") }}
                </div>
              </div>
            </div>
            <div
              v-if="val(inhabitant, inhabitant => inhabitant.person.occupation) || val(inhabitant, inhabitant => inhabitant.organization.occupation)"
              class="fluid-cell-wrap">
              <div class="fluid-cell">
                <div
                  class="attribute">
                  Occupation
                </div>
                <div
                  class="value"
                  notranslate>
                  {{ val(inhabitant, inhabitant => inhabitant.person.occupation, "") || val(inhabitant, inhabitant => inhabitant.organization.occupation, "") }}
                </div>
              </div>
            </div>
            <div class="fluid-cell-wrap">
              <div class="fluid-cell">
                <div
                  class="attribute">
                  Type
                </div>
                <div
                  v-if="inhabitantType(inhabitant.type) === 'Person'"
                  class="value">
                  Person
                </div>
                <div
                  v-if="inhabitantType(inhabitant.type) === 'Organisation'"
                  class="value">
                  Organization
                </div>
              </div>
            </div>
            <div
              v-if="val(inhabitant, inhabitant => inhabitant.organization.commercialRegister.companyName)"
              class="fluid-cell-wrap">
              <div class="fluid-cell">
                <div
                  class="attribute">
                  Company name
                </div>
                <div
                  class="value"
                  notranslate>
                  {{ val(inhabitant, inhabitant => inhabitant.organization.commercialRegister.companyName, "") }}
                </div>
              </div>
            </div>
            <div
              v-if="val(inhabitant, inhabitant => inhabitant.organization.commercialRegister.formOfOrganization)"
              class="fluid-cell-wrap">
              <div class="fluid-cell">
                <div
                  class="attribute">
                  Form of organization
                </div>
                <div
                  class="value"
                  notranslate>
                  {{ val(inhabitant, inhabitant => inhabitant.organization.commercialRegister.formOfOrganization, "") }}
                </div>
              </div>
            </div>
            <div
              v-if="val(inhabitant, inhabitant => inhabitant.organization.commercialRegister.registerNumber)"
              class="fluid-cell-wrap">
              <div class="fluid-cell">
                <div
                  class="attribute">
                  Register number
                </div>
                <div
                  class="value"
                  notranslate>
                  {{ val(inhabitant, inhabitant => inhabitant.organization.commercialRegister.registerNumber, "") }}
                </div>
              </div>
            </div>
            <div
              v-if="val(inhabitant, inhabitant => inhabitant.communication.phone1)"
              class="fluid-cell-wrap">
              <div class="fluid-cell">
                <div
                  class="attribute">
                  Phone
                </div>
                <div
                  class="value">
                  <a
                    :href="`tel:${parsePhone(val(inhabitant, inhabitant => inhabitant.communication.phone1, ''))}`"
                    target="_blank"
                    notranslate>
                    {{ parsePhone(val(inhabitant, inhabitant => inhabitant.communication.phone1, "")) }}
                  </a>
                </div>
              </div>
            </div>
            <div
              v-else-if="val(inhabitant, inhabitant => inhabitant.communication.phone2)"
              class="fluid-cell-wrap">
              <div class="fluid-cell">
                <div
                  class="attribute">
                  Phone
                </div>
                <div
                  class="value">
                  <a
                    :href="`tel:${parsePhone(val(inhabitant, inhabitant => inhabitant.communication.phone2, ''))}`"
                    target="_blank"
                    notranslate>
                    {{ parsePhone(val(inhabitant, inhabitant => inhabitant.communication.phone2, "")) }}
                  </a>
                </div>
              </div>
            </div>
            <div
              v-if="val(inhabitant, inhabitant => inhabitant.communication.cell1)"
              class="fluid-cell-wrap">
              <div class="fluid-cell">
                <div
                  class="attribute">
                  Cell
                </div>
                <div
                  class="value">
                  <a
                    :href="`tel:${parsePhone(val(inhabitant, inhabitant => inhabitant.communication.cell1, ''))}`"
                    target="_blank"
                    notranslate>
                    {{ parsePhone(val(inhabitant, inhabitant => inhabitant.communication.cell1, "")) }}
                  </a>
                </div>
              </div>
            </div>
            <div
              v-else-if="val(inhabitant, inhabitant => inhabitant.communication.cell2)"
              class="fluid-cell-wrap">
              <div class="fluid-cell">
                <div
                  class="attribute">
                  Cell
                </div>
                <div
                  class="value">
                  <a
                    :href="`tel:${parsePhone(val(inhabitant, inhabitant => inhabitant.communication.cell2, ''))}`"
                    target="_blank"
                    notranslate>
                    {{ parsePhone(val(inhabitant, inhabitant => inhabitant.communication.cell2, "")) }}
                  </a>
                </div>
              </div>
            </div>
            <div
              v-if="val(inhabitant, inhabitant => inhabitant.communication.fax)"
              class="fluid-cell-wrap">
              <div class="fluid-cell">
                <div
                  class="attribute">
                  Fax
                </div>
                <div
                  class="value">
                  <a
                    :href="`tel:${parsePhone(val(inhabitant, inhabitant => inhabitant.communication.fax, ''))}`"
                    target="_blank"
                    notranslate>
                    {{ parsePhone(val(inhabitant, inhabitant => inhabitant.communication.fax, "")) }}
                  </a>
                </div>
              </div>
            </div>
            <div
              v-else-if="val(inhabitant, inhabitant => inhabitant.communication.faxStar)"
              class="fluid-cell-wrap">
              <div class="fluid-cell">
                <div
                  class="attribute">
                  Fax
                </div>
                <div
                  class="value">
                  <a
                    :href="`tel:${parsePhone(val(inhabitant, inhabitant => inhabitant.communication.faxStar, ''))}`"
                    target="_blank"
                    notranslate>
                    {{ parsePhone(val(inhabitant, inhabitant => inhabitant.communication.faxStar, "")) }}
                  </a>
                </div>
              </div>
            </div>
            <div
              v-if="val(inhabitant, inhabitant => inhabitant.communication.email1) || val(inhabitant, inhabitant => inhabitant.communication.email2)"
              class="fluid-cell-wrap">
              <div class="fluid-cell">
                <div
                  class="attribute">
                  Email
                </div>
                <div
                  class="value">
                  <a
                    :href="'mailto:' + val(inhabitant, inhabitant => inhabitant.communication.email1) || val(inhabitant, inhabitant => inhabitant.communication.email2)"
                    target="_blank"
                    notranslate>
                    {{ val(inhabitant, inhabitant => inhabitant.communication.email1, "") || val(inhabitant, inhabitant => inhabitant.communication.email2, "") }}
                  </a>
                </div>
              </div>
            </div>
            <div
              v-if="val(inhabitant, inhabitant => inhabitant.communication.website1)"
              class="fluid-cell-wrap">
              <div class="fluid-cell">
                <div
                  class="attribute">
                  Website
                </div>
                <div
                  class="value">
                  <a
                    :href="val(inhabitant, inhabitant => inhabitant.communication.website1)"
                    target="_blank"
                    notranslate>
                    {{ val(inhabitant, inhabitant => inhabitant.communication.website1, "") }}
                  </a>
                </div>
              </div>
            </div>
            <div
              v-if="inhabitant.sourceUrl"
              class="fluid-cell-wrap">
              <div class="fluid-cell">
                <div
                  class="attribute">
                  Phone Book
                </div>
                <div
                  class="value"
                  notranslate>
                  <a
                    :href="`https://blueland.azurewebsites.net/?refreshed=${encodeURIComponent(inhabitant.sourceUrl)}`"
                    target="_blank">
                    Look up
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
        <button
          v-tooltip.top="{ content: 'Expand/truncate list', delay: { show: 700, hide: 100 }}"
          v-if="(val(item, item => item.runtimeServices.propertyIhabitantsInfoService.serviceStatus) || entrenceId) && inhabitants.length > 1"
          class="btn btn-xs btn-block btn-default margin-t-5 margin-b-10"
          type="button"
          @click="inhabitantsMinified=!inhabitantsMinified">
          <span v-if="inhabitantsMinified">Expand</span>
          <span v-else>Truncate</span>
          <span v-if="inhabitantsMinified"><i class="fa fa-angle-down"/></span>
          <span v-else><i class="fa fa-angle-up"/></span>
        </button>
      </div>
      <div
        v-if="!inhabitants.length && !val(item, item => item.runtimeServices.propertyIhabitantsInfoService.serviceStatus)"
        class="sidebar-message-box">
        <div class="icon">
          <i class="fa fa-info-circle"/>
        </div>
        <div class="message">Inhabitants info not possible for this address</div>
      </div>
      <div
        v-if="unavailableInhabitantsService"
        class="sidebar-message-box">
        <div class="icon">
          <i class="fa fa-info-circle"/>
        </div>
        <div class="message">Service not available at the moment. Try again soon.</div>
      </div>
    </template>
  </div>
</template>
