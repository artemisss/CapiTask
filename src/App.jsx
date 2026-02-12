import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';

const STORAGE_KEY = 'capitask_data';
const LIST_BOTTOM_THRESHOLD_PX = 8;
const CSV_FORMULA_PREFIXES = ['=', '+', '-', '@'];

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

const Header = () => {
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
      <nav>
        <Link to="/" style={{
          textDecoration: 'none',
          color: 'var(--text-color)',
          marginLeft: '32px',
          fontWeight: 400,
          position: 'relative'
        }}>Issues</Link>
        <Link to="/sprint" style={{
          textDecoration: 'none',
          color: 'var(--text-color)',
          marginLeft: '32px',
          fontWeight: 400,
          position: 'relative'
        }}>Active Sprint</Link>
      </nav>
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

const Card = ({ issue, onClick, onDragStart, onDragEnd }) => {
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
        <span>{issue.priority}</span>
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
          }}>Sprint</span>
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
        <span>{issue.storyPoints} pts</span>
      </div>
    </div>
  );
};

const IssuesPage = ({ data, setData }) => {
  const [viewMode, setViewMode] = useState('board');
  const [searchInput, setSearchInput] = useState('');
  const [filterType, setFilterType] = useState('');
  const [filterPriority, setFilterPriority] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingIssue, setEditingIssue] = useState(null);
  const [draggedItem, setDraggedItem] = useState(null);
  const [dragOverColumn, setDragOverColumn] = useState(null);
  const [showCapybaraEasterEgg, setShowCapybaraEasterEgg] = useState(false);

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

  const handleListScroll = (event) => {
    const { scrollTop, clientHeight, scrollHeight } = event.currentTarget;
    // Пасхалка включается, когда пользователь реально дошёл до низа списка задач.
    const isBottomReached = scrollTop + clientHeight >= scrollHeight - LIST_BOTTOM_THRESHOLD_PX;
    setShowCapybaraEasterEgg(isBottomReached);
  };

  useEffect(() => {
    // При смене режима/фильтров прячем пасхалку, чтобы её нужно было "найти" заново.
    setShowCapybaraEasterEgg(false);
  }, [viewMode, searchInput, filterType, filterPriority, data.issues.length]);

  return (
    <main style={{ padding: '40px', maxWidth: '1600px', margin: '0 auto' }}>
      <h1 style={{ fontSize: '3rem', marginBottom: '24px', lineHeight: 1, fontWeight: 500, letterSpacing: '-0.02em' }}>
        Backlog <span style={{ fontSize: '0.6em', verticalAlign: 'super', marginLeft: '2px', fontWeight: 400 }}>{filteredIssues.length}</span>
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
            placeholder="Search issues..."
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
            style={{
              padding: '10px 16px',
              border: '1px solid var(--border-color)',
              borderRadius: 'var(--radius-lg)',
              fontSize: '14px',
              outline: 'none',
              background: 'white',
              minWidth: '150px'
            }}
          >
            <option value="">All Types</option>
            <option value="Task">Task</option>
            <option value="Bug">Bug</option>
            <option value="Story">Story</option>
          </select>
          <select
            value={filterPriority}
            onChange={(e) => setFilterPriority(e.target.value)}
            style={{
              padding: '10px 16px',
              border: '1px solid var(--border-color)',
              borderRadius: 'var(--radius-lg)',
              fontSize: '14px',
              outline: 'none',
              background: 'white',
              minWidth: '150px'
            }}
          >
            <option value="">All Priorities</option>
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>
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
            {viewMode === 'board' ? 'Switch to List' : 'Switch to Board'}
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
            + Create Issue
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
                {status} <span style={{ fontSize: '0.6em', verticalAlign: 'super', marginLeft: '2px', fontWeight: 400 }}>{count}</span>
              </div>
              <div style={{ flex: 1, overflowY: 'auto', minHeight: '100px' }}>
                {issues.map(issue => (
                  <Card
                    key={issue.id}
                    issue={issue}
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
            <div>Key</div>
            <div>Summary</div>
            <div>Priority</div>
            <div>Status</div>
            <div>Assignee</div>
            <div>Due</div>
          </div>
          <div
            onScroll={handleListScroll}
            style={{
              maxHeight: 'calc(100vh - 320px)',
              overflowY: 'auto',
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
                    }}>{issue.priority}</span>
                  </div>
                  <div>{issue.status}</div>
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
            {showCapybaraEasterEgg && filteredIssues.length > 0 && (
              <div style={{
                padding: '24px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '12px',
                background: '#FAFAFA'
              }}>
                <div style={{ fontWeight: 500 }}>Поздравляем, весь backlog просмотрен</div>
                <img
                  src="/capibara_chil.png"
                  alt="Капибара в конце списка задач"
                  style={{ maxWidth: '320px', width: '100%', borderRadius: '16px' }}
                />
              </div>
            )}
          </div>
        </div>
      )}

      <Modal isOpen={modalOpen} onClose={closeModal} title={editingIssue ? `Edit ${editingIssue.id}` : 'Create Issue'}>
        <form onSubmit={handleFormSubmit}>
          <div style={{ marginBottom: '20px' }}>
            <label style={{
              display: 'block',
              marginBottom: '8px',
              fontSize: '12px',
              textTransform: 'uppercase',
              letterSpacing: '0.05em'
            }}>Summary</label>
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
              }}>Type</label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '1px solid var(--border-color)',
                  borderRadius: '8px',
                  fontFamily: 'inherit'
                }}
              >
                <option value="Task">Task</option>
                <option value="Bug">Bug</option>
                <option value="Story">Story</option>
              </select>
            </div>
            <div>
              <label style={{
                display: 'block',
                marginBottom: '8px',
                fontSize: '12px',
                textTransform: 'uppercase',
                letterSpacing: '0.05em'
              }}>Priority</label>
              <select
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '1px solid var(--border-color)',
                  borderRadius: '8px',
                  fontFamily: 'inherit'
                }}
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
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
            }}>Description</label>
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
              }}>Story Points</label>
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
              }}>Due Date</label>
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
            }}>Assignee</label>
            <input
              type="text"
              placeholder="John Doe"
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
              Cancel
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
              Save Issue
            </button>
          </div>
        </form>
      </Modal>
    </main>
  );
};

const SprintPage = ({ data, setData }) => {
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
    const headers = ['ID', 'Title', 'Type', 'Status', 'Points', 'Assignee'];
    const rows = issues.map(i => [i.id, i.title, i.type, i.status, i.storyPoints, i.assignee]);

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
        Sprint Board
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
          <p style={{ color: '#666', marginBottom: '8px' }}>Goal: {data.sprint.goal}</p>
          <p style={{ fontSize: '14px' }}>{data.sprint.startDate} - {data.sprint.endDate}</p>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: '2.5rem', fontWeight: 400 }}>{totalSP}</div>
          <div style={{
            fontSize: '12px',
            textTransform: 'uppercase',
            letterSpacing: '0.05em'
          }}>Story Points</div>
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
            placeholder="Filter sprint..."
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
          Export CSV
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
          <div style={{ cursor: 'pointer' }} onClick={() => setSortField('id')}>Key ↕</div>
          <div style={{ cursor: 'pointer' }} onClick={() => setSortField('title')}>Summary ↕</div>
          <div style={{ cursor: 'pointer' }} onClick={() => setSortField('priority')}>Priority ↕</div>
          <div style={{ cursor: 'pointer' }} onClick={() => setSortField('status')}>Status ↕</div>
          <div>Assignee</div>
          <div>Actions</div>
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
                }}>{issue.priority}</span>
              </div>
              <div>
                <select
                  value={issue.status}
                  onChange={(e) => updateStatus(issue.id, e.target.value)}
                  style={{
                    minWidth: '100px',
                    padding: '4px',
                    border: '1px solid var(--border-color)',
                    borderRadius: '8px',
                    fontFamily: 'inherit'
                  }}
                >
                  <option>To Do</option>
                  <option>In Progress</option>
                  <option>Done</option>
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
                  Edit
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <Modal isOpen={modalOpen} onClose={closeModal} title={editingIssue ? `Edit ${editingIssue.id}` : 'Create Issue'}>
        <form onSubmit={handleFormSubmit}>
          <div style={{ marginBottom: '20px' }}>
            <label style={{
              display: 'block',
              marginBottom: '8px',
              fontSize: '12px',
              textTransform: 'uppercase',
              letterSpacing: '0.05em'
            }}>Summary</label>
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
              }}>Type</label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '1px solid var(--border-color)',
                  borderRadius: '8px',
                  fontFamily: 'inherit'
                }}
              >
                <option value="Task">Task</option>
                <option value="Bug">Bug</option>
                <option value="Story">Story</option>
              </select>
            </div>
            <div>
              <label style={{
                display: 'block',
                marginBottom: '8px',
                fontSize: '12px',
                textTransform: 'uppercase',
                letterSpacing: '0.05em'
              }}>Priority</label>
              <select
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '1px solid var(--border-color)',
                  borderRadius: '8px',
                  fontFamily: 'inherit'
                }}
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
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
            }}>Description</label>
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
              }}>Story Points</label>
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
              }}>Due Date</label>
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
            }}>Assignee</label>
            <input
              type="text"
              placeholder="John Doe"
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
              Cancel
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
              Save Issue
            </button>
          </div>
        </form>
      </Modal>
    </main>
  );
};

const App = () => {
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

  return (
    <Router basename="/">
      <div style={customStyles.root}>
        <Header />
        <Routes>
          <Route path="/" element={<IssuesPage data={data} setData={setData} />} />
          <Route path="/sprint" element={<SprintPage data={data} setData={setData} />} />
        </Routes>
      </div>
    </Router>
  );
};

export default App;
