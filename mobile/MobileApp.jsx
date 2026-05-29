// mobile/MobileApp.jsx
import React, { useState } from 'react'
import { SafeAreaView, StatusBar, View, Text, TouchableOpacity, StyleSheet } from 'react-native'
import Login from './screens/Login'
import Dashboard from './screens/Dashboard'
import Analytics from './screens/Analytics'
import CameraScreen from './screens/Camera'
import Profile from './screens/Profile'
import Alerts from './screens/Alerts'
import ActivityHistory from './screens/ActivityHistory'

const MobileApp = () => {
  const [user, setUser] = useState(null)
  const [activeTab, setActiveTab] = useState('dashboard')

  if (!user) {
    return (
      <SafeAreaView style={{ flex: 1 }}>
        <StatusBar barStyle="dark-content" />
        <Login onLogin={setUser} />
      </SafeAreaView>
    )
  }

  const renderScreen = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard />
      case 'analytics':
        return <Analytics />
      case 'camera':
        return <CameraScreen />
      case 'alerts':
        return <Alerts />
      case 'history':
        return <ActivityHistory />
      case 'profile':
        return <Profile user={user} onLogout={() => setUser(null)} />
      default:
        return <Dashboard />
    }
  }

  const tabs = ['dashboard', 'analytics', 'camera', 'alerts', 'history', 'profile']

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />

      <View style={styles.header}>
        <Text style={styles.title}>ParkFlow</Text>
        <TouchableOpacity style={styles.logoutBtn} onPress={() => setUser(null)}>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.tabBar}>
        {tabs.map((tab) => (
          <TouchableOpacity
            key={tab}
            style={activeTab === tab ? styles.tabActive : styles.tab}
            onPress={() => setActiveTab(tab)}
          >
            <Text style={styles.tabText}>{tab.charAt(0).toUpperCase() + tab.slice(1)}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.content}>
        {renderScreen()}
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  header: { padding: 16, borderBottomWidth: 1, borderColor: '#d1d5db', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  title: { fontSize: 20, fontWeight: '700' },
  logoutBtn: { backgroundColor: '#ef4444', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 },
  logoutText: { color: '#fff', fontWeight: '600' },
  tabBar: { flexDirection: 'row', backgroundColor: '#fff', borderBottomWidth: 1, borderColor: '#e5e7eb' },
  tab: { flex: 1, paddingVertical: 10, alignItems: 'center' },
  tabActive: { flex: 1, paddingVertical: 10, alignItems: 'center', borderBottomWidth: 2, borderColor: '#2563eb', backgroundColor: '#e0f2fe' },
  tabText: { fontWeight: '600', fontSize: 12 },
  content: { flex: 1 }
})

export default MobileApp;
