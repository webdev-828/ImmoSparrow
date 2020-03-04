<template>
  <div class="tab-pane active">
    <div class="right-side-panel">
      <div class="data-section stand-out">
        <div class="section-label">
          <div class="label-copy">Ad-History</div>
          <div class="section-controls">
            <div class="btn-group">
              <button
                :class="{active: adsToShow === 'all'}"
                type="button"
                class="btn btn-sm btn-default"
                @click="showAds('all')"
              >All</button>
              <button
                :class="{active: adsToShow === 'active'}"
                type="button"
                class="btn btn-sm btn-default"
                @click="showAds('active')"
              ><i class="fa fa-circle text-success"/> Active</button>
              <button
                :class="{active: adsToShow === 'inactive'}"
                type="button"
                class="btn btn-sm btn-default"
                @click="showAds('inactive')"
              ><i class="fa fa-circle text-error"/> Inactive</button>
            </div>
          </div>
        </div>
        <div class="section-content">
          <div class="table-flex-col">
            <div class="fancy-timeline">
              <ul class="list list-timeline">
                <li
                  v-for="ad in adsFiltered"
                  :key="ad.id"
                >
                  <ad-preview
                    :ad="ad"
                  />
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
