<template>
  <div>
    <aside
      id="sidebar-fixed"
      class="active">
      <button
        class="btn btn-default side-overlay--button"
        type="button"
        @click="toggleSideBar()">
        <i class="fa fa-arrow-right"/>
      </button>
      <div v-bar>
        <div
          id="side-overlay-scroll"
          class="widthAuto">
          <div class="side-header side-content ">
            <div class="col-md-11">
              <img
                :alt="fullAddress"
                class="img-avatar img-avatar32"
                src="/static/img/icons/house.png">
              <span class="font-w600 push-10-l">{{ fullAddress }} </span>
            </div>
          </div>
          <div class="side-header side-content padding-t-0">
            <div class="block pull-r-l border-t margin-b-0">
              <ul class="nav nav-tabs nav-tabs-alt nav-justified">
                <li>
                  <a
                    type="button"
                    class="headerIcons has-tooltip">
                    <i
                      :class="{'fa fa-star': isAddressBookmarked(transparencyAddress), 'fa fa-star-o': !isAddressBookmarked(transparencyAddress)}"
                      aria-hidden="true"
                      tabindex="1"
                      @click="bookmark(transparencyAddress)"/>
                  </a>
                </li>
                <li>
                  <a
                    type="button"
                    class="headerIcons has-tooltip">
                    <i
                      aria-hidden="true"
                      tabindex="1"
                      class="fa fa-print"
                      @click="print_(transparencyAddress)"/>
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <div class="side-content remove-padding-t">
            <div class="block pull-r-l">
              <ul
                class="nav nav-tabs nav-tabs-alt nav-justified"
                data-toggle="tabs">
                <li :class="{ 'active' : showZero}">
                  <a
                    type="button"
                    @click="show(0)">Overview</a>
                </li>
                <li :class="{ 'active' : showOne}">
                  <a
                    type="button"
                    @click="show(1)">Analytics</a>
                </li>
              </ul>
              <div class="block-content tab-content">
                <div
                  :class="{ 'active' : showZero}"
                  class="tab-pane">
                  <div class="row">
                    <div class="nice-copy col-md-12">
                      <div class="block block-themed">
                        <div class="block-content">
                          <div class="block margin-b-0">
                            <vue-gallery
                              :images="galleryImages"
                              :index="index"
                              @close="index = null"/>

                            <carousel
                              ref="cur"
                              :per-page="1"
                              :mouse-drag="false"
                              :spacePadding="0"
                              :paginationColor="'#ccc'"
                              :navigationEnabled="true"
                              @pageChange="pageChanged">
                              <slide
                                v-for="(image, imageIndex) in galleryImages"
                                :key="imageIndex">
                                <div
                                  :key="imageIndex"
                                  :style="{ backgroundImage: 'url(http://axresources.azurewebsites.net/image/get/' + image + '/?mw=500&mh=500&q=90)', height: '100%', 'background-size': '100%', 'background-repeat': 'no-repeat' }"
                                  class="image"
                                  @click="index = imageIndex">
                                  <i class="fa fa-expand"/>
                                </div>
                              </slide>
                            </carousel>

                          </div>
                        </div>
                      </div>
                    </div>
                    <div id="print">
                      <div class="col-xs-12">
                        <div class="block pull-r-l">
                          <div class="block-header bg-gray-lighter">
                            <h3 class="block-title">Gebäude</h3>
                          </div>
                          <div class="block-content">
                            <div class="col-md-6">

                              <table class="table">

                                <tr>
                                  <th class="text-muted">
                                    Objektkategorie
                                  </th>
                                  <td class="text-right">Wohnung</td>
                                </tr>
                                <tr>
                                  <th class="text-muted">
                                    Objekttyp
                                  </th>
                                  <td class="text-right">Loft</td>
                                </tr>
                                <tr>
                                  <th class="text-muted">
                                    Zimmer
                                  </th>
                                  <td class="text-right">5</td>
                                </tr>

                                <tr>
                                  <th class="text-muted">
                                    Floors
                                  </th>
                                  <td class="text-right">{{ object.floors }}</td>
                                </tr>
                                <tr>
                                  <th class="text-muted">
                                    Wohnfläche
                                  </th>
                                  <td class="text-right">110m2</td>
                                </tr>
                                <tr>
                                  <th class="text-muted">
                                    Grundstückfläche
                                  </th>
                                  <td class="text-right">324m2</td>
                                </tr>
                                <tr>
                                  <th class="text-muted">
                                    Baujahr
                                  </th>
                                  <td
                                    v-if="object.buildingPhase"
                                    class="text-right">{{ object.buildingPhase.from.getFullYear() }}</td>
                                </tr>

                              </table>
                            </div>

                            <div class="col-md-6">

                              <table class="table">
                                <tr>
                                  <td class="font-w600 padding-0 padding-b-30"/>
                                  <td/>
                                </tr>
                                <tr>
                                  <th class="text-muted">
                                    Nutzung
                                  </th>
                                  <td class="text-right">Wohngebäude</td>
                                </tr>
                                <tr>
                                  <th class="text-muted">
                                    Grundstück-Nummer
                                  </th>
                                  <td class="text-right">12331</td>
                                </tr>
                                <tr>
                                  <th class="text-muted">
                                    Objektnummer
                                  </th>
                                  <td class="text-right">231</td>
                                </tr>
                                <tr>
                                  <th class="text-muted">
                                    Bauzone
                                  </th>
                                  <td class="text-right">WG2</td>
                                </tr>
                                <tr>
                                  <th class="text-muted">
                                    Ausnutzung Ziffer
                                  </th>
                                  <td class="text-right">45%</td>
                                </tr>
                                <tr>
                                  <th class="text-muted">
                                    Nutzung aktuell
                                  </th>
                                  <td class="text-right">33%</td>
                                </tr>

                              </table>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div class="col-xs-12">
                        <div class="block pull-r-l">
                          <div class="block-header bg-gray-lighter">
                            <h3 class="block-title">Ausgewogen</h3>
                          </div>
                          <div class="block-content">
                            <div class="col-xs-12" >
                              <vue-slider
                                ref="slider"
                                v-bind="sliderProps"
                                :max="100"
                                :min="0"
                                :interval="1"/>
                            </div>

                            <div class="col-xs-12 margin-b-20">
                              <span class="pull-left blue">Nachfragemarkt</span>
                              <span class="pull-right  green">Angebotsmarkt</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div class="col-xs-12">
                        <div class="block pull-r-l">
                          <div class="block-header bg-gray-lighter">
                            <h3 class="block-title">Price</h3>
                          </div>
                          <div class="block-content">

                            <div class="col-md-6">

                              <table class="table">
                                <tr>
                                  <th class="text-muted">
                                    Preiserwartung
                                  </th>
                                  <td/>
                                </tr>
                                <tr>
                                  <th class="green text-muted">
                                    Marktpreis
                                  </th>
                                  <td class="green text-right">1’234’567</td>
                                </tr>
                                <tr>
                                  <th class="text-muted">
                                    Preis / m2
                                  </th>
                                  <td class="text-right">14’398</td>
                                </tr>
                                <tr>
                                  <th class="text-muted">
                                    Mindestwert
                                  </th>
                                  <td class="text-right">1’198’213</td>
                                </tr>
                                <tr>
                                  <th class="text-muted">
                                    Maximalwert
                                  </th>
                                  <td class="text-right">1’249’231</td>
                                </tr>

                              </table>
                            </div>

                            <div class="col-md-6">

                              <table class="table">
                                <tr>
                                  <th class="text-muted" >POI</th>
                                  <td/>
                                </tr>
                                <tr>
                                  <th class="text-muted">
                                    Bus
                                  </th>
                                  <td class="text-right">200m</td>
                                </tr>
                                <tr>
                                  <th class="text-muted">
                                    Autobahn
                                  </th>
                                  <td class="text-right">1400m</td>
                                </tr>
                                <tr>
                                  <th class="text-muted">
                                    Einkauf
                                  </th>
                                  <td class="text-right">300m</td>
                                </tr>
                                <tr>
                                  <th class="text-muted">
                                    Kindergarten
                                  </th>
                                  <td class="text-right">20m</td>
                                </tr>
                                <tr>
                                  <th class="text-muted">
                                    Primar
                                  </th>
                                  <td class="text-right">100m</td>
                                </tr>
                                <tr>
                                  <th class="text-muted">
                                    Sekundar
                                  </th>
                                  <td class="text-right">300m</td>
                                </tr>
                                <tr>
                                  <th class="text-muted">
                                    Hochschule
                                  </th>
                                  <td class="text-right">50m</td>
                                </tr>

                              </table>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div class="col-xs-12">
                        <div class="block pull-r-l">
                          <div class="block-header bg-gray-lighter margin-b-10">
                            <h3 class="block-title pull-left">Vendor</h3>
                          </div>
                          <div class="block-content">
                            <div class="col-xs-12">

                              <table class="table">

                                <tr>
                                  <th class="blue text-muted">
                                    Preisvergleich
                                  </th>
                                </tr>
                              </table>
                            </div>
                            <div class="col-md-6 g">
                              <radial-progress-bar
                                :diameter="100"
                                :startColor="'#ace182'"
                                :stopColor="'#ace182'"
                                :strokeWidth="5"
                                :innerStrokeColor="'#ebebeb'"
                                :completed-steps="completedSteps0"
                                :total-steps="totalSteps">
                                <span>80%</span>

                              </radial-progress-bar>
                              <h2>Bezirk</h2>
                            </div>
                            <div class="col-md-6 g">
                              <radial-progress-bar
                                :diameter="100"
                                :startColor="'#f8b187'"
                                :stopColor="'#f8b187'"
                                :strokeWidth="5"
                                :innerStrokeColor="'#ebebeb'"
                                :completed-steps="completedSteps3"
                                :total-steps="totalSteps">
                                <span>25%</span>

                              </radial-progress-bar>
                              <h2>Gemeinde</h2>
                            </div>
                          </div>
                        </div>
                      </div>

                    </div>
                  </div>
                </div>
                <div
                  :class="{ 'active' : showOne}"
                  class="tab-pane">
                  <div class="row">
                    <div class="col-xs-12">
                      <div class="block block-themed">
                        <div class="block-content">
                          <div class="block">

                            <div class="col-md-12">

                              <table class="table">
                                <tr class="border-none">
                                  <td class="font-w600 padding-0 padding-b-10">
                                    Preisänderungen
                                  </td>
                                  <td/>
                                </tr>
                                <tr class="border-none">

                                  <td class="text-right">
                                    <area-chart
                                      :data="chartData"
                                      :colors="['#ebebeb']"/>
                                  </td>
                                </tr>

                              </table>
                            </div>

                          </div>
                          <div class="block">
                            <div class="col-md-12"/>
                          </div>

                          <div class="block">
                            <div class="col-md-12">
                              <hr>
                            </div>
                          </div>

                          <div class="block">
                            <div class="col-md-6">

                              <table class="table">
                                <tr>
                                  <td>
                                    Immobilienportale
                                  </td>
                                  <td/>
                                </tr>
                                <tr>
                                  <th class="text-muted">
                                    Homegate
                                  </th>
                                  <td class="text-right">
                                    <span class="green">51 Tage</span>
                                  </td>
                                </tr>

                                <tr>
                                  <th class="text-muted">
                                    Immoscout
                                  </th>
                                  <td class="text-right">
                                    <span class="green">61 Tage</span>
                                  </td>
                                </tr>

                                <tr>
                                  <th class="text-muted">
                                    Newhome
                                  </th>
                                  <td class="text-right">
                                    <span class="green">115 Tage</span>
                                  </td>
                                </tr>

                                <tr>
                                  <th class="text-muted">
                                    Immostreet
                                  </th>
                                  <td class="text-right">
                                    <span class="green">90 Tage</span>
                                  </td>
                                </tr>
                                <tr>
                                  <th class="text-muted">
                                    homestreet
                                  </th>
                                  <td class="text-right">
                                    <span class="green">na</span>
                                  </td>
                                </tr>

                                <tr>
                                  <th class="text-muted">
                                    Homegate empfohlen
                                  </th>
                                  <td class="text-right">
                                    <span class="green"/>
                                  </td>
                                </tr>
                              </table>
                            </div>
                            <div class="block">
                              <div class="col-md-6">

                                <table class="table">
                                  <tr>
                                    <td class="blue">
                                      Inserate Historie
                                    </td>
                                    <td/>
                                  </tr>

                                  <tr>
                                    <td class="text-muted">
                                      Aktuell
                                    </td>
                                    <td class="text-right">
                                      <span class="green">55</span>
                                    </td>
                                  </tr>

                                  <tr>
                                    <td class="text-muted">
                                      Letze 24 Monate
                                    </td>
                                    <td class="text-right">
                                      <span class="green">183</span>
                                    </td>
                                  </tr>

                                  <tr>
                                    <td class="text-muted">
                                      Letzte 60 Monate
                                    </td>
                                    <td class="text-right">
                                      <span class="green">255</span>
                                    </td>
                                  </tr>
                                </table>
                              </div>
                            </div>
                          </div>

                          <div class="block">
                            <div class="col-md-12">
                              <hr>
                            </div>
                          </div>

                          <div class="block">
                            <div class="col-md-12">

                              <table class="table">
                                <tr class="border-none">
                                  <td class="font-w600 padding-0 padding-b-10">
                                    <span class="green">Gesamtanzahl Angebote</span>
                                  </td>
                                  <td/>
                                </tr>
                                <tr class="border-none">

                                  <td class="text-right">
                                    <column-chart
                                      :data="chart_data"
                                      :colors="['#ebebeb']"/>
                                  </td>
                                </tr>

                              </table>
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
  </div>
</template>
<script>
</script>
