import { useState } from 'react'
import './Analytics.css'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  Filler
} from 'chart.js'
import { Line, Bar, Doughnut } from 'react-chartjs-2'

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  Filler
)

function Analytics() {
  const [analyticsData] = useState({
    occupancyTrend: [
      { time: '6:00', occupied: 2, total: 12 },
      { time: '8:00', occupied: 8, total: 12 },
      { time: '10:00', occupied: 10, total: 12 },
      { time: '12:00', occupied: 12, total: 12 },
      { time: '14:00', occupied: 11, total: 12 },
      { time: '16:00', occupied: 9, total: 12 },
      { time: '18:00', occupied: 7, total: 12 },
      { time: '20:00', occupied: 4, total: 12 }
    ],
    vehicleTypes: [
      { type: 'Sedan', count: 45, percentage: 60 },
      { type: 'SUV', count: 18, percentage: 24 },
      { type: 'Truck', count: 8, percentage: 11 },
      { type: 'Motorcycle', count: 4, percentage: 5 }
    ],
    peakHours: [
      { hour: '6-8 AM', vehicles: 25 },
      { hour: '8-10 AM', vehicles: 45 },
      { hour: '10-12 PM', vehicles: 38 },
      { hour: '12-2 PM', vehicles: 52 },
      { hour: '2-4 PM', vehicles: 48 },
      { hour: '4-6 PM', vehicles: 65 },
      { hour: '6-8 PM', vehicles: 58 },
      { hour: '8-10 PM', vehicles: 32 }
    ],
    weeklyStats: {
      totalRevenue: 4320,
      totalVehicles: 365,
      avgOccupancy: 85,
      peakHour: '4-6 PM'
    }
  })

  const occupancyTrendData = {
    labels: analyticsData.occupancyTrend.map(item => item.time),
    datasets: [
      {
        label: 'Occupied Spots',
        data: analyticsData.occupancyTrend.map(item => item.occupied),
        borderColor: '#2196f3',
        backgroundColor: 'rgba(33, 150, 243, 0.1)',
        borderWidth: 3,
        fill: true,
        tension: 0.4,
        yAxisID: 'spots'
      },
      {
        label: 'Occupancy Rate (%)',
        data: analyticsData.occupancyTrend.map(item => Math.round((item.occupied / item.total) * 100)),
        borderColor: '#ff9800',
        backgroundColor: 'rgba(255, 152, 0, 0.1)',
        borderWidth: 3,
        borderDash: [5, 5],
        fill: false,
        tension: 0.4,
        yAxisID: 'percentage',
        pointBackgroundColor: '#ff9800',
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
        pointRadius: 6
      },
      {
        label: 'Total Capacity',
        data: analyticsData.occupancyTrend.map(item => item.total),
        borderColor: '#4caf50',
        backgroundColor: 'rgba(76, 175, 80, 0.05)',
        borderWidth: 2,
        borderDash: [2, 2],
        fill: false,
        tension: 0.4,
        yAxisID: 'spots'
      }
    ]
  }

  const vehicleTypesData = {
    labels: analyticsData.vehicleTypes.map(item => item.type),
    datasets: [
      {
        data: analyticsData.vehicleTypes.map(item => item.percentage),
        backgroundColor: [
          'rgba(33, 150, 243, 0.8)',
          'rgba(76, 175, 80, 0.8)',
          'rgba(255, 152, 0, 0.8)',
          'rgba(244, 67, 54, 0.8)'
        ],
        borderColor: [
          '#2196f3',
          '#4caf50',
          '#ff9800',
          '#f44336'
        ],
        borderWidth: 2
      }
    ]
  }

  const peakHoursData = {
    labels: analyticsData.peakHours.map(item => item.hour),
    datasets: [
      {
        label: 'Vehicles per Hour',
        data: analyticsData.peakHours.map(item => item.vehicles),
        backgroundColor: 'rgba(156, 39, 176, 0.8)',
        borderColor: '#9c27b0',
        borderWidth: 2,
        borderRadius: 6
      }
    ]
  }

  const occupancyChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: 'index',
      intersect: false,
    },
    plugins: {
      legend: {
        position: 'top',
        labels: {
          usePointStyle: true,
          padding: 20,
          font: { size: 12, weight: 'bold' }
        }
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.9)',
        padding: 15,
        titleFont: { size: 14, weight: 'bold' },
        bodyFont: { size: 13 },
        callbacks: {
          label: function(context) {
            let label = context.dataset.label || '';
            if (label) {
              label += ': ';
            }
            if (context.dataset.yAxisID === 'percentage') {
              label += context.parsed.y + '%';
            } else {
              label += context.parsed.y + ' spots';
            }
            return label;
          }
        }
      }
    },
    scales: {
      spots: {
        type: 'linear',
        position: 'left',
        beginAtZero: true,
        max: 14,
        ticks: {
          font: { size: 11 },
          callback: function(value) {
            return value + ' spots';
          }
        },
        title: {
          display: true,
          text: 'Number of Spots',
          font: { size: 12, weight: 'bold' }
        },
        grid: {
          color: 'var(--border-color)',
          drawBorder: false
        }
      },
      percentage: {
        type: 'linear',
        position: 'right',
        beginAtZero: true,
        max: 100,
        ticks: {
          font: { size: 11 },
          callback: function(value) {
            return value + '%';
          }
        },
        title: {
          display: true,
          text: 'Occupancy Rate',
          font: { size: 12, weight: 'bold' }
        },
        grid: {
          drawOnChartArea: false,
          color: 'rgba(255, 152, 0, 0.3)'
        }
      },
      x: {
        ticks: {
          font: { size: 11 },
          maxRotation: 45
        },
        title: {
          display: true,
          text: 'Time of Day',
          font: { size: 12, weight: 'bold' }
        },
        grid: {
          display: false,
          drawBorder: false
        }
      }
    }
  }

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          usePointStyle: true,
          padding: 20,
          font: { size: 12 }
        }
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        padding: 12,
        titleFont: { size: 14, weight: 'bold' },
        bodyFont: { size: 12 }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: { font: { size: 11 } },
        grid: { color: 'var(--border-color)' }
      },
      x: {
        ticks: { font: { size: 11 } },
        grid: { display: false }
      }
    }
  }

  return (
    <section className="analytics">
      <div className="analytics-header">
        <h2>System Analytics</h2>
        <div className="analytics-summary">
          <div className="summary-card">
            <h3>Total Vehicles</h3>
            <p className="summary-value">{analyticsData.weeklyStats.totalVehicles}</p>
            <span className="summary-label">This Week</span>
          </div>
          <div className="summary-card">
            <h3>Avg Occupancy</h3>
            <p className="summary-value">{analyticsData.weeklyStats.avgOccupancy}%</p>
            <span className="summary-label">Daily Average</span>
          </div>
          <div className="summary-card">
            <h3>Peak Hour</h3>
            <p className="summary-value">{analyticsData.weeklyStats.peakHour}</p>
            <span className="summary-label">Today</span>
          </div>
        </div>
      </div>

      <div className="analytics-grid">
        <div className="analytics-card">
          <h3>Occupancy Trend - Today</h3>
          <div className="occupancy-legend">
            <div className="legend-item">
              <span className="legend-color" style={{ backgroundColor: '#2196f3' }}></span>
              <span>Occupied Spots</span>
            </div>
            <div className="legend-item">
              <span className="legend-color" style={{ backgroundColor: '#ff9800', border: '2px dashed #ff9800' }}></span>
              <span>Occupancy Rate (%)</span>
            </div>
            <div className="legend-item">
              <span className="legend-color" style={{ backgroundColor: '#4caf50', border: '1px dashed #4caf50' }}></span>
              <span>Total Capacity</span>
            </div>
          </div>
          <div className="chart-container">
            <Line data={occupancyTrendData} options={occupancyChartOptions} />
          </div>
        </div>

        <div className="analytics-card">
          <h3>Vehicle Types Distribution</h3>
          <div className="chart-container doughnut-container">
            <Doughnut
              data={vehicleTypesData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    position: 'bottom',
                    labels: { padding: 20, usePointStyle: true }
                  },
                  tooltip: {
                    callbacks: {
                      label: (context) => `${context.label}: ${context.parsed}%`
                    }
                  }
                }
              }}
            />
          </div>
        </div>

        <div className="analytics-card">
          <h3>Peak Hours Traffic</h3>
          <div className="chart-container">
            <Bar data={peakHoursData} options={chartOptions} />
          </div>
        </div>
      </div>

      <div className="analytics-insights">
        <h3>Key Insights</h3>
        <div className="insights-grid">
          <div className="insight-card">
            <div className="insight-icon">📈</div>
            <div className="insight-content">
              <h4>Peak Performance</h4>
              <p>4-6 PM shows the highest traffic with 65 vehicles today</p>
            </div>
          </div>
          <div className="insight-card">
            <div className="insight-icon">🚗</div>
            <div className="insight-content">
              <h4>Popular Vehicles</h4>
              <p>Sedans represent 60% of all parked vehicles</p>
            </div>
          </div>
          <div className="insight-card">
            <div className="insight-icon">⏰</div>
            <div className="insight-content">
              <h4>Busy Hours</h4>
              <p>4-6 PM sees the highest traffic with 65 vehicles</p>
            </div>
          </div>
          <div className="insight-card">
            <div className="insight-icon">📊</div>
            <div className="insight-content">
              <h4>Occupancy Rate</h4>
              <p>Average daily occupancy is 85% across all spots</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default Analytics