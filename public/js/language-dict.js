// ====================================
// Multi-Language Dictionary System
// Sleepy Tiger Farmhouse
// ====================================

const LANGUAGE_DICT = {
  // Navigation
  nav_home: {
    en: 'Home',
    cn: '首页',
    ru: 'Главная'
  },
  nav_services: {
    en: 'Services', 
    cn: '服务',
    ru: 'Услуги'
  },
  nav_booking: {
    en: 'Booking',
    cn: '预订', 
    ru: 'Бронирование'
  },
  nav_login: {
    en: 'Login',
    cn: '登录',
    ru: 'Вход'
  },
  nav_register: {
    en: 'Register',
    cn: '注册',
    ru: 'Регистрация'
  },
  nav_profile: {
    en: 'Profile',
    cn: '个人资料',
    ru: 'Профиль'
  },
  nav_admin: {
    en: 'Admin',
    cn: '管理',
    ru: 'Админ'
  },
  nav_logout: {
    en: 'Logout',
    cn: '退出',
    ru: 'Выход'
  },

  // Homepage
  welcome_title: {
    en: 'Welcome to Sleepy Tiger Farmhouse',
    cn: '欢迎来到睡虎农庄',
    ru: 'Добро пожаловать в Sleepy Tiger Farmhouse'
  },
  welcome_subtitle: {
    en: 'Experience the perfect blend of rural tranquility and modern comfort',
    cn: '体验乡村宁静与现代舒适的完美融合',
    ru: 'Ощутите идеальное сочетание сельского спокойствия и современного комфорта'
  },
  explore_services: {
    en: 'Explore Our Services',
    cn: '探索我们的服务',
    ru: 'Изучить наши услуги'
  },
  book_now: {
    en: 'Book Now',
    cn: '立即预订',
    ru: 'Забронировать'
  },

  // Services Page
  services_title: {
    en: 'Our Services',
    cn: '我们的服务',
    ru: 'Наши услуги'
  },
  services_subtitle: {
    en: 'Discover amazing experiences at our farmhouse',
    cn: '在我们的农庄发现精彩体验',
    ru: 'Откройте для себя удивительные впечатления на нашей ферме'
  },
  price_label: {
    en: 'Price',
    cn: '价格',
    ru: 'Цена'
  },

  // Booking Page
  booking_title: {
    en: 'Book Your Visit',
    cn: '预订您的参观',
    ru: 'Забронировать ваш визит'
  },
  form_name: {
    en: 'Your Name',
    cn: '您的姓名',
    ru: 'Ваше имя'
  },
  form_phone: {
    en: 'Your Phone',
    cn: '您的电话',
    ru: 'Ваш телефон'
  },
  form_date: {
    en: 'Select Date (MM/DD/YYYY)',
    cn: '选择日期 (MM/DD/YYYY)',
    ru: 'Выберите дату (MM/DD/YYYY)'
  },
  form_service: {
    en: 'Select a Service',
    cn: '选择服务',
    ru: 'Выберите услугу'
  },
  form_notes: {
    en: 'Additional Notes (Optional)',
    cn: '附加说明（可选）',
    ru: 'Дополнительные заметки (необязательно)'
  },
  submit_booking: {
    en: 'Submit Booking',
    cn: '提交预订',
    ru: 'Отправить бронь'
  },

  // Authentication
  login_title: {
    en: 'Login to Your Account',
    cn: '登录您的账户',
    ru: 'Войти в ваш аккаунт'
  },
  register_title: {
    en: 'Create New Account',
    cn: '创建新账户',
    ru: 'Создать новый аккаунт'
  },
  username_label: {
    en: 'Username',
    cn: '用户名',
    ru: 'Имя пользователя'
  },
  email_label: {
    en: 'Email Address',
    cn: '电子邮箱',
    ru: 'Адрес электронной почты'
  },
  password_label: {
    en: 'Password',
    cn: '密码',
    ru: 'Пароль'
  },
  first_name_label: {
    en: 'First Name',
    cn: '名字',
    ru: 'Имя'
  },
  last_name_label: {
    en: 'Last Name',
    cn: '姓氏',
    ru: 'Фамилия'
  },
  phone_label: {
    en: 'Phone Number',
    cn: '电话号码',
    ru: 'Номер телефона'
  },
  language_preference: {
    en: 'Language Preference',
    cn: '语言偏好',
    ru: 'Предпочтительный язык'
  },
  login_button: {
    en: 'Login',
    cn: '登录',
    ru: 'Войти'
  },
  register_button: {
    en: 'Register',
    cn: '注册',
    ru: 'Зарегистрироваться'
  },
  have_account: {
    en: 'Already have an account?',
    cn: '已有账户？',
    ru: 'Уже есть аккаунт?'
  },
  no_account: {
    en: 'Don\'t have an account?',
    cn: '没有账户？',
    ru: 'Нет аккаунта?'
  },

  // Profile Page
  profile_title: {
    en: 'My Profile',
    cn: '我的资料',
    ru: 'Мой профиль'
  },
  update_profile: {
    en: 'Update Profile',
    cn: '更新资料',
    ru: 'Обновить профиль'
  },
  my_bookings: {
    en: 'My Bookings',
    cn: '我的预订',
    ru: 'Мои брони'
  },

  // Payment
  payment_title: {
    en: 'Virtual Payment',
    cn: '虚拟支付',
    ru: 'Виртуальная оплата'
  },
  pay_now: {
    en: 'Pay Now',
    cn: '立即支付',
    ru: 'Оплатить сейчас'
  },
  payment_successful: {
    en: 'Payment Successful!',
    cn: '支付成功！',
    ru: 'Оплата успешна!'
  },
  payment_failed: {
    en: 'Payment Failed',
    cn: '支付失败',
    ru: 'Оплата не удалась'
  },
  service_label: {
    en: 'Service',
    cn: '服务',
    ru: 'Услуга'
  },
  amount_label: {
    en: 'Amount',
    cn: '金额',
    ru: 'Сумма'
  },
  customer_info: {
    en: 'Customer Information',
    cn: '客户信息',
    ru: 'Информация о клиенте'
  },
  confirm_payment: {
    en: 'Confirm Payment',
    cn: '确认支付',
    ru: 'Подтвердить оплату'
  },
  login_required: {
    en: 'Please login to complete your booking',
    cn: '请登录以完成预订',
    ru: 'Пожалуйста, войдите, чтобы завершить бронирование'
  },

  // Admin Dashboard
  admin_title: {
    en: 'Admin Dashboard',
    cn: '管理控制台',
    ru: 'Панель администратора'
  },
  manage_users: {
    en: 'Manage Users',
    cn: '用户管理',
    ru: 'Управление пользователями'
  },
  manage_bookings: {
    en: 'Manage Bookings',
    cn: '预订管理',
    ru: 'Управление бронированием'
  },
  manage_services: {
    en: 'Manage Services',
    cn: '服务管理',
    ru: 'Управление услугами'
  },

  // Status Labels
  status_pending: {
    en: 'Pending',
    cn: '待处理',
    ru: 'В ожидании'
  },
  status_confirmed: {
    en: 'Confirmed',
    cn: '已确认',
    ru: 'Подтверждено'
  },
  status_cancelled: {
    en: 'Cancelled',
    cn: '已取消',
    ru: 'Отменено'
  },
  status_completed: {
    en: 'Completed',
    cn: '已完成',
    ru: 'Завершено'
  },

  // Common Actions
  save: {
    en: 'Save',
    cn: '保存',
    ru: 'Сохранить'
  },
  cancel: {
    en: 'Cancel',
    cn: '取消',
    ru: 'Отменить'
  },
  edit: {
    en: 'Edit',
    cn: '编辑',
    ru: 'Редактировать'
  },
  delete: {
    en: 'Delete',
    cn: '删除',
    ru: 'Удалить'
  },
  create: {
    en: 'Create',
    cn: '创建',
    ru: 'Создать'
  },
  update: {
    en: 'Update',
    cn: '更新',
    ru: 'Обновить'
  },

  // Messages
  success_message: {
    en: 'Operation completed successfully!',
    cn: '操作成功完成！',
    ru: 'Операция успешно завершена!'
  },
  error_message: {
    en: 'An error occurred. Please try again.',
    cn: '发生错误，请重试。',
    ru: 'Произошла ошибка. Пожалуйста, попробуйте еще раз.'
  },
  loading: {
    en: 'Loading...',
    cn: '加载中...',
    ru: 'Загрузка...'
  },

  // Footer
  contact_info: {
    en: 'Contact us: sleepytiger@example.com | +61 400 123 456',
    cn: '联系我们: sleepytiger@example.com | +61 400 123 456',
    ru: 'Свяжитесь с нами: sleepytiger@example.com | +61 400 123 456'
  },
  copyright: {
    en: '© 2025 Sleepy Tiger Resort Farmhouse',
    cn: '© 2025 睡虎度假农庄',
    ru: '© 2025 Sleepy Tiger Resort Farmhouse'
  },

  // Language Options
  lang_english: {
    en: 'English',
    cn: 'English',
    ru: 'English'
  },
  lang_chinese: {
    en: '中文',
    cn: '中文',
    ru: '中文'
  },
  lang_russian: {
    en: 'Русский',
    cn: 'Русский', 
    ru: 'Русский'
  }
};

// ====================================
// Language Management Functions
// ====================================

class LanguageManager {
  constructor() {
    this.currentLanguage = this.getStoredLanguage() || 'en';
    this.init();
  }

  init() {
    this.createLanguageSwitcher();
    this.translatePage();
    this.bindEvents();
  }

  getStoredLanguage() {
    // Try localStorage first, then browser language, then default to 'en'
    return localStorage.getItem('preferred_language') || 
           (navigator.language && navigator.language.startsWith('zh') ? 'cn' : 
            navigator.language && navigator.language.startsWith('ru') ? 'ru' : 'en');
  }

  setLanguage(lang) {
    this.currentLanguage = lang;
    localStorage.setItem('preferred_language', lang);
    
    // Emit language change event for other components
    document.dispatchEvent(new CustomEvent('languageChanged', { detail: { language: lang } }));
    
    this.translatePage();
  }

  createLanguageSwitcher() {
    // Remove existing switcher if present
    const existingSwitcher = document.querySelector('.language-switcher');
    if (existingSwitcher) {
      existingSwitcher.remove();
    }

    // Create top navigation bar if it doesn't exist
    let topNav = document.querySelector('.top-nav');
    if (!topNav) {
      topNav = document.createElement('div');
      topNav.className = 'top-nav';
      
      const navContainer = document.querySelector('.nav-container');
      const mainNav = document.querySelector('.main-nav');
      
      if (navContainer) {
        navContainer.insertBefore(topNav, mainNav);
      } else if (mainNav) {
        mainNav.parentNode.insertBefore(topNav, mainNav);
      } else {
        document.body.insertBefore(topNav, document.body.firstChild);
      }
    }

    const switcher = document.createElement('div');
    switcher.className = 'language-switcher';
    switcher.innerHTML = `
      <select id="language-select" class="language-select">
        <option value="en" ${this.currentLanguage === 'en' ? 'selected' : ''}>🇬🇧 English</option>
        <option value="cn" ${this.currentLanguage === 'cn' ? 'selected' : ''}>🇨🇳 中文</option>
        <option value="ru" ${this.currentLanguage === 'ru' ? 'selected' : ''}>🇷🇺 Русский</option>
      </select>
    `;

    topNav.appendChild(switcher);
  }

  bindEvents() {
    const languageSelect = document.getElementById('language-select');
    if (languageSelect) {
      languageSelect.addEventListener('change', (e) => {
        this.setLanguage(e.target.value);
      });
    }
  }

  translatePage() {
    document.querySelectorAll('[data-translate]').forEach(element => {
      const key = element.getAttribute('data-translate');
      const translation = this.getTranslation(key);
      
      if (translation) {
        if (element.tagName === 'INPUT' && element.type !== 'submit' && element.type !== 'button') {
          element.placeholder = translation;
        } else {
          element.textContent = translation;
        }
      }
    });

    // Update page title
    const titleKey = document.body.getAttribute('data-page-title');
    if (titleKey) {
      const titleTranslation = this.getTranslation(titleKey);
      if (titleTranslation) {
        document.title = `${titleTranslation} - Sleepy Tiger Farmhouse`;
      }
    }
  }

  getTranslation(key) {
    return LANGUAGE_DICT[key] && LANGUAGE_DICT[key][this.currentLanguage];
  }

  t(key) {
    return this.getTranslation(key) || key;
  }
}

// ====================================
// CSS Styles for Language Switcher
// ====================================
const langSwitcherStyles = `
  <style>
    .language-switcher {
      display: inline-block;
    }
    
    .language-select {
      background: #fff;
      border: 1px solid #ddd;
      border-radius: 4px;
      padding: 4px 8px;
      font-size: 13px;
      box-shadow: 0 1px 2px rgba(0,0,0,0.1);
      cursor: pointer;
      min-width: 120px;
    }
    
    .language-select:hover {
      border-color: #4CAF50;
    }
    
    .language-select:focus {
      outline: none;
      border-color: #4CAF50;
      box-shadow: 0 0 0 2px rgba(76, 175, 80, 0.2);
    }
  </style>
`;

// Inject styles
document.head.insertAdjacentHTML('beforeend', langSwitcherStyles);

// ====================================
// Auto-Initialize Language Manager
// ====================================
let languageManager;

document.addEventListener('DOMContentLoaded', () => {
  languageManager = new LanguageManager();
  
  // Make it globally accessible
  window.languageManager = languageManager;
  window.t = (key) => languageManager.t(key);
});

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { LanguageManager, LANGUAGE_DICT };
}