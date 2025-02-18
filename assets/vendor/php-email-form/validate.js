document.addEventListener("DOMContentLoaded", function () {
  "use strict";

  const form = document.querySelector("form.php-email-form");
  form.addEventListener("submit", async function (e) {
    e.preventDefault();

    let ferror = false;
    const emailExp = /^[^\s()<>@,;:\/]+@\w[\w\.-]+\.[a-z]{2,}$/i;

    form.querySelectorAll(".form-group").forEach((group) => {
      group.querySelectorAll("input, textarea").forEach((input) => {
        const rule = input.getAttribute("data-rule");
        if (rule) {
          let ierror = false;
          const pos = rule.indexOf(":");
          const exp = pos !== -1 ? rule.substr(pos + 1) : null;
          const type = pos !== -1 ? rule.substr(0, pos) : rule;

          if (type === "required" && input.value.trim() === "") {
            ferror = ierror = true;
          } else if (type === "minlen" && input.value.length < parseInt(exp)) {
            ferror = ierror = true;
          } else if (type === "email" && !emailExp.test(input.value)) {
            ferror = ierror = true;
          }

          const validateMsg = input.nextElementSibling;
          if (validateMsg && validateMsg.classList.contains("validate")) {
            validateMsg.textContent = ierror
              ? input.getAttribute("data-msg") || "Invalid input"
              : "";
            validateMsg.style.display = ierror ? "block" : "none";
          }
        }
      });
    });

    const recaptchaResponse = grecaptcha.getResponse();

    // Validate reCAPTCHA
    if (!recaptchaResponse) {
      ferror = true;
      const recaptchaValidateMsg = document.querySelector(
        ".g-recaptcha + .validate"
      );
      if (recaptchaValidateMsg) {
        recaptchaValidateMsg.textContent = "Please complete the reCAPTCHA.";
        recaptchaValidateMsg.style.display = "block";
      }
    } else {
      // Clear any previous reCAPTCHA error message
      const recaptchaValidateMsg = document.querySelector(
        ".g-recaptcha + .validate"
      );
      if (recaptchaValidateMsg) {
        recaptchaValidateMsg.textContent = "";
        recaptchaValidateMsg.style.display = "none";
      }
    }

    if (ferror) return;

    // Show loading and hide previous messages
    const loading = form.querySelector(".loading");
    const sentMessage = form.querySelector(".sent-message");
    const errorMessage = form.querySelector(".error-message");

    loading.style.display = "block"; // Show loading
    if (sentMessage) sentMessage.style.display = "none";
    if (errorMessage) errorMessage.style.display = "none";

    try {
      const response = await fetch(
        "https://66sb2cl3rh.execute-api.eu-west-1.amazonaws.com/recaptcha-vaidator-prod/recaptcha-validator",
        {
          method: "POST",
          body: JSON.stringify({ recaptcha_response: recaptchaResponse }),
        }
      );

      const result = await response.json();

      if (result.message === "reCAPTCHA verification failed") {
        // Hide loading and show error message
        loading.style.display = "none";
        if (errorMessage) {
          errorMessage.style.display = "block";
          errorMessage.innerHTML = result.message;
        }
        return;
      }

      const formData = {
        from_name: document.querySelector("#name").value,
        reply_to: document.querySelector("#email").value, // Use "reply_to" instead of "from_email"
        from_email: "michael@4youdevsolutions.com", // Must be your verified WorkMail email
        subject: document.querySelector("#subject").value,
        message: document.querySelector("#message").value,
      };

      const serviceID = "service_vg3hdfs";
      // const serviceID = "service_k6rbzmg";
      const templateID = "template_fth036p";

      console.log(formData);

      emailjs.send(serviceID, templateID, formData).then(
        (response) => {
          console.log("SUCCESS!", response.status, response.text);

          // Hide loading and show success message
          loading.style.display = "none";
          if (sentMessage) sentMessage.style.display = "block";

          // Clear form inputs
          form
            .querySelectorAll("input:not([type=submit]), textarea")
            .forEach((input) => (input.value = ""));
        },
        (error) => {
          console.error("FAILED...", error);

          // Hide loading and show error message
          loading.style.display = "none";
          if (errorMessage) {
            errorMessage.style.display = "block";
            errorMessage.innerHTML =
              "Failed to send message. Please try again later.";
          }
        }
      );
    } catch (error) {
      console.error("Error:", error);
      // Hide loading and show error message
      loading.style.display = "none";
      if (errorMessage) {
        errorMessage.style.display = "block";
        errorMessage.innerHTML = "Error verifying reCAPTCHA";
      }
    }
  });
});
