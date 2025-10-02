module MyModule::KudosBoard {
    use aptos_framework::signer;
    use aptos_framework::coin;
    use aptos_framework::aptos_coin::AptosCoin;

    /// Struct to track kudos received by a user
    struct KudosProfile has store, key {
        total_kudos_received: u64,  // Total tokens received as kudos
        kudos_count: u64,            // Number of times kudos was received
    }

    /// Initialize a kudos profile for a user
    public entry fun initialize_profile(user: &signer) {
        let profile = KudosProfile {
            total_kudos_received: 0,
            kudos_count: 0,
        };
        move_to(user, profile);
    }

    /// Send kudos (tip tokens) to another user
    public entry fun send_kudos(
        sender: &signer,
        recipient: address,
        amount: u64
    ) acquires KudosProfile {
        // Transfer tokens
        let tip = coin::withdraw<AptosCoin>(sender, amount);
        coin::deposit<AptosCoin>(recipient, tip);

        // Update recipient's kudos profile if it exists
        if (exists<KudosProfile>(recipient)) {
            let profile = borrow_global_mut<KudosProfile>(recipient);
            profile.total_kudos_received = profile.total_kudos_received + amount;
            profile.kudos_count = profile.kudos_count + 1;
        };
    }
}