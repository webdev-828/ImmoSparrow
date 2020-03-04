<template>
  <div class="side-panel">
    <!-- Lifetime -->
    <div class="data-section stand-out">
      <div class="section-label">
        <div class="label-copy">Lifetime</div>
      </div>
      <div class="section-content">
        <div class="fluid-data-table flex-option two-col">
          <div class="fluid-cell-wrap">
            <div class="fluid-cell">
              <div
                class="attribute">
                First Seen
              </div>
              <div
                v-if="val(item, item => item.trackingInfo.publicationInterval.publicationTimeUtc, item => formatDate(item))"
                class="value"
                notranslate>
                {{ val(item, item => item.trackingInfo.publicationInterval.publicationTimeUtc, item => formatDate(item), "") }}
              </div>
              <div
                v-else
                class="value">&nbsp;</div>
            </div>
          </div>
          <div class="fluid-cell-wrap">
            <div class="fluid-cell">
              <div
                class="attribute">
                Last Checked
              </div>
              <div
                v-if="val(item, item => item.trackingInfo.publicationInterval.lastUpdateTimeUtc, item => formatDate(item))"
                class="value"
                notranslate>
                {{ val(item, item => item.trackingInfo.publicationInterval.lastUpdateTimeUtc, item => formatDate(item), "") }}
              </div>
              <div
                v-else
                class="value">&nbsp;</div>
            </div>
          </div>
          <div class="fluid-cell-wrap">
            <div class="fluid-cell">
              <div
                class="attribute">
                Deleted
              </div>
              <div
                v-if="val(item, item => item.trackingInfo.publicationInterval.deleteTimeUtc, item => formatDate(item))"
                class="value"
                notranslate>
                {{ val(item, item => item.trackingInfo.publicationInterval.deleteTimeUtc, item => formatDate(item), "") }}
              </div>
              <div
                v-else
                class="value">&nbsp;</div>
            </div>
          </div>
          <div class="fluid-cell-wrap">
            <div class="fluid-cell">
              <div
                class="attribute">
                On Market
              </div>
              <div
                v-if="val(item, item => item.trackingInfo.publicationInterval.publicationTimeUtc)"
                class="value">
                <get-time-utc
                  :deletedTimeUtc="val(item, item => item.trackingInfo.publicationInterval.deleteTimeUtc, '')"
                  :publicationTimeUtc="val(item, item => item.trackingInfo.publicationInterval.publicationTimeUtc, '')"/>
              </div>
              <div
                v-else
                class="value">&nbsp;</div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <!-- Price Change -->
    <div class="data-section stand-out">
      <div class="section-label">
        <div class="label-copy">Price Change</div>
        <div class="section-controls font-s11">
          <button
            v-tooltip.top="{ content: 'Expand/Reduce', delay: { show: 700, hide: 100 }}"
            class="btn btn-sm btn-default"
            @click="showFullScreenPrice()"><i
              :class="{'fa-expand' : !showPriceFS, 'fa-compress' : showPriceFS}"
              class="fa"/></button>
        </div>
      </div>
      <div class="section-content">
        <div class="margin-b-10">
          <canvas id="priceChart"/>
        </div>
      </div>
    </div>
    <!-- Portals List -->
    <div class="data-section stand-out">
      <div class="section-label">
        <div class="label-copy">Portals</div>
        <div class="section-controls font-s11">
          <span class="margin-r-5"><i class="fa fa-circle text-success"/> Active</span>
          <span class="margin-r-5"><i class="fa fa-circle text-danger"/> Inactive</span>
          <button
            v-tooltip.top="{ content: 'Expand/compress list', delay: { show: 700, hide: 100 }}"
            class="btn btn-sm btn-default"
            @click="portalsCollapsed=!portalsCollapsed"><i
              :class="{'fa-expand' : !portalsCollapsed, 'fa-compress' : portalsCollapsed}"
              class="fa"/></button>
        </div>
      </div>
      <div class="section-content">
        <div
          :class="{'is-collapsed' : !portalsCollapsed}"
          class="fluid-data-table flex-option">
          <div class="fluid-cell-wrap">
            <div class="fluid-cell head-cell">
              <div
                class="attribute">
                Address
              </div>
              <div
                class="value"
                notranslate>
                <div class="mini-col">
                  Published</div>
                <div class="mini-col">
                  Closed</div>
              </div>
            </div>
          </div>
          <div
            v-for="(portal, portalKey) in getSortedPortalsInfo"
            :key="portalKey"
            class="fluid-cell-wrap">
            <div class="fluid-cell">
              <div
                class="attribute">
                <i
                  :class="{'text-success': portal.info.publicationInterval.isActive, 'text-danger': !portal.info.publicationInterval.isActive}"
                  class="fa fa-circle"/>
                <a
                  v-if="portal.info.url && portal.info.publicationInterval.isActive"
                  :href="`https://blueland.azurewebsites.net/?refreshed=${encodeURIComponent(portal.info.url)}`"
                  notranslate
                  target="_blank">{{ portal.portal.name }}</a>
                <template
                  v-else
                  notranslate>{{ portal.portal.name }}</template>
              </div>
              <div
                class="value">
                <div
                  notranslate
                  class="mini-col">
                  {{ val(portal, portal => portal.info.publicationInterval.publicationTimeUtc, portal => formatDate(portal), "") }}
                </div>
                <div
                  notranslate
                  class="mini-col">
                  {{ val(portal, portal => portal.info.publicationInterval.deleteTimeUtc, portal => formatDate(portal), "—") }}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <!-- Portals Graph -->
    <div
      class="data-section stand-out"
      style="position: relative; z-index: 999">
      <div class="section-label">
        <div class="label-copy">Portal History</div>
        <div class="section-controls font-s11 padding-r-5">
          <span class="margin-r-5"><i class="fa fa-square text-muted"/> Free</span>
          <span class="margin-r-5"><i class="fa fa-square text-primary"/> Paid</span>
          <span class="margin-r-5"><i class="fa fa-square text-danger"/> NonPublic</span>
          <span><i class="fa fa-square text-info"/> Unknown</span>
          <button
            v-tooltip.top="{ content: 'Expand/Reduce', delay: { show: 700, hide: 100 }}"
            class="btn btn-sm btn-default"
            @click="showFullScreenPortals()"><i
              :class="{'fa-expand' : !showPortalsFS, 'fa-compress' : showPortalsFS}"
              class="fa"/></button>
        </div>
      </div>
      <div class="section-content">
        <div class="margin-b-10">
          <canvas
            id="portalsChart"
            :height="diagramDynamicHeight"
            :style="`height: ${diagramDynamicHeight}px`"/>
          <div
            ref="portalsChartTooltip"
            class="tooltip-cust">
            <div class="tooltip-cust__title">{{ activeTooltipData.title }}</div>
            <table>
              <tr>
                <th/>
                <th>Published</th>
                <th>Active</th>
                <th>Closed</th>
              </tr>
              <tr>
                <td><i class="fa fa-square text-muted"/></td>
                <td
                  v-for="(free, fKey) in activeTooltipData.data.free"
                  :key="fKey">{{ free }}</td>
              </tr>
              <tr>
                <td><i class="fa fa-square text-primary"/></td>
                <td
                  v-for="(paid, PKey) in activeTooltipData.data.paid"
                  :key="PKey">{{ paid }}</td>
              </tr>
              <tr>
                <td><i class="fa fa-square text-danger"/></td>
                <td
                  v-for="(privateItem, PrKey) in activeTooltipData.data.private"
                  :key="PrKey">{{ privateItem }}</td>
              </tr>
              <tr>
                <td><i class="fa fa-square text-info"/></td>
                <td
                  v-for="(unknown, UKey) in activeTooltipData.data.unknown"
                  :key="UKey">{{ unknown }}</td>
              </tr>
            </table>
          </div>
        </div>
      </div>
    </div>
    <!-- Vendor History -->
    <div
      class="data-section stand-out">
      <div class="section-label">
        <div class="label-copy">Vendor History</div>
      </div>
      <div class="section-content">
        <div class="table-flex-col">
          <div class="fancy-timeline">
            <ul class="list list-timeline">
              <li
                v-for="(vendor, vKey) in getSortedPublishersInfo"
                :key="vKey">
                <div
                  v-if="!val(vendor, vendor => vendor.info.publicationInterval.deleteTimeUtc)"
                  class="list-timeline-time">
                  <div class="day-month">Published <var notranslate>{{ val(vendor, vendor => vendor.info.publicationInterval.publicationTimeUtc, vendor => formatDate(vendor), "") }}</var></div>
                </div>
                <div
                  v-else
                  class="list-timeline-time">
                  <div class="day-month">Closed <var notranslate>{{ val(vendor, vendor => vendor.info.publicationInterval.deleteTimeUtc, vendor => formatDate(vendor), "") }}</var></div>
                </div>
                <i
                  v-if="vendor.info.publicationInterval.isActive"
                  class="fa fa-check list-timeline-icon bg-success"/>
                <i
                  v-else
                  class="fa fa-close list-timeline-icon bg-danger"/>
                <div class="list-timeline-content margin-b-15">
                  <div class="fluid-data-table flex-option">
                    <div class="fluid-cell-wrap">
                      <div class="fluid-cell head-cell">
                        <div
                          class="attribute">
                          Name
                        </div>
                        <div
                          v-if="getPersonName(val(vendor, vendor => vendor.info.publisher.primaryInfo))"
                          class="value">
                          <strong
                            notranslate>{{ getPersonName(val(vendor, vendor => vendor.info.publisher.primaryInfo, '')) || val(vendor, vendor => vendor.info.publisher.primaryInfo.contactInfo.emailAddresses[0], "") }}</strong>
                        </div>
                        <div
                          v-else
                          class="value">&nbsp;</div>
                      </div>
                    </div>
                    <template
                      v-if="val(vendor, vendor => vendor.info.publisher.address.zip) ||
                        val(vendor, vendor => vendor.info.publisher.address.locality) ||
                        val(vendor, vendor => vendor.info.publisher.address.street) ||
                        val(vendor, vendor => vendor.info.publisher.primaryInfo.contactInfo.emailAddresses[0]) ||
                        val(vendor, vendor => vendor.info.publisher.primaryInfo.contactInfo.phoneNumbers[0]) ||
                      val(vendor, vendor => vendor.info.publisher.class)">
                      <div class="fluid-cell-wrap">
                        <div class="fluid-cell">
                          <div
                            class="attribute">
                            Email
                          </div>
                          <div
                            v-if="val(vendor, vendor => vendor.info.publisher.primaryInfo.contactInfo.emailAddresses[0])"
                            class="value"
                            notranslate>
                            {{ val(vendor, vendor => vendor.info.publisher.primaryInfo.contactInfo.emailAddresses[0], "") }}
                          </div>
                          <div
                            v-else
                            class="value">&nbsp;</div>
                        </div>
                      </div>
                      <div class="fluid-cell-wrap">
                        <div class="fluid-cell">
                          <div
                            class="attribute">
                            Address
                          </div>
                          <div
                            v-if="val(vendor, vendor => vendor.info.publisher.address.street)"
                            class="value"
                            notranslate>
                            {{ val(vendor, vendor => vendor.info.publisher.address.street, "") }} {{ val(vendor, vendor => vendor.info.publisher.address.streetNumber, "") }}
                          </div>
                          <div
                            v-else
                            class="value">&nbsp;</div>
                        </div>
                      </div>
                      <div class="fluid-cell-wrap">
                        <div class="fluid-cell">
                          <div
                            class="attribute">
                            Zip Locality
                          </div>
                          <div
                            v-if="val(vendor, vendor => vendor.info.publisher.address.zip) || val(vendor, vendor => vendor.info.publisher.address.locality)"
                            class="value"
                            notranslate>
                            {{ val(vendor, vendor => vendor.info.publisher.address.zip, "") }} {{ val(vendor, vendor => vendor.info.publisher.address.locality, "") }}
                          </div>
                          <div
                            v-else
                            class="value">&nbsp;</div>
                        </div>
                      </div>
                      <div class="fluid-cell-wrap">
                        <div class="fluid-cell">
                          <div
                            class="attribute">
                            Land Line
                          </div>
                          <div
                            v-if="val(vendor, vendor => vendor.info.publisher.primaryInfo.contactInfo.phoneNumbers[0])"
                            class="value"
                            notranslate>
                            {{ parsePhone(val(vendor, vendor => vendor.info.publisher.primaryInfo.contactInfo.phoneNumbers[0], "")) }}
                          </div>
                          <div
                            v-else
                            class="value">&nbsp;</div>
                        </div>
                      </div>
                      <div class="fluid-cell-wrap">
                        <div class="fluid-cell">
                          <div
                            class="attribute">
                            Mobile
                          </div>
                          <div
                            v-if="val(vendor, vendor => vendor.info.publisher.primaryInfo.contactInfo.mobilePhoneNumbers[0])"
                            class="value"
                            notranslate>
                            {{ parsePhone(val(vendor, vendor => vendor.info.publisher.primaryInfo.contactInfo.mobilePhoneNumbers[0], "")) }}
                          </div>
                          <div
                            v-else
                            class="value">&nbsp;</div>
                        </div>
                      </div>
                      <div class="fluid-cell-wrap">
                        <div class="fluid-cell">
                          <div
                            class="attribute">
                            Classification
                          </div>
                          <div
                            class="value">
                            <span
                              v-if="val(vendor, vendor => vendor.info.publisher.class) !== undefined"
                              class="label label-info"
                              notranslate>{{ getVendorClass(vendor.info.publisher.class) }}</span>
                            <span
                              v-tooltip="'Ad is outside of your restricted area'"
                              v-else
                              style="opacity: 0.7"
                              class="label label-default">Not available</span>
                          </div>
                        </div>
                      </div>
                    </template>
                    <template v-else>
                      <div
                        v-if="!getPersonName(val(vendor, vendor => vendor.info.publisher.primaryInfo))"
                        class="fluid-cell-wrap">
                        <div class="fluid-cell">
                          <div
                            class="attribute">
                            Vendor info not available
                          </div>
                          <div class="value"/>
                        </div>
                      </div>
                    </template>
                    <div class="fluid-cell-wrap">
                      <div class="fluid-cell">
                        <div
                          class="attribute">
                          Portals
                        </div>
                        <div
                          class="value">
                          <button
                            v-if="val(vendor, vendor => vendor.info.sites)"
                            class="btn btn-xs btn-default"
                            type="button"
                            @click="vendor.show = !vendor.show">
                            <span v-if="!vendor.show">Show</span>
                            <span v-else>Hide</span> <i
                              :class="{'fa-angle-down' : !vendor.show, 'fa-angle-up' : vendor.show}"
                              class="fa"/>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div class="table-col">
                    <!-- <div class="flex-row">
                      <div class="poperty-data">Portal</div>
                      <div class="value-data">{{ val(vendor, vendor => vendor.info.sites[0].siteId, vendor => getPortalName(vendor), "") }}</div>
                    </div> -->
                    <!-- <div class="flex-row">
                      <div class="poperty-data">Ad Status</div>
                      <div v-if="vendor.info.publicationInterval.isActive" class="value-data"><i class="fa fa-circle text-success"></i> Active</div>
                      <div v-else class="value-data"><i class="fa fa-circle text-danger"></i> Inactive</div>
                    </div> -->
                    <div
                      v-if="vendor.show"
                      class="table-flex-col"
                      style="margin-right: 0; padding-top: 0;">
                      <div
                        class="fluid-data-table flex-option margin-b-0"
                        style="width: calc(100% + 20px);">
                        <div
                          v-for="(portal, pKey) in removeDuplicates(vendor.info.sites)"
                          :key="pKey"
                          class="fluid-cell-wrap">
                          <div class="fluid-cell">
                            <div
                              class="attribute"
                              notranslate>
                              {{ portal }}
                            </div>
                            <div class="value"/>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
