<template>
  <div>
    <div class="block with-image not-viewed-yet ribbon ribbon-bookmark ribbon-info ribbon-left mouse-pointer">
      <div class="item-flap">
        <div
          v-tooltip.top="{ content: 'In Inbox since', delay: { show: 700, hide: 100 }}"
          class="entry-date">
          First seen<var notranslate> {{ val(item, item => item.trackingInfo.publicationInterval.publicationTimeUtc, item => formatDate(item)) }},</var>
          <get-time-utc
            :publicationTimeUtc="val(item, item => item.trackingInfo.publicationInterval.publicationTimeUtc, '')"
            class="value-data"/>
        </div>
      </div>
      <div class="block-image">
        <div
          :style="'background-image: url(static/img/house-placeholder.png'"
          class="placeholder"/>
        <div
          v-if="item.pictures && item.pictures.length"
          :style="`background-image: url(https://axresources.azurewebsites.net/image/get/${item.pictures[0].id}/?mw=800&mh=800&q=90`"
          class="object-image"/>
        <div
          v-else
          :style="{ backgroundImage: 'url('+photo+'', height: '100%', 'background-size': '100%', 'background-repeat': 'no-repeat' }"
          class="object-image"/>
      </div>
      <div class="block-not-image">
        <div class="block-header padding-b-0">
          <div class="header-data">
            <h5 notranslate>{{ item.primaryInfo.basicInfo.title }}</h5>
            <div class="font-s13">
              <span
                v-if="item.trackingInfo.publicationInterval.isActive"
                class="label label-sm label-success">
                On Market
              </span>
              <span
                v-else
                class="label label-sm label-danger">
                Off Market
              </span>
              <span
                class="text-muted"
                notranslate>|</span>
              <span class="label label-success">{{ getMainCategory([item.primaryInfo.basicInfo.propertyCategory]) }}</span>
              <span class="label label-default">{{ getMainCategory([], [item.primaryInfo.basicInfo.propertyTypeId]) }}</span>
            </div>
            <!-- <div class="font-s13 margin-t-5">First seen<var notranslate> {{ val(item, item => item.trackingInfo.publicationInterval.publicationTimeUtc, item => formatDate(item))}},</var>
                            <get-time-utc class="value-data" :publicationTimeUtc="val(item, item =>  item.trackingInfo.publicationInterval.publicationTimeUtc, '')"></get-time-utc>
                        </div> -->
          </div>
          <action-bar
            :item="item"
            :detailView="false"
            @shareAdLink="shareAdLink"/>
        </div>
        <item-details
          :item="item"
          :index="index"
          @showHideMap="showHideMap"
          v-on="$listeners" />
          <!--  -->
      </div>
      <div class="col-xs-12 padding-0">
        <div
          v-if="$parent.maps.indexOf(item.id) > -1"
          class="mapBox"
          @click.stop>
          <list-map :coordinates="item.address.coordinates"/>
        </div>
      </div>
    </div>
  </div>
</template>
