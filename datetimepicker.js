document.addEventListener("DOMContentLoaded", function () {
  flatpickr("#flatpickr", {
    enableTime: true,
    dateFormat: "Y-m-d H:i",
    time_24hr: true,
    inline: true,
    locale: "uk",
    onReady: function (selectedDates, dateStr, instance) {
      const tg = window.Telegram.WebApp;
      instance.input.value = "Нічого не обрано";
      const clearButton = document.createElement("button");
      clearButton.textContent = "Очистити";
      clearButton.type = "button";
      clearButton.className = "flatpickr-clear-btn";
      clearButton.disabled = true;

      clearButton.addEventListener("click", function () {
        instance.clear();
        instance.input.value = "Нічого не обрано";
        clearButton.disabled = true;
      });

      const okButton = document.createElement("button");
      okButton.textContent = "OK";
      okButton.type = "button";
      okButton.className = "flatpickr-ok-btn";
      okButton.disabled = true;

      okButton.addEventListener("click", function () {
        const dt = instance.input.value;

        tg.sendData(
          JSON.stringify({
            dt: dt,
          })
        );
      });

      const buttonContainer = document.createElement("div");
      buttonContainer.style.display = "flex";
      buttonContainer.style.alignItems = "center";
      buttonContainer.style.justifyContent = "center";
      buttonContainer.style.gap = "60px";
      buttonContainer.style.marginTop = "10px";

      buttonContainer.appendChild(clearButton);
      buttonContainer.appendChild(okButton);

      instance.calendarContainer.appendChild(buttonContainer);

      instance.config.onChange.push(function (selectedDates) {
        clearButton.disabled = selectedDates.length === 0;
        okButton.disabled = selectedDates.length === 0;
      });
    },
  });
});
