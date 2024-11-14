
// Error to paragaraph Element
const errToPEl = function (errs) {
  let errHtml = "";
  for (const err in errs) {
    errHtml += `<p>${errs[err]}</p>`;
  }
  if (errHtml == undefined || errHtml == null) {
    return "";
  }
  return errHtml;
};

const registerPost = function (
  firstName,
  lastName,
  email,
  password,
  confirmPassword
) {
  fetch("/register", {
    method: "POST",
    body: JSON.stringify({
      firstName,
      lastName,
      email,
      password,
      confirmPassword,
    }),
    headers: { "Content-Type": "application/json" },
  })
    .then((response) => response.json())
    .then((data) => {
      console.log(data);
      if (data.success) {
        window.location.href = data.redirect;
      }
      if (data.error) {
        document.getElementById("errorMessage").innerHTML =
          DOMPurify.sanitize(errToPEl(data.error));
      }
    })
    .catch((error) => console.error("Error:", error));
};
(function () {
  if (!document.querySelector("#registerForm")) {
    return;
  }
  document
    .querySelector("#registerForm")
    .addEventListener("submit", function (e) {
      e.preventDefault();
      const password = document.querySelector("#password").value;
      const confirmPassword = document.querySelector("#confirmPassword").value;
      const firstName = document.querySelector("#firstName").value;
      const lastName = document.querySelector("#lastName").value;
      const email = document.querySelector("#email").value;

      registerPost(firstName, lastName, email, password, confirmPassword);
    });
})();

const loginPost = function (email, password) {
  fetch("/login", {
    method: "POST",
    body: JSON.stringify({
      email,
      password,
    }),
    headers: { "Content-Type": "application/json" },
  })
    .then((response) => response.json())
    .then((data) => {
      console.log(data)
      if (data.status === 'success') {
        window.location.href = data.redirect;
      }
      if (data.status === 'fail') {
        // Set the error message as the text content of the errorMessage element
        document.getElementById("errorMessage").innerHTML = DOMPurify.sanitize(errToPEl(data.message));
      }
    });
};
(function () {
  if (!document.querySelector("#loginForm")) {
    return;
  }
  document.querySelector("#loginForm").addEventListener("submit", function (e) {
    e.preventDefault();

    const email = document.querySelector("#email").value;
    const password = document.querySelector("#password").value;
    loginPost(email, password)
  });
}());
