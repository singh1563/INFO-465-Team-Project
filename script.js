document.addEventListener("DOMContentLoaded", function () {
  const quickSearchForm = document.getElementById("quickSearchForm");
  const quickSearchInput = document.getElementById("quickSearchInput");

  if (quickSearchForm) {
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
});