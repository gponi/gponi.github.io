// Alarm Clock JavaScript

document.addEventListener('DOMContentLoaded', () => {
    const clockDisplay = document.getElementById('clock');
    const alarmStatus = document.getElementById('alarm-status');
    const setAlarmBtn = document.getElementById('set-alarm-btn');
    const hoursSelect = document.getElementById('hours');
    const minutesSelect = document.getElementById('minutes');
    const ampmSelect = document.getElementById('ampm');
    const alarmSound = document.getElementById('alarm-sound');

    const soundSelector = document.getElementById('sound-selector');
    const playSoundBtn = document.getElementById('play-sound-btn');
    const uploadSoundBtn = document.getElementById('upload-sound-btn');
    const customSoundInput = document.getElementById('custom-sound-input');

    let alarmTime = null;
    let isAlarmSet = false;
    let isPlayingPreview = false;

    // Initialize alarm sound source
    alarmSound.src = `Sounds/${soundSelector.value}`;

    // Populate Hours and Minutes Dropdowns
    for (let i = 1; i <= 12; i++) {
        const option = document.createElement('option');
        option.value = i < 10 ? '0' + i : i;
        option.textContent = i;
        hoursSelect.appendChild(option);
    }

    for (let i = 0; i < 60; i++) {
        const option = document.createElement('option');
        option.value = i < 10 ? '0' + i : i;
        option.textContent = i < 10 ? '0' + i : i;
        minutesSelect.appendChild(option);
    }

    // Update the clock every second
    function updateClock() {
        const now = new Date();
        let hours = now.getHours();
        const minutes = String(now.getMinutes()).padStart(2, '0');
        const seconds = String(now.getSeconds()).padStart(2, '0');
        let ampm = 'AM';

        if (hours >= 12) {
            ampm = 'PM';
            hours = hours > 12 ? hours - 12 : hours;
        }
        hours = hours === 0 ? 12 : hours;
        hours = String(hours).padStart(2, '0');

        const timeString = `${hours}:${minutes}:${seconds} ${ampm}`;
        clockDisplay.textContent = timeString;

        // Check if it's time for the alarm
        if (alarmTime && timeString === alarmTime) {
            triggerAlarm();
        }
    }

    // Function to set the alarm
    function setAlarm() {
        const selectedHour = hoursSelect.value;
        const selectedMinute = minutesSelect.value;
        const selectedAMPM = ampmSelect.value;

        alarmTime = `${selectedHour}:${selectedMinute}:00 ${selectedAMPM}`;
        isAlarmSet = true;
        setAlarmBtn.textContent = 'Cancel Alarm';
        setAlarmBtn.classList.add('active');
        alarmStatus.textContent = `Alarm set for ${selectedHour}:${selectedMinute} ${selectedAMPM}`;
    }

    // Function to cancel the alarm
    function cancelAlarm() {
        isAlarmSet = false;
        alarmTime = null;
        setAlarmBtn.textContent = 'Set Alarm';
        setAlarmBtn.classList.remove('active');
        alarmStatus.textContent = '';
        alarmSound.pause();
        alarmSound.currentTime = 0;
    }

    // Function to trigger the alarm
    function triggerAlarm() {
        alarmSound.play();
        setAlarmBtn.textContent = 'Stop';
        alarmStatus.textContent = 'Alarm ringing!';
    }

    // Handle Set/Cancel Alarm button click
    setAlarmBtn.addEventListener('click', () => {
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

    // Handle Sound Selector change
    soundSelector.addEventListener('change', () => {
        const selectedSound = soundSelector.value;
        alarmSound.src = `Sounds/${selectedSound}`;
    });

    // Handle Play/Pause Sound button click
    playSoundBtn.addEventListener('click', () => {
        if (isPlayingPreview) {
            alarmSound.pause();
            alarmSound.currentTime = 0;
            playSoundBtn.innerHTML = '<i class="fas fa-play"></i>';
            isPlayingPreview = false;
        } else {
            const selectedSound = soundSelector.value;
            alarmSound.src = `Sounds/${selectedSound}`;
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
    uploadSoundBtn.addEventListener('click', () => {
        customSoundInput.click();
    });

    // Handle Custom Sound Input change
    customSoundInput.addEventListener('change', (event) => {
        const file = event.target.files[0];
        if (file) {
            const url = URL.createObjectURL(file);
            const option = document.createElement('option');
            option.value = url;
            option.textContent = `CustomSound1`;
            soundSelector.appendChild(option);
            soundSelector.value = url;
            alarmSound.src = url;
        }
    });

    // Update clock immediately and then every second
    updateClock();
    setInterval(updateClock, 1000);
});
