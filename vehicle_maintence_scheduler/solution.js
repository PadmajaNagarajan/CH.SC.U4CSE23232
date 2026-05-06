const axios = require('axios');

const ACCESS_TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJNYXBDbGFpbXMiOnsiYXVkIjoiaHR0cDovLzIwLjI0NC41Ni4xNDQvZXZhbHVhdGlvbi1zZXJ2aWNlIiwiZW1haWwiOiJjaC5zYy51NGNzZTIzMjMyQGNoLnN0dWRlbnRzLmFtcml0YS5lZHUiLCJleHAiOjE3NzgwNjA1MjYsImlhdCI6MTc3ODA1OTYyNiwiaXNzIjoiQWZmb3JkIE1lZGljYWwgVGVjaG5vbG9naWVzIFByaXZhdGUgTGltaXRlZCIsImp0aSI6IjcyYjM4NzU5LWFkMmQtNDBiOC1hNGY1LWI1NWZkZTlkMDQyYiIsImxvY2FsZSI6ImVuLUlOIiwibmFtZSI6InBhZG1hamFuYWdhcmFqYW4iLCJzdWIiOiJhOGI2NGEzZC0zNGY3LTRkMzktODNlYS02Zjk5NjU2YTgyYzgifSwiZW1haWwiOiJjaC5zYy51NGNzZTIzMjMyQGNoLnN0dWRlbnRzLmFtcml0YS5lZHUiLCJuYW1lIjoicGFkbWFqYW5hZ2FyYWphbiIsInJvbGxObyI6ImNoLnNjLnU0Y3NlMjMyMzIiLCJhY2Nlc3NDb2RlIjoiUFRCTW1RIiwiY2xpZW50SUQiOiJhOGI2NGEzZC0zNGY3LTRkMzktODNlYS02Zjk5NjU2YTgyYzgiLCJjbGllbnRTZWNyZXQiOiJtQWZ6YnRBbkpZamZSbUtlIn0.qgjyGJOKohl1d9Sjvi_OopmjcxvcWjjyhj8QeBjTXVQ";

const headers = {
    'Authorization': `Bearer ${ACCESS_TOKEN}`,
    'Content-Type': 'application/json'
};

// Step 1: Fetch all depots
async function getDepots() {
    const res = await axios.get(
        'http://20.207.122.201/evaluation-service/depots',
        { headers }
    );
    return res.data.depots;
}

// Step 2: Fetch all vehicles
async function getVehicles() {
    const res = await axios.get(
        'http://20.207.122.201/evaluation-service/vehicles',
        { headers }
    );
    return res.data.vehicles;
}

// Step 3: Knapsack algorithm - picks best vehicles within budget
function knapsack(vehicles, maxHours) {
    const n = vehicles.length;
    const dp = Array(n + 1).fill(null).map(() => Array(maxHours + 1).fill(0));

    for (let i = 1; i <= n; i++) {
        const duration = vehicles[i-1].Duration;
        const impact = vehicles[i-1].Impact;
        for (let w = 0; w <= maxHours; w++) {
            dp[i][w] = dp[i-1][w];
            if (duration <= w) {
                dp[i][w] = Math.max(dp[i][w], dp[i-1][w-duration] + impact);
            }
        }
    }

    // Find selected vehicles
    let w = maxHours;
    const selected = [];
    for (let i = n; i > 0; i--) {
        if (dp[i][w] !== dp[i-1][w]) {
            selected.push(vehicles[i-1]);
            w -= vehicles[i-1].Duration;
        }
    }

    return {
        maxImpact: dp[n][maxHours],
        selectedVehicles: selected
    };
}

// Main function
async function main() {
    try {
        console.log("Fetching depots...");
        const depots = await getDepots();
        console.log(`Found ${depots.length} depots`);

        console.log("Fetching vehicles...");
        const vehicles = await getVehicles();
        console.log(`Found ${vehicles.length} vehicles`);

        // Run knapsack for each depot
        for (const depot of depots) {
            console.log(`\n--- Depot ID: ${depot.ID} | Budget: ${depot.MechanicHours} hours ---`);
            const result = knapsack(vehicles, depot.MechanicHours);
            console.log(`Max Impact Score: ${result.maxImpact}`);
            console.log(`Selected ${result.selectedVehicles.length} vehicles:`);
            result.selectedVehicles.forEach(v => {
                console.log(`  TaskID: ${v.TaskID} | Duration: ${v.Duration}hrs | Impact: ${v.Impact}`);
            });
        }

    } catch (error) {
        console.error("Error:", error.message);
    }
}

main();