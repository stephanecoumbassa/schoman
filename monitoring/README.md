# Monitoring Configuration Files

This directory contains all configuration files for monitoring the Schoman application in production.

## 📁 Directory Structure

```
monitoring/
├── prometheus/
│   ├── prometheus.yml       # Prometheus main configuration
│   ├── alerts.yml          # Alert rules definitions
│   └── alertmanager.yml    # Alert routing and notifications
├── grafana/
│   ├── provisioning/
│   │   ├── datasources/    # Auto-configured datasources
│   │   └── dashboards/     # Dashboard provisioning
│   └── dashboards/         # Dashboard JSON files (to be added)
└── README.md               # This file
```

## 🚀 Quick Start

1. **Start the monitoring stack**:
   ```bash
   docker-compose -f docker-compose.monitoring.yml up -d
   ```

2. **Access dashboards**:
   - Grafana: http://localhost:3030 (admin/admin123)
   - Prometheus: http://localhost:9090
   - Alertmanager: http://localhost:9093

3. **View metrics**:
   ```bash
   curl http://localhost:3000/metrics
   ```

## 📝 Configuration Files

### Prometheus (`prometheus/prometheus.yml`)

Configures:
- Scrape intervals and targets
- Data retention policies
- Alert rule files
- Service discovery

**Key Settings**:
- Scrape interval: 15s
- Retention: 30 days
- Targets: Backend, MongoDB, Redis, System

### Alert Rules (`prometheus/alerts.yml`)

Defines when to trigger alerts:
- **Critical**: Service down, database disconnected
- **Warning**: High resource usage, slow queries
- **Info**: Service restarts, configuration changes

### Alertmanager (`prometheus/alertmanager.yml`)

Routes alerts to appropriate channels:
- Email notifications
- Slack integration (optional)
- PagerDuty integration (optional)
- Alert grouping and deduplication

### Grafana Provisioning

Auto-configures Grafana on startup:
- Datasources: Prometheus connection
- Dashboards: Pre-built monitoring dashboards

## 🔧 Customization

### Adding New Metrics

1. Expose metrics in your code:
   ```javascript
   // Example: Custom counter
   const requestCounter = new Counter({
     name: 'http_requests_total',
     help: 'Total HTTP requests'
   });
   ```

2. Update `prometheus.yml` if needed

3. Create Grafana panel to visualize

### Adding New Alerts

1. Edit `prometheus/alerts.yml`:
   ```yaml
   - alert: MyNewAlert
     expr: my_metric > threshold
     for: 5m
     labels:
       severity: warning
     annotations:
       summary: "Alert description"
   ```

2. Reload Prometheus:
   ```bash
   curl -X POST http://localhost:9090/-/reload
   ```

### Configuring Notifications

1. Edit `prometheus/alertmanager.yml`

2. Add email credentials:
   ```yaml
   smtp_smarthost: 'smtp.gmail.com:587'
   smtp_from: 'alerts@yourdomain.com'
   smtp_auth_username: 'your-email@gmail.com'
   smtp_auth_password: 'your-app-password'
   ```

3. Add Slack webhook (optional):
   ```yaml
   slack_configs:
     - api_url: 'YOUR_WEBHOOK_URL'
       channel: '#alerts'
   ```

4. Restart Alertmanager:
   ```bash
   docker-compose -f docker-compose.monitoring.yml restart alertmanager
   ```

## 📊 Available Metrics

### Backend Metrics

- `nodejs_process_uptime_seconds`: Process uptime
- `nodejs_memory_usage_bytes`: Memory usage (heap, RSS)
- `nodejs_cpu_usage_*`: CPU usage stats
- `database_connection_status`: DB connection (1=connected)
- `cache_connection_status`: Cache status (1=connected)
- `system_memory_bytes`: System memory stats

### MongoDB Metrics (via exporter)

- `mongodb_connections`: Active connections
- `mongodb_network_bytes_total`: Network I/O
- `mongodb_op_counters_total`: Operations count
- `mongodb_memory`: Memory usage

### Redis Metrics (via exporter)

- `redis_connected_clients`: Connected clients
- `redis_used_memory_bytes`: Memory usage
- `redis_commands_processed_total`: Commands processed
- `redis_keyspace_hits_total`: Cache hits

### System Metrics (via node-exporter)

- `node_cpu_seconds_total`: CPU usage
- `node_memory_*`: Memory stats
- `node_disk_*`: Disk I/O and usage
- `node_network_*`: Network stats

## 🔍 Monitoring Best Practices

1. **Start Simple**: Monitor basics first (uptime, errors)
2. **Add Gradually**: Add more metrics as needs grow
3. **Set Thresholds**: Base on actual usage patterns
4. **Review Regularly**: Tune alerts to reduce noise
5. **Document Changes**: Keep this README updated

## 🛠️ Troubleshooting

### Prometheus Not Scraping

```bash
# Check targets status
curl http://localhost:9090/api/v1/targets | jq

# Check Prometheus logs
docker-compose -f docker-compose.monitoring.yml logs prometheus
```

### Grafana Can't Connect

```bash
# Test from Grafana container
docker-compose -f docker-compose.monitoring.yml exec grafana \
  wget -O- http://prometheus:9090/api/v1/query?query=up
```

### Alerts Not Firing

```bash
# Check alert rules
curl http://localhost:9090/api/v1/rules | jq

# Check Alertmanager
curl http://localhost:9093/api/v1/alerts | jq
```

## 📚 Additional Resources

- [Prometheus Documentation](https://prometheus.io/docs/)
- [Grafana Documentation](https://grafana.com/docs/)
- [Alertmanager Documentation](https://prometheus.io/docs/alerting/latest/alertmanager/)
- [PromQL Basics](https://prometheus.io/docs/prometheus/latest/querying/basics/)

## 🔐 Security Notes

- Change default Grafana password immediately
- Restrict access to monitoring ports (9090, 9093, 3030)
- Use HTTPS in production
- Don't expose `/metrics` endpoint publicly
- Rotate credentials regularly

## 📞 Support

For issues or questions:
- Check [MONITORING.md](../MONITORING.md) for detailed guide
- Review logs: `docker-compose -f docker-compose.monitoring.yml logs`
- Create an issue on GitHub

---

**Last Updated**: October 27, 2025  
**Maintained By**: Schoman DevOps Team
