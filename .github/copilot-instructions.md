# ioBroker Adapter Development with GitHub Copilot

**Version:** 0.4.0
**Template Source:** https://github.com/DrozmotiX/ioBroker-Copilot-Instructions

This file contains instructions and best practices for GitHub Copilot when working on ioBroker adapter development.

## Project Context

You are working on an ioBroker adapter. ioBroker is an integration platform for the Internet of Things, focused on building smart home and industrial IoT solutions. Adapters are plugins that connect ioBroker to external systems, devices, or services.

**Adapter-Specific Context:**
- **Type**: ioBroker Visualization Widget Adapter (not a standard device adapter)
- **Name**: iobroker.vis-players
- **Primary Function**: Media player widgets for ioBroker.vis visualization interface
- **Widget Types**: Winamp-style player, Sonos-style player, playlist managers
- **Dependencies**: Requires vis adapter to be installed, uses vis widget framework
- **Target Use Case**: Provides customizable media player controls within ioBroker dashboards
- **No Backend Logic**: This is a pure frontend visualization component, no main.js adapter file

## Testing

### Unit Testing
- Use Jest as the primary testing framework for ioBroker adapters
- Create tests for all adapter main functions and helper methods
- Test error handling scenarios and edge cases
- Mock external API calls and hardware dependencies
- For adapters connecting to APIs/devices not reachable by internet, provide example data files to allow testing of functionality without live connections
- Example test structure:
  ```javascript
  describe('AdapterName', () => {
    let adapter;
    
    beforeEach(() => {
      // Setup test adapter instance
    });
    
    test('should initialize correctly', () => {
      // Test adapter initialization
    });
  });
  ```

### Integration Testing

**IMPORTANT**: Use the official `@iobroker/testing` framework for all integration tests. This is the ONLY correct way to test ioBroker adapters.

**Official Documentation**: https://github.com/ioBroker/testing

#### Framework Structure
Integration tests MUST follow this exact pattern:

```javascript
const path = require('path');
const { tests } = require('@iobroker/testing');

// Define test coordinates or configuration
const TEST_COORDINATES = '52.520008,13.404954'; // Berlin
const wait = ms => new Promise(resolve => setTimeout(resolve, ms));

// Use tests.integration() with defineAdditionalTests
tests.integration(path.join(__dirname, '..'), {
    defineAdditionalTests({ suite }) {
        suite('Test adapter with specific configuration', (getHarness) => {
            let harness;

            before(() => {
                harness = getHarness();
            });

            it('should configure and start adapter', function () {
                return new Promise(async (resolve, reject) => {
                    try {
                        harness = getHarness();
                        
                        // Get adapter object using promisified pattern
                        const obj = await new Promise((res, rej) => {
                            harness.objects.getObject('system.adapter.your-adapter.0', (err, o) => {
                                if (err) return rej(err);
                                res(o);
                            });
                        });
                        
                        if (!obj) {
                            return reject(new Error('Adapter object not found'));
                        }

                        // Configure adapter properties
                        Object.assign(obj.native, {
                            position: TEST_COORDINATES,
                            createCurrently: true,
                            createHourly: true,
                            createDaily: true,
                            // Add other configuration as needed
                        });

                        // Set the updated configuration
                        harness.objects.setObject(obj._id, obj);

                        console.log('✅ Step 1: Configuration written, starting adapter...');
                        
                        // Start adapter and wait
                        await harness.startAdapterAndWait();
                        
                        console.log('✅ Step 2: Adapter started');

                        // Wait for adapter to process data
                        const waitMs = 15000;
                        await wait(waitMs);

                        console.log('🔍 Step 3: Checking states after adapter run...');
                        
                        // Check if states were created and contain expected data
                        const states = await harness.objects.getObjectViewAsync('system', 'state', {
                            startkey: 'your-adapter.0.',
                            endkey: 'your-adapter.0.\u9999'
                        });
                        
                        // Validation logic here
                        const stateCount = states.rows.length;
                        console.log(`📊 Found ${stateCount} states created by adapter`);
                        
                        if (stateCount === 0) {
                            return reject(new Error('Expected adapter to create states, but none were found'));
                        }
                        
                        // Additional validation for specific expected states
                        const requiredStates = ['info.connection'];
                        for (const stateName of requiredStates) {
                            const stateObj = await harness.objects.getObjectAsync(`your-adapter.0.${stateName}`);
                            if (!stateObj) {
                                return reject(new Error(`Required state '${stateName}' was not created`));
                            }
                            console.log(`✅ Required state '${stateName}' found`);
                        }
                        
                        console.log('✅ All integration tests passed');
                        resolve();
                        
                    } catch (error) {
                        console.error('❌ Integration test failed:', error);
                        reject(error);
                    }
                });
            }).timeout(180000); // 3 minutes timeout for full integration test
        });
    }
});
```

**Special Considerations for Widget Adapters:**
- Widget adapters like vis-players don't follow standard adapter patterns - they are pure frontend components
- Testing should focus on HTML/CSS/JavaScript widget functionality rather than backend adapter logic
- Use browser-based testing frameworks for widget interaction testing
- Test widget rendering, state updates, and user interactions within vis environment

#### Alternative Testing Approach for Widget Adapters

For visualization widget adapters, consider browser-based testing:

```javascript
// Widget-specific testing pattern
describe('Media Player Widgets', () => {
    let page;
    
    beforeAll(async () => {
        // Setup browser test environment
        page = await browser.newPage();
        await page.goto('http://localhost:8082/vis/edit.html');
    });
    
    test('should render Winamp player widget', async () => {
        // Test widget rendering and interactions
        await page.evaluate(() => {
            // Widget initialization code
        });
        
        // Verify widget appearance and functionality
        const widget = await page.$('.winamp-player');
        expect(widget).toBeTruthy();
    });
});
```

## Logging Guidelines

### Log Levels (ordered by severity)
1. **error**: Critical failures, unrecoverable states, system errors
   ```javascript
   this.log.error('Database connection failed: ' + error.message);
   ```

2. **warn**: Non-critical issues, fallbacks triggered, deprecated features
   ```javascript
   this.log.warn('API rate limit reached, retrying in 60 seconds');
   ```

3. **info**: Important events, state changes, configuration updates
   ```javascript
   this.log.info('Successfully connected to weather service');
   ```

4. **debug**: Detailed diagnostic information, request/response data
   ```javascript
   this.log.debug('Received data: ' + JSON.stringify(data));
   ```

### Widget-Specific Logging
For visualization widgets, logging should be minimal and user-focused:
- Use console.log sparingly, only for debugging during development
- Prefer visual feedback (error states in UI) over console logging
- Log initialization and major state changes to help with troubleshooting

## Error Handling Best Practices

### Basic Error Handling Pattern
```javascript
try {
  // Your code here
  const result = await apiCall();
  this.log.info('Operation successful');
} catch (error) {
  this.log.error('Operation failed: ' + error.message);
  // Implement graceful degradation
  this.setState('info.connection', false, true);
}
```

### Retry Logic for External APIs
```javascript
async function retryOperation(operation, maxRetries = 3) {
  let lastError;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;
      this.log.warn(`Attempt ${attempt} failed: ${error.message}`);
      
      if (attempt < maxRetries) {
        const delay = Math.pow(2, attempt) * 1000; // Exponential backoff
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
  
  throw lastError;
}
```

### Connection State Management
```javascript
// Always maintain connection state
this.setState('info.connection', true, true);  // Connected
this.setState('info.connection', false, true); // Disconnected

// Include connection quality indicators
this.setState('info.signal_strength', signalLevel, true);
```

## Widget Development Best Practices

### Widget Structure (HTML/CSS/JavaScript)
```html
<!-- Widget HTML Template -->
<div class="media-player-widget" style="position: relative;">
    <div class="player-display">
        <div class="track-info">
            <span class="track-title">Loading...</span>
            <span class="artist-name"></span>
        </div>
    </div>
    <div class="player-controls">
        <button class="btn-previous">⏮</button>
        <button class="btn-play-pause">▶</button>
        <button class="btn-next">⏭</button>
    </div>
</div>
```

### Widget CSS Guidelines
```css
.media-player-widget {
    font-family: 'Arial', sans-serif;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    border-radius: 8px;
    padding: 10px;
    color: white;
    overflow: hidden;
}

.player-controls button {
    background: transparent;
    border: none;
    color: white;
    font-size: 18px;
    cursor: pointer;
    transition: opacity 0.3s;
}

.player-controls button:hover {
    opacity: 0.7;
}
```

### Widget JavaScript Integration with ioBroker
```javascript
// Widget initialization
vis.binds.players = {
    init: function() {
        // Initialize widget after vis is ready
    },
    
    playersWidget: function(widgetID, view, data, style) {
        // Widget creation function
        var $widget = $('#' + widgetID);
        
        // Subscribe to state changes
        if (data.oid_track) {
            vis.states.bind(data.oid_track + '.val', function(e, newVal, oldVal) {
                $widget.find('.track-title').text(newVal || 'Unknown Track');
            });
        }
        
        // Handle button clicks
        $widget.find('.btn-play-pause').click(function() {
            var isPlaying = $(this).hasClass('playing');
            if (data.oid_play) {
                vis.setValue(data.oid_play, !isPlaying);
            }
        });
        
        return $widget;
    }
};
```

## State Management

### State Creation and Types
```javascript
// Boolean states
await this.setObjectNotExistsAsync('controls.play', {
    type: 'state',
    common: {
        name: 'Play/Pause',
        type: 'boolean',
        role: 'button.play',
        read: true,
        write: true
    },
    native: {}
});

// String states for media info
await this.setObjectNotExistsAsync('info.track', {
    type: 'state',
    common: {
        name: 'Current Track',
        type: 'string',
        role: 'media.title',
        read: true,
        write: false
    },
    native: {}
});

// Numeric states for progress/volume
await this.setObjectNotExistsAsync('controls.volume', {
    type: 'state',
    common: {
        name: 'Volume',
        type: 'number',
        role: 'level.volume',
        read: true,
        write: true,
        min: 0,
        max: 100,
        unit: '%'
    },
    native: {}
});
```

### Widget State Synchronization
For widget adapters, state synchronization is handled by the vis framework:

```javascript
// In widget: Listen for state changes
vis.states.bind(data.oid_volume + '.val', function(e, newVal, oldVal) {
    updateVolumeSlider(newVal);
});

// In widget: Update states from user interaction
function onVolumeChange(newVolume) {
    if (data.oid_volume) {
        vis.setValue(data.oid_volume, newVolume);
    }
}
```

## JSON Config Management

While widget adapters typically don't use complex JSON configurations, some settings may be needed:

### Basic JSON Config Structure
```json
{
  "type": "panel",
  "items": {
    "defaultSkin": {
      "type": "select",
      "label": "Default Widget Skin",
      "options": [
        {"label": "Winamp Classic", "value": "winamp"},
        {"label": "Sonos Style", "value": "sonos"},
        {"label": "Modern Dark", "value": "modern-dark"}
      ]
    },
    "autoConnect": {
      "type": "checkbox",
      "label": "Auto-connect to media players"
    }
  }
}
```

### Config Validation
```javascript
function validateConfig(config) {
    if (!config.defaultSkin || !['winamp', 'sonos', 'modern-dark'].includes(config.defaultSkin)) {
        config.defaultSkin = 'winamp';
    }
    return config;
}
```

## Cleanup and Resource Management

### Standard Adapter Cleanup
```javascript
onUnload(callback) {
  try {
    // Clear intervals and timeouts
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval);
      this.refreshInterval = undefined;
    }
    
    if (this.connectionTimer) {
      clearTimeout(this.connectionTimer);
      this.connectionTimer = undefined;
    }
    // Close connections, clean up resources
    callback();
  } catch (e) {
    callback();
  }
}
```

### Widget-Specific Cleanup
For widgets, cleanup happens when widgets are destroyed:

```javascript
// In widget definition
vis.binds.players.destroy = function(widgetID) {
    var $widget = $('#' + widgetID);
    
    // Unbind event listeners
    $widget.off('click');
    
    // Clear any timers or intervals specific to this widget
    if (widgetTimers[widgetID]) {
        clearInterval(widgetTimers[widgetID]);
        delete widgetTimers[widgetID];
    }
};
```

## Code Style and Standards

- Follow JavaScript/TypeScript best practices
- Use async/await for asynchronous operations
- Implement proper resource cleanup in `unload()` method
- Use semantic versioning for adapter releases
- Include proper JSDoc comments for public methods
- For widgets: Follow vis widget development patterns and maintain compatibility with vis framework
- Use consistent naming conventions for widget classes and IDs
- Implement responsive design for widgets to work across different screen sizes

## CI/CD and Testing Integration

### GitHub Actions for API Testing
For adapters with external API dependencies, implement separate CI/CD jobs:

```yaml
# Tests API connectivity with demo credentials (runs separately)
demo-api-tests:
  if: contains(github.event.head_commit.message, '[skip ci]') == false
  
  runs-on: ubuntu-22.04
  
  steps:
    - name: Checkout code
      uses: actions/checkout@v4
      
    - name: Use Node.js 20.x
      uses: actions/setup-node@v4
      with:
        node-version: 20.x
        cache: 'npm'
        
    - name: Install dependencies
      run: npm ci
      
    - name: Run demo API tests
      run: npm run test:integration-demo
```

### Widget Testing in CI/CD
For widget adapters, testing might focus on build validation:

```yaml
widget-validation:
  runs-on: ubuntu-22.04
  
  steps:
    - name: Checkout code
      uses: actions/checkout@v4
      
    - name: Validate widget HTML/CSS/JS
      run: |
        # Check for syntax errors in widget files
        find widgets/ -name "*.js" -exec node -c {} \;
        
    - name: Test widget package structure
      run: npm run test:package
```

### CI/CD Best Practices
- Run credential tests separately from main test suite
- Use ubuntu-22.04 for consistency
- Don't make credential tests required for deployment
- Provide clear failure messages for API connectivity issues
- Use appropriate timeouts for external API calls (120+ seconds)
- For widget adapters: Focus on build validation rather than runtime testing

### Package.json Script Integration
Add dedicated script for credential testing:
```json
{
  "scripts": {
    "test:integration-demo": "mocha test/integration-demo --exit",
    "test:widgets": "node scripts/validate-widgets.js"
  }
}
```

### Practical Example: Complete API Testing Implementation
Here's a complete example based on lessons learned from the Discovergy adapter:

#### test/integration-demo.js
```javascript
const path = require("path");
const { tests } = require("@iobroker/testing");

// Helper function to encrypt password using ioBroker's encryption method
async function encryptPassword(harness, password) {
    const systemConfig = await harness.objects.getObjectAsync("system.config");
    
    if (!systemConfig || !systemConfig.native || !systemConfig.native.secret) {
        throw new Error("Could not retrieve system secret for password encryption");
    }
    
    const secret = systemConfig.native.secret;
    let result = '';
    for (let i = 0; i < password.length; ++i) {
        result += String.fromCharCode(secret[i % secret.length].charCodeAt(0) ^ password.charCodeAt(i));
    }
    
    return result;
}

// Run integration tests with demo credentials
tests.integration(path.join(__dirname, ".."), {
    defineAdditionalTests({ suite }) {
        suite("API Testing with Demo Credentials", (getHarness) => {
            let harness;
            
            before(() => {
                harness = getHarness();
            });

            it("Should connect to API and initialize with demo credentials", async () => {
                console.log("Setting up demo credentials...");
                
                if (harness.isAdapterRunning()) {
                    await harness.stopAdapter();
                }
                
                const encryptedPassword = await encryptPassword(harness, "demo_password");
                
                await harness.changeAdapterConfig("your-adapter", {
                    native: {
                        username: "demo@provider.com",
                        password: encryptedPassword,
                        // other config options
                    }
                });

                console.log("Starting adapter with demo credentials...");
                await harness.startAdapter();
                
                // Wait for API calls and initialization
                await new Promise(resolve => setTimeout(resolve, 60000));
                
                const connectionState = await harness.states.getStateAsync("your-adapter.0.info.connection");
                
                if (connectionState && connectionState.val === true) {
                    console.log("✅ SUCCESS: API connection established");
                    return true;
                } else {
                    throw new Error("API Test Failed: Expected API connection to be established with demo credentials. " +
                        "Check logs above for specific API errors (DNS resolution, 401 Unauthorized, network issues, etc.)");
                }
            }).timeout(120000);
        });
    }
});
```

## Widget-Specific Development Guidelines

### Widget File Organization
```
widgets/
├── players/
│   ├── css/
│   │   ├── winamp.css
│   │   └── sonos.css
│   ├── img/
│   │   ├── winamp.png
│   │   └── sonos.png
│   └── js/
│       ├── winamp.js
│       └── sonos.js
├── players.html         // Main widget definition
└── players.js           // Widget bindings and logic
```

### Widget Registration Pattern
```javascript
// In widgets/players.js
vis.binds.players = {
    version: "0.2.0",
    showVersion: function () {
        if (vis.binds.players.version) {
            console.log('Version players: ' + vis.binds.players.version);
            vis.binds.players.version = null;
        }
    },
    
    createWidget: function (widgetID, view, data, style) {
        var $div = $('#' + widgetID);
        
        // Initialize widget based on type
        if (data.widgetType === 'winamp') {
            return vis.binds.players.createWinampWidget(widgetID, view, data, style);
        } else if (data.widgetType === 'sonos') {
            return vis.binds.players.createSonosWidget(widgetID, view, data, style);
        }
    }
};
```

### Responsive Widget Design
```css
/* Responsive design for different screen sizes */
@media (max-width: 768px) {
    .media-player-widget {
        min-height: 60px;
        font-size: 12px;
    }
    
    .player-controls button {
        font-size: 14px;
        padding: 5px;
    }
}

@media (max-width: 480px) {
    .media-player-widget {
        flex-direction: column;
    }
    
    .track-info {
        text-align: center;
        margin-bottom: 5px;
    }
}
```