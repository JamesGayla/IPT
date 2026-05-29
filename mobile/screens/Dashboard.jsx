import React, { useState, useEffect, useCallback } from 'react'
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  Alert
} from 'react-native'
import apiService from '../services/api'

export default function Dashboard() {
  const [parkingData, setParkingData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState('')

  const fetchParkingData = useCallback(async () => {
    try {
      setError('')
      const data = await apiService.getParkingLot()
      setParkingData(data)
      setLoading(false)
    } catch (err) {
      setError(err.message || 'Failed to load parking data')
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchParkingData()
    const interval = setInterval(fetchParkingData, 3000)
    return () => clearInterval(interval)
  }, [fetchParkingData])

  const onRefresh = useCallback(() => {
    setRefreshing(true)
    fetchParkingData()
    setTimeout(() => setRefreshing(false), 1000)
  }, [fetchParkingData])

  const handleToggleSpot = async (spotNumber) => {
    try {
      await apiService.toggleParkingSpot(spotNumber)
      await fetchParkingData()
    } catch (err) {
      Alert.alert('Error', err.message || 'Failed to toggle spot')
    }
  }

  if (loading && !parkingData) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#2563eb" />
        <Text style={styles.loadingText}>Loading parking data...</Text>
      </View>
    )
  }

  const occupiedSpots = parkingData?.occupiedSpots || []
  const totalSpots = parkingData?.totalSpots || 8
  const availableSpots = parkingData?.availableSpots || 0
  const occupancyPercent = parkingData?.occupancyPercentage || 0

  // Create array of 8 spots
  const spots = Array.from({ length: 8 }, (_, i) => ({
    id: i,
    number: i,
    name: `A${i + 1}`,
    occupied: occupiedSpots.includes(i)
  }))

  const SpotCard = ({ spot }) => (
    <TouchableOpacity
      style={[
        styles.spotCard,
        spot.occupied ? styles.spotCardOccupied : styles.spotCardAvailable
      ]}
      onPress={() => handleToggleSpot(spot.number)}
      activeOpacity={0.7}
    >
      <Text style={styles.spotName}>{spot.name}</Text>

      <View style={[
        styles.badge,
        spot.occupied ? styles.badgeRed : styles.badgeGreen
      ]}>
        <Text style={styles.badgeText}>
          {spot.occupied ? '🚗 OCCUPIED' : '✓ EMPTY'}
        </Text>
      </View>

      <View style={styles.spotDetails}>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Status:</Text>
          <View style={styles.dot} />
          <Text style={styles.detailValue}>Active</Text>
        </View>
      </View>
    </TouchableOpacity>
  )

  return (
    <View style={styles.container}>
      <ScrollView
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>Parking Lot Status</Text>

        {error ? (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : null}

        {/* Stats Row */}
        <View style={styles.statsContainer}>
          <View style={styles.statBox}>
            <Text style={styles.statLabel}>Total Spots</Text>
            <Text style={styles.statNumber}>{totalSpots}</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statLabel}>Occupied</Text>
            <Text style={[styles.statNumber, { color: '#dc2626' }]}>
              {occupiedSpots.length}
            </Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statLabel}>Available</Text>
            <Text style={[styles.statNumber, { color: '#16a34a' }]}>
              {availableSpots}
            </Text>
          </View>
        </View>

        {/* Occupancy Bar */}
        <View style={styles.occupancyBox}>
          <View style={styles.occupancyHeader}>
            <Text style={styles.occupancyLabel}>Occupancy</Text>
            <Text style={styles.occupancyPercent}>{occupancyPercent}%</Text>
          </View>
          <View style={styles.progressBar}>
            <View
              style={[
                styles.progressFill,
                { width: `${occupancyPercent}%` }
              ]}
            />
          </View>
        </View>

        {/* Spots Grid - 2 Columns, 4 Rows */}
        <Text style={styles.spotsGridTitle}>Parking Spots</Text>

        <View style={styles.spotsGrid}>
          {spots.map((spot, idx) => (
            <View key={spot.id} style={styles.spotGridItem}>
              <SpotCard spot={spot} />
            </View>
          ))}
        </View>

        <View style={styles.spacer} />
      </ScrollView>
    </View>
  )
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc'
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8fafc'
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#666',
    textAlign: 'center'
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#1f2937',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8
  },
  errorBox: {
    backgroundColor: '#fecaca',
    borderColor: '#dc2626',
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginHorizontal: 12,
    marginBottom: 12
  },
  errorText: {
    color: '#991b1b',
    fontSize: 12,
    fontWeight: '600'
  },
  statsContainer: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 12,
    marginBottom: 16
  },
  statBox: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    alignItems: 'center'
  },
  statLabel: {
    fontSize: 11,
    color: '#6b7280',
    fontWeight: '600',
    marginBottom: 4
  },
  statNumber: {
    fontSize: 22,
    fontWeight: '700',
    color: '#2563eb'
  },
  occupancyBox: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    marginHorizontal: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb'
  },
  occupancyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8
  },
  occupancyLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#374151'
  },
  occupancyPercent: {
    fontSize: 16,
    fontWeight: '700',
    color: '#2563eb'
  },
  progressBar: {
    height: 8,
    backgroundColor: '#e5e7eb',
    borderRadius: 4,
    overflow: 'hidden'
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#2563eb'
  },
  spotsGridTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
    paddingHorizontal: 12,
    marginBottom: 12,
    marginTop: 8
  },
  spotsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 8,
    marginBottom: 16
  },
  spotGridItem: {
    width: '50%',
    paddingHorizontal: 4,
    marginBottom: 12
  },
  spotCard: {
    borderRadius: 10,
    padding: 12,
    borderWidth: 2,
    minHeight: 140
  },
  spotCardOccupied: {
    backgroundColor: '#fee2e2',
    borderColor: '#dc2626'
  },
  spotCardAvailable: {
    backgroundColor: '#f0fdf4',
    borderColor: '#16a34a'
  },
  spotName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 8
  },
  badge: {
    borderRadius: 6,
    paddingVertical: 6,
    paddingHorizontal: 8,
    marginBottom: 8,
    alignItems: 'center'
  },
  badgeRed: {
    backgroundColor: '#dc2626'
  },
  badgeGreen: {
    backgroundColor: '#16a34a'
  },
  badgeText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 12
  },
  spotDetails: {
    gap: 4
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4
  },
  detailLabel: {
    fontSize: 10,
    color: '#4b5563',
    fontWeight: '600',
    width: 50
  },
  detailValue: {
    fontSize: 11,
    color: '#374151',
    fontWeight: '600'
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#16a34a'
  },
  spacer: {
    height: 30
  }
})
