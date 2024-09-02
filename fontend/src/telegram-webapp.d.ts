interface TelegramWebAppUser {
    id: number;
    first_name: string;
    last_name: string;
    username: string;
    language_code: string;
  }
  
  interface TelegramWebApp {
    initDataUnsafe: {
      user: TelegramWebAppUser;
    };
  }
  
  interface Window {
    Telegram: {
      WebApp: TelegramWebApp;
    };
  }
  