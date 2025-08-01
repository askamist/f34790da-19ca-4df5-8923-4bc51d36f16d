import { formatISO, format } from 'date-fns'
import { Hono } from 'hono'

const apiRouter = new Hono()

apiRouter.get('/devices', (c) => c.json(c.get('db').devices))

function calcConsolidatedSavings(savingsData, zoomLevel) {
  const monthLabels = {};
  const monthlyCarbonSavings = {}
  const monthlyDieselSavings = {}
  const detailsLabels = {}
  const carbonSavingsDetails = {}
  const dieselSavingsDetails = {}
  let minTimestamp = savingsData[0].timestamp;
  let maxTimestamp = savingsData[0].timestamp;

  const [totalCarbon, totalDiesel] = savingsData.reduce(
    ([c, d], item) => {
      const monthKey = format(item.timestamp, 'yyyyMM')
      const monthLabel = format(item.timestamp, 'MMM yyyy')
      monthlyCarbonSavings[monthKey] = (monthlyCarbonSavings[monthKey] || 0) + item.carbonSaved
      monthlyDieselSavings[monthKey] = (monthlyDieselSavings[monthKey] || 0) + item.fuelSaved
      monthLabels[monthKey] = monthLabel;
      if (zoomLevel !== 'month') {
        const key = format(item.timestamp, 'yyyyMMdd');
        const label = format(item.timestamp, 'dd MMM yyyy');
        detailsLabels[key] = label;
        carbonSavingsDetails[key] = (carbonSavingsDetails[key] || 0) + item.carbonSaved
        dieselSavingsDetails[key] = (dieselSavingsDetails[key] || 0) + item.fuelSaved;
      }
      minTimestamp = Math.min(minTimestamp, item.timestamp);
      maxTimestamp = Math.max(maxTimestamp, item.timestamp);
      return [c + item.carbonSaved, d + item.fuelSaved]
    },
    [0, 0]
  )
  const numberOfMonths = Object.keys(monthlyCarbonSavings).length
  return {
    minTimestamp,
    maxTimestamp,
    totalCarbon,
    totalDiesel,
    monthlyCarbon: totalCarbon / numberOfMonths,
    monthlyDiesel: totalDiesel / numberOfMonths,
    ...(zoomLevel === 'month' ? {
      detailsLabels: monthLabels,
      carbonSavingsDetails: monthlyCarbonSavings,
      dieselSavingsDetails: monthlyDieselSavings
    } : {
      detailsLabels: detailsLabels,
      carbonSavingsDetails: carbonSavingsDetails,
      dieselSavingsDetails: dieselSavingsDetails
    })
  }
}

apiRouter.get('/savings/:id', (c) => {
  const id = parseInt(c.req.param('id'))
  const zoomLevel = c.req.query('zoom_level') || 'month';
  const from = c.req.query('from') && new Date(c.req.query('from'));
  const to = c.req.query('to') && new Date(c.req.query('to'));

  console.log(`Fetching savings for device ID: ${id}, from: ${from && formatISO(from, "")}, to: ${to && formatISO(to)}, zoom level: ${zoomLevel}`)

  const deviceSavings = c.get('db').deviceSavings
  const savings = deviceSavings.filter((s) => s.deviceId === id &&
    (!from || s.timestamp >= from) &&
    (!to || s.timestamp <= to))

  if (savings.length === 0) {
    return c.notFound(`No savings found for device with ID ${id}`)
  }

  return c.json(calcConsolidatedSavings(savings, zoomLevel))
})

export default apiRouter
