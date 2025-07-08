const scriptURL = ""

let form = document.getElementById("form-contact");


form.addEventListener("submit" , (e) => {
    e.preventDefault();

    fetch(scriptURL , {
        method : "POST",
        body : new FormData(form),
    }).catch((error) => console.error("error!" , error.message))
});