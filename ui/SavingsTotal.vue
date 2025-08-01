<script setup>
defineProps({
  color: String,
  title: String,
  subTitle: String,
  loading: Boolean,
  total: Number,
  monthly: Number,
  unit: String
});

</script>
<template>
  <h2 class="is-size-6 has-text-weight-bold">{{ title }}</h2>
  <p v-if="subTitle != null" class="is-size-7">{{ subTitle }}</p>
  <div class="columns has-text-centered">
    <div class="column">
      <p class="is-size-6">Total</p>
      <p v-if="!loading" class="total-value is-size-4" :class="color">{{ total.toFixed(1) }}</p>
      <div v-if="loading" class="skeleton-block">__._</div>
      <p class="total-unit is-size-7" :class="color">{{ unit }}</p>
    </div>
    <div class="column">
      <p class="is-size-6">Monthly</p>
      <p v-if="!loading" class="total-value is-size-4" :class="[color]">{{ monthly.toFixed(1) }}</p>
      <div v-if="loading" class="skeleton-block">__._</div>
      <p class="total-unit is-size-7" :class="[color]">{{ unit }}</p>
    </div>
  </div>
</template>
<style scoped>
.blue.total-value,
.blue.total-unit {
  color: var(--the-blue);
}
.green.total-value,
.green.total-unit {
  color: var(--the-green);
}
</style>
