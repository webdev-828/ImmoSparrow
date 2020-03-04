<template>
  <div class="side-panel under-subtabs">
    <div class="data-section on-image">
      <div class="section-label">
        <div class="label-image">
          <img src="/static/img/labels/overview.png">
        </div>
        <div class="label-copy">Overview</div>
      </div>
      <div class="section-content">
        <div class="score-plate-container centered-plate">
          <div
            class="score-plate main-plate state-excellent">
            <radial-progress-bar
              :diameter="64"
              :startColor="'#33b54a'"
              :stopColor="'#33b54a'"
              :strokeWidth="3"
              :innerStrokeColor="'#ebebeb'"
              :completed-steps="overallRating"
              :total-steps="5">
              <div class="plate-icon">
                <span class="icon-neighborhood"/>
              </div>
            </radial-progress-bar>
            <div class="plate-data">
              <div class="middle-sector">
                <div class="plate-subtitle">{{ neighborhoodTitle.firstPart }}</div>
                <div class="plate-title">{{ neighborhoodTitle.secondPart }}</div>
              </div>
              <div class="right-sector">
                <div class="plate-value">{{ overallRating }} <span>/ 5</span></div>
              </div>
            </div>
          </div>
        </div>
        <div class="simple-separator"/>
        <div class="score-plate-container">
          <div
            class="score-plate state-good"
            @click="setActiveTab('noise', 2, true)">
            <radial-progress-bar
              :diameter="64"
              :startColor="'#09c199'"
              :stopColor="'#09c199'"
              :strokeWidth="3"
              :innerStrokeColor="'#ebebeb'"
              :completed-steps="noiseRating"
              :total-steps="5">
              <div class="plate-icon">
                <span class="icon-noise"/>
              </div>
            </radial-progress-bar>
            <div class="plate-data">
              <div class="plate-subtitle">{{ noiseTitle.firstPart }}</div>
              <div class="plate-title">{{ noiseTitle.secondPart }}</div>
              <div class="plate-value">{{ noiseRating }}</div>
            </div>
          </div>
          <div
            class="score-plate state-moderate"
            @click="setActiveTab('view', 2, true)">
            <radial-progress-bar
              :diameter="64"
              :startColor="'#f7981c'"
              :stopColor="'#f7981c'"
              :strokeWidth="3"
              :innerStrokeColor="'#ebebeb'"
              :completed-steps="viewRating"
              :total-steps="5">
              <div class="plate-icon">
                <span class="icon-view"/>
              </div>
            </radial-progress-bar>
            <div class="plate-data">
              <div class="plate-subtitle">{{ viewTitle.firstPart }}</div>
              <div class="plate-title">{{ viewTitle.secondPart }}</div>
              <div class="plate-value">{{ viewRating }}</div>
            </div>
          </div>
          <div
            class="score-plate state-excellent"
            @click="setActiveTab('shopping', 2, true)">
            <radial-progress-bar
              :diameter="64"
              :startColor="'#33b54a'"
              :stopColor="'#33b54a'"
              :strokeWidth="3"
              :innerStrokeColor="'#ebebeb'"
              :completed-steps="shoppingRating"
              :total-steps="5">
              <div class="plate-icon">
                <span class="icon-shopping"/>
              </div>
            </radial-progress-bar>
            <div class="plate-data">
              <div class="plate-subtitle">{{ shoppingTitle.firstPart }}</div>
              <div class="plate-title">{{ shoppingTitle.secondPart }}</div>
              <div class="plate-value">{{ shoppingRating }}</div>
            </div>
          </div>
          <div
            class="score-plate state-excellent"
            @click="setActiveTab('immissions', 2, true)">
            <radial-progress-bar
              :diameter="64"
              :startColor="'#33b54a'"
              :stopColor="'#33b54a'"
              :strokeWidth="3"
              :innerStrokeColor="'#ebebeb'"
              :completed-steps="immissionsRating"
              :total-steps="5">
              <div class="plate-icon">
                <span class="icon-immissions"/>
              </div>
            </radial-progress-bar>
            <div class="plate-data">
              <div class="plate-subtitle">{{ immissionsTitle.firstPart }}</div>
              <div class="plate-title">{{ immissionsTitle.secondPart }}</div>
              <div class="plate-value">{{ immissionsRating }}</div>
            </div>
          </div>
          <div
            class="score-plate state-good"
            @click="setActiveTab('education', 2, true)">
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
            </div>
          </div>
          <div
            class="score-plate state-bad"
            @click="setActiveTab('connectivity', 2, true)">
            <radial-progress-bar
              :diameter="64"
              :startColor="'#f85359'"
              :stopColor="'#f85359'"
              :strokeWidth="3"
              :innerStrokeColor="'#ebebeb'"
              :completed-steps="connectivityRating"
              :total-steps="5">
              <div class="plate-icon">
                <span class="icon-education"/>
              </div>
            </radial-progress-bar>
            <div class="plate-data">
              <div class="plate-subtitle">{{ connectivityTitle.firstPart }}</div>
              <div class="plate-title">{{ connectivityTitle.secondPart }}</div>
              <div class="plate-value">{{ connectivityRating }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
