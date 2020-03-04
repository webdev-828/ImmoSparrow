<template>
  <div>
    <custom-input
      v-model="transactionModel.cubature"
      :validate="{ required: true, min_value: 1, max_value: 100000 }"
      :formName="formName"
      :approved.sync="approved.cubature"
      type="number"
      displayType="inline"
      fieldName="cubature"
      label="Cubature"
      @enter="nextField('bathroomsCount')"/>
    <custom-input
      v-model="transactionModel.bathroomsCount"
      :validate="{ required: true, min_value: 1, max_value: 100 }"
      :formName="formName"
      :approved.sync="approved.bathroomsCount"
      type="number"
      displayType="inline"
      fieldName="bathroomsCount"
      label="Bathrooms count"
      @enter="nextField('garageCount')"/>
    <custom-input
      v-model="transactionModel.garageCount"
      :validate="{ required: true, min_value: 0, max_value: 100 }"
      :formName="formName"
      :approved.sync="approved.garageCount"
      type="number"
      displayType="inline"
      fieldName="garageCount"
      label="Garage count"
      @enter="nextField('houseType')"/>
    <custom-select
      v-model="transactionModel.houseType"
      :dataSet="houseTypes"
      :formName="formName"
      :approved.sync="approved.houseType"
      validate="required"
      fieldName="houseType"
      label="House Type"
      class="margin-b-10"
      @selected="nextField('constructionQuality')"/>
    <custom-select
      v-model="transactionModel.constructionQuality"
      :dataSet="constructionQualities"
      :formName="formName"
      :approved.sync="approved.constructionQuality"
      validate="required"
      fieldName="constructionQuality"
      label="Construction Quality"
      class="margin-b-10"
      @selected="nextField('buildingCondition')"/>
    <custom-select
      v-model="transactionModel.buildingCondition"
      :dataSet="buildingConditions"
      :formName="formName"
      :approved.sync="approved.buildingCondition"
      validate="required"
      fieldName="buildingCondition"
      label="Building Condition"
      class="margin-b-10"
      @selected="nextField('microLocation')"/>
    <custom-select
      v-model="transactionModel.microLocation"
      :dataSet="microLocations"
      :formName="formName"
      :approved.sync="approved.microLocation"
      validate="required"
      fieldName="microLocation"
      label="Micro Location"
      class="margin-b-10"/>
  </div>
</template>
