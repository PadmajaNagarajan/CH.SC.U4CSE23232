const axios = require('axios');

const ACCESS_TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJNYXBDbGFpbXMiOnsiYXVkIjoiaHR0cDovLzIwLjI0NC41Ni4xNDQvZXZhbHVhdGlvbi1zZXJ2aWNlIiwiZW1haWwiOiJjaC5zYy51NGNzZTIzMjMyQGNoLnN0dWRlbnRzLmFtcml0YS5lZHUiLCJleHAiOjE3NzgwNjExOTcsImlhdCI6MTc3ODA2MDI5NywiaXNzIjoiQWZmb3JkIE1lZGljYWwgVGVjaG5vbG9naWVzIFByaXZhdGUgTGltaXRlZCIsImp0aSI6ImE5YWFlZjcxLWMwMTEtNDBiZS1hZWY1LTIyMWNmYmI5MzhhMSIsImxvY2FsZSI6ImVuLUlOIiwibmFtZSI6InBhZG1hamFuYWdhcmFqYW4iLCJzdWIiOiJhOGI2NGEzZC0zNGY3LTRkMzktODNlYS02Zjk5NjU2YTgyYzgifSwiZW1haWwiOiJjaC5zYy51NGNzZTIzMjMyQGNoLnN0dWRlbnRzLmFtcml0YS5lZHUiLCJuYW1lIjoicGFkbWFqYW5hZ2FyYWphbiIsInJvbGxObyI6ImNoLnNjLnU0Y3NlMjMyMzIiLCJhY2Nlc3NDb2RlIjoiUFRCTW1RIiwiY2xpZW50SUQiOiJhOGI2NGEzZC0zNGY3LTRkMzktODNlYS02Zjk5NjU2YTgyYzgiLCJjbGllbnRTZWNyZXQiOiJtQWZ6YnRBbkpZamZSbUtlIn0.HFrESaZaazbTCcccxYfzEEQTDXiocEKSLmoHP2lLoug";

async function getTopNotifications(n = 10) {
    const res = await axios.get(
        'http://20.207.122.201/evaluation-service/notifications',
        { headers: { 'Authorization': `Bearer ${ACCESS_TOKEN}` } }
    );

    const notifications = res.data.notifications;
    const typeWeight = { 'Placement': 3, 'Result': 2, 'Event': 1 };

    const scored = notifications.map(notif => ({
        ...notif,
        score: (typeWeight[notif.Type] || 0) * 1000 +
               new Date(notif.Timestamp).getTime() / 1e10
    }));

    scored.sort((a, b) => b.score - a.score);
    return scored.slice(0, n);
}

getTopNotifications(10).then(results => {
    console.log("Top 10 Priority Notifications:");
    console.log("================================");
    results.forEach((notif, i) => {
        console.log(`${i+1}. [${notif.Type}] ${notif.Message} | ${notif.Timestamp}`);
    });
}).catch(err => console.error("Error:", err.message));