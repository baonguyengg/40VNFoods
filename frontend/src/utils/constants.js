export const BACKGROUND_IMAGES = {
  search: "https://as1.ftcdn.net/v2/jpg/01/98/67/62/1000_F_198676209_DSkxlm4f5smwiyyXB8jmlGinqHVnlMco.jpg",
  history: "https://t3.ftcdn.net/jpg/03/05/88/66/240_F_305886698_ddTHAi3V3gIY3KGzfFmCB1QA92Sht6kN.jpg",
  library: "https://as1.ftcdn.net/v2/jpg/15/63/39/36/1000_F_1563393684_lnJDiOmCMR6SRZPJ8d2d7gjXMguLnEHH.jpg",
  result: "https://t3.ftcdn.net/jpg/03/05/88/66/240_F_305886698_ddTHAi3V3gIY3KGzfFmCB1QA92Sht6kN.jpg",
  foodDetail: "https://t3.ftcdn.net/jpg/03/05/88/66/240_F_305886698_ddTHAi3V3gIY3KGzfFmCB1QA92Sht6kN.jpg",
  hero: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=1470&q=80",
  analyzing: "https://t4.ftcdn.net/jpg/05/45/47/21/240_F_545472142_5MeXmkvGFAsPnQzT3fnWeWtBuzF7PScK.jpg"
};

// Animation delays
export const ANIMATION_DELAYS = {
  pageTitle: 0.2,
  mainCard: 0.4,
  image: 0.5,
  info: 0.5,
  confidence: 0.7,
  related: 0.8,
  backButton: 1.2
};

// Pagination
export const PAGINATION = {
  itemsPerPage: 12,
  maxVisiblePages: 5
};

// Timeouts
export const TIMEOUTS = {
  redirect: 3000,
  searchDebounce: 500,
  apiRequest: 30000
};

// Animation variants
export const FADE_IN_UP = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 }
};

export const FADE_IN_SCALE = {
  initial: { opacity: 0, scale: 0.95 },
  animate: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 1.05 }
};

export const SLIDE_IN = {
  initial: { opacity: 0, x: -20 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: 20 }
};

// Common class names
export const GLASS_CARD = "glass-card rounded-3xl overflow-hidden p-8 shadow-2xl";
export const GRADIENT_TEXT = "gradient-text-animated";
export const PRIMARY_BUTTON = "btn-gradient-primary";
export const MESSAGES = {
  VN: {
    loginSuccess: 'Đăng nhập thành công!',
    registerSuccess: 'Đăng ký thành công! Đang chuyển sang đăng nhập...',
    error: 'Có lỗi xảy ra!',
    loading: 'Đang xử lý...',
    requireLogin: 'Bạn cần đăng nhập để xem lịch sử',
    loginNow: 'Đăng nhập ngay',
    deleteConfirm: 'Bạn có chắc chắn muốn xóa toàn bộ lịch sử?',
    deleteSuccess: 'Đã xóa lịch sử thành công!',
    deleteError: 'Có lỗi xảy ra khi xóa lịch sử!',
    noHistory: 'Chưa có lịch sử dự đoán.',
    loadingData: 'Đang tải dữ liệu...',
    noResult: 'Không có kết quả!',
    redirecting: 'Đang chuyển hướng đến trang tìm kiếm...',
    dataError: 'Lỗi dữ liệu!',
    foodNotFound: 'Không tìm thấy thông tin món ăn.',
    tryAgain: 'Thử lại',
    analyzing: '🤖 Đang phân tích...',
    analyzingWait: 'Vui lòng đợi trong giây lát',
    // Auto-save history
    historySaved: 'Đã lưu lịch sử thành công',
    historyNotLoggedIn: 'Lịch sử chưa được lưu - bạn chưa đăng nhập',
    historySaveFailed: 'Lưu lịch sử thất bại',
    // Backend error messages
    usernameRequired: 'Yêu cầu tên đăng nhập và mật khẩu',
    invalidCredentials: 'Tên đăng nhập hoặc mật khẩu không đúng',
    usernameExists: 'Tên đăng nhập đã tồn tại',
    userCreated: 'Tạo tài khoản thành công',
    // Network errors
    networkError: 'Lỗi kết nối mạng! Vui lòng kiểm tra internet.',
    serverError: 'Không thể kết nối đến server!',
    // Rate limiting
    rateLimitError: 'Bạn đã gửi quá nhiều yêu cầu! Vui lòng đợi một chút.',
    rateLimitGuest: '🔒 Người dùng chưa đăng nhập chỉ được gửi 5 yêu cầu / 10 phút.\n\nĐăng nhập để sử dụng nhiều hơn (30 yêu cầu / 10 phút)!',
    rateLimitUser: '⏱️ Bạn đã gửi quá nhiều yêu cầu!\n\nGiới hạn: 30 yêu cầu / 10 phút. Vui lòng đợi một chút.',
  },
  EN: {
    loginSuccess: 'Login successful!',
    registerSuccess: 'Registration successful! Switching to login...',
    error: 'An error occurred!',
    loading: 'Processing...',
    requireLogin: 'You need to login to view history',
    loginNow: 'Login now',
    deleteConfirm: 'Are you sure you want to delete all history?',
    deleteSuccess: 'History deleted successfully!',
    deleteError: 'Error deleting history!',
    noHistory: 'No prediction history yet.',
    loadingData: 'Loading data...',
    // Auto-save history
    historySaved: 'History saved successfully',
    historyNotLoggedIn: 'History not saved - user not logged in',
    historySaveFailed: 'History save failed',
    // Backend error messages (English)
    usernameRequired: 'Username and password required',
    invalidCredentials: 'Invalid username or password',
    usernameExists: 'Username already exists',
    userCreated: 'User created successfully',
    // Network errors
    networkError: 'Network Error! Please check your internet connection.',
    serverError: 'Cannot connect to server!',
    // Rate limiting
    rateLimitError: 'Too many requests! Please wait a moment.',
    rateLimitTitle: '⏱️ Please wait!',
    rateLimitGuest: '🔒 Guest users are limited to 5 requests / 10 minutes.\n\nLogin to use more (30 requests / 10 minutes)!',
    rateLimitUser: '⏱️ You have sent too many requests!\n\nLimit: 30 requests / 10 minutes. Please wait.',
  }
};
