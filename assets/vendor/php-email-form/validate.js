jQuery(document).ready(function ($) {
  "use strict";

  // Contact Form
  $("form.php-email-form").submit(function (e) {
    e.preventDefault();

    var f = $(this).find(".form-group"),
      ferror = false,
      emailExp = /^[^\s()<>@,;:\/]+@\w[\w\.-]+\.[a-z]{2,}$/i;

    f.children("input, textarea").each(function () {
      // Validation logic remains unchanged
      var i = $(this); // current input
      var rule = i.attr("data-rule");
      if (rule !== undefined) {
        var ierror = false;
        var pos = rule.indexOf(":", 0);
        var exp = rule.substr(pos + 1, rule.length);
        rule = rule.substr(0, pos);
        switch (rule) {
          case "required":
            if (i.val() === "") {
              ferror = ierror = true;
            }
            break;
          case "minlen":
            if (i.val().length < parseInt(exp)) {
              ferror = ierror = true;
            }
            break;
          case "email":
            if (!emailExp.test(i.val())) {
              ferror = ierror = true;
            }
            break;
        }
        i.next(".validate")
          .html(
            ierror
              ? i.attr("data-msg") !== undefined
                ? i.attr("data-msg")
                : "wrong Input"
              : ""
          )
          .show("blind");
      }
    });

    if (ferror) return false;

    // Prepare Email.js payload
    const formData = {
      from_name: $("#name").val(),
      from_email: $("#email").val(),
      subject: $("#subject").val(),
      message: $("textarea[name='message']").val(),
    };

    const serviceID = "service_k6rbzmg";
    const templateID = "template_fth036p";

    $(this).find(".loading").slideDown();
    $(this).find(".sent-message, .error-message").slideUp();

    emailjs.send(serviceID, templateID, formData).then(
      (response) => {
        console.log("SUCCESS!", response.status, response.text);
        $(this).find(".loading").slideUp();
        $(this).find(".sent-message").slideDown();
        $(this).find("input:not(input[type=submit]), textarea").val("");
      },
      (error) => {
        console.error("FAILED...", error);
        $(this).find(".loading").slideUp();
        $(this)
          .find(".error-message")
          .slideDown()
          .html("Failed to send message. Please try again later.");
      }
    );

    return false;
  });
});
