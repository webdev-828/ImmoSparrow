<template>
  <div class="side-panel under-subtabs">
    <div class="data-section on-image">
      <div class="section-label">
        <div class="label-image">
          <img src="/static/img/labels/education.png">
        </div>
        <div class="label-copy">Education</div>
      </div>
      <div class="section-content padding-t-10">
        <div class="table-flex-col">
          <div class="fluid-data-table flex-option no-side-margins w100">
            <template
              v-if="closestKinderGarden"
            >
              <div class="fluid-cell-wrap">
                <div class="fluid-cell head-cell">
                  <div class="attribute text-uppercase font-w700">Closest Kindergarden</div>
                  <div class="value"/>
                </div>
              </div>
              <div class="fluid-cell-wrap">
                <div class="fluid-cell">
                  <div class="attribute">
                    Name
                  </div>
                  <div class="value">
                    {{ closestKinderGarden.name }}
                  </div>
                </div>
              </div>
              <div class="fluid-cell-wrap">
                <div class="fluid-cell">
                  <div class="attribute">
                    Distance
                  </div>
                  <div class="value">
                    {{ Math.round(closestKinderGarden.distance) }} m
                  </div>
                </div>
              </div>
            </template>
            <template
              v-if="closestSchool"
            >
              <div class="fluid-cell-wrap margin-t-10">
                <div class="fluid-cell head-cell">
                  <div class="attribute text-uppercase font-w700">Closest Primary School</div>
                  <div class="value"/>
                </div>
              </div>
              <div class="fluid-cell-wrap">
                <div class="fluid-cell">
                  <div class="attribute">
                    Name
                  </div>
                  <div class="value">
                    {{ closestSchool.name }}
                  </div>
                </div>
              </div>
              <div class="fluid-cell-wrap">
                <div class="fluid-cell">
                  <div class="attribute">
                    Distance
                  </div>
                  <div class="value">
                    {{ Math.round(closestSchool.distance) }} m
                  </div>
                </div>
              </div>
            </template>
            <template
              v-if="closestSecondarySchool"
            >
              <div class="fluid-cell-wrap margin-t-10">
                <div class="fluid-cell head-cell">
                  <div class="attribute text-uppercase font-w700">Closest Secondary School</div>
                  <div class="value"/>
                </div>
              </div>
              <div class="fluid-cell-wrap">
                <div class="fluid-cell">
                  <div class="attribute">
                    Name
                  </div>
                  <div class="value">
                    {{ closestSecondarySchool.name }}
                  </div>
                </div>
              </div>
              <div class="fluid-cell-wrap">
                <div class="fluid-cell">
                  <div class="attribute">
                    Distance
                  </div>
                  <div class="value">
                    {{ Math.round(closestSecondarySchool.distance) }} m
                  </div>
                </div>
              </div>
            </template>
            <template
              v-if="closestHighschool"
            >
              <div class="fluid-cell-wrap margin-t-10">
                <div class="fluid-cell head-cell">
                  <div class="attribute text-uppercase font-w700">Closest Highschool</div>
                  <div class="value"/>
                </div>
              </div>
              <div class="fluid-cell-wrap">
                <div class="fluid-cell">
                  <div class="attribute">
                    Name
                  </div>
                  <div class="value">
                    {{ closestHighschool.name }}
                  </div>
                </div>
              </div>
              <div class="fluid-cell-wrap">
                <div class="fluid-cell">
                  <div class="attribute">
                    Distance
                  </div>
                  <div class="value">
                    {{ Math.round(closestHighschool.distance) }} m
                  </div>
                </div>
              </div>
            </template>
            <template
              v-if="closestUniversity"
            >
              <div class="fluid-cell-wrap margin-t-10">
                <div class="fluid-cell head-cell">
                  <div class="attribute text-uppercase font-w700">Closest University</div>
                  <div class="value"/>
                </div>
              </div>
              <div class="fluid-cell-wrap">
                <div class="fluid-cell">
                  <div class="attribute">
                    Name
                  </div>
                  <div class="value">
                    {{ closestUniversity.name }}
                  </div>
                </div>
              </div>
              <div class="fluid-cell-wrap">
                <div class="fluid-cell">
                  <div class="attribute">
                    Distance
                  </div>
                  <div class="value">
                    {{ Math.round(closestUniversity.distance) }} m
                  </div>
                </div>
              </div>
            </template>
          </div>
          <div class="table-col col-smaller">
            <div
              class="score-plate state-good">
              <radial-progress-bar
                :diameter="64"
                :startColor="'#09c199'"
                :stopColor="'#09c199'"
                :strokeWidth="3"
                :innerStrokeColor="'#ebebeb'"
                :completed-steps="educationRating"
                :total-steps="5">
                <div class="plate-icon">
                  <span class="icon-education"/>
                </div>
              </radial-progress-bar>
              <div class="plate-data">
                <div class="plate-subtitle">{{ educationTitle.firstPart }}</div>
                <div class="plate-title">{{ educationTitle.secondPart }}</div>
                <div class="plate-value">{{ educationRating }}</div>
                <div class="plate-controls">
                  <button
                    :disabled="!allPois.length"
                    type="button"
                    class="btn btn-block btn-sm"
                    @click="allPois.length ? addPoisToMap(allPois):''"
                  >Show on Map</button>
                </div>
              </div>
            </div>
          </div>
        </div>
        <table
          v-if="kindergardens.length"
          class="table table-condensed improved-condensed">
          <thead>
            <tr>
              <th>#</th>
              <th>Kindergarden Name</th>
              <th class="text-right">Distance</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="(kindergarden, index) in kindergardens"
              :key="index">
              <td>{{ ++index }}</td>
              <td>{{ kindergarden.name }}</td>
              <td class="text-right">{{ Math.round(kindergarden.distance) }} m</td>
            </tr>
          </tbody>
        </table>
        <table
          v-if="primarySchools"
          class="table table-condensed improved-condensed">
          <thead>
            <tr>
              <th>#</th>
              <th>Primary School Name</th>
              <th class="text-right">Distance</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="(school, index) in primarySchools"
              :key="index">
              <td>{{ ++index }}</td>
              <td>{{ school.name }}</td>
              <td class="text-right">{{ Math.round(school.distance) }} m</td>
            </tr>
          </tbody>
        </table>
        <table
          v-if="secondarySchools"
          class="table table-condensed improved-condensed">
          <thead>
            <tr>
              <th>#</th>
              <th>Secondary School Name</th>
              <th class="text-right">Distance</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="(school, index) in secondarySchools"
              :key="index">
              <td>{{ ++index }}</td>
              <td>{{ school.name }}</td>
              <td class="text-right">{{ Math.round(school.distance) }} m</td>
            </tr>
          </tbody>
        </table>
        <table
          v-if="highschools"
          class="table table-condensed improved-condensed">
          <thead>
            <tr>
              <th>#</th>
              <th>Highschool Name</th>
              <th class="text-right">Distance</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="(school, index) in highschools"
              :key="index"
            >
              <td>{{ ++index }}</td>
              <td>{{ school.name }}</td>
              <td class="text-right">{{ Math.round(school.distance) }} m</td>
            </tr>
          </tbody>
        </table>
        <table
          v-if="universities"
          class="table table-condensed improved-condensed">
          <thead>
            <tr>
              <th>#</th>
              <th>University Name</th>
              <th class="text-right">Distance</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="(school, index) in universities"
              :key="index"
            >
              <td>{{ ++index }}</td>
              <td>{{ school.name }}</td>
              <td class="text-right">{{ Math.round(school.distance) }} m</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>
