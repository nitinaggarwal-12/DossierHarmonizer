const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer');

// Configuration
const PORT = 3005;
const URL = `http://localhost:${PORT}`;
const ARTIFACT_DIR = '/Users/nitinagga/.gemini/jetski/brain/99f7b367-6567-434a-8bb3-a955104ebe61';
const SCREENSHOT_DIR = path.join(ARTIFACT_DIR, 'scratch', 'screenshots');

// Ensure screenshot directory exists and is empty
function setupScreenshotDirectory() {
  console.log(`Setting up screenshot directory: ${SCREENSHOT_DIR}`);
  if (!fs.existsSync(SCREENSHOT_DIR)) {
    fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
  } else {
    // Purge existing png files as per the Visual Gallery Housekeeping rule
    const files = fs.readdirSync(SCREENSHOT_DIR);
    for (const file of files) {
      if (file.endsWith('.png')) {
        fs.unlinkSync(path.join(SCREENSHOT_DIR, file));
      }
    }
    console.log('Purged existing screenshots from directory.');
  }
}

// Helper to sleep/delay
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Helper to click a button/element by text using DOM-level click
async function clickElementByText(page, text, elementType = 'button') {
  console.log(`Clicking ${elementType} with text: "${text}"`);
  const clicked = await page.evaluate((txt, type) => {
    const elements = Array.from(document.querySelectorAll(type));
    // Find element that contains the text
    const element = elements.find(el => el.textContent && el.textContent.includes(txt));
    if (element) {
      element.click();
      return true;
    }
    return false;
  }, text, elementType);

  if (!clicked) {
    throw new Error(`Could not find or click ${elementType} with text: "${text}"`);
  }
}

async function runTests() {
  setupScreenshotDirectory();

  let serverProcess;
  let browser;

  try {
    // 1. Start the Express server
    console.log('Starting the development server...');
    serverProcess = spawn('npm', ['run', 'dev'], {
      cwd: '/Users/nitinagga/Documents/DossierHarmonizer',
      env: { ...process.env, PORT: PORT.toString() },
      shell: true
    });

    // Wait for server to be ready
    await new Promise((resolve, reject) => {
      let output = '';
      
      const onData = (data) => {
        const str = data.toString();
        output += str;
        console.log(`[Server] ${str.trim()}`);
        
        if (str.includes('Server listening') || str.includes('Running in DEVELOPMENT mode') || str.includes('localhost:3000')) {
          serverProcess.stdout.off('data', onData);
          resolve();
        }
      };

      serverProcess.stdout.on('data', onData);
      serverProcess.stderr.on('data', (data) => {
        console.error(`[Server Error] ${data.toString()}`);
      });

      serverProcess.on('error', (err) => {
        reject(new Error(`Failed to start server: ${err.message}`));
      });

      // Timeout after 15 seconds
      setTimeout(() => {
        serverProcess.stdout.off('data', onData);
        reject(new Error(`Server start timeout. Output so far:\n${output}`));
      }, 15000);
    });

    console.log('Server is up and running! Launching Puppeteer...');

    // 2. Launch Puppeteer
    browser = await puppeteer.launch({
      headless: true,
      executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
      defaultViewport: { width: 1440, height: 900 }
    });

    const page = await browser.newPage();

    // Listen to console logs in the page to catch errors
    page.on('console', msg => {
      if (msg.type() === 'error') {
        console.error(`[Browser Error] ${msg.text()}`);
      } else {
        console.log(`[Browser Console] ${msg.text()}`);
      }
    });

    page.on('pageerror', err => {
      console.error(`[Browser Page Error] ${err.toString()}`);
    });

    // 3. Navigate to the App
    console.log(`Navigating to ${URL}...`);
    await page.goto(URL, { waitUntil: 'networkidle0' });
    console.log('Page loaded.');

    // Take screenshot of Landing Page
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '00_landing_page.png') });
    console.log('Captured: 00_landing_page.png');

    // 4. Click "Guided Workflows" to open the Onboarding Selector Modal
    console.log('Clicking "Guided Workflows" to trigger onboarding...');
    await clickElementByText(page, 'Guided Workflows', 'button');
    await sleep(1000);

    // Take screenshot of Onboarding Selector Modal
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '00a_onboarding_selector.png') });
    console.log('Captured: 00a_onboarding_selector.png');

    // Click Skip Onboarding to close the modal
    console.log('Dismissing onboarding selector...');
    await page.click('#skip-onboarding-btn');
    await sleep(1000);

    // 5. Enter the application (Click "Enter Regulatory Command Center")
    console.log('Entering the application...');
    await clickElementByText(page, 'Enter Regulatory Command Center', 'button');
    
    // Inject mandatory settling delay (minimum 800ms as per the rule)
    console.log('Waiting for landing page exit transition...');
    await sleep(1500);

    // Take screenshot of Executive Hub
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '01_executive_hub.png') });
    console.log('Captured: 01_executive_hub.png');

    // 5. Navigate to "Substance Registry (Tabs)"
    await clickElementByText(page, 'Substance Registry (Tabs)', 'button');
    await sleep(1200); // Settling delay
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '02_substance_registry.png') });
    console.log('Captured: 02_substance_registry.png');

    // 6. Navigate to "1. Dossier Aligner & Tree"
    await clickElementByText(page, '1. Dossier Aligner & Tree', 'button');
    await sleep(1500); // Settling delay
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '03_dossier_aligner_workspace.png') });
    console.log('Captured: 03_dossier_aligner_workspace.png');

    // 7. Trigger the AI Harmonizer
    console.log('Triggering AI Harmonization...');
    await clickElementByText(page, 'Trigger Aligner Now', 'button');
    
    // Wait for harmonization to complete (wait for the loader to disappear or the tabs to appear)
    console.log('Waiting for AI Harmonization to complete...');
    // We can wait for the "View Diff" button to be visible on the page
    await page.waitForFunction(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      return buttons.some(b => b.textContent && b.textContent.includes('View Diff'));
    }, { timeout: 15000 });
    
    await sleep(1000); // Additional settling delay
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '04_dossier_aligner_harmonized.png') });
    console.log('Captured: 04_dossier_aligner_harmonized.png');

    // Click "View Diff" tab
    await clickElementByText(page, 'View Diff', 'button');
    await sleep(1000);
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '05_dossier_aligner_diff.png') });
    console.log('Captured: 05_dossier_aligner_diff.png');

    // Click "AI Changelog" tab
    await clickElementByText(page, 'AI Changelog', 'button');
    await sleep(1000);
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '06_dossier_aligner_changelog.png') });
    console.log('Captured: 06_dossier_aligner_changelog.png');

    // Click "Citations" tab
    await clickElementByText(page, 'Citations', 'button');
    await sleep(1000);
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '07_dossier_aligner_citations.png') });
    console.log('Captured: 07_dossier_aligner_citations.png');

    // Go back to Comparative Workspace
    await clickElementByText(page, 'Comparative Workspace', 'button');
    await sleep(1000);

    // Click on Sub-tab: "2. Regulatory Pathway Map"
    await clickElementByText(page, '2. Regulatory Pathway Map', 'button');
    await sleep(1200);
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '08_dossier_aligner_pathway.png') });
    console.log('Captured: 08_dossier_aligner_pathway.png');

    // Click on Sub-tab: "3. Analytics & Risks"
    await clickElementByText(page, '3. Analytics & Risks', 'button');
    await sleep(1500);
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '09_dossier_aligner_analytics.png') });
    console.log('Captured: 09_dossier_aligner_analytics.png');

    // Click on Sub-tab: "4. Compile & Export"
    await clickElementByText(page, '4. Compile & Export', 'button');
    await sleep(1200);
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '10_dossier_aligner_compiler.png') });
    console.log('Captured: 10_dossier_aligner_compiler.png');

    // 8. Navigate through the remaining sidebar tabs
    const sidebarTabs = [
      { name: '2. Gap Matrix Hub', file: '11_gap_matrix.png' },
      { name: '3. Ingest & OCR Station', file: '12_ingest_ocr.png' },
      { name: '4. Harmonizer-AI Chat', file: '13_harmonizer_chat.png' },
      { name: '5. Nomenclature Dict', file: '14_nomenclature_dict.png' },
      { name: '6. Stability Predictor', file: '15_stability_predictor.png' },
      { name: '7. eCTD 4.0 Validator', file: '16_ectd_validator.png' },
      { name: '8. Substance Analyzer', file: '17_substance_analyzer.png' },
      { name: '9. Global Ingress Map', file: '18_global_ingress_map.png' },
      { name: '10. CFR Audit Trail', file: '19_cfr_audit_trail.png' },
      { name: '11. Agent Orchestrator & MCP', file: '20_agent_orchestrator.png' }
    ];

    for (let i = 0; i < sidebarTabs.length; i++) {
      const tab = sidebarTabs[i];
      await clickElementByText(page, tab.name, 'button');
      await sleep(1200); // Settling delay
      await page.screenshot({ path: path.join(SCREENSHOT_DIR, tab.file) });
      console.log(`Captured: ${tab.file}`);
    }

    // 9. Test the Onboarding Tour reactivation and tour card flow
    console.log('Reopening Onboarding Tour...');
    await clickElementByText(page, 'Start Guided Tour', 'button');
    await sleep(1200);
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '21_onboarding_reopened.png') });
    console.log('Captured: 21_onboarding_reopened.png');

    console.log('Selecting Dossier Audit & Gap Analysis workflow...');
    await clickElementByText(page, 'Dossier Audit & Gap Analysis', 'button');
    await sleep(1500); // Allow spotlight to calculate coords
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '22_tour_spotlight_active.png') });
    console.log('Captured: 22_tour_spotlight_active.png');

    console.log('Exiting active tour card...');
    await page.click('#exit-tour-card-btn');
    await sleep(1000);

    console.log('Closing onboarding selector...');
    await page.click('#close-onboarding-btn');
    await sleep(1000);
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '23_tour_exited.png') });
    console.log('Captured: 23_tour_exited.png');

    console.log('E2E validation test completed successfully!');

  } catch (error) {
    console.error('Error during E2E validation:', error);
    process.exitCode = 1;
  } finally {
    // 9. Clean up
    if (browser) {
      console.log('Closing browser...');
      await browser.close();
    }
    if (serverProcess) {
      console.log('Stopping server...');
      serverProcess.kill();
    }
    console.log('Cleanup finished.');
  }
}

runTests();
