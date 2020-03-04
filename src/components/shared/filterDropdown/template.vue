<template>
  <div
    class="btn-group">
    <button
      v-tooltip.top="{ content: tooltipContent, delay: { show: 700, hide: 100 }}"
      :disabled="disabled"
      type="button"
      class="btn btn-sm btn-default"
      data-toggle="dropdown"
      aria-expanded="false">
      <span><i :class="icon"/>
        <span
          v-if="selectedOption.text">
          <span v-if="translate || selectedOption.text === 'Show All'">{{ selectedLabel(selectedOption) }}</span>
          <span
            v-else
            notranslate>{{ selectedLabel(selectedOption) }}</span>
        </span>
        <span v-else> {{ placeholder }} </span>
      </span><span class="caret margin-l-10" />
    </button>
    <ul
      class="filter-dropdown dropdown-menu dropdown-menu-right">
      <li>
        <div>
          <div
            :class="{'short-width': shortWidth}"
            class="flex-head fancy-shadow"
            @click.stop>
            <div class="data-section">
              <div class="section-label">
                <div class="label-copy">
                  <i :class="icon"/> {{ title }}
                </div>
              </div>
              <div
                v-if="searchable"
                class="section-content">
                <div class="margin-b-10">
                  <input
                    v-model="searchQuery"
                    type="text"
                    placeholder="Search by name"
                    class="form-control">
                </div>
              </div>
            </div>
          </div>
          <div class="flex-scroll show-scrollbar">
            <div class="tab-content">
              <div class="tab-pane active">
                <div class="section-content">
                  <ul class="list list-selectable padding-top-5">
                    <li
                      v-for="(option, index) in filteredOptions"
                      :key="index"
                      :class="{'active': selectedOption.value === option.value && selectedOption.text === option.text}"
                      @click="selectOption(option)">
                      <div class="filter-row">
                        <div
                          :class="{'text-primary font-w600': selectedOption.value === option.value && selectedOption.text === option.text}"
                          class="name">
                          <span v-if="translate || option.text === 'Show All'">{{ label(option) }}</span>
                          <span
                            v-else
                            notranslate>{{ label(option) }}</span>
                        </div>
                        <div class="text-muted">
                          <span
                            :class="option.count === 0 ? '' : 'counter-accented'"
                            notranslate
                            class="ispc-counter large-counter">{{ option.count }}</span>
                        </div>
                        <!-- <div
                          v-if="selectedOption.value === option.value && selectedOption.text === option.text"
                          class="text-primary">
                          <i class="fa fa-check"/>
                        </div> -->
                      </div>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </li>
    </ul>
  </div>
</template>
