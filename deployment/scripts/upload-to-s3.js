#!/usr/bin/env node

const AWS = require('aws-sdk');
const path = require('path');
const fs = require('fs');
const chalk = require('chalk');
const ora = require('ora');

// Configure AWS
const s3 = new AWS.S3({
  region: process.env.AWS_REGION || 'us-east-1'
});

const BUCKET_NAMES = {
  react: process.env.REACT_BUCKET_NAME || 'cloudmern-react-dashboard-prod',
  angular: process.env.ANGULAR_BUCKET_NAME || 'cloudmern-angular-budget-prod'
};

const BUILD_PATHS = {
  react: path.join(__dirname, '../../react-analytics-dashboard/build'),
  angular: path.join(__dirname, '../../angular-budget-alerts/dist')
};

/**
 * Upload a single file to S3
 */
async function uploadFile(bucketName, filePath, key) {
  const fileContent = fs.readFileSync(filePath);
  
  // Determine content type
  let contentType = 'text/html';
  const ext = path.extname(filePath).toLowerCase();
  
  const contentTypes = {
    '.html': 'text/html',
    '.css': 'text/css',
    '.js': 'application/javascript',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.ico': 'image/x-icon',
    '.ttf': 'font/ttf',
    '.woff': 'font/woff',
    '.woff2': 'font/woff2'
  };
  
  contentType = contentTypes[ext] || 'application/octet-stream';
  
  // Set cache control headers
  let cacheControl = 'public, max-age=31536000'; // 1 year for assets
  if (ext === '.html') {
    cacheControl = 'public, max-age=0'; // No cache for HTML files
  } else if (ext === '.js' || ext === '.css') {
    cacheControl = 'public, max-age=31536000, immutable'; // 1 year + immutable
  }

  const params = {
    Bucket: bucketName,
    Key: key,
    Body: fileContent,
    ContentType: contentType,
    CacheControl: cacheControl,
    Metadata: {
      'upload-time': new Date().toISOString(),
      'deployed-by': 'deployment-script'
    }
  };

  await s3.upload(params).promise();
}

/**
 * Upload directory recursively to S3
 */
async function uploadDirectory(bucketName, directoryPath, keyPrefix = '') {
  const items = fs.readdirSync(directoryPath, { withFileTypes: true });
  const uploadPromises = [];

  for (const item of items) {
    const itemPath = path.join(directoryPath, item.name);
    const key = keyPrefix ? `${keyPrefix}/${item.name}` : item.name;

    if (item.isDirectory()) {
      // Recursively upload subdirectory
      const subPromises = await uploadDirectory(bucketName, itemPath, key);
      uploadPromises.push(...subPromises);
    } else if (item.isFile()) {
      // Upload file
      uploadPromises.push(uploadFile(bucketName, itemPath, key));
    }
  }

  return uploadPromises;
}

/**
 * Clear S3 bucket contents
 */
async function clearBucket(bucketName) {
  const listParams = {
    Bucket: bucketName
  };

  const listedObjects = await s3.listObjectsV2(listParams).promise();

  if (listedObjects.Contents.length === 0) {
    return;
  }

  const deleteParams = {
    Bucket: bucketName,
    Delete: {
      Objects: listedObjects.Contents.map(({ Key }) => ({ Key }))
    }
  };

  await s3.deleteObjects(deleteParams).promise();

  // If there are more objects, continue deleting
  if (listedObjects.IsTruncated) {
    await clearBucket(bucketName);
  }
}

/**
 * Main upload function
 */
async function main() {
  console.log(chalk.blue('🚀 Starting deployment to S3...'));
  
  try {
    // Check if build directories exist
    if (!fs.existsSync(BUILD_PATHS.react)) {
      console.error(chalk.red(`❌ React build directory not found: ${BUILD_PATHS.react}`));
      console.log(chalk.yellow('Run: cd react-analytics-dashboard && npm run build'));
      process.exit(1);
    }

    if (!fs.existsSync(BUILD_PATHS.angular)) {
      console.error(chalk.red(`❌ Angular build directory not found: ${BUILD_PATHS.angular}`));
      console.log(chalk.yellow('Run: cd angular-budget-alerts && npm run build'));
      process.exit(1);
    }

    // Upload React Dashboard
    console.log(chalk.cyan('\n📦 Uploading React Analytics Dashboard...'));
    const reactSpinner = ora('Clearing React S3 bucket...').start();
    
    try {
      await clearBucket(BUCKET_NAMES.react);
      reactSpinner.text = 'Uploading React build files...';
      
      const reactUploadPromises = await uploadDirectory(BUCKET_NAMES.react, BUILD_PATHS.react);
      await Promise.all(reactUploadPromises);
      
      reactSpinner.succeed('React Dashboard uploaded successfully ✅');
    } catch (error) {
      reactSpinner.fail('React Dashboard upload failed ❌');
      throw error;
    }

    // Upload Angular Budget & Alerts App
    console.log(chalk.cyan('\n📦 Uploading Angular Budget & Alerts App...'));
    const angularSpinner = ora('Clearing Angular S3 bucket...').start();
    
    try {
      await clearBucket(BUCKET_NAMES.angular);
      angularSpinner.text = 'Uploading Angular build files...';
      
      const angularUploadPromises = await uploadDirectory(BUCKET_NAMES.angular, BUILD_PATHS.angular);
      await Promise.all(angularUploadPromises);
      
      angularSpinner.succeed('Angular Budget App uploaded successfully ✅');
    } catch (error) {
      angularSpinner.fail('Angular Budget App upload failed ❌');
      throw error;
    }

    console.log(chalk.green('\n✅ All applications uploaded successfully!'));
    
    // Display URLs
    console.log(chalk.blue('\n📱 Application URLs:'));
    console.log(`React Dashboard: https://${BUCKET_NAMES.react}.s3-website-us-east-1.amazonaws.com`);
    console.log(`Angular Budget App: https://${BUCKET_NAMES.angular}.s3-website-us-east-1.amazonaws.com`);
    console.log(chalk.yellow('\n💡 Use CloudFront URLs for production access with CDN benefits'));

  } catch (error) {
    console.error(chalk.red('❌ Deployment failed:'), error.message);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main().catch(console.error);
}

module.exports = {
  uploadDirectory,
  uploadFile,
  clearBucket,
  main
};