import { useState, useEffect, useCallback } from 'react'
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator, RefreshControl } from 'react-native'
import apiService from '../services/api'

function Alerts() {
  const [alerts, setAlerts] = useState([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  const fetchAlerts = useCallback(async () => {
    setLoading(true)
    try {
      const data = await apiService.getAlerts()
      setAlerts(data)
    } catch (error) {
      console.error('Failed to fetch alerts:', error)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [])

  useEffect(() => {
    fetchAlerts()
    // Poll every 3 seconds like the web app
    const interval = setInterval(fetchAlerts, 3000)
    return () => clearInterval(interval)
  }, [fetchAlerts])

  const dismissAlert = useCallback(async (alertId) => {
    try {
      await apiService.dismissAlert(alertId)
      setAlerts(alerts.filter(a => a.id !== alertId))
    } catch (error) {
      console.error('Failed to dismiss alert:', error)
    }
  }, [alerts])

  const onRefresh = useCallback(() => {
    setRefreshing(true)
    fetchAlerts()
  }, [fetchAlerts])

  if (loading && alerts.length === 0) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#2563eb" />
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Notifications</Text>
      
      {alerts.length === 0 && !loading ? (
        <Text style={styles.emptyText}>No alerts at the moment</Text>
      ) : (
        <FlatList
          data={alerts}
          keyExtractor={(item) => item.id?.toString()}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          renderItem={({ item }) => (
            <View style={[styles.alertItem, styles[`alert${item.severity?.charAt(0).toUpperCase() + item.severity?.slice(1)}`]]}>
              <View style={styles.alertContent}>
                <Text style={styles.alertType}>{item.type?.replace(/_/g, ' ')}</Text>
                <Text style={styles.alertMessage}>{item.message}</Text>
                <Text style={styles.alertTime}>{new Date(item.timestamp).toLocaleString()}</Text>
              </View>
              <TouchableOpacity style={styles.dismissBtn} onPress={() => dismissAlert(item.id)}>
                <Text style={styles.dismissText}>✕</Text>
              </TouchableOpacity>
            </View>
          )}
          scrollEnabled={true}
        />
      )}

      {!loading && <TouchableOpacity style={styles.refreshBtn} onPress={onRefresh}>
        <Text style={styles.refreshText}>🔄 Refresh</Text>
      </TouchableOpacity>}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f8fafc',
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 16,
    color: '#1f2937',
  },
  emptyText: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    marginVertical: 20,
  },
  alertItem: {
    flexDirection: 'row',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
    borderLeftWidth: 4,
  },
  alertCritical: {
    backgroundColor: '#fee2e2',
    borderLeftColor: '#dc2626',
  },
  alertWarning: {
    backgroundColor: '#fef3c7',
    borderLeftColor: '#f59e0b',
  },
  alertInfo: {
    backgroundColor: '#dbeafe',
    borderLeftColor: '#3b82f6',
  },
  alertContent: {
    flex: 1,
  },
  alertType: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 4,
  },
  alertMessage: {
    fontSize: 13,
    color: '#4b5563',
    marginBottom: 4,
  },
  alertTime: {
    fontSize: 12,
    color: '#9ca3af',
  },
  dismissBtn: {
    paddingHorizontal: 8,
    justifyContent: 'center',
  },
  dismissText: {
    fontSize: 18,
    color: '#6b7280',
  },
  refreshBtn: {
    backgroundColor: '#2563eb',
    borderRadius: 6,
    paddingVertical: 10,
    paddingHorizontal: 16,
    alignItems: 'center',
    marginTop: 16,
  },
  refreshText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
})

export default Alerts
