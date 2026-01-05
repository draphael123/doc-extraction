'use client'

import { Card, CardContent } from '@/components/ui/card'
import { ReactNode } from 'react'

interface StatsCardProps {
  title: string
  value: string | number
  icon: ReactNode
  color: 'blue' | 'purple' | 'green' | 'orange'
}

const colorClasses = {
  blue: 'border-blue-300 bg-gradient-to-br from-blue-50 to-cyan-50',
  purple: 'border-purple-300 bg-gradient-to-br from-purple-50 to-pink-50',
  green: 'border-green-300 bg-gradient-to-br from-green-50 to-emerald-50',
  orange: 'border-orange-300 bg-gradient-to-br from-orange-50 to-amber-50',
}

const iconColors = {
  blue: 'text-blue-600',
  purple: 'text-purple-600',
  green: 'text-green-600',
  orange: 'text-orange-600',
}

export function StatsCard({ title, value, icon, color }: StatsCardProps) {
  return (
    <Card className={`border-2 ${colorClasses[color]}`}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
            <p className="text-3xl font-bold text-gray-900">{value}</p>
          </div>
          <div className={`${iconColors[color]}`}>
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

