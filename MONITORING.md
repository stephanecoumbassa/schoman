# 📊 Production Monitoring Guide - Schoman

Complete guide for setting up and using production monitoring for the Schoman school management application.

## 📋 Table of Contents

1. [Overview](#overview)
2. [Monitoring Stack](#monitoring-stack)
3. [Quick Start](#quick-start)
4. [Health Check Endpoints](#health-check-endpoints)
5. [Prometheus Configuration](#prometheus-configuration)
6. [Grafana Dashboards](#grafana-dashboards)
7. [Alerting](#alerting)
8. [Best Practices](#best-practices)
9. [Troubleshooting](#troubleshooting)

## Overview

### What is Monitored

Schoman's monitoring system tracks:

- ✅ **Application Health**: Service uptime, readiness, liveness
- ✅ **Performance**: Response times, throughput, latency
- ✅ **Resources**: CPU, memory, disk usage
- ✅ **Database**: MongoDB connections, query performance
- ✅ **Cache**: Redis status, hit/miss ratios
- ✅ **Business Metrics**: Active users, requests per minute
- ✅ **Errors**: Error rates, exceptions, failed requests

### Architecture

```
┌─────────────┐
│   Schoman   │──metrics──▶│ Prometheus │──queries──▶│  Grafana   │
│   Backend   │            │  (Storage) │            │ (Dashboard)│
└─────────────┘            └────────────┘            └────────────┘
       │                          │                          │
       │                          │                          ▼
       ▼                          ▼                   ┌──────────────┐
┌─────────────┐           ┌────────────┐            │  Operators   │
│  Exporters  │           │Alertmanager│            │    (You!)    │
│ (MongoDB,   │           │  (Alerts)  │            └──────────────┘
│  Redis,etc) │           └────────────┘
└─────────────┘                  │
                                 ▼
                          ┌──────────────┐
                          │ Notifications│
                          │ (Email/Slack)│
                          └──────────────┘
```

## Monitoring Stack

### Components

| Component | Purpose | Port | URL |
|-----------|---------|------|-----|
| **Prometheus** | Metrics collection & storage | 9090 | http://localhost:9090 |
| **Grafana** | Visualization & dashboards | 3030 | http://localhost:3030 |
| **Alertmanager** | Alert routing & notifications | 9093 | http://localhost:9093 |
| **MongoDB Exporter** | MongoDB metrics | 9216 | http://localhost:9216/metrics |
| **Redis Exporter** | Redis metrics | 9121 | http://localhost:9121/metrics |
| **Node Exporter** | System metrics | 9100 | http://localhost:9100/metrics |

## Quick Start

### 1. Start Monitoring Stack

```bash
# Start main application first (if not already running)
docker-compose up -d

# Start monitoring stack
docker-compose -f docker-compose.monitoring.yml up -d

# Verify all services are running
docker-compose -f docker-compose.monitoring.yml ps
```

### 2. Access Dashboards

**Grafana Dashboard**
- URL: http://localhost:3030
- Username: `admin`
- Password: `admin123` (change this!)

**Prometheus UI**
- URL: http://localhost:9090
- No authentication by default

**Alertmanager UI**
- URL: http://localhost:9093
- No authentication by default

### 3. Verify Metrics Collection

```bash
# Check if backend metrics are available
curl http://localhost:3000/metrics

# Check Prometheus is scraping targets
curl http://localhost:9090/api/v1/targets

# Check Grafana datasource
curl http://localhost:3030/api/datasources
```

## Health Check Endpoints

The Schoman backend provides multiple health check endpoints:

### Basic Health Check

```bash
GET /health
```

**Response**:
```json
{
  "status": "OK",
  "timestamp": "2025-10-27T10:00:00.000Z",
  "uptime": 3600.5,
  "database": "Connected",
  "cache": "Connected"
}
```

**Use Case**: Quick health verification, load balancer health checks

### Detailed Health Check

```bash
GET /health/detailed
```

**Response** (abbreviated):
```json
{
  "status": "OK",
  "timestamp": "2025-10-27T10:00:00.000Z",
  "uptime": {
    "process": 3600.5,
    "system": 86400.2
  },
  "system": {
    "platform": "linux",
    "arch": "x64",
    "cpus": 4,
    "loadAverage": [1.2, 0.8, 0.5],
    "memory": {
      "total": "16.00 GB",
      "free": "8.50 GB",
      "used": "7.50 GB",
      "usagePercent": "46.88%"
    }
  },
  "process": {
    "pid": 1234,
    "memory": {
      "rss": "150.25 MB",
      "heapTotal": "120.50 MB",
      "heapUsed": "80.75 MB"
    }
  },
  "services": {
    "database": {
      "status": "Connected",
      "state": 1,
      "host": "mongodb",
      "name": "schoman"
    },
    "cache": {
      "status": "Connected",
      "ready": true
    }
  }
}
```

**Use Case**: Troubleshooting, detailed status monitoring

### Readiness Probe

```bash
GET /ready
```

**Response**:
```json
{
  "status": "READY",
  "timestamp": "2025-10-27T10:00:00.000Z"
}
```

**Use Case**: Kubernetes/orchestration readiness checks

### Liveness Probe

```bash
GET /live
```

**Response**:
```json
{
  "status": "ALIVE",
  "timestamp": "2025-10-27T10:00:00.000Z"
}
```

**Use Case**: Kubernetes/orchestration liveness checks

### Prometheus Metrics

```bash
GET /metrics
```

**Response**: Prometheus-formatted metrics
```
# HELP nodejs_process_uptime_seconds Process uptime in seconds
# TYPE nodejs_process_uptime_seconds gauge
nodejs_process_uptime_seconds 3600.5

# HELP nodejs_memory_usage_bytes Process memory usage in bytes
# TYPE nodejs_memory_usage_bytes gauge
nodejs_memory_usage_bytes{type="rss"} 157515776
nodejs_memory_usage_bytes{type="heapTotal"} 126357504
...
```

**Use Case**: Prometheus scraping, metrics collection

## Prometheus Configuration

### Scrape Configuration

Edit `monitoring/prometheus/prometheus.yml`:

```yaml
scrape_configs:
  - job_name: 'schoman-backend'
    scrape_interval: 15s
    metrics_path: '/metrics'
    static_configs:
      - targets: ['backend:3000']
```

### Common Queries

**Request Rate**:
```promql
rate(http_requests_total[5m])
```

**Error Rate**:
```promql
rate(http_requests_total{status=~"5.."}[5m])
```

**Memory Usage**:
```promql
nodejs_memory_usage_bytes{type="heapUsed"} / nodejs_memory_usage_bytes{type="heapTotal"}
```

**Database Status**:
```promql
database_connection_status
```

**Active Connections**:
```promql
mongodb_connections{state="current"}
```

## Grafana Dashboards

### Pre-configured Dashboards

Schoman includes sample Grafana dashboards:

1. **Schoman Overview**: High-level system health
2. **Backend Performance**: API response times, throughput
3. **Database Metrics**: MongoDB performance and connections
4. **System Resources**: CPU, memory, disk usage
5. **Business Metrics**: Active users, operations per minute

### Creating Custom Dashboards

1. Login to Grafana (http://localhost:3030)
2. Click "+" → "Dashboard"
3. Add panels with Prometheus queries
4. Save dashboard

### Dashboard Best Practices

- ✅ Use consistent time ranges
- ✅ Group related metrics together
- ✅ Add threshold lines for alerts
- ✅ Include descriptions for panels
- ✅ Use templates for multi-environment dashboards

## Alerting

### Alert Types

Schoman defines three alert severities:

| Severity | Response Time | Examples |
|----------|--------------|----------|
| **Critical** | Immediate | Service down, database disconnected |
| **Warning** | Same day | High memory, slow queries |
| **Info** | Next day | Service restarted, config changed |

### Configured Alerts

See `monitoring/prometheus/alerts.yml` for all alert rules:

- Backend service down
- Database connection lost
- High memory usage (>90%)
- High CPU usage
- Cache connection lost
- MongoDB connection issues

### Alert Notifications

Configure notifications in `monitoring/prometheus/alertmanager.yml`:

**Email Notifications**:
```yaml
global:
  smtp_smarthost: 'smtp.gmail.com:587'
  smtp_from: 'alerts@schoman.com'
  smtp_auth_username: 'your-email@gmail.com'
  smtp_auth_password: 'your-app-password'
```

**Slack Notifications** (optional):
```yaml
slack_configs:
  - api_url: 'YOUR_SLACK_WEBHOOK_URL'
    channel: '#alerts'
```

### Testing Alerts

```bash
# Simulate high memory alert (backend)
curl -X POST http://localhost:9093/api/v1/alerts \
  -H 'Content-Type: application/json' \
  -d '[{
    "labels": {"alertname":"HighMemoryUsage","severity":"warning"},
    "annotations": {"summary":"Test alert"}
  }]'
```

## Best Practices

### Monitoring Strategy

1. **Start with the basics**: Service uptime, error rates
2. **Add business metrics**: Active users, key operations
3. **Monitor dependencies**: Database, cache, external APIs
4. **Set meaningful alerts**: Not too noisy, not too quiet
5. **Review regularly**: Update thresholds based on experience

### Alert Fatigue Prevention

- ✅ Set appropriate thresholds (not too sensitive)
- ✅ Use severity levels correctly
- ✅ Group related alerts
- ✅ Add "for" duration to avoid flapping
- ✅ Review and tune alerts regularly

### Performance Monitoring

**Key Metrics to Track**:

- Response time (p50, p95, p99)
- Request rate (requests per second)
- Error rate (percentage)
- Database query time
- Memory usage trend
- CPU utilization

**Thresholds to Set**:

| Metric | Warning | Critical |
|--------|---------|----------|
| Response Time | >500ms | >2s |
| Error Rate | >1% | >5% |
| Memory Usage | >80% | >95% |
| CPU Usage | >70% | >90% |
| Disk Usage | >80% | >95% |

### Data Retention

Configure retention in `prometheus.yml`:

```yaml
--storage.tsdb.retention.time=30d  # Keep 30 days of data
--storage.tsdb.retention.size=50GB # Or limit by size
```

**Recommendations**:
- Development: 7 days
- Staging: 15 days
- Production: 30-90 days

## Troubleshooting

### Metrics Not Showing Up

**Check backend is exposing metrics**:
```bash
curl http://localhost:3000/metrics
```

**Check Prometheus is scraping**:
```bash
# View Prometheus targets
curl http://localhost:9090/api/v1/targets | jq
```

**Check Prometheus logs**:
```bash
docker-compose -f docker-compose.monitoring.yml logs prometheus
```

### Grafana Can't Connect to Prometheus

**Test connectivity**:
```bash
docker-compose -f docker-compose.monitoring.yml exec grafana \
  wget -O- http://prometheus:9090/api/v1/query?query=up
```

**Check datasource configuration**:
- Grafana → Configuration → Data Sources
- Verify URL: `http://prometheus:9090`
- Click "Save & Test"

### Alerts Not Firing

**Check alert rules are loaded**:
```bash
curl http://localhost:9090/api/v1/rules
```

**Check Alertmanager is receiving alerts**:
```bash
curl http://localhost:9093/api/v1/alerts
```

**Check Alertmanager configuration**:
```bash
curl http://localhost:9093/api/v1/status
```

### High Resource Usage

**Prometheus using too much memory**:
- Reduce retention time
- Reduce scrape frequency
- Limit number of time series

**Too many metrics**:
```bash
# Check metric cardinality
curl 'http://localhost:9090/api/v1/label/__name__/values' | jq
```

## Maintenance

### Backing Up Metrics

```bash
# Backup Prometheus data
docker-compose -f docker-compose.monitoring.yml exec prometheus \
  tar czf /prometheus/backup.tar.gz /prometheus/data

# Copy to host
docker cp schoman_prometheus:/prometheus/backup.tar.gz ./prometheus-backup.tar.gz
```

### Backing Up Dashboards

```bash
# Export Grafana dashboards
docker-compose -f docker-compose.monitoring.yml exec grafana \
  grafana-cli admin export-dashboard > dashboards-backup.json
```

### Updating Configuration

```bash
# Update Prometheus config
# 1. Edit monitoring/prometheus/prometheus.yml
# 2. Reload configuration
curl -X POST http://localhost:9090/-/reload

# Update Grafana datasources
# 1. Edit monitoring/grafana/provisioning/datasources/prometheus.yml
# 2. Restart Grafana
docker-compose -f docker-compose.monitoring.yml restart grafana
```

## Security Considerations

### Production Recommendations

1. **Enable authentication** on Grafana (already enabled)
2. **Restrict access** to Prometheus and Alertmanager
3. **Use HTTPS** for all monitoring endpoints
4. **Rotate credentials** regularly
5. **Limit metric exposure** (don't expose `/metrics` publicly)
6. **Use firewalls** to restrict access to monitoring ports

### Securing Grafana

```bash
# Change default password
docker-compose -f docker-compose.monitoring.yml exec grafana \
  grafana-cli admin reset-admin-password NewSecurePassword123!
```

### Securing Prometheus

Add basic auth by configuring Nginx reverse proxy:

```nginx
location /prometheus {
    auth_basic "Prometheus";
    auth_basic_user_file /etc/nginx/.htpasswd;
    proxy_pass http://prometheus:9090;
}
```

## Integration with CI/CD

### Health Checks in Deployment

```bash
#!/bin/bash
# deployment-health-check.sh

echo "Waiting for application to be healthy..."
for i in {1..30}; do
    if curl -f http://localhost:3000/health; then
        echo "Application is healthy!"
        exit 0
    fi
    echo "Attempt $i: Not healthy yet, waiting..."
    sleep 2
done

echo "Application failed to become healthy"
exit 1
```

### Smoke Tests Post-Deployment

```bash
#!/bin/bash
# smoke-tests.sh

# Check health
curl -f http://localhost:3000/health || exit 1

# Check metrics are exposed
curl -f http://localhost:3000/metrics || exit 1

# Check database connection
curl http://localhost:3000/health/detailed | jq -e '.services.database.status == "Connected"' || exit 1

echo "All smoke tests passed!"
```

## Support

### Resources

- [Prometheus Documentation](https://prometheus.io/docs/)
- [Grafana Documentation](https://grafana.com/docs/)
- [Node.js Monitoring Best Practices](https://nodejs.org/en/docs/guides/simple-profiling/)

### Getting Help

- Check logs: `docker-compose -f docker-compose.monitoring.yml logs`
- Review metrics: http://localhost:9090
- Check dashboards: http://localhost:3030
- Create an issue on GitHub

---

**Last Updated**: October 27, 2025  
**Version**: 1.0  
**Status**: Production Ready
