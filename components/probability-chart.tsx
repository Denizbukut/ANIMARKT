'use client'

import { MarketOutcome } from '@/types/market'
import { cn } from '@/lib/utils'
import { useState } from 'react'

interface ProbabilityChartProps {
  outcomes: MarketOutcome[]
  className?: string
}

interface ChartDataPoint {
  date: string
  probability: number
}

export function ProbabilityChart({ outcomes, className }: ProbabilityChartProps) {
  const [selectedTimeframe, setSelectedTimeframe] = useState('ALL')
  
  // Generate historical data for the selected outcome (Yes option)
  const generateHistoricalData = (): ChartDataPoint[] => {
    const currentProbability = outcomes.find(o => o.name === 'Yes')?.probability || 50
    const data: ChartDataPoint[] = []
    
    // Generate 7 months of data (Feb to Aug)
    const months = ['Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug']
    
    // If current probability is 50%, show a flat line at 50%
    // Otherwise, show some variation leading to current value
    let baseValues: number[]
    
    if (currentProbability === 50) {
      // Show some variation around 50% for new bets to create chart structure
      baseValues = [48, 52, 49, 51, 50, 49, 50]
    } else {
      // Show some historical variation for active bets
      const variation = Math.abs(currentProbability - 50) / 2
      baseValues = [
        currentProbability + variation,
        currentProbability - variation,
        currentProbability + variation * 0.5,
        currentProbability - variation * 0.5,
        currentProbability + variation * 0.3,
        currentProbability - variation * 0.3,
        currentProbability
      ]
    }
    
    months.forEach((month, index) => {
      data.push({
        date: month,
        probability: Math.max(5, Math.min(95, baseValues[index])) // Keep between 5-95%
      })
    })
    
    return data
  }

  const chartData = generateHistoricalData()
  const currentProbability = chartData[chartData.length - 1].probability
  const previousProbability = chartData[chartData.length - 2].probability
  const change = currentProbability - previousProbability
  const changePercent = previousProbability > 0 ? ((change / previousProbability) * 100).toFixed(0) : '0'

  const timeframes = ['1H', '6H', '1D', '1W', '1M', 'ALL']

  // Find min and max for scaling
  const minProb = Math.min(...chartData.map(d => d.probability))
  const maxProb = Math.max(...chartData.map(d => d.probability))
  const range = maxProb - minProb || 1 // Avoid division by zero

  const getYPosition = (probability: number) => {
    return 100 - ((probability - minProb) / range) * 80 // 80% of height for chart area
  }

  return (
    <div className={cn("space-y-4", className)}>
      {/* Header with current probability and change */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-2xl font-bold text-blue-400">{currentProbability}%</span>
          <span className="text-sm text-muted-foreground">chance</span>
          <div className="flex items-center gap-1">
            {change > 0 ? (
              <div className="text-green-500">▲</div>
            ) : change < 0 ? (
              <div className="text-red-500">▼</div>
            ) : (
              <div className="text-muted-foreground">—</div>
            )}
            <span className={cn(
              "text-sm font-medium", 
              change > 0 ? "text-green-500" : 
              change < 0 ? "text-red-500" : 
              "text-muted-foreground"
            )}>
              {change === 0 ? '0%' : `${Math.abs(parseInt(changePercent))}%`}
            </span>
          </div>
        </div>
        <div className="text-sm text-muted-foreground">Ani Market</div>
      </div>

      {/* Chart Container */}
      <div className="relative bg-muted/20 rounded-lg p-4 h-48">
        {/* Y-axis labels */}
        <div className="absolute left-0 top-0 bottom-0 w-8 flex flex-col justify-between text-xs text-muted-foreground">
          {[80, 60, 40, 20].map(value => (
            <div key={value} className="text-right pr-2">{value}%</div>
          ))}
        </div>

        {/* Grid lines */}
        <div className="absolute left-8 right-0 top-0 bottom-0">
          {[80, 60, 40, 20].map(value => (
            <div
              key={value}
              className="absolute w-full border-t border-muted/30"
              style={{ top: `${100 - ((value - minProb) / range) * 80}%` }}
            />
          ))}
        </div>

        {/* Chart area */}
        <div className="absolute left-8 right-0 top-0 bottom-0">
          {/* Line chart */}
          <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
            <defs>
              <linearGradient id="chartGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.3" />
                <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.1" />
              </linearGradient>
            </defs>
            
            {/* Area fill */}
            <path
              d={chartData.map((point, index) => {
                const x = (index / (chartData.length - 1)) * 100
                const y = getYPosition(point.probability)
                return `${index === 0 ? 'M' : 'L'} ${x} ${y}`
              }).join(' ') + ` L 100 100 L 0 100 Z`}
              fill="url(#chartGradient)"
            />
            
            {/* Line */}
            <path
              d={chartData.map((point, index) => {
                const x = (index / (chartData.length - 1)) * 100
                const y = getYPosition(point.probability)
                return `${index === 0 ? 'M' : 'L'} ${x} ${y}`
              }).join(' ')}
              stroke="#3b82f6"
              strokeWidth="2"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            
            {/* Data points */}
            {chartData.map((point, index) => {
              const x = (index / (chartData.length - 1)) * 100
              const y = getYPosition(point.probability)
              return (
                <circle
                  key={index}
                  cx={x}
                  cy={y}
                  r="2"
                  fill="#3b82f6"
                  className="hover:r-3 transition-all duration-200"
                />
              )
            })}
          </svg>
        </div>

        {/* X-axis labels */}
        <div className="absolute left-8 right-0 bottom-0 h-6 flex justify-between text-xs text-muted-foreground">
          {chartData.map((point, index) => (
            <div key={index} className="text-center">{point.date}</div>
          ))}
        </div>
      </div>

      {/* Timeframe selector */}
      <div className="flex items-center gap-1">
        {timeframes.map((timeframe) => (
          <button
            key={timeframe}
            onClick={() => setSelectedTimeframe(timeframe)}
            className={cn(
              "px-3 py-1 text-xs rounded-md transition-colors",
              selectedTimeframe === timeframe
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            {timeframe}
          </button>
        ))}
      </div>

      {/* Current outcomes summary */}
      <div className="grid grid-cols-2 gap-3">
        {outcomes.slice(0, 2).map((outcome) => (
          <div key={outcome.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
            <span className="text-sm font-medium">{outcome.name}</span>
            <span className="text-sm font-bold">{outcome.probability.toFixed(1)}%</span>
          </div>
        ))}
      </div>
    </div>
  )
}
