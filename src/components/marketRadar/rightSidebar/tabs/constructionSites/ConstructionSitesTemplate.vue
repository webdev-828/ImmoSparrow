<template>
  <div class="tab-pane active padding-b-20">
    <div class="data-section stand-out">
      <div class="section-label">
        <div class="label-copy">Construction Sites</div>
      </div>
      <div class="section-content">
        <div class="numbered-param-table">
          <div
            v-for="(i, index) in ['Stylische Wohnung - ideal für Singles oder zu Zweit', 'Gönnen Sie sich diesen Doppel-Wohn-Traum', 'Iconic apartment with direct lake access, pool and squash!']"
            :key="index"
            class="param-table-item"
            @click="selectedBuildingSite = true">
            <div class="table-item-number">
              <span>{{ index + 1 }}</span>
            </div>
            <div class="table-item-data">
              <div class="item-data-title">
                {{ i }}
              </div>
              <div class="item-data-param">
                {{ (index + 1) * 100 }} m
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <right-sidebar
      v-if="selectedBuildingSite"
      :aside-id="'sidebar-object-fixed-3'"
      :additionalClasses="['w-350', 'just-header-vb']"
      :disableToggling="true"
      @closed="selectedBuildingSite = null">
      <template v-slot:title>
        <div class="block__with-image">
          <div class="number-block">1</div>
          <div class="font-s13 font-w600 title-line">
            Eine Klasse für sich – Luxuriöse Terrassenwohnung mit Seeblick
          </div>
        </div>
      </template>
      <template v-slot:content>
        <div
          v-bar
          class="detail-content">
          <div class="tab-content">
            <div class="tab-pane active padding-b-20">
              <div>
                <div class="data-section stand-out">
                  <div class="section-content">
                    <div
                      class="image-container margin-b-10"
                      style="min-height: auto;">
                      <div class="container-content">
                        <img src="https://axresources.azurewebsites.net/image/get/c3df5d72-1641-a9e2-d6f0-6251191e48aa/?mw=1760&mh=1083&q=90">
                      </div>
                    </div>
                    <div class="font-s13 font-w600 margin-b-10">
                      Rue Dr-Alfred-Vincent 17, 1201 Genève
                    </div>
                    <p class="font-s13">
                      Das grosszügige 6½-Zimmer Terrassenhaus mit rund 187m² Netto-Wohnfläche befindet sich an sonniger Wohnlage in einem ruhigen und attraktiven Einfamilienhausquartier von Rüti und besticht durch eine herrliche Weitsicht in die umliegende Berglandschaft. Dieses verfügt zudem über einen eigenen Landanteil
                    </p>
                    <div class="fluid-data-table flex-option two-col">
                      <div class="fluid-cell-wrap">
                        <div class="fluid-cell">
                          <div class="attribute">Status</div>
                          <div class="value">On Going</div>
                        </div>
                      </div>
                      <div class="fluid-cell-wrap">
                        <div class="fluid-cell">
                          <div class="attribute">Construction started</div>
                          <div class="value">2019</div>
                        </div>
                      </div>
                      <div class="fluid-cell-wrap">
                        <div class="fluid-cell">
                          <div class="attribute">Levels</div>
                          <div class="value">10</div>
                        </div>
                      </div>
                      <div class="fluid-cell-wrap">
                        <div class="fluid-cell">
                          <div class="attribute">Buildings</div>
                          <div class="value">2</div>
                        </div>
                      </div>
                      <div class="fluid-cell-wrap">
                        <div class="fluid-cell">
                          <div class="attribute">Aparments</div>
                          <div class="value">20</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </template>
    </right-sidebar>
  </div>
</template>
