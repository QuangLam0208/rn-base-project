import { Translations } from "./en"

const vi: Translations = {
  common: {
    ok: "OK!",
    cancel: "Huỷ",
    back: "Quay lại",
  },
  errorScreen: {
    title: "Đã có lỗi xảy ra!",
    friendlySubtitle:
      "Đây là màn hình người dùng sẽ thấy khi có lỗi xảy ra trong production. Bạn có thể tuỳ chỉnh thông báo này (trong `app/i18n/vi.ts`) và cả layout (`app/screens/ErrorScreen`). Nếu muốn bỏ hẳn, xem component <ErrorBoundary> trong `app/app.tsx`.",
    reset: "KHỞI ĐỘNG LẠI APP",
    traceTitle: "Lỗi từ %{name} stack",
  },
  emptyStateComponent: {
    generic: {
      heading: "Trống trơn... buồn quá",
      content: "Chưa có dữ liệu. Thử bấm nút để tải lại.",
      button: "Thử lại lần nữa",
    },
  },
  errors: {
    invalidEmail: "Email không hợp lệ.",
  },
  splashScreen: {
    appName: "BaseApp",
  },
  homeScreen: {
    subtitle: "Đây là tab ví dụ duy nhất trong dự án base này — thay bằng màn hình thật.",
    incrementButton: "Chạm vào tôi",
  },
  mainNavigator: {
    homeTab: "Trang chủ",
    coursesTab: "Khoá học",
    mentorsTab: "Mentor",
    companiesTab: "Doanh nghiệp",
  },
  coursesScreen: {
    headingOngoing: "Đang diễn ra",
    buttonMore: "Xem thêm",
    buttonLess: "Thu gọn",
    syllabusTitle: "Giáo trình",
    emptySyllabus: "Không có giáo trình",
    emptyCourses: "Không có khoá học nào",
    freePrice: "Miễn phí",
    errorLoadCourses: "Không thể tải danh sách khoá học.",
    errorLoadSyllabus: "Không thể tải danh sách giáo trình.",
  },
  mentorsScreen: {
    title: "Mentor",
    emptyMentors: "Không có mentor nào",
    errorLoadMentors: "Không thể tải danh sách mentor.",
  },
  mentorDetailScreen: {
    title: "Chi tiết Mentor",
    aboutTitle: "Giới thiệu",
    noDescription: "Chưa có thông tin giới thiệu.",
    emailLabel: "Email",
    phoneLabel: "Điện thoại",
    roleLabel: "Vai trò",
    errorDetail: "Không thể tải thông tin chi tiết mentor.",
    retryButton: "Thử lại",
  },
  companiesScreen: {
    title: "Doanh nghiệp",
    subtitlePartner: "Đối tác doanh nghiệp",
    emptyCompanies: "Chưa có thông tin doanh nghiệp nào",
    errorLoadCompanies: "Không thể tải danh sách doanh nghiệp.",
  },
  settingsScreen: {
    title: "Cài đặt",
    languageSection: "Ngôn ngữ",
    languageVi: "Tiếng Việt",
    languageEn: "English",
    themeSection: "Giao diện",
    darkMode: "Chế độ tối",
    updateSection: "Cập nhật",
    checkForUpdate: "Kiểm tra cập nhật",
    updateNow: "Tải về và khởi động lại",
    updateChecking: "Đang kiểm tra cập nhật…",
    updateUpToDate: "Bạn đang dùng phiên bản mới nhất.",
    updateAvailable: "Đã có bản cập nhật mới.",
    updateDownloading: "Đang tải bản cập nhật…",
    updateDisabledDev: "Không thể kiểm tra cập nhật trên bản development.",
    updateError: "Không kiểm tra được cập nhật. Thử lại sau.",
    logout: "Đăng xuất",
    logoutConfirmTitle: "Đăng xuất",
    logoutConfirmMessage: "Bạn có chắc chắn muốn đăng xuất không?",
  },
  loginScreen: {
    brandName: "iLearning",
    labelUsername: "Người dùng",
    hintUsername: "Username",
    labelPassword: "Mật mã",
    hintPassword: "Password",
    loginWithQr: "Đăng nhập bằng mã QR",
    loginButton: "Đăng nhập",
    forgotPassword: "Quên mật khẩu?",
    validationEmpty: "Vui lòng nhập đầy đủ thông tin",
    loginSuccess: "Đăng nhập thành công!",
    loginFailed: "Đăng nhập thất bại, vui lòng kiểm tra lại!",
  },
}

export default vi
