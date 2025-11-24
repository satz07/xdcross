# PM2 Setup Guide for Offramp API Proxy

PM2 is a process manager for Node.js applications that keeps your server running in the background and automatically restarts it if it crashes.

## Prerequisites

- Node.js installed
- npm packages installed (`npm install`)
- `.env` file configured with API keys and secrets

## Installation

### 1. Install PM2 Globally

```bash
npm install -g pm2
```

Or if you prefer using sudo (Linux/Ubuntu):

```bash
sudo npm install -g pm2
```

### 2. Verify Installation

```bash
pm2 --version
```

## Setup

### 1. Create Logs Directory

```bash
mkdir -p logs
```

### 2. Start the Server with PM2

```bash
pm2 start ecosystem.config.js
```

Or start directly:

```bash
pm2 start server.js --name offramp-api
```

### 3. Save PM2 Configuration

This ensures PM2 restarts your app on server reboot:

```bash
pm2 save
pm2 startup
```

The `pm2 startup` command will output a command that you need to run with sudo. Copy and run it.

## Common PM2 Commands

### Start/Stop/Restart

```bash
# Start the application
pm2 start offramp-api

# Stop the application
pm2 stop offramp-api

# Restart the application
pm2 restart offramp-api

# Reload (zero-downtime restart)
pm2 reload offramp-api
```

### Monitoring

```bash
# View application status
pm2 status

# View logs
pm2 logs offramp-api

# View logs with lines limit
pm2 logs offramp-api --lines 100

# Monitor resources (CPU, memory)
pm2 monit
```

### Information

```bash
# View detailed information
pm2 show offramp-api

# View all processes
pm2 list

# View process tree
pm2 list --tree
```

### Logs Management

```bash
# Clear all logs
pm2 flush

# View only error logs
pm2 logs offramp-api --err

# View only output logs
pm2 logs offramp-api --out
```

### Auto-Start on Server Reboot

```bash
# Generate startup script
pm2 startup

# Save current process list
pm2 save
```

After running `pm2 startup`, you'll get a command to run with sudo. Execute it to enable auto-start.

## Configuration

The `ecosystem.config.js` file contains the PM2 configuration:

- **name**: Application name (`offramp-api`)
- **script**: Entry point (`server.js`)
- **instances**: Number of instances (1 for single instance)
- **max_memory_restart**: Restart if memory exceeds 500MB
- **autorestart**: Automatically restart on crash
- **env**: Environment variables (PORT, NODE_ENV)

### Customize Configuration

Edit `ecosystem.config.js` to change:
- Port number
- Number of instances
- Memory limits
- Log file locations

## Troubleshooting

### Check if PM2 is Running

```bash
pm2 status
```

### View Error Logs

```bash
pm2 logs offramp-api --err
```

### Restart After Code Changes

```bash
pm2 restart offramp-api
```

### Remove from PM2

```bash
pm2 delete offramp-api
```

### Check Server Port

```bash
# Check if port 3002 is in use
lsof -i :3002

# Or
netstat -tulpn | grep 3002
```

## Production Best Practices

1. **Set NODE_ENV to production**:
   ```bash
   pm2 start ecosystem.config.js --env production
   ```

2. **Monitor logs regularly**:
   ```bash
   pm2 logs offramp-api --lines 50
   ```

3. **Set up log rotation** (optional):
   ```bash
   pm2 install pm2-logrotate
   ```

4. **Monitor resource usage**:
   ```bash
   pm2 monit
   ```

## Example Workflow

```bash
# 1. Navigate to project directory
cd /path/to/offramp

# 2. Install dependencies (if not done)
npm install

# 3. Start with PM2
pm2 start ecosystem.config.js

# 4. Check status
pm2 status

# 5. View logs
pm2 logs offramp-api

# 6. Save configuration for auto-start
pm2 save
pm2 startup
```

## Stopping PM2

```bash
# Stop the application
pm2 stop offramp-api

# Stop all PM2 processes
pm2 stop all

# Delete the application from PM2
pm2 delete offramp-api
```

## Additional Resources

- [PM2 Documentation](https://pm2.keymetrics.io/docs/usage/quick-start/)
- [PM2 Ecosystem File](https://pm2.keymetrics.io/docs/usage/application-declaration/)

