import React, { useState, useEffect, useRef } from 'react';
import { BrowserRouter as Router, Routes, Route, NavLink, useSearchParams } from 'react-router-dom';

const STORAGE_KEY = 'capitask_data';
const LANGUAGE_STORAGE_KEY = 'capitask_language';
const ISSUES_VIEW_MODE_STORAGE_KEY = 'capitask_issues_view_mode';
const CSV_FORMULA_PREFIXES = ['=', '+', '-', '@'];
const DEFAULT_LANGUAGE = 'en';
const ISSUE_TYPES = ['Task', 'Bug', 'Story'];
const ISSUE_PRIORITIES = ['High', 'Medium', 'Low'];
const ISSUE_STATUSES = ['To Do', 'In Progress', 'Done'];
const ISSUE_TYPES_SET = new Set(ISSUE_TYPES);
const ISSUE_PRIORITIES_SET = new Set(ISSUE_PRIORITIES);
const ISSUE_STATUSES_SET = new Set(ISSUE_STATUSES);
const MAX_TITLE_LENGTH = 120;
const MAX_DESCRIPTION_LENGTH = 3000;
const MAX_ASSIGNEE_LENGTH = 80;
const MAX_COMMENT_LENGTH = 1000;
const DATE_INPUT_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

const I18N = {
  en: {
    issuesNav: 'Issues',
    activeSprintNav: 'Active Sprint',
    ganttNav: 'Gantt Chart',
    language: 'Language',
    languageNames: {
      en: 'English',
      ru: 'Russian'
    },
    backlog: 'Backlog',
    searchIssues: 'Search issues...',
    allTypes: 'All Types',
    allPriorities: 'All Priorities',
    resetFilters: 'Reset filters',
    relatedIssues: 'Related issues',
    noRelatedIssues: 'No related issues yet',
    relatedSearchPlaceholder: 'Search by key or title',
    noMatchingIssues: 'No matching issues',
    markdownHelp: 'Supports Markdown and code blocks with ```',
    descriptionPreview: 'Preview',
    linkedIssues: 'Linked',
    addLink: 'Add link',
    issueNotes: 'Issue notes',
    issueDetails: 'Issue details',
    markdownPreviewEmpty: 'Add a description to see Markdown preview',
    comments: 'Comments',
    commentPlaceholder: 'Write a comment...',
    addComment: 'Add comment',
    noComments: 'No comments yet',
    availableAfterCreate: 'Comments and relations will be available after issue creation',
    switchToList: 'Switch to List',
    switchToBoard: 'Switch to Board',
    createIssue: 'Create Issue',
    key: 'Key',
    summary: 'Summary',
    priority: 'Priority',
    status: 'Status',
    assignee: 'Assignee',
    due: 'Due',
    type: 'Type',
    description: 'Description',
    storyPoints: 'Story Points',
    dueDate: 'Due Date',
    defaultIssueTitle: 'Untitled issue',
    assigneePlaceholder: 'John Doe',
    cancel: 'Cancel',
    saveIssue: 'Save Issue',
    editIssue: 'Edit',
    sprintTag: 'Sprint',
    pointsShort: 'pts',
    backlogCompleted: 'Great, you reached the end of backlog',
    capybaraAlt: 'Capybara at the end of tasks list',
    sprintBoard: 'Sprint Board',
    ganttTitle: 'Gantt Chart',
    groupBy: 'Group by',
    groupByUsers: 'Users',
    groupByTypes: 'Types',
    showRelations: 'Show relations',
    unassigned: 'Unassigned',
    noActiveTasks: 'No active tasks to display',
    openIssue: 'Open issue',
    goal: 'Goal',
    filterSprint: 'Filter sprint...',
    exportCsv: 'Export CSV',
    actions: 'Actions',
    edit: 'Edit',
    typeLabels: {
      Task: 'Task',
      Bug: 'Bug',
      Story: 'Story'
    },
    priorityLabels: {
      High: 'High',
      Medium: 'Medium',
      Low: 'Low'
    },
    statusLabels: {
      'To Do': 'To Do',
      'In Progress': 'In Progress',
      Done: 'Done'
    },
    csvHeaders: ['ID', 'Title', 'Type', 'Status', 'Points', 'Assignee']
  },
  ru: {
    issuesNav: 'Задачи',
    activeSprintNav: 'Активный спринт',
    ganttNav: 'Диаграмма Ганта',
    language: 'Язык',
    languageNames: {
      en: 'English',
      ru: 'Русский'
    },
    backlog: 'Бэклог',
    searchIssues: 'Поиск задач...',
    allTypes: 'Все типы',
    allPriorities: 'Все приоритеты',
    resetFilters: 'Сбросить фильтры',
    relatedIssues: 'Связанные задачи',
    noRelatedIssues: 'Пока нет связанных задач',
    relatedSearchPlaceholder: 'Поиск по ключу или названию',
    noMatchingIssues: 'Подходящие задачи не найдены',
    markdownHelp: 'Поддерживается Markdown и блоки кода через ```',
    descriptionPreview: 'Предпросмотр',
    linkedIssues: 'Связанные',
    addLink: 'Добавить связь',
    issueNotes: 'Пометки по задаче',
    issueDetails: 'Детали задачи',
    markdownPreviewEmpty: 'Добавьте описание, чтобы увидеть предпросмотр Markdown',
    comments: 'Комментарии',
    commentPlaceholder: 'Напишите комментарий...',
    addComment: 'Добавить комментарий',
    noComments: 'Комментариев пока нет',
    availableAfterCreate: 'Комментарии и связи будут доступны после создания задачи',
    switchToList: 'Переключить на список',
    switchToBoard: 'Переключить на доску',
    createIssue: 'Создать задачу',
    key: 'Ключ',
    summary: 'Сводка',
    priority: 'Приоритет',
    status: 'Статус',
    assignee: 'Исполнитель',
    due: 'Срок',
    type: 'Тип',
    description: 'Описание',
    storyPoints: 'Стори поинты',
    dueDate: 'Дата дедлайна',
    defaultIssueTitle: 'Задача без названия',
    assigneePlaceholder: 'Иван Иванов',
    cancel: 'Отмена',
    saveIssue: 'Сохранить задачу',
    editIssue: 'Редактировать',
    sprintTag: 'Спринт',
    pointsShort: 'балл.',
    backlogCompleted: 'Поздравляем, весь backlog просмотрен',
    capybaraAlt: 'Капибара в конце списка задач',
    sprintBoard: 'Доска спринта',
    ganttTitle: 'Диаграмма Ганта',
    groupBy: 'Группировка',
    groupByUsers: 'По исполнителям',
    groupByTypes: 'По типам',
    showRelations: 'Показать связи',
    unassigned: 'Не назначен',
    noActiveTasks: 'Нет активных задач для отображения',
    openIssue: 'Открыть задачу',
    goal: 'Цель',
    filterSprint: 'Фильтр спринта...',
    exportCsv: 'Экспорт CSV',
    actions: 'Действия',
    edit: 'Изменить',
    typeLabels: {
      Task: 'Задача',
      Bug: 'Баг',
      Story: 'История'
    },
    priorityLabels: {
      High: 'Высокий',
      Medium: 'Средний',
      Low: 'Низкий'
    },
    statusLabels: {
      'To Do': 'К выполнению',
      'In Progress': 'В работе',
      Done: 'Готово'
    },
    csvHeaders: ['ID', 'Название', 'Тип', 'Статус', 'Баллы', 'Исполнитель']
  }
};

const resolveLanguage = (value) => {
  if (typeof value !== 'string') {
    return null;
  }

  const normalizedValue = value.trim().toLowerCase();
  if (normalizedValue.startsWith('ru')) {
    return 'ru';
  }

  if (normalizedValue.startsWith('en')) {
    return 'en';
  }

  return null;
};

const detectBrowserLanguage = () => {
  if (typeof navigator === 'undefined') {
    return DEFAULT_LANGUAGE;
  }

  const browserLanguage = navigator.languages?.[0] ?? navigator.language;
  return resolveLanguage(browserLanguage) ?? DEFAULT_LANGUAGE;
};

const getTranslatedLabel = (labels, value) => labels?.[value] ?? value;

const getInitialLanguage = () => {
  try {
    const storedLanguage = localStorage.getItem(LANGUAGE_STORAGE_KEY);
    const resolvedStoredLanguage = resolveLanguage(storedLanguage);
    if (resolvedStoredLanguage) {
      return resolvedStoredLanguage;
    }
  } catch (error) {
    // Если localStorage недоступен, продолжаем с языком браузера.
    console.error('Не удалось прочитать сохранённый язык интерфейса.', error);
  }

  return detectBrowserLanguage();
};

const getInitialIssuesViewMode = () => {
  try {
    const storedViewMode = localStorage.getItem(ISSUES_VIEW_MODE_STORAGE_KEY);
    return storedViewMode === 'list' ? 'list' : 'board';
  } catch (error) {
    // Если localStorage недоступен, используем безопасный режим по умолчанию.
    console.error('Не удалось прочитать сохранённый режим отображения задач.', error);
    return 'board';
  }
};

const resolveAllowedValue = (allowedValuesSet, value, fallbackValue) => (
  allowedValuesSet.has(value) ? value : fallbackValue
);

const clampInteger = (value, minValue, maxValue, fallbackValue = minValue) => {
  const parsedValue = Number.parseInt(String(value ?? ''), 10);
  if (!Number.isFinite(parsedValue)) {
    return fallbackValue;
  }
  return Math.max(minValue, Math.min(maxValue, parsedValue));
};

const toSafeSingleLineText = (value, maxLength) => {
  if (typeof value !== 'string') {
    return '';
  }

  return value
    .replace(/[\u0000-\u001F\u007F]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, maxLength);
};

const toSafeMultilineText = (value, maxLength) => {
  if (typeof value !== 'string') {
    return '';
  }

  return value
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, '')
    .trim()
    .slice(0, maxLength);
};

const normalizeDueDateInput = (value) => {
  if (typeof value !== 'string') {
    return '';
  }

  const trimmedValue = value.trim();
  if (!trimmedValue) {
    return '';
  }

  if (!DATE_INPUT_PATTERN.test(trimmedValue)) {
    return '';
  }

  const [year, month, day] = trimmedValue.split('-').map((part) => Number.parseInt(part, 10));
  const candidateDate = new Date(year, month - 1, day);
  const isValidDate = (
    candidateDate.getFullYear() === year
    && candidateDate.getMonth() === month - 1
    && candidateDate.getDate() === day
  );

  return isValidDate ? trimmedValue : '';
};

const normalizeIssueStatus = (statusValue, fallbackStatus = 'To Do') => (
  resolveAllowedValue(ISSUE_STATUSES_SET, statusValue, fallbackStatus)
);

const normalizeIssueFormData = (formData, fallbackIssue = null, defaultTitle = 'Issue') => {
  const fallbackTitle = toSafeSingleLineText(fallbackIssue?.title, MAX_TITLE_LENGTH) || defaultTitle;

  return {
    title: toSafeSingleLineText(formData?.title, MAX_TITLE_LENGTH) || fallbackTitle,
    description: toSafeMultilineText(formData?.description, MAX_DESCRIPTION_LENGTH),
    type: resolveAllowedValue(
      ISSUE_TYPES_SET,
      formData?.type,
      resolveAllowedValue(ISSUE_TYPES_SET, fallbackIssue?.type, 'Task')
    ),
    priority: resolveAllowedValue(
      ISSUE_PRIORITIES_SET,
      formData?.priority,
      resolveAllowedValue(ISSUE_PRIORITIES_SET, fallbackIssue?.priority, 'Low')
    ),
    storyPoints: clampInteger(formData?.storyPoints, 0, 100, clampInteger(fallbackIssue?.storyPoints, 0, 100, 0)),
    dueDate: normalizeDueDateInput(formData?.dueDate),
    assignee: toSafeSingleLineText(formData?.assignee, MAX_ASSIGNEE_LENGTH)
  };
};

const normalizeStoredComment = (comment, issueId, index) => {
  const text = toSafeMultilineText(comment?.text, MAX_COMMENT_LENGTH);
  if (!text) {
    return null;
  }

  const createdAtRaw = typeof comment?.createdAt === 'string' ? comment.createdAt : '';
  const createdAtTimestamp = Date.parse(createdAtRaw);
  const createdAt = Number.isNaN(createdAtTimestamp)
    ? new Date().toISOString()
    : new Date(createdAtTimestamp).toISOString();

  return {
    id: toSafeSingleLineText(comment?.id, 48) || `${issueId}-CMT-${index + 1}`,
    text,
    author: toSafeSingleLineText(comment?.author, MAX_ASSIGNEE_LENGTH) || 'Admin',
    createdAt
  };
};

const normalizeStoredIssue = (issue, index) => {
  const issueId = toSafeSingleLineText(issue?.id, 32) || `PROJ-${index + 1}`;
  const relatedIds = Array.isArray(issue?.relatesTo) ? issue.relatesTo : [];
  const safeRelatesTo = Array.from(
    new Set(
      relatedIds
        .map((relatedId) => toSafeSingleLineText(relatedId, 32))
        .filter((relatedId) => relatedId && relatedId !== issueId)
    )
  ).slice(0, 50);
  const comments = (Array.isArray(issue?.comments) ? issue.comments : [])
    .map((comment, commentIndex) => normalizeStoredComment(comment, issueId, commentIndex))
    .filter(Boolean)
    .slice(-300);

  return {
    id: issueId,
    title: toSafeSingleLineText(issue?.title, MAX_TITLE_LENGTH) || issueId,
    description: toSafeMultilineText(issue?.description, MAX_DESCRIPTION_LENGTH),
    type: resolveAllowedValue(ISSUE_TYPES_SET, issue?.type, 'Task'),
    priority: resolveAllowedValue(ISSUE_PRIORITIES_SET, issue?.priority, 'Low'),
    status: normalizeIssueStatus(issue?.status, 'To Do'),
    assignee: toSafeSingleLineText(issue?.assignee, MAX_ASSIGNEE_LENGTH),
    reporter: toSafeSingleLineText(issue?.reporter, MAX_ASSIGNEE_LENGTH) || 'Admin',
    storyPoints: clampInteger(issue?.storyPoints, 0, 100, 0),
    dueDate: normalizeDueDateInput(issue?.dueDate),
    sprintId: toSafeSingleLineText(issue?.sprintId, 24) || null,
    epicId: toSafeSingleLineText(issue?.epicId, 24) || null,
    comments,
    relatesTo: safeRelatesTo
  };
};

const extractIssueNumber = (issueId) => {
  const match = /^PROJ-(\d+)$/i.exec(issueId);
  return match ? Number.parseInt(match[1], 10) : 0;
};

const normalizeStoredData = (parsedData) => {
  const fallbackData = seedData();
  const parsedIssues = Array.isArray(parsedData?.issues) ? parsedData.issues.slice(0, 2000) : [];
  const issues = parsedIssues.map((issue, index) => normalizeStoredIssue(issue, index));

  const sprintSource = typeof parsedData?.sprint === 'object' && parsedData.sprint
    ? parsedData.sprint
    : fallbackData.sprint;
  const sprint = {
    ...fallbackData.sprint,
    id: toSafeSingleLineText(sprintSource.id, 24) || fallbackData.sprint.id,
    name: toSafeSingleLineText(sprintSource.name, 80) || fallbackData.sprint.name,
    goal: toSafeMultilineText(sprintSource.goal, 240) || fallbackData.sprint.goal,
    startDate: normalizeDueDateInput(sprintSource.startDate) || fallbackData.sprint.startDate,
    endDate: normalizeDueDateInput(sprintSource.endDate) || fallbackData.sprint.endDate,
    isActive: Boolean(sprintSource.isActive)
  };

  const epicsSource = Array.isArray(parsedData?.epics) ? parsedData.epics.slice(0, 50) : fallbackData.epics;
  const epics = epicsSource
    .map((epic, index) => {
      const color = typeof epic?.color === 'string' && /^#[0-9A-Fa-f]{6}$/.test(epic.color)
        ? epic.color
        : '#000000';

      return {
        id: toSafeSingleLineText(epic?.id, 24) || `E-${index + 1}`,
        title: toSafeSingleLineText(epic?.title, 80) || `Epic ${index + 1}`,
        color
      };
    })
    .filter((epic) => epic.id && epic.title);

  const safeEpics = epics.length > 0 ? epics : fallbackData.epics;
  const fallbackEpicId = safeEpics[0]?.id ?? 'E-1';
  const normalizedIssues = issues.map((issue) => ({
    ...issue,
    epicId: issue.epicId || fallbackEpicId,
    sprintId: issue.sprintId && issue.sprintId === sprint.id ? sprint.id : issue.sprintId
  }));

  const maxIssueNumber = normalizedIssues.reduce((maxValue, issue) => (
    Math.max(maxValue, extractIssueNumber(issue.id))
  ), 0);
  const parsedLastId = Number.parseInt(parsedData?.lastId, 10);
  const lastId = Number.isFinite(parsedLastId)
    ? Math.max(parsedLastId, maxIssueNumber)
    : Math.max(fallbackData.lastId, maxIssueNumber);

  return {
    epics: safeEpics,
    sprint,
    issues: normalizedIssues,
    lastId
  };
};

const formatCommentDate = (isoDate, language) => {
  if (!isoDate) {
    return '';
  }

  try {
    const locale = language === 'ru' ? 'ru-RU' : 'en-US';
    return new Date(isoDate).toLocaleString(locale, {
      dateStyle: 'short',
      timeStyle: 'short'
    });
  } catch (error) {
    // Если дата повреждена, показываем исходное значение как безопасный fallback.
    return String(isoDate);
  }
};

const startOfLocalDay = (dateValue) => {
  const date = new Date(dateValue);
  return new Date(date.getFullYear(), date.getMonth(), date.getDate(), 12, 0, 0, 0);
};

const parseLocalDate = (dateString) => {
  if (typeof dateString !== 'string' || !dateString) {
    return null;
  }

  const parts = dateString.split('-').map((part) => Number.parseInt(part, 10));
  if (parts.length !== 3 || parts.some((part) => Number.isNaN(part))) {
    return null;
  }

  const [year, month, day] = parts;
  return new Date(year, month - 1, day, 12, 0, 0, 0);
};

const addDays = (dateValue, days) => {
  const date = startOfLocalDay(dateValue);
  date.setDate(date.getDate() + days);
  return date;
};

const dateDiffInDays = (fromDate, toDate) => {
  const start = startOfLocalDay(fromDate).getTime();
  const end = startOfLocalDay(toDate).getTime();
  return Math.round((end - start) / (24 * 60 * 60 * 1000));
};

const toDateKey = (dateValue) => {
  const date = startOfLocalDay(dateValue);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const SELECT_ARROW_ICON = 'data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%2212%22 height=%228%22 viewBox=%220 0 12 8%22 fill=%22none%22%3E%3Cpath d=%22M1 1.5L6 6.5L11 1.5%22 stroke=%22%23000000%22 stroke-width=%221.6%22 stroke-linecap=%22round%22 stroke-linejoin=%22round%22/%3E%3C/svg%3E';

const getSelectStyle = (overrides = {}) => ({
  padding: '10px 40px 10px 16px',
  border: '1px solid var(--border-color)',
  borderRadius: 'var(--radius-lg)',
  fontSize: '14px',
  outline: 'none',
  backgroundColor: 'white',
  color: 'var(--text-color)',
  fontFamily: 'inherit',
  cursor: 'pointer',
  appearance: 'none',
  WebkitAppearance: 'none',
  MozAppearance: 'none',
  backgroundImage: `url("${SELECT_ARROW_ICON}")`,
  backgroundRepeat: 'no-repeat',
  backgroundPosition: 'right 14px center',
  backgroundSize: '12px 8px',
  transition: 'border-color 0.2s, box-shadow 0.2s',
  ...overrides
});

const customStyles = {
  root: {
    '--bg-color': '#FFFFFF',
    '--text-color': '#000000',
    '--accent-color': '#EFEF00',
    '--border-color': '#E0E0E0',
    '--radius-lg': '24px',
    '--radius-sm': '8px',
    '--spacing-unit': '8px',
    '--font-main': "'Helvetica Neue', Helvetica, Arial, sans-serif"
  }
};

const escapeCsvCell = (value) => {
  const cell = String(value ?? '');
  const hasFormulaPrefix = CSV_FORMULA_PREFIXES.some((prefix) => cell.startsWith(prefix));
  // Защищаем CSV от формульных инъекций и экранируем кавычки по стандарту CSV.
  const safeCell = hasFormulaPrefix ? `'${cell}` : cell;
  return `"${safeCell.replaceAll('"', '""')}"`;
};

const seedData = () => {
  const epics = [
    { id: 'E-1', title: 'Design System', color: '#000000' },
    { id: 'E-2', title: 'Backend API', color: '#EFEF00' }
  ];
  
  const sprint = {
    id: 'S-1',
    name: 'Sprint Alpha',
    goal: 'Implement core functionality',
    startDate: '2023-10-01',
    endDate: '2023-10-14',
    isActive: true
  };

  const issues = [];

  for (let i = 1; i <= 15; i++) {
    issues.push({
      id: `PROJ-${i}`,
      title: `Sample Issue ${i} - ${Math.random().toString(36).substring(7)}`,
      description: 'This is a detailed description of the task.',
      type: ISSUE_TYPES[Math.floor(Math.random() * ISSUE_TYPES.length)],
      priority: ISSUE_PRIORITIES[Math.floor(Math.random() * ISSUE_PRIORITIES.length)],
      status: ISSUE_STATUSES[Math.floor(Math.random() * ISSUE_STATUSES.length)],
      assignee: i % 3 === 0 ? 'Alex' : (i % 2 === 0 ? 'Maria' : 'John'),
      reporter: 'Admin',
      storyPoints: Math.floor(Math.random() * 8) + 1,
      dueDate: new Date(Date.now() + (Math.random() * 10 - 5) * 86400000).toISOString().split('T')[0],
      sprintId: i < 10 ? 'S-1' : null,
      epicId: i % 2 === 0 ? 'E-1' : 'E-2',
      comments: [],
      relatesTo: []
    });
  }

  return { epics, sprint, issues, lastId: 15 };
};

const Header = ({ language, onLanguageChange, t }) => {
  const getNavLinkStyle = ({ isActive }) => ({
    textDecoration: 'none',
    color: 'var(--text-color)',
    fontWeight: isActive ? 600 : 400,
    padding: '8px 14px',
    borderRadius: '999px',
    background: isActive ? 'rgba(0, 0, 0, 0.06)' : 'transparent',
    transition: 'background 0.2s'
  });

  return (
    <header style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      flexWrap: 'wrap',
      gap: '10px 24px',
      padding: '24px 40px',
      borderBottom: '1px solid var(--border-color)',
      position: 'sticky',
      top: 0,
      background: 'var(--bg-color)',
      zIndex: 100
    }}>
      <div style={{
        fontSize: '1.5rem',
        fontWeight: 500,
        letterSpacing: '-0.03em'
      }}>Capitask</div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px 24px', flexWrap: 'wrap' }}>
        <nav style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          <NavLink to="/" end style={getNavLinkStyle}>{t.issuesNav}</NavLink>
          <NavLink to="/sprint" style={getNavLinkStyle}>{t.activeSprintNav}</NavLink>
          <NavLink to="/gantt" style={getNavLinkStyle}>{t.ganttNav}</NavLink>
        </nav>
        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px' }}>
          <span>{t.language}</span>
          <select
            value={language}
            onChange={(event) => onLanguageChange(event.target.value)}
            style={getSelectStyle({
              padding: '8px 36px 8px 12px',
              borderRadius: '10px',
              minWidth: '130px',
              backgroundPosition: 'right 10px center'
            })}
          >
            <option value="en">{t.languageNames.en}</option>
            <option value="ru">{t.languageNames.ru}</option>
          </select>
        </label>
      </div>
    </header>
  );
};

const Modal = ({ isOpen, onClose, title, children, width = '600px' }) => {
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
    }
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(255, 255, 255, 0.9)',
      backdropFilter: 'blur(5px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      opacity: isOpen ? 1 : 0,
      pointerEvents: isOpen ? 'all' : 'none',
      transition: 'opacity 0.2s'
    }}
    onMouseDown={(event) => {
      // Закрываем окно по клику в свободную область затемнения.
      if (event.target === event.currentTarget) {
        onClose();
      }
    }}>
      <div
        className="modal-scroll-hidden"
        style={{
          background: 'white',
          width,
          maxWidth: '95vw',
          maxHeight: '86vh',
          overflowY: 'auto',
          border: '1px solid var(--text-color)',
          borderRadius: 'var(--radius-lg)',
          padding: '40px',
          boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
          position: 'relative'
        }}
        onMouseDown={(event) => {
          // Останавливаем всплытие, чтобы клик внутри окна не закрывал модалку.
          event.stopPropagation();
        }}>
        <span onClick={onClose} style={{
          position: 'absolute',
          top: '24px',
          right: '24px',
          fontSize: '24px',
          cursor: 'pointer'
        }}>×</span>
        <h2 style={{ fontSize: '1.5rem', marginBottom: '16px' }}>{title}</h2>
        {children}
      </div>
    </div>
  );
};

const Card = ({ issue, onClick, onDragStart, onDragEnd, t }) => {
  return (
    <div
      draggable
      onClick={onClick}
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      style={{
        background: 'var(--bg-color)',
        border: '1px solid var(--border-color)',
        borderRadius: '12px',
        padding: '20px',
        marginBottom: '12px',
        cursor: 'grab',
        transition: 'box-shadow 0.2s, border-color 0.2s',
        position: 'relative'
      }}
      onMouseOver={(e) => {
        e.currentTarget.style.borderColor = 'var(--text-color)';
        e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.05)';
      }}
      onMouseOut={(e) => {
        e.currentTarget.style.borderColor = 'var(--border-color)';
        e.currentTarget.style.boxShadow = 'none';
      }}
    >
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        marginBottom: '8px',
        fontSize: '12px',
        color: '#666'
      }}>
        <span>{issue.id}</span>
        <span>{getTranslatedLabel(t.priorityLabels, issue.priority)}</span>
      </div>
      <div style={{
        fontSize: '16px',
        fontWeight: 500,
        marginBottom: '12px',
        lineHeight: '1.3'
      }}>{issue.title}</div>
      <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
        <span style={{
          padding: '4px 10px',
          borderRadius: '12px',
          fontSize: '11px',
          background: 'var(--text-color)',
          color: 'white',
          textTransform: 'uppercase',
          letterSpacing: '0.05em'
        }}>{issue.epicId}</span>
        {issue.sprintId && (
          <span style={{
            padding: '4px 10px',
            borderRadius: '12px',
            fontSize: '11px',
            background: 'var(--accent-color)',
            color: 'black',
            textTransform: 'uppercase',
            letterSpacing: '0.05em'
          }}>{t.sprintTag}</span>
        )}
      </div>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: '12px',
        fontSize: '12px'
      }}>
        <div style={{
          width: '24px',
          height: '24px',
          borderRadius: '50%',
          background: '#000',
          color: '#fff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '10px'
        }} title={issue.assignee}>{issue.assignee.charAt(0)}</div>
        <span>{issue.storyPoints} {t.pointsShort}</span>
      </div>
    </div>
  );
};

const renderMarkdownPreview = (text) => {
  const source = toSafeMultilineText(text, MAX_DESCRIPTION_LENGTH);
  const lines = source.split('\n');
  const blocks = [];
  let index = 0;

  while (index < lines.length) {
    const rawLine = lines[index];
    const trimmedLine = rawLine.trim();

    if (!trimmedLine) {
      index += 1;
      continue;
    }

    if (trimmedLine.startsWith('```')) {
      index += 1;
      const codeLines = [];
      while (index < lines.length && !lines[index].trim().startsWith('```')) {
        codeLines.push(lines[index]);
        index += 1;
      }
      if (index < lines.length && lines[index].trim().startsWith('```')) {
        index += 1;
      }
      blocks.push({ type: 'code', content: codeLines.join('\n') });
      continue;
    }

    if (trimmedLine.startsWith('- ')) {
      const items = [];
      while (index < lines.length && lines[index].trim().startsWith('- ')) {
        items.push(lines[index].trim().slice(2));
        index += 1;
      }
      blocks.push({ type: 'list', items });
      continue;
    }

    if (trimmedLine.startsWith('### ')) {
      blocks.push({ type: 'h3', content: trimmedLine.slice(4) });
      index += 1;
      continue;
    }

    if (trimmedLine.startsWith('## ')) {
      blocks.push({ type: 'h2', content: trimmedLine.slice(3) });
      index += 1;
      continue;
    }

    if (trimmedLine.startsWith('# ')) {
      blocks.push({ type: 'h1', content: trimmedLine.slice(2) });
      index += 1;
      continue;
    }

    const paragraph = [];
    while (index < lines.length) {
      const lineText = lines[index].trim();
      if (!lineText || lineText.startsWith('#') || lineText.startsWith('- ') || lineText.startsWith('```')) {
        break;
      }
      paragraph.push(lineText);
      index += 1;
    }
    blocks.push({ type: 'paragraph', content: paragraph.join(' ') });
  }

  return blocks;
};

const renderInlineMarkdown = (text) => {
  const safeText = toSafeMultilineText(text, MAX_DESCRIPTION_LENGTH);
  const result = [];
  const inlineCodePattern = /`([^`]+)`/g;
  let lastIndex = 0;
  let match = inlineCodePattern.exec(safeText);

  while (match) {
    if (match.index > lastIndex) {
      result.push(safeText.slice(lastIndex, match.index));
    }

    result.push(
      <code key={`code-${match.index}`} style={{
        background: '#F2F4F7',
        border: '1px solid #DEE3EA',
        borderRadius: '6px',
        padding: '1px 6px',
        fontFamily: "'SFMono-Regular', Menlo, Monaco, Consolas, monospace",
        fontSize: '0.92em'
      }}>{match[1]}</code>
    );

    lastIndex = match.index + match[0].length;
    match = inlineCodePattern.exec(safeText);
  }

  if (lastIndex < safeText.length) {
    result.push(safeText.slice(lastIndex));
  }

  return result;
};

const MarkdownPreview = ({ description, t }) => {
  const blocks = renderMarkdownPreview(description);

  if (blocks.length === 0) {
    return <div style={{ color: '#6B778C', fontSize: '14px' }}>{t.markdownPreviewEmpty}</div>;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      {blocks.map((block, blockIndex) => {
        if (block.type === 'code') {
          return (
            <pre key={`md-${blockIndex}`} style={{
              background: '#1F2937',
              color: '#E5E7EB',
              borderRadius: '10px',
              padding: '14px',
              fontSize: '13px',
              overflowX: 'auto',
              lineHeight: 1.5,
              border: '1px solid #111827'
            }}>
              <code>{block.content}</code>
            </pre>
          );
        }

        if (block.type === 'list') {
          return (
            <ul key={`md-${blockIndex}`} style={{ paddingLeft: '20px', color: '#2E3A4D', lineHeight: 1.5 }}>
              {block.items.map((item, itemIndex) => (
                <li key={`md-item-${blockIndex}-${itemIndex}`}>{renderInlineMarkdown(item)}</li>
              ))}
            </ul>
          );
        }

        const content = renderInlineMarkdown(block.content);
        if (block.type === 'h1') {
          return <h1 key={`md-${blockIndex}`} style={{ fontSize: '24px', letterSpacing: '-0.01em' }}>{content}</h1>;
        }

        if (block.type === 'h2') {
          return <h2 key={`md-${blockIndex}`} style={{ fontSize: '20px', letterSpacing: '-0.01em' }}>{content}</h2>;
        }

        if (block.type === 'h3') {
          return <h3 key={`md-${blockIndex}`} style={{ fontSize: '16px' }}>{content}</h3>;
        }

        return (
          <p key={`md-${blockIndex}`} style={{ color: '#2E3A4D', lineHeight: 1.6 }}>
            {content}
          </p>
        );
      })}
    </div>
  );
};

const IssueNotesSidebar = ({ issue, formData, t, relationCandidateId, setRelationCandidateId, onAddRelation, onRemoveRelation, issues }) => {
  if (!issue) {
    return (
      <aside style={{
        background: '#F7F8FB',
        border: '1px solid #E6E8EE',
        borderRadius: '14px',
        padding: '16px',
        alignSelf: 'start',
        color: '#5E6C84'
      }}>
        {t.availableAfterCreate}
      </aside>
    );
  }

  const relatedIssueIds = Array.isArray(issue.relatesTo) ? issue.relatesTo : [];
  const relatedIssues = relatedIssueIds
    .map((issueId) => issues.find((candidate) => candidate.id === issueId))
    .filter(Boolean);

  const relationCandidates = issues.filter((candidate) => candidate.id !== issue.id && !relatedIssueIds.includes(candidate.id));

  return (
    <aside style={{
      background: '#F7F8FB',
      border: '1px solid #E6E8EE',
      borderRadius: '14px',
      padding: '18px',
      display: 'flex',
      flexDirection: 'column',
      gap: '16px',
      alignSelf: 'start',
      position: 'sticky',
      top: '8px'
    }}>
      <h3 style={{ fontSize: '13px', letterSpacing: '0.06em', textTransform: 'uppercase', color: '#344563' }}>{t.issueNotes}</h3>

      <div style={{ display: 'grid', gap: '8px' }}>
        {[ 
          [t.type, getTranslatedLabel(t.typeLabels, formData.type)],
          [t.priority, getTranslatedLabel(t.priorityLabels, formData.priority)],
          [t.storyPoints, String(formData.storyPoints)],
          [t.dueDate, formData.dueDate || '—'],
          [t.assignee, formData.assignee || '—']
        ].map(([label, value]) => (
          <div key={label} style={{ display: 'flex', justifyContent: 'space-between', gap: '8px', fontSize: '13px' }}>
            <span style={{ color: '#6B778C' }}>{label}</span>
            <span style={{ color: '#172B4D', fontWeight: 500, textAlign: 'right' }}>{value}</span>
          </div>
        ))}
      </div>

      <div style={{ borderTop: '1px solid #E2E6ED', paddingTop: '14px' }}>
        <div style={{ fontSize: '12px', marginBottom: '8px', letterSpacing: '0.05em', textTransform: 'uppercase', color: '#6B778C' }}>{t.linkedIssues}</div>
        <div style={{ display: 'flex', gap: '8px', marginBottom: '10px' }}>
          <select
            value={relationCandidateId}
            onChange={(event) => setRelationCandidateId(event.target.value)}
            style={getSelectStyle({ width: '100%', padding: '8px 34px 8px 10px', borderRadius: '8px', fontSize: '13px' })}
          >
            <option value="">—</option>
            {relationCandidates.map((candidate) => (
              <option key={candidate.id} value={candidate.id}>{candidate.id} · {candidate.title}</option>
            ))}
          </select>
          <button
            type="button"
            onClick={onAddRelation}
            disabled={!relationCandidateId}
            style={{
              border: '1px solid #C3CCD9',
              borderRadius: '8px',
              padding: '0 12px',
              fontSize: '13px',
              color: relationCandidateId ? '#172B4D' : '#9AA5B1',
              background: '#fff',
              cursor: relationCandidateId ? 'pointer' : 'not-allowed'
            }}
          >
            {t.addLink}
          </button>
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
          {relatedIssues.length === 0 ? (
            <span style={{ color: '#6B778C', fontSize: '13px' }}>{t.noRelatedIssues}</span>
          ) : (
            relatedIssues.map((relatedIssue) => (
              <button
                key={relatedIssue.id}
                type="button"
                onClick={() => onRemoveRelation(relatedIssue.id)}
                style={{
                  border: '1px solid #C3CCD9',
                  background: '#fff',
                  borderRadius: '999px',
                  padding: '6px 10px',
                  fontSize: '12px',
                  color: '#344563'
                }}
                title={relatedIssue.title}
              >
                {relatedIssue.id} ×
              </button>
            ))
          )}
        </div>
      </div>
    </aside>
  );
};

const IssueCommentsSection = ({ issue, commentDraft, setCommentDraft, onAddComment, t, language }) => {
  if (!issue) {
    return null;
  }

  const issueComments = Array.isArray(issue.comments) ? issue.comments : [];
  const safeCommentDraft = toSafeMultilineText(commentDraft, MAX_COMMENT_LENGTH);

  return (
    <section style={{ marginTop: '24px', borderTop: '1px solid #DFE1E6', paddingTop: '20px' }}>
      <h3 style={{ fontSize: '15px', marginBottom: '10px', color: '#172B4D' }}>{t.comments}</h3>
      <textarea
        rows="4"
        value={commentDraft}
        placeholder={t.commentPlaceholder}
        onChange={(event) => setCommentDraft(event.target.value)}
        style={{
          width: '100%',
          border: '1px solid #C8D0DC',
          borderRadius: '10px',
          padding: '10px 12px',
          fontFamily: 'inherit',
          resize: 'vertical',
          minHeight: '96px',
          marginBottom: '10px'
        }}
      />
      <button
        type="button"
        onClick={onAddComment}
        disabled={!safeCommentDraft}
        style={{
          border: '1px solid #C3CCD9',
          borderRadius: '8px',
          padding: '8px 12px',
          background: '#fff',
          color: safeCommentDraft ? '#172B4D' : '#9AA5B1',
          cursor: safeCommentDraft ? 'pointer' : 'not-allowed',
          marginBottom: '14px'
        }}
      >
        {t.addComment}
      </button>

      {issueComments.length === 0 ? (
        <div style={{ color: '#6B778C', fontSize: '13px' }}>{t.noComments}</div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {issueComments.map((comment) => (
            <article key={comment.id} style={{ border: '1px solid #E2E6ED', borderRadius: '10px', padding: '10px 12px', background: '#FAFBFD' }}>
              <div style={{ fontSize: '11px', color: '#6B778C', marginBottom: '4px' }}>
                {comment.author} · {formatCommentDate(comment.createdAt, language)}
              </div>
              <div style={{ fontSize: '13px', whiteSpace: 'pre-wrap', wordBreak: 'break-word', color: '#253858' }}>{comment.text}</div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
};

const IssuesPage = ({ data, setData, t, language }) => {
  const [viewMode, setViewMode] = useState(() => getInitialIssuesViewMode());
  const [searchInput, setSearchInput] = useState('');
  const [filterType, setFilterType] = useState('');
  const [filterPriority, setFilterPriority] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingIssue, setEditingIssue] = useState(null);
  const [draggedItem, setDraggedItem] = useState(null);
  const [dragOverColumn, setDragOverColumn] = useState(null);
  const [showCapybaraEasterEgg, setShowCapybaraEasterEgg] = useState(false);
  const [relationCandidateId, setRelationCandidateId] = useState('');
  const [commentDraft, setCommentDraft] = useState('');
  const listEndRef = useRef(null);
  const [searchParams, setSearchParams] = useSearchParams();

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'Task',
    priority: 'Low',
    storyPoints: 0,
    dueDate: '',
    assignee: ''
  });

  const getFilteredIssues = () => {
    let issues = data.issues;
    
    if (searchInput) {
      issues = issues.filter(i => 
        i.title.toLowerCase().includes(searchInput.toLowerCase()) || 
        i.id.toLowerCase().includes(searchInput.toLowerCase())
      );
    }

    if (filterType) {
      issues = issues.filter(i => i.type === filterType);
    }

    if (filterPriority) {
      issues = issues.filter(i => i.priority === filterPriority);
    }

    return issues;
  };

  const clearIssueQueryParam = () => {
    if (!searchParams.has('issue')) {
      return;
    }

    const nextParams = new URLSearchParams(searchParams);
    nextParams.delete('issue');
    setSearchParams(nextParams, { replace: true });
  };

  const openModal = (issue = null, options = {}) => {
    const { keepIssueQuery = false } = options;
    if (!keepIssueQuery) {
      clearIssueQueryParam();
    }

    setRelationCandidateId('');
    setCommentDraft('');

    if (issue) {
      setEditingIssue(issue);
      setFormData({
        title: issue.title,
        description: issue.description,
        type: issue.type,
        priority: issue.priority,
        storyPoints: issue.storyPoints,
        dueDate: issue.dueDate,
        assignee: issue.assignee
      });
    } else {
      setEditingIssue(null);
      setFormData({
        title: '',
        description: '',
        type: 'Task',
        priority: 'Low',
        storyPoints: 0,
        dueDate: '',
        assignee: ''
      });
    }
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingIssue(null);
    setRelationCandidateId('');
    setCommentDraft('');
    clearIssueQueryParam();
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    const safeFormData = normalizeIssueFormData(formData, editingIssue, t.defaultIssueTitle);

    if (editingIssue) {
      const updatedIssues = data.issues.map(i => 
        i.id === editingIssue.id ? { ...i, ...safeFormData } : i
      );
      setData({ ...data, issues: updatedIssues });
    } else {
      const nextIssueId = clampInteger(data.lastId, 0, 999999, 0) + 1;
      const newIssue = {
        ...safeFormData,
        id: `PROJ-${nextIssueId}`,
        status: 'To Do',
        sprintId: 'S-1',
        epicId: 'E-1',
        reporter: 'Admin',
        comments: [],
        relatesTo: []
      };
      setData({
        ...data,
        issues: [...data.issues, newIssue],
        lastId: nextIssueId
      });
    }
    
    closeModal();
  };

  const handleDragStart = (issue) => {
    setDraggedItem(issue);
  };

  const handleDragEnd = () => {
    setDraggedItem(null);
    setDragOverColumn(null);
  };

  const handleDrop = (status) => {
    const safeStatus = normalizeIssueStatus(status, draggedItem?.status || 'To Do');
    if (draggedItem && draggedItem.status !== safeStatus) {
      const updatedIssues = data.issues.map(i =>
        i.id === draggedItem.id ? { ...i, status: safeStatus } : i
      );
      setData({ ...data, issues: updatedIssues });
    }
    setDragOverColumn(null);
  };

  const updateIssueRelations = (targetIssueId, shouldLink) => {
    if (!currentIssue || !targetIssueId || targetIssueId === currentIssue.id) {
      return;
    }

    setData((previousData) => {
      let hasChanges = false;
      const updatedIssues = previousData.issues.map((candidate) => {
        const candidateRelations = Array.isArray(candidate.relatesTo) ? candidate.relatesTo : [];

        if (candidate.id === currentIssue.id) {
          if (shouldLink && !candidateRelations.includes(targetIssueId)) {
            hasChanges = true;
            return { ...candidate, relatesTo: [...candidateRelations, targetIssueId] };
          }
          if (!shouldLink && candidateRelations.includes(targetIssueId)) {
            hasChanges = true;
            return { ...candidate, relatesTo: candidateRelations.filter((id) => id !== targetIssueId) };
          }
        }

        if (candidate.id === targetIssueId) {
          if (shouldLink && !candidateRelations.includes(currentIssue.id)) {
            hasChanges = true;
            return { ...candidate, relatesTo: [...candidateRelations, currentIssue.id] };
          }
          if (!shouldLink && candidateRelations.includes(currentIssue.id)) {
            hasChanges = true;
            return { ...candidate, relatesTo: candidateRelations.filter((id) => id !== currentIssue.id) };
          }
        }

        return candidate;
      });

      return hasChanges ? { ...previousData, issues: updatedIssues } : previousData;
    });
  };

  const handleAddRelation = () => {
    if (!relationCandidateId) {
      return;
    }
    updateIssueRelations(relationCandidateId, true);
    setRelationCandidateId('');
  };

  const handleRemoveRelation = (targetIssueId) => {
    updateIssueRelations(targetIssueId, false);
  };

  const handleAddComment = () => {
    if (!currentIssue) {
      return;
    }

    const normalizedText = toSafeMultilineText(commentDraft, MAX_COMMENT_LENGTH);
    if (!normalizedText) {
      return;
    }

    const newComment = {
      id: `CMT-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      text: normalizedText,
      author: 'Admin',
      createdAt: new Date().toISOString()
    };

    setData((previousData) => ({
      ...previousData,
      issues: previousData.issues.map((candidate) => {
        if (candidate.id !== currentIssue.id) {
          return candidate;
        }

        const existingComments = Array.isArray(candidate.comments) ? candidate.comments : [];
        return { ...candidate, comments: [...existingComments, newComment] };
      })
    }));

    setCommentDraft('');
  };

  const filteredIssues = getFilteredIssues();
  const todoIssues = filteredIssues.filter(i => i.status === 'To Do');
  const progressIssues = filteredIssues.filter(i => i.status === 'In Progress');
  const doneIssues = filteredIssues.filter(i => i.status === 'Done');
  const hasActiveFilters = Boolean(filterType || filterPriority);
  const currentIssue = editingIssue
    ? data.issues.find((candidate) => candidate.id === editingIssue.id) || editingIssue
    : null;

  useEffect(() => {
    if (viewMode !== 'list' || filteredIssues.length === 0) {
      setShowCapybaraEasterEgg(false);
      return undefined;
    }

    const target = listEndRef.current;
    if (!target) {
      return undefined;
    }

    // Следим за концом списка в viewport браузера, чтобы скролл оставался глобальным.
    const observer = new IntersectionObserver(
      ([entry]) => {
        setShowCapybaraEasterEgg(entry.isIntersecting);
      },
      { threshold: 0 }
    );

    observer.observe(target);

    return () => observer.disconnect();
  }, [viewMode, filteredIssues.length, searchInput, filterType, filterPriority]);

  useEffect(() => {
    try {
      localStorage.setItem(ISSUES_VIEW_MODE_STORAGE_KEY, viewMode);
    } catch (error) {
      // Не прерываем работу страницы, если запись в localStorage недоступна.
      console.error('Не удалось сохранить режим отображения задач.', error);
    }
  }, [viewMode]);

  useEffect(() => {
    const issueIdFromQuery = searchParams.get('issue');
    if (!issueIdFromQuery) {
      return;
    }

    const issueFromQuery = data.issues.find((candidate) => candidate.id === issueIdFromQuery);
    if (!issueFromQuery) {
      return;
    }

    if (modalOpen && editingIssue?.id === issueFromQuery.id) {
      return;
    }

    // Открываем задачу из URL, когда переходим из диаграммы Ганта.
    openModal(issueFromQuery, { keepIssueQuery: true });
  }, [searchParams, data.issues, modalOpen, editingIssue?.id]);

  return (
    <main style={{ padding: '40px', maxWidth: '1600px', margin: '0 auto' }}>
      <h1 style={{ fontSize: '3rem', marginBottom: '24px', lineHeight: 1, fontWeight: 500, letterSpacing: '-0.02em' }}>
        {t.backlog} <span style={{ fontSize: '0.6em', verticalAlign: 'super', marginLeft: '2px', fontWeight: 400 }}>{filteredIssues.length}</span>
      </h1>
      
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '40px',
        flexWrap: 'wrap',
        gap: '16px'
      }}>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <input
            type="text"
            placeholder={t.searchIssues}
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            style={{
              padding: '10px 16px',
              border: '1px solid var(--border-color)',
              borderRadius: 'var(--radius-lg)',
              fontSize: '14px',
              outline: 'none',
              background: 'white',
              minWidth: '150px'
            }}
          />
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            style={getSelectStyle({ minWidth: '150px' })}
          >
            <option value="">{t.allTypes}</option>
            <option value="Task">{getTranslatedLabel(t.typeLabels, 'Task')}</option>
            <option value="Bug">{getTranslatedLabel(t.typeLabels, 'Bug')}</option>
            <option value="Story">{getTranslatedLabel(t.typeLabels, 'Story')}</option>
          </select>
          <select
            value={filterPriority}
            onChange={(e) => setFilterPriority(e.target.value)}
            style={getSelectStyle({ minWidth: '150px' })}
          >
            <option value="">{t.allPriorities}</option>
            <option value="High">{getTranslatedLabel(t.priorityLabels, 'High')}</option>
            <option value="Medium">{getTranslatedLabel(t.priorityLabels, 'Medium')}</option>
            <option value="Low">{getTranslatedLabel(t.priorityLabels, 'Low')}</option>
          </select>
          <button
            type="button"
            onClick={() => {
              setFilterType('');
              setFilterPriority('');
            }}
            disabled={!hasActiveFilters}
            style={{
              border: '1px solid var(--border-color)',
              padding: '10px 16px',
              borderRadius: 'var(--radius-lg)',
              fontFamily: 'inherit',
              background: 'none',
              fontSize: '14px',
              color: hasActiveFilters ? 'var(--text-color)' : '#A0A0A0',
              cursor: hasActiveFilters ? 'pointer' : 'not-allowed'
            }}
          >
            {t.resetFilters}
          </button>
        </div>
        <div>
          <button
            onClick={() => setViewMode(viewMode === 'board' ? 'list' : 'board')}
            style={{
              border: '1px solid var(--border-color)',
              padding: '10px 20px',
              borderRadius: 'var(--radius-lg)',
              fontFamily: 'inherit',
              cursor: 'pointer',
              background: 'none',
              fontSize: '1rem'
            }}
          >
            {viewMode === 'board' ? t.switchToList : t.switchToBoard}
          </button>
          <button
            onClick={() => openModal()}
            style={{
              backgroundColor: 'var(--accent-color)',
              color: 'var(--text-color)',
              padding: '12px 24px',
              borderRadius: 'var(--radius-lg)',
              fontWeight: 500,
              border: 'none',
              fontFamily: 'inherit',
              cursor: 'pointer',
              fontSize: '1rem',
              marginLeft: '12px'
            }}
          >
            + {t.createIssue}
          </button>
        </div>
      </div>

      {viewMode === 'board' ? (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '24px',
          height: 'calc(100vh - 200px)'
        }}>
          {[
            { status: 'To Do', issues: todoIssues, count: todoIssues.length },
            { status: 'In Progress', issues: progressIssues, count: progressIssues.length },
            { status: 'Done', issues: doneIssues, count: doneIssues.length }
          ].map(({ status, issues, count }) => (
            <div
              key={status}
              onDragOver={(e) => {
                e.preventDefault();
                setDragOverColumn(status);
              }}
              onDragLeave={() => setDragOverColumn(null)}
              onDrop={(e) => {
                e.preventDefault();
                handleDrop(status);
              }}
              style={{
                background: dragOverColumn === status ? '#F0F0F0' : '#FAFAFA',
                borderRadius: 'var(--radius-lg)',
                padding: '24px',
                display: 'flex',
                flexDirection: 'column',
                transition: 'background 0.2s'
              }}
            >
              <div style={{
                fontSize: '1.5rem',
                marginBottom: '24px',
                paddingBottom: '12px',
                borderBottom: '1px solid var(--border-color)',
                display: 'flex',
                alignItems: 'baseline'
              }}>
                {getTranslatedLabel(t.statusLabels, status)}
                <sup style={{ fontSize: '0.58em', marginLeft: '4px', fontWeight: 400, lineHeight: 1 }}>
                  {count}
                </sup>
              </div>
              <div style={{ flex: 1, overflowY: 'auto', minHeight: '100px' }}>
                {issues.map(issue => (
                  <Card
                    key={issue.id}
                    issue={issue}
                    t={t}
                    onClick={() => openModal(issue)}
                    onDragStart={(e) => {
                      handleDragStart(issue);
                      e.dataTransfer.setData('text/plain', issue.id);
                    }}
                    onDragEnd={handleDragEnd}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: '80px 2fr 1fr 1fr 1fr 80px',
            padding: '12px 24px',
            fontSize: '12px',
            textTransform: 'uppercase',
            borderBottom: '1px solid var(--text-color)',
            fontWeight: 600
          }}>
            <div>{t.key}</div>
            <div>{t.summary}</div>
            <div>{t.priority}</div>
            <div>{t.status}</div>
            <div>{t.assignee}</div>
            <div>{t.due}</div>
          </div>
          <div
            style={{
              borderBottom: '1px solid var(--border-color)'
            }}
          >
            {filteredIssues.map(issue => {
              const isOverdue = new Date(issue.dueDate) < new Date() && issue.status !== 'Done';
              return (
                <div
                  key={issue.id}
                  onClick={() => openModal(issue)}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '80px 2fr 1fr 1fr 1fr 80px',
                    padding: '20px 24px',
                    alignItems: 'center',
                    borderBottom: '1px solid var(--border-color)',
                    cursor: 'pointer',
                    transition: 'background 0.1s'
                  }}
                  onMouseOver={(e) => e.currentTarget.style.background = '#FAFAFA'}
                  onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}
                >
                  <div style={{ fontWeight: 600 }}>{issue.id}</div>
                  <div>{issue.title}</div>
                  <div>
                    <span style={{
                      padding: '4px 10px',
                      borderRadius: '12px',
                      fontSize: '11px',
                      background: '#F0F0F0',
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em'
                    }}>{getTranslatedLabel(t.priorityLabels, issue.priority)}</span>
                  </div>
                  <div>{getTranslatedLabel(t.statusLabels, issue.status)}</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{
                      width: '24px',
                      height: '24px',
                      borderRadius: '50%',
                      background: '#000',
                      color: '#fff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '10px'
                    }}>{issue.assignee.charAt(0)}</div>
                    {issue.assignee}
                  </div>
                  <div style={{ color: isOverdue ? 'red' : 'inherit', fontWeight: isOverdue ? 'bold' : 'normal' }}>
                    {issue.dueDate}
                  </div>
                </div>
              );
            })}
            <div ref={listEndRef} style={{ height: '2px' }} aria-hidden="true" />
            {showCapybaraEasterEgg && filteredIssues.length > 0 && (
              <div style={{
                padding: '24px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '12px'
              }}>
                <div style={{ fontWeight: 500 }}>{t.backlogCompleted}</div>
                <img
                  src="/capibara_chil.png"
                  alt={t.capybaraAlt}
                  style={{ maxWidth: '108px', width: '100%', borderRadius: '12px' }}
                />
              </div>
            )}
          </div>
        </div>
      )}

      <Modal isOpen={modalOpen} onClose={closeModal} title={currentIssue ? `${t.editIssue} ${currentIssue.id}` : t.createIssue} width="1380px">
        <form onSubmit={handleFormSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: '280px minmax(0, 1fr)', gap: '20px', alignItems: 'start' }}>
            <IssueNotesSidebar
              issue={currentIssue}
              formData={formData}
              t={t}
              issues={data.issues}
              relationCandidateId={relationCandidateId}
              setRelationCandidateId={setRelationCandidateId}
              onAddRelation={handleAddRelation}
              onRemoveRelation={handleRemoveRelation}
            />

            <div style={{ border: '1px solid #DFE1E6', borderRadius: '14px', padding: '20px', background: '#FFFFFF' }}>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{t.summary}</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  style={{ width: '100%', padding: '12px', border: '1px solid #C8D0DC', borderRadius: '8px', fontFamily: 'inherit' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: '12px', marginBottom: '16px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{t.type}</label>
                  <select value={formData.type} onChange={(e) => setFormData({ ...formData, type: e.target.value })} style={getSelectStyle({ width: '100%', padding: '10px 40px 10px 12px', borderRadius: '8px' })}>
                    <option value="Task">{getTranslatedLabel(t.typeLabels, 'Task')}</option>
                    <option value="Bug">{getTranslatedLabel(t.typeLabels, 'Bug')}</option>
                    <option value="Story">{getTranslatedLabel(t.typeLabels, 'Story')}</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{t.priority}</label>
                  <select value={formData.priority} onChange={(e) => setFormData({ ...formData, priority: e.target.value })} style={getSelectStyle({ width: '100%', padding: '10px 40px 10px 12px', borderRadius: '8px' })}>
                    <option value="Low">{getTranslatedLabel(t.priorityLabels, 'Low')}</option>
                    <option value="Medium">{getTranslatedLabel(t.priorityLabels, 'Medium')}</option>
                    <option value="High">{getTranslatedLabel(t.priorityLabels, 'High')}</option>
                  </select>
                </div>
              </div>

              <section style={{ marginBottom: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', alignItems: 'baseline' }}>
                  <label style={{ fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{t.description}</label>
                  <span style={{ fontSize: '12px', color: '#6B778C' }}>{t.markdownHelp}</span>
                </div>
                <textarea
                  rows="10"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  style={{ width: '100%', padding: '12px', border: '1px solid #C8D0DC', borderRadius: '10px', fontFamily: 'inherit', minHeight: '220px', resize: 'vertical', marginBottom: '12px' }}
                />
                <div style={{ border: '1px solid #E2E6ED', borderRadius: '10px', padding: '12px', background: '#FBFCFF' }}>
                  <div style={{ fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px', color: '#6B778C' }}>{t.descriptionPreview}</div>
                  <MarkdownPreview description={formData.description} t={t} />
                </div>
              </section>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: '12px', marginBottom: '16px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{t.storyPoints}</label>
                  <input type="number" min="0" value={formData.storyPoints} onChange={(e) => setFormData({ ...formData, storyPoints: parseInt(e.target.value, 10) || 0 })} style={{ width: '100%', padding: '12px', border: '1px solid #C8D0DC', borderRadius: '8px', fontFamily: 'inherit' }} />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{t.dueDate}</label>
                  <input type="date" value={formData.dueDate} onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })} style={{ width: '100%', padding: '12px', border: '1px solid #C8D0DC', borderRadius: '8px', fontFamily: 'inherit' }} />
                </div>
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{t.assignee}</label>
                <input type="text" placeholder={t.assigneePlaceholder} value={formData.assignee} onChange={(e) => setFormData({ ...formData, assignee: e.target.value })} style={{ width: '100%', padding: '12px', border: '1px solid #C8D0DC', borderRadius: '8px', fontFamily: 'inherit' }} />
              </div>

              <div style={{ textAlign: 'right' }}>
                <button type="button" onClick={closeModal} style={{ border: '1px solid var(--border-color)', padding: '10px 20px', borderRadius: 'var(--radius-lg)', fontFamily: 'inherit', cursor: 'pointer', background: 'none', fontSize: '1rem', marginRight: '12px' }}>{t.cancel}</button>
                <button type="submit" style={{ backgroundColor: 'var(--accent-color)', color: 'var(--text-color)', padding: '12px 24px', borderRadius: 'var(--radius-lg)', fontWeight: 500, border: 'none', fontFamily: 'inherit', cursor: 'pointer', fontSize: '1rem' }}>{t.saveIssue}</button>
              </div>

              <IssueCommentsSection
                issue={currentIssue}
                commentDraft={commentDraft}
                setCommentDraft={setCommentDraft}
                onAddComment={handleAddComment}
                t={t}
                language={language}
              />
            </div>
          </div>
        </form>
      </Modal>
    </main>
  );
};

const SprintPage = ({ data, setData, t, language }) => {
  const [sprintSearch, setSprintSearch] = useState('');
  const [sortField, setSortField] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingIssue, setEditingIssue] = useState(null);
  const [relationCandidateId, setRelationCandidateId] = useState('');
  const [commentDraft, setCommentDraft] = useState('');

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'Task',
    priority: 'Low',
    storyPoints: 0,
    dueDate: '',
    assignee: ''
  });

  const getSprintIssues = () => {
    let issues = data.issues.filter(i => i.sprintId === data.sprint.id);
    
    if (sprintSearch) {
      issues = issues.filter(i => i.title.toLowerCase().includes(sprintSearch.toLowerCase()));
    }

    if (sortField) {
      issues.sort((a, b) => a[sortField] > b[sortField] ? 1 : -1);
    }

    return issues;
  };

  const updateStatus = (id, status) => {
    const safeStatus = normalizeIssueStatus(status);
    const updatedIssues = data.issues.map(i =>
      i.id === id ? { ...i, status: safeStatus } : i
    );
    setData({ ...data, issues: updatedIssues });
  };

  const openModal = (issue) => {
    setRelationCandidateId('');
    setCommentDraft('');
    setEditingIssue(issue);
    setFormData({
      title: issue.title,
      description: issue.description,
      type: issue.type,
      priority: issue.priority,
      storyPoints: issue.storyPoints,
      dueDate: issue.dueDate,
      assignee: issue.assignee
    });
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingIssue(null);
    setRelationCandidateId('');
    setCommentDraft('');
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    const safeFormData = normalizeIssueFormData(formData, editingIssue, t.defaultIssueTitle);

    const updatedIssues = data.issues.map(i => 
      i.id === editingIssue.id ? { ...i, ...safeFormData } : i
    );
    setData({ ...data, issues: updatedIssues });
    
    closeModal();
  };

  const updateIssueRelations = (targetIssueId, shouldLink) => {
    if (!currentIssue || !targetIssueId || targetIssueId === currentIssue.id) {
      return;
    }

    setData((previousData) => {
      let hasChanges = false;
      const updatedIssues = previousData.issues.map((candidate) => {
        const candidateRelations = Array.isArray(candidate.relatesTo) ? candidate.relatesTo : [];

        if (candidate.id === currentIssue.id) {
          if (shouldLink && !candidateRelations.includes(targetIssueId)) {
            hasChanges = true;
            return { ...candidate, relatesTo: [...candidateRelations, targetIssueId] };
          }
          if (!shouldLink && candidateRelations.includes(targetIssueId)) {
            hasChanges = true;
            return { ...candidate, relatesTo: candidateRelations.filter((id) => id !== targetIssueId) };
          }
        }

        if (candidate.id === targetIssueId) {
          if (shouldLink && !candidateRelations.includes(currentIssue.id)) {
            hasChanges = true;
            return { ...candidate, relatesTo: [...candidateRelations, currentIssue.id] };
          }
          if (!shouldLink && candidateRelations.includes(currentIssue.id)) {
            hasChanges = true;
            return { ...candidate, relatesTo: candidateRelations.filter((id) => id !== currentIssue.id) };
          }
        }

        return candidate;
      });

      return hasChanges ? { ...previousData, issues: updatedIssues } : previousData;
    });
  };

  const handleAddRelation = () => {
    if (!relationCandidateId) {
      return;
    }
    updateIssueRelations(relationCandidateId, true);
    setRelationCandidateId('');
  };

  const handleRemoveRelation = (targetIssueId) => {
    updateIssueRelations(targetIssueId, false);
  };

  const handleAddComment = () => {
    if (!currentIssue) {
      return;
    }

    const normalizedText = toSafeMultilineText(commentDraft, MAX_COMMENT_LENGTH);
    if (!normalizedText) {
      return;
    }

    const newComment = {
      id: `CMT-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      text: normalizedText,
      author: 'Admin',
      createdAt: new Date().toISOString()
    };

    setData((previousData) => ({
      ...previousData,
      issues: previousData.issues.map((candidate) => {
        if (candidate.id !== currentIssue.id) {
          return candidate;
        }

        const existingComments = Array.isArray(candidate.comments) ? candidate.comments : [];
        return { ...candidate, comments: [...existingComments, newComment] };
      })
    }));

    setCommentDraft('');
  };

  const exportCSV = () => {
    const issues = data.issues.filter(i => i.sprintId === data.sprint.id);
    const headers = t.csvHeaders;
    const rows = issues.map(i => [
      i.id,
      i.title,
      getTranslatedLabel(t.typeLabels, i.type),
      getTranslatedLabel(t.statusLabels, i.status),
      i.storyPoints,
      i.assignee
    ]);

    const csvText = [
      headers.map(escapeCsvCell).join(','),
      ...rows.map((row) => row.map(escapeCsvCell).join(','))
    ].join('\n');
    const blob = new Blob([csvText], { type: 'text/csv;charset=utf-8;' });
    const objectUrl = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', objectUrl);
    link.setAttribute('download', 'sprint_export.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(objectUrl);
  };

  const sprintIssues = getSprintIssues();
  const totalSP = sprintIssues.reduce((sum, i) => sum + (parseInt(i.storyPoints) || 0), 0);
  const currentIssue = editingIssue
    ? data.issues.find((candidate) => candidate.id === editingIssue.id) || editingIssue
    : null;

  return (
    <main style={{ padding: '40px', maxWidth: '1600px', margin: '0 auto' }}>
      <h1 style={{ fontSize: '3rem', marginBottom: '24px', lineHeight: 1, fontWeight: 500, letterSpacing: '-0.02em' }}>
        {t.sprintBoard}
      </h1>
      
      <div style={{
        background: '#FAFAFA',
        padding: '32px',
        borderRadius: 'var(--radius-lg)',
        marginBottom: '40px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start'
      }}>
        <div>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '16px' }}>{data.sprint.name}</h2>
          <p style={{ color: '#666', marginBottom: '8px' }}>{t.goal}: {data.sprint.goal}</p>
          <p style={{ fontSize: '14px' }}>{data.sprint.startDate} - {data.sprint.endDate}</p>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: '2.5rem', fontWeight: 400 }}>{totalSP}</div>
          <div style={{
            fontSize: '12px',
            textTransform: 'uppercase',
            letterSpacing: '0.05em'
          }}>{t.storyPoints}</div>
        </div>
      </div>

      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '40px',
        flexWrap: 'wrap',
        gap: '16px'
      }}>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <input
            type="text"
            placeholder={t.filterSprint}
            value={sprintSearch}
            onChange={(e) => setSprintSearch(e.target.value)}
            style={{
              padding: '10px 16px',
              border: '1px solid var(--border-color)',
              borderRadius: 'var(--radius-lg)',
              fontSize: '14px',
              outline: 'none',
              background: 'white',
              minWidth: '150px'
            }}
          />
        </div>
        <button
          onClick={exportCSV}
          style={{
            border: '1px solid var(--border-color)',
            padding: '10px 20px',
            borderRadius: 'var(--radius-lg)',
            fontFamily: 'inherit',
            cursor: 'pointer',
            background: 'none',
            fontSize: '1rem'
          }}
        >
          {t.exportCsv}
        </button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: '80px 2fr 1fr 1fr 1fr 80px',
          padding: '12px 24px',
          fontSize: '12px',
          textTransform: 'uppercase',
          borderBottom: '1px solid var(--text-color)',
          fontWeight: 600
        }}>
          <div style={{ cursor: 'pointer' }} onClick={() => setSortField('id')}>{t.key} ↕</div>
          <div style={{ cursor: 'pointer' }} onClick={() => setSortField('title')}>{t.summary} ↕</div>
          <div style={{ cursor: 'pointer' }} onClick={() => setSortField('priority')}>{t.priority} ↕</div>
          <div style={{ cursor: 'pointer' }} onClick={() => setSortField('status')}>{t.status} ↕</div>
          <div>{t.assignee}</div>
          <div>{t.actions}</div>
        </div>
        <div>
          {sprintIssues.map(issue => (
            <div
              key={issue.id}
              style={{
                display: 'grid',
                gridTemplateColumns: '80px 2fr 1fr 1fr 1fr 80px',
                padding: '20px 24px',
                alignItems: 'center',
                borderBottom: '1px solid var(--border-color)',
                transition: 'background 0.1s'
              }}
              onMouseOver={(e) => e.currentTarget.style.background = '#FAFAFA'}
              onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}
            >
              <div style={{ fontWeight: 600 }}>{issue.id}</div>
              <div>{issue.title}</div>
              <div>
                <span style={{
                  padding: '4px 10px',
                  borderRadius: '12px',
                  fontSize: '11px',
                  background: '#F0F0F0',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em'
                }}>{getTranslatedLabel(t.priorityLabels, issue.priority)}</span>
              </div>
              <div>
                <select
                  value={issue.status}
                  onChange={(e) => updateStatus(issue.id, e.target.value)}
                  style={getSelectStyle({
                    minWidth: '150px',
                    padding: '8px 34px 8px 10px',
                    borderRadius: '8px',
                    fontSize: '13px',
                    backgroundPosition: 'right 10px center'
                  })}
                >
                  <option value="To Do">{getTranslatedLabel(t.statusLabels, 'To Do')}</option>
                  <option value="In Progress">{getTranslatedLabel(t.statusLabels, 'In Progress')}</option>
                  <option value="Done">{getTranslatedLabel(t.statusLabels, 'Done')}</option>
                </select>
              </div>
              <div>{issue.assignee}</div>
              <div>
                <button
                  onClick={() => openModal(issue)}
                  style={{
                    border: '1px solid var(--border-color)',
                    padding: '4px 8px',
                    borderRadius: 'var(--radius-lg)',
                    fontFamily: 'inherit',
                    cursor: 'pointer',
                    background: 'none',
                    fontSize: '12px'
                  }}
                >
                  {t.edit}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <Modal isOpen={modalOpen} onClose={closeModal} title={currentIssue ? `${t.editIssue} ${currentIssue.id}` : t.createIssue} width="1380px">
        <form onSubmit={handleFormSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: '280px minmax(0, 1fr)', gap: '20px', alignItems: 'start' }}>
            <IssueNotesSidebar
              issue={currentIssue}
              formData={formData}
              t={t}
              issues={data.issues}
              relationCandidateId={relationCandidateId}
              setRelationCandidateId={setRelationCandidateId}
              onAddRelation={handleAddRelation}
              onRemoveRelation={handleRemoveRelation}
            />

            <div style={{ border: '1px solid #DFE1E6', borderRadius: '14px', padding: '20px', background: '#FFFFFF' }}>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{t.summary}</label>
                <input type="text" required value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} style={{ width: '100%', padding: '12px', border: '1px solid #C8D0DC', borderRadius: '8px', fontFamily: 'inherit' }} />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: '12px', marginBottom: '16px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{t.type}</label>
                  <select value={formData.type} onChange={(e) => setFormData({ ...formData, type: e.target.value })} style={getSelectStyle({ width: '100%', padding: '10px 40px 10px 12px', borderRadius: '8px' })}>
                    <option value="Task">{getTranslatedLabel(t.typeLabels, 'Task')}</option>
                    <option value="Bug">{getTranslatedLabel(t.typeLabels, 'Bug')}</option>
                    <option value="Story">{getTranslatedLabel(t.typeLabels, 'Story')}</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{t.priority}</label>
                  <select value={formData.priority} onChange={(e) => setFormData({ ...formData, priority: e.target.value })} style={getSelectStyle({ width: '100%', padding: '10px 40px 10px 12px', borderRadius: '8px' })}>
                    <option value="Low">{getTranslatedLabel(t.priorityLabels, 'Low')}</option>
                    <option value="Medium">{getTranslatedLabel(t.priorityLabels, 'Medium')}</option>
                    <option value="High">{getTranslatedLabel(t.priorityLabels, 'High')}</option>
                  </select>
                </div>
              </div>

              <section style={{ marginBottom: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', alignItems: 'baseline' }}>
                  <label style={{ fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{t.description}</label>
                  <span style={{ fontSize: '12px', color: '#6B778C' }}>{t.markdownHelp}</span>
                </div>
                <textarea rows="10" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} style={{ width: '100%', padding: '12px', border: '1px solid #C8D0DC', borderRadius: '10px', fontFamily: 'inherit', minHeight: '220px', resize: 'vertical', marginBottom: '12px' }} />
                <div style={{ border: '1px solid #E2E6ED', borderRadius: '10px', padding: '12px', background: '#FBFCFF' }}>
                  <div style={{ fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px', color: '#6B778C' }}>{t.descriptionPreview}</div>
                  <MarkdownPreview description={formData.description} t={t} />
                </div>
              </section>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: '12px', marginBottom: '16px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{t.storyPoints}</label>
                  <input type="number" min="0" value={formData.storyPoints} onChange={(e) => setFormData({ ...formData, storyPoints: parseInt(e.target.value, 10) || 0 })} style={{ width: '100%', padding: '12px', border: '1px solid #C8D0DC', borderRadius: '8px', fontFamily: 'inherit' }} />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{t.dueDate}</label>
                  <input type="date" value={formData.dueDate} onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })} style={{ width: '100%', padding: '12px', border: '1px solid #C8D0DC', borderRadius: '8px', fontFamily: 'inherit' }} />
                </div>
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{t.assignee}</label>
                <input type="text" placeholder={t.assigneePlaceholder} value={formData.assignee} onChange={(e) => setFormData({ ...formData, assignee: e.target.value })} style={{ width: '100%', padding: '12px', border: '1px solid #C8D0DC', borderRadius: '8px', fontFamily: 'inherit' }} />
              </div>

              <div style={{ textAlign: 'right' }}>
                <button type="button" onClick={closeModal} style={{ border: '1px solid var(--border-color)', padding: '10px 20px', borderRadius: 'var(--radius-lg)', fontFamily: 'inherit', cursor: 'pointer', background: 'none', fontSize: '1rem', marginRight: '12px' }}>{t.cancel}</button>
                <button type="submit" style={{ backgroundColor: 'var(--accent-color)', color: 'var(--text-color)', padding: '12px 24px', borderRadius: 'var(--radius-lg)', fontWeight: 500, border: 'none', fontFamily: 'inherit', cursor: 'pointer', fontSize: '1rem' }}>{t.saveIssue}</button>
              </div>

              <IssueCommentsSection
                issue={currentIssue}
                commentDraft={commentDraft}
                setCommentDraft={setCommentDraft}
                onAddComment={handleAddComment}
                t={t}
                language={language}
              />
            </div>
          </div>
        </form>
      </Modal>
    </main>
  );
};

const GanttPage = ({ data, t, language }) => {
  const [groupBy, setGroupBy] = useState('assignee');
  const [showRelations, setShowRelations] = useState(false);
  const [openedIssueId, setOpenedIssueId] = useState(null);

  const activeIssues = data.issues.filter((issue) => issue.status !== 'Done');
  const openedIssue = openedIssueId
    ? data.issues.find((issue) => issue.id === openedIssueId) ?? null
    : null;
  const today = startOfLocalDay(new Date());

  const issuesWithRange = activeIssues.map((issue) => {
    const dueDate = parseLocalDate(issue.dueDate) ?? addDays(today, 5);
    const storyPoints = Number.parseInt(issue.storyPoints, 10);
    const durationDays = Math.max(
      1,
      Math.min(14, Number.isFinite(storyPoints) && storyPoints > 0 ? storyPoints : 3)
    );
    const startDate = addDays(dueDate, -(durationDays - 1));

    return {
      issue,
      startDate,
      endDate: dueDate
    };
  });

  if (issuesWithRange.length === 0) {
    return (
      <main style={{ padding: '40px', maxWidth: '1600px', margin: '0 auto' }}>
        <h1 style={{ fontSize: '3rem', marginBottom: '24px', lineHeight: 1, fontWeight: 500, letterSpacing: '-0.02em' }}>
          {t.ganttTitle}
        </h1>
        <div style={{ color: '#666' }}>{t.noActiveTasks}</div>
      </main>
    );
  }

  const minStart = issuesWithRange.reduce(
    (minDate, currentIssue) => (currentIssue.startDate < minDate ? currentIssue.startDate : minDate),
    issuesWithRange[0].startDate
  );
  const maxEnd = issuesWithRange.reduce(
    (maxDate, currentIssue) => (currentIssue.endDate > maxDate ? currentIssue.endDate : maxDate),
    issuesWithRange[0].endDate
  );

  const timelineStart = addDays(minStart, -1);
  const timelineEnd = addDays(maxEnd, 1);
  const totalDays = dateDiffInDays(timelineStart, timelineEnd) + 1;
  const timelineDays = Array.from({ length: totalDays }, (_, index) => addDays(timelineStart, index));
  const dayIndexByKey = new Map(timelineDays.map((date, index) => [toDateKey(date), index]));

  const groupedIssues = issuesWithRange.reduce((groupsMap, issueData) => {
    const groupLabel = groupBy === 'assignee'
      ? (issueData.issue.assignee?.trim() || t.unassigned)
      : getTranslatedLabel(t.typeLabels, issueData.issue.type);

    if (!groupsMap.has(groupLabel)) {
      groupsMap.set(groupLabel, []);
    }

    groupsMap.get(groupLabel).push(issueData);
    return groupsMap;
  }, new Map());

  const locale = language === 'ru' ? 'ru-RU' : 'en-US';
  const groups = Array.from(groupedIssues.entries())
    .map(([groupLabel, groupItems]) => ({
      groupLabel,
      groupItems: groupItems.sort((leftItem, rightItem) => leftItem.startDate - rightItem.startDate)
    }))
    .sort((leftGroup, rightGroup) => leftGroup.groupLabel.localeCompare(rightGroup.groupLabel, locale));

  const rowLabelWidth = 300;
  const dayCellWidth = 42;
  const timelineHeaderHeight = 44;
  const groupHeaderHeight = 42;
  const issueRowHeight = 52;
  const issueBarTopOffset = 10;
  const issueBarHeight = 30;
  const issueBarMinWidth = dayCellWidth - 4;
  const issueBarXOffset = 2;
  const chartContentWidth = rowLabelWidth + totalDays * dayCellWidth;

  const resolveIssueTimeline = (startDate, endDate) => {
    const rawStartIndex = dayIndexByKey.get(toDateKey(startDate));
    const rawEndIndex = dayIndexByKey.get(toDateKey(endDate));
    const startIndex = Number.isInteger(rawStartIndex) ? rawStartIndex : 0;
    const endIndex = Number.isInteger(rawEndIndex) ? rawEndIndex : totalDays - 1;
    const normalizedStartIndex = Math.max(0, Math.min(totalDays - 1, Math.min(startIndex, endIndex)));
    const normalizedEndIndex = Math.max(normalizedStartIndex, Math.min(totalDays - 1, Math.max(startIndex, endIndex)));
    const barWidth = Math.max(issueBarMinWidth, (normalizedEndIndex - normalizedStartIndex + 1) * dayCellWidth - 4);

    return {
      startIndex: normalizedStartIndex,
      endIndex: normalizedEndIndex,
      barWidth
    };
  };

  const getBarColor = (priority) => {
    if (priority === 'High') {
      return '#f4a261';
    }
    if (priority === 'Medium') {
      return '#e9c46a';
    }
    return '#84cc9b';
  };

  const issueBarPositions = new Map();
  let currentChartY = timelineHeaderHeight;

  groups.forEach(({ groupItems }) => {
    currentChartY += groupHeaderHeight;
    groupItems.forEach(({ issue, startDate, endDate }) => {
      const { startIndex, barWidth } = resolveIssueTimeline(startDate, endDate);
      const barStartX = rowLabelWidth + startIndex * dayCellWidth + issueBarXOffset;

      issueBarPositions.set(issue.id, {
        startX: barStartX,
        endX: barStartX + barWidth,
        centerY: currentChartY + issueBarTopOffset + issueBarHeight / 2
      });

      currentChartY += issueRowHeight;
    });
  });

  const relationPaths = [];
  if (showRelations) {
    const renderedRelations = new Set();

    groups.forEach(({ groupItems }) => {
      groupItems.forEach(({ issue }) => {
        const sourceBar = issueBarPositions.get(issue.id);
        if (!sourceBar) {
          return;
        }

        const relatedIssueIds = Array.isArray(issue.relatesTo) ? issue.relatesTo : [];
        relatedIssueIds.forEach((targetIssueId) => {
          if (!targetIssueId || targetIssueId === issue.id) {
            return;
          }

          const targetBar = issueBarPositions.get(targetIssueId);
          if (!targetBar) {
            return;
          }

          const relationKey = [issue.id, targetIssueId].sort().join('__');
          if (renderedRelations.has(relationKey)) {
            return;
          }

          renderedRelations.add(relationKey);

          // Рисуем "уступ": вправо, затем по вертикали и в целевую задачу.
          const hasHorizontalGap = targetBar.startX - sourceBar.endX >= 40;
          const turnX = hasHorizontalGap
            ? sourceBar.endX + 18
            : Math.max(sourceBar.endX, targetBar.startX) + 28;

          relationPaths.push(
            `M ${sourceBar.endX} ${sourceBar.centerY} L ${turnX} ${sourceBar.centerY} L ${turnX} ${targetBar.centerY} L ${targetBar.startX} ${targetBar.centerY}`
          );
        });
      });
    });
  }

  const closeIssueModal = () => {
    setOpenedIssueId(null);
  };

  return (
    <main style={{ padding: '40px', maxWidth: '1600px', margin: '0 auto' }}>
      <h1 style={{ fontSize: '3rem', marginBottom: '24px', lineHeight: 1, fontWeight: 500, letterSpacing: '-0.02em' }}>
        {t.ganttTitle}
      </h1>

      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px', flexWrap: 'wrap' }}>
        <span style={{ fontSize: '14px', color: '#555' }}>{t.groupBy}:</span>
        <button
          type="button"
          onClick={() => setGroupBy('assignee')}
          style={{
            border: '1px solid var(--border-color)',
            borderRadius: '999px',
            padding: '8px 14px',
            background: groupBy === 'assignee' ? 'var(--accent-color)' : '#fff',
            fontSize: '13px'
          }}
        >
          {t.groupByUsers}
        </button>
        <button
          type="button"
          onClick={() => setGroupBy('type')}
          style={{
            border: '1px solid var(--border-color)',
            borderRadius: '999px',
            padding: '8px 14px',
            background: groupBy === 'type' ? 'var(--accent-color)' : '#fff',
            fontSize: '13px'
          }}
        >
          {t.groupByTypes}
        </button>
        <label style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          border: '1px solid var(--border-color)',
          borderRadius: '999px',
          padding: '8px 14px',
          fontSize: '13px',
          cursor: 'pointer',
          userSelect: 'none',
          background: showRelations ? '#F7F7F7' : '#fff'
        }}>
          <input
            type="checkbox"
            checked={showRelations}
            onChange={(event) => setShowRelations(event.target.checked)}
            style={{
              width: '16px',
              height: '16px',
              margin: 0,
              cursor: 'pointer',
              accentColor: 'var(--text-color)'
            }}
          />
          {t.showRelations}
        </label>
      </div>

      <div style={{
        border: '1px solid var(--border-color)',
        borderRadius: '16px',
        overflowX: 'auto'
      }}>
        <div style={{ minWidth: `${chartContentWidth}px`, position: 'relative' }}>
          {showRelations && relationPaths.length > 0 && (
            <svg
              aria-hidden="true"
              width={chartContentWidth}
              height={currentChartY}
              viewBox={`0 0 ${chartContentWidth} ${currentChartY}`}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                pointerEvents: 'none',
                zIndex: 1
              }}
            >
              <defs>
                <marker
                  id="gantt-relation-arrow"
                  markerWidth="7"
                  markerHeight="7"
                  refX="6"
                  refY="3.5"
                  orient="auto"
                >
                  <path d="M 0 0 L 7 3.5 L 0 7 z" fill="#242424" />
                </marker>
              </defs>
              {relationPaths.map((pathData, index) => (
                <path
                  key={`gantt-link-${index + 1}`}
                  d={pathData}
                  fill="none"
                  stroke="#242424"
                  strokeWidth="1.4"
                  markerEnd="url(#gantt-relation-arrow)"
                  opacity="0.9"
                />
              ))}
            </svg>
          )}

          <div style={{
            display: 'grid',
            gridTemplateColumns: `${rowLabelWidth}px repeat(${totalDays}, ${dayCellWidth}px)`,
            borderBottom: '1px solid var(--border-color)',
            background: '#FAFAFA',
            height: `${timelineHeaderHeight}px`,
            alignItems: 'center'
          }}>
            <div style={{
              padding: '0 16px',
              fontSize: '12px',
              textTransform: 'uppercase',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center'
            }}>
              {t.summary}
            </div>
            {timelineDays.map((date) => (
              <div
                key={toDateKey(date)}
                style={{
                  padding: '0 4px',
                  textAlign: 'center',
                  fontSize: '11px',
                  borderLeft: '1px solid var(--border-color)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                {date.toLocaleDateString(locale, { day: '2-digit', month: 'short' })}
              </div>
            ))}
          </div>

          {groups.map(({ groupLabel, groupItems }) => (
            <div key={groupLabel}>
              <div style={{
                display: 'grid',
                gridTemplateColumns: `${rowLabelWidth}px repeat(${totalDays}, ${dayCellWidth}px)`,
                borderBottom: '1px solid var(--border-color)',
                background: '#FFFBE6',
                height: `${groupHeaderHeight}px`,
                alignItems: 'center'
              }}>
                <div style={{
                  padding: '0 16px',
                  fontSize: '13px',
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center'
                }}>
                  {groupLabel}
                </div>
                <div style={{ gridColumn: `2 / span ${totalDays}` }} />
              </div>

              {groupItems.map(({ issue, startDate, endDate }) => {
                const { startIndex, barWidth } = resolveIssueTimeline(startDate, endDate);

                return (
                  <div
                    key={`${groupLabel}-${issue.id}`}
                    style={{
                      display: 'grid',
                      gridTemplateColumns: `${rowLabelWidth}px repeat(${totalDays}, ${dayCellWidth}px)`,
                      borderBottom: '1px solid var(--border-color)',
                      minHeight: `${issueRowHeight}px`
                    }}
                  >
                    <div style={{ padding: '10px 16px', minWidth: 0 }}>
                      <div style={{ fontSize: '12px', fontWeight: 600 }}>{issue.id}</div>
                      <div style={{
                        fontSize: '12px',
                        color: '#555',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap'
                      }}>
                        {issue.title}
                      </div>
                    </div>

                    <div style={{ gridColumn: `2 / span ${totalDays}`, position: 'relative', height: `${issueRowHeight}px` }}>
                      <div style={{
                        position: 'absolute',
                        inset: 0,
                        display: 'grid',
                        gridTemplateColumns: `repeat(${totalDays}, ${dayCellWidth}px)`
                      }}>
                        {timelineDays.map((date, index) => (
                          <div
                            key={`${issue.id}-${toDateKey(date)}`}
                            style={{ borderLeft: index === 0 ? 'none' : '1px solid #f1f1f1' }}
                          />
                        ))}
                      </div>

                      <div style={{
                        position: 'absolute',
                        left: `${startIndex * dayCellWidth + issueBarXOffset}px`,
                        top: `${issueBarTopOffset}px`,
                        width: `${barWidth}px`,
                        height: `${issueBarHeight}px`,
                        borderRadius: '8px',
                        background: getBarColor(issue.priority),
                        color: '#111',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: '8px',
                        padding: '0 8px',
                        fontSize: '11px',
                        zIndex: 2
                      }}>
                        <span style={{
                          flex: 1,
                          minWidth: 0,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap'
                        }}>
                          {issue.title}
                        </span>
                        <button
                          type="button"
                          onClick={(event) => {
                            event.stopPropagation();
                            setOpenedIssueId(issue.id);
                          }}
                          title={t.openIssue}
                          aria-label={t.openIssue}
                          style={{
                            width: '18px',
                            height: '18px',
                            borderRadius: '50%',
                            border: '1px solid rgba(0,0,0,0.35)',
                            background: 'rgba(255,255,255,0.85)',
                            color: '#111',
                            fontSize: '11px',
                            lineHeight: 1,
                            cursor: 'pointer',
                            padding: 0,
                            flexShrink: 0
                          }}
                        >
                          i
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      <Modal
        isOpen={Boolean(openedIssue)}
        onClose={closeIssueModal}
        title={openedIssue ? `${t.openIssue}: ${openedIssue.id}` : t.openIssue}
        width="760px"
      >
        {openedIssue && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
              gap: '10px'
            }}>
              <div style={{ border: '1px solid var(--border-color)', borderRadius: '10px', padding: '10px' }}>
                <div style={{ fontSize: '11px', color: '#666', marginBottom: '4px' }}>{t.status}</div>
                <div style={{ fontSize: '13px', fontWeight: 600 }}>
                  {getTranslatedLabel(t.statusLabels, openedIssue.status)}
                </div>
              </div>
              <div style={{ border: '1px solid var(--border-color)', borderRadius: '10px', padding: '10px' }}>
                <div style={{ fontSize: '11px', color: '#666', marginBottom: '4px' }}>{t.type}</div>
                <div style={{ fontSize: '13px', fontWeight: 600 }}>
                  {getTranslatedLabel(t.typeLabels, openedIssue.type)}
                </div>
              </div>
              <div style={{ border: '1px solid var(--border-color)', borderRadius: '10px', padding: '10px' }}>
                <div style={{ fontSize: '11px', color: '#666', marginBottom: '4px' }}>{t.priority}</div>
                <div style={{ fontSize: '13px', fontWeight: 600 }}>
                  {getTranslatedLabel(t.priorityLabels, openedIssue.priority)}
                </div>
              </div>
              <div style={{ border: '1px solid var(--border-color)', borderRadius: '10px', padding: '10px' }}>
                <div style={{ fontSize: '11px', color: '#666', marginBottom: '4px' }}>{t.dueDate}</div>
                <div style={{ fontSize: '13px', fontWeight: 600 }}>
                  {openedIssue.dueDate || '-'}
                </div>
              </div>
            </div>

            <div style={{ border: '1px solid var(--border-color)', borderRadius: '10px', padding: '12px' }}>
              <div style={{ fontSize: '11px', color: '#666', marginBottom: '6px' }}>{t.summary}</div>
              <div style={{ fontSize: '15px', fontWeight: 600 }}>{openedIssue.title}</div>
            </div>

            <div style={{ border: '1px solid var(--border-color)', borderRadius: '10px', padding: '12px' }}>
              <div style={{ fontSize: '11px', color: '#666', marginBottom: '6px' }}>{t.description}</div>
              <div style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word', fontSize: '13px' }}>
                {openedIssue.description || '-'}
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button
                type="button"
                onClick={closeIssueModal}
                style={{
                  border: '1px solid var(--border-color)',
                  padding: '10px 20px',
                  borderRadius: 'var(--radius-lg)',
                  fontFamily: 'inherit',
                  cursor: 'pointer',
                  background: 'none',
                  fontSize: '1rem'
                }}
              >
                {t.cancel}
              </button>
            </div>
          </div>
        )}
      </Modal>
    </main>
  );
};

const App = () => {
  const [language, setLanguage] = useState(() => getInitialLanguage());
  const [data, setData] = useState(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) {
        return seedData();
      }

      const parsed = JSON.parse(stored);
      if (!parsed || !Array.isArray(parsed.issues) || !parsed.sprint) {
        return seedData();
      }

      // Нормализуем структуру из localStorage, чтобы исключить поломки UI и мусорные данные.
      return normalizeStoredData(parsed);
    } catch (error) {
      // Не ломаем приложение, если localStorage повреждён или недоступен.
      console.error('Не удалось прочитать данные из localStorage, используем seed-данные.', error);
      return seedData();
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (error) {
      // Логируем только техническую причину без чувствительных данных.
      console.error('Не удалось сохранить состояние в localStorage.', error);
    }
  }, [data]);

  useEffect(() => {
    try {
      localStorage.setItem(LANGUAGE_STORAGE_KEY, language);
    } catch (error) {
      // Не останавливаем работу UI, если запись языка не удалась.
      console.error('Не удалось сохранить язык интерфейса.', error);
    }
    document.documentElement.lang = language;
  }, [language]);

  const handleLanguageChange = (nextLanguage) => {
    const resolvedLanguage = resolveLanguage(nextLanguage);
    if (resolvedLanguage) {
      setLanguage(resolvedLanguage);
    }
  };

  const t = I18N[language] ?? I18N[DEFAULT_LANGUAGE];

  return (
    <Router basename="/">
      <div style={customStyles.root}>
        <Header language={language} onLanguageChange={handleLanguageChange} t={t} />
        <Routes>
          <Route path="/" element={<IssuesPage data={data} setData={setData} t={t} language={language} />} />
          <Route path="/sprint" element={<SprintPage data={data} setData={setData} t={t} language={language} />} />
          <Route path="/gantt" element={<GanttPage data={data} t={t} language={language} />} />
        </Routes>
      </div>
    </Router>
  );
};

export default App;
