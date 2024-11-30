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
  const randomAdvancedSoundCheckbox = document.getElementById(
    "random-advanced-sound"
  );
  const soundSelector = document.getElementById("sound-selector");
  const playSoundBtn = document.getElementById("play-sound-btn");
  const uploadSoundBtn = document.getElementById("upload-sound-btn");
  const customSoundInput = document.getElementById("custom-sound-input");
  const uploadedSoundName = document.getElementById("uploaded-sound-name");
  const volumeControl = document.getElementById("volume-control");

  // Advanced Options Elements
  const advancedOptionsToggle = document.getElementById(
    "advanced-options-toggle"
  );
  const advancedOptionsSection = document.getElementById("advanced-options");
  const advancedSoundCheckboxes = advancedOptionsSection.querySelectorAll(
    ".advanced-sounds .form-check-input"
  );

  // Store advanced sounds
  let advancedSounds = [];
  let advancedAudioElements = [];

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
  } else {
    bookmarks = [];
  }

  // Render bookmarks immediately to reserve space and prevent layout shifts
  renderBookmarks();

  // Initialize IndexedDB and load custom sounds
  loadCustomSounds();

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
  function setAlarm(fromUrl = false) {
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

    prepareAdvancedSounds();

    if (!fromUrl) {
      updateAlarmHashParams();
    }
  }

  function prepareAdvancedSounds() {
    if (advancedOptionsToggle.checked) {
      advancedSounds = [];
      advancedAudioElements = [];

      // If random advanced sound is selected
      if (randomAdvancedSoundCheckbox.checked) {
        // Find the selected advanced sound (there should be only one)
        const selectedCheckbox = Array.from(advancedSoundCheckboxes).find(
          (checkbox) => checkbox.checked
        );
        if (selectedCheckbox) {
          const soundSrc = selectedCheckbox.value;
          const audioElement = new Audio(soundSrc);
          audioElement.loop = true; // Loop the advanced sound
          audioElement.volume = volumeControl.value; // Set volume
          advancedAudioElements.push(audioElement);
        }
      } else {
        // Use all selected advanced sounds
        advancedSoundCheckboxes.forEach((checkbox) => {
          if (checkbox.checked) {
            const soundSrc = checkbox.value;
            const audioElement = new Audio(soundSrc);
            audioElement.loop = true; // Loop the advanced sound
            audioElement.volume = volumeControl.value; // Set volume
            advancedAudioElements.push(audioElement);
          }
        });
      }
    } else {
      // If advanced options are not checked, clear the arrays
      advancedSounds = [];
      advancedAudioElements = [];
    }
  }

  // Function to play all alarm sounds
  function playAlarmSounds() {
    alarmSound.play();
    // Play advanced sounds
    advancedAudioElements.forEach((audio) => {
      audio.play();
    });
  }

  // Function to stop all alarm sounds
  function stopAlarmSounds() {
    // Stop main alarm sound
    alarmSound.pause();
    alarmSound.currentTime = 0;
    // Stop all advanced sounds
    advancedAudioElements.forEach((audio) => {
      audio.pause();
      audio.currentTime = 0;
    });
  }

  // Function to cancel the alarm
  function cancelAlarm() {
    isAlarmSet = false;
    alarmTime = null;
    setAlarmBtn.textContent = "Set Alarm";
    setAlarmBtn.classList.remove("active");
    alarmStatus.textContent = "";
    document.body.classList.remove("alarm-ringing");
    snoozeBtn.style.display = "none";

    stopAlarmSounds();

    updateAlarmHashParams();
  }

  function triggerAlarm() {
    playAlarmSounds();
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

  function loadBookmark(bookmark) {
    // Set the time
    const [hourMinute, ampm] = bookmark.time.split(" ");
    let [hour, minute] = hourMinute.split(":");
    hour = parseInt(hour);
    if (ampm === "PM" && hour < 12) {
      hour += 12;
    }
    if (ampm === "AM" && hour === 12) {
      hour = 0;
    }
    hour = String(hour).padStart(2, "0");
    alarmTimeInput.value = `${hour}:${minute}`;

    // Set the sound
    if (bookmark.isCustomSound) {
      // Handle custom sound
      const option = Array.from(soundSelector.options).find(
        (opt) => opt.value === bookmark.customSoundId && opt.dataset.isCustom
      );
      if (option) {
        soundSelector.value = bookmark.customSoundId;
        const selectedOption =
          soundSelector.options[soundSelector.selectedIndex];
        openDatabase().then((db) => {
          const transaction = db.transaction(["uploadedSounds"], "readonly");
          const objectStore = transaction.objectStore("uploadedSounds");
          const request = objectStore.get(Number(bookmark.customSoundId));

          request.onsuccess = (event) => {
            const result = event.target.result;
            if (result) {
              const file = result.file;
              const url = URL.createObjectURL(file);
              alarmSound.src = url;
              selectedOption.dataset.blobUrl = url;
            }
          };

          request.onerror = (event) => {
            console.error("Failed to retrieve sound:", event.target.error);
          };
        });
      } else {
        displayMessage("Custom sound not found.");
      }
    } else {
      soundSelector.value = bookmark.sound;
      alarmSound.src = bookmark.sound;
    }

    // Set advanced options
    advancedOptionsToggle.checked = bookmark.advancedOptionsEnabled;
    if (bookmark.advancedOptionsEnabled) {
      advancedOptionsSection.style.display = "block";
      randomAdvancedSoundCheckbox.checked = bookmark.randomAdvancedSound;
      if (bookmark.randomAdvancedSound) {
        randomAdvancedSoundCheckbox.dispatchEvent(new Event("change"));
      } else {
        // Uncheck all advanced sounds first
        advancedSoundCheckboxes.forEach((checkbox) => {
          checkbox.checked = false;
        });

        // Check the advanced sounds from the bookmark
        bookmark.advancedSounds.forEach((soundValue) => {
          const checkbox = Array.from(advancedSoundCheckboxes).find(
            (cb) => cb.value === soundValue
          );
          if (checkbox) {
            checkbox.checked = true;
          }
        });
      }
    } else {
      advancedOptionsSection.style.display = "none";
    }

    displayMessage("Bookmark loaded.");
  }

  // Handle Save Alarm Bookmark button click
  saveBookmarkBtn.addEventListener("click", saveBookmark);

  function saveBookmark() {
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

    // Prepare bookmark object
    const bookmark = {
      time: bookmarkTime,
      sound: soundSelector.value,
      isCustomSound:
        !!soundSelector.options[soundSelector.selectedIndex].dataset.isCustom,
      customSoundId: soundSelector.options[soundSelector.selectedIndex].dataset
        .isCustom
        ? soundSelector.value
        : null,
      advancedOptionsEnabled: advancedOptionsToggle.checked,
      randomAdvancedSound: randomAdvancedSoundCheckbox.checked,
      advancedSounds: [],
    };

    // Get selected advanced sounds
    if (bookmark.advancedOptionsEnabled && !bookmark.randomAdvancedSound) {
      advancedSoundCheckboxes.forEach((checkbox) => {
        if (checkbox.checked) {
          bookmark.advancedSounds.push(checkbox.value);
        }
      });
    }

    // Check if the bookmark already exists based on time and settings
    const bookmarkExists = bookmarks.some(
      (b) => JSON.stringify(b) === JSON.stringify(bookmark)
    );

    if (!bookmarkExists) {
      bookmarks.push(bookmark);
      saveBookmarks();
      renderBookmarks();
      displayMessage("Bookmark saved.");
    } else {
      displayMessage("This alarm configuration is already bookmarked.");
    }
  }

  function saveBookmarks() {
    localStorage.setItem("alarmBookmarks", JSON.stringify(bookmarks));
  }

  // Render bookmarks in the bookmarks container
  function renderBookmarks() {
    bookmarksContainer.innerHTML = "";

    bookmarks.forEach((bookmark, index) => {
      const button = document.createElement("button");
      button.classList.add("bookmark-btn");
      button.textContent = bookmark.time;

      // Delete button
      const deleteBtn = document.createElement("button");
      deleteBtn.classList.add("delete-bookmark");
      deleteBtn.innerHTML = "&times;";
      deleteBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        deleteBookmark(index);
      });
      button.appendChild(deleteBtn);

      // When bookmark is clicked, load the alarm configuration
      button.addEventListener("click", () => {
        loadBookmark(bookmark);
      });

      bookmarksContainer.appendChild(button);
    });
  }

  // Delete Bookmark
  function deleteBookmark(index) {
    bookmarks.splice(index, 1);
    saveBookmarks();
    renderBookmarks();
    displayMessage("Bookmark deleted.");
  }

  // Handle Random Advanced Sound Checkbox
  randomAdvancedSoundCheckbox.addEventListener("change", () => {
    if (randomAdvancedSoundCheckbox.checked) {
      // Uncheck and disable all advanced sound checkboxes
      advancedSoundCheckboxes.forEach((checkbox) => {
        checkbox.checked = false;
        checkbox.disabled = true;
      });

      // Randomly select one advanced sound
      const randomIndex = Math.floor(
        Math.random() * advancedSoundCheckboxes.length
      );
      const randomCheckbox = advancedSoundCheckboxes[randomIndex];
      randomCheckbox.checked = true;
    } else {
      // Enable advanced sound checkboxes
      advancedSoundCheckboxes.forEach((checkbox) => {
        checkbox.disabled = false;
        checkbox.checked = false; // Optionally uncheck all
      });
    }

    updateAlarmHashParams();
  });

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

  // IndexedDB Utility Functions
  function openDatabase() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open("AlarmClockDB", 1);

      request.onerror = (event) => {
        console.error("Database error:", event.target.error);
        reject(event.target.error);
      };

      request.onsuccess = (event) => {
        resolve(event.target.result);
      };

      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        // Create an object store for uploaded sounds
        const objectStore = db.createObjectStore("uploadedSounds", {
          keyPath: "id",
          autoIncrement: true,
        });
        // You can create indexes if needed
        objectStore.createIndex("name", "name", { unique: false });
      };
    });
  }

  function addSoundToDB(file) {
    return openDatabase().then((db) => {
      return new Promise((resolve, reject) => {
        const transaction = db.transaction(["uploadedSounds"], "readwrite");
        const objectStore = transaction.objectStore("uploadedSounds");
        const request = objectStore.add({ name: file.name, file });

        request.onsuccess = (event) => {
          resolve(event.target.result); // Returns the key of the added object
        };

        request.onerror = (event) => {
          console.error("Add sound error:", event.target.error);
          reject(event.target.error);
        };
      });
    });
  }

  function getAllSoundsFromDB() {
    return openDatabase().then((db) => {
      return new Promise((resolve, reject) => {
        const transaction = db.transaction(["uploadedSounds"], "readonly");
        const objectStore = transaction.objectStore("uploadedSounds");
        const request = objectStore.getAll();

        request.onsuccess = (event) => {
          resolve(event.target.result); // Returns an array of all stored sounds
        };

        request.onerror = (event) => {
          console.error("Get sounds error:", event.target.error);
          reject(event.target.error);
        };
      });
    });
  }

  function deleteSoundFromDB(id) {
    return openDatabase().then((db) => {
      return new Promise((resolve, reject) => {
        const transaction = db.transaction(["uploadedSounds"], "readwrite");
        const objectStore = transaction.objectStore("uploadedSounds");
        const request = objectStore.delete(id);

        request.onsuccess = () => {
          resolve();
        };

        request.onerror = (event) => {
          reject(event.target.error);
        };
      });
    });
  }

  // Load stored custom sounds from IndexedDB
  function loadCustomSounds() {
    getAllSoundsFromDB()
      .then((sounds) => {
        sounds.forEach((sound) => {
          createCustomSoundOption(sound);
        });

        // If you want to select the last uploaded sound by default
        if (sounds.length > 0) {
          const lastSound = sounds[sounds.length - 1];
          soundSelector.value = lastSound.id;
          alarmSound.src = URL.createObjectURL(lastSound.file);
        }
      })
      .catch((error) => {
        console.error("Failed to load custom sounds:", error);
      });
  }

  // Create a custom sound option
  function createCustomSoundOption(sound) {
    const file = sound.file;
    const url = URL.createObjectURL(file);
    const option = document.createElement("option");
    option.value = sound.id; // Use the IndexedDB key as the value
    option.textContent = file.name + " (Custom)";
    option.dataset.isCustom = "true"; // Mark it as a custom sound
    option.dataset.blobUrl = url; // Store the Blob URL

    // Add delete button
    addDeleteButtonToOption(option);

    soundSelector.appendChild(option);
  }

  // Add delete button to custom sound option
  function addDeleteButtonToOption(option) {
    const deleteBtn = document.createElement("span");
    deleteBtn.textContent = " ×";
    deleteBtn.style.cursor = "pointer";
    deleteBtn.style.color = "red";
    deleteBtn.style.marginLeft = "5px";
    deleteBtn.addEventListener("click", (event) => {
      event.stopPropagation();
      const id = Number(option.value);
      deleteSoundFromDB(id)
        .then(() => {
          soundSelector.removeChild(option);
          displayMessage("Sound deleted.");
        })
        .catch((error) => {
          console.error("Failed to delete sound:", error);
        });
    });
    option.appendChild(deleteBtn);
  }

  alarmTimeInput.addEventListener("change", updateAlarmHashParams);

  // Handle Sound Selector change
  soundSelector.addEventListener("change", () => {
    const selectedValue = soundSelector.value;
    const selectedOption = soundSelector.options[soundSelector.selectedIndex];

    if (selectedOption.dataset.isCustom) {
      // It's a custom sound, retrieve it from IndexedDB
      openDatabase().then((db) => {
        const transaction = db.transaction(["uploadedSounds"], "readonly");
        const objectStore = transaction.objectStore("uploadedSounds");
        const request = objectStore.get(Number(selectedValue));

        request.onsuccess = (event) => {
          const result = event.target.result;
          if (result) {
            const file = result.file;
            const url = URL.createObjectURL(file);
            alarmSound.src = url;

            // Store the Blob URL for later revocation
            selectedOption.dataset.blobUrl = url;
          }
        };

        request.onerror = (event) => {
          console.error("Failed to retrieve sound:", event.target.error);
        };
      });
    } else {
      // It's a default sound
      alarmSound.src = selectedValue;
    }

    updateAlarmHashParams();
  });

  // Handle Play/Pause Sound button click
  playSoundBtn.addEventListener("click", () => {
    if (isPlayingPreview) {
      stopAlarmSounds();
      playSoundBtn.innerHTML = '<i class="fas fa-play"></i>';
      isPlayingPreview = false;
    } else {
      prepareAdvancedSounds();
      playAlarmSounds();
      playSoundBtn.innerHTML = '<i class="fas fa-pause"></i>';
      isPlayingPreview = true;

      // Ensure the play button resets when the main sound ends
      alarmSound.onended = () => {
        stopAlarmSounds();
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
      addSoundToDB(file)
        .then((id) => {
          // Create a Blob URL for the uploaded file
          const url = URL.createObjectURL(file);
          const option = document.createElement("option");
          option.value = id; // Use the IndexedDB key as the value
          option.textContent = file.name + " (Custom)";
          option.dataset.isCustom = "true"; // Mark it as a custom sound
          soundSelector.appendChild(option);
          soundSelector.value = id; // Select the newly added sound
          alarmSound.src = url;
          uploadedSoundName.textContent = `Uploaded: ${file.name}`;

          // Store the Blob URL for later revocation
          option.dataset.blobUrl = url;

          // Add delete button
          addDeleteButtonToOption(option);
        })
        .catch((error) => {
          displayMessage("Failed to save the sound. Please try again.");
          console.error(error);
        });
    }
  });

  // Toggle Advanced Options Section
  advancedOptionsToggle.addEventListener("change", () => {
    if (advancedOptionsToggle.checked) {
      advancedOptionsSection.style.display = "block";
    } else {
      advancedOptionsSection.style.display = "none";
      // Reset advanced sounds selection
      advancedSounds = [];
      advancedAudioElements = [];
    }
    updateAlarmHashParams();
  });

  // Handle Volume Control
  volumeControl.addEventListener("input", () => {
    alarmSound.volume = volumeControl.value;
    // Update volume for advanced sounds
    advancedAudioElements.forEach((audio) => {
      audio.volume = volumeControl.value;
    });
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

    stopAlarmSounds();
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
    const hoursDeg =
      (((hours % 12) + minutes / 60 + seconds / 3600) / 12) * 360;

    // Update the SVG clock hands
    secondHand.setAttribute("transform", `rotate(${secondsDeg}, 100, 100)`);
    minuteHand.setAttribute("transform", `rotate(${minutesDeg}, 100, 100)`);
    hourHand.setAttribute("transform", `rotate(${hoursDeg}, 100, 100)`);
  }

  // Update clock hands immediately and then every second
  updateClockHands();
  setInterval(updateClockHands, 1000);

  // Clean up Blob URLs when the window unloads
  window.addEventListener("unload", () => {
    const options = soundSelector.querySelectorAll("option[data-blob-url]");
    options.forEach((option) => {
      URL.revokeObjectURL(option.dataset.blobUrl);
    });
  });

  function getHashParams() {
    const hash = window.location.hash.substring(1); // Remove the '#' character
    const params = {};
    hash.split("&").forEach((param) => {
      const [key, value] = param.split("=");
      if (key) {
        params[key] = decodeURIComponent(value);
      }
    });
    return params;
  }
  function updateHashParams(params) {
    const hashParams = [];
    for (const key in params) {
      if (params[key] !== undefined && params[key] !== null) {
        hashParams.push(`${key}=${encodeURIComponent(params[key])}`);
      }
    }
    window.location.hash = hashParams.join("&");
  }

  function updateAlarmHashParams() {
    const params = {};

    // Time
    if (alarmTimeInput.value) {
      params.time = alarmTimeInput.value;
    }

    // Alarm Enabled
    params.enabled = isAlarmSet ? "1" : "0";

    // Sound
    const selectedOption = soundSelector.options[soundSelector.selectedIndex];
    if (selectedOption.dataset.isCustom) {
      params.sound = selectedOption.value; // Use ID for custom sounds
    } else {
      params.sound = soundSelector.value;
    }

    // Advanced Options
    if (advancedOptionsToggle.checked) {
      if (randomAdvancedSoundCheckbox.checked) {
        params.advanced = "0";
      } else {
        const selectedIndices = [];
        advancedSoundCheckboxes.forEach((checkbox, index) => {
          if (checkbox.checked) {
            selectedIndices.push(index + 1); // 1-based indexing
          }
        });
        if (selectedIndices.length > 0) {
          params.advanced = selectedIndices.join("-");
        }
      }
    }

    updateHashParams(params);
  }

  advancedSoundCheckboxes.forEach((checkbox) => {
    checkbox.addEventListener("change", updateAlarmHashParams);
  });

  // Parse URL hash parameters
  const urlParams = getHashParams();

  if (urlParams.time) {
    alarmTimeInput.value = urlParams.time;
  }
  if (urlParams.enabled === "1") {
    setAlarm(true); // Pass true to indicate it's from URL
  }
  if (urlParams.sound) {
    const value = urlParams.sound;
    let optionFound = false;

    for (let i = 0; i < soundSelector.options.length; i++) {
      const option = soundSelector.options[i];
      if (option.value === value) {
        soundSelector.selectedIndex = i;
        optionFound = true;
        break;
      }
    }

    if (optionFound) {
      const selectedOption = soundSelector.options[soundSelector.selectedIndex];
      if (selectedOption.dataset.isCustom) {
        // Handle custom sound
        openDatabase().then((db) => {
          const transaction = db.transaction(["uploadedSounds"], "readonly");
          const objectStore = transaction.objectStore("uploadedSounds");
          const request = objectStore.get(Number(value));

          request.onsuccess = (event) => {
            const result = event.target.result;
            if (result) {
              const file = result.file;
              const url = URL.createObjectURL(file);
              alarmSound.src = url;

              // Store the Blob URL for later revocation
              selectedOption.dataset.blobUrl = url;
            }
          };

          request.onerror = (event) => {
            console.error("Failed to retrieve sound:", event.target.error);
          };
        });
      } else {
        // Default sound
        alarmSound.src = soundSelector.value;
      }
    }
  }
  if (urlParams.advanced) {
    advancedOptionsToggle.checked = true;
    advancedOptionsSection.style.display = "block";

    if (urlParams.advanced === "0") {
      // Random advanced sound
      randomAdvancedSoundCheckbox.checked = true;
      randomAdvancedSoundCheckbox.dispatchEvent(new Event("change"));
    } else {
      // Specific advanced sounds
      randomAdvancedSoundCheckbox.checked = false;
      randomAdvancedSoundCheckbox.dispatchEvent(new Event("change"));

      // Uncheck all advanced sounds first
      advancedSoundCheckboxes.forEach((checkbox) => {
        checkbox.checked = false;
      });

      // Parse and check the specified advanced sounds
      const advancedIndices = urlParams.advanced.split("-");
      advancedIndices.forEach((index) => {
        const idx = parseInt(index, 10) - 1; // Adjust for zero-based index
        if (advancedSoundCheckboxes[idx]) {
          advancedSoundCheckboxes[idx].checked = true;
        }
      });
    }
  }
});
