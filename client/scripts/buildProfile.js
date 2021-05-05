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

            let d = new Date(userInfo.statistics.user_since);
            let ye = new Intl.DateTimeFormat('en', { year: 'numeric' }).format(d);
            let mo = new Intl.DateTimeFormat('en', { month: 'short' }).format(d);
            let da = new Intl.DateTimeFormat('en', { day: '2-digit' }).format(d);
            document.querySelector('#since-stat').innerHTML = `${da}-${mo}-${ye}`

            let holdings_list = document.querySelector("#holdings-list");
            holdings_list.innerHTML = ""
            let holdings_value = 0
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
              holdings_value += currentCrypto.price * holding.amount

              holdings_list.innerHTML +=
                `
                <tr> 
                  <th scope="row">${i + 1}</th>
                  <td>${holding.name}</td>
                  <td>${holding.ticker}</td>
                  <td>$${(holding.purchase_price * holding.amount).toFixed(2)}</td>
                  <td>$${Number(currentCrypto.price * holding.amount).toFixed(2)}</td>
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
                    data-amount=${holding.amount}
                    data-index=${i}
                  >
                      Sell
                  </button>
                  </td>

                </tr>
                `
            }
            document.querySelector('#balance').innerHTML = "$" + Number(userInfo.statistics.current_balance).toFixed(2)
            document.querySelector('#initial').innerHTML = "$" + Number(userInfo.statistics.initial_balance).toFixed(2)
            document.querySelector('#holdings-value').innerHTML = "$" + holdings_value.toFixed(2)
            document.querySelector('#net-worth').innerHTML = "$" + (holdings_value + userInfo.statistics.current_balance).toFixed(2)
            let total_change = (((holdings_value + userInfo.statistics.current_balance) - userInfo.statistics.initial_balance) / userInfo.statistics.initial_balance)
            document.querySelector('#total').innerHTML = (total_change * 100).toFixed(2) + "%"
            document.querySelector('#total').style.color = getColor(total_change)
            document.querySelector('#transaction-stat').innerHTML = userInfo.statistics.total_transactions
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
  var amount = Number(button.data("amount"));
  var index = button.data("index");
  console.log(amount)
  // If necessary, you could initiate an AJAX request here (and then do the updating in a callback).
  // Update the modal's content. We'll use jQuery here, but you could use a data binding library or other methods instead.
  var modal = $(this);
  modal.find(".modal-title").text("Selling " + symbol);
  modal.find("#order-description").html(
    `
    <div class="mb-3 row">
      <label for="currency" class="col-sm-4 col-form-label"> Currency </label>
      <div class="col-sm-8">
        <input type="text" readonly class="form-control-plaintext" id="staticCurrency" value="${name}">
      </div>
    </div>
    <div class="mb-3 row">
      <label for="num_units" class="col-sm-4 col-form-label"> Amount </label>
      <div class="col-sm-8">
        <input type="text" readonly class="form-control-plaintext" id="num_units" value="${amount.toFixed(2)}">
      </div>
    </div>
    <div class="mb-3 row">
      <label class="col-sm-4 col-form-label"> Purchase Value </label>
      <div class="col-sm-8">
        <input type="text" readonly class="form-control-plaintext" value="$${(purchase_price * amount).toFixed(2)}">
      </div>
    </div>
    <div class="mb-3 row">
      <label class="col-sm-4 col-form-label"> Current Value </label>
      <div class="col-sm-8">
        <input type="text" readonly class="form-control-plaintext"value="$${(current_price * amount).toFixed(2)}">
      </div>
    </div>
    <div class="mb-3 row">
      <label class="col-sm-4 col-form-label"> Net Change </label>
      <div class="col-sm-8">
        <input type="text" style="color: ${getColor(percent_change)}" readonly class="form-control-plaintext"value="${(percent_change).toFixed(2)}%">
      </div>
    </div>
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
          current_price: current_price,
          amount: amount,
          index: index
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
