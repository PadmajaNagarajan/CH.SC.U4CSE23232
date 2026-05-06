const axios = require('axios');

const ACCESS_TOKEN = "paste_your_access_token_here";

async function Log(stack, level, package_name, message) {
    try {
        const response = await axios.post(
            'http://20.207.122.201/evaluation-service/logs',
            {
                stack: stack,
                level: level,
                package: package_name,
                message: message
            },
            {
                headers: {
                    'Authorization': `Bearer ${"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJNYXBDbGFpbXMiOnsiYXVkIjoiaHR0cDovLzIwLjI0NC41Ni4xNDQvZXZhbHVhdGlvbi1zZXJ2aWNlIiwiZW1haWwiOiJjaC5zYy51NGNzZTIzMjMyQGNoLnN0dWRlbnRzLmFtcml0YS5lZHUiLCJleHAiOjE3NzgwNTg4NTEsImlhdCI6MTc3ODA1Nzk1MSwiaXNzIjoiQWZmb3JkIE1lZGljYWwgVGVjaG5vbG9naWVzIFByaXZhdGUgTGltaXRlZCIsImp0aSI6IjQwZDYxZDhmLWY5N2YtNDdmYy05NmU0LTY0NTY4ODQ2Mjc2NCIsImxvY2FsZSI6ImVuLUlOIiwibmFtZSI6InBhZG1hamFuYWdhcmFqYW4iLCJzdWIiOiJhOGI2NGEzZC0zNGY3LTRkMzktODNlYS02Zjk5NjU2YTgyYzgifSwiZW1haWwiOiJjaC5zYy51NGNzZTIzMjMyQGNoLnN0dWRlbnRzLmFtcml0YS5lZHUiLCJuYW1lIjoicGFkbWFqYW5hZ2FyYWphbiIsInJvbGxObyI6ImNoLnNjLnU0Y3NlMjMyMzIiLCJhY2Nlc3NDb2RlIjoiUFRCTW1RIiwiY2xpZW50SUQiOiJhOGI2NGEzZC0zNGY3LTRkMzktODNlYS02Zjk5NjU2YTgyYzgiLCJjbGllbnRTZWNyZXQiOiJtQWZ6YnRBbkpZamZSbUtlIn0.ps9mHKKIOU_LdZTEn7MZYstZrJ5aO29u8tpoRnyR6E4"}`,
                    'Content-Type': 'application/json'
                }
            }
        );
        return response.data;
    } catch (error) {
        console.error('Logging failed:', error.message);
    }
}

module.exports = { Log };