// mobile/services/api.js
// All endpoints on Node.js server - Port 3001
const SERVER_URL = process.env.EXPO_PUBLIC_API_BASE_URL || 'http://192.168.1.100:3001';

console.log('=== API Configuration ===');
console.log('Server URL:', SERVER_URL);
console.log('All endpoints on: http://YOUR_IP:3001');
console.log('========================');

export const apiService = {
  // Auth endpoints - Port 3001
  async login(username, password) {
    try {
      console.log('[LOGIN] Attempting login for:', username);
      const response = await fetch(`${SERVER_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Invalid credentials');
      }
      
      console.log('[LOGIN] Success:', data.user.username);
      return data;
    } catch (err) {
      console.error('[LOGIN] Error:', err.message);
      throw new Error(
        `Unable to reach server at ${SERVER_URL}\n\n` +
        `Make sure:\n` +
        `1. Node.js server is running on port 3001\n` +
        `2. IP in .env is YOUR computer's IP (run ipconfig)\n` +
        `3. Phone and computer are on same WiFi\n\n` +
        `Error: ${err.message}`
      );
    }
  },

  async logout() {
    try {
      console.log('[LOGOUT] Logging out...');
      await fetch(`${SERVER_URL}/api/auth/logout`, {
        method: 'POST',
      });
      console.log('[LOGOUT] Success');
    } catch (error) {
      console.error('[LOGOUT] Error:', error);
    }
  },

  // Parking lot endpoints
  async getParkingLot() {
    try {
      console.log('[PARKING] Fetching parking lot status...');
      const response = await fetch(`${SERVER_URL}/api/parking-lot`);
      
      if (!response.ok) {
        throw new Error(`Server responded with ${response.status}`);
      }
      
      const data = await response.json();
      console.log('[PARKING] Status received:', {
        total: data.totalSpots,
        occupied: data.occupiedSpots?.length || 0,
        available: data.availableSpots,
      });
      return data;
    } catch (err) {
      console.error('[PARKING] Error:', err.message);
      throw new Error(
        `Unable to reach parking server at ${SERVER_URL}\n\n` +
        `Make sure Node.js server is running on port 3001\n` +
        `Error: ${err.message}`
      );
    }
  },

  async toggleParkingSpot(spotNumber) {
    try {
      console.log('[SPOT] Toggling spot:', spotNumber);
      const response = await fetch(`${SERVER_URL}/api/parking-lot/toggle/${spotNumber}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      
      if (!response.ok) {
        throw new Error('Failed to toggle spot');
      }
      
      const data = await response.json();
      console.log('[SPOT] Toggled successfully');
      return data;
    } catch (err) {
      console.error('[SPOT] Error:', err);
      throw err;
    }
  },

  // Alerts endpoints
  async getAlerts() {
    try {
      console.log('[ALERTS] Fetching alerts...');
      const response = await fetch(`${SERVER_URL}/api/alerts`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch alerts');
      }
      
      const data = await response.json();
      console.log('[ALERTS] Received:', data.length, 'alerts');
      return data;
    } catch (err) {
      console.error('[ALERTS] Error:', err.message);
      throw new Error(`Unable to fetch alerts: ${err.message}`);
    }
  },

  async dismissAlert(alertId) {
    try {
      console.log('[ALERT] Dismissing alert:', alertId);
      const response = await fetch(`${SERVER_URL}/api/alerts/${alertId}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('Failed to dismiss alert');
      }
      
      console.log('[ALERT] Dismissed successfully');
      return response.json();
    } catch (err) {
      console.error('[ALERT] Error:', err);
      throw err;
    }
  },

  // Activity history endpoints
  async getActivityHistory() {
    try {
      console.log('[HISTORY] Fetching activity history...');
      const response = await fetch(`${SERVER_URL}/api/activity-history`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch activity');
      }
      
      const data = await response.json();
      console.log('[HISTORY] Received:', data.length, 'activities');
      return data;
    } catch (err) {
      console.error('[HISTORY] Error:', err.message);
      throw new Error(`Unable to fetch activity: ${err.message}`);
    }
  },

  // Health check
  async healthCheck() {
    try {
      console.log('[HEALTH] Checking server health...');
      const response = await fetch(`${SERVER_URL}/api/parking-lot`);
      
      const isHealthy = response.ok;
      console.log('[HEALTH] Server is', isHealthy ? 'ONLINE' : 'OFFLINE');
      return isHealthy;
    } catch (err) {
      console.error('[HEALTH] Server is OFFLINE:', err.message);
      return false;
    }
  },
};

export default apiService;
