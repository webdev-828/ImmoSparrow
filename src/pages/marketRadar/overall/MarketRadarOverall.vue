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
                <div class="label-copy">Overall</div>
              </div>
            </div>
          </div>
          <div
            v-bar
            class="flex-scroll">
            <div class="tab-content">
              <div class="tab-pane active">
                <div class="side-panel">
                  <!-- Type -->
                  <div class="data-section stand-out">
                    <div class="section-label">
                      <div class="label-copy">Type</div>
                      <div class="section-controls">
                        <div class="btn-group">
                          <button
                            type="button"
                            data-toggle="dropdown"
                            aria-expanded="false"
                            class="btn btn-sm btn-default dropdown-toggle">
                            <span class="margin-r-5">m<sup>2</sup> Prices</span><span class="caret"/>
                          </button>
                          <ul class="dropdown-menu dropdown-menu-right">
                            <li class="dropdown-header">Type</li>
                            <li class="active"><a tabindex="-1">m<sup>2</sup> Prices</a></li>
                            <li><a tabindex="-2">Active Ads</a></li>
                            <li><a tabindex="-2">Avg Ad-Durations</a></li>
                            <li><a tabindex="-2">Pros vs. Non-Pros</a></li>
                          </ul>
                        </div>
                      </div>
                    </div>
                    <div class="section-content">
                      <!-- C -->
                    </div>
                  </div>
                  <!-- / Type -->
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
                <span class="font-w600">Result</span>
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
                    <!--  -->
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </aside>
    <!-- / Sidebar #1 -->
  </div>
</template>
