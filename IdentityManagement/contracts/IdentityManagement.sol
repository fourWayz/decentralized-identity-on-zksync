// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract IdentityManagement {

    /**
     * @dev Struct representing an identity.
     * @param user The address of the user.
     * @param name The name of the user.
     * @param email The email of the user.
     * @param isVerified Indicates if the identity is verified.
     * @param exists Indicates if the identity exists.
     */
    struct Identity {
        address user;
        string name;
        string email;
        bool isVerified;
        bool exists;
    }

    /// Mapping from user address to their identity
    mapping(address => Identity) public identities;

    /// Event emitted when a new identity is added
    event IdentityAdded(address indexed user, string name, string email);

    /// Event emitted when an identity is updated
    event IdentityUpdated(address indexed user, string name, string email);

    /// Event emitted when an identity is deleted
    event IdentityDeleted(address indexed user);

    /// Event emitted when an identity is verified
    event IdentityVerified(address indexed user);

    /// Event emitted when an identity is revoked
    event IdentityRevoked(address indexed user);

    /// Event emitted when an identity-related action is logged
    event IdentityActionLogged(string action);

    /**
     * @dev Adds a new identity for the caller.
     * @param _name The name of the user.
     * @param _email The email of the user.
     */
    function addIdentity(string memory _name, string memory _email) public {
        require(!identities[msg.sender].exists, "Identity already exists");
        identities[msg.sender] = Identity({
            user: msg.sender,
            name: _name,
            email: _email,
            isVerified: false,
            exists: true
        });
        emit IdentityAdded(msg.sender, _name, _email);
        logIdentityAction("Identity Added");
    }

    /**
     * @dev Updates the identity of the caller.
     * @param _name The new name of the user.
     * @param _email The new email of the user.
     */
    function updateIdentity(string memory _name, string memory _email) public {
        require(identities[msg.sender].exists, "Identity does not exist");
        identities[msg.sender].name = _name;
        identities[msg.sender].email = _email;
        emit IdentityUpdated(msg.sender, _name, _email);
        logIdentityAction("Identity Updated");
    }

    /**
     * @dev Deletes the identity of the caller.
     */
    function deleteIdentity() public {
        require(identities[msg.sender].exists, "Identity does not exist");
        delete identities[msg.sender];
        emit IdentityDeleted(msg.sender);
        logIdentityAction("Identity Deleted");
    }

    /**
     * @dev Verifies the identity of the caller.
     */
    function verifyIdentity() public {
        require(identities[msg.sender].exists, "Identity does not exist");
        identities[msg.sender].isVerified = true;
        emit IdentityVerified(msg.sender);
        logIdentityAction("Identity Verified");
    }

    /**
     * @dev Revokes the verification of the identity of the caller.
     */
    function revokeIdentity() public {
        require(identities[msg.sender].exists, "Identity does not exist");
        identities[msg.sender].isVerified = false;
        emit IdentityRevoked(msg.sender);
        logIdentityAction("Identity Revoked");
    }

    /**
     * @dev Retrieves the identity of a given user.
     * @param _user The address of the user.
     * @return The identity of the user.
     */
    function getIdentity(address _user) public view returns (Identity memory) {
        require(identities[_user].exists, "Identity does not exist");
        return identities[_user];
    }

    /**
     * @dev Checks if a given user's identity is verified.
     * @param _user The address of the user.
     * @return True if the user's identity is verified, false otherwise.
     */
    function isIdentityVerified(address _user) public view returns (bool) {
        require(identities[_user].exists, "Identity does not exist");
        return identities[_user].isVerified;
    }

    /**
     * @dev Logs an identity-related action.
     * @param action The action to log.
     */
    function logIdentityAction(string memory action) internal {
        emit IdentityActionLogged(action);
    }
}