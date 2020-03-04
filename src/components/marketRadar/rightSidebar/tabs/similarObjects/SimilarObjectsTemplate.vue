<template>
  <div class="tab-pane active">
    <div
      class="data-section"
    >
      <div class="section-label with-background bg-gray-lighter">
        <div class="label-copy">
          Objects <span class="text-muted">(<span>{{ selectedAds.length }}</span> selected)</span>
        </div>
        <div class="section-controls">
          <span class="margin-l-10">
            <label class="css-input css-checkbox css-checkbox-primary css-checkbox-rounded css-checkbox-sm">
              <input
                v-model="allSelected"
                type="checkbox"
                class="font-s12">
              Select all <span/>
            </label>
          </span>
        </div>
      </div>
      <div
        id="mr"
        class="section-content">
        <div class="table-flex-col">
          <div class="objects-container">
            <div
              v-for="(ad, index) in ads"
              :key="index"
              :data-num="index + 1"
              class="object-item-wrap"
              @mouseenter="highlightOnMap(ad.id)"
              @mouseleave="highlightOnMap(null)"
            >
              <similar-object-preview
                :ad="ad"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
