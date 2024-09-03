const { hexToString, stringToHex } = require("viem");

const rollup_server = process.env.ROLLUP_HTTP_SERVER_URL;

const accounts = {};
const carbonCredits = {};
let nextCreditId = 1;

async function handle_advance(data) {
  console.log("Received advance request data " + JSON.stringify(data));
  const payloadString = hexToString(data.payload);
  console.log(`Converted payload: ${payloadString}`);

  try {
    const payload = JSON.parse(payloadString);
    let response;

    switch (payload.action) {
      case "create_account":
        accounts[payload.address] = 0;
        response = `Account created for: ${payload.address}`;
        break;
      case "mint_credits":
        const creditId = nextCreditId++;
        carbonCredits[creditId] = {
          owner: payload.address,
          amount: payload.amount
        };
        accounts[payload.address] += payload.amount;
        response = `Minted ${payload.amount} credits for ${payload.address}. Credit ID: ${creditId}`;
        break;
      case "transfer_credits":
        if (accounts[payload.from] >= payload.amount) {
          accounts[payload.from] -= payload.amount;
          accounts[payload.to] = (accounts[payload.to] || 0) + payload.amount;
          response = `Transferred ${payload.amount} credits from ${payload.from} to ${payload.to}`;
        } else {
          response = "Insufficient credits";
        }
        break;
      case "get_balance":
        response = `Balance for ${payload.address}: ${accounts[payload.address] || 0}`;
        break;
      default:
        response = "Invalid action";
    }

    const outputStr = stringToHex(response);
    await fetch(rollup_server + "/notice", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ payload: outputStr }),
    });
  } catch (error) {
    console.error("Error processing request:", error);
  }
  return "accept";
}

async function handle_inspect(data) {
  console.log("Received inspect request data " + JSON.stringify(data));

  const payloadString = hexToString(data.payload);

  let responseObject;
  
  if (payloadString === "accounts") {
    responseObject = JSON.stringify(accounts);
  } else if (payloadString === "credits") {
    responseObject = JSON.stringify(carbonCredits);
  } else {
    responseObject = "route not implemented";
  }

  const outputStr = stringToHex(responseObject);
  await fetch(rollup_server + "/report", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ payload: outputStr }),
  });

  return "accept";
}

var handlers = {
  advance_state: handle_advance,
  inspect_state: handle_inspect,
};

var finish = { status: "accept" };

(async () => {
  while (true) {
    const finish_req = await fetch(rollup_server + "/finish", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ status: "accept" }),
    });

    console.log("Received finish status " + finish_req.status);

    if (finish_req.status == 202) {
      console.log("No pending rollup request, trying again");
    } else {
      const rollup_req = await finish_req.json();
      var handler = handlers[rollup_req["request_type"]];
      finish["status"] = await handler(rollup_req["data"]);
    }
  }
})();