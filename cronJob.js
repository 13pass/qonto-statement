'use strict;'

const _ = require('lodash');
const moment = require('moment');

require('dotenv').config();
const accountStatement = require('./accountStatement');
const dropbox = require('./dropbox');
(async() => {
  try {
    let ibans = process.env.IBANS.split(',');
    let previousMonth = new moment().subtract(1, 'months');
    let dropboxPath = process.env.DROPBOX_FOLDER + previousMonth.format('YYYY') + '/relevés/'; 
    if (ibans.length) {
      ibans = await Promise.all(ibans.map(async iban => {
        let filePath = dropboxPath + previousMonth.format('YYYY-MM') + '-qonto-' + iban + '.csv';
        let lastMonth = await accountStatement.getLastMonthStatement(iban);
        for (transaction of lastMonth.transactions) {
          transaction.date = transaction.settled_at.slice(0,7);
        }
        let groupedTransactions = _.groupBy(lastMonth.transactions, 'date');
        let previousMonthTransactions = groupedTransactions[previousMonth.format('YYYY-MM')];
        let exportCsv = await accountStatement.exportToCsv(previousMonthTransactions);
        await dropbox.upload(process.env.DROPBOX_TOKEN, filePath, exportCsv);
      }));
    }
  } catch (error) {
    console.error(error);   
  }
})();
