// public/js/wallet.js - MetaMask Wallet Integration

class WalletManager {
  constructor() {
    this.isConnected = false;
    this.account = null;
    this.chainId = null;
    this.connectButton = document.getElementById('connectWalletBtn');
    
    this.init();
  }

  init() {
    // Check if MetaMask is installed
    if (typeof window.ethereum === 'undefined') {
      this.showMetaMaskNotInstalled();
      return;
    }

    // Check if already connected
    this.checkConnection();
    
    // Add event listeners
    this.connectButton.addEventListener('click', () => this.toggleConnection());
    
    // Listen for account changes
    window.ethereum.on('accountsChanged', (accounts) => {
      this.handleAccountsChanged(accounts);
    });
    
    // Listen for chain changes
    window.ethereum.on('chainChanged', (chainId) => {
      this.handleChainChanged(chainId);
    });
  }

  async checkConnection() {
    try {
      const accounts = await window.ethereum.request({ method: 'eth_accounts' });
      if (accounts.length > 0) {
        this.account = accounts[0];
        this.isConnected = true;
        this.updateButton();
      }
    } catch (error) {
      console.error('Error checking connection:', error);
    }
  }

  async toggleConnection() {
    if (this.isConnected) {
      await this.disconnect();
    } else {
      await this.connect();
    }
  }

  async connect() {
    try {
      // Request account access
      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts'
      });
      
      if (accounts.length > 0) {
        this.account = accounts[0];
        this.isConnected = true;
        this.updateButton();
        this.showSuccessMessage('Wallet connected successfully!');
        
        // Get chain ID
        this.chainId = await window.ethereum.request({ method: 'eth_chainId' });
        console.log('Connected to chain:', this.chainId);
      }
    } catch (error) {
      console.error('Connection error:', error);
      this.handleConnectionError(error);
    }
  }

  async disconnect() {
    this.isConnected = false;
    this.account = null;
    this.chainId = null;
    this.updateButton();
    this.showInfoMessage('Wallet disconnected');
  }

  handleAccountsChanged(accounts) {
    if (accounts.length === 0) {
      // User disconnected
      this.disconnect();
    } else if (accounts[0] !== this.account) {
      // User switched accounts
      this.account = accounts[0];
      this.updateButton();
      this.showInfoMessage('Account switched');
    }
  }

  handleChainChanged(chainId) {
    this.chainId = chainId;
    this.showInfoMessage('Network changed');
    console.log('Chain changed to:', chainId);
  }

  updateButton() {
    if (this.isConnected && this.account) {
      const shortAddress = `${this.account.slice(0, 6)}...${this.account.slice(-4)}`;
      this.connectButton.textContent = shortAddress;
      this.connectButton.classList.remove('btn-success');
      this.connectButton.classList.add('btn-outline-success');
      this.connectButton.title = `Connected: ${this.account}`;
    } else {
      this.connectButton.textContent = 'Connect Wallet';
      this.connectButton.classList.remove('btn-outline-success');
      this.connectButton.classList.add('btn-success');
      this.connectButton.title = 'Connect your MetaMask wallet';
    }
  }

  showMetaMaskNotInstalled() {
    this.connectButton.textContent = 'Install MetaMask';
    this.connectButton.classList.remove('btn-success');
    this.connectButton.classList.add('btn-warning');
    this.connectButton.onclick = () => {
      window.open('https://metamask.io/download/', '_blank');
    };
    this.showErrorMessage('MetaMask is not installed. Please install MetaMask to connect your wallet.');
  }

  handleConnectionError(error) {
    let message = 'Failed to connect wallet';
    
    if (error.code === 4001) {
      message = 'Connection rejected by user';
    } else if (error.code === -32002) {
      message = 'Connection request already pending';
    } else if (error.message) {
      message = error.message;
    }
    
    this.showErrorMessage(message);
  }

  showSuccessMessage(message) {
    this.showToast(message, 'success');
  }

  showErrorMessage(message) {
    this.showToast(message, 'error');
  }

  showInfoMessage(message) {
    this.showToast(message, 'info');
  }

  showToast(message, type = 'info') {
    // Create toast element
    const toast = document.createElement('div');
    toast.className = `toast align-items-center text-white bg-${type === 'error' ? 'danger' : type === 'success' ? 'success' : 'info'} border-0`;
    toast.setAttribute('role', 'alert');
    toast.setAttribute('aria-live', 'assertive');
    toast.setAttribute('aria-atomic', 'true');
    
    toast.innerHTML = `
      <div class="d-flex">
        <div class="toast-body">
          ${message}
        </div>
        <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
      </div>
    `;
    
    // Add to toast container or create one
    let toastContainer = document.getElementById('toast-container');
    if (!toastContainer) {
      toastContainer = document.createElement('div');
      toastContainer.id = 'toast-container';
      toastContainer.className = 'toast-container position-fixed top-0 end-0 p-3';
      toastContainer.style.zIndex = '9999';
      document.body.appendChild(toastContainer);
    }
    
    toastContainer.appendChild(toast);
    
    // Initialize and show toast
    const bsToast = new bootstrap.Toast(toast, { delay: 3000 });
    bsToast.show();
    
    // Remove toast element after it's hidden
    toast.addEventListener('hidden.bs.toast', () => {
      toast.remove();
    });
  }

  // Utility methods for other parts of your app
  getAccount() {
    return this.account;
  }

  getChainId() {
    return this.chainId;
  }

  isWalletConnected() {
    return this.isConnected;
  }

  // Method to get user's balance (optional)
  async getBalance() {
    if (!this.isConnected || !this.account) {
      throw new Error('Wallet not connected');
    }
    
    try {
      const balance = await window.ethereum.request({
        method: 'eth_getBalance',
        params: [this.account, 'latest']
      });
      
      // Convert from wei to ether
      return parseInt(balance, 16) / Math.pow(10, 18);
    } catch (error) {
      console.error('Error getting balance:', error);
      throw error;
    }
  }
}

// Initialize wallet manager when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  window.walletManager = new WalletManager();
});

// Export for use in other scripts if needed
if (typeof module !== 'undefined' && module.exports) {
  module.exports = WalletManager;
}


