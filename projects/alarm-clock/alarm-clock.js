// Alarm Clock JavaScript

document.addEventListener("DOMContentLoaded", () => {
    // Updated to reference the digital clock display
    const clockDisplay = document.getElementById("digital-clock");
    const alarmStatus = document.getElementById("alarm-status");
    const setAlarmBtn = document.getElementById("set-alarm-btn");
    const saveBookmarkBtn = document.getElementById("save-bookmark-btn");
    const snoozeBtn = document.getElementById("snooze-btn");
    const alarmTimeInput = document.getElementById("alarm-time");
    const alarmSound = document.getElementById("alarm-sound");
  
    const soundSelector = document.getElementById("sound-selector");
    const playSoundBtn = document.getElementById("play-sound-btn");
    const uploadSoundBtn = document.getElementById("upload-sound-btn");
    const customSoundInput = document.getElementById("custom-sound-input");
    const uploadedSoundName = document.getElementById("uploaded-sound-name");
    const volumeControl = document.getElementById("volume-control");
  
    const bookmarksContainer = document.getElementById("bookmarks-container");
  
    let alarmTime = null;
    let isAlarmSet = false;
    let isPlayingPreview = false;
    let bookmarks = [];
  
    // Initialize alarm sound source
    alarmSound.src = soundSelector.value;
  
    // Set initial volume
    alarmSound.volume = volumeControl.value;
  
    // Load bookmarks from localStorage
    if (localStorage.getItem("alarmBookmarks")) {
      bookmarks = JSON.parse(localStorage.getItem("alarmBookmarks"));
    }
    // Render bookmarks immediately to reserve space and prevent layout shifts
    renderBookmarks();
  
    // Update the clock every second
    function updateClock() {
      const now = new Date();
      let hours = now.getHours();
      const minutes = String(now.getMinutes()).padStart(2, "0");
      const seconds = String(now.getSeconds()).padStart(2, "0");
      let ampm = "AM";
  
      if (hours >= 12) {
        ampm = "PM";
        hours = hours > 12 ? hours - 12 : hours;
      }
      hours = hours === 0 ? 12 : hours;
      hours = String(hours).padStart(2, "0");
  
      const timeString = `${hours}:${minutes}:${seconds} ${ampm}`;
  
      // Update digital clock display without affecting the analog clock
      clockDisplay.textContent = timeString;
  
      // Check if it's time for the alarm
      if (alarmTime && timeString === alarmTime) {
        triggerAlarm();
      }
    }
  
    // Function to set the alarm
    function setAlarm() {
      if (!alarmTimeInput.value) {
        displayMessage("Please select a valid time.");
        return;
      }
  
      const [hours, minutes] = alarmTimeInput.value.split(":");
      const selectedHour = String(hours).padStart(2, "0");
      const selectedMinute = String(minutes).padStart(2, "0");
  
      // Determine AM/PM
      let selectedAMPM = "AM";
      let hourNumber = parseInt(selectedHour);
      if (hourNumber >= 12) {
        selectedAMPM = "PM";
        if (hourNumber > 12) {
          hourNumber -= 12;
        }
      } else if (hourNumber === 0) {
        hourNumber = 12;
      }
      const displayHour = String(hourNumber).padStart(2, "0");
  
      alarmTime = `${displayHour}:${selectedMinute}:00 ${selectedAMPM}`;
      isAlarmSet = true;
      setAlarmBtn.textContent = "Cancel Alarm";
      setAlarmBtn.classList.add("active");
      alarmStatus.textContent = `Alarm set for ${displayHour}:${selectedMinute} ${selectedAMPM}`;
    }
  
    // Function to cancel the alarm
    function cancelAlarm() {
      isAlarmSet = false;
      alarmTime = null;
      setAlarmBtn.textContent = "Set Alarm";
      setAlarmBtn.classList.remove("active");
      alarmStatus.textContent = "";
      alarmSound.pause();
      alarmSound.currentTime = 0;
      document.body.classList.remove("alarm-ringing");
      snoozeBtn.style.display = "none";
    }
  
    // Function to trigger the alarm
    function triggerAlarm() {
      alarmSound.play();
      setAlarmBtn.textContent = "Stop";
      snoozeBtn.style.display = "inline-block";
      alarmStatus.textContent = "Alarm ringing!";
      document.body.classList.add("alarm-ringing");
    }
  
    // Handle Set/Cancel Alarm button click
    setAlarmBtn.addEventListener("click", () => {
      if (isAlarmSet) {
        if (alarmSound.paused) {
          // Alarm is set but not ringing, cancel it
          cancelAlarm();
        } else {
          // Alarm is ringing, stop it
          cancelAlarm();
        }
      } else {
        setAlarm();
      }
    });
  
    // Handle Save Alarm Bookmark button click
    saveBookmarkBtn.addEventListener("click", () => {
      if (!alarmTimeInput.value) {
        displayMessage("Please select a valid time.");
        return;
      }
  
      const [hours, minutes] = alarmTimeInput.value.split(":");
      const selectedHour = String(hours).padStart(2, "0");
      const selectedMinute = String(minutes).padStart(2, "0");
  
      // Determine AM/PM
      let selectedAMPM = "AM";
      let hourNumber = parseInt(selectedHour);
      if (hourNumber >= 12) {
        selectedAMPM = "PM";
        if (hourNumber > 12) {
          hourNumber -= 12;
        }
      } else if (hourNumber === 0) {
        hourNumber = 12;
      }
      const displayHour = String(hourNumber).padStart(2, "0");
  
      const bookmarkTime = `${displayHour}:${selectedMinute} ${selectedAMPM}`;
  
      // Check if the bookmark already exists
      if (!bookmarks.includes(bookmarkTime)) {
        bookmarks.push(bookmarkTime);
        saveBookmarks();
        renderBookmarks();
        displayMessage("Bookmark saved.");
      } else {
        displayMessage("This alarm time is already bookmarked.");
      }
    });
  
    // Save bookmarks to localStorage
    function saveBookmarks() {
      localStorage.setItem("alarmBookmarks", JSON.stringify(bookmarks));
    }
  
    // Render bookmarks in the bookmarks container
    function renderBookmarks() {
      bookmarksContainer.innerHTML = "";
  
      bookmarks.forEach((bookmark) => {
        const button = document.createElement("button");
        button.classList.add("bookmark-btn");
        button.textContent = bookmark;
  
        // Delete button
        const deleteBtn = document.createElement("button");
        deleteBtn.classList.add("delete-bookmark");
        deleteBtn.innerHTML = "&times;";
        deleteBtn.addEventListener("click", (e) => {
          e.stopPropagation();
          deleteBookmark(bookmark);
        });
        button.appendChild(deleteBtn);
  
        // When bookmark is clicked, set the time picker to the bookmark time
        button.addEventListener("click", () => {
          const [time, ampm] = bookmark.split(" ");
          let [hour, minute] = time.split(":");
          hour = parseInt(hour);
          if (ampm === "PM" && hour < 12) {
            hour += 12;
          }
          if (ampm === "AM" && hour === 12) {
            hour = 0;
          }
          hour = String(hour).padStart(2, "0");
          alarmTimeInput.value = `${hour}:${minute}`;
        });
  
        bookmarksContainer.appendChild(button);
      });
    }
  
    // Delete a bookmark
    function deleteBookmark(bookmark) {
      bookmarks = bookmarks.filter((b) => b !== bookmark);
      saveBookmarks();
      renderBookmarks();
      displayMessage("Bookmark deleted.");
    }
  
    // Display a temporary message
    function displayMessage(message) {
      const msgDiv = document.createElement("div");
      msgDiv.classList.add("message");
      msgDiv.textContent = message;
      document.body.appendChild(msgDiv);
      setTimeout(() => {
        msgDiv.remove();
      }, 2000);
    }
  
    // Handle Sound Selector change
    soundSelector.addEventListener("change", () => {
      const selectedSound = soundSelector.value;
      alarmSound.src = selectedSound.includes("blob:")
        ? selectedSound
        : selectedSound; // Use the value directly
    });
  
    // Handle Play/Pause Sound button click
    playSoundBtn.addEventListener("click", () => {
      if (isPlayingPreview) {
        alarmSound.pause();
        alarmSound.currentTime = 0;
        playSoundBtn.innerHTML = '<i class="fas fa-play"></i>';
        isPlayingPreview = false;
      } else {
        const selectedSound = soundSelector.value;
        alarmSound.src = selectedSound.includes("blob:")
          ? selectedSound
          : selectedSound; // Use the value directly
        alarmSound.play();
        playSoundBtn.innerHTML = '<i class="fas fa-pause"></i>';
        isPlayingPreview = true;
  
        // Ensure the play button resets when the sound ends
        alarmSound.onended = () => {
          playSoundBtn.innerHTML = '<i class="fas fa-play"></i>';
          isPlayingPreview = false;
        };
      }
    });
  
    // Handle Upload Sound button click
    uploadSoundBtn.addEventListener("click", () => {
      customSoundInput.click();
    });
  
    // Handle Custom Sound Input change
    customSoundInput.addEventListener("change", (event) => {
      const file = event.target.files[0];
      if (file) {
        const url = URL.createObjectURL(file);
        const option = document.createElement("option");
        option.value = url;
        option.textContent = file.name;
        soundSelector.appendChild(option);
        soundSelector.value = url;
        alarmSound.src = url;
        uploadedSoundName.textContent = `Uploaded: ${file.name}`;
      }
    });
  
    // Handle Volume Control
    volumeControl.addEventListener("input", () => {
      alarmSound.volume = volumeControl.value;
    });
  
    // Handle Snooze Button Click
    snoozeBtn.addEventListener("click", () => {
      alarmSound.pause();
      alarmSound.currentTime = 0;
      snoozeAlarm();
    });
  
    function snoozeAlarm() {
      document.body.classList.remove("alarm-ringing");
      snoozeBtn.style.display = "none";
      displayMessage("Alarm snoozed for 5 minutes.");
      // Set alarm for 5 minutes later
      const now = new Date();
      now.setMinutes(now.getMinutes() + 5);
      const snoozeHour = String(now.getHours()).padStart(2, "0");
      const snoozeMinute = String(now.getMinutes()).padStart(2, "0");
      const snoozeSecond = String(now.getSeconds()).padStart(2, "0");
      let ampm = "AM";
      let hour = parseInt(snoozeHour);
      if (hour >= 12) {
        ampm = "PM";
        if (hour > 12) hour -= 12;
      }
      if (hour === 0) hour = 12;
      hour = String(hour).padStart(2, "0");
      alarmTime = `${hour}:${snoozeMinute}:${snoozeSecond} ${ampm}`;
      isAlarmSet = true;
    }
  
    // Update clock immediately and then every second
    updateClock();
    setInterval(updateClock, 1000);
  
    // Dark Mode Toggle
    const themeToggleBtn = document.getElementById("theme-toggle");
    const body = document.body;
  
    // Load theme from localStorage
    if (localStorage.getItem("theme") === "dark") {
      body.classList.add("dark-mode");
      themeToggleBtn.innerHTML = '<i class="fas fa-sun"></i>';
    }
  
    themeToggleBtn.addEventListener("click", () => {
      body.classList.toggle("dark-mode");
      if (body.classList.contains("dark-mode")) {
        themeToggleBtn.innerHTML = '<i class="fas fa-sun"></i>';
        localStorage.setItem("theme", "dark");
      } else {
        themeToggleBtn.innerHTML = '<i class="fas fa-moon"></i>';
        localStorage.setItem("theme", "light");
      }
    });
  
    // Update SVG Clock Hands
    const hourHand = document.getElementById("hour-hand");
    const minuteHand = document.getElementById("minute-hand");
    const secondHand = document.getElementById("second-hand");
  
    function updateClockHands() {
      const now = new Date();
      const seconds = now.getSeconds();
      const minutes = now.getMinutes();
      const hours = now.getHours();
  
      // Calculate degrees for each hand
      const secondsDeg = (seconds / 60) * 360;
      const minutesDeg = ((minutes + seconds / 60) / 60) * 360;
      const hoursDeg = ((hours % 12 + minutes / 60 + seconds / 3600) / 12) * 360;
  
      // Update the SVG clock hands
      secondHand.setAttribute('transform', `rotate(${secondsDeg}, 100, 100)`);
      minuteHand.setAttribute('transform', `rotate(${minutesDeg}, 100, 100)`);
      hourHand.setAttribute('transform', `rotate(${hoursDeg}, 100, 100)`);
    }
  
    // Update clock hands immediately and then every second
    updateClockHands();
    setInterval(updateClockHands, 1000);
  });
  