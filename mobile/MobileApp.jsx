// mobile/MobileApp.jsx
import React, { useState } from 'react';
import { SafeAreaView, StatusBar } from 'react-native';
import Login from './screens/Login';
// Import other screens as needed

const MobileApp = () => {
  const [user, setUser] = useState(null);

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <StatusBar barStyle="dark-content" />
      {!user ? (
        <Login onLogin={setUser} />
      ) : (
        // Add your main app screens here
        <Login onLogin={setUser} /> // Temporary
      )}
    </SafeAreaView>
  );
};

export default MobileApp;