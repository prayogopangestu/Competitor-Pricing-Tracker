'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Loader2 } from 'lucide-react'

export default function AddCompetitorPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    name: '',
    url: '',
    productName: '',
    priceSelector: '',
    nameSelector: '',
    imageSelector: '',
  })
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      const response = await fetch('/api/competitors', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || 'Failed to add competitor')
        return
      }

      router.push('/dashboard')
    } catch (err) {
      setError('An error occurred. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <nav className="bg-white dark:bg-gray-800 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <Link
              href="/dashboard"
              className="flex items-center gap-2 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
            >
              <ArrowLeft className="w-5 h-5" />
              Back to Dashboard
            </Link>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">
              Add Competitor
            </h1>
            <div className="w-24"></div>
          </div>
        </div>
      </nav>

      <main className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            Add New Competitor
          </h2>

          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 px-4 py-3 rounded mb-6">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Competitor Name *
              </label>
              <input
                type="text"
                id="name"
                name="name"
                required
                value={formData.name}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                placeholder="e.g., Amazon Product A"
              />
            </div>

            <div>
              <label htmlFor="url" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Product URL *
              </label>
              <input
                type="url"
                id="url"
                name="url"
                required
                value={formData.url}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                placeholder="https://example.com/product"
              />
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                The full URL of the product page to track
              </p>
            </div>

            <div>
              <label htmlFor="productName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Product Name (optional)
              </label>
              <input
                type="text"
                id="productName"
                name="productName"
                value={formData.productName}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                placeholder="e.g., Widget Pro"
              />
            </div>

            <div>
              <label htmlFor="priceSelector" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Price CSS Selector *
              </label>
              <input
                type="text"
                id="priceSelector"
                name="priceSelector"
                required
                value={formData.priceSelector}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                placeholder=".price, .product-price, #price"
              />
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                CSS selector for the price element on the page
              </p>
            </div>

            <div>
              <label htmlFor="nameSelector" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Product Name CSS Selector (optional)
              </label>
              <input
                type="text"
                id="nameSelector"
                name="nameSelector"
                value={formData.nameSelector}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                placeholder=".product-name, h1, .title"
              />
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                CSS selector for the product name element
              </p>
            </div>

            <div>
              <label htmlFor="imageSelector" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Product Image CSS Selector (optional)
              </label>
              <input
                type="text"
                id="imageSelector"
                name="imageSelector"
                value={formData.imageSelector}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                placeholder=".product-image img, img.product-img"
              />
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                CSS selector for the product image element
              </p>
            </div>

            <div className="flex gap-4">
              <button
                type="button"
                onClick={() => router.push('/dashboard')}
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="flex-1 flex justify-center items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Adding...
                  </>
                ) : (
                  'Add Competitor'
                )}
              </button>
            </div>
          </form>

          <div className="mt-8 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded">
            <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
              Finding CSS Selectors
            </h3>
            <p className="text-sm text-blue-800 dark:text-blue-200 mb-2">
              To find the CSS selector for an element:
            </p>
            <ol className="list-decimal list-inside text-sm text-blue-800 dark:text-blue-200 space-y-1">
              <li>Open the product page in your browser</li>
              <li>Right-click on the price/name/image element</li>
              <li>Select "Inspect" or "Inspect Element"</li>
              <li>Right-click on the highlighted element in the DevTools</li>
              <li>Select "Copy" → "Copy selector"</li>
            </ol>
          </div>
        </div>
      </main>
    </div>
  )
}
