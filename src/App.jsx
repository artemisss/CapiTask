import React, { useState, useEffect, useRef } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';

const STORAGE_KEY = 'capitask_data';
const LANGUAGE_STORAGE_KEY = 'capitask_language';
const CSV_FORMULA_PREFIXES = ['=', '+', '-', '@'];
const DEFAULT_LANGUAGE = 'en';

const I18N = {
  en: {
    issuesNav: 'Issues',
    activeSprintNav: 'Active Sprint',
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
    assigneePlaceholder: 'John Doe',
    cancel: 'Cancel',
    saveIssue: 'Save Issue',
    editIssue: 'Edit',
    sprintTag: 'Sprint',
    pointsShort: 'pts',
    backlogCompleted: 'Great, you reached the end of backlog',
    capybaraAlt: 'Capybara at the end of tasks list',
    sprintBoard: 'Sprint Board',
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
    assigneePlaceholder: 'Иван Иванов',
    cancel: 'Отмена',
    saveIssue: 'Сохранить задачу',
    editIssue: 'Редактировать',
    sprintTag: 'Спринт',
    pointsShort: 'балл.',
    backlogCompleted: 'Поздравляем, весь backlog просмотрен',
    capybaraAlt: 'Капибара в конце списка задач',
    sprintBoard: 'Доска спринта',
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
  const types = ['Task', 'Bug', 'Story'];
  const priorities = ['High', 'Medium', 'Low'];
  const statuses = ['To Do', 'In Progress', 'Done'];

  for (let i = 1; i <= 15; i++) {
    issues.push({
      id: `PROJ-${i}`,
      title: `Sample Issue ${i} - ${Math.random().toString(36).substring(7)}`,
      description: 'This is a detailed description of the task.',
      type: types[Math.floor(Math.random() * types.length)],
      priority: priorities[Math.floor(Math.random() * priorities.length)],
      status: statuses[Math.floor(Math.random() * statuses.length)],
      assignee: i % 3 === 0 ? 'Alex' : (i % 2 === 0 ? 'Maria' : 'John'),
      reporter: 'Admin',
      storyPoints: Math.floor(Math.random() * 8) + 1,
      dueDate: new Date(Date.now() + (Math.random() * 10 - 5) * 86400000).toISOString().split('T')[0],
      sprintId: i < 10 ? 'S-1' : null,
      epicId: i % 2 === 0 ? 'E-1' : 'E-2',
      comments: []
    });
  }

  return { epics, sprint, issues, lastId: 15 };
};

const Header = ({ language, onLanguageChange, t }) => {
  return (
    <header style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
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
      <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
        <nav>
          <Link to="/" style={{
            textDecoration: 'none',
            color: 'var(--text-color)',
            marginLeft: '32px',
            fontWeight: 400,
            position: 'relative'
          }}>{t.issuesNav}</Link>
          <Link to="/sprint" style={{
            textDecoration: 'none',
            color: 'var(--text-color)',
            marginLeft: '32px',
            fontWeight: 400,
            position: 'relative'
          }}>{t.activeSprintNav}</Link>
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

const Modal = ({ isOpen, onClose, title, children }) => {
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
    }}>
      <div style={{
        background: 'white',
        width: '600px',
        maxWidth: '90vw',
        border: '1px solid var(--text-color)',
        borderRadius: 'var(--radius-lg)',
        padding: '40px',
        boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
        position: 'relative'
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

const IssuesPage = ({ data, setData, t }) => {
  const [viewMode, setViewMode] = useState('board');
  const [searchInput, setSearchInput] = useState('');
  const [filterType, setFilterType] = useState('');
  const [filterPriority, setFilterPriority] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingIssue, setEditingIssue] = useState(null);
  const [draggedItem, setDraggedItem] = useState(null);
  const [dragOverColumn, setDragOverColumn] = useState(null);
  const [showCapybaraEasterEgg, setShowCapybaraEasterEgg] = useState(false);
  const listEndRef = useRef(null);

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

  const openModal = (issue = null) => {
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
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    
    if (editingIssue) {
      const updatedIssues = data.issues.map(i => 
        i.id === editingIssue.id ? { ...i, ...formData } : i
      );
      setData({ ...data, issues: updatedIssues });
    } else {
      const newIssue = {
        ...formData,
        id: `PROJ-${data.lastId + 1}`,
        status: 'To Do',
        sprintId: 'S-1',
        epicId: 'E-1',
        reporter: 'Admin',
        comments: []
      };
      setData({
        ...data,
        issues: [...data.issues, newIssue],
        lastId: data.lastId + 1
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
    if (draggedItem && draggedItem.status !== status) {
      const updatedIssues = data.issues.map(i =>
        i.id === draggedItem.id ? { ...i, status } : i
      );
      setData({ ...data, issues: updatedIssues });
    }
    setDragOverColumn(null);
  };

  const filteredIssues = getFilteredIssues();
  const todoIssues = filteredIssues.filter(i => i.status === 'To Do');
  const progressIssues = filteredIssues.filter(i => i.status === 'In Progress');
  const doneIssues = filteredIssues.filter(i => i.status === 'Done');
  const hasActiveFilters = Boolean(filterType || filterPriority);

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
                {getTranslatedLabel(t.statusLabels, status)} <span style={{ fontSize: '0.6em', verticalAlign: 'super', marginLeft: '2px', fontWeight: 400 }}>{count}</span>
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
                gap: '12px',
                background: '#FAFAFA'
              }}>
                <div style={{ fontWeight: 500 }}>{t.backlogCompleted}</div>
                <img
                  src="/capibara_chil.png"
                  alt={t.capybaraAlt}
                  style={{ maxWidth: '320px', width: '100%', borderRadius: '16px' }}
                />
              </div>
            )}
          </div>
        </div>
      )}

      <Modal isOpen={modalOpen} onClose={closeModal} title={editingIssue ? `${t.editIssue} ${editingIssue.id}` : t.createIssue}>
        <form onSubmit={handleFormSubmit}>
          <div style={{ marginBottom: '20px' }}>
            <label style={{
              display: 'block',
              marginBottom: '8px',
              fontSize: '12px',
              textTransform: 'uppercase',
              letterSpacing: '0.05em'
            }}>{t.summary}</label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              style={{
                width: '100%',
                padding: '12px',
                border: '1px solid var(--border-color)',
                borderRadius: '8px',
                fontFamily: 'inherit'
              }}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
            <div>
              <label style={{
                display: 'block',
                marginBottom: '8px',
                fontSize: '12px',
                textTransform: 'uppercase',
                letterSpacing: '0.05em'
              }}>{t.type}</label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                style={getSelectStyle({
                  width: '100%',
                  padding: '12px 40px 12px 12px',
                  borderRadius: '8px'
                })}
              >
                <option value="Task">{getTranslatedLabel(t.typeLabels, 'Task')}</option>
                <option value="Bug">{getTranslatedLabel(t.typeLabels, 'Bug')}</option>
                <option value="Story">{getTranslatedLabel(t.typeLabels, 'Story')}</option>
              </select>
            </div>
            <div>
              <label style={{
                display: 'block',
                marginBottom: '8px',
                fontSize: '12px',
                textTransform: 'uppercase',
                letterSpacing: '0.05em'
              }}>{t.priority}</label>
              <select
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                style={getSelectStyle({
                  width: '100%',
                  padding: '12px 40px 12px 12px',
                  borderRadius: '8px'
                })}
              >
                <option value="Low">{getTranslatedLabel(t.priorityLabels, 'Low')}</option>
                <option value="Medium">{getTranslatedLabel(t.priorityLabels, 'Medium')}</option>
                <option value="High">{getTranslatedLabel(t.priorityLabels, 'High')}</option>
              </select>
            </div>
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{
              display: 'block',
              marginBottom: '8px',
              fontSize: '12px',
              textTransform: 'uppercase',
              letterSpacing: '0.05em'
            }}>{t.description}</label>
            <textarea
              rows="4"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              style={{
                width: '100%',
                padding: '12px',
                border: '1px solid var(--border-color)',
                borderRadius: '8px',
                fontFamily: 'inherit'
              }}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
            <div>
              <label style={{
                display: 'block',
                marginBottom: '8px',
                fontSize: '12px',
                textTransform: 'uppercase',
                letterSpacing: '0.05em'
              }}>{t.storyPoints}</label>
              <input
                type="number"
                min="0"
                value={formData.storyPoints}
                onChange={(e) => setFormData({ ...formData, storyPoints: parseInt(e.target.value) || 0 })}
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '1px solid var(--border-color)',
                  borderRadius: '8px',
                  fontFamily: 'inherit'
                }}
              />
            </div>
            <div>
              <label style={{
                display: 'block',
                marginBottom: '8px',
                fontSize: '12px',
                textTransform: 'uppercase',
                letterSpacing: '0.05em'
              }}>{t.dueDate}</label>
              <input
                type="date"
                value={formData.dueDate}
                onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '1px solid var(--border-color)',
                  borderRadius: '8px',
                  fontFamily: 'inherit'
                }}
              />
            </div>
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{
              display: 'block',
              marginBottom: '8px',
              fontSize: '12px',
              textTransform: 'uppercase',
              letterSpacing: '0.05em'
            }}>{t.assignee}</label>
            <input
              type="text"
              placeholder={t.assigneePlaceholder}
              value={formData.assignee}
              onChange={(e) => setFormData({ ...formData, assignee: e.target.value })}
              style={{
                width: '100%',
                padding: '12px',
                border: '1px solid var(--border-color)',
                borderRadius: '8px',
                fontFamily: 'inherit'
              }}
            />
          </div>

          <div style={{ textAlign: 'right' }}>
            <button
              type="button"
              onClick={closeModal}
              style={{
                border: '1px solid var(--border-color)',
                padding: '10px 20px',
                borderRadius: 'var(--radius-lg)',
                fontFamily: 'inherit',
                cursor: 'pointer',
                background: 'none',
                fontSize: '1rem',
                marginRight: '12px'
              }}
            >
              {t.cancel}
            </button>
            <button
              type="submit"
              style={{
                backgroundColor: 'var(--accent-color)',
                color: 'var(--text-color)',
                padding: '12px 24px',
                borderRadius: 'var(--radius-lg)',
                fontWeight: 500,
                border: 'none',
                fontFamily: 'inherit',
                cursor: 'pointer',
                fontSize: '1rem'
              }}
            >
              {t.saveIssue}
            </button>
          </div>
        </form>
      </Modal>
    </main>
  );
};

const SprintPage = ({ data, setData, t }) => {
  const [sprintSearch, setSprintSearch] = useState('');
  const [sortField, setSortField] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingIssue, setEditingIssue] = useState(null);

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
    const updatedIssues = data.issues.map(i =>
      i.id === id ? { ...i, status } : i
    );
    setData({ ...data, issues: updatedIssues });
  };

  const openModal = (issue) => {
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
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    
    const updatedIssues = data.issues.map(i => 
      i.id === editingIssue.id ? { ...i, ...formData } : i
    );
    setData({ ...data, issues: updatedIssues });
    
    closeModal();
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

      <Modal isOpen={modalOpen} onClose={closeModal} title={editingIssue ? `${t.editIssue} ${editingIssue.id}` : t.createIssue}>
        <form onSubmit={handleFormSubmit}>
          <div style={{ marginBottom: '20px' }}>
            <label style={{
              display: 'block',
              marginBottom: '8px',
              fontSize: '12px',
              textTransform: 'uppercase',
              letterSpacing: '0.05em'
            }}>{t.summary}</label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              style={{
                width: '100%',
                padding: '12px',
                border: '1px solid var(--border-color)',
                borderRadius: '8px',
                fontFamily: 'inherit'
              }}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
            <div>
              <label style={{
                display: 'block',
                marginBottom: '8px',
                fontSize: '12px',
                textTransform: 'uppercase',
                letterSpacing: '0.05em'
              }}>{t.type}</label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                style={getSelectStyle({
                  width: '100%',
                  padding: '12px 40px 12px 12px',
                  borderRadius: '8px'
                })}
              >
                <option value="Task">{getTranslatedLabel(t.typeLabels, 'Task')}</option>
                <option value="Bug">{getTranslatedLabel(t.typeLabels, 'Bug')}</option>
                <option value="Story">{getTranslatedLabel(t.typeLabels, 'Story')}</option>
              </select>
            </div>
            <div>
              <label style={{
                display: 'block',
                marginBottom: '8px',
                fontSize: '12px',
                textTransform: 'uppercase',
                letterSpacing: '0.05em'
              }}>{t.priority}</label>
              <select
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                style={getSelectStyle({
                  width: '100%',
                  padding: '12px 40px 12px 12px',
                  borderRadius: '8px'
                })}
              >
                <option value="Low">{getTranslatedLabel(t.priorityLabels, 'Low')}</option>
                <option value="Medium">{getTranslatedLabel(t.priorityLabels, 'Medium')}</option>
                <option value="High">{getTranslatedLabel(t.priorityLabels, 'High')}</option>
              </select>
            </div>
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{
              display: 'block',
              marginBottom: '8px',
              fontSize: '12px',
              textTransform: 'uppercase',
              letterSpacing: '0.05em'
            }}>{t.description}</label>
            <textarea
              rows="4"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              style={{
                width: '100%',
                padding: '12px',
                border: '1px solid var(--border-color)',
                borderRadius: '8px',
                fontFamily: 'inherit'
              }}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
            <div>
              <label style={{
                display: 'block',
                marginBottom: '8px',
                fontSize: '12px',
                textTransform: 'uppercase',
                letterSpacing: '0.05em'
              }}>{t.storyPoints}</label>
              <input
                type="number"
                min="0"
                value={formData.storyPoints}
                onChange={(e) => setFormData({ ...formData, storyPoints: parseInt(e.target.value) || 0 })}
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '1px solid var(--border-color)',
                  borderRadius: '8px',
                  fontFamily: 'inherit'
                }}
              />
            </div>
            <div>
              <label style={{
                display: 'block',
                marginBottom: '8px',
                fontSize: '12px',
                textTransform: 'uppercase',
                letterSpacing: '0.05em'
              }}>{t.dueDate}</label>
              <input
                type="date"
                value={formData.dueDate}
                onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '1px solid var(--border-color)',
                  borderRadius: '8px',
                  fontFamily: 'inherit'
                }}
              />
            </div>
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{
              display: 'block',
              marginBottom: '8px',
              fontSize: '12px',
              textTransform: 'uppercase',
              letterSpacing: '0.05em'
            }}>{t.assignee}</label>
            <input
              type="text"
              placeholder={t.assigneePlaceholder}
              value={formData.assignee}
              onChange={(e) => setFormData({ ...formData, assignee: e.target.value })}
              style={{
                width: '100%',
                padding: '12px',
                border: '1px solid var(--border-color)',
                borderRadius: '8px',
                fontFamily: 'inherit'
              }}
            />
          </div>

          <div style={{ textAlign: 'right' }}>
            <button
              type="button"
              onClick={closeModal}
              style={{
                border: '1px solid var(--border-color)',
                padding: '10px 20px',
                borderRadius: 'var(--radius-lg)',
                fontFamily: 'inherit',
                cursor: 'pointer',
                background: 'none',
                fontSize: '1rem',
                marginRight: '12px'
              }}
            >
              {t.cancel}
            </button>
            <button
              type="submit"
              style={{
                backgroundColor: 'var(--accent-color)',
                color: 'var(--text-color)',
                padding: '12px 24px',
                borderRadius: 'var(--radius-lg)',
                fontWeight: 500,
                border: 'none',
                fontFamily: 'inherit',
                cursor: 'pointer',
                fontSize: '1rem'
              }}
            >
              {t.saveIssue}
            </button>
          </div>
        </form>
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

      return parsed;
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
          <Route path="/" element={<IssuesPage data={data} setData={setData} t={t} />} />
          <Route path="/sprint" element={<SprintPage data={data} setData={setData} t={t} />} />
        </Routes>
      </div>
    </Router>
  );
};

export default App;
