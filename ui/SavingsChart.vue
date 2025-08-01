<script setup>
import { use } from "echarts/core";
import { CanvasRenderer } from "echarts/renderers";
import { BarChart } from 'echarts/charts';
import { GridComponent } from "echarts/components";
import {
  TitleComponent,
  TooltipComponent,
  LegendComponent
} from "echarts/components";
import VChart from "vue-echarts";
import { ref, watch } from "vue";
import humanNumber from "human-number";

use([
  CanvasRenderer,
  BarChart,
  GridComponent,
  TitleComponent,
  TooltipComponent,
  LegendComponent
]);

const minDatetime = ref(null);
const maxDatetime = ref(null);
const fromDatetime = ref(null);
const toDatetime = ref(null);
const initialized = ref(false);

const selectedCarbonTotal = ref(0);
const selectedDieselTotal = ref(0);

const { savingsData, loading, deviceId } = defineProps({
  deviceId: {
    type: Number,
    required: true
  },
  savingsData: {
    type: Object,
    required: true
  },
  loading: Boolean,
});

const option = ref({
  legend: {
    bottom: 10,
  },
  tooltip: {
    trigger: 'axis'
  },
  xAxis: {
    type: 'category',
    data: [],
    axisTick: {
      alignWithLabel: true
    },
  },
  yAxis: [
    {
      type: 'value',
      position: 'left',
      alignTicks: true,
      axisLine: { show: true },
      axisLabel: {
        formatter: (value) => humanNumber(value) + ' Ton'
      }
    },
    {
      type: 'value',
      position: 'right',
      alignTicks: true,
      axisLine: { show: true },
      axisLabel: {
        formatter: (value) => humanNumber(value) + ' L'
      }
    }
  ],
  series: [{
    name: 'Carbon Savings',
    data: [],
    type: 'bar',
  },
  {
    name: 'Diesel Savings',
    data: [],
    yAxisIndex: 1,
    type: 'bar',
  }
  ]
});

const humanNumberMapper = (n) => n.toFixed(1);

const updateChart = (newData, filtered = false) => {
  if (!newData) return;
  console.log('Savings data updated:', { savingsData, newData });
  const sortedMonthKeys = Object.keys(newData.monthLabels).sort();
  console.log('Sorted month keys:', sortedMonthKeys);

  if (!filtered) {
    minDatetime.value = new Date(
      newData.minTimestamp
    );
    maxDatetime.value = new Date(
      newData.maxTimestamp
    );

    if (!fromDatetime.value) {
      fromDatetime.value = new Date(
        newData.minTimestamp
      );
    }

    if (!toDatetime.value) {
      toDatetime.value = new Date(
        newData.maxTimestamp
      );
    }
  }
  selectedCarbonTotal.value = newData.totalCarbon / 1000;
  selectedDieselTotal.value = newData.totalDiesel;

  option.value = {
    ...option.value,
    xAxis: {
      ...option.value.xAxis,
      data: sortedMonthKeys.map(key => newData.monthLabels[key])
    },
    series: [{
      ...option.value.series[0],
      data: sortedMonthKeys.map(key => newData.monthlyCarbonSavings[key])
    }, {
      ...option.value.series[1],
      data: sortedMonthKeys.map(key => newData.monthlyDieselSavings[key])
    }]
  };

  console.log('Updated option:', option.value);
}

watch(() => savingsData, (newData) => {
  updateChart(newData, false);
  initialized.value = true;
});

watch([fromDatetime, toDatetime], async ([from, to]) => {
  console.log('Datetime changed:', from, to);
  if ((from || to) && initialized.value) {
    const response = await fetch(`http://localhost:3000/api/savings/${deviceId}?from=${fromDatetime.value.toISOString()}&to=${toDatetime.value.toISOString()}`)
    if (!response.ok) {
      throw new Error('Error fetching device savings data');
    }
    const filteredData = await response.json();
    updateChart(filteredData, true);
  }
});
</script>

<template>
  <div class="columns">
    <div class="column from-time">
      <b-datetimepicker v-model="fromDatetime" placeholder="Select from date-time" icon="clock-start"
        :min-datetime="minDatetime" :max-datetime="maxDatetime" />
    </div>
    <span class="field-separator">—</span>
    <div class="column">
      <b-datetimepicker v-model="toDatetime" placeholder="Select to date-time" icon="clock-end"
        :min-datetime="minDatetime" :max-datetime="maxDatetime" />
    </div>
  </div>
  <div class="columns has-text-centered">
    <div class="column is-6">
      <h2 class="is-size-6 has-text-weight-bold">Monthly Carbon Savings</h2>
      <p class="is-size-7">Sum of selected date range</p>
      <p v-if="!loading" class="total-value is-size-4">{{ humanNumber(selectedCarbonTotal, humanNumberMapper) }}</p>
      <div v-if="loading" class="skeleton-block">__._</div>
      <p class="total-unit is-size-7">Tonnes</p>
    </div>
    <div class="column is-6">
      <h2 class="is-size-6 has-text-weight-bold">Monthly Diesel Savings</h2>
      <p class="is-size-7">Sum of selected date range</p>
      <p v-if="!loading" class="total-value is-size-4">{{ humanNumber(selectedDieselTotal, humanNumberMapper) }}</p>
      <div v-if="loading" class="skeleton-block">__._</div>
      <p class="total-unit is-size-7">Liters</p>
    </div>
  </div>
  <v-chart :loading="loading" :option="option" style="width: 100%; height: 300px;" />
</template>

<style scoped>
.field-separator {
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 2px;
  font-size: 1.5rem;
  line-height: 1.6rem;
  color: #aaa;
  /* The green color */
}
</style>
