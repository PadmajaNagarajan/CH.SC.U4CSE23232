const { Log } = require('./index');

// Test different log types
Log("backend", "debug", "db", "Database connected successfully");
Log("backend", "error", "handler", "received string, expected bool");
Log("backend", "fatal", "db", "Critical database connection failure.");
Log("backend", "info", "controller", "Request received");
Log("backend", "warn", "cache", "Cache miss occurred");