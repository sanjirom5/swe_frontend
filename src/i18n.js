// src/i18n.js
import i18n from "i18next";
import { initReactI18next } from "react-i18next";

// translations (you can move to separate JSON files later)
const resources = {
  en: {
    translation: {
      name: "NAME",
      dashboard: "Dashboard",
      products: "Products",
      orders: "Orders",
      chat: "Chat",
      about: "About",
      login: "Login",
      logout: "Logout",
      supplierLogin: "Supplier Login",
      useDemo: "Use demo",
      incomingLinkRequests: "Incoming Link Requests",
      recentOrders: "Recent Orders",
      viewAllOrders: "View all orders →",
      // add more keys used in UI...
    }
  },
  ru: {
    translation: {
      name: "ИМЯ",
      dashboard: "Панель",
      products: "Товары",
      orders: "Заказы",
      chat: "Чат",
      about: "О проекте",
      login: "Войти",
      logout: "Выйти",
      supplierLogin: "Вход поставщика",
      useDemo: "Режим демо",
      incomingLinkRequests: "Входящие запросы на связь",
      recentOrders: "Последние заказы",
      viewAllOrders: "Просмотреть все заказы →",
      // ...
    }
  },
  kz: {
    translation: {
      name: "АТЫ",
      dashboard: "Панель",
      products: "Тауарлар",
      orders: "Тапсырыстар",
      chat: "Чат",
      about: "Жоба туралы",
      login: "Кіру",
      logout: "Шығу",
      supplierLogin: "Жеткізуші кіруі",
      useDemo: "Демо режимі",
      incomingLinkRequests: "Қосылу сұраулары",
      recentOrders: "Жақындағы тапсырыстар",
      viewAllOrders: "Барлық тапсырыстарды көру →",
      // ...
    }
  }
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: localStorage.getItem("lang") || "en",
    fallbackLng: "en",
    interpolation: { escapeValue: false }
  });

export default i18n;
