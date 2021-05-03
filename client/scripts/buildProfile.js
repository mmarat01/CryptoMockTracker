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
      let holdings_list = document.querySelector("#holdings-list");
      for (let i = 0; i < userInfo.holdings.length; i++) {
        holding = userInfo.holdings[i]
        holdings_list.innerHTML += 
        `
        <tr> 
          <th scope="row">${i+1}</th>
          <td>${holding.name}</td>
          <td>${holding.ticker}</td>
          <td>${holding.purchase_price.toFixed(2)}</td>
          <td>
          <button 
            class="btn btn-primary col-12" 
            type="submit" 
            data-toggle="modal" 
            data-target="#exampleModal" 
            data-name="${holding.name}"
            data-symbol="${holding.ticker}"
            data-price="${holding.purchase_price}">
              Sell
          </button>
          </td>
          
        </tr>
        `
      }
    });
}
