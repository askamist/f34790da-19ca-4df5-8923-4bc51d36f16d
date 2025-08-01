import { format } from 'date-fns'
import { Hono } from 'hono'

const apiRouter = new Hono()

apiRouter.get('/devices', (c) => c.json(c.get('db').devices))

function getConsolidatedSavings(savingsData) {
  const monthlyCarbonSavings = {}
  const monthlyDieselSavings = {}
  const monthLabels = {};
  const [totalCarbon, totalDiesel] = savingsData.reduce(
    ([c, d], item) => {
      const monthKey = format(item.timestamp, 'MMyyyy');
      const monthLabel = format(item.timestamp, 'MMM yyyy');
      monthlyCarbonSavings[monthKey] = (monthlyCarbonSavings[monthKey] || 0) + item.carbonSaved
      monthlyDieselSavings[monthKey] = (monthlyDieselSavings[monthKey] || 0) + item.fuelSaved
      monthLabels[monthKey] = monthLabel;
      return [c + item.carbonSaved, d + item.fuelSaved]
    },
    [0, 0]
  )
  const numberOfMonths = Object.keys(monthlyCarbonSavings).length
  return {
    totalCarbon,
    totalDiesel,
    monthlyCarbon: totalCarbon / numberOfMonths,
    monthlyDiesel: totalDiesel / numberOfMonths,
    monthlyCarbonSavings: monthlyCarbonSavings,
    monthlyDieselSavings: monthlyDieselSavings
  }
}

apiRouter.get('/savings/:id', (c) => {
  const id = parseInt(c.req.param('id'))

  console.log(`Fetching savings for device ID: ${id}`)

  const deviceSavings = c.get('db').deviceSavings
  const savings = deviceSavings.filter((s) => s.deviceId === id)

  if (savings.length === 0) {
    return c.notFound(`No savings found for device with ID ${id}`)
  }

  return c.json(getConsolidatedSavings(savings))
})

export default apiRouter
