<template>
  <div>
    <aside
      id="side-overlay"
      class="active">
      <div class="side-overlay--inner">
        <button
          class="btn btn-default pull-right side-overlay--button"
          type="button"
          @click="searchSidebarToggle()">
          <i class="fa fa-arrow-left"/><br>
        </button>
        <div v-bar>
          <div>
            <div class="side-content remove-padding">

              <div >
                <div
                  id="inbox-nav"
                  class="collapse navbar-collapse remove-padding">
                  <div class="block">
                    <div class="block-header bg-gray-lighter">
                      <h3 class="block-title">LEAD GENERATOR</h3>
                    </div>
                    <div class="block-content">
                      <ul class="nav nav-pills nav-stacked push">
                        <li>
                          <a @click="show_leads()">
                            <span class="badge pull-right">23</span>
                            <i class="fa fa-exchange fa-x"/> "Lead" Privatkunden Haus Zürich
                          </a>
                        </li>
                        <li>
                          <a @click="show_leads()">
                            <span class="badge pull-right">14</span>
                            <i class="fa fa-exchange fa-x"/> "Lead" Hans Meyer Haus Bern
                          </a>
                        </li>
                        <li>
                          <a @click="show_leads()">
                            <span class="badge pull-right">16</span>
                            <i class="fa fa-exchange fa-x"/> "Lead" Ueli Klein Wohnung Seuzach
                          </a>
                        </li>
                        <li>
                          <a @click="show_leads()">
                            <span class="badge pull-right">16</span>
                            <i class="fa fa-exchange fa-x"/> "Lead" Haus &gt; CHF 1'000'000 Zürich
                          </a>
                        </li>
                      </ul>
                    </div>
                  </div>

                  <div class="block">
                    <div class="block-header bg-gray-lighter">
                      <h3 class="block-title">Weitere Leads</h3>
                    </div>

                    <div class="block-content">
                      <ul class="nav nav-pills nav-stacked push">
                        <li>
                          <a @click="show_leads()">
                            <span class="badge pull-right">23</span>
                            <i class="fa fa-exchange fa-x"/> "Lead" Privatkunden Haus Zürich
                          </a>
                        </li>
                        <li>
                          <a @click="show_leads()">
                            <span class="badge pull-right">14</span>
                            <i class="fa fa-exchange fa-x"/> "Lead" Hans Meyer Haus Bern
                          </a>
                        </li>

                      </ul>
                    </div>
                  </div>
                  <div class="block">
                    <div class="block-header bg-gray-lighter">

                      <a><i class="fa fa-filter fa-x"/> Filter </a>
                    </div>
                    <div class="block-content">
                      <ul class="nav nav-pills nav-stacked push">
                        <li>

                          <a>

                            <i class=""/> Zu erlediegen
                            <div class="font-w400 text-muted">
                              <small/>
                            </div>
                          </a>
                        </li>
                        <li>
                          <a>

                            <i class=""/> Telefoniert
                            <div class="font-w400 text-muted">
                              <small/>
                            </div>
                          </a>
                        </li>
                        <li>
                          <a>

                            <i class=""/> Per Mail kontaktiert
                            <div class="font-w400 text-muted">
                              <small/>
                            </div>
                          </a>
                        </li>
                        <li>
                          <a>

                            <i class=""/> Weitergeleitet
                            <div class="font-w400 text-muted">
                              <small/>
                            </div>
                          </a>
                        </li>
                        <li>
                          <a>

                            <i class=""/> Abwarten
                            <div class="font-w400 text-muted">
                              <small/>
                            </div>
                          </a>
                        </li>
                        <li>
                          <a>

                            <i class=""/> CRM
                            <div class="font-w400 text-muted">
                              <small/>
                            </div>
                          </a>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </aside>
  </div>
</template>
