document.addEventListener("DOMContentLoaded", function () {
  const picker = flatpickr("#flatpickr", {
    enableTime: true,
    dateFormat: "Y-m-d H:i",
    time_24hr: true,
    inline: true,
    locale: "uk",
    onReady: function (selectedDates, dateStr, instance) {
      const clearButton = document.createElement("button");
      clearButton.textContent = "Очистити дату та час";
      clearButton.type = "button";
      clearButton.className = "flatpickr-clear-btn";
      //   clearButton.style.margin = "10px";
      //   clearButton.style.padding = "5px 10px";
      //   clearButton.style.backgroundColor = "#f44336";
      //   clearButton.style.color = "#fff";
      //   clearButton.style.border = "none";
      //   clearButton.style.borderRadius = "5px";
      //   clearButton.style.cursor = "pointer";
      clearButton.disabled = true;

      clearButton.addEventListener("click", function () {
        instance.clear();
        clearButton.disabled = true;
      });

      instance.calendarContainer.appendChild(clearButton);

      instance.config.onChange.push(function (selectedDates) {
        clearButton.disabled = selectedDates.length === 0;
      });
    },
  });
});
