<template>
  <div class="padding-b-20">
    <div class="carousel-block" >
      <vue-gallery
        :images="photos"
        :index="index"
        @close="closeFullScreen(index)"/>
      <carousel
        ref="cur"
        :navigateTo="0"
        :value="navigateTo"
        :paginationEnabled="true"
        :per-page="1"
        :mouse-drag="false"
        :spacePadding="0"
        :paginationColor="'#ccc'"
        :paginationActiveColor="'#5c90d2'"
        :navigationEnabled="true"
        @page-change="pageChanged">
        <slide
          v-for="(p, imageIndex) in photos"
          :key="imageIndex">
          <div
            :style="{ 'background-image': 'url(' + p + ')', 'width': '100%', 'height': '100%', 'background-size': '100%', 'background-repeat': 'no-repeat' }"
            class="image"
            @click="clickOnImg(imageIndex)">
            <i
              class="fa fa-expand"
            />
          </div>
        </slide>
      </carousel>
    </div>
    <div class="data-section stand-out">
      <div class="section-label">
        <div class="label-copy">Building</div>
      </div>
      <div class="section-content">
        <!-- New Data Table -->
        <div class="fluid-data-table flex-option two-col">
          <div class="fluid-cell-wrap">
            <div class="fluid-cell">
              <div class="attribute">EGID</div>
              <div
                class="value"
                notranslate>{{ val(buildingOnAddress, item => item.address.govId.egid, "") }}</div>
            </div>
          </div>
          <div class="fluid-cell-wrap">
            <div class="fluid-cell">
              <div class="attribute">Built Year</div>
              <div
                class="value">{{ val(buildingOnAddress, item => item.primaryInfo.builtYear, "") }}</div>
            </div>
          </div>
          <div class="fluid-cell-wrap">
            <div class="fluid-cell">
              <div class="attribute">Category</div>
              <div
                class="value"
                notranslate>{{ buildingOnAddress.primaryInfo.gwsCategory ? rawCategories[buildingOnAddress.primaryInfo.gwsCategory]: "" }}</div>
            </div>
          </div>
          <!-- <div class="fluid-cell-wrap">
            <div class="fluid-cell">
              <div class="attribute">Type</div>
              <div class="value">{{val(buildingOnAddress, item => item.primaryInfo.type, "")}}</div>
            </div>
          </div> -->
          <!-- <div class="fluid-cell-wrap">
            <div class="fluid-cell">
              <div class="attribute">Volume</div>
              <div class="value">MISSING FROM API</div>
            </div>
          </div> -->
          <div class="fluid-cell-wrap">
            <div class="fluid-cell">
              <div class="attribute">Renovation Year</div>
              <div
                class="value"
                notranslate>{{ val(buildingOnAddress, item => item.primaryInfo.renovationYear, "") }}</div>
            </div>
          </div>
          <div class="fluid-cell-wrap">
            <div class="fluid-cell">
              <div class="attribute">Total Floors</div>
              <div
                class="value"
                notranslate>{{ val(buildingOnAddress, item => item.primaryInfo.floorCount, "") }}</div>
            </div>
          </div>
          <div class="fluid-cell-wrap">
            <div class="fluid-cell">
              <div class="attribute">BFS Number</div>
              <div
                class="value"
                notranslate>{{ val(buildingOnAddress, item => item.identity.communeBfsNumber, "") }}</div>
            </div>
          </div>
          <div class="fluid-cell-wrap">
            <div class="fluid-cell">
              <div class="attribute">Cadastre District</div>
              <div
                class="value"
                notranslate>{{ val(buildingOnAddress, item => item.identity.cadastreDistrict, "") }}</div>
            </div>
          </div>
          <div class="fluid-cell-wrap">
            <div class="fluid-cell">
              <div class="attribute">Number</div>
              <div
                class="value"
                notranslate>{{ val(buildingOnAddress, item => item.identity.buldingNumber, "") }}</div>
            </div>
          </div>
        </div>
        <!-- / New Data Table -->
      </div>
    </div>
    <!--  -->
    <div class="data-section stand-out">
      <div class="section-label">
        <div class="label-copy">Property</div>
      </div>
      <div class="section-content">
        <div class="fluid-data-table flex-option two-col">
          <div class="fluid-cell-wrap">
            <div class="fluid-cell">
              <div class="attribute">EGRID</div>
              <div
                class="value"
                notranslate>{{ val(buildingOnAddress, item => item.realProperty.identity.egrid, "") }}</div>
            </div>
          </div>
          <div class="fluid-cell-wrap">
            <div class="fluid-cell">
              <div class="attribute">Property Area</div>
              <div
                class="value">
                <span v-if="val(buildingOnAddress, item => item.realProperty.primaryInfo.area)">
                  {{ val(buildingOnAddress, item => item.realProperty.primaryInfo.area, "") }} m<sup>2</sup>
                </span>
              </div>
            </div>
          </div>
          <div class="fluid-cell-wrap">
            <div class="fluid-cell">
              <div class="attribute">BFS Number</div>
              <div
                class="value"
                notranslate>{{ val(buildingOnAddress, item => item.realProperty.identity.communeBfsNumber, "") }}</div>
            </div>
          </div>
          <div class="fluid-cell-wrap">
            <div class="fluid-cell">
              <div class="attribute">Cadastre District</div>
              <div
                class="value"
                notranslate>{{ val(buildingOnAddress, item => item.realProperty.identity.cadastreDistrict, "") }}</div>
            </div>
          </div>
          <div class="fluid-cell-wrap">
            <div class="fluid-cell">
              <div class="attribute">Parcel Number</div>
              <div
                class="value"
                notranslate>{{ val(buildingOnAddress, item => item.realProperty.identity.parcelNumber, "") }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <!--  -->
    <div
      v-if="showApartments.length"
      class="data-section stand-out">
      <div class="section-label">
        <div class="label-copy">Apartments <span
          class="text-muted font-w400"
          notranslate>{{ showApartments.length }}</span></div>
        <div
          v-if="showApartments.length > 1"
          class="section-controls">
          <span class="font-s12 margin-r-10"><strong notranslate>{{ slidePage + 1 }}</strong> of <strong notranslate>{{ showApartments.length }}</strong></span>
          <button
            v-tooltip.top="{ content: 'Previous apartment', delay: { show: 700, hide: 100 }}"
            v-if="slidePage > 0"
            class="btn btn-sm btn-default"
            @click="prevSlide"><i class="fa fa-angle-left"/></button>
          <button
            v-tooltip.top="{ content: 'Next apartment', delay: { show: 700, hide: 100 }}"
            v-if="slidePage + 1 < showApartments.length"
            class="btn btn-sm btn-default"
            @click="nextSlide">
          <i class="fa fa-angle-right"/></button>
        </div>
      </div>

      <carousel
        ref="cur1"
        :per-page="1"
        :mouse-drag="false"
        :spacePadding="0"
        :paginationEnabled="false"
        :navigationEnabled="false"
        class="section-content"
        @pageChange="pageChangedApartments">
        <slide
          v-for="apartment in showApartments"
          :key="apartment.id">
          <div class="font-w600 font-s13 margin-b-5">
            <span notranslate>{{ getApartmentTitle(apartment) }}</span>
            <!--{{val(apartment, item => item.primaryInfo.level, "")}}-->
          </div>
          <div class="fluid-data-table flex-option two-col">
            <div class="fluid-cell-wrap">
              <div class="fluid-cell">
                <div
                  class="attribute">
                  EWID
                </div>
                <div
                  class="value"
                  notranslate>
                  {{ val(apartment, item => item.address.govId.ewid, "") }}
                </div>
              </div>
            </div>
            <div class="fluid-cell-wrap">
              <div class="fluid-cell">
                <div
                  class="attribute">
                  Rooms
                </div>
                <div
                  class="value"
                  notranslate>
                  {{ val(apartment, item => item.primaryInfo.roomCount, "") }}
                </div>
              </div>
            </div>
            <div class="fluid-cell-wrap">
              <div class="fluid-cell">
                <div
                  class="attribute">
                  Living Area
                </div>
                <div
                  class="value"
                  notranslate>
                  <span v-if="val(apartment, item => item.primaryInfo.livingArea)">
                    {{ val(apartment, item => item.primaryInfo.livingArea, "") }} m<sup>2</sup>
                  </span>
                </div>
              </div>
            </div>
            <div class="fluid-cell-wrap">
              <div class="fluid-cell">
                <div
                  class="attribute">
                  Level
                </div>
                <div
                  class="value"
                  notranslate>
                  {{ val(apartment, item => item.primaryInfo.level, "") }}
                </div>
              </div>
            </div>
            <div class="fluid-cell-wrap">
              <div class="fluid-cell">
                <div
                  class="attribute">
                  Level number
                </div>
                <div
                  class="value"
                  notranslate>
                  {{ val(apartment, item => item.primaryInfo.levelNumber, "") }}
                </div>
              </div>
            </div>
            <div class="fluid-cell-wrap">
              <div class="fluid-cell">
                <div
                  class="attribute">
                  Position
                </div>
                <div
                  class="value"
                  notranslate>
                  {{ val(apartment, item => item.primaryInfo.position, "") }}
                </div>
              </div>
            </div>
            <div class="fluid-cell-wrap">
              <div class="fluid-cell">
                <div
                  class="attribute">
                  Admin number
                </div>
                <div
                  class="value"
                  notranslate>
                  {{ val(apartment, item => item.primaryInfo.adminNumber, "") }}
                </div>
              </div>
            </div>
          </div>
        </slide>
      </carousel>
    </div>

    <!-- Inhabitants -->
    <inhabitants :entrenceId="entrId"/>

    <!-- Owners -->
    <owners
      :item="buildingOnAddress"
      :entrenceId="entrId" />

  </div>
</template>
