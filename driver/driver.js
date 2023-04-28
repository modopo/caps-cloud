'use strict';

const { Consumer } = require('sqs-consumer');
const { Producer } = require('sqs-producer');
const Chance = require('chance');
const chance = new Chance();

const app = Consumer.create({
  region: 'us-west-2',
  queueUrl: 'https://sqs.us-west-2.amazonaws.com/651157757406/package.fifo',
  handleMessage: async (message) => {
    try {
      let delivered = JSON.parse(message.Body);
      let deliveredQueue = JSON.parse(delivered.Message).vendorUrl;
      console.log(`DELIVERED: ${deliveredQueue}`);

      const producer = Producer.create({
        queueUrl: deliveredQueue,
        region: 'us-west-2'
      });

      producer.send({
        id: chance.guid(),
        body: JSON.stringify('Package Delivered')
      })
        .then(data => {
          console.log('Delivery completed');
          console.log(`Message data: ${data}`)
        })
        .catch(error => {
          console.log(`SQS Producer error: ${error}`)
        })

    } catch (e) {
      console.log('Message receipt error', e);
    }
  }
});

app.start();