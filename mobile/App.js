import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Video } from 'expo-av'
import {
  ActivityIndicator,
  Alert,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native'
import AsyncStorage from '@react-native-async-storage/async-storage'

const STORAGE_KEYS = {
  auth: 'parkingAuth',
  users: 'parkingUsers',
}

const TABS = [
  { id: 'status', label: 'Parking' },
  { id: 'analytics', label: 'Analytics' },
  { id: 'admin', label: 'Admin' },
  { id: 'profile', label: 'Profile' },
]
const ADMIN_USERNAME = 'admin'
const ADMIN_PASSWORD = 'admin123'

const FALLBACK_API_BASE =
  Platform.OS === 'android' ? 'http://10.0.2.2:3001' : 'http://localhost:3001'
const API_BASE_URL =
  typeof globalThis !== 'undefined' && globalThis.process?.env?.EXPO_PUBLIC_API_BASE_URL
    ? globalThis.process.env.EXPO_PUBLIC_API_BASE_URL
    : FALLBACK_API_BASE

const STATIC_ALERT_TIMESTAMP = new Date(Date.now() - 60000).toISOString()

const FLOOR_CAMERA_URLS = {
  1: '/Mockup%20Camera.mp4',
  2: '/Mockup%20Camera%202.mp4',
  3: '/Mockup%20Camera%203.mp4',
  4: '/Mockup%20Camera%204.mp4',
}

function CameraViewer({ floor }) {
  const videoRef = useRef(null)
  const [status, setStatus] = useState(null)

  const sourceUrl =
    Platform.OS === 'web'
      ? FLOOR_CAMERA_URLS[floor] || FLOOR_CAMERA_URLS[1]
      : 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4'

  return (
    <View style={styles.cameraCard}>
      <Text style={styles.cardTitle}>Live Floor {floor} Camera</Text>
      <Video
        ref={videoRef}
        source={{ uri: sourceUrl }}
        useNativeControls
        resizeMode="cover"
        isLooping
        style={styles.video}
        onPlaybackStatusUpdate={(update) => setStatus(update)}
      />
      <Text style={styles.smallMuted}>
        {status?.isLoaded ? `Playback ${status.isPlaying ? 'playing' : 'paused'}` : 'Loading camera stream...'}
      </Text>
    </View>
  )
}

function toTitle(value) {
  return value.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, (m) => m.toUpperCase())
}

function AuthScreen({ onLogin }) {
  const [isLogin, setIsLogin] = useState(true)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const resetForm = useCallback(() => {
    setEmail('')
    setPassword('')
    setConfirmPassword('')
    setFullName('')
    setError('')
  }, [])

  const toggleMode = useCallback(() => {
    setIsLogin((prev) => !prev)
    resetForm()
  }, [resetForm])

  const handleSubmit = useCallback(async () => {
    setLoading(true)
    setError('')

    try {
      if (!email || !password) {
        throw new Error('Please fill in all fields')
      }

      const usersRaw = await AsyncStorage.getItem(STORAGE_KEYS.users)
      const savedUsers = usersRaw ? JSON.parse(usersRaw) : []

      if (isLogin) {
        const user = savedUsers.find((u) => u.email === email && u.password === password)
        if (!user) {
          throw new Error('Invalid email or password')
        }

        const authPayload = {
          isAuthenticated: true,
          user: { email: user.email, fullName: user.fullName },
        }
        await AsyncStorage.setItem(STORAGE_KEYS.auth, JSON.stringify(authPayload))
        onLogin(authPayload.user)
      } else {
        if (!fullName || !confirmPassword) {
          throw new Error('Please fill in all fields')
        }
        if (password !== confirmPassword) {
          throw new Error('Passwords do not match')
        }
        if (password.length < 6) {
          throw new Error('Password must be at least 6 characters')
        }
        if (savedUsers.some((u) => u.email === email)) {
          throw new Error('Email already exists')
        }

        const newUser = {
          id: Date.now(),
          email,
          password,
          fullName,
          createdAt: new Date().toISOString(),
        }

        const nextUsers = [...savedUsers, newUser]
        await AsyncStorage.setItem(STORAGE_KEYS.users, JSON.stringify(nextUsers))

        const authPayload = {
          isAuthenticated: true,
          user: { email: newUser.email, fullName: newUser.fullName },
        }
        await AsyncStorage.setItem(STORAGE_KEYS.auth, JSON.stringify(authPayload))
        onLogin(authPayload.user)
      }
    } catch (e) {
      setError(e.message || 'Authentication failed')
    } finally {
      setLoading(false)
    }
  }, [confirmPassword, email, fullName, isLogin, onLogin, password])

  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.authCard}>
        <Text style={styles.brand}>ParkFlow</Text>
        <Text style={styles.authTitle}>{isLogin ? 'Welcome Back' : 'Create Account'}</Text>

        {!isLogin && (
          <TextInput
            style={styles.input}
            placeholder="Full Name"
            value={fullName}
            onChangeText={setFullName}
            autoCapitalize="words"
          />
        )}
        <TextInput
          style={styles.input}
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />
        <TextInput
          style={styles.input}
          placeholder="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />
        {!isLogin && (
          <TextInput
            style={styles.input}
            placeholder="Confirm Password"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry
          />
        )}

        {!!error && <Text style={styles.errorText}>{error}</Text>}

        <Pressable onPress={handleSubmit} style={styles.primaryBtn} disabled={loading}>
          <Text style={styles.primaryBtnText}>
            {loading ? 'Please wait...' : isLogin ? 'Sign In' : 'Create Account'}
          </Text>
        </Pressable>

        <Pressable onPress={toggleMode}>
          <Text style={styles.linkText}>
            {isLogin ? "Don't have an account? Sign Up" : 'Already have an account? Sign In'}
          </Text>
        </Pressable>
      </View>
    </SafeAreaView>
  )
}

function StatusScreen() {
  const [parkingData, setParkingData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [selectedCameraFloor, setSelectedCameraFloor] = useState(1)

  const fetchParking = useCallback(async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/parking-lot`)
      const data = await response.json()
      setParkingData(data)
    } catch (error) {
      console.error('Failed to fetch parking:', error)
      Alert.alert(
        'Unable to reach server',
        `Set EXPO_PUBLIC_API_BASE_URL to your server host. Current: ${API_BASE_URL}`,
      )
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [])

  useEffect(() => {
    fetchParking()
  }, [fetchParking])

  const toggleSpot = useCallback(
    async (spotNumber) => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/parking-lot/toggle/${spotNumber}`, {
          method: 'POST',
        })
        const data = await response.json()
        setParkingData((prev) => {
          if (!prev) return prev
          const totalSpots = prev.totalSpots
          const occupiedSpots = data.occupiedSpots
          return {
            ...prev,
            occupiedSpots,
            availableSpots: totalSpots - occupiedSpots.length,
            occupancyPercentage: Math.round((occupiedSpots.length / totalSpots) * 100),
          }
        })
      } catch {
        Alert.alert('Toggle failed', 'Could not update parking spot.')
      }
    },
    [setParkingData],
  )

  const spots = useMemo(() => {
    if (!parkingData) return []
    return Array.from({ length: parkingData.totalSpots }, (_, i) => ({
      id: i,
      occupied: parkingData.occupiedSpots.includes(i),
    }))
  }, [parkingData])

  if (loading) {
    return <ActivityIndicator style={styles.loader} size="large" />
  }

  const availableSpots = parkingData?.totalSpots - parkingData?.occupiedSpots.length || 0

  return (
    <ScrollView
      style={styles.tabContent}
      contentContainerStyle={styles.sectionGap}
      refreshControl={null}
    >
      <Text style={styles.dashboardTitle}>Parking Overview</Text>

      <View style={styles.segment}>
        {[1, 2, 3, 4].map((floor) => (
          <Pressable
            key={floor}
            onPress={() => setSelectedCameraFloor(floor)}
            style={[styles.segmentBtn, selectedCameraFloor === floor && styles.segmentBtnActive]}
          >
            <Text style={[styles.segmentText, selectedCameraFloor === floor && styles.segmentTextActive]}>
              Floor {floor}
            </Text>
          </Pressable>
        ))}
      </View>

      <CameraViewer floor={selectedCameraFloor} />

      <View style={styles.statsRow}>
        <View style={[styles.statCard, styles.statCardPrimary]}>
          <Text style={styles.statLabel}>Total</Text>
          <Text style={styles.statValue}>{parkingData?.totalSpots ?? 0}</Text>
        </View>
        <View style={[styles.statCard, styles.statCardDanger]}>
          <Text style={styles.statLabel}>Occupied</Text>
          <Text style={styles.statValue}>{parkingData?.occupiedSpots.length ?? 0}</Text>
        </View>
        <View style={[styles.statCard, styles.statCardSuccess]}>
          <Text style={styles.statLabel}>Available</Text>
          <Text style={styles.statValue}>{availableSpots}</Text>
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Parking Lot Status of SM Downtown CDO</Text>
        <Text style={styles.bigStat}>
          {parkingData?.occupiedSpots.length}/{parkingData?.totalSpots}
        </Text>
        <Text style={styles.smallMuted}>{parkingData?.occupancyPercentage}% occupied</Text>
        <Text style={styles.smallMuted}>Available: {availableSpots}</Text>
        <Text style={styles.smallMuted}>API: {API_BASE_URL}</Text>
      </View>

      <View style={styles.grid}>
        {spots.map((spot) => (
          <Pressable
            key={spot.id}
            onPress={() => toggleSpot(spot.id)}
            style={[styles.spotBtn, spot.occupied ? styles.spotOccupied : styles.spotAvailable]}
          >
            <Text style={styles.spotText}>A{spot.id + 1}</Text>
          </Pressable>
        ))}
      </View>

      <Pressable
        onPress={() => {
          setRefreshing(true)
          fetchParking()
        }}
        style={styles.secondaryBtn}
      >
        <Text style={styles.secondaryBtnText}>{refreshing ? 'Refreshing...' : 'Refresh'}</Text>
      </Pressable>
    </ScrollView>
  )
}

function AnalyticsScreen() {
  const stats = {
    totalSpots: 12,
    occupiedSpots: 7,
    availableSpots: 5,
    occupancyPercent: 58,
    totalCameras: 12,
    camerasOnline: 11,
    openAlerts: 2,
  }

  const floorOccupancy = [
    { floor: 1, occupied: 5, total: 12 },
    { floor: 2, occupied: 2, total: 12 },
    { floor: 3, occupied: 7, total: 12 },
    { floor: 4, occupied: 3, total: 12 },
  ]

  return (
    <ScrollView style={styles.tabContent} contentContainerStyle={styles.sectionGap}>
      <Text style={styles.dashboardTitle}>Parking Analytics</Text>

      <View style={styles.statsRow}>
        <View style={[styles.statCard, styles.statCardPrimary]}>
          <Text style={styles.statLabel}>Occupancy</Text>
          <Text style={styles.statValue}>{stats.occupancyPercent}%</Text>
        </View>
        <View style={[styles.statCard, styles.statCardWarning]}>
          <Text style={styles.statLabel}>Available</Text>
          <Text style={styles.statValue}>{stats.availableSpots}</Text>
        </View>
        <View style={[styles.statCard, styles.statCardInfo]}>
          <Text style={styles.statLabel}>Cameras Online</Text>
          <Text style={styles.statValue}>{stats.camerasOnline}/{stats.totalCameras}</Text>
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Current System Status</Text>
        <Text style={styles.rowText}>Occupied Spots: {stats.occupiedSpots}</Text>
        <Text style={styles.rowText}>Available Spots: {stats.availableSpots}</Text>
        <Text style={styles.rowText}>Cameras online: {stats.camerasOnline}</Text>
        <Text style={styles.rowText}>Open alerts: {stats.openAlerts}</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Floor Occupancy</Text>
        {floorOccupancy.map((floorInfo) => (
          <View key={floorInfo.floor} style={styles.rowHorizontal}>
            <Text style={styles.rowText}>Floor {floorInfo.floor}</Text>
            <Text style={styles.smallMuted}>
              {floorInfo.occupied}/{floorInfo.total} occupied
            </Text>
          </View>
        ))}
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Live Camera Mapping</Text>
        <Text style={styles.smallMuted}>Floor 1 → Camera 1</Text>
        <Text style={styles.smallMuted}>Floor 2 → Camera 2</Text>
        <Text style={styles.smallMuted}>Floor 3 → Camera 3</Text>
        <Text style={styles.smallMuted}>Floor 4 → Camera 4</Text>
      </View>
    </ScrollView>
  )
}

function AdminScreen() {
  const [isAdmin, setIsAdmin] = useState(false)
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [activeTab, setActiveTab] = useState('overview')
  const [selectedFloor, setSelectedFloor] = useState(1)

  const stats = useMemo(
    () => ({
      totalSpots: 12,
      occupiedSpots: 6,
      availableSpots: 6,
      occupancyPercentage: 50,
      totalAlerts: 2,
      cameraCount: 12,
    }),
    [],
  )

  const alerts = useMemo(
    () => [
      {
        id: 1,
        type: 'HIGH_OCCUPANCY',
        message: 'Parking lot at 50% capacity',
        severity: 'warning',
        timestamp: new Date().toISOString(),
      },
      {
        id: 2,
        type: 'SPACE_AVAILABLE',
        message: 'New parking spaces now available on Floor 2',
        severity: 'info',
        timestamp: STATIC_ALERT_TIMESTAMP,
      },
    ],
    [],
  )

  const occupancyMap = useMemo(
    () => ({
      1: [0, 2, 4, 7, 9],
      2: [1, 3, 5, 8, 10],
      3: [0, 3, 6, 9, 11],
      4: [1, 4, 7],
    }),
    [],
  )

  const loginAdmin = useCallback(() => {
    if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
      setIsAdmin(true)
      setError('')
      setUsername('')
      setPassword('')
      return
    }
    setError('Invalid admin credentials.')
  }, [password, username])

  if (!isAdmin) {
    return (
      <View style={styles.tabContent}>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Admin Login</Text>
          <TextInput
            style={styles.input}
            placeholder="Username"
            value={username}
            onChangeText={setUsername}
            autoCapitalize="none"
          />
          <TextInput
            style={styles.input}
            placeholder="Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />
          {!!error && <Text style={styles.errorText}>{error}</Text>}
          <Pressable onPress={loginAdmin} style={styles.primaryBtn}>
            <Text style={styles.primaryBtnText}>Sign In</Text>
          </Pressable>
        </View>
      </View>
    )
  }

  return (
    <ScrollView style={styles.tabContent} contentContainerStyle={styles.sectionGap}>
      <Text style={styles.dashboardTitle}>Admin Controls</Text>
      <View style={styles.statsRow}>
        <View style={[styles.statCard, styles.statCardPrimary]}>
          <Text style={styles.statLabel}>Total Spots</Text>
          <Text style={styles.statValue}>{stats.totalSpots}</Text>
        </View>
        <View style={[styles.statCard, styles.statCardDanger]}>
          <Text style={styles.statLabel}>Occupied</Text>
          <Text style={styles.statValue}>{stats.occupiedSpots}</Text>
        </View>
        <View style={[styles.statCard, styles.statCardSuccess]}>
          <Text style={styles.statLabel}>Available</Text>
          <Text style={styles.statValue}>{stats.availableSpots}</Text>
        </View>
      </View>

      <View style={styles.segment}>
        {['overview', 'monitoring', 'alerts'].map((item) => (
          <Pressable
            key={item}
            onPress={() => setActiveTab(item)}
            style={[styles.segmentBtn, activeTab === item && styles.segmentBtnActive]}
          >
            <Text style={[styles.segmentText, activeTab === item && styles.segmentTextActive]}>
              {toTitle(item)}
            </Text>
          </Pressable>
        ))}
      </View>

      {activeTab === 'overview' && (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Admin Overview</Text>
          <Text style={styles.rowText}>Total Spots: {stats.totalSpots}</Text>
          <Text style={styles.rowText}>Occupied: {stats.occupiedSpots}</Text>
          <Text style={styles.rowText}>Available: {stats.availableSpots}</Text>
          <Text style={styles.rowText}>Occupancy: {stats.occupancyPercentage}%</Text>
          <Text style={styles.rowText}>Alerts: {stats.totalAlerts}</Text>
          <Text style={styles.rowText}>CCTV Cameras: {stats.cameraCount}</Text>
        </View>
      )}

      {activeTab === 'monitoring' && (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Floor Monitoring</Text>
          <View style={styles.segment}>
            {[1, 2, 3, 4].map((floor) => (
              <Pressable
                key={floor}
                onPress={() => setSelectedFloor(floor)}
                style={[styles.segmentBtn, selectedFloor === floor && styles.segmentBtnActive]}
              >
                <Text
                  style={[styles.segmentText, selectedFloor === floor && styles.segmentTextActive]}
                >
                  Floor {floor}
                </Text>
              </Pressable>
            ))}
          </View>
          <CameraViewer floor={selectedFloor} />
          <View style={styles.grid}>
            {Array.from({ length: 12 }, (_, i) => {
              const occupied = occupancyMap[selectedFloor]?.includes(i)
              return (
                <View
                  key={i}
                  style={[styles.spotBtn, occupied ? styles.spotOccupied : styles.spotAvailable]}
                >
                  <Text style={styles.spotText}>S{i + 1}</Text>
                </View>
              )
            })}
          </View>
        </View>
      )}

      {activeTab === 'alerts' && (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>System Alerts</Text>
          {alerts.map((item) => (
            <View key={item.id} style={styles.alertRow}>
              <Text style={styles.rowText}>{toTitle(item.type)}</Text>
              <Text style={styles.smallMuted}>{item.message}</Text>
              <Text style={styles.smallMuted}>{new Date(item.timestamp).toLocaleString()}</Text>
            </View>
          ))}
        </View>
      )}

      <Pressable onPress={() => setIsAdmin(false)} style={styles.secondaryBtn}>
        <Text style={styles.secondaryBtnText}>Logout Admin</Text>
      </Pressable>
    </ScrollView>
  )
}

function ProfileScreen({ user, onUserUpdate, onLogout }) {
  const [name, setName] = useState('')
  const [vehiclePlate, setVehiclePlate] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const load = async () => {
      if (!user?.email) return
      const raw = await AsyncStorage.getItem(`profile_${user.email}`)
      if (raw) {
        const profile = JSON.parse(raw)
        setName(profile.name || user.fullName || '')
        setVehiclePlate(profile.vehiclePlate || '')
      } else {
        setName(user.fullName || '')
      }
    }
    load()
  }, [user])

  const saveProfile = useCallback(async () => {
    if (!user?.email) return
    setLoading(true)
    try {
      const payload = { name, vehiclePlate, updatedAt: new Date().toISOString() }
      await AsyncStorage.setItem(`profile_${user.email}`, JSON.stringify(payload))

      const authRaw = await AsyncStorage.getItem(STORAGE_KEYS.auth)
      if (authRaw) {
        const authData = JSON.parse(authRaw)
        authData.user = { ...(authData.user || {}), fullName: name, email: user.email }
        await AsyncStorage.setItem(STORAGE_KEYS.auth, JSON.stringify(authData))
        onUserUpdate(authData.user)
      }

      Alert.alert('Saved', 'Profile updated successfully.')
    } finally {
      setLoading(false)
    }
  }, [name, onUserUpdate, user, vehiclePlate])

  return (
    <ScrollView style={styles.tabContent} contentContainerStyle={styles.sectionGap}>
      <View style={styles.card}>
        <Text style={styles.cardTitle}>User Profile</Text>
        <Text style={styles.smallMuted}>{user?.email}</Text>
      </View>

      <View style={styles.card}>
        <TextInput
          style={styles.input}
          placeholder="Full Name"
          value={name}
          onChangeText={setName}
          autoCapitalize="words"
        />
        <TextInput
          style={styles.input}
          placeholder="Vehicle Plate"
          value={vehiclePlate}
          onChangeText={setVehiclePlate}
          autoCapitalize="characters"
        />
        <Pressable onPress={saveProfile} style={styles.primaryBtn} disabled={loading}>
          <Text style={styles.primaryBtnText}>{loading ? 'Saving...' : 'Save Profile'}</Text>
        </Pressable>
      </View>

      <Pressable onPress={onLogout} style={styles.secondaryBtn}>
        <Text style={styles.secondaryBtnText}>Logout</Text>
      </Pressable>
    </ScrollView>
  )
}

export default function App() {
  const [authLoading, setAuthLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [user, setUser] = useState(null)
  const [activeTab, setActiveTab] = useState('status')

  useEffect(() => {
    const bootstrap = async () => {
      try {
        const authRaw = await AsyncStorage.getItem(STORAGE_KEYS.auth)
        if (authRaw) {
          const auth = JSON.parse(authRaw)
          if (auth?.isAuthenticated && auth?.user) {
            setIsAuthenticated(true)
            setUser(auth.user)
          }
        }
      } catch {
        await AsyncStorage.removeItem(STORAGE_KEYS.auth)
      } finally {
        setAuthLoading(false)
      }
    }
    bootstrap()
  }, [])

  const handleLogin = useCallback((userData) => {
    setIsAuthenticated(true)
    setUser(userData)
    setActiveTab('status')
  }, [])

  const handleLogout = useCallback(async () => {
    await AsyncStorage.removeItem(STORAGE_KEYS.auth)
    setIsAuthenticated(false)
    setUser(null)
    setActiveTab('status')
  }, [])

  const screen =
    activeTab === 'status' ? (
      <StatusScreen />
    ) : activeTab === 'analytics' ? (
      <AnalyticsScreen />
    ) : activeTab === 'admin' ? (
      <AdminScreen />
    ) : activeTab === 'profile' ? (
      <ProfileScreen user={user} onUserUpdate={setUser} onLogout={handleLogout} />
    ) : null

  if (authLoading) {
    return <ActivityIndicator style={styles.loader} size="large" />
  }

  if (!isAuthenticated) {
    return <AuthScreen onLogin={handleLogin} />
  }

  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>ParkFlow</Text>
        <Text style={styles.smallMuted}>{user?.fullName || user?.email}</Text>
      </View>

      <View style={styles.content}>{screen}</View>

      <View style={styles.tabBar}>
        {TABS.map((tab) => (
          <Pressable
            key={tab.id}
            onPress={() => setActiveTab(tab.id)}
            style={[styles.tabBtn, activeTab === tab.id && styles.tabBtnActive]}
          >
            <Text style={[styles.tabText, activeTab === tab.id && styles.tabTextActive]}>
              {tab.label}
            </Text>
          </Pressable>
        ))}
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#f4f6fb',
  },
  loader: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e4e6eb',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#0f172a',
  },
  content: {
    flex: 1,
  },
  tabContent: {
    flex: 1,
    padding: 14,
  },
  sectionGap: {
    gap: 12,
    paddingBottom: 18,
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#e4e6eb',
  },
  tabBtn: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
  },
  tabBtnActive: {
    backgroundColor: '#eff6ff',
  },
  tabText: {
    fontSize: 12,
    color: '#64748b',
    fontWeight: '500',
  },
  tabTextActive: {
    color: '#2563eb',
    fontWeight: '700',
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: '#e4e6eb',
    gap: 8,
  },
  cameraCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: '#e4e6eb',
    marginVertical: 10,
  },
  video: {
    width: '100%',
    height: 210,
    borderRadius: 10,
    backgroundColor: '#000',
  },
  authCard: {
    margin: 16,
    marginTop: 40,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e4e6eb',
    gap: 10,
  },
  brand: {
    fontSize: 24,
    fontWeight: '800',
    color: '#0f172a',
  },
  authTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0f172a',
  },
  input: {
    borderWidth: 1,
    borderColor: '#d2d8e0',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: '#fafafa',
  },
  primaryBtn: {
    backgroundColor: '#2563eb',
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
  },
  primaryBtnText: {
    color: '#ffffff',
    fontWeight: '700',
  },
  secondaryBtn: {
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
    backgroundColor: '#e2e8f0',
  },
  secondaryBtnText: {
    color: '#0f172a',
    fontWeight: '700',
  },
  linkText: {
    textAlign: 'center',
    color: '#2563eb',
    fontWeight: '600',
    marginTop: 4,
  },
  errorText: {
    color: '#dc2626',
    fontWeight: '600',
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0f172a',
  },
  bigStat: {
    fontSize: 32,
    fontWeight: '800',
    color: '#0f172a',
  },
  smallMuted: {
    color: '#64748b',
  },
  dashboardTitle: {
    fontSize: 20,
    fontWeight: '800',
    marginBottom: 8,
    color: '#0f172a',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
    marginBottom: 10,
  },
  statCard: {
    flex: 1,
    borderRadius: 10,
    padding: 10,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 90,
  },
  statCardPrimary: {
    backgroundColor: '#6366f1',
  },
  statCardSuccess: {
    backgroundColor: '#34d399',
  },
  statCardDanger: {
    backgroundColor: '#f87171',
  },
  statCardWarning: {
    backgroundColor: '#fbbf24',
  },
  statCardInfo: {
    backgroundColor: '#38bdf8',
  },
  statLabel: {
    color: '#fff',
    fontSize: 12,
    textTransform: 'uppercase',
    fontWeight: '700',
    marginBottom: 4,
  },
  statValue: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '800',
  },
  rowText: {
    color: '#0f172a',
    fontWeight: '500',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  spotBtn: {
    width: '22%',
    minWidth: 64,
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
  },
  spotAvailable: {
    backgroundColor: '#bbf7d0',
  },
  spotOccupied: {
    backgroundColor: '#fecaca',
  },
  spotText: {
    fontWeight: '700',
    color: '#0f172a',
  },
  segment: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  segmentBtn: {
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 10,
  },
  segmentBtnActive: {
    backgroundColor: '#2563eb',
    borderColor: '#2563eb',
  },
  segmentText: {
    color: '#334155',
    fontWeight: '600',
  },
  segmentTextActive: {
    color: '#ffffff',
  },
  rowHorizontal: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  alertRow: {
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
})
