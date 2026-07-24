let timerInterval;
let timeLeft = 0;

function startTimer(minutes) {
  clearInterval(timerInterval); // safety: purana timer band

  timeLeft = minutes * 60;

  updateTimerDisplay();

  timerInterval = setInterval(() => {
    timeLeft--;

    updateTimerDisplay();

    if (timeLeft <= 0) {
      clearInterval(timerInterval);
      alert("⏰ Time Up! Exam auto submitted.");
      submitExam();
    }
  }, 1000);
}

function updateTimerDisplay() {
  let min = Math.floor(timeLeft / 60);
  let sec = timeLeft % 60;

  document.getElementById("timer").innerText =
    `${min}:${sec < 10 ? "0" + sec : sec}`;
}

function stopTimer() {
  clearInterval(timerInterval);
}

