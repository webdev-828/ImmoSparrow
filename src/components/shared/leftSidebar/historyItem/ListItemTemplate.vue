<template>
  <li>
    <div class="font-w600">
      <span
        v-if="editName"
        notranslate>
        <input
          ref="editInput"
          :value="formatedNameForEdit"
          class="form-control"
          @keydown.enter.prevent="saveName($event.target.value)">
      </span>
      <span
        v-else
        v-html="formatedName"/>
    </div>
    <div class="font-s12 font-w400 text-muted margin-b-5">
      <span notranslate>{{ getDate(item.lastUsedTime) }}</span> at <span notranslate>{{ getTime(item.lastUsedTime) }}</span>
    </div>
    <div
      :class="{ 'liActiveRecord': item.isLoading }"
      class="additional-controlls">
      <div class="btn-group">
        <button
          v-tooltip.bottom="{ content: 'Search again', delay: { show: 700, hide: 100 } }"
          class="btn btn-sm btn-default bg-white"
          type="button"
          @click="sendAction('search')">
          <i :class="[item.isLoading ? 'fa fa-circle-o-notch fa-spin' : 'glyphicon glyphicon-repeat']"/>
        </button>
        <button
          v-tooltip.bottom="{ content: 'Toggle search is favorite', delay: { show: 700, hide: 100 } }"
          v-if="isHistory"
          class="btn btn-sm btn-default bg-white"
          type="button"
          @click="sendAction('toggleBookmark')">
          <i class="fa fa-star-o"/>
        </button>
        <template v-else>
          <template v-if="editName">
            <button
              v-tooltip.bottom="{ content: 'Save name', delay: { show: 700, hide: 100 } }"
              :disabled="formatedNameForEdit === ''"
              class="btn btn-sm btn-default bg-white"
              type="button"
              @click="saveName($refs.editInput.value)">
              <i class="fa fa-save"/>
            </button>
            <button
              v-tooltip.bottom="{ content: 'Exit', delay: { show: 700, hide: 100 } }"
              class="btn btn-sm btn-default bg-white"
              type="button"
              @click="editName = false">
              <i class="fa fa-times"/>
            </button>
          </template>
          <button
            v-tooltip.bottom="{ content: 'Update Name', delay: { show: 700, hide: 100 } }"
            v-else
            class="btn btn-sm btn-default bg-white"
            type="button"
            @click="editName = true">
            <i class="fa fa-edit"/>
          </button>
        </template>
        <button
          v-tooltip.bottom="{ content: 'Delete', delay: { show: 700, hide: 100 } }"
          :disabled="item.isDeleting"
          class="btn btn-sm btn-default bg-white"
          type="button"
          @click="isHistory ? sendAction('removeFromList') : sendAction('toggleBookmark')">
          <i :class="['fa', item.isDeleting ? 'fa-circle-o-notch fa-spin' : 'fa-trash']"/>
        </button>
      </div>
    </div>
  </li>
</template>
