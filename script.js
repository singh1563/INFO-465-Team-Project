const courseSections = [
  {
    id: "INFO-465-001",
    department: "INFO",
    courseNumber: "465",
    courseCode: "INFO 465",
    title: "Projects in Information Systems",
    instructor: "Dr. Michael McGarry",
    credits: 3,
    prerequisites: "INFO 350, INFO 364, INFO 370",
    modality: "Online / Zoom",
    section: "001",
    days: "Monday / Wednesday",
    time: "10:30 AM - 11:45 AM",
    location: "Online / Zoom",
    enrolled: 22,
    capacity: 30
  },
  {
    id: "INFO-465-002",
    department: "INFO",
    courseNumber: "465",
    courseCode: "INFO 465",
    title: "Projects in Information Systems",
    instructor: "Dr. Michael McGarry",
    credits: 3,
    prerequisites: "INFO 350, INFO 364, INFO 370",
    modality: "In Person",
    section: "002",
    days: "Tuesday / Thursday",
    time: "1:00 PM - 2:15 PM",
    location: "Snead Hall 2045",
    enrolled: 27,
    capacity: 30
  },
  {
    id: "INFO-364-001",
    department: "INFO",
    courseNumber: "364",
    courseCode: "INFO 364",
    title: "Database Systems",
    instructor: "Prof. Carter",
    credits: 3,
    prerequisites: "INFO 350",
    modality: "In Person",
    section: "001",
    days: "Tuesday / Thursday",
    time: "1:00 PM - 2:15 PM",
    location: "Snead Hall 3012",
    enrolled: 28,
    capacity: 35
  },
  {
    id: "INFO-370-003",
    department: "INFO",
    courseNumber: "370",
    courseCode: "INFO 370",
    title: "Systems Analysis",
    instructor: "Prof. Nguyen",
    credits: 3,
    prerequisites: "INFO 350",
    modality: "Hybrid",
    section: "003",
    days: "Monday / Wednesday",
    time: "3:00 PM - 4:15 PM",
    location: "Hybrid",
    enrolled: 34,
    capacity: 34
  },
  {
    id: "INFO-350-001",
    department: "INFO",
    courseNumber: "350",
    courseCode: "INFO 350",
    title: "Programming Fundamentals",
    instructor: "Prof. Davis",
    credits: 3,
    prerequisites: "None",
    modality: "Online",
    section: "001",
    days: "Monday / Wednesday",
    time: "10:30 AM - 11:45 AM",
    location: "Online",
    enrolled: 18,
    capacity: 30
  },
  {
    id: "MKTG-302-001",
    department: "MKTG",
    courseNumber: "302",
    courseCode: "MKTG 302",
    title: "Marketing Management",
    instructor: "Prof. Allen",
    credits: 3,
    prerequisites: "MKTG 301",
    modality: "Online",
    section: "001",
    days: "Tuesday / Thursday",
    time: "9:00 AM - 10:15 AM",
    location: "Online",
    enrolled: 21,
    capacity: 30
  }
];

const studentAccounts = {
  "V00999999": {
    password: "student123",
    name: "Demo Student",
    term: "Spring 2027",
    status: "Eligible to Register",
    enrolledSectionIds: ["INFO-350-001", "INFO-364-001"]
  }
};

const instructorAccounts = {
  "MCGARRY": {
    password: "instructor123",
    name: "Dr. Michael McGarry",
    department: "Information Systems",
    term: "Spring 2027",
    assignedSectionIds: ["INFO-465-001", "INFO-465-002", "INFO-370-003"]
  }
};

function getOpenSeats(section) {
  return section.capacity - section.enrolled;
}

function isSectionFull(section) {
  return getOpenSeats(section) <= 0;
}

function findSectionById(sectionId) {
  return courseSections.find((section) => section.id === sectionId);
}

function showMessage(element, text, type) {
  if (!element) return;
  element.textContent = text;
  element.className = "message " + type;
}

function setupQuickSearch() {
  const quickSearchForm = document.getElementById("quickSearchForm");
  const quickSearchInput = document.getElementById("quickSearchInput");

  if (!quickSearchForm || !quickSearchInput) return;

  quickSearchForm.addEventListener("submit", function (event) {
    event.preventDefault();
    const searchValue = quickSearchInput.value.trim();

    if (searchValue === "") {
      alert("Please enter a department, instructor, or course number.");
      return;
    }

    window.location.href = "course_search.html?search=" + encodeURIComponent(searchValue);
  });
}

function setupCourseSearchPage() {
  const searchForm = document.getElementById("courseSearchForm");
  const departmentInput = document.getElementById("departmentInput");
  const instructorInput = document.getElementById("instructorInput");
  const courseNumberInput = document.getElementById("courseNumberInput");
  const clearSearchButton = document.getElementById("clearSearchButton");
  const resultsContainer = document.getElementById("courseResults");
  const resultSummary = document.getElementById("resultSummary");

  if (!searchForm || !resultsContainer) return;

  const urlParams = new URLSearchParams(window.location.search);
  const quickSearchValue = urlParams.get("search");

  if (quickSearchValue) {
    const cleanedValue = quickSearchValue.trim();

    departmentInput.value = cleanedValue;
    instructorInput.value = cleanedValue;
    courseNumberInput.value = cleanedValue;
  }

  function renderResults(sections) {
    resultsContainer.innerHTML = "";

    if (sections.length === 0) {
      resultsContainer.innerHTML = `
        <article class="feature-card full-width-card">
          <h3>No Matching Courses Found</h3>
          <p>
            Try searching by department code, instructor name,
            or course number.
          </p>
        </article>
      `;

      resultSummary.textContent = "0 matching course sections found.";
      return;
    }

    sections.forEach((section) => {
      const openSeats = getOpenSeats(section);
      const sectionFull = isSectionFull(section);

      const availabilityClass = sectionFull
        ? "badge badge-closed"
        : "badge badge-open";

      const availabilityText = sectionFull
        ? "Full / Closed"
        : "Open";

      const article = document.createElement("article");
      article.className = "feature-card";

      article.innerHTML = `
        <h3>${section.courseCode} - ${section.title}</h3>

        <p><strong>Section:</strong> ${section.section}</p>
        <p><strong>Department:</strong> ${section.department}</p>
        <p><strong>Instructor:</strong> ${section.instructor}</p>
        <p><strong>Credit Hours:</strong> ${section.credits}</p>
        <p><strong>Prerequisites:</strong> ${section.prerequisites}</p>
        <p><strong>Modality:</strong> ${section.modality}</p>
        <p>
          <strong>Meeting Time:</strong>
          ${section.days}, ${section.time}
        </p>
        <p>
          <strong>Enrollment:</strong>
          ${section.enrolled} / ${section.capacity}
        </p>
        <p><strong>Open Seats:</strong> ${openSeats}</p>

        <p>
          <span class="${availabilityClass}">
            ${availabilityText}
          </span>
        </p>

        ${
          sectionFull
            ? `
              <button type="button" disabled>
                Section Full
              </button>
            `
            : `
              <a href="registration.html?section=${encodeURIComponent(section.id)}">
                View Registration Options
              </a>
            `
        }
      `;

      resultsContainer.appendChild(article);
    });

    resultSummary.textContent =
      `${sections.length} matching course section(s) found.`;
  }

  function filterSections() {
    const departmentValue =
      departmentInput.value.trim().toLowerCase();

    const instructorValue =
      instructorInput.value.trim().toLowerCase();

    const courseNumberValue =
      courseNumberInput.value.trim().toLowerCase();

    const isQuickSearch =
      quickSearchValue &&
      departmentValue === instructorValue &&
      instructorValue === courseNumberValue;

    let filteredSections;

    if (isQuickSearch) {
      const value = departmentValue;

      filteredSections = courseSections.filter((section) => {
        return (
          section.department.toLowerCase().includes(value) ||
          section.instructor.toLowerCase().includes(value) ||
          section.courseNumber.toLowerCase().includes(value) ||
          section.courseCode.toLowerCase().includes(value) ||
          section.title.toLowerCase().includes(value)
        );
      });
    } else {
      filteredSections = courseSections.filter((section) => {
        const matchesDepartment =
          departmentValue === "" ||
          section.department
            .toLowerCase()
            .includes(departmentValue);

        const matchesInstructor =
          instructorValue === "" ||
          section.instructor
            .toLowerCase()
            .includes(instructorValue);

        const matchesCourseNumber =
          courseNumberValue === "" ||
          section.courseNumber
            .toLowerCase()
            .includes(courseNumberValue) ||
          section.courseCode
            .toLowerCase()
            .includes(courseNumberValue);

        return (
          matchesDepartment &&
          matchesInstructor &&
          matchesCourseNumber
        );
      });
    }

    renderResults(filteredSections);
  }

  searchForm.addEventListener("submit", function (event) {
    event.preventDefault();
    filterSections();
  });

  if (clearSearchButton) {
    clearSearchButton.addEventListener("click", function () {
      departmentInput.value = "";
      instructorInput.value = "";
      courseNumberInput.value = "";

      history.replaceState(
        null,
        "",
        window.location.pathname
      );

      renderResults(courseSections);
    });
  }

  if (quickSearchValue) {
    filterSections();
  } else {
    renderResults(courseSections);
  }
}

function setupStudentRegistrationPage() {
  const loginForm = document.getElementById("studentLoginForm");
  const loginMessage = document.getElementById("studentLoginMessage");
  const studentSummary = document.getElementById("studentSummary");
  const enrolledList = document.getElementById("enrolledSessionsList");
  const registrationOptions =
    document.getElementById("registrationOptions");

  if (
    !loginForm ||
    !studentSummary ||
    !enrolledList ||
    !registrationOptions
  ) {
    return;
  }

  const urlParams = new URLSearchParams(window.location.search);
  const selectedSectionId = urlParams.get("section");

  function getActiveStudent() {
    const activeStudentId =
      localStorage.getItem("activeStudentId");

    if (
      activeStudentId &&
      studentAccounts[activeStudentId]
    ) {
      return studentAccounts[activeStudentId];
    }

    return null;
  }

  function renderLoggedOutState() {
    studentSummary.innerHTML = `
      <h3>Student Summary</h3>

      <p>
        <strong>Status:</strong>
        Not logged in
      </p>

      <p>
        Use the demo credentials to access student-specific
        registration information.
      </p>

      <p class="demo-credentials">
        <strong>Demo Student ID:</strong>
        V00999999
        <br>
        <strong>Password:</strong>
        student123
      </p>
    `;

    enrolledList.innerHTML = `
      <div>
        <h3>Login Required</h3>

        <p>
          A student must log in before enrolled classes
          can be displayed.
        </p>
      </div>
    `;
  }

  function renderStudentDashboard(student) {
    const enrolledSections =
      student.enrolledSectionIds
        .map(findSectionById)
        .filter(Boolean);

    const totalCredits =
      enrolledSections.reduce(
        (sum, section) => sum + section.credits,
        0
      );

    studentSummary.innerHTML = `
      <h3>Student Summary</h3>

      <p>
        <strong>Name:</strong>
        ${student.name}
      </p>

      <p>
        <strong>Term:</strong>
        ${student.term}
      </p>

      <p>
        <strong>Total Credits:</strong>
        ${totalCredits}
      </p>

      <p>
        <strong>Status:</strong>
        ${student.status}
      </p>
    `;

    enrolledList.innerHTML = "";

    if (enrolledSections.length === 0) {
      enrolledList.innerHTML = `
        <div>
          <h3>No Enrolled Sessions</h3>

          <p>
            The student is not currently registered
            for any course sections.
          </p>
        </div>
      `;

      return;
    }

    enrolledSections.forEach((section) => {
      const card = document.createElement("div");

      card.innerHTML = `
        <h3>
          ${section.courseCode} -
          Section ${section.section}
        </h3>

        <p>${section.title}</p>

        <p>
          <strong>Instructor:</strong>
          ${section.instructor}
        </p>

        <p>
          <strong>Time:</strong>
          ${section.days}, ${section.time}
        </p>

        <p>
          <strong>Modality:</strong>
          ${section.modality}
        </p>
      `;

      enrolledList.appendChild(card);
    });
  }

  function studentHasCourse(student, section) {
    return student.enrolledSectionIds.some(
      (sectionId) => {
        const enrolledSection =
          findSectionById(sectionId);

        return (
          enrolledSection &&
          enrolledSection.courseCode === section.courseCode
        );
      }
    );
  }

  function registerForSection(sectionId) {
    const student = getActiveStudent();
    const section = findSectionById(sectionId);

    if (!student) {
      showMessage(
        loginMessage,
        "Please log in before registering for a course section.",
        "error"
      );

      return;
    }

    if (!section) {
      showMessage(
        loginMessage,
        "The selected course section could not be found.",
        "error"
      );

      return;
    }

    if (isSectionFull(section)) {
      showMessage(
        loginMessage,
        `Registration blocked. ${section.courseCode} Section ${section.section} is full.`,
        "error"
      );

      renderRegistrationOptions();
      return;
    }

    if (studentHasCourse(student, section)) {
      showMessage(
        loginMessage,
        `Registration blocked. You are already enrolled in a section of ${section.courseCode}.`,
        "error"
      );

      renderRegistrationOptions();
      return;
    }

    student.enrolledSectionIds.push(section.id);
    section.enrolled += 1;

    showMessage(
      loginMessage,
      `Registration successful. ${section.courseCode} Section ${section.section} was added to your schedule.`,
      "success"
    );

    renderStudentDashboard(student);
    renderRegistrationOptions();
  }

  function renderRegistrationOptions() {
    registrationOptions.innerHTML = "";

    let sectionsToDisplay = courseSections;

    if (selectedSectionId) {
      const selectedSection =
        findSectionById(selectedSectionId);

      if (selectedSection) {
        sectionsToDisplay = [
          selectedSection,
          ...courseSections.filter(
            (section) =>
              section.id !== selectedSection.id
          )
        ];
      }
    }

    sectionsToDisplay.forEach((section) => {
      const openSeats = getOpenSeats(section);
      const sectionFull = isSectionFull(section);
      const student = getActiveStudent();

      const duplicateCourse =
        student
          ? studentHasCourse(student, section)
          : false;

      const article =
        document.createElement("article");

      article.className = "feature-card";

      let buttonText = "Register";
      let buttonDisabled = false;

      if (sectionFull) {
        buttonText = "Section Full";
        buttonDisabled = true;
      } else if (duplicateCourse) {
        buttonText = "Already Enrolled";
        buttonDisabled = true;
      }

      article.innerHTML = `
        <h3>
          ${section.courseCode} -
          ${section.title}
        </h3>

        <p>
          <strong>Section:</strong>
          ${section.section}
        </p>

        <p>
          <strong>Instructor:</strong>
          ${section.instructor}
        </p>

        <p>
          <strong>Modality:</strong>
          ${section.modality}
        </p>

        <p>
          <strong>Meeting Time:</strong>
          ${section.days}, ${section.time}
        </p>

        <p>
          <strong>Open Seats:</strong>
          ${openSeats}
        </p>

        <p>
          <strong>Credits:</strong>
          ${section.credits}
        </p>

        <button
          type="button"
          data-section-id="${section.id}"
          ${buttonDisabled ? "disabled" : ""}
        >
          ${buttonText}
        </button>
      `;

      registrationOptions.appendChild(article);
    });

    const registrationButtons =
      registrationOptions.querySelectorAll(
        "button[data-section-id]"
      );

    registrationButtons.forEach((button) => {
      button.addEventListener(
        "click",
        function () {
          registerForSection(
            button.dataset.sectionId
          );
        }
      );
    });
  }

  loginForm.addEventListener(
    "submit",
    function (event) {
      event.preventDefault();

      const studentId =
        document
          .getElementById("studentIdInput")
          .value
          .trim()
          .toUpperCase();

      const password =
        document
          .getElementById("studentPasswordInput")
          .value;

      const student =
        studentAccounts[studentId];

      if (
        !student ||
        student.password !== password
      ) {
        localStorage.removeItem(
          "activeStudentId"
        );

        showMessage(
          loginMessage,
          "Login failed. Use Student ID V00999999 and password student123 for the demo.",
          "error"
        );

        renderLoggedOutState();
        renderRegistrationOptions();

        return;
      }

      localStorage.setItem(
        "activeStudentId",
        studentId
      );

      showMessage(
        loginMessage,
        "Student login successful. Registration options are now available.",
        "success"
      );

      renderStudentDashboard(student);
      renderRegistrationOptions();
    }
  );

  const activeStudent = getActiveStudent();

  if (activeStudent) {
    renderStudentDashboard(activeStudent);
  } else {
    renderLoggedOutState();
  }

  renderRegistrationOptions();
}

function setupInstructorSchedulePage() {
  const loginForm = document.getElementById("instructorLoginForm");
  const loginMessage = document.getElementById("instructorLoginMessage");
  const instructorProfile = document.getElementById("instructorProfile");
  const assignedSessions = document.getElementById("assignedSessionsList");

  if (!loginForm || !instructorProfile || !assignedSessions) return;

  function renderLoggedOutState() {
    instructorProfile.innerHTML = `
      <h3>Instructor Profile</h3>
      <p><strong>Status:</strong> Not logged in</p>
      <p>Use the demo credentials to access instructor-specific course information.</p>
      <p class="demo-credentials"><strong>Demo Instructor ID:</strong> MCGARRY<br><strong>Password:</strong> instructor123</p>
    `;
    assignedSessions.innerHTML = `
      <div>
        <h3>Login Required</h3>
        <p>An instructor must log in before assigned teaching sessions can be displayed.</p>
      </div>
    `;
  }

  function renderInstructorDashboard(instructor) {
    const sections = instructor.assignedSectionIds.map(findSectionById).filter(Boolean);

    instructorProfile.innerHTML = `
      <h3>Instructor Profile</h3>
      <p><strong>Name:</strong> ${instructor.name}</p>
      <p><strong>Department:</strong> ${instructor.department}</p>
      <p><strong>Term:</strong> ${instructor.term}</p>
      <p><strong>Assigned Sessions:</strong> ${sections.length}</p>
    `;

    assignedSessions.innerHTML = "";

    sections.forEach((section) => {
      const card = document.createElement("div");
      const openSeats = getOpenSeats(section);
      card.innerHTML = `
        <h3>${section.courseCode} - Section ${section.section}</h3>
        <p><strong>Course:</strong> ${section.title}</p>
        <p><strong>Days:</strong> ${section.days}</p>
        <p><strong>Time:</strong> ${section.time}</p>
        <p><strong>Location:</strong> ${section.location}</p>
        <p><strong>Modality:</strong> ${section.modality}</p>
        <p><strong>Enrollment:</strong> ${section.enrolled} / ${section.capacity}</p>
        <p><strong>Open Seats:</strong> ${openSeats}</p>
      `;
      assignedSessions.appendChild(card);
    });
  }

  loginForm.addEventListener("submit", function (event) {
    event.preventDefault();

    const instructorId = document.getElementById("instructorIdInput").value.trim().toUpperCase();
    const password = document.getElementById("instructorPasswordInput").value;
    const instructor = instructorAccounts[instructorId];

    if (!instructor || instructor.password !== password) {
      showMessage(loginMessage, "Login failed. Use Instructor ID MCGARRY and password instructor123 for the demo.", "error");
      renderLoggedOutState();
      return;
    }

    localStorage.setItem("activeInstructorId", instructorId);
    showMessage(loginMessage, "Instructor login successful. Assigned teaching sessions are now displayed.", "success");
    renderInstructorDashboard(instructor);
  });

  const activeInstructorId = localStorage.getItem("activeInstructorId");
  if (activeInstructorId && instructorAccounts[activeInstructorId]) {
    renderInstructorDashboard(instructorAccounts[activeInstructorId]);
  } else {
    renderLoggedOutState();
  }
}

document.addEventListener("DOMContentLoaded", function () {
  setupQuickSearch();
  setupCourseSearchPage();
  setupStudentRegistrationPage();
  setupInstructorSchedulePage();
});
