(function () {
  const conferences = Array.isArray(window.MEDDDL_CONFERENCES) ? window.MEDDDL_CONFERENCES : [];
  const grid = document.getElementById('conferenceGrid');
  const categoryChips = document.getElementById('categoryChips');
  const searchInput = document.getElementById('searchInput');
  const statusFilter = document.getElementById('statusFilter');
  const resultCount = document.getElementById('resultCount');
  const emptyState = document.getElementById('emptyState');
  const resetButton = document.getElementById('resetFilters');

  const MS_DAY = 24 * 60 * 60 * 1000;
  const state = {
    category: 'All',
    query: '',
    status: 'all'
  };

  function escapeHtml(value) {
    return String(value == null ? '' : value)
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;')
      .replaceAll("'", '&#039;');
  }

  function parseDate(value) {
    if (!value) return null;
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? null : date;
  }

  function parsePlainDate(value) {
    if (!value || typeof value !== 'string') return null;
    const parts = value.split('-').map(Number);
    if (parts.length !== 3 || parts.some(Number.isNaN)) return null;
    return new Date(parts[0], parts[1] - 1, parts[2]);
  }

  function formatPlainDate(value) {
    const date = parsePlainDate(value);
    if (!date) return 'TBD';
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    }).format(date);
  }

  function formatDateRange(start, end) {
    const startLabel = formatPlainDate(start);
    const endLabel = formatPlainDate(end);
    if (startLabel === 'TBD' && endLabel === 'TBD') return 'TBD';
    if (start === end || endLabel === 'TBD') return startLabel;
    return `${startLabel} – ${endLabel}`;
  }

  function deadlineState(deadline, now = new Date()) {
    const date = parseDate(deadline.date_iso);
    if (!date) {
      return {
        kind: 'tbd',
        label: deadline.status_hint === 'closed_date_unknown' ? 'Closed' : 'TBD',
        className: 'status-tbd',
        date: null,
        days: null
      };
    }

    const diff = date.getTime() - now.getTime();
    const absDays = Math.ceil(Math.abs(diff) / MS_DAY);

    if (diff >= 0) {
      if (diff < 48 * 60 * 60 * 1000) {
        const hours = Math.max(1, Math.ceil(diff / (60 * 60 * 1000)));
        return { kind: 'upcoming', label: `${hours}h left`, className: 'status-soon', date, days: 0 };
      }
      return {
        kind: 'upcoming',
        label: `${Math.ceil(diff / MS_DAY)}d left`,
        className: Math.ceil(diff / MS_DAY) <= 30 ? 'status-soon' : 'status-upcoming',
        date,
        days: Math.ceil(diff / MS_DAY)
      };
    }

    return {
      kind: 'expired',
      label: `${absDays}d ago`,
      className: 'status-expired',
      date,
      days: -absDays
    };
  }

  function allDeadlineStates(conf) {
    return (conf.deadlines || []).map(deadline => ({ deadline, state: deadlineState(deadline) }));
  }

  function primaryDeadline(conf) {
    const states = allDeadlineStates(conf);
    const upcoming = states
      .filter(item => item.state.kind === 'upcoming')
      .sort((a, b) => a.state.date - b.state.date);
    if (upcoming.length) return upcoming[0];

    const expired = states
      .filter(item => item.state.kind === 'expired')
      .sort((a, b) => b.state.date - a.state.date);
    if (expired.length) return expired[0];

    return states[0] || {
      deadline: { label: 'Deadline', display: 'TBD', type: 'tbd' },
      state: { kind: 'tbd', label: 'TBD', className: 'status-tbd', date: null, days: null }
    };
  }

  function sortKey(conf) {
    const item = primaryDeadline(conf);
    if (item.state.kind === 'upcoming') return item.state.date.getTime();
    if (item.state.kind === 'expired') return Date.now() + MS_DAY * 1000 + Math.abs(item.state.days || 0) * MS_DAY;
    return Date.now() + MS_DAY * 2000;
  }

  function matchesQuery(conf, query) {
    if (!query) return true;
    const haystack = [
      conf.acronym,
      conf.name,
      conf.category,
      conf.location,
      conf.year,
      conf.note,
      ...(conf.tags || []),
      ...(conf.deadlines || []).map(item => `${item.label} ${item.type} ${item.display}`)
    ].join(' ').toLowerCase();
    return haystack.includes(query.trim().toLowerCase());
  }

  function matchesStatus(conf, status) {
    if (status === 'all') return true;
    const states = allDeadlineStates(conf).map(item => item.state);
    if (status === 'upcoming') return states.some(item => item.kind === 'upcoming');
    if (status === 'next30') return states.some(item => item.kind === 'upcoming' && item.days != null && item.days <= 30);
    if (status === 'expired') return states.length > 0 && states.every(item => item.kind === 'expired');
    if (status === 'tbd') return states.some(item => item.kind === 'tbd');
    return true;
  }

  function filteredConferences() {
    return conferences
      .filter(conf => state.category === 'All' || conf.category === state.category)
      .filter(conf => matchesQuery(conf, state.query))
      .filter(conf => matchesStatus(conf, state.status))
      .sort((a, b) => sortKey(a) - sortKey(b) || String(a.acronym).localeCompare(String(b.acronym)));
  }

  function categoryList() {
    return [...new Set(conferences.map(conf => conf.category).filter(Boolean))].sort();
  }

  function renderCategoryChips() {
    categoryChips.innerHTML = categoryList().map(category => (
      `<button class="chip" type="button" data-category="${escapeHtml(category)}">${escapeHtml(category)}</button>`
    )).join('');
  }

  function updateActiveChips() {
    document.querySelectorAll('[data-category]').forEach(button => {
      button.classList.toggle('active', button.dataset.category === state.category);
    });
  }

  function renderDeadlineList(conf) {
    return (conf.deadlines || []).map(deadline => {
      const dState = deadlineState(deadline);
      return `<li>
        <span>${escapeHtml(deadline.label || deadline.type || 'Deadline')}</span>
        <span>${escapeHtml(deadline.display || 'TBD')} · ${escapeHtml(dState.label)}</span>
      </li>`;
    }).join('');
  }

  function renderTags(conf) {
    return (conf.tags || []).slice(0, 7).map(tag => `<span class="tag">${escapeHtml(tag)}</span>`).join('');
  }

  function actionLink(url, label) {
    if (!url) return '';
    return `<a href="${escapeHtml(url)}" target="_blank" rel="noreferrer">${escapeHtml(label)}</a>`;
  }

  function renderCard(conf) {
    const primary = primaryDeadline(conf);
    const deadline = primary.deadline;
    const dState = primary.state;
    const conferenceDates = formatDateRange(conf.conference_start, conf.conference_end);

    return `<article class="conference-card">
      <div class="card-top">
        <div class="card-title">
          <h3>${escapeHtml(conf.acronym)} ${escapeHtml(conf.year || '')}</h3>
          <p>${escapeHtml(conf.name || '')}</p>
        </div>
        <span class="category-pill">${escapeHtml(conf.category || 'General')}</span>
      </div>

      <div class="deadline-box">
        <p class="kicker">Next tracked deadline</p>
        <div class="deadline-main">
          <div>
            <p class="deadline-label">${escapeHtml(deadline.label || 'Deadline')}</p>
            <p class="deadline-date">${escapeHtml(deadline.display || 'TBD')}</p>
          </div>
          <span class="status-badge ${escapeHtml(dState.className)}">${escapeHtml(dState.label)}</span>
        </div>
      </div>

      <ul class="meta-list">
        <li><strong>Conference:</strong> ${escapeHtml(conferenceDates)}</li>
        <li><strong>Location:</strong> ${escapeHtml(conf.location || 'TBD')}</li>
        <li><strong>Last checked:</strong> ${escapeHtml(conf.last_checked || 'TBD')}</li>
      </ul>

      <ul class="deadline-list">${renderDeadlineList(conf)}</ul>
      ${conf.note ? `<p class="deadline-date">${escapeHtml(conf.note)}</p>` : ''}
      <div class="tags">${renderTags(conf)}</div>
      <div class="card-actions">
        ${actionLink(conf.website, 'Official')}
        ${actionLink(conf.submission_url, 'Submit')}
        ${actionLink(conf.source_url, 'Source')}
      </div>
    </article>`;
  }

  function renderStats() {
    const states = conferences.flatMap(conf => allDeadlineStates(conf).map(item => item.state));
    const upcomingCount = states.filter(item => item.kind === 'upcoming').length;
    const tbdCount = states.filter(item => item.kind === 'tbd').length;
    document.getElementById('stat-total').textContent = conferences.length;
    document.getElementById('stat-upcoming').textContent = upcomingCount;
    document.getElementById('stat-tbd').textContent = tbdCount;
  }

  function render() {
    const items = filteredConferences();
    grid.innerHTML = items.map(renderCard).join('');
    resultCount.textContent = `${items.length} of ${conferences.length} conferences shown`;
    emptyState.hidden = items.length !== 0;
    updateActiveChips();
  }

  function attachEvents() {
    document.querySelectorAll('[data-category]').forEach(button => {
      button.addEventListener('click', () => {
        state.category = button.dataset.category;
        render();
      });
    });

    searchInput.addEventListener('input', event => {
      state.query = event.target.value;
      render();
    });

    statusFilter.addEventListener('change', event => {
      state.status = event.target.value;
      render();
    });

    resetButton.addEventListener('click', () => {
      state.category = 'All';
      state.query = '';
      state.status = 'all';
      searchInput.value = '';
      statusFilter.value = 'all';
      render();
    });
  }

  renderCategoryChips();
  attachEvents();
  renderStats();
  render();
})();
