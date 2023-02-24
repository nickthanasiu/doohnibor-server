/*eslint-disable*/

/*
 * Run this file ( node CompanySeeder.js ) to add companies to database
 */

const mongoose = require('mongoose');
const Company = require('../models/Company');

const { MONGO_DB_USER, MONGO_DB_PASSWORD } = process.env;

mongoose.connect(`mongodb://${MONGO_DB_USER}:${MONGO_DB_PASSWORD}@ds223343.mlab.com:23343/heroku_n7pngq09`, {
  useNewUrlParser: true
});

const companies = [
  new Company({
    name: 'Amazon',
    symbol: 'AMZN',
    price: 1882.22,
    description: 'Amazon.com, Inc. engages in the provision of online retail shopping services. It operates through the following segments: North America, International, and Amazon Web Services (AWS).',
    hq: 'Seattle, WA',
    founded: '1994',
    ceo: 'Jeff Bezos',
    employees: '566,000',
    marketCap: '899.85B',
    priceEarningsRatio: '147.75',
    dividendYield: '0.00',
    averageVolume: '4.39M',
  }),
  new Company({
    name: 'Apple',
    symbol: 'AAPL',
    description: 'Apple, Inc. engages in the design, manufacture, and marketing of mobile communication, media devices, personal computers, and portable digital music players. It operates through the following geographical segments: Americas, Europe, Greater China, Japan, and Rest of Asia Pacific.',
    price: 217.58,
    hq: 'Cupertino, CA',
    founded: '1976',
    ceo: 'Tim Cook',
    employees: '123,000',
    marketCap: '1,012.51B',
    priceEarningsRatio: '18.78',
    dividendYield: '1.56',
    averageVolume: '29.89M',
  }),
  new Company({
    name: 'Disney',
    symbol: 'DIS',
    price: 111.93,
    description: 'The Walt Disney Company, also called Disney, is a diversified international family entertainment and media enterprise. It operates through four business segments: Media Networks, Parks & Resorts, Studio Entertainment and Consumer Products & Interactive Media.',
    hq: 'Burbank, CA',
    founded: '1923',
    ceo: 'Robert Iger',
    employees: '199,000',
    marketCap: '173.91B',
    priceEarningsRatio: '15.62',
    dividendYield: '1.58',
    averageVolume: '8.40M',
  }),
  new Company({
    name: 'Facebook',
    symbol: 'FB',
    price: 174.64,
    description: 'Facebook, Inc. engages in the development of social media applications for people to connect through mobile devices, personal computers, and other surfaces. It enables users to share opinions, ideas, photos, videos, and other activities online.',
    hq: 'Menlo Park, CA',
    founded: '2004',
    ceo: 'Mark Zuckerberg',
    employees: '25,105',
    marketCap: '536.83B',
    priceEarningsRatio: '28.60',
    dividendYield: '0.00',
    averageVolume: '23.39M',
  }),
  new Company({
    name: 'Twitter',
    symbol: 'TWTR',
    price: 34.28,
    description: 'Twitter, Inc., also called Twitter, is a global platform for public self-expression and conversation in real time. It provides a network that connects users to people, information, ideas, opinions, and news.',
    hq: 'San Francisco, CA',
    founded: '2006',
    ceo: 'Jack Dorsey',
    employees: '3,372',
    marketCap: '24.96B',
    priceEarningsRatio: '109.72',
    dividendYield: '0.00',
    averageVolume: '25.23M',
  }),
  new Company({
    name: 'Tesla',
    symbol: 'TSLA',
    price: 301.35,
    description: 'Tesla, Inc. engages in the design, development, manufacture, and sale of fully electric vehicles, energy generation and storage systems. It also provides vehicle service centers, supercharger station, and self-driving capability.',
    hq: 'Palo Alto, California',
    founded: '2003',
    ceo: 'Elon Reeve Musk',
    employees: '37,543',
    marketCap: '51.44B',
    priceEarningsRatio: '-',
    dividendYield: '0.00',
    averageVolume: '7.3M',
  }),
  new Company({
    name: 'Netflix',
    symbol: 'NFLX',
    price: 368.00,
    description: 'Netflix, Inc. operates as an Internet subscription service company, which provides subscription service streaming movies and television episodes over the Internet and sending DVDs by mail. It operates through the following segments: Domestic Streaming, International Streaming, and Domestic DVD.',
    hq: 'Los Gatos, California',
    founded: '1997',
    ceo: 'Reed Hastings, Jr.',
    employees: '5,500',
    marketCap: '160.11B',
    priceEarningsRatio: '167.91',
    dividendYield: '0.00',
    averageVolume: '9.54M',
  }),
  new Company({
    name: 'Agilent',
    symbol: 'A',
    price: 70.81,
    description: 'Agilent Technologies, Inc. provides application focused solutions that include instruments, software, services and consumables for the entire laboratory workflow. It operates through the following segments: Life Sciences & applied markets; Diagnostics & Genomics; and Agilent CrossLab Business.',
    hq: 'Santa Clara, California',
    founded: '1999',
    ceo: 'Michael R. McMullen',
    employees: '13,500',
    marketCap: '22.56B',
    priceEarningsRatio: '77.71',
    dividendYield: '0.78',
    averageVolume: '2.31M',
  }),
  new Company({
    name: 'AMD',
    symbol: 'AMD',
    price: 31.17,
    description: 'Advanced Micro Devices, Inc. engages in the provision of semiconductor businesses. It operates through the Computing and Graphics; and Enterprise, Embedded and Semi-Custom segments.',
    hq: 'Santa Clara, California',
    founded: 1969,
    ceo: 'Lisa T. Su',
    employees: '8,900',
    marketCap: '30.24B',
    priceEarningsRatio: '96.91',
    dividendYield: '0.00',
    averageVolume: '69.19',
  }),
];

// Drop Companies from Database before re-seeding
mongoose.connection.collections.companies.drop();


let done = 0;

for (let i = 0; i < companies.length; i++) {
  companies[i].save((err, result) => {
    console.log('SAVING ANOTHER COMPANY');
    done++;
    if (done === companies.length) {
      exit();
    }
  });
}

function exit() {
  mongoose.disconnect();
  console.log('EXITING');
}
