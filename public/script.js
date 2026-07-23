function showMessage(element, text, type = 'neutral') {
  if (!element) return;
  element.textContent = text;
  element.className = `message ${type}`;
}

function escapeHtml(value) {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

async function apiRequest(url, options = {}) {
  const response = await fetch(url, {
    credentials: 'same-origin',
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {})
    },
    ...options
  });

  let body = {};
  try {
    body = await response.json();
  } catch {
    body = {};
  }

  if (!response.ok) {
    const error = new Error(body.message || `Request failed with status ${response.status}.`);
    error.status = response.status;
    error.body = body;
    throw error;
  }

  return body;
}

function setupQuickSearch() {
  const quickSearchForm = document.getElementById('quickSearchForm');
  const quickSearchInput = document.getElementById('quickSearchInput');

  if (!quickSearchForm || !quickSearchInput) return;

  quickSearchForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const searchValue = quickSearchInput.value.trim();

    if (!searchValue) {
      alert('Enter a department, instructor, course number, or title.');
      return;
    }

    window.location.href = `course_search.html?search=${encodeURIComponent(searchValue)}`;
  });
}

function setupCourseSearchPage() {
  const searchForm = document.getElementById('courseSearchForm');
  const departmentInput = document.getElementById('departmentInput');
  const instructorInput = document.getElementById('instructorInput');
  const courseNumberInput = document.getElementById('courseNumberInput');
  const clearSearchButton = document.getElementById('clearSearchButton');
  const resultsContainer = document.getElementById('courseResults');
  const resultSummary = document.getElementById('resultSummary');

  if (!searchForm || !resultsContainer || !resultSummary) return;

  function renderCourses(courses) {
    resultsContainer.innerHTML = '';

    if (courses.length === 0) {
      resultsContainer.innerHTML = `
        <article class="feature-card full-width-card">
          <h3>No Matching Courses Found</h3>
          <p>Try a different department, instructor, or course number.</p>
        </article>
      `;
      showMessage(resultSummary, '0 matching course sections found.', 'neutral');
      return;
    }

    for (const course of courses) {
      const article = document.createElement('article');
      article.className = 'feature-card';

      article.innerHTML = `
        <h3>${escapeHtml(course.courseCode)} - ${escapeHtml(course.title)}</h3>
        <p><strong>Section:</strong> ${escapeHtml(course.section)}</p>
        <p><strong>Department:</strong> ${escapeHtml(course.departmentName)}</p>
        <p><strong>Instructor:</strong> ${escapeHtml(course.instructor)}</p>
        <p><strong>Credit Hours:</strong> ${escapeHtml(course.credits)}</p>
        <p><strong>REAL Designation:</strong> ${course.realDesignation ? 'Yes' : 'No'}</p>
        <p><strong>Prerequisites:</strong> ${escapeHtml(course.prerequisites)}</p>
        <p><strong>Modality:</strong> ${escapeHtml(course.modality)}</p>
        <p><strong>Meeting Time:</strong> ${escapeHtml(course.meetingTime)}</p>
        <p><strong>Location:</strong> ${escapeHtml(course.location || 'To be announced')}</p>
        <p><strong>Enrollment:</strong> ${escapeHtml(course.enrolled)} / ${escapeHtml(course.capacity)}</p>
        <p><strong>Open Seats:</strong> ${escapeHtml(course.openSeats)}</p>
        <p><span class="badge ${course.isFull ? 'badge-closed' : 'badge-open'}">${course.isFull ? 'Full / Closed' : 'Open'}</span></p>
      `;

      resultsContainer.appendChild(article);
    }

    showMessage(
      resultSummary,
      `${courses.length} matching course section(s) found from the database.`,
      'success'
    );
  }

  async function loadCourses({ useQuickSearch = false } = {}) {
    showMessage(resultSummary, 'Loading course sections from the server...', 'neutral');
    resultsContainer.innerHTML = '';

    const params = new URLSearchParams();

    if (useQuickSearch) {
      const quickSearchValue = new URLSearchParams(window.location.search).get('search');
      if (quickSearchValue) params.set('search', quickSearchValue.trim());
    } else {
      if (departmentInput.value.trim()) params.set('department', departmentInput.value.trim());
      if (instructorInput.value.trim()) params.set('instructor', instructorInput.value.trim());
      if (courseNumberInput.value.trim()) params.set('courseNumber', courseNumberInput.value.trim());
    }

    try {
      const data = await apiRequest(`/api/courses?${params.toString()}`);
      renderCourses(data.courses || []);
    } catch (error) {
      showMessage(resultSummary, error.message, 'error');
      resultsContainer.innerHTML = `
        <article class="feature-card full-width-card">
          <h3>Course Search Unavailable</h3>
          <p>The server could not retrieve course records.</p>
        </article>
      `;
    }
  }

  searchForm.addEventListener('submit', (event) => {
    event.preventDefault();
    loadCourses();
  });

  if (clearSearchButton) {
    clearSearchButton.addEventListener('click', () => {
      departmentInput.value = '';
      instructorInput.value = '';
      courseNumberInput.value = '';
      history.replaceState(null, '', window.location.pathname);
      loadCourses();
    });
  }

  const quickSearchValue = new URLSearchParams(window.location.search).get('search');
  loadCourses({ useQuickSearch: Boolean(quickSearchValue) });
}

function setupStudentRegistrationPage() {
  const loginForm = document.getElementById('studentLoginForm');
  const loginMessage = document.getElementById('studentLoginMessage');
  const studentSummary = document.getElementById('studentSummary');
  const enrolledList = document.getElementById('enrolledSessionsList');
  const logoutButton = document.getElementById('studentLogoutButton');

  if (!loginForm || !studentSummary || !enrolledList) return;

  function renderLoggedOut() {
    studentSummary.innerHTML = `
      <h3>Student Summary</h3>
      <p><strong>Status:</strong> Not logged in</p>
      <p>Log in to retrieve student information from the server.</p>
    `;

    enrolledList.innerHTML = `
      <div>
        <h3>Login Required</h3>
        <p>The server requires an authenticated student session before returning schedule records.</p>
      </div>
    `;

    if (logoutButton) logoutButton.hidden = true;
  }

  function renderStudentSummary(student, totalCredits = 0) {
    studentSummary.innerHTML = `
      <h3>Student Summary</h3>
      <p><strong>Name:</strong> ${escapeHtml(student.name)}</p>
      <p><strong>Student ID:</strong> ${escapeHtml(student.studentNumber)}</p>
      <p><strong>Email:</strong> ${escapeHtml(student.email)}</p>
      ${student.majorDepartment ? `<p><strong>Major:</strong> ${escapeHtml(student.majorDepartment)}</p>` : ''}
      <p><strong>Total Credits:</strong> ${escapeHtml(totalCredits)}</p>
      <p><strong>Status:</strong> Authenticated</p>
    `;

    if (logoutButton) logoutButton.hidden = false;
  }

  function renderSchedule(schedule) {
    enrolledList.innerHTML = '';

    if (schedule.length === 0) {
      enrolledList.innerHTML = `
        <div>
          <h3>No Enrolled Sessions</h3>
          <p>This student currently has zero registered sections in the database.</p>
        </div>
      `;
      return;
    }

    for (const section of schedule) {
      const card = document.createElement('div');
      card.innerHTML = `
        <h3>${escapeHtml(section.courseCode)} - Section ${escapeHtml(section.section)}</h3>
        <p>${escapeHtml(section.title)}</p>
        <p><strong>Instructor:</strong> ${escapeHtml(section.instructor)}</p>
        <p><strong>Term:</strong> ${escapeHtml(section.term)}</p>
        <p><strong>Time:</strong> ${escapeHtml(section.meetingTime)}</p>
        <p><strong>Location:</strong> ${escapeHtml(section.location || 'To be announced')}</p>
        <p><strong>Modality:</strong> ${escapeHtml(section.modality)}</p>
        <p><strong>Credits:</strong> ${escapeHtml(section.credits)}</p>
      `;
      enrolledList.appendChild(card);
    }
  }

  async function loadSchedule() {
    const data = await apiRequest('/api/student/schedule');
    renderStudentSummary(data.student, data.totalCredits);
    renderSchedule(data.schedule || []);
  }

  async function checkSession() {
    try {
      await apiRequest('/api/auth/me');
      await loadSchedule();
      showMessage(loginMessage, 'Active student session restored from the server.', 'success');
    } catch (error) {
      renderLoggedOut();
      if (error.status !== 401) showMessage(loginMessage, error.message, 'error');
    }
  }

  loginForm.addEventListener('submit', async (event) => {
    event.preventDefault();

    const studentNumber = document.getElementById('studentIdInput').value.trim();
    const password = document.getElementById('studentPasswordInput').value;

    if (!studentNumber || !password) {
      showMessage(loginMessage, 'Student ID and password are required.', 'error');
      return;
    }

    showMessage(loginMessage, 'Validating credentials with the server...', 'neutral');

    try {
      const data = await apiRequest('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ studentNumber, password })
      });

      showMessage(loginMessage, data.message, 'success');
      document.getElementById('studentPasswordInput').value = '';
      await loadSchedule();
    } catch (error) {
      renderLoggedOut();
      showMessage(loginMessage, error.message, 'error');
    }
  });

  if (logoutButton) {
    logoutButton.addEventListener('click', async () => {
      try {
        const data = await apiRequest('/api/auth/logout', {
          method: 'POST',
          body: JSON.stringify({})
        });
        renderLoggedOut();
        showMessage(loginMessage, data.message, 'success');
      } catch (error) {
        showMessage(loginMessage, error.message, 'error');
      }
    });
  }

  checkSession();
}

document.addEventListener('DOMContentLoaded', () => {
  setupQuickSearch();
  setupCourseSearchPage();
  setupStudentRegistrationPage();
});
