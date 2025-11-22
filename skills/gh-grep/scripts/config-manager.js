const fs = require('fs');
const path = require('path');
const os = require('os');

class ConfigManager {
  constructor() {
    this.configDir = path.join(os.homedir(), '.gh-grep');
    this.configFile = path.join(this.configDir, 'config.json');
    this.defaultConfig = {
      defaultFormat: 'markdown',
      defaultLimit: 50,
      showContext: true,
      highlightMatches: true,
      maxContextLines: 5,
      // Common language presets
      languagePresets: {
        'frontend': ['TypeScript', 'JavaScript', 'HTML', 'CSS'],
        'backend': ['Python', 'Go', 'Java', 'C#', 'PHP'],
        'mobile': ['Swift', 'Kotlin', 'Dart', 'JavaScript'],
        'devops': ['YAML', 'Dockerfile', 'Shell', 'HCL']
      },
      // Repository shortcuts
      repositoryShortcuts: {
        'react': 'facebook/react',
        'vue': 'vuejs/vue',
        'angular': 'angular/angular',
        'express': 'expressjs/express',
        'next': 'vercel/next.js',
        'webpack': 'webpack/webpack'
      },
      // Common search patterns
      searchPatterns: {
        'hooks': 'use\\w+',
        'async': 'async.*await|Promise\\.|\\.then\\(',
        'error': 'try.*catch|throw new|Error\\(',
        'import': 'import.*from|require\\(',
        'export': 'export.*|module\\.exports'
      }
    };

    this.ensureConfigDir();
    this.config = this.loadConfig();
  }

  /**
   * Ensure config directory exists
   */
  ensureConfigDir() {
    if (!fs.existsSync(this.configDir)) {
      fs.mkdirSync(this.configDir, { recursive: true });
    }
  }

  /**
   * Load configuration from file
   */
  loadConfig() {
    try {
      if (fs.existsSync(this.configFile)) {
        const configData = fs.readFileSync(this.configFile, 'utf8');
        return { ...this.defaultConfig, ...JSON.parse(configData) };
      }
    } catch (error) {
      console.warn('Warning: Could not load config file, using defaults');
    }

    // Create default config if none exists
    this.saveConfig(this.defaultConfig);
    return { ...this.defaultConfig };
  }

  /**
   * Save configuration to file
   */
  saveConfig(config = this.config) {
    try {
      fs.writeFileSync(this.configFile, JSON.stringify(config, null, 2));
      this.config = config;
    } catch (error) {
      throw new Error(`Failed to save config: ${error.message}`);
    }
  }

  /**
   * Get a configuration value
   */
  get(key) {
    return key.split('.').reduce((obj, k) => obj && obj[k], this.config);
  }

  /**
   * Set a configuration value
   */
  set(key, value) {
    const keys = key.split('.');
    const lastKey = keys.pop();
    const target = keys.reduce((obj, k) => {
      if (!obj[k]) obj[k] = {};
      return obj[k];
    }, this.config);

    target[lastKey] = value;
    this.saveConfig();
  }

  /**
   * List all configuration
   */
  list() {
    return { ...this.config };
  }

  /**
   * Get language preset
   */
  getLanguagePreset(name) {
    return this.config.languagePresets[name];
  }

  /**
   * Get repository shortcut
   */
  getRepositoryShortcut(name) {
    return this.config.repositoryShortcuts[name];
  }

  /**
   * Get search pattern
   */
  getSearchPattern(name) {
    return this.config.searchPatterns[name];
  }

  /**
   * Expand language preset names to actual language arrays
   */
  expandLanguages(languages) {
    const expanded = [];

    for (const lang of languages) {
      const preset = this.getLanguagePreset(lang.toLowerCase());
      if (preset) {
        expanded.push(...preset);
      } else {
        expanded.push(lang);
      }
    }

    return [...new Set(expanded)]; // Remove duplicates
  }

  /**
   * Expand repository shortcuts to full repository names
   */
  expandRepository(repo) {
    const shortcut = this.getRepositoryShortcut(repo.toLowerCase());
    return shortcut || repo;
  }

  /**
   * Expand search pattern names to regex patterns
   */
  expandSearchPattern(pattern) {
    const searchPattern = this.getSearchPattern(pattern.toLowerCase());
    return searchPattern || pattern;
  }

  /**
   * Add a custom language preset
   */
  addLanguagePreset(name, languages) {
    this.config.languagePresets[name] = languages;
    this.saveConfig();
  }

  /**
   * Add a repository shortcut
   */
  addRepositoryShortcut(name, repository) {
    this.config.repositoryShortcuts[name] = repository;
    this.saveConfig();
  }

  /**
   * Add a search pattern
   */
  addSearchPattern(name, pattern) {
    this.config.searchPatterns[name] = pattern;
    this.saveConfig();
  }

  /**
   * Reset configuration to defaults
   */
  reset() {
    this.config = { ...this.defaultConfig };
    this.saveConfig();
  }

  /**
   * Export configuration
   */
  export(filePath) {
    try {
      fs.writeFileSync(filePath, JSON.stringify(this.config, null, 2));
    } catch (error) {
      throw new Error(`Failed to export config: ${error.message}`);
    }
  }

  /**
   * Import configuration
   */
  import(filePath) {
    try {
      const configData = fs.readFileSync(filePath, 'utf8');
      const importedConfig = JSON.parse(configData);
      this.config = { ...this.defaultConfig, ...importedConfig };
      this.saveConfig();
    } catch (error) {
      throw new Error(`Failed to import config: ${error.message}`);
    }
  }

  /**
   * Validate configuration
   */
  validate() {
    const required = ['defaultFormat', 'defaultLimit'];
    const errors = [];

    for (const key of required) {
      if (this.config[key] === undefined) {
        errors.push(`Missing required config: ${key}`);
      }
    }

    if (!['json', 'markdown'].includes(this.config.defaultFormat)) {
      errors.push('defaultFormat must be either "json" or "markdown"');
    }

    if (typeof this.config.defaultLimit !== 'number' || this.config.defaultLimit < 1) {
      errors.push('defaultLimit must be a positive number');
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }
}

module.exports = ConfigManager;