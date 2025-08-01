<script setup>
import { computed, onMounted, reactive, ref } from 'vue';
import SavingsModal from './SavingsModal.vue';

const data = reactive({ devices: [] });
const isLoading = ref(true);
const selectedDevice = ref(null);
const isModalOpen = computed(() => selectedDevice.value !== null);

const columns = [
  { field: 'id', label: 'ID', centered: true },
  { field: 'name', label: 'Name', 'cell-class': 'has-text-weight-bold', centered: true },
  { field: 'timezone', label: 'Timezone', centered: true }
];

const fetchData = async () => {
  try {
    const response = await fetch('http://localhost:3000/api/devices');
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    data.devices = await response.json();
    isLoading.value = false;
    console.log('Data fetched successfully:', data.devices);
  } catch (error) {
    console.error('Error fetching data:', error);
  }
};

onMounted(() => {
  // Fetch data from the API when the component is mounted
  fetchData();
});
</script>

<template>
  <div class="container">
    <h1 class="has-text-centered is-size-2">Devices</h1>
    <b-table :data="data.devices" :columns="columns" :bordered="true" :hoverable="true" :loading="isLoading"
      @click="(device) => selectedDevice = device.id">
      <template #footer>
        <p class="is-family-monospace	is-gray has-text-centered is-size-7">(Click on the device row to see the detailed
          data)</p>
      </template>
    </b-table>
    <savings-modal :isModalOpen="isModalOpen" v-if="isModalOpen" :selectedDevice="selectedDevice" @close="selectedDevice = null" />
  </div>
</template>

<style scoped></style>
