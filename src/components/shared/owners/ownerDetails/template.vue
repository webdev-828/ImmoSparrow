<template>
  <div class="table-flex-col">
    <div class="table-col">
      <div
        v-if="val(owner, item => item.name)"
        class="flex-row highlighted">
        <div class="poperty-data">Name</div>
        <div
          notranslate
          class="value-data">{{ owner.name }}</div>
      </div>
      <div
        v-if="val(owner, item => item.streetAndNumber) || val(owner, item => item.value)"
        class="flex-row">
        <div class="poperty-data">Street &amp; Number</div>
        <div
          notranslate
          class="value-data">{{ owner.streetAndNumber || owner.value }}</div>
      </div>
      <div
        v-if="val(owner, item => item.zip)"
        class="flex-row">
        <div class="poperty-data">ZIP</div>
        <div
          notranslate
          class="value-data">{{ owner.zip }}</div>
      </div>
      <div
        v-if="val(owner, item => item.locality)"
        class="flex-row">
        <div class="poperty-data">Locality</div>
        <div
          notranslate
          class="value-data">{{ owner.locality }}</div>
      </div>
      <div
        v-if="val(owner, item => item.ownershipType)"
        class="flex-row">
        <div class="poperty-data">Type</div>
        <div class="value-data">
          <span class="label label-default">{{ getOwnershipType(owner.ownershipType) }}</span>
        </div>
      </div>
      <div
        v-if="val(owner, item => item.type)"
        class="flex-row">
        <div class="poperty-data">Text</div>
        <div
          notranslate
          class="value-data">{{ owner.type }}</div>
      </div>
      <div
        v-if="val(owner, item => item.ownershipPercentage)"
        class="flex-row">
        <div class="poperty-data">Percentage</div>
        <div
          notranslate
          class="value-data">{{ owner.ownershipPercentage ? owner.ownershipPercentage + "%" : "" }}</div>
      </div>
      <div
        v-if="val(owner, item => item.organization.commercialRegister.companyName)"
        class="flex-row">
        <div class="poperty-data">Company name</div>
        <div
          notranslate
          class="value-data">{{ owner.organization.commercialRegister.companyName }}</div>
      </div>
      <div
        v-if="val(owner, item => item.organization.commercialRegister.formOfOrganisation)"
        class="flex-row">
        <div class="poperty-data">Form Of Organisation</div>
        <div
          notranslate
          class="value-data">{{ owner.organization.commercialRegister.formOfOrganisation }}</div>
      </div>
      <div
        v-if="val(owner, item => item.organization.commercialRegister.registerNumber)"
        class="flex-row">
        <div class="poperty-data">Register number</div>
        <div
          notranslate
          class="value-data">{{ owner.organization.commercialRegister.registerNumber }}</div>
      </div>
      <div
        v-if="val(owner, item => item.communication.phone1)"
        class="flex-row">
        <div class="poperty-data">Phone</div>
        <div
          notranslate
          class="value-data">{{ owner.communication.phone1 }}</div>
      </div>
      <div
        v-if="val(owner, item => item.communication.cell1)"
        class="flex-row">
        <div class="poperty-data">Cell phone</div>
        <div
          notranslate
          class="value-data">{{ owner.communication.cell1 }}</div>
      </div>
      <div
        v-if="val(owner, item => item.communication.fax)"
        class="flex-row">
        <div class="poperty-data">Fax</div>
        <div
          notranslate
          class="value-data">{{ owner.communication.fax }}</div>
      </div>
      <div
        v-if="val(owner, item => item.communication.email)"
        class="flex-row">
        <div class="poperty-data">Email</div>
        <div
          notranslate
          class="value-data">{{ owner.communication.email }}</div>
      </div>
      <div
        v-if="val(owner, item => item.communication.website1)"
        class="flex-row">
        <div class="poperty-data">Website</div>
        <div
          notranslate
          class="value-data">
          <a
            :href="owner.communication.website1"
            target="_blank"
            notranslate>
            {{ owner.communication.website1 }}
          </a>
        </div>
      </div>
      <div
        v-if="owner.owners"
        class="flex-row cursor-show"
        @click="ownerDetail = !ownerDetail">
        <div class="poperty-data">Owners</div>
        <div class="value-data">
          <button
            type="button"
            class="btn btn-xs btn-default cursor-none">
            Show <i
              :class="{'fa-angle-up': ownerDetail, 'fa-angle-down': !ownerDetail}"
              class="fa"/>
          </button>
        </div>
      </div>
      <div v-if="ownerDetail">
        <owner-details
          v-for="(ow, ownerKey) in owner.owners"
          :key="ownerKey"
          :owner="ow"/>
      </div>
    </div>
  </div>
</template>
