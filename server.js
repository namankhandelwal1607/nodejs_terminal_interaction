const express = require("express");
const { exec } = require("child_process");
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json()); // Parse JSON bodies


let port = 3000;

exec("mantrachaind-cli.env", (error, stdout, stderr) => {
  if (error) {
    console.error(`Error executing mantrachaind-cli.env: ${error.message}`);
  }
  if (stderr) {
    console.error(`mantrachaind-cli.env stderr: ${stderr}`);
  }
  console.log(`mantrachaind-cli.env output: ${stdout}`);
});


app.get("/", (req, res) => {
  // Command to execute in the terminal
  let unbought_stocks_command = `mantrachaind query wasm contract-state smart mantra1ujasq98ulyyytwtc74hrafj0qy3lmkzaz4jh7pdcca5896ffeyuq78jrvy '{ "unbought_stocks" : {} }' $NODEARG`;

  // Execute the command
  exec(unbought_stocks_command, (error, stdout, stderr) => {
    if (error) {
      console.error(`Error executing command: ${error.message}`);
      return res.status(500).send("Error executing command");
    }
    if (stderr) {
      console.error(`Command stderr: ${stderr}`);
      return res.status(500).send("Command error");
    }
    console.log(`Command output: ${stdout}`);
    res.send(stdout);
  });
});
app.post("/buy", (req, res) => {
  const { tokenSymbol, stockAddress } = req.body;
  if (!tokenSymbol || !stockAddress) {
    return res.status(400).send("Token symbol and stock address are required");
  }

  const command = `mantrachaind tx wasm execute mantra1ujasq98ulyyytwtc74hrafj0qy3lmkzaz4jh7pdcca5896ffeyuq78jrvy '{ "buy_stock" : { "token_symbol" : "${tokenSymbol}" , "stock_address" : "${stockAddress}" } }' --from wallet69 $TXFLAG -y`;

  exec(command, (error, stdout, stderr) => {
    if (error) {
      console.error(`Error executing command: ${error.message}`);
      return res.status(500).send(`Error executing command: ${error.message}`);
    }
    if (stderr) {
      console.error(`Command stderr: ${stderr}`);
      return res.status(500).send(`Command stderr: ${stderr}`);
    }
    console.log(`Command output: ${stdout}`);
    res.send(stdout);
  });
});
const { spawn } = require("child_process");

app.post("/mint-stock", (req, res) => {
  const { tokenName, tokenSymbol, pricePerShare, stocks } = req.body;
  if (!tokenName || !tokenSymbol || !pricePerShare || !stocks) {
    return res.status(400).send("Token name, token symbol, price per share, and stocks are required");
  }

  const mintCommand = `mantrachaind tx wasm execute mantra1ujasq98ulyyytwtc74hrafj0qy3lmkzaz4jh7pdcca5896ffeyuq78jrvy '{ "mint_stock" : { "token_name" : "${tokenName}" , "token_symbol" : "${tokenSymbol}" , "price_per_share" : "${pricePerShare}" , "stocks" : "${stocks}" } }' --from wallet69 $TXFLAG -y`;

  const cliProcess = spawn("bash", [ mintCommand], { shell: true });

  // Listen for data from stdout and stderr
  cliProcess.stdout.on('data', (data) => {
    console.log(`stdout: ${data}`);
  });

  cliProcess.stderr.on('data', (data) => {
    if (data.toString().includes('Enter')) {
      cliProcess.stdin.write(`Sakshi@123\n`);
    }
    console.log(`stderr: ${data}`);
  });

  // cliProcess.on('close', (code) => {
  //   console.log(`child process exited with code ${code}`);
  // });

  // Send a response to the client
  res.send("Minting process started...");
});


app.listen(port, () => {
  console.log(`App is listening on port ${port}`);
});
