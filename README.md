# ModestTrader

ModestTrader is a trading bot designed to achieve modest but consistent returns in the cryptocurrency market. The bot utilizes data gathering, neural network analysis, and risk management techniques to identify trading opportunities and execute trades while aiming for a daily profit target of 2% with a maximum risk exposure of 1% per trade.

## Abstract

ModestTrader aims to provide a reliable and automated solution for cryptocurrency trading, focusing on achieving modest but consistent returns while minimizing risk. The bot employs a combination of data gathering from exchanges such as Kraken and CoinGecko, neural network analysis for market prediction, and risk management strategies to identify and execute profitable trades.

Key features of ModestTrader include:
- Data integration from Kraken and CoinGecko for market analysis
- Preprocessing of market data to prepare it for analysis
- Decision-making algorithms for evaluating trading opportunities
- Trade execution logic with risk management techniques such as stop-loss and take-profit orders
- Monitoring and reporting functionalities to track trade outcomes and performance metrics
- Continuous learning mechanisms to adapt to changing market conditions and improve trading strategies over time

## Installation and Usage

### Prerequisites
- Node.js and npm installed on your system

### Installation
1. Clone the ModestTrader repository:
2. Navigate to the project directory:
3. Install dependencies:


### Configuration
1. Set up your API keys for Kraken and CoinGecko in a .env file.
2. Create 2 files in the data folder opentrades.txt and completedtrades.csv
3. Configure other parameters such as trading goals, risk management thresholds, and logging levels as needed.

### Running the Bot
1. Start the ModestTrader application:


## Contributing

Contributions to ModestTrader are welcome! If you find any bugs, have feature requests, or want to contribute enhancements, please open an issue or submit a pull request.

## License

This project is licensed under the [MIT License](LICENSE).
