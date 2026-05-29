import { useState, useEffect, useCallback } from 'react'
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator, RefreshControl } from 'react-native'
import apiService from '../services/api'

function ActivityHistory() {
  const [activities, setActivities] = useState([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  const fetchActivity = useCallback(async () => {
    setLoading(true)
    try {
      const data = await apiService.getActivityHistory()
      setActivities(data)
    } catch (error) {
      console.error('Failed to fetch activity:', error)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [])

  useEffect(() => {
    fetchActivity()
  }, [fetchActivity])

  const onRefresh = useCallback(() => {
    setRefreshing(true)
    fetchActivity()
  }, [fetchActivity])

  if (loading && activities.length === 0) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#2563eb" />
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Activity History</Text>

      {activities.length === 0 && !loading ? (
        <Text style={styles.emptyText}>No activity history</Text>
      ) : (
        <FlatList
          data={activities}
          keyExtractor={(item) => item.id?.toString()}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          renderItem={({ item }) => (
            <View style={styles.timelineItem}>
              <View style={styles.marker} />
              <View style={styles.content}>
                <Text style={styles.action}>{item.action?.replace(/_/g, ' ')}</Text>
                <Text style={styles.details}>{item.details}</Text>
                <Text style={styles.timestamp}>{new Date(item.timestamp).toLocaleString()}</Text>
              </View>
            </View>
          )}
          scrollEnabled={true}
        />
      )}

      <TouchableOpacity style={styles.refreshBtn} onPress={fetchActivity}>
        <Text style={styles.refreshText}>🔄 Refresh</Text>
      </TouchableOpacity>
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
  timelineItem: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  marker: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#2563eb',
    marginTop: 6,
    marginRight: 12,
  },
  content: {
    flex: 1,
    paddingLeft: 8,
  },
  action: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 4,
  },
  details: {
    fontSize: 14,
    color: '#4b5563',
    marginBottom: 4,
  },
  timestamp: {
    fontSize: 12,
    color: '#9ca3af',
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

export default ActivityHistory
