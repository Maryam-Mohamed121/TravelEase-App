document.addEventListener("DOMContentLoaded", function () {
  // Initialize Bootstrap components
  const tooltipTriggerList = [].slice.call(
    document.querySelectorAll('[data-bs-toggle="tooltip"]')
  );
  const tooltipList = tooltipTriggerList.map(function (tooltipTriggerEl) {
    return new bootstrap.Tooltip(tooltipTriggerEl);
  });

  // Initialize modals
  const successModal = new bootstrap.Modal(
    document.getElementById("successModal")
  );
  const confirmModal = new bootstrap.Modal(
    document.getElementById("confirmModal")
  );
  const errorModal = new bootstrap.Modal(document.getElementById("errorModal"));

  // Modal helper functions
  function showSuccess(message) {
    document.getElementById("successMessage").textContent = message;
    successModal.show();
  }

  function showError(message) {
    document.getElementById("errorMessage").textContent = message;
    errorModal.show();
  }

  function showConfirm(message, callback) {
    document.getElementById("confirmMessage").textContent = message;
    const confirmBtn = document.getElementById("confirmAction");

    // Remove previous event listener
    const newConfirmBtn = confirmBtn.cloneNode(true);
    confirmBtn.parentNode.replaceChild(newConfirmBtn, confirmBtn);

    // Add new event listener
    newConfirmBtn.addEventListener("click", () => {
      confirmModal.hide();
      callback();
    });

    confirmModal.show();
  }

  const toastEl = document.getElementById("reminderToast");
  const toast = new bootstrap.Toast(toastEl);

  // Smooth scrolling for navigation links
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener("click", function (e) {
      e.preventDefault();

      const targetId = this.getAttribute("href");
      const targetElement = document.querySelector(targetId);

      if (targetElement) {
        window.scrollTo({
          top: targetElement.offsetTop - 70,
          behavior: "smooth",
        });
      }
    });
  });

  // Trip Planner Functionality
  const tripForm = document.getElementById("tripForm");
  const plansList = document.getElementById("plansList");
  const reminderForm = document.getElementById("reminderForm");
  const addToPlanButtons = document.querySelectorAll(".add-to-plan");
  const addToPlanModal = new bootstrap.Modal(
    document.getElementById("addToPlanModal")
  );
  const selectPlan = document.getElementById("selectPlan");
  const confirmAddToPlan = document.getElementById("confirmAddToPlan");
  const reviewForm = document.getElementById("reviewForm");
  const reviewsList = document.getElementById("reviewsList");

  let trips = JSON.parse(localStorage.getItem("trips")) || [];
  let reminders = JSON.parse(localStorage.getItem("reminders")) || [];
  let reviews = JSON.parse(localStorage.getItem("reviews")) || [];

  // Initialize edit plan modal
  const editPlanModal = new bootstrap.Modal(
    document.getElementById("editPlanModal")
  );
  const savePlanEdit = document.getElementById("savePlanEdit");

  // Load trips and reminders
  function loadTrips() {
    plansList.innerHTML = "";

    if (trips.length === 0) {
      plansList.innerHTML =
        '<div class="alert alert-info">No trips planned yet. Create your first trip!</div>';
      return;
    }

    trips.forEach((trip, index) => {
      const tripElement = document.createElement("a");
      tripElement.href = "#";
      tripElement.className = "list-group-item list-group-item-action";
      tripElement.innerHTML = `
        <div class="d-flex w-100 justify-content-between">
          <h5 class="mb-1">${trip.name}</h5>
          <small>${formatDate(trip.startDate)} - ${formatDate(
        trip.endDate
      )}</small>
        </div>
        <p class="mb-1">${trip.destination}</p>
        ${trip.notes ? `<small class="d-block mb-2">${trip.notes}</small>` : ""}
        <div class="float-end">
          <button class="btn btn-sm btn-outline-primary edit-trip me-2" data-index="${index}">
            <i class="fas fa-edit"></i> Edit
          </button>
          <button class="btn btn-sm btn-outline-danger delete-trip" data-index="${index}">
            <i class="fas fa-trash"></i> Delete
          </button>
        </div>
      `;

      plansList.appendChild(tripElement);
    });

    // Update select plan dropdown
    selectPlan.innerHTML = "";
    trips.forEach((trip, index) => {
      const option = document.createElement("option");
      option.value = index;
      option.textContent = `${trip.name} (${formatDate(
        trip.startDate
      )} - ${formatDate(trip.endDate)})`;
      selectPlan.appendChild(option);
    });
  }

  // Format date for display
  function formatDate(dateString) {
    const options = { year: "numeric", month: "short", day: "numeric" };
    return new Date(dateString).toLocaleDateString(undefined, options);
  }

  // Save trip
  tripForm.addEventListener("submit", function (e) {
    e.preventDefault();

    const trip = {
      name: document.getElementById("tripName").value,
      destination: document.getElementById("destination").value,
      startDate: document.getElementById("startDate").value,
      endDate: document.getElementById("endDate").value,
      notes: document.getElementById("notes").value,
    };

    trips.push(trip);
    localStorage.setItem("trips", JSON.stringify(trips));
    loadTrips();

    // Reset form
    this.reset();

    // Show success message
    showSuccess("Trip saved successfully!");
  });

  // Edit trip functionality
  plansList.addEventListener("click", function (e) {
    // Delete trip handler
    if (
      e.target.classList.contains("delete-trip") ||
      e.target.closest(".delete-trip")
    ) {
      e.preventDefault();
      const button = e.target.classList.contains("delete-trip")
        ? e.target
        : e.target.closest(".delete-trip");
      const index = button.dataset.index;

      showConfirm("Are you sure you want to delete this trip?", () => {
        trips.splice(index, 1);
        localStorage.setItem("trips", JSON.stringify(trips));
        loadTrips();
      });
    }

    // Edit trip handler
    if (
      e.target.classList.contains("edit-trip") ||
      e.target.closest(".edit-trip")
    ) {
      e.preventDefault();
      const button = e.target.classList.contains("edit-trip")
        ? e.target
        : e.target.closest(".edit-trip");
      const index = button.dataset.index;
      const trip = trips[index];

      // Populate edit form
      document.getElementById("editPlanIndex").value = index;
      document.getElementById("editTripName").value = trip.name;
      document.getElementById("editDestination").value = trip.destination;
      document.getElementById("editStartDate").value = trip.startDate;
      document.getElementById("editEndDate").value = trip.endDate;
      document.getElementById("editNotes").value = trip.notes || "";

      editPlanModal.show();
    }
  });

  // Save edited plan
  savePlanEdit.addEventListener("click", function () {
    const form = document.getElementById("editPlanForm");
    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }

    const index = document.getElementById("editPlanIndex").value;
    const editedTrip = {
      name: document.getElementById("editTripName").value,
      destination: document.getElementById("editDestination").value,
      startDate: document.getElementById("editStartDate").value,
      endDate: document.getElementById("editEndDate").value,
      notes: document.getElementById("editNotes").value,
      items: trips[index].items || [], // Preserve existing items
    };

    trips[index] = editedTrip;
    localStorage.setItem("trips", JSON.stringify(trips));
    editPlanModal.hide();
    loadTrips();
    showSuccess("Trip updated successfully!");
  });

  // Set reminder
  reminderForm.addEventListener("submit", function (e) {
    e.preventDefault();

    const reminder = {
      name: document.getElementById("reminderName").value,
      date: document.getElementById("reminderDate").value,
      notes: document.getElementById("reminderNotes").value,
    };

    reminders.push(reminder);
    localStorage.setItem("reminders", JSON.stringify(reminders));

    // Reset form
    this.reset();

    // Show success message
    showSuccess("Reminder set successfully!");

    // Check for upcoming reminders
    checkReminders();
  });

  // Check for reminders
  function checkReminders() {
    const now = new Date();

    reminders.forEach((reminder) => {
      const reminderDate = new Date(reminder.date);
      const timeDiff = reminderDate - now;

      // If reminder is within the next 5 minutes
      if (timeDiff > 0 && timeDiff < 300000) {
        showReminder(reminder);
      }
    });
  }

  // Show reminder notification
  function showReminder(reminder) {
    const toastBody = document.getElementById("reminderToastBody");
    toastBody.textContent = `${reminder.name}: ${
      reminder.notes || "No additional notes"
    }`;
    toast.show();
  }

  // Add to plan modal
  addToPlanButtons.forEach((button) => {
    button.addEventListener("click", function () {
      document.getElementById("itemType").value = this.dataset.type;
      document.getElementById("itemName").value = this.dataset.name;

      if (trips.length === 0) {
        showError("Please create a trip plan first!");
        return;
      }

      addToPlanModal.show();
    });
  });

  // Confirm add to plan
  confirmAddToPlan.addEventListener("click", function () {
    const tripIndex = selectPlan.value;
    const itemType = document.getElementById("itemType").value;
    const itemName = document.getElementById("itemName").value;
    const planDate = document.getElementById("planDate").value;
    const planNotes = document.getElementById("planNotes").value;

    if (!trips[tripIndex].items) {
      trips[tripIndex].items = [];
    }

    trips[tripIndex].items.push({
      type: itemType,
      name: itemName,
      date: planDate,
      notes: planNotes,
    });

    localStorage.setItem("trips", JSON.stringify(trips));
    addToPlanModal.hide();

    // Reset form
    document.getElementById("addToPlanForm").reset();

    // Show success message
    showSuccess(`${itemName} added to your trip plan!`);
  });

  // Rating stars
  const ratingStars = document.querySelectorAll(".rating-input i");
  const ratingValue = document.getElementById("ratingValue");

  ratingStars.forEach((star) => {
    star.addEventListener("click", function () {
      const rating = this.dataset.rating;
      ratingValue.value = rating;

      ratingStars.forEach((s, i) => {
        if (i < rating) {
          s.classList.add("fas", "active");
          s.classList.remove("far");
        } else {
          s.classList.add("far");
          s.classList.remove("fas", "active");
        }
      });
    });
  });

  // Submit review
  reviewForm.addEventListener("submit", function (e) {
    e.preventDefault();

    const review = {
      placeName: document.getElementById("placeName").value,
      placeType: document.getElementById("placeType").value,
      rating: document.getElementById("ratingValue").value,
      reviewText: document.getElementById("reviewText").value,
      date: new Date().toISOString(),
    };

    reviews.push(review);
    localStorage.setItem("reviews", JSON.stringify(reviews));
    loadReviews();

    // Reset form
    this.reset();
    ratingStars.forEach((star) => {
      star.classList.add("far");
      star.classList.remove("fas", "active");
    });

    // Show success message
    showSuccess("Review submitted successfully!");
  });

  // Load reviews
  function loadReviews() {
    reviewsList.innerHTML = "";

    if (reviews.length === 0) {
      reviewsList.innerHTML =
        '<div class="alert alert-info">No reviews yet. Be the first to submit one!</div>';
      return;
    }

    reviews
      .slice()
      .reverse()
      .forEach((review, index) => {
        const reviewElement = document.createElement("div");
        reviewElement.className = "mb-4 fade-in";
        reviewElement.innerHTML = `
                <div class="card">
                    <div class="card-body">
                        <div class="d-flex justify-content-between">
                            <h5>${review.placeName}</h5>
                            <div>
                                <small class="text-muted">${formatDate(
                                  review.date
                                )}</small>
                                <button class="btn btn-sm btn-outline-danger ms-2 delete-review" data-index="${
                                  reviews.length - 1 - index
                                }">
                                    <i class="fas fa-trash"></i>
                                </button>
                            </div>
                        </div>
                        <div class="mb-2">
                            <span class="badge" style="background-color: var(--primary-color);">${
                              review.placeType
                            }</span>
                            <div class="rating d-inline-block ms-2">
                                ${'<i class="fas fa-star"></i>'.repeat(
                                  Math.floor(review.rating)
                                )}
                                ${
                                  review.rating % 1 >= 0.5
                                    ? '<i class="fas fa-star-half-alt"></i>'
                                    : ""
                                }
                                ${'<i class="far fa-star"></i>'.repeat(
                                  5 - Math.ceil(review.rating)
                                )}
                                <span class="ms-1">${review.rating}</span>
                            </div>
                        </div>
                        <p>${review.reviewText}</p>
                    </div>
                </div>
            `;

        reviewsList.appendChild(reviewElement);
      });
  }

  // Delete review
  reviewsList.addEventListener("click", function (e) {
    if (
      e.target.classList.contains("delete-review") ||
      e.target.closest(".delete-review")
    ) {
      e.preventDefault();
      const button = e.target.classList.contains("delete-review")
        ? e.target
        : e.target.closest(".delete-review");
      const index = button.dataset.index;

      showConfirm("Are you sure you want to delete this review?", () => {
        reviews.splice(index, 1);
        localStorage.setItem("reviews", JSON.stringify(reviews));
        loadReviews();
      });
    }
  });

  // Initial load
  loadTrips();
  loadReviews();
  checkReminders();

  // Check reminders every minute
  setInterval(checkReminders, 60000);

  // Add animations when scrolling
  const animateOnScroll = function () {
    const elements = document.querySelectorAll(".card, .fade-in");

    elements.forEach((element) => {
      const elementPosition = element.getBoundingClientRect().top;
      const screenPosition = window.innerHeight / 1.3;

      if (elementPosition < screenPosition) {
        element.classList.add("animate__animated", "animate__fadeInUp");
      }
    });
  };

  window.addEventListener("scroll", animateOnScroll);
  animateOnScroll(); // Run once on page load
});
