document.addEventListener("DOMContentLoaded", function () {
  
  const tg = window.Telegram.WebApp;

  const loaderOverlay = document.createElement("div");
  loaderOverlay.className = "loader-overlay";
  loaderOverlay.innerHTML = `<div class="loader"></div>`;
  document.body.appendChild(loaderOverlay);

  // Функція для показу/приховування лоадера
  function toggleLoader(show, success = false) {
    if (show) {
      loaderOverlay.classList.add("visible");
      const loaderElement = loaderOverlay.querySelector(".loader");
      loaderElement.classList.toggle("success", success);
    } else {
      loaderOverlay.classList.remove("visible");
      const loaderElement = loaderOverlay.querySelector(".loader");
      loaderElement.classList.remove("success");
    }
  }

  flatpickr("#flatpickr", {
    enableTime: true,
    dateFormat: "d.m.Y H:i",
    time_24hr: true,
    inline: true,
    locale: "uk",
    defaultDate: new Date(),
    defaultHour: 0,
    onReady: function (selectedDates, dateStr, instance) {

      function applyTheme(themeParams) {
        const root = document.documentElement;
    
        // Застосовуємо кольори для вашого додатка
        root.style.setProperty("--background-color", themeParams.bg_color || "#1a2c71");
        root.style.setProperty("--datetime-picker-background", themeParams.secondary_bg_color || "white");
        root.style.setProperty("--text-color", themeParams.text_color || "#333");
    
        // Динамічне управління темою Flatpickr
        const darkThemeLinkHref = "https://npmcdn.com/flatpickr/dist/themes/dark.css";
        let themeLink = document.querySelector('link[href="' + darkThemeLinkHref + '"]');
    
        if (themeParams.is_dark) {
          // Додаємо лінк темної теми, якщо його ще немає
          if (!themeLink) {
            themeLink = document.createElement("link");
            themeLink.rel = "stylesheet";
            themeLink.type = "text/css";
            themeLink.href = darkThemeLinkHref;
            document.head.appendChild(themeLink);
          }
        } else {
          // Видаляємо лінк темної теми, якщо він існує
          if (themeLink) {
            themeLink.remove();
          }
        }
      }
    
      applyTheme(tg.themeParams);
    
      tg.onEvent("themeChanged", function () {
        applyTheme(tg.themeParams);
      });
    
      // const tg = window.Telegram.WebApp;
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

        toggleLoader(true);

        sendMessageToBot(dt, toggleLoader)
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

function decodePayload(search) {
  const params = new URLSearchParams(search);
  if (params.has("payload")) {
    try {
      const base64Payload = params.get("payload");
      const decodedPayload = atob(base64Payload);
      return JSON.parse(decodedPayload);
    } catch (error) {
      console.log("Error decoding payload: " + error);
    }
  }
  return null;
}

function sendMessageToBot(dt, toggleLoader) {
  const tg = window.Telegram.WebApp;

  tg.ready();

  const payload = decodePayload(window.location.search);
  if (payload) {
    payload.dt = dt;
  }

  const authToken = payload && payload.auth ? payload.auth : "";

  const requestBody = {
    init_qsl: tg.initData,
    payload: payload,
  };

  const devOrNot = payload.is_dev ? '-dev' : null;

  fetch(`https://my${devOrNot}.uar.net/api/tg_payload_message`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${authToken}`,
    },
    body: JSON.stringify(requestBody),
  })
  .then((response) => response.json())
  .then((data) => {
    console.log("Success: " + JSON.stringify(data));
    toggleLoader(true, true);
    setTimeout(() => {
      tg.close();
    }, 1000);
  })
  .catch((error) => {
    console.log("Error: " + error);
    toggleLoader(false);
  });
}
