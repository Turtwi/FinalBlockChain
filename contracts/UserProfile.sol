// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract UserProfiles {
    struct Profile {
        string username;
        string email;
        address walletAddress;
    }

    mapping(address => Profile) private profiles;
    mapping(string => address) private usernames;
    mapping(string => address) private emails;

    event ProfileRegistered(address indexed userAddress, string username, string email);

    function registerProfile(string memory newUsername, string memory newEmail) external {
        require(bytes(newUsername).length > 0, "Username cannot be empty");
        require(bytes(newEmail).length > 0, "Email cannot be empty");
        require(usernames[newUsername] == address(0), "Username already taken");
        require(emails[newEmail] == address(0), "Email already registered");

        profiles[msg.sender] = Profile({username: newUsername, email: newEmail, walletAddress: msg.sender});
        usernames[newUsername] = msg.sender;
        emails[newEmail] = msg.sender;

        emit ProfileRegistered(msg.sender, newUsername, newEmail);
    }

    function getUserProfile(address userAddress) external view returns (Profile memory) {
        require(profiles[userAddress].walletAddress != address(0), "Profile not found");
        return profiles[userAddress];
    }
}