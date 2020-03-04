<template>
  <div>
    <main
      id="main-container"
      class="no-head-state no-head-vb">
      <div
        v-bar
        style="position: absolute; z-index: 1">
        <div>
          <!-- Content -->
        </div>
      </div>
    </main>
    <!-- Left Sidebar -->
    <aside
      id="side-overlay"
      class="active one-level-cap">
      <button
        type="button"
        class="back-button-extra btn btn-default pull-right side-overlay--button has-tooltip"
        data-original-title="null"><i class="arrow"/>
      </button>
      <div class="pull-right side-overlay--button nav_h">
        <a
          class="btn active has-tooltip"
          data-original-title="null">
          <span class="si si-magnifier"/>
        </a>
        <br>
        <a
          class="btn has-tooltip"
          data-original-title="null">
          <span class="si si-clock"/>
        </a>
        <br>
      </div>
      <form>
        <div class="side-panel">
          <div class="flex-head fancy-shadow">
            <div class="data-section">
              <div class="section-label">
                <div class="label-copy">Surface</div>
              </div>
            </div>
          </div>
          <div
            v-bar
            class="flex-scroll">
            <div class="tab-content">
              <div class="tab-pane active">
                <div class="side-panel">
                  <div class="data-section stand-out">
                    <div class="section-content">
                      <div class="from-group margin-b-10">
                        <label>Location</label>
                        <select
                          class="form-control">
                          <option
                            v-for="(i, index) in ['Switzerland','Canton','Commune','Locality']"
                            :key="index">{{ i }}</option>
                        </select>
                      </div>
                      <div class="from-group  margin-b-10">
                        <label>Available Building Area</label>
                        <input
                          value="120"
                          type="text"
                          class="form-control">
                      </div>
                      <div class="from-group  margin-b-10">
                        <label>Utilization</label>
                        <select
                          class="form-control">
                          <option
                            v-for="(i, index) in ['Office','Living Home','Industrial']"
                            :key="index">{{ i }}</option>
                        </select>
                      </div>
                      <div class="from-group  margin-b-10">
                        <label>Threshold</label>
                        <select
                          class="form-control">
                          <option
                            v-for="(i, index) in ['50%','60%','70%']"
                            :key="index">{{ i }}</option>
                        </select>
                      </div>
                    </div>
                  </div>
                  <!-- Controls -->
                  <div class="data-section stand-out">
                    <div class="section-content">
                      <button
                        type="button"
                        class="btn btn-block btn-sm btn-primary"
                        @click="parcelList = true">Search</button>
                    </div>
                  </div>
                  <!-- / Controls -->
                </div>
              </div>
            </div>
          </div>
        </div>
      </form>
    </aside>
    <!-- / Left Sidebar -->
    <!-- Sidebar #1 -->
    <aside
      v-move
      v-if="parcelList"
      id="sidebar-object-fixed-2"
      class="active sidebar-shadow just-header-vb">
      <div class="side-panel">
        <div class="detail-header">
          <div class="title">
            <div class="centering-block">
              <div>
                <span class="font-w600">Parcels</span>
              </div>
            </div>
          </div>
          <div class="controls">
            <button
              v-tooltip.bottom="{ content: 'Close panel', delay: { show: 700, hide: 100 }}"
              class="btn btn-sm btn-default"
              type="button"
              @click="parcelList = false">
              <i class="fa fa-close"/>
            </button>
          </div>
        </div>
        <div>
          <div
            v-bar
            class="detail-content">
            <div class="tab-content">
              <div
                class="tab-pane active"
                style="padding-bottom: 10px;">
                <div class="data-section stand-out">
                  <div class="section-content">
                    <div class="col-table-container double-col allow-wrap">
                      <div
                        v-for="(i, index) in 15"
                        :key="index"
                        class="col-table">
                        <div
                          class="object-detail-compact has-border"
                          @click="parcelDetails=true">
                          <div class="detail-data">
                            <div class="data-name">787-635-{{ i }}</div>
                            <div class="data-parameters">
                              <div class="fluid-data-table flex-option margin-b-0">
                                <div class="fluid-cell-wrap">
                                  <div class="fluid-cell">
                                    <div class="attribute">
                                      EGRID
                                    </div>
                                    <div class="value">
                                      CH576380646577
                                    </div>
                                  </div>
                                </div>
                                <div class="fluid-cell-wrap">
                                  <div class="fluid-cell">
                                    <div class="attribute">
                                      Street
                                    </div>
                                    <div class="value">
                                      Sondanella
                                    </div>
                                  </div>
                                </div>
                                <div class="fluid-cell-wrap">
                                  <div class="fluid-cell">
                                    <div class="attribute">
                                      Number
                                    </div>
                                    <div class="value">
                                      51</div>
                                  </div>
                                </div>
                                <div class="fluid-cell-wrap">
                                  <div class="fluid-cell">
                                    <div class="attribute">
                                      Zip
                                    </div>
                                    <div class="value">
                                      1772
                                    </div>
                                  </div>
                                </div>
                                <div class="fluid-cell-wrap">
                                  <div class="fluid-cell">
                                    <div class="attribute">
                                      Locality
                                    </div>
                                    <div class="value">
                                      Grolley
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </aside>
    <!-- / Sidebar #1 -->
    <!-- Sidebar #2 -->
    <aside
      v-move
      v-if="parcelDetails"
      id="sidebar-object-fixed"
      class="active sidebar-shadow just-header-vb">
      <div class="side-panel">
        <div class="detail-header">
          <div class="title">
            <div class="centering-block">
              <div>
                <span class="font-w600">787-635</span>
              </div>
            </div>
          </div>
          <div class="controls">
            <span>
              <button
                v-tooltip.bottom="{ content: 'Previous', delay: { show: 700, hide: 100 }}"
                class="btn btn-sm btn-default"
                type="button">
                <i class="fa fa-arrow-left"/><br>
              </button>
              <button
                v-tooltip.bottom="{ content: 'Next', delay: { show: 700, hide: 100 }}"
                class="btn btn-sm btn-default margin-r-10"
                type="button">
                <i class="fa fa-arrow-right"/>
              </button>
            </span>
            <button
              v-tooltip.bottom="{ content: 'Close panel', delay: { show: 700, hide: 100 }}"
              class="btn btn-sm btn-default"
              type="button"
              @click="parcelDetails=false">
              <i class="fa fa-close"/>
            </button>
          </div>
        </div>
        <div>
          <div
            v-bar
            class="detail-content">
            <div class="tab-content">
              <div
                class="tab-pane active"
                style="padding-bottom: 10px;">
                <div class="carousel-block">
                  <div class="VueCarousel">
                    <div class="VueCarousel-wrapper">
                      <div
                        class="VueCarousel-inner"
                        style="transform: translate(0px, 0px); transition: transform 0.5s ease 0s; flex-basis: 429px; visibility: visible; height: auto;">
                        <div
                          tabindex="-1"
                          aria-hidden="true"
                          role="tabpanel"
                          class="VueCarousel-slide">
                          <div
                            class="image"
                            style="background-image: url(&quot;https://axresources.azurewebsites.net/image/get/94ff6294-daa8-d207-8349-dfd9ac41ddad/?mw=500&amp;mh=500&amp;q=90&quot;); width: 100%; height: 100%; background-size: 100%; background-repeat: no-repeat;">
                            <i class="fa fa-expand"/>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div class="data-section stand-out">
                  <div class="section-label">
                    <div class="label-copy">Building</div>
                  </div>
                  <div class="section-content">
                    <div class="fluid-data-table flex-option two-col">
                      <div class="fluid-cell-wrap">
                        <div class="fluid-cell">
                          <div class="attribute">EGID</div>
                          <div class="value">1011555</div>
                        </div>
                      </div>
                      <div class="fluid-cell-wrap">
                        <div class="fluid-cell">
                          <div class="attribute">Built Year</div>
                          <div class="value">1975</div>
                        </div>
                      </div>
                      <div class="fluid-cell-wrap">
                        <div class="fluid-cell">
                          <div class="attribute">Category</div>
                          <div class="value">Residential Building With Secondary Use</div>
                        </div>
                      </div>
                      <div class="fluid-cell-wrap">
                        <div class="fluid-cell">
                          <div class="attribute">Renovation Year</div>
                          <div class="value"/>
                        </div>
                      </div>
                      <div class="fluid-cell-wrap">
                        <div class="fluid-cell">
                          <div class="attribute">Total Floors</div>
                          <div class="value">6</div>
                        </div>
                      </div>
                      <div class="fluid-cell-wrap">
                        <div class="fluid-cell">
                          <div class="attribute">BFS Number</div>
                          <div class="value">6621</div>
                        </div>
                      </div>
                      <div class="fluid-cell-wrap">
                        <div class="fluid-cell">
                          <div class="attribute">Cadastre District</div>
                          <div class="value">21</div>
                        </div>
                      </div>
                      <div class="fluid-cell-wrap">
                        <div class="fluid-cell">
                          <div class="attribute">Number</div>
                          <div class="value">c528</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div class="data-section stand-out">
                  <div class="section-label">
                    <div class="label-copy">Property</div>
                  </div>
                  <div class="section-content">
                    <div class="fluid-data-table flex-option two-col">
                      <div class="fluid-cell-wrap">
                        <div class="fluid-cell">
                          <div class="attribute">EGRID</div>
                          <div class="value">CH576380646577</div>
                        </div>
                      </div>
                      <div class="fluid-cell-wrap">
                        <div class="fluid-cell">
                          <div class="attribute">Property Area</div>
                          <div class="value"><span>413 m<sup>2</sup></span></div>
                        </div>
                      </div>
                      <div class="fluid-cell-wrap">
                        <div class="fluid-cell">
                          <div class="attribute">BFS Number</div>
                          <div class="value">6621</div>
                        </div>
                      </div>
                      <div class="fluid-cell-wrap">
                        <div class="fluid-cell">
                          <div class="attribute">Cadastre District</div>
                          <div class="value">21</div>
                        </div>
                      </div>
                      <div class="fluid-cell-wrap">
                        <div class="fluid-cell">
                          <div class="attribute">Parcel Number</div>
                          <div class="value">2085</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </aside>
    <!-- / Sidebar #2 -->
  </div>
</template>
