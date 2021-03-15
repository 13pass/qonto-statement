'use strict;'

const _ = require('lodash');
const moment = require('moment');

require('dotenv').config();
const accountStatement = require('./accountStatement');
const dropbox = require('./dropbox');

async function generateMonthReport({iban, nbMonthBefore = 0}) {
  let previousMonth = new moment().subtract(1 + nbMonthBefore, 'months');
  let dropboxPath = process.env.DROPBOX_FOLDER + previousMonth.format('YYYY') + '/relevés/'; 
  let filePath = dropboxPath + previousMonth.format('YYYY-MM') + '-qonto-' + iban + '.csv';
  let lastMonth = await accountStatement.getLastMonthStatement(iban);
  for (transaction of lastMonth.transactions) {
    transaction.date = transaction.settled_at.slice(0,7);
  }
  let groupedTransactions = _.groupBy(lastMonth.transactions, 'date');
  let previousMonthTransactions = groupedTransactions[previousMonth.format('YYYY-MM')];
  if (previousMonthTransactions) {
    let exportCsv = await accountStatement.exportToCsv(previousMonthTransactions);
    await dropbox.upload(process.env.DROPBOX_TOKEN, filePath, exportCsv);
  }
}

(async() => {
  try {
    let ibans = process.env.IBANS.split(',');
    if (ibans.length) {
      await generateMonthReport({iban: ibans[0]});
    }
  } catch (error) {
    console.error(error);   
  }
})();
