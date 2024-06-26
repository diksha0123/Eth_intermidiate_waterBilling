// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

contract WaterBilling {
    address public owner;
    uint256 public freeUnits;
    uint256 public ratePerUnit;

    mapping(address => uint256) public usage;
    mapping(address => uint256) public bills;

    event BillPaid(address indexed user, uint256 amount);
    event UsageRecorded(address indexed user, uint256 units);
    event BillCalculated(address indexed user, uint256 amount);
    event RatePerUnitSet(uint256 ratePerUnit);
    event FreeUnitsSet(uint256 freeUnits);

    modifier onlyOwner() {
        require(msg.sender == owner, "Only the owner can perform this action");
        _;
    }

    constructor(uint256 _ratePerUnit, uint256 _freeUnits) {
        require(_ratePerUnit > 0, "Rate per unit must be greater than zero");
        require(_freeUnits >= 0, "Free units must be non-negative");
        owner = msg.sender;
        ratePerUnit = _ratePerUnit;
        freeUnits = _freeUnits;
    }

    function recordUsage(address user, uint256 units) external onlyOwner {
        require(units > 0, "Usage must be greater than zero");
        usage[user] += units;
        emit UsageRecorded(user, units);
    }

    function calculateBill(address user) external onlyOwner returns (uint256) {
        uint256 totalUnits = usage[user];
        require(totalUnits > 0, "No usage recorded for this user");

        uint256 billAmount;
        if (totalUnits <= freeUnits) {
            billAmount = 0;
        } else {
            uint256 chargeableUnits = totalUnits - freeUnits;
            billAmount = chargeableUnits * ratePerUnit;
        }
        bills[user] = billAmount;

        emit BillCalculated(user, billAmount);
        return billAmount;
    }

    function payBill() external payable {
        uint256 billAmount = bills[msg.sender];
        require(billAmount > 0, "No bill due");
        require(msg.value == billAmount, "Incorrect bill amount");

        bills[msg.sender] = 0;
        emit BillPaid(msg.sender, msg.value);
    }

    function withdraw() external onlyOwner {
        uint256 balance = address(this).balance;
        require(balance > 0, "No funds available for withdrawal");
        payable(owner).transfer(balance);
    }

    function setRatePerUnit(uint256 _ratePerUnit) external onlyOwner {
        require(_ratePerUnit > 0, "Rate per unit must be greater than zero");
        ratePerUnit = _ratePerUnit;
        emit RatePerUnitSet(_ratePerUnit);
    }

    function setFreeUnits(uint256 _freeUnits) external onlyOwner {
        require(_freeUnits >= 0, "Free units must be non-negative");
        freeUnits = _freeUnits;
        emit FreeUnitsSet(_freeUnits);
    }

    receive() external payable {
        revert("WaterBilling contract does not accept Ether directly");
    }
}