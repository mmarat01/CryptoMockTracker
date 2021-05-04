function getColor(number) {
  if (number > 0) {
    return "green"
  }
  if (number < 0) {
    return "red"
  }
  return "grey"
}

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
            console.log(userInfo)
            let greet = document.querySelector("#greeting");
            greet.innerHTML = `Hello ${userInfo.username}`;
            document.querySelector('#historical-stat').innerHTML = Number(userInfo.statistcs.net_change).toFixed(2) + '%'
            document.querySelector('#historical-stat').style.color = getColor(Number(userInfo.statistcs.net_change))
            document.querySelector('#transaction-stat').innerHTML = userInfo.statistcs.total_transactions

            let d = new Date(userInfo.statistcs.user_since);
            let ye = new Intl.DateTimeFormat('en', { year: 'numeric' }).format(d);
            let mo = new Intl.DateTimeFormat('en', { month: 'short' }).format(d);
            let da = new Intl.DateTimeFormat('en', { day: '2-digit' }).format(d);
            document.querySelector('#since-stat').innerHTML = `${da}-${mo}-${ye}`

            let holdings_list = document.querySelector("#holdings-list");
            holdings_list.innerHTML = ""
            let holding_change = 0
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
              holding_change += percentChange

              holdings_list.innerHTML +=
                `
            <tr> 
              <th scope="row">${i + 1}</th>
              <td>${holding.name}</td>
              <td>${holding.ticker}</td>
              <td>$${holding.purchase_price.toFixed(2)}</td>
              <td>$${Number(currentCrypto.price).toFixed(2)}</td>
              <td style="color:${getColor(percentChange)}">${Number(percentChange).toFixed(2)}%</td>
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
            document.querySelector("#holdings-stat").innerHTML = holding_change.toFixed(2) + '%'
            document.querySelector('#holdings-stat').style.color = getColor(holding_change)
            let total_change = holding_change + Number(userInfo.statistcs.net_change)
            document.querySelector("#total-stat").innerHTML = (total_change).toFixed(2) + '%'
            document.querySelector('#total-stat').style.color = getColor(total_change)
          });
      })
  }
}

writeHoldings()

$("#exampleModal").on("show.bs.modal", function (event) {
  var button = $(event.relatedTarget); // Button that triggered the modal
  var name = button.data("name");
  var symbol = button.data("symbol"); // Extract info from data-* attributes
  var purchase_price = Number(button.data("price"));
  var current_price = Number(button.data("curr_price"));
  var percent_change = Number(button.data("percent"));
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
    Percent change: ${percent_change.toFixed(2)}%
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
          purchase_price: purchase_price,
          percent_change: percent_change
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
