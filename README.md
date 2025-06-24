# 🧮 Калькулятор RUSPAN

MVP приложение-калькулятор для расчета строительных конструкций с современным интерфейсом.

## 🚀 Технологии

- **Frontend**: React 18 + TypeScript
- **Build Tool**: Vite
- **Стили**: SCSS + CSS Modules
- **Архитектура**: Feature Sliced Design (FSD)
- **Линтинг**: ESLint + Prettier
- **Git Hooks**: Husky + lint-staged

## 📁 Структура проекта

```
src/
├── app/           # Конфигурация приложения
├── pages/         # Страницы приложения
├── widgets/       # Сложные UI блоки
│   ├── Sidebar/           # Форма ввода данных
│   ├── CalculationResults/ # Результаты расчетов
│   └── Visualization/     # Визуализация данных
├── features/      # Бизнес-функции
├── entities/      # Бизнес-сущности
└── shared/        # Переиспользуемый код
    ├── ui/        # UI компоненты
    ├── lib/       # Утилиты
    ├── api/       # API слой
    └── styles/    # Общие стили
```

## 🛠 Установка и запуск

### Требования

- Node.js 18+
- npm 8+

### Установка

```bash
cd MWC
npm install
```

### Разработка

```bash
npm run dev          # Запуск dev сервера
npm run build        # Сборка для production
npm run preview      # Предпросмотр production сборки
```

### Проверка кода

```bash
npm run lint         # Проверка ESLint
npm run lint:fix     # Автоисправление ESLint
npm run format       # Форматирование Prettier
npm run type-check   # Проверка типов TypeScript
```

## 📋 Функциональность

### ✅ Готово

- **Sidebar с формой ввода** - 5 блоков параметров:
  - Вид расчета
  - Количество рядов по осям
  - Параметры элементов узла
  - Условия в узле
  - Параметры фасонного элемента
- **Заготовки для результатов и визуализации**
- **Адаптивный дизайн**
- **Система типизации TypeScript**

### 🔄 В разработке

- Логика расчетов
- API интеграция
- Компоненты результатов
- Графическая визуализация

## 💻 Разработка

### Git Flow

Проект настроен с автоматическими проверками:

- **Pre-commit**: ESLint + Prettier + Type checking
- **Commit-msg**: Проверка формата сообщения

### Code Style

- **ESLint**: Строгие правила для React + TypeScript
- **Prettier**: Единое форматирование (одинарные кавычки, без точек с запятой)
- **Husky**: Автоматические проверки при коммитах

### VS Code

Рекомендуемые расширения:

- ESLint
- Prettier
- TypeScript and JavaScript Language Features

## 🏗 Архитектура

Проект следует принципам **Feature Sliced Design**:

- **app** — инициализация приложения
- **pages** — страницы приложения
- **widgets** — самостоятельные и полноценные блоки
- **features** — части бизнес-логики
- **entities** — бизнес-сущности
- **shared** — переиспользуемые модули

## 📝 Соглашения

### Commit Messages

- Длина: 1-50 символов
- Язык: русский
- Примеры: "добавить форму расчета", "исправить стили sidebar"

### Именование файлов

- Компоненты: `PascalCase.tsx`
- Хуки: `use[Name].ts`
- Утилиты: `camelCase.ts`
- Стили: `[ComponentName].scss`

## 🔧 Настройка IDE

### VS Code settings.json

```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  }
}
```

## 📄 Лицензия

Проект разработан для внутреннего использования.

---

**Разработка**: 2024  
**Статус**: MVP в разработке 🚧
