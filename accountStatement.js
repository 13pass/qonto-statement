'use strict;'

const json2csv = require('json2csv').parse;
const moment = require('moment');
const Qonto = require('qonto');
const request = require('request-promise-native');

const parserOptions = {
  delimiter:';',
  fields: [
    {
      label: 'date',
      value: (row, field) => moment(row.settled_at).format('DD/MM/YYYY'), 
      default: ''
    },
    {
      label: 'date value',
      value: (row, field) => moment(row.settled_at).format('DD/MM/YYYY'), 
      default: ''
    },
		'label',
    {
      label: 'debit_amount', 
      value: (row, field) => (row.operation_type === 'income') ? null : row.amount, 
      default: '',
      stringify: true
    },
    {
      label: 'credit_amount',
      value: (row, field) => (row.operation_type === 'income') ? row.amount : null,
      default: '',
      stringify: true
    },
  ],
  quote:''
};

const QontoClient = new Qonto({
  slug: process.env.SLUG,
  secret: process.env.SECRET_KEY
});

exports.exportToCsv = exportToCsv;
exports.getLastMonthStatement = getLastMonthStatement;
exports.qontoRequest = qontoRequest;

async function exportToCsv (transactions) {
  if (!transactions){
    throw new Error('transactions must be filled');
  }
	return json2csv(transactions, parserOptions);	
}

async function getLastMonthStatement (iban) {
  if (!iban){
    throw new Error('iban must be filled');
  }
  let result = await QontoClient.transactions(iban);
  if (result.status !== 200){
    throw new Error(result.response);
  }
  return JSON.parse(result.response);
}

async function qontoRequest ({
  path,
  queryParams = {},
  secret,
  slug
}) {
  const options = {
    method: 'GET',
    url: `http://thirdparty.qonto.eu/${path}`,
    qs: queryParams,
    headers: {
      Authorization: `${slug}:${secret}`
    }
  };
  console.log(options);
  let body = await request(options);
  return JSON.parse(body);
}



