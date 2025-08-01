import {parse} from 'csv-parse';
import fs from 'fs/promises';

const devicesCSVPath = './data/devices.csv';
const deviceSavingsCSVPath = './data/device-saving.csv';

// In memory database for the data. loaded once at server start.
export const loadCSV = async (filePath) => {
  const content = await fs.readFile(filePath, 'utf-8');
  return new Promise((resolve, reject) => {
    parse(content, {
      bom: true,
      delimiter: ',',
      columns: true,
      skip_empty_lines: true,
    }, (err, records) => {
      if (err) {
        reject(err);
      } else {
        resolve(records);
      }
    });
  });
};

function processDeviceData(rawDevices) {
  return rawDevices.map((device) => {
    return {
      ...device,
      id: parseInt(device.id, 10),
    };
  });
}

function processSavingsData(rawSavings) {
  return rawSavings.map((saving) => {
    return {
      ...saving,
      deviceId: parseInt(saving.device_id, 10),
      timestamp: new Date(saving.timestamp).getTime(),
      deviceTimestamp: new Date(saving.device_timestamp).getTime(),
      carbonSaved: parseFloat(saving.carbon_saved),
      fuelSaved: parseFloat(saving.fuel_saved),
      device_timestamp: undefined,
      carbon_saved: undefined,
      fuel_saved: undefined,
    };
  });
}

class Database {
  constructor() {
    this.data = {};
  }

  async load() {
    console.log("Loading database...");
    this.data['devices'] = processDeviceData(await loadCSV(devicesCSVPath));
    this.data['deviceSavings'] = processSavingsData(await loadCSV(deviceSavingsCSVPath));
    console.log("Database loaded with devices and device savings.");
  }

  get devices() {
    return this.data.devices || [];
  }

  get deviceSavings() {
    return this.data.deviceSavings || [];
  }
}

const db = new Database();

export default db;
