let y = document.querySelectorAll("a.edit");
y.forEach(btn => {
  btn.addEventListener("click", function(e) {
    v = e.target.getAttribute("value");
    name = e.target.getAttribute("data-name");
    content = e.target.getAttribute("data-content");
    event.preventDefault();
    document.querySelector('#popup-container').style.display = "block";
    document.querySelector('.set').setAttribute("action", "/edit/" + v);
    document.querySelector('.title').setAttribute("value", name);
    document.getElementById("content").value = content;
  })
});
document.getElementById("close").addEventListener("click", function() {
  document.querySelector('#popup-container').style.display = "none";
});
