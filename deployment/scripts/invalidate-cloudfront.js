#!/usr/bin/env node

const AWS = require('aws-sdk');
const chalk = require('chalk');
const ora = require('ora');

// Configure AWS
const cloudfront = new AWS.CloudFront({
  region: 'us-east-1' // CloudFront API is only available in us-east-1
});

const DISTRIBUTION_IDS = {
  react: process.env.REACT_DISTRIBUTION_ID || '',
  angular: process.env.ANGULAR_DISTRIBUTION_ID || ''
};

/**
 * Create CloudFront invalidation
 */
async function createInvalidation(distributionId, paths = ['/*']) {
  const params = {
    DistributionId: distributionId,
    InvalidationBatch: {
      Paths: {
        Quantity: paths.length,
        Items: paths
      },
      CallerReference: `invalidation-${Date.now()}`
    }
  };

  const result = await cloudfront.createInvalidation(params).promise();
  return result.Invalidation;
}

/**
 * Wait for invalidation to complete
 */
async function waitForInvalidation(distributionId, invalidationId) {
  const params = {
    DistributionId: distributionId,
    Id: invalidationId
  };

  let status = 'InProgress';
  while (status === 'InProgress') {
    const result = await cloudfront.getInvalidation(params).promise();
    status = result.Invalidation.Status;
    
    if (status === 'InProgress') {
      await new Promise(resolve => setTimeout(resolve, 5000)); // Wait 5 seconds
    }
  }
  
  return status;
}

/**
 * Get CloudFront distribution info
 */
async function getDistributionInfo(distributionId) {
  const params = {
    Id: distributionId
  };

  try {
    const result = await cloudfront.getDistribution(params).promise();
    return {
      id: result.Distribution.Id,
      domainName: result.Distribution.DomainName,
      status: result.Distribution.Status,
      aliases: result.Distribution.DistributionConfig.Aliases.Items
    };
  } catch (error) {
    throw new Error(`Failed to get distribution info: ${error.message}`);
  }
}

/**
 * Main invalidation function
 */
async function main() {
  console.log(chalk.blue('🔄 Starting CloudFront cache invalidation...'));

  try {
    const invalidations = [];

    // Invalidate React Dashboard
    if (DISTRIBUTION_IDS.react) {
      const reactSpinner = ora('Getting React distribution info...').start();
      
      try {
        const reactInfo = await getDistributionInfo(DISTRIBUTION_IDS.react);
        reactSpinner.text = `Creating invalidation for React Dashboard (${reactInfo.domainName})...`;
        
        const reactInvalidation = await createInvalidation(DISTRIBUTION_IDS.react);
        invalidations.push({
          type: 'React Dashboard',
          distributionId: DISTRIBUTION_IDS.react,
          invalidationId: reactInvalidation.Id,
          domainName: reactInfo.domainName
        });
        
        reactSpinner.succeed(`React Dashboard invalidation created: ${reactInvalidation.Id} ✅`);
      } catch (error) {
        reactSpinner.fail('React Dashboard invalidation failed ❌');
        throw error;
      }
    } else {
      console.log(chalk.yellow('⚠️  React distribution ID not provided, skipping invalidation'));
    }

    // Invalidate Angular Budget & Alerts App
    if (DISTRIBUTION_IDS.angular) {
      const angularSpinner = ora('Getting Angular distribution info...').start();
      
      try {
        const angularInfo = await getDistributionInfo(DISTRIBUTION_IDS.angular);
        angularSpinner.text = `Creating invalidation for Angular Budget App (${angularInfo.domainName})...`;
        
        const angularInvalidation = await createInvalidation(DISTRIBUTION_IDS.angular);
        invalidations.push({
          type: 'Angular Budget App',
          distributionId: DISTRIBUTION_IDS.angular,
          invalidationId: angularInvalidation.Id,
          domainName: angularInfo.domainName
        });
        
        angularSpinner.succeed(`Angular Budget App invalidation created: ${angularInvalidation.Id} ✅`);
      } catch (error) {
        angularSpinner.fail('Angular Budget App invalidation failed ❌');
        throw error;
      }
    } else {
      console.log(chalk.yellow('⚠️  Angular distribution ID not provided, skipping invalidation'));
    }

    if (invalidations.length === 0) {
      console.log(chalk.yellow('No invalidations created. Make sure distribution IDs are set.'));
      return;
    }

    // Wait for invalidations to complete
    console.log(chalk.cyan('\n⏳ Waiting for invalidations to complete...'));
    
    const waitPromises = invalidations.map(async (inv) => {
      const spinner = ora(`Waiting for ${inv.type} invalidation...`).start();
      
      try {
        const status = await waitForInvalidation(inv.distributionId, inv.invalidationId);
        
        if (status === 'Completed') {
          spinner.succeed(`${inv.type} cache cleared successfully ✅`);
          return { ...inv, status: 'Completed' };
        } else {
          spinner.fail(`${inv.type} invalidation failed ❌`);
          return { ...inv, status: 'Failed' };
        }
      } catch (error) {
        spinner.fail(`${inv.type} invalidation error ❌`);
        throw error;
      }
    });

    const results = await Promise.all(waitPromises);
    
    // Display results
    console.log(chalk.green('\n✅ Cache invalidation completed!'));
    console.log(chalk.blue('\n📊 Invalidation Summary:'));
    
    results.forEach(result => {
      console.log(`${result.type}:`);
      console.log(`  Distribution: ${result.distributionId}`);
      console.log(`  Domain: ${result.domainName}`);
      console.log(`  Invalidation ID: ${result.invalidationId}`);
      console.log(`  Status: ${result.status}`);
      console.log('');
    });

    console.log(chalk.green('🎉 All CloudFront distributions have been invalidated!'));
    console.log(chalk.blue('💡 Changes should be visible worldwide within a few minutes.'));

  } catch (error) {
    console.error(chalk.red('❌ Cache invalidation failed:'), error.message);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main().catch(console.error);
}

module.exports = {
  createInvalidation,
  waitForInvalidation,
  getDistributionInfo,
  main
};