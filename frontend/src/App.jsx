import { useState } from 'react';
import { Aptos, AptosConfig, Network } from '@aptos-labs/ts-sdk';
import { useWallet } from '@aptos-labs/wallet-adapter-react';
import { WalletSelector } from '@aptos-labs/wallet-adapter-ant-design';
import '@aptos-labs/wallet-adapter-ant-design/dist/index.css';
import './App.css';

// Initialize Aptos client
const config = new AptosConfig({ network: Network.DEVNET });
const aptos = new Aptos(config);
const MODULE_ADDRESS = "0x45bf60e28a9ff9a3efc927ee18c573ea4eaebc1a84c71823f6ae284af9c2ab6e"; // Replace after deployment

function App() {
  const { account, signAndSubmitTransaction, connected } = useWallet();
  const [recipientAddress, setRecipientAddress] = useState('');
  const [kudosAmount, setKudosAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const initializeProfile = async () => {
    if (!account) return;
    setLoading(true);
    setMessage('');

    try {
      const transaction = await signAndSubmitTransaction({
        sender: account.address,
        data: {
          function: `${MODULE_ADDRESS}::KudosBoard::initialize_profile`,
          typeArguments: [],
          functionArguments: []
        }
      });

      await aptos.waitForTransaction({ transactionHash: transaction.hash });
      setMessage('✅ Profile initialized successfully!');
    } catch (error) {
      setMessage(`❌ Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const sendKudos = async () => {
    if (!account || !recipientAddress || !kudosAmount) {
      setMessage('❌ Please fill all fields');
      return;
    }

    setLoading(true);
    setMessage('');

    try {
      const amountInOctas = Math.floor(parseFloat(kudosAmount) * 100000000); // Convert APT to Octas

      const transaction = await signAndSubmitTransaction({
        sender: account.address,
        data: {
          function: `${MODULE_ADDRESS}::KudosBoard::send_kudos`,
          typeArguments: [],
          functionArguments: [recipientAddress, amountInOctas]
        }
      });

      await aptos.waitForTransaction({ transactionHash: transaction.hash });
      setMessage(`✅ Sent ${kudosAmount} APT kudos successfully!`);
      setRecipientAddress('');
      setKudosAmount('');
    } catch (error) {
      setMessage(`❌ Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app">
      <div className="container">
        <h1>🎉 Kudos Board</h1>
        <p className="subtitle">Tip tokens to show appreciation!</p>

        <div className="wallet-section">
          <WalletSelector />
        </div>

        {connected && account && (
          <>
            <div className="account-info">
              <p><strong>Connected:</strong> {String(account.address).slice(0, 6)}...{String(account.address).slice(-4)}</p>
            </div>

            <div className="action-card">
              <h2>Initialize Your Profile</h2>
              <p>First time? Initialize your kudos profile</p>
              <button 
                onClick={initializeProfile} 
                disabled={loading}
                className="btn btn-secondary"
              >
                {loading ? 'Processing...' : 'Initialize Profile'}
              </button>
            </div>

            <div className="action-card">
              <h2>Send Kudos</h2>
              <div className="form-group">
                <label>Recipient Address</label>
                <input
                  type="text"
                  placeholder="0x..."
                  value={recipientAddress}
                  onChange={(e) => setRecipientAddress(e.target.value)}
                  className="input"
                />
              </div>

              <div className="form-group">
                <label>Amount (APT)</label>
                <input
                  type="number"
                  placeholder="0.1"
                  step="0.01"
                  value={kudosAmount}
                  onChange={(e) => setKudosAmount(e.target.value)}
                  className="input"
                />
              </div>

              <button 
                onClick={sendKudos} 
                disabled={loading || !recipientAddress || !kudosAmount}
                className="btn btn-primary"
              >
                {loading ? 'Sending...' : '💝 Send Kudos'}
              </button>
            </div>

            {message && (
              <div className={`message ${message.includes('❌') ? 'error' : 'success'}`}>
                {message}
              </div>
            )}
          </>
        )}

        {!connected && (
          <div className="connect-prompt">
            <p>👆 Connect your wallet to get started</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;