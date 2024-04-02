import { useState, useEffect } from "react";
import { ethers } from "ethers";
import atm_abi from "../artifacts/contracts/Assessment.sol/Assessment.json";
import Chart from 'chart.js/auto';

export default function HomePage() {
  const [ethWallet, setEthWallet] = useState(undefined);
  const [account, setAccount] = useState(undefined);
  const [atm, setATM] = useState(undefined);
  const [balance, setBalance] = useState(undefined);
  const [coffeePrice, setCoffeePrice] = useState("");
  const [daysPerWeek, setDaysPerWeek] = useState("");
  const [weeksPerYear, setWeeksPerYear] = useState("");
  const [yearsInvested, setYearsInvested] = useState("");
  const [latteFactor, setLatteFactor] = useState("");
  const [chartData, setChartData] = useState({});

  const contractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
  const atmABI = atm_abi.abi;

  const getWallet = async () => {
    if (window.ethereum) {
      setEthWallet(window.ethereum);
    }

    if (ethWallet) {
      const account = await ethWallet.request({ method: "eth_accounts" });
      handleAccount(account);
    }
  }

  const handleAccount = (account) => {
    if (account) {
      console.log("Account connected: ", account);
      setAccount(account);
    } else {
      console.log("No account found");
    }
  }

  const connectAccount = async () => {
    if (!ethWallet) {
      alert('MetaMask wallet is required to connect');
      return;
    }
  
    const accounts = await ethWallet.request({ method: 'eth_requestAccounts' });
    handleAccount(accounts);
    
    // once wallet is set we can get a reference to our deployed contract
    getATMContract();
  };

  const getATMContract = () => {
    const provider = new ethers.providers.Web3Provider(ethWallet);
    const signer = provider.getSigner();
    const atmContract = new ethers.Contract(contractAddress, atmABI, signer);
 
    setATM(atmContract);
  }

  const getBalance = async () => {
    if (atm) {
      setBalance((await atm.getBalance()).toNumber());
    }
  }

  const deposit = async () => {
    if (atm) {
      let tx = await atm.deposit(1);
      await tx.wait();
      getBalance();
    }
  }

  const withdraw = async () => {
    if (atm) {
      let tx = await atm.withdraw(1);
      await tx.wait();
      getBalance();
    }
  }

  const calculateLatteFactor = () => {
    const coffeePriceFloat = parseFloat(coffeePrice);
    const daysPerWeekInt = parseInt(daysPerWeek);
    const weeksPerYearInt = parseInt(weeksPerYear);
    const yearsInvestedInt = parseInt(yearsInvested);

    const yearlyCoffeeExpense = coffeePriceFloat * daysPerWeekInt * weeksPerYearInt;
    const totalInvestment = yearlyCoffeeExpense * yearsInvestedInt;
    const latteFactorResult = totalInvestment.toFixed(2);

    setLatteFactor(latteFactorResult);

    // Generate data for the line chart
    const labels = [];
    const latteFactorData = [];
    for (let i = 1; i <= 5; i++) {
      labels.push(`Year ${i}`);
      latteFactorData.push(calculateLatteFactorForYear(i));
    }
    setChartData({
      labels: labels,
      datasets: [
        {
          label: 'Latte Factor',
          data: latteFactorData,
          backgroundColor: 'rgba(75, 192, 192, 0.2)',
          borderColor: 'rgba(75, 192, 192, 1)',
          borderWidth: 1,
        },
      ],
    });
  }

  const calculateLatteFactorForYear = (year) => {
    // Calculate latte factor for the specified year
    const yearlyCoffeeExpense = parseFloat(coffeePrice) * parseInt(daysPerWeek) * parseInt(weeksPerYear);
    const totalInvestment = yearlyCoffeeExpense * year;
    return totalInvestment.toFixed(2);
  }

  const initUser = () => {
    if (!ethWallet) {
      return <p>Please install Metamask in order to use this ATM.</p>;
    }

    if (!account) {
      return <button onClick={connectAccount}>Please connect your Metamask wallet</button>;
    }

    if (balance === undefined) {
      getBalance();
    }

    return (
      <div>
        <p>Your Account: {account}</p>
        <p>Your Balance: {balance}</p>
        <button onClick={deposit}>Deposit 1 ETH</button>
        <button onClick={withdraw}>Withdraw 1 ETH</button>

        <h2>Latte Factor Calculator</h2>
        <input type="number" placeholder="Coffee Price" value={coffeePrice} onChange={(e) => setCoffeePrice(e.target.value)} /><br />
        <input type="number" placeholder="Days Per Week" value={daysPerWeek} onChange={(e) => setDaysPerWeek(e.target.value)} /><br />
        <input type="number" placeholder="Weeks Per Year" value={weeksPerYear} onChange={(e) => setWeeksPerYear(e.target.value)} /><br />
        <input type="number" placeholder="Years Invested" value={yearsInvested} onChange={(e) => setYearsInvested(e.target.value)} /><br />
        <button onClick={calculateLatteFactor}>Calculate</button>
        <p>Your Latte Factor: {latteFactor}</p>

        <div>
          <h2>Latte Factor Over 5 Years</h2>
          <canvas id="latteFactorChart"></canvas>
        </div>
      </div>
    );
  };

  useEffect(() => { getWallet(); }, []);

  useEffect(() => {
    const ctx = document.getElementById('latteFactorChart');
    if (ctx) {
      new Chart(ctx, {
        type: 'line',
        data: chartData,
        options: {
          scales: {
            y: {
              beginAtZero: true
            }
          }
        }
      });
    }
  }, [chartData]);

  return (
    <main className="container">
      <header><h1>Welcome to the Metacrafters ATM!</h1></header>
      {initUser()}
      <style jsx>{`
        .container {
          text-align: center;
        }
      `}
      </style>
    </main>
  );
}
