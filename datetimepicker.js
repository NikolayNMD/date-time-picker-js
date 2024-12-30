document.addEventListener("DOMContentLoaded", function () {
  flatpickr("#flatpickr", {
    enableTime: true,
    dateFormat: "Y-m-d H:i",
    time_24hr: true,
    inline: true,
    locale: "uk",
    defaultDate: new Date(),
    onReady: function (selectedDates, dateStr, instance) {
      const tg = window.Telegram.WebApp;
      instance.input.value = instance.formatDate(new Date(), "Y-m-d H:i");
      const clearButton = document.createElement("button");
      clearButton.textContent = "Очистити";
      clearButton.type = "button";
      clearButton.className = "flatpickr-clear-btn";
      clearButton.disabled = false;

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

        // Check if the query_id is present
        const queryId = tg.initDataUnsafe?.query_id;

        if (!queryId) {
          console.error(
            "Query ID is missing. Make sure this WebApp was opened via an interactive button."
          );
          alert(
            "Query ID is missing. This action can only be performed through an interactive query."
          );
          return;
        }

        // Prepare the result
        const result = {
          type: "article", // Mandatory field for the result type
          id: "1", // A unique identifier for this result
          title: "Selected Date",
          input_message_content: {
            message_text: `You selected the date: ${dt}`,
          },
        };

        // Send the query result
        tg.answerWebAppQuery(queryId, JSON.stringify(result))
          .then((response) => {
            console.log("Query answered successfully:", response);
          })
          .catch((error) => {
            console.error("Failed to answer the query:", error);
          });
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
