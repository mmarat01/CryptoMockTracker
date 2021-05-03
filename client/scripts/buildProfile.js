const token = getCookie("token");
let userInfo = null;
if (token) {
  fetch(`/api/user/`, {
    headers: { authorization: `Bearer ${token}` },
  })
    .then((response) => response.json())
    .then((dataObj) => {
      console.log(dataObj.data);
      userInfo = dataObj.data;
      let greet = document.querySelector("#greeting");
      greet.innerHTML += ` ${userInfo.username}`;
    });
}
