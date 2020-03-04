<template>
  <div>
    <div
      id="head-container"
      class="bg-white">
      <div
        class="main-section">
        <div
          class="title-section">
          <span>Performance</span>
        </div>
        <div class="padding-r-10">
          <div class="btn-group">
            <button
              type="button"
              data-toggle="dropdown"
              aria-expanded="false"
              class="btn btn-sm btn-default"><span>ImmoSparrow </span><span class="caret margin-l-10"/></button>
            <ul
              class="dropdown-menu">
              <li class="dropdown-header">Teams</li>
              <li class="active"><a href="#">ImmoSparrow</a></li>
              <li><a href="#">Real Estate Masters</a></li>
            </ul>
          </div>
          <div class="btn-group">
            <button
              type="button"
              data-toggle="dropdown"
              aria-expanded="false"
              class="btn btn-sm btn-default"><span>by Pipe </span><span class="caret margin-l-10"/></button>
            <ul
              class="dropdown-menu">
              <li class="active"><a href="#">by Pipe</a></li>
              <li><a href="#">Inbox</a></li>
            </ul>
          </div>
        </div>
        <div class="info-section">
          <small/>
        </div>
        <div
          class="control-section">
          <div class="btn-toolbar">
            <div
              class="btn-group"
              role="group">
              <button
                type="button"
                class="btn btn-sm btn-flexible btn-default dropdown-toggle"
                data-toggle="dropdown"
                aria-haspopup="true"
                aria-expanded="false">
                Date Range
                <span class="caret"/>
              </button>
              <ul
                class="dropdown-menu dropdown-menu-right"
                @click.stop>
                <li class="dropdown-header">Choose date range</li>
                <li>
                  <div class="datepic">
                    <datepicker
                      :input-class="'form-control input-sm'"
                      :typeable="false"
                      :calendar-class="'rightside-datepicker'"
                      :placeholder="'From'"/>
                    <div class="date-separator">—</div>
                    <datepicker
                      :input-class="'form-control input-sm'"
                      :typeable="false"
                      :calendar-class="'rightside-datepicker'"
                      :placeholder="'To'"/>
                  </div>
                  <div class="datepic-controls text-right">
                    <button
                      type="button"
                      class="btn btn-sm btn-default no-float"
                      @click.stop>Reset</button>
                    <button
                      type="button"
                      class="btn btn-sm btn-success no-float"
                      @click.stop>Apply</button>
                  </div>
                </li>
              </ul>
            </div>
            <div class="btn-group">
              <button
                type="button"
                class="btn btn-sm btn-default"><i class="fa fa-download"/> Download as Excel</button>
            </div>
          </div>
        </div>
      </div>
    </div>
    <main
      id="main-container"
      class="standard-vb table-page">
      <div
        v-bar
        style="position: absolute; z-index: 1">
        <div>
          <div class="objects-list">
            <div class="row">
              <div class="col-sm-2">
                <div class="block margin-b-20">
                  <div class="block-content padding-0 padding-t-10 padding-b-10">
                    <div class="data-section stand-out">
                      <div class="section-content text-center">
                        <img
                          src="https://ispcapi-stage.azurewebsites.net/files/Agencies/8b1000c6-f987-4c26-b4f5-8a0abea62e3f/Profile/Logo/ad3fa88b-e963-4406-9e16-f8bf80b5895c.jpg"
                          alt="uploaded image"
                          class="width40percent">
                      </div>
                    </div>
                    <div class="data-section stand-out">
                      <div class="section-label">
                        <div class="label-copy">Immosprarrow</div>
                      </div>
                      <div class="section-content padding-t-0">
                        <div class="fluid-data-table flex-option">
                          <div class="fluid-cell-wrap">
                            <div class="fluid-cell">
                              <div class="attribute">New Leads</div>
                              <div class="value">78</div>
                            </div>
                          </div>
                          <div class="fluid-cell-wrap">
                            <div class="fluid-cell">
                              <div class="attribute">Contacted</div>
                              <div class="value">71</div>
                            </div>
                          </div>
                          <div class="fluid-cell-wrap">
                            <div class="fluid-cell">
                              <div class="attribute">Appointment</div>
                              <div class="value">59</div>
                            </div>
                          </div>
                          <div class="fluid-cell-wrap">
                            <div class="fluid-cell">
                              <div class="attribute">Deal</div>
                              <div class="value">40</div>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div class="section-content">
                        <div class="chart-block table-flex-col no-margins">
                          <div class="chart-instance full-width">
                            <div class="flex-row-header bg-gray-lighter margin-b-10 text-center">Success ratio</div>
                            <radial-progress-bar
                              :diameter="100"
                              :startColor="'#46c37b'"
                              :stopColor="'#46c37b'"
                              :strokeWidth="5"
                              :innerStrokeColor="'#ebebeb'"
                              :completed-steps="54"
                              :total-steps="100">
                              <span notranslate>54%</span>
                            </radial-progress-bar>
                            <div class="chart-label">
                              <div>Very Good</div>
                              <div><small class="text-muted">78 NewLeads / 40 Deals</small></div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div class="block margin-b-20">
                  <div class="block-content padding-0 padding-t-10 padding-b-10">
                    <div class="data-section stand-out">
                      <div class="section-label">
                        <div class="label-copy">Employee Rank</div>
                      </div>
                      <div class="section-content padding-t-0">
                        <div class="fluid-data-table flex-option">
                          <div class="fluid-cell-wrap">
                            <div class="fluid-cell">
                              <div class="attribute">1. Juliane Wolf</div>
                              <div class="value">70%</div>
                            </div>
                          </div>
                          <div class="fluid-cell-wrap">
                            <div class="fluid-cell">
                              <div class="attribute">2. Daniela Eisenberg</div>
                              <div class="value">63%</div>
                            </div>
                          </div>
                          <div class="fluid-cell-wrap">
                            <div class="fluid-cell">
                              <div class="attribute">3. Bernd Vogler</div>
                              <div class="value">61%</div>
                            </div>
                          </div>
                          <div class="fluid-cell-wrap">
                            <div class="fluid-cell">
                              <div class="attribute">4. Doreen Maurer</div>
                              <div class="value">51%</div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div class="col-sm-10">
                <div
                  v-for="(i, index) in ['Juliane Wolf','Daniela Eisenberg','Bernd Vogler','Doreen Maurer']"
                  :key="index"
                  class="block margin-b-20">
                  <div
                    class="block-content padding-0 padding-t-10 padding-b-10">
                    <div class="data-section stand-out">
                      <div class="section-label">
                        <div class="label-copy">{{ i }}</div>
                        <div class="section-controls">
                          <button
                            class="btn btn-sm btn-default cursor-none has-tooltip"
                            data-original-title="null"><i class="fa fa-angle-up"/></button>
                        </div>
                      </div>
                      <div class="section-content padding-t-0">
                        <div class="row">
                          <div class="col-xs-10">
                            <table class="table table-condensed table-striped">
                              <thead>
                                <tr>
                                  <th class="width40percent">Pipe</th>
                                  <th>New Leads</th>
                                  <th>Contacted</th>
                                  <th>Appointment</th>
                                  <th>Deal</th>
                                  <th>Ratio</th>
                                </tr>
                              </thead>
                              <tbody>
                                <tr
                                  v-for="(i, index) in ['Zurich combo','Bern Apartments below 1m', 'Bern apartments and houses', 'Apartments for Gunter']"
                                  :key="index"
                                  class="hovertr"
                                  @click.stop="monitorSidebar=true">
                                  <td class="font-w600">{{ i }}</td>
                                  <td v-if="index == 0">15</td>
                                  <td v-else>12</td>
                                  <td>13</td>
                                  <td>8</td>
                                  <td>5</td>
                                  <td>0.5</td>
                                </tr>
                                <tr class="bottom-line">
                                  <td>Total</td>
                                  <td>48</td>
                                  <td>32</td>
                                  <td>24</td>
                                  <td>19</td>
                                  <td>0.7</td>
                                </tr>
                              </tbody>
                            </table>
                          </div>
                          <div class="col-xs-2 padding-l-0">
                            <div class="chart-block table-flex-col no-margins margin-t-10">
                              <div class="chart-instance full-width">
                                <div class="flex-row-header bg-gray-lighter margin-b-10 text-center">Success ratio</div>
                                <radial-progress-bar
                                  :diameter="100"
                                  :startColor="'#46c37b'"
                                  :stopColor="'#46c37b'"
                                  :strokeWidth="5"
                                  :innerStrokeColor="'#ebebeb'"
                                  :completed-steps="79"
                                  :total-steps="100">
                                  <span notranslate>79%</span>
                                </radial-progress-bar>
                                <div class="chart-label">
                                  <div>Very Good</div>
                                  <div><small class="text-muted">16 NewLeads / 10 Deals</small></div>
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
    </main>
  </div>
</template>
