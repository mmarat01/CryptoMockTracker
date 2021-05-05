const token = getCookie("token");

function loadPage() {
  if (token == "") {
    // user is not logged in
    document.getElementById("body").innerHTML = `
    <div style="text-align: center; margin: 30px 0 0 0">
      <h1> Welcome To CryptoTracker! </h1>
      <h4> Please register or log in to get started. </h4>
      <a class="btn btn-primary" href="/login" role="button">Login</a>
      <a class="btn btn-secondary" href="/register" role="button">Register</a>
    </div>
    `;
  } else {
    fetch('api/user', {
      headers: { authorization: `Bearer ${token}` },
    })
      .then((response) => response.json())
      .then((dataObj) => {
        let userInfo = dataObj.data
        // user is logged in
        document.getElementById("body").innerHTML = `
        <div style="text-align: center; margin: 30px 0 0 0">
          <h1> Welcome, ${userInfo.username.split('@')[0]} </h1>
          <h4>Search For Crypto Currencies:</h4>
          <div class="mx-auto col-md-6 col-sm-8" >
            <form style="box-sizing: border-box" class="form-inline my-2 my-lg-0">
              <input class="form-control" style="width: 70%; margin-right: 10px" type="search" name="filter" placeholder="Search" aria-label="Search">
              <button class="btn btn-outline-success" style="width: 25%;" type="submit">Search</button>
            </form>
          </div>
          <div id="results">
          </div>
        </div>
        `;
        fetch("/api/crypto/all")
          .then((response) => response.json())
          .then((dataObj) => {
            let data = dataObj.data;
            let result = `
            <div class="mt-4 mx-auto" style="width: 80%; overflow: auto;">
            <table class="table table-striped">
            <thead>
              <tr>
                <th scope="col">#</th>
                <th scope="col">Name</th>
                <th scope="col">Symbol</th>
                <th scope="col">Price</th>
                <th scope="col"></th>
              </tr>
            </thead>
            <tbody>
            `;
            for (let i = 0; i < data.length; i++) {
              const urlParams = new URLSearchParams(window.location.search);
              const filter = urlParams.get("filter");
              if (
                !filter ||
                data[i].name.toUpperCase().includes(filter.toUpperCase())
              ) {
                result += `
                <tr>
                  <th scope="row">${i + 1}</th>
                  <td>${data[i].name}</td>
                  <td>${data[i].symbol}</td>
                  <td>$${Number(data[i].price).toFixed(2)}</td>
                  <td>
                    <button 
                      class="btn btn-warning col-12" 
                      type="submit" 
                      data-toggle="modal" 
                      data-target="#exampleModal" 
                      data-name="${data[i].name}"
                      data-symbol="${data[i].symbol}"
                      data-price="${data[i].price}">
                        Buy Now
                    </button>
                  </td>
                </tr>
                `;
              } else {
                console.log(data[i].name + " does not include" + filter);
              }
            }
            result += `
              </tbody>
              </table>
              </div>
              `;
            document.getElementById("results").innerHTML = result;
          });
      })
  }
}

loadPage()

$("#exampleModal").on("show.bs.modal", function (event) {
  fetch('api/user', {
    headers: { authorization: `Bearer ${token}` },
  })
    .then((response) => response.json())
    .then((dataObj) => {
      userInfo = dataObj.data
      var button = $(event.relatedTarget); // Button that triggered the modal
      var name = button.data("name");
      var symbol = button.data("symbol"); // Extract info from data-* attributes
      var unit_price = Number(button.data("price"));
      // If necessary, you could initiate an AJAX request here (and then do the updating in a callback).
      // Update the modal's content. We'll use jQuery here, but you could use a data binding library or other methods instead.
      var modal = $(this);
      let default_amount = Math.min(1000, userInfo.statistics.current_balance).toFixed(2)
      modal.find(".modal-title").text("Buying " + symbol);
      modal.find("#order-description").html(`
      <div class="input-group mb-3">
        <span class="input-group-text">$</span>
        <input id="amount" type="number" class="form-control" value=${default_amount}>
      </div>
      <div class="mb-3 row">
        <label for="currency" class="col-sm-3 col-form-label"> Currency </label>
        <div class="col-sm-9">
          <input type="text" readonly class="form-control-plaintext" id="staticCurrency" value="${name}">
        </div>
      </div>
      <div class="mb-3 row">
        <label for="num_units" class="col-sm-3 col-form-label"> Amount </label>
        <div class="col-sm-9">
          <input type="text" readonly class="form-control-plaintext" id="num_units" value="${(default_amount / unit_price).toFixed(5)}">
        </div>
      </div>
      <div class="mb-3 row">
      <label for="staticEmail" class="col-sm-3 col-form-label"> Balance </label>
      <div class="col-sm-9">
        <input type="text" readonly class="form-control-plaintext" id="staticEmail" value="$${userInfo.statistics.current_balance.toFixed(2)}">
      </div>
      </div>
      <div class="mb-3 row">
      <label for="staticEmail" class="col-sm-3 col-form-label"> Remaining </label>
      <div class="col-sm-9">
        <input type="text" readonly class="form-control-plaintext" id="remaining" value="$${(userInfo.statistics.current_balance - default_amount).toFixed(2)}">
      </div>
      </div>
      <div style="display: none" id="alert" class="alert alert-danger" role="alert">
        You cannot spend money that you don't have! Please enter a lower amount.
      </div>
        `
      );
      modal.find("#amount").on('input', () => {
        $("#num_units").val(`${(Number(modal.find("#amount").val()) / unit_price).toFixed(5)}`)
        $("#remaining").val(`$${(userInfo.statistics.current_balance - modal.find("#amount").val()).toFixed(2)}`)
        if (modal.find("#amount").val() > userInfo.statistics.current_balance) {
          // disable button
          $('#purchase-button').prop("disabled", true)
          $('#alert').show()
        } else {
          // enable button
          $('#purchase-button').prop("disabled", false)
          $('#alert').hide()
        }
      })

      modal.find("#purchase-button").show()
      modal.find("#purchase-button").prop("disabled", false)
      modal.find("#cancel-button").text("Cancel")
      modal.find("#purchase-button").unbind('click').click(() => {
        if (token) {
          fetch(`/api/user/holdings/add`, {
            method: "POST",
            headers: { authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({
              name: name,
              ticker: symbol,
              purchase_price: unit_price,
              amount: Number(modal.find("#amount").val()) / unit_price
            })
          })
            .then((response) => response.json())
            .then((dataObj) => {
              console.log(dataObj);
            });
        }
        modal.find("#order-description").text("Purchase Complete")
        modal.find("#cancel-button").text("Close")
        modal.find("#purchase-button").hide()
      })
    })
});