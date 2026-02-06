'use client'

import { useEffect, useState } from 'react'
import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Plus, LogOut, TrendingUp, DollarSign, AlertCircle } from 'lucide-react'
import { formatPrice, getChangeColor, getChangeIcon } from '@/lib/utils'

interface Competitor {
  id: string
  name: string
  url: string
  productName?: string
  priceRecords: Array<{
    id: string
    price: number
    currency: string
    scrapedAt: string
  }>
  _count: {
    priceRecords: number
  }
}

export default function DashboardPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [competitors, setCompetitors] = useState<Competitor[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
    }
  }, [status, router])

  useEffect(() => {
    if (status === 'authenticated') {
      fetchCompetitors()
    }
  }, [status])

  const fetchCompetitors = async () => {
    try {
      const response = await fetch('/api/competitors')
      const data = await response.json()
      setCompetitors(data.competitors || [])
    } catch (error) {
      console.error('Error fetching competitors:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this competitor?')) {
      return
    }

    try {
      const response = await fetch(`/api/competitors/${id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        setCompetitors(competitors.filter(c => c.id !== id))
      }
    } catch (error) {
      console.error('Error deleting competitor:', error)
    }
  }

  if (status === 'loading' || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  const latestPrice = competitors.reduce((sum, c) => {
    const price = c.priceRecords[0]?.price || 0
    return sum + Number(price)
  }, 0)

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <nav className="bg-white dark:bg-gray-800 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                Competitor Tracker
              </h1>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {session?.user?.email}
              </span>
              <button
                onClick={() => signOut({ callbackUrl: '/login' })}
                className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
              >
                <LogOut className="w-4 h-4" />
                Sign out
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Competitors</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {competitors.length}
                </p>
              </div>
              <TrendingUp className="w-8 h-8 text-blue-600" />
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Price Points</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {competitors.reduce((sum, c) => sum + c._count.priceRecords, 0)}
                </p>
              </div>
              <DollarSign className="w-8 h-8 text-green-600" />
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Latest Total</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {formatPrice(latestPrice)}
                </p>
              </div>
              <AlertCircle className="w-8 h-8 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Monitored Competitors
          </h2>
          <Link
            href="/dashboard/add"
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-5 h-5" />
            Add Competitor
          </Link>
        </div>

        {competitors.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-12 text-center">
            <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              No competitors yet
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Start tracking competitor prices by adding your first competitor.
            </p>
            <Link
              href="/dashboard/add"
              className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-5 h-5" />
              Add Your First Competitor
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {competitors.map((competitor) => {
              const latestRecord = competitor.priceRecords[0]
              const previousRecord = competitor.priceRecords[1]
              
              let priceChange = 0
              let percentChange = 0
              
              if (latestRecord && previousRecord) {
                priceChange = Number(latestRecord.price) - Number(previousRecord.price)
                percentChange = (priceChange / Number(previousRecord.price)) * 100
              }

              return (
                <div
                  key={competitor.id}
                  className="bg-white dark:bg-gray-800 rounded-lg shadow hover:shadow-lg transition-shadow"
                >
                  <div className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        {competitor.name}
                      </h3>
                      <div className="flex gap-2">
                        <Link
                          href={`/dashboard/${competitor.id}`}
                          className="text-blue-600 hover:text-blue-700 text-sm"
                        >
                          View
                        </Link>
                        <button
                          onClick={() => handleDelete(competitor.id)}
                          className="text-red-600 hover:text-red-700 text-sm"
                        >
                          Delete
                        </button>
                      </div>
                    </div>

                    {competitor.productName && (
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                        {competitor.productName}
                      </p>
                    )}

                    {latestRecord ? (
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-3xl font-bold text-gray-900 dark:text-white">
                            {formatPrice(Number(latestRecord.price), latestRecord.currency)}
                          </span>
                          {previousRecord && (
                            <div className={`flex items-center gap-1 ${getChangeColor(priceChange)}`}>
                              <span>{getChangeIcon(priceChange)}</span>
                              <span className="text-sm font-medium">
                                {formatPrice(Math.abs(priceChange), latestRecord.currency)}
                              </span>
                            </div>
                          )}
                        </div>

                        {previousRecord && (
                          <div className={`text-sm ${getChangeColor(priceChange)}`}>
                            {getChangeIcon(priceChange)} {formatPercentChange(percentChange)} from last check
                          </div>
                        )}

                        <div className="mt-3 text-xs text-gray-500 dark:text-gray-400">
                          Last updated: {new Date(latestRecord.scrapedAt).toLocaleString()}
                        </div>
                      </div>
                    ) : (
                      <p className="text-gray-500 dark:text-gray-400">
                        No price data available yet
                      </p>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </main>
    </div>
  )
}

function formatPercentChange(percent: number): string {
  const sign = percent >= 0 ? '+' : ''
  return `${sign}${percent.toFixed(2)}%`
}
