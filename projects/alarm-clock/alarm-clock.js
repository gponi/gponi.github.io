// Alarm Clock JavaScript

document.addEventListener('DOMContentLoaded', () => {
    const clockDisplay = document.getElementById('clock');
    const alarmStatus = document.getElementById('alarm-status');
    const setAlarmBtn = document.getElementById('set-alarm-btn');
    const hoursSelect = document.getElementById('hours');
    const minutesSelect = document.getElementById('minutes');
    const ampmSelect = document.getElementById('ampm');
    const alarmSound = document.getElementById('alarm-sound');

    let alarmTime = null;
    let alarmTimeout = null;
    let isAlarmSet = false;

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
        clearTimeout(alarmTimeout);
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

    // Handle button click
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

    // Update clock immediately and then every second
    updateClock();
    setInterval(updateClock, 1000);
});
