// get user info
// get info on currencies

function writeHoldings() {
  const token = getCookie("token");
  let userInfo = null;
  if (token) {
    fetch(`/api/user/`, {
      headers: { authorization: `Bearer ${token}` },
    })
      .then((response) => response.json())
      .then((dataObj) => {
        fetch('/api/crypto/all')
        .then((crypto_response) => crypto_response.json())
        .then((crypto_dataObj) => {
          userInfo = dataObj.data;
          let greet = document.querySelector("#greeting");
          greet.innerHTML = `Hello ${userInfo.username}`;
          let holdings_list = document.querySelector("#holdings-list");
          holdings_list.innerHTML=""
          for (let i = 0; i < userInfo.holdings.length; i++) {
            holding = userInfo.holdings[i]
            // find holding in crypto array
            let currentCrypto
            for (let crypto of crypto_dataObj.data) {
              if (crypto.symbol == holding.ticker) {
                currentCrypto = crypto
                break
              }
            }
            let percentChange = ((Number(currentCrypto.price) - holding.purchase_price) / (holding.purchase_price)) * 100

            holdings_list.innerHTML +=
              `
            <tr> 
              <th scope="row">${i + 1}</th>
              <td>${holding.name}</td>
              <td>${holding.ticker}</td>
              <td>$${holding.purchase_price.toFixed(2)}</td>
              <td>$${Number(currentCrypto.price).toFixed(2)}</td>
              <td style="color:${percentChange >= 0? "green": "red"}">${Number(percentChange).toFixed(2)}%</td>
              <td>
              <button 
                class="btn btn-primary col-12" 
                type="submit" 
                data-toggle="modal" 
                data-target="#exampleModal" 
                data-name="${holding.name}"
                data-symbol="${holding.ticker}"
                data-price=${holding.purchase_price}
                data-curr_price=${currentCrypto.price}
                data-percent=${percentChange}
              >
                  Sell
              </button>
              </td>
              
            </tr>
            `
          }
        });
        })
  }
}

writeHoldings()

$("#exampleModal").on("show.bs.modal", function (event) {
  var button = $(event.relatedTarget); // Button that triggered the modal
  var name = button.data("name");
  var symbol = button.data("symbol"); // Extract info from data-* attributes
  var purchase_price = button.data("price");
  var current_price = button.data("curr_price");
  var percent_changee = button.data("percent");
  // If necessary, you could initiate an AJAX request here (and then do the updating in a callback).
  // Update the modal's content. We'll use jQuery here, but you could use a data binding library or other methods instead.
  var modal = $(this);
  modal.find(".modal-title").text("Selling " + symbol);
  modal.find("#order-description").html(
    `
    Purchase price was $${purchase_price.toFixed(2)}
    <br/>
    Current price is: $${current_price.toFixed(2)}
    <br/>
    Percent change: ${percent_changee.toFixed(2)}%
    `
  );
  modal.find("#order-description")

  modal.find("#sale-button").show()
  modal.find("#cancel-button").text("Cancel")
  modal.find("#sale-button").unbind('click').click(() => {
    const token = getCookie("token");

    if (token) {
      fetch(`/api/user/holdings/sell`, {
        method: "POST",
        headers: { authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name,
          ticker: symbol,
          purchase_price: purchase_price
        })
      })
        .then((response) => response.json())
        .then((dataObj) => {
          writeHoldings()
        });
    }
    modal.find("#order-description").text("Sale Complete")
    modal.find("#sale-button").hide()
    modal.find("#cancel-button").text("Close")
  })
});
