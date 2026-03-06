import { useEffect, useRef } from 'react'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js'
import './TrafficChart.css'

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
)

function TrafficChart() {
  const canvasRef = useRef(null)
  const chartRef = useRef(null)

  useEffect(() => {
    if (!canvasRef.current) return

    const ctx = canvasRef.current.getContext('2d')

    // Destroy previous chart if it exists
    if (chartRef.current) {
      chartRef.current.destroy()
    }

    // Mock data showing vehicle traffic throughout the day
    const labels = ['6 AM', '8 AM', '10 AM', '12 PM', '2 PM', '4 PM', '6 PM', '8 PM']
    const vehiclesIn = [5, 12, 18, 32, 28, 25, 45, 38]
    const vehiclesOut = [0, 3, 8, 15, 20, 18, 25, 35]

    const chartConfig = {
      type: 'line',
      data: {
        labels: labels,
        datasets: [
          {
            label: 'Vehicles In',
            data: vehiclesIn,
            borderColor: '#2196f3',
            backgroundColor: 'rgba(33, 150, 243, 0.1)',
            borderWidth: 3,
            fill: true,
            tension: 0.4,
            pointRadius: 5,
            pointBackgroundColor: '#2196f3',
            pointBorderColor: 'white',
            pointBorderWidth: 2,
            pointHoverRadius: 7,
            hoverBackgroundColor: '#1976d2'
          },
          {
            label: 'Vehicles Out',
            data: vehiclesOut,
            borderColor: '#4caf50',
            backgroundColor: 'rgba(76, 175, 80, 0.1)',
            borderWidth: 3,
            fill: true,
            tension: 0.4,
            pointRadius: 5,
            pointBackgroundColor: '#4caf50',
            pointBorderColor: 'white',
            pointBorderWidth: 2,
            pointHoverRadius: 7,
            hoverBackgroundColor: '#388e3c'
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: true,
        plugins: {
          legend: {
            display: true,
            position: 'top',
            labels: {
              usePointStyle: true,
              pointStyle: 'circle',
              padding: 20,
              font: {
                size: 13,
                weight: '500'
              },
              color: 'var(--text-primary)'
            }
          },
          title: {
            display: false
          },
          tooltip: {
            mode: 'index',
            intersect: false,
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            padding: 12,
            titleFont: {
              size: 13,
              weight: 'bold'
            },
            bodyFont: {
              size: 12
            },
            borderColor: 'rgba(255, 255, 255, 0.2)',
            borderWidth: 1,
            usePointStyle: true,
            boxPadding: 8
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            max: 50,
            ticks: {
              font: {
                size: 12
              },
              color: 'var(--text-secondary)',
              stepSize: 10
            },
            grid: {
              color: 'var(--border-color)',
              drawBorder: false
            }
          },
          x: {
            ticks: {
              font: {
                size: 12
              },
              color: 'var(--text-secondary)'
            },
            grid: {
              display: false,
              drawBorder: false
            }
          }
        }
      }
    }

    try {
      chartRef.current = new ChartJS(ctx, chartConfig)
    } catch (error) {
      console.error('Error creating chart:', error)
    }

    return () => {
      if (chartRef.current) {
        chartRef.current.destroy()
      }
    }
  }, [])

  return (
    <div className="traffic-chart-container">
      <div className="chart-header">
        <h3>Live Vehicle Traffic</h3>
        <span className="time-period">Today</span>
      </div>
      <div className="chart-wrapper">
        <canvas ref={canvasRef} />
      </div>
    </div>
  )
}

export default TrafficChart
