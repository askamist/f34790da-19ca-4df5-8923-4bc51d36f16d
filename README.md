# f34790da-19ca-4df5-8923-4bc51d36f16d

## How to run this code

Uses node "v18.19.0" as requested.

Install node packages
> ```npm install```

Run npm servers
> ```npm run dev```

By default backend is hosted on `http://localhost:3000` and frontend on `http://localhost:5173`


## API details

- `/health` - just returns OK
- `/api/devices` - returns device list
- `/api/savings/:device-id` - returns the consolidated saving data for the given device-id, accepts optional query params `from` and `to` which will be use to filter the data used.
