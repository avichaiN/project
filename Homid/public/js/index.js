let tab1 = document.getElementById("tab1");
let tab2 = document.getElementById("tab2");
let formSignIn = document.getElementById("form1");
let formSigneUp = document.getElementById("form2");
let formReset = document.getElementById("form3");

function showPageSignUp(e) {
  tab1.classList.remove("active");
  tab2.classList.add("active");
  formSignIn.style.display = "none";
  formSigneUp.style.display = "block";
  formReset.style.display = "none";
}

function showPageSignIn(e) {
  tab1.classList.add("active");
  tab2.classList.remove("active");
  formSignIn.style.display = "block";
  formSigneUp.style.display = "none";
  formReset.style.display = "none";
}

function showPageReset(e) {
  formSignIn.style.display = "none";
  formReset.style.display = "block";
}

function handleLoginForm(e) {
  e.preventDefault();
  const username = e.target.children.username.value;
  const password = e.target.children.password.value;

  fetch("/", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ username, password }),
  })
    .then((res) => res.json())
    .then((data) => {
      if (data.status == "unauthorized") {
        Swal.fire({
          icon: "error",
          title: "אופס...",
          text: "משתמש/אימייל או הסיסמא אינם נכונים, נסה שוב",
          confirmButtonColor: "red",
          confirmButtonText: "אישור",
        });
      } else {
        window.location.replace = "/categories.html";
      }
    });
}

function handleRegisterForm(e) {
  e.preventDefault();
  const firstName = e.target.children.firstName.value;
  const lastName = e.target.children.lastName.value;
  const username = e.target.children.username.value;
  const email = e.target.children.email.value;
  const password = e.target.children.password.value;

  fetch("/register", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ firstName, lastName, username, email, password }),
  })
    .then((res) => res.json())
    .then((data) => {
      if (data.status == "unauthorized") {
        Swal.fire({
          icon: "error",
          title: "אופס...",
          text: "כנראה שהפרטים שהזנת לא נכונים או קיימים במערכת, נסה שנית",
          confirmButtonColor: "red",
          confirmButtonText: "אישור",
        });
      } else {
        window.location.href = "/";
      }
    });
}
