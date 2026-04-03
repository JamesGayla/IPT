// mobile/MobileApp.jsx
import React, { useState } from 'react'
import { SafeAreaView, StatusBar, View, Text, TouchableOpacity, StyleSheet } from 'react-native'
import Login from './screens/Login'
import CameraScreen from './screens/Camera'

const MobileApp = () => {
  const [user, setUser] = useState(null)
  const [activeTab, setActiveTab] = useState('camera')

  if (!user) {
    return (
      <SafeAreaView style={{ flex: 1 }}>
        <StatusBar barStyle="dark-content" />
        <Login onLogin={setUser} />
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />

      <View style={styles.header}>
        <Text style={styles.title}>Parking Lot Mobile</Text>
        <TouchableOpacity style={styles.logoutBtn} onPress={() => setUser(null)}>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.tabBar}>
        <TouchableOpacity style={activeTab === 'camera' ? styles.tabActive : styles.tab} onPress={() => setActiveTab('camera')}>
          <Text style={styles.tabText}>Camera</Text>
        </TouchableOpacity>
        <TouchableOpacity style={activeTab === 'profile' ? styles.tabActive : styles.tab} onPress={() => setActiveTab('profile')}>
          <Text style={styles.tabText}>Profile</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        {activeTab === 'camera' ? <CameraScreen /> : <Text style={styles.secondaryText}>Profile screen placeholder</Text>}
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
  tabText: { fontWeight: '600' },
  content: { flex: 1 },
  secondaryText: { margin: 20, color: '#4b5563' }
})

export default MobileApp;
