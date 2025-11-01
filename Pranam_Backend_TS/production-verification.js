// Production Deployment Verification Script
const fs = require('fs');
const path = require('path');

class ProductionVerifier {
  constructor() {
    this.checks = [];
    this.warnings = [];
    this.errors = [];
  }

  log(type, message) {
    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] ${type}: ${message}`;
    
    if (type === 'ERROR') {
      this.errors.push(message);
      console.log(`❌ ${message}`);
    } else if (type === 'WARNING') {
      this.warnings.push(message);
      console.log(`⚠️  ${message}`);
    } else {
      this.checks.push(message);
      console.log(`✅ ${message}`);
    }
  }

  checkFileExists(filePath, description) {
    if (fs.existsSync(filePath)) {
      this.log('CHECK', `${description} exists: ${filePath}`);
      return true;
    } else {
      this.log('ERROR', `${description} missing: ${filePath}`);
      return false;
    }
  }

  checkEnvironmentFile() {
    console.log('\n📋 Checking Environment Configuration...');
    
    const envPath = '.env';
    const envExamplePath = '.env.example';
    
    this.checkFileExists(envExamplePath, '.env.example template');
    
    if (this.checkFileExists(envPath, 'Environment file')) {
      const envContent = fs.readFileSync(envPath, 'utf8');
      
      // Check required environment variables
      const requiredVars = [
        'NODE_ENV',
        'PORT',
        'MONGO_URI',
        'JWT_SECRET',
        'JWT_REFRESH_SECRET',
        'RAZORPAY_KEY_ID',
        'RAZORPAY_KEY_SECRET'
      ];
      
      requiredVars.forEach(varName => {
        if (envContent.includes(`${varName}=`)) {
          this.log('CHECK', `Environment variable ${varName} configured`);
        } else {
          this.log('ERROR', `Environment variable ${varName} missing`);
        }
      });
      
      // Check for development values that should be changed
      if (envContent.includes('dev-super-secret')) {
        this.log('WARNING', 'Development JWT secrets detected - change for production');
      }
      
      if (envContent.includes('admin123')) {
        this.log('WARNING', 'Default admin password detected - change for production');
      }
      
      if (envContent.includes('rzp_test_')) {
        this.log('WARNING', 'Test Razorpay keys detected - use live keys for production');
      }
    }
  }

  checkDockerConfiguration() {
    console.log('\n🐳 Checking Docker Configuration...');
    
    this.checkFileExists('Dockerfile', 'Dockerfile');
    this.checkFileExists('docker-compose.yml', 'Docker Compose file');
    this.checkFileExists('.dockerignore', 'Docker ignore file');
    
    if (fs.existsSync('Dockerfile')) {
      const dockerContent = fs.readFileSync('Dockerfile', 'utf8');
      
      if (dockerContent.includes('FROM node:')) {
        this.log('CHECK', 'Node.js base image configured');
      }
      
      if (dockerContent.includes('USER node') || dockerContent.includes('USER 1000')) {
        this.log('CHECK', 'Non-root user configured in Docker');
      } else {
        this.log('WARNING', 'Consider running as non-root user in Docker');
      }
      
      if (dockerContent.includes('EXPOSE')) {
        this.log('CHECK', 'Port exposure configured');
      }
    }
  }

  checkPackageConfiguration() {
    console.log('\n📦 Checking Package Configuration...');
    
    if (this.checkFileExists('package.json', 'Package.json')) {
      const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
      
      // Check scripts
      const requiredScripts = ['start', 'dev', 'build', 'test'];
      requiredScripts.forEach(script => {
        if (packageJson.scripts && packageJson.scripts[script]) {
          this.log('CHECK', `Script '${script}' configured`);
        } else {
          this.log('WARNING', `Script '${script}' missing`);
        }
      });
      
      // Check dependencies
      const criticalDeps = ['express', 'mongoose', 'bcryptjs', 'jsonwebtoken', 'razorpay'];
      criticalDeps.forEach(dep => {
        if (packageJson.dependencies && packageJson.dependencies[dep]) {
          this.log('CHECK', `Dependency '${dep}' installed`);
        } else {
          this.log('ERROR', `Critical dependency '${dep}' missing`);
        }
      });
      
      // Check for package-lock.json
      this.checkFileExists('package-lock.json', 'Package lock file');
    }
  }

  checkSecurityConfiguration() {
    console.log('\n🔒 Checking Security Configuration...');
    
    // Check for security-related files
    const securityFiles = [
      'src/middleware/auth.ts',
      'src/middleware/security.ts',
      'src/utils/jwt.ts'
    ];
    
    securityFiles.forEach(file => {
      this.checkFileExists(file, `Security file: ${file}`);
    });
    
    // Check for sensitive files that shouldn't be committed
    const sensitiveFiles = ['.env', 'config/production.js'];
    sensitiveFiles.forEach(file => {
      if (fs.existsSync(file)) {
        this.log('WARNING', `Sensitive file exists: ${file} - ensure it's in .gitignore`);
      }
    });
    
    // Check .gitignore
    if (this.checkFileExists('.gitignore', 'Git ignore file')) {
      const gitignoreContent = fs.readFileSync('.gitignore', 'utf8');
      
      const shouldIgnore = ['.env', 'node_modules', 'dist', 'logs'];
      shouldIgnore.forEach(pattern => {
        if (gitignoreContent.includes(pattern)) {
          this.log('CHECK', `Gitignore includes: ${pattern}`);
        } else {
          this.log('WARNING', `Gitignore missing: ${pattern}`);
        }
      });
    }
  }

  checkDocumentation() {
    console.log('\n📚 Checking Documentation...');
    
    const docFiles = [
      'README.md',
      'API_DOCUMENTATION.md',
      'PRODUCTION_CHECKLIST.md'
    ];
    
    docFiles.forEach(file => {
      this.checkFileExists(file, `Documentation: ${file}`);
    });
  }

  checkTestConfiguration() {
    console.log('\n🧪 Checking Test Configuration...');
    
    this.checkFileExists('jest.config.js', 'Jest configuration');
    
    // Check for test files
    const testDirs = ['src/tests', 'tests', '__tests__'];
    let hasTests = false;
    
    testDirs.forEach(dir => {
      if (fs.existsSync(dir)) {
        this.log('CHECK', `Test directory exists: ${dir}`);
        hasTests = true;
      }
    });
    
    if (!hasTests) {
      this.log('WARNING', 'No test directories found');
    }
  }

  checkDatabaseConfiguration() {
    console.log('\n🗄️  Checking Database Configuration...');
    
    const dbFiles = [
      'src/config/database.ts',
      'src/models',
      'src/scripts/seed.ts'
    ];
    
    dbFiles.forEach(file => {
      this.checkFileExists(file, `Database file: ${file}`);
    });
  }

  generateReport() {
    console.log('\n📊 Production Readiness Report');
    console.log('=====================================');
    
    console.log(`\n✅ Checks Passed: ${this.checks.length}`);
    console.log(`⚠️  Warnings: ${this.warnings.length}`);
    console.log(`❌ Errors: ${this.errors.length}`);
    
    if (this.warnings.length > 0) {
      console.log('\n⚠️  Warnings:');
      this.warnings.forEach(warning => console.log(`   - ${warning}`));
    }
    
    if (this.errors.length > 0) {
      console.log('\n❌ Errors:');
      this.errors.forEach(error => console.log(`   - ${error}`));
    }
    
    const score = (this.checks.length / (this.checks.length + this.errors.length)) * 100;
    console.log(`\n📈 Production Readiness Score: ${score.toFixed(1)}%`);
    
    if (this.errors.length === 0) {
      console.log('\n🎉 Production Ready! All critical checks passed.');
    } else {
      console.log('\n🔧 Action Required: Please fix the errors above before production deployment.');
    }
    
    return {
      score,
      checks: this.checks.length,
      warnings: this.warnings.length,
      errors: this.errors.length,
      isReady: this.errors.length === 0
    };
  }

  async runAllChecks() {
    console.log('🚀 Starting Production Deployment Verification\n');
    
    this.checkEnvironmentFile();
    this.checkPackageConfiguration();
    this.checkDockerConfiguration();
    this.checkSecurityConfiguration();
    this.checkDatabaseConfiguration();
    this.checkTestConfiguration();
    this.checkDocumentation();
    
    return this.generateReport();
  }
}

// Run verification
const verifier = new ProductionVerifier();
verifier.runAllChecks().then(result => {
  process.exit(result.isReady ? 0 : 1);
}).catch(error => {
  console.error('Verification failed:', error);
  process.exit(1);
});
