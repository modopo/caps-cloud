'use strict';

const { Consumer } = require('sqs-consumer');

const Chance = require('chance');
const chance = new Chance();

const AWS = require('aws-sdk');
const REGION = 'us-west-2';
AWS.config.update({ region: REGION });


const sns = new AWS.SNS();

const topic = 'arn:aws:sns:us-west-2:651157757406:pickup.fifo';

let count = 5;
while (count > 0) {
  let order = {
    orderId: chance.guid(),
    customer: chance.name(),
    vendorUrl: 'https://sqs.us-west-2.amazonaws.com/651157757406/flower'
  }

  let payload = {
    MessageGroupId: 'flower',
    Message: JSON.stringify(order),
    TopicArn: topic
  }

  setTimeout(() => {
    sns.publish(payload).promise()
      .then(data => {
        console.log("Message published: ", data);
      })
      .catch((e) => {
        console.log('SNS message error: ', e);
      });
  }, 5000)

  count--;
}

const app = Consumer.create({
  region: REGION,
  queueUrl: 'https://sqs.us-west-2.amazonaws.com/651157757406/flower',
  handleMessage: async (message) => {
    let data = JSON.parse(message.Body);
    console.log(data);
  }

});

app.start();