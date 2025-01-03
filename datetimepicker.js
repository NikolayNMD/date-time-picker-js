document.addEventListener("DOMContentLoaded", function () {
  flatpickr("#flatpickr", {
    enableTime: true,
    dateFormat: "d.m.Y H:i",
    time_24hr: true,
    inline: true,
    locale: "uk",
    defaultDate: new Date(),
    onReady: function (selectedDates, dateStr, instance) {
      const tg = window.Telegram.WebApp;
      instance.input.value = instance.formatDate(new Date(), "d.m.Y H:i");
      const clearButton = document.createElement("button");
      clearButton.textContent = "Очистити";
      clearButton.type = "button";
      clearButton.className = "flatpickr-clear-btn";
      clearButton.disabled = false;

      const timeInputs = instance.calendarContainer.querySelectorAll(".flatpickr-time input");
      const yearInput = instance.calendarContainer.querySelector(".numInput.cur-year");

      const validateTime = () => {
        const hourInput = timeInputs[0];
        const minuteInput = timeInputs[1];

        const hourValue = parseInt(hourInput.value, 10);
        const minuteValue = parseInt(minuteInput.value, 10);

        const isHourValid = hourValue >= 0 && hourValue <= 24 && hourInput.value.length > 0;
        const isMinuteValid = minuteValue >= 0 && minuteValue <= 59 && minuteInput.value.length > 0;

        okButton.disabled = !(isHourValid && isMinuteValid);
      };

      yearInput.addEventListener("keydown", function (event) {
        if (
          !(
            (event.key >= "0" && event.key <= "9") ||
            ["Backspace", "Delete", "ArrowLeft", "ArrowRight", "Tab"].includes(event.key)
          )
        ) {
          event.preventDefault();
        }
      });

      yearInput.addEventListener("input", function () {
        if (yearInput.value.length > 4) {
          yearInput.value = yearInput.value.slice(0, 4);
        }
      });

      timeInputs.forEach((input, index) => {
        const isHourField = index === 0;

        input.addEventListener("keydown", function (event) {
          if (
            !(
              (event.key >= "0" && event.key <= "9") ||
              ["Backspace", "Delete", "ArrowLeft", "ArrowRight", "Tab"].includes(event.key)
            )
          ) {
            event.preventDefault();
          }
        });

        input.addEventListener("input", function () {
          if (input.value.length > 2) {
            input.value = input.value.slice(0, 2);
          }

          if (isHourField) {
            let hourValue = parseInt(input.value, 10);

            if (hourValue >= 24) {
              input.value = "23";
            }
          } else {
            let minuteValue = parseInt(input.value, 10);

            if (minuteValue >= 60) {
              input.value = "59";
            }
          }
        });
        input.addEventListener("input", validateTime);
      });

      clearButton.addEventListener("click", function () {
        instance.clear();
        instance.input.value = "Нічого не обрано";
        clearButton.disabled = true;
      });

      const okButton = document.createElement("button");
      okButton.textContent = "OK";
      okButton.type = "button";
      okButton.className = "flatpickr-ok-btn";
      okButton.disabled = false;

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

        validateTime();

        okButton.disabled = selectedDates.length === 0;
      });
    },
  });
});
