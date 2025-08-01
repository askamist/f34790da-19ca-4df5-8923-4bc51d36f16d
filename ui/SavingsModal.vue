<script setup>
import { onMounted, ref } from 'vue';
import SavingsTotal from './SavingsTotal.vue';
import SavingsChart from './SavingsChart.vue';

const { isModalOpen, selectedDevice } = defineProps({
  isModalOpen: Boolean,
  selectedDevice: Number
});

const loading = ref(true);
const savingsData = ref({});

onMounted(async () => {
  const response = await fetch('http://localhost:3000/api/savings/' + selectedDevice);

  if (!response.ok) {
    throw new Error('Error fetching device savings data');
  }
  savingsData.value = await response.json();
  loading.value = false;
});

const emit = defineEmits(['close']);

</script>
<template>
  <b-modal :modelValue="isModalOpen" :renderOnMounted="true" @close="emit('close')" :width="640" scroll="keep">
    <template #default>
      <div class="modal-card" style="width: auto">
        <header class="modal-card-head">
          <h3 class="modal-card-title">Estimated carbon savings and diesel savings</h3>
          <button type="button" class="delete" @click="$emit('close')"></button>
        </header>
        <section class="modal-card-body">
          <p class="guidelines is-size-7 has-text-weight-semibold">Download general guidelines on the estimated carbon &
            diesel savings calculations.</p>
          <hr />
          <savings-total color="green" :loading="loading" title="Estimated carbon savings" subTitle="1 Tonne = 1,000 kg"
            :total="loading && 1 || savingsData.totalCarbon / 1000" :monthly="loading && 1 || savingsData.monthlyCarbon / 1000"
            unit="Tonnes" />
          <hr />
          <savings-total color="blue" :loading="loading" title="Estimated diesel savings" :total="loading && 1 || savingsData.totalDiesel"
            :monthly="loading ? 0 : savingsData.monthlyDiesel" unit="Liters" />
          <hr />
          <savings-chart :loading="loading" :savingsData="savingsData"  :device-id="selectedDevice"/>
        </section>
      </div>
    </template>
  </b-modal>
</template>
<style>
.modal-card {
  --the-green: #43CFA7;
  --the-blue: #4A46FF;
}
</style>
<style scoped>
.modal-card {
  background-color: #f5f5f5;
  /* Light gray background */
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  border-radius: 6px;
}

.modal-card-head {
  background-color: #6bdfce20;
  border: none;
}

.modal-card-title {
  color: var(--the-green);
}

.guidelines {
  color: var(--the-green);
}

hr {
  border: 0;
  height: 1px;
  background-color: #d4dada;
  margin: 1rem 0;
}
</style>
