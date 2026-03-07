const GoldRate = require('../models/goldRate.model');
const { Op } = require('sequelize');

class GoldRateService {
  // Fetch gold rate from GoldAPI.io
  async fetchExternalGoldRate() {
    try {
      const apiKey = process.env.GOLD_API_KEY;
      
      if (!apiKey) {
        console.error('GOLD_API_KEY not found in environment variables');
        throw new Error('Gold API key not configured');
      }

      // Fetch XAU (Gold) price in INR
      const response = await fetch('https://www.goldapi.io/api/XAU/INR', {
        method: 'GET',
        headers: {
          'x-access-token': apiKey,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('GoldAPI.io error:', response.status, errorText);
        throw new Error(`GoldAPI.io returned status ${response.status}`);
      }

      const data = await response.json();
      
      console.log('GoldAPI.io response:', data);

      // GoldAPI returns price per troy ounce
      // 1 troy ounce = 31.1035 grams
      // So we need to divide by 31.1035 to get price per gram
      const pricePerOunce = data.price; // Price in INR per troy ounce
      const pricePerGram = pricePerOunce / 31.1035;
      
      console.log(`Gold price: ₹${pricePerGram.toFixed(2)}/gram (from ₹${pricePerOunce}/oz)`);
      
      return Math.round(pricePerGram * 100) / 100; // Round to 2 decimal places
    } catch (error) {
      console.error('Failed to fetch from GoldAPI.io:', error);
      
      // Fallback: return last known rate from database
      const lastRate = await GoldRate.findOne({
        order: [['date', 'DESC']]
      });
      
      if (lastRate) {
        console.log('Using last known rate from database:', lastRate.rate);
        return parseFloat(lastRate.rate);
      }
      
      // Ultimate fallback
      return 6500;
    }
  }

  // Sync gold rate from GoldAPI.io and save to database
  async syncGoldRate() {
    try {
      const today = new Date().toISOString().split('T')[0];
      
      // Fetch current rate from GoldAPI.io
      console.log('Fetching gold rate from GoldAPI.io...');
      const currentRate = await this.fetchExternalGoldRate();
      console.log('Current rate fetched:', currentRate);
      
      // Get yesterday's rate for comparison
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayRate = await GoldRate.findOne({
        where: {
          date: {
            [Op.lte]: yesterday.toISOString().split('T')[0]
          }
        },
        order: [['date', 'DESC']]
      });
      
      let change = 0;
      let changePercentage = 0;
      
      if (yesterdayRate) {
        change = currentRate - parseFloat(yesterdayRate.rate);
        changePercentage = (change / parseFloat(yesterdayRate.rate)) * 100;
        console.log(`Change from yesterday: ${change >= 0 ? '+' : ''}₹${change.toFixed(2)} (${changePercentage.toFixed(2)}%)`);
      }
      
      // Check if we already have today's rate
      const existingRate = await GoldRate.findOne({
        where: { date: today }
      });
      
      if (existingRate) {
        // Update existing rate
        await existingRate.update({
          rate: currentRate,
          change,
          changePercentage
        });
        console.log('Updated existing rate for today');
      } else {
        // Create new rate
        await GoldRate.create({
          date: today,
          rate: currentRate,
          change,
          changePercentage
        });
        console.log('Created new rate entry for today');
      }
      
      return {
        currentRate,
        change: { amount: change, percentage: changePercentage }
      };
    } catch (error) {
      console.error('Sync gold rate error:', error);
      throw error;
    }
  }

  // Get current gold rate with today's change
  async getCurrentRate() {
    try {
      // Sync with GoldAPI.io first to get latest rate
      await this.syncGoldRate();
      
      const today = new Date().toISOString().split('T')[0];
      
      const todayRate = await GoldRate.findOne({
        where: { date: today },
        order: [['createdAt', 'DESC']]
      });

      if (!todayRate) {
        // If no rate for today after sync, return a default
        console.log('No rate found for today, returning default');
        return {
          currentRate: 6500,
          date: today,
          change: { amount: 0, percentage: 0 }
        };
      }

      return {
        currentRate: parseFloat(todayRate.rate),
        date: todayRate.date,
        change: {
          amount: parseFloat(todayRate.change || 0),
          percentage: parseFloat(todayRate.changePercentage || 0)
        }
      };
    } catch (error) {
      console.error('Get current rate error:', error);
      throw error;
    }
  }

  // Get gold rate history
  async getRateHistory(days = 30) {
    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      const rates = await GoldRate.findAll({
        where: {
          date: {
            [Op.gte]: startDate.toISOString().split('T')[0]
          }
        },
        order: [['date', 'ASC']]
      });

      return rates.map(rate => ({
        date: rate.date,
        rate: parseFloat(rate.rate),
        change: parseFloat(rate.change || 0),
        changePercentage: parseFloat(rate.changePercentage || 0)
      }));
    } catch (error) {
      throw error;
    }
  }

  // Manual set rate (for admin override)
  async setRate(date, rate) {
    try {
      const previousDate = new Date(date);
      previousDate.setDate(previousDate.getDate() - 1);
      
      const previousRate = await GoldRate.findOne({
        where: {
          date: {
            [Op.lte]: previousDate.toISOString().split('T')[0]
          }
        },
        order: [['date', 'DESC']]
      });

      let change = 0;
      let changePercentage = 0;

      if (previousRate) {
        change = rate - parseFloat(previousRate.rate);
        changePercentage = (change / parseFloat(previousRate.rate)) * 100;
      }

      const existingRate = await GoldRate.findOne({
        where: { date }
      });

      let goldRate;
      if (existingRate) {
        goldRate = await existingRate.update({
          rate,
          change,
          changePercentage
        });
      } else {
        goldRate = await GoldRate.create({
          date,
          rate,
          change,
          changePercentage
        });
      }

      return {
        date: goldRate.date,
        rate: parseFloat(goldRate.rate),
        change: parseFloat(goldRate.change),
        changePercentage: parseFloat(goldRate.changePercentage)
      };
    } catch (error) {
      throw error;
    }
  }

  // Force refresh from GoldAPI.io (manual refresh)
  async forceRefresh() {
    try {
      console.log('Force refresh triggered');
      return await this.syncGoldRate();
    } catch (error) {
      console.error('Force refresh error:', error);
      throw error;
    }
  }
}

module.exports = new GoldRateService();