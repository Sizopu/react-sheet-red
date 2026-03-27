# Cyberpunk RED Character Sheet — React версия

Полная конвертация оригинального проекта на React + Vite.

## 🚀 Запуск

```bash
cd cyberpunk-red
npm install
npm run dev
```

Сервер запустится на `http://localhost:3000`

## 📁 Структура проекта

```
cyberpunk-red/
├── src/
│   ├── components/
│   │   ├── Layout.jsx         # Общая навигация
│   │   └── DiceDialog.jsx     # Диалог броска кубиков
│   ├── pages/
│   │   ├── Characters.jsx     # Управление персонажами
│   │   ├── CharacterSheet.jsx # Лист персонажа (статы, навыки, оружие)
│   │   ├── Implants.jsx       # Киберимпланты с визуальной схемой
│   │   ├── Mobs.jsx           # Мобы/противники
│   │   ├── Notes.jsx          # Заметки и таблицы
│   │   └── Scripts.jsx        # Cyberdeck/программы
│   ├── context/
│   │   └── CharacterContext.jsx # Глобальное состояние
│   ├── utils/
│   │   └── dice.js            # Утилиты для кубиков
│   └── css/
│       ├── common.css         # Общие стили
│       ├── character.css      # Лист персонажа
│       ├── implants.css       # Импланты
│       ├── mobs.css           # Мобы
│       ├── notes.css          # Заметки
│       ├── scripts.css        # Cyberdeck
│       └── main.css           # Characters
├── public/
│   └── images/                # Изображения
└── package.json
```

## ✨ Функционал

### Characters
- Создание/редактирование/удаление персонажей
- Просмотр списка персонажей
- Загрузка персонажа в Character Sheet
- Экспорт/импорт всех персонажей (JSON)

### Character Sheet
- **ID Block**: имя, возраст, роль, role ability, humanity, XP
- **Stats**: INT, REF, DEX, TECH, COOL, WILL, LUCK, MOVE, BODY, EMP
- **Initiative**: с броском кубика
- **Health**: HP, seriously wounded, death save
- **Armor**: head, body, shield с SP и penalty
- **Skills**: 9 групп навыков с авто-расчётом BASE
- **Specialised Skills**: настраиваемые навыки
- **Weapons**: оружие с NOTES
- **Injuries/Notes**: критические ранения, зависимости, заметки

### Implants
- 8 типов имплантов: Fashionware, Neuralware, Cyberoptics, Cyberaudio, Internal, External, Limb, Borgware
- Визуальная схема тела с маркерами
- Карточки имплантов с эффектами, стоимостью, редкостью
- Подсчёт потери человечности
- **Lifepath**: cultural origins, personality, ценности, семья, друзья, враги
- **Inventory**: таблица снаряжения с весом и стоимостью

### Mobs
- Создание групп противников
- Stats, health, armor
- Weapons с формулами урона и бросками
- Skills с presets
- Бросок инициативы

### Notes
- Заметки (текст)
- Таблицы (добавление строк/столбцов)
- Удаление строк/столбцов

### Scripts (Cyberdeck)
- Информация о дека: model, icon, NET Actions, Black ICE
- Interface Abilities (checkboxes)
- Программы: Poor, Standard, Excellent, Cyberarm
- ATK/DEF формулы с бросками кубиков
- Hardware таблица
- Help dialog с правилами

### Dice Roller
- Типы: d4, d6, d8, d10, d12, d20
- Количество кубиков: 1-10
- Отображение результатов с критическими успехами/провалами

## 💾 Хранение данных

Все данные сохраняются в `localStorage`:
- `characters` — список персонажей
- `character_{id}_characterData` — данные персонажа

### Экспорт/Импорт
- Кнопка "💾 Save All" экспортирует всех персонажей в JSON
- Кнопка "📂 Load" импортирует из JSON

## 🎨 Стили

Полное соответствие оригинальному дизайну:
- Тёмная тема (#1a1d24, #232931, #2d3139)
- Оранжевые акценты (#f78166)
- Шрифт: Courier New, monospace
- Адаптивный дизайн для мобильных

## 🛠️ Технологии

- **React 19** — UI библиотека
- **Vite** — сборщик
- **React Router** — навигация
- **Context API** — управление состоянием
- **localStorage** — персистентность

## 📝 Отличия от оригинала

1. Единое приложение вместо отдельных HTML страниц
2. React-компоненты вместо jQuery/vanilla JS
3. Context API для глобального состояния
4. Модульная архитектура
5. Hot reload при разработке
