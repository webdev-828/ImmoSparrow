<template>
  <div
    v-if="marketRadarModel"
    id="price-analytics">
    <div class="data-section stand-out">
      <price-prediction-box
        :prediction="prediction.ads"
        :transactionType="marketRadarModel.transactionType"
        :livingArea="marketRadarModel.livingSpace.value"
        class="margin-t-10"/>
      <price-prediction-box
        v-if="prediction.transaction"
        :prediction="prediction.transaction"
        :transactionType="marketRadarModel.transactionType"
        :livingArea="marketRadarModel.livingSpace.value"
        :isTransaction="true"/>
    </div>
    <div
      v-if="statistics.country && statistics.canton"
      class="data-section stand-out margin-b-20">
      <div class="section-content">
        <div class="col-table-container double-col allow-wrap">
          <div class="col-table margin-b-10">
            <custom-bar-chart
              :source="averagePricesChartSource"
              :chartId="'avgPrices'"
              title="AVG. PRICE, CHF"/>
          </div>
          <div class="col-table margin-b-10">
            <custom-bar-chart
              :source="averageSqrtPricesChartSource"
              :chartId="'avgSqrtPrices'"
              title="AVG. M2 PRICE, CHF"/>
          </div>
          <div class="col-table margin-b-10">
            <custom-bar-chart
              :source="pricePercentDecrease"
              :chartId="'priceDecrease'"
              title="% PRICE DECREASE"/>
          </div>
          <div class="col-table margin-b-10">
            <custom-bar-chart
              :source="pricePercentIncrease"
              :chartId="'priceIncrease'"
              title="% PRICE INCREASE"/>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
