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

// provide(THEME_KEY, "dark");

const { savingsData, loading } = defineProps({
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

watch(() => loading, (newData) => {
  if (newData) return;
  console.log('Savings data updated:', savingsData, newData);
  const sortedMonthKeys = Object.keys(savingsData.monthLabels).sort();
  console.log('Sorted month keys:', sortedMonthKeys);

  option.value = {
    ...option.value,
    xAxis: {
      ...option.value.xAxis,
      data: sortedMonthKeys.map(key => savingsData.monthLabels[key])
    },
    series: [{
      ...option.value.series[0],
      data: sortedMonthKeys.map(key => savingsData.monthlyCarbonSavings[key])
    }, {
      ...option.value.series[1],
      data: sortedMonthKeys.map(key => savingsData.monthlyDieselSavings[key])
    }]
  };

  console.log('Updated option:', option.value);

}, { immediate: true });

</script>

<template>
  <v-chart :loading="loading" :option="option" style="width: 100%; height: 400px;" />
</template>
