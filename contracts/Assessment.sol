// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

contract Assessment {
    address payable public owner;
    uint256 public balance;

    event Deposit(uint256 amount);
    event Withdraw(uint256 amount);
    event LatteFactorCalculated(uint256 latteFactor);
    event LatteFactorGraphData(uint256[] data);

    constructor(uint initBalance) payable {
        owner = payable(msg.sender);
        balance = initBalance;
    }

    function getBalance() public view returns(uint256){
        return balance;
    }

    function deposit(uint256 _amount) public payable {
        uint _previousBalance = balance;

        // make sure this is the owner
        require(msg.sender == owner, "You are not the owner of this account");

        // perform transaction
        balance += _amount;

        // assert transaction completed successfully
        assert(balance == _previousBalance + _amount);

        // emit the event
        emit Deposit(_amount);
    }

    // custom error
    error InsufficientBalance(uint256 balance, uint256 withdrawAmount);

    function withdraw(uint256 _withdrawAmount) public {
        require(msg.sender == owner, "You are not the owner of this account");
        uint _previousBalance = balance;
        if (balance < _withdrawAmount) {
            revert InsufficientBalance({
                balance: balance,
                withdrawAmount: _withdrawAmount
            });
        }

        // withdraw the given amount
        balance -= _withdrawAmount;

        // assert the balance is correct
        assert(balance == (_previousBalance - _withdrawAmount));

        // emit the event
        emit Withdraw(_withdrawAmount);
    }

    function calculateLatteFactor(uint256 _coffeePrice, uint256 _daysPerWeek, uint256 _weeksPerYear, uint256 _yearsInvested) public {
        uint256 yearlyCoffeeExpense = _coffeePrice * _daysPerWeek * _weeksPerYear;
        uint256 totalInvestment = yearlyCoffeeExpense * _yearsInvested;
        emit LatteFactorCalculated(totalInvestment);
    }
    function getLatteFactorOverYears(uint256 _coffeePrice, uint256 _daysPerWeek, uint256 _weeksPerYear, uint256 _yearsInvested) public {
        uint256[] memory latteFactorData = new uint256[](5);
        for (uint256 i = 0; i < 5; i++) {
            uint256 yearlyCoffeeExpense = _coffeePrice * _daysPerWeek * _weeksPerYear;
            uint256 totalInvestment = yearlyCoffeeExpense * (_yearsInvested + i);
            latteFactorData[i] = totalInvestment;
        }
        emit LatteFactorGraphData(latteFactorData);
    }
}
