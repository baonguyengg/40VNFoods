import { useState, useCallback, memo } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { LANGUAGES, API_BASE_URL } from '../config'
import { BACKGROUND_IMAGES, TIMEOUTS, MESSAGES } from '../utils/constants'
import { PageBackground } from '../components/shared'
import { createAuthAxios, isAuthenticated } from '../utils/auth'
import { useLoading } from '../components/shared/loadingcontext'

const HERO_IMAGE_URL = BACKGROUND_IMAGES.hero
const ANALYZING_IMAGE = BACKGROUND_IMAGES.analyzing

const SearchPage = memo(({ language, setPredictionResult }) => {
  const [dragActive, setDragActive] = useState(false)
  const navigate = useNavigate()
  const t = LANGUAGES[language]
  const messages = MESSAGES[language]
  const { showLoading, hideLoading } = useLoading()

  const handleFileUpload = useCallback(async (file) => {
    if (!file) return
    
    if (!file.type.startsWith('image/')) {
      alert('Vui lòng chỉ tải lên file ảnh!')
      return
    }
    
    showLoading(t.analyzing, ANALYZING_IMAGE)
    const formData = new FormData()
    formData.append('image', file)
    formData.append('lang', language)

    const imageUrl = URL.createObjectURL(file)

    try {
      const authAxios = createAuthAxios()
      const response = await authAxios.post(`${API_BASE_URL}/predict`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        timeout: TIMEOUTS.apiRequest
      })

      if (response.data.success) {
        setPredictionResult({
          ...response.data,
          imageUrl
        })
        navigate('/result')
      } else {
        URL.revokeObjectURL(imageUrl)
        alert(response.data.error || 'Có lỗi xảy ra khi phân tích ảnh!')
      }
    } catch (error) {
      URL.revokeObjectURL(imageUrl)
      console.error('Error:', error)
      if (error.response?.status === 429) {
        // Rate limit error
        const isLoggedIn = isAuthenticated()
        const message = isLoggedIn 
          ? messages.rateLimitUser 
          : messages.rateLimitGuest
        alert(message)
      } else if (error.code === 'ECONNABORTED') {
        alert('Yêu cầu hết thời gian! Vui lòng thử lại.')
      } else if (error.response) {
        alert(error.response.data.error || 'Có lỗi xảy ra khi phân tích ảnh!')
      } else {
        alert(messages.serverError)
      }
    } finally {
      hideLoading()
    }
  }, [language, setPredictionResult, navigate, messages, showLoading, hideLoading, t.analyzing])

  const handleDrop = useCallback((e) => {
    e.preventDefault()
    setDragActive(false)
    const file = e.dataTransfer.files[0]
    if (file && file.type.startsWith('image/')) {
      handleFileUpload(file)
    }
  }, [handleFileUpload])

  const handleDragOver = useCallback((e) => {
    e.preventDefault()
    setDragActive(true)
  }, [])

  const handleDragLeave = useCallback(() => {
    setDragActive(false)
  }, [])

  return (
    <div className="relative w-full min-h-screen overflow-y-auto flex items-center-safe justify-center pt-32">
      <PageBackground imageUrl={BACKGROUND_IMAGES.search} overlayType="darker" />

      <HeroCard 
        t={t}
        dragActive={dragActive}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onFileSelect={handleFileUpload}
      />
    </div>
  )
})

SearchPage.displayName = 'SearchPage'

const HeroCard = memo(({ t, dragActive, onDragOver, onDragLeave, onDrop, onFileSelect }) => (
  <motion.div 
    className="relative z-10 glass-card rounded-4xl overflow-hidden flex flex-col md:flex-row items-center p-6 md:p-12 gap-4 max-w-7xl w-full mx-4"
    initial={{ opacity: 0, scale: 0.95 }}
    animate={{ opacity: 1, scale: 1 }}
    transition={{ type: "spring", stiffness: 100 }}
  >
    <HeroContent 
      t={t}
      dragActive={dragActive}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
      onFileSelect={onFileSelect}
    />
    <HeroImage />
  </motion.div>
))

HeroCard.displayName = 'HeroCard'

const HeroContent = memo(({ t, dragActive, onDragOver, onDragLeave, onDrop, onFileSelect }) => (
  <div className="flex-1 flex flex-col items-start text-left space-y-6">
    <motion.h1 
      className="lg:text-5xl font-black gradient-text-animated whitespace-nowrap mb-2 leading-tight pt-3"
      style={{ lineHeight: '1.3' }}
    >
      {t.hero_title}
    </motion.h1>
    
    <motion.p className="text-lg md:text-xl text-gray-700 font-semibold opacity-90 leading-relaxed">
      {t.hero_desc}
    </motion.p>

    <UploadZone 
      t={t}
      dragActive={dragActive}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
      onFileSelect={onFileSelect}
    />
  </div>
))

HeroContent.displayName = 'HeroContent'

const UploadZone = memo(({ t, dragActive, onDragOver, onDragLeave, onDrop, onFileSelect }) => {
  const handleClick = () => document.getElementById('unified-input').click()
  const handleChange = (e) => onFileSelect(e.target.files[0])

  return (
    <motion.div
      className={`upload-zone ${
        dragActive ? 'upload-zone-active' : 'upload-zone-default'
      } mt-4`}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
      onClick={handleClick}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      <div className="relative z-10 py-3 px-10">
        <p className="mb-2 block font-bold text-gray-800 md:text-3xl">
          📸{t.upload_image}
        </p>
        <p className="text-xs md:text-sm text-gray-600 font-medium mt-1">
          {t.drag_drop}
        </p>
      </div>

      <input
        id="unified-input"
        type="file"
        accept="image/*"
        onChange={handleChange}
        className="hidden"
      />
    </motion.div>
  )
})

UploadZone.displayName = 'UploadZone'

const HeroImage = memo(() => (
  <div className="flex-1 relative w-full max-w-xl rounded-2xl overflow-hidden shadow-2xl border-4 border-white/30">
    <motion.img 
      src={HERO_IMAGE_URL} 
      alt="Vietnamese Food" 
      className="w-full h-64 md:h-80 object-cover transition-transform duration-700 hover:scale-105"
    />
    <div className="absolute inset-0 bg-linear-to-t from-black/40 via-transparent to-transparent" />
    
    <motion.div 
      className="absolute left-0 right-0 z-20 pointer-events-none"
      style={{ 
        height: '3.5px', 
        background: '#FBBF24',
        boxShadow: '0 15px 70px 20px rgba(245, 158, 11, 0.7)'
      }}
      animate={{ top: ['5%', '95%', '5%'] }}
      transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
    />
  </div>
))

HeroImage.displayName = 'HeroImage'

export default SearchPage