import { createContext, useContext, useState, useCallback, useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'

const LoadingContext = createContext()

export const useLoading = () => {
  const context = useContext(LoadingContext)
  if (!context) {
    throw new Error('useLoading must be used within LoadingProvider')
  }
  return context
}

export const LoadingSpinner = ({ size = 'md', message, image }) => {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16'
  }

  if (image) {
    return (
      <div className="text-center">
        <div className={`mx-auto mb-4 ${sizeClasses.lg} rounded-full overflow-hidden border-4 border-yellow-400 bg-white shadow-2xl flex items-center justify-center`}>
          <img 
            src={image}
            alt="Loading" 
            className="w-full h-full object-cover animate-pulse" 
          />
        </div>
        {message && (
          <>
            <h2 className="text-2xl font-bold text-yellow-500 mb-2 animate-pulse">{message}</h2>
            {message.includes('🤖') && (
              <p className="text-gray-900 text-base font-semibold opacity-90">Đang phân tích, vui lòng đợi...</p>
            )}
          </>
        )}
      </div>
    )
  }

  return (
    <div className="text-center">
      <div className={`loading-spinner ${sizeClasses[size]} border-4 border-red-600 border-t-transparent rounded-full mx-auto`}></div>
      {message && <p className="text-white font-medium mt-3 text-sm">{message}</p>}
    </div>
  )
}

export const LoadingProvider = ({ children }) => {
  const [loadingState, setLoadingState] = useState({
    isLoading: false,
    message: '',
    image: null
  })
  const location = useLocation()

  // Auto loading khi chuyển page
  useEffect(() => {
    setLoadingState({ isLoading: true, message: 'Đang tải...', image: null })
    
    const timer = setTimeout(() => {
      setLoadingState({ isLoading: false, message: '', image: null })
    }, 300)

    return () => clearTimeout(timer)
  }, [location.pathname])

  const showLoading = useCallback((message = '', image = null) => {
    setLoadingState({ isLoading: true, message, image })
  }, [])

  const hideLoading = useCallback(() => {
    setLoadingState({ isLoading: false, message: '', image: null })
  }, [])

  return (
    <LoadingContext.Provider value={{ showLoading, hideLoading }}>
      {children}
      <AnimatePresence>
        {loadingState.isLoading && (
          <motion.div 
            className="loading-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <LoadingSpinner 
              size="lg" 
              message={loadingState.message} 
              image={loadingState.image}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </LoadingContext.Provider>
  )
}
