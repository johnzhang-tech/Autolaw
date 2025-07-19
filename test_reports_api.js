#!/usr/bin/env node

// Test script for the new reports API endpoints

const API_KEY = "docuai_demo_key_123";
const BASE_URL = "http://localhost:5000";

async function testReportsAPI() {
  console.log("=== Testing Reports API Endpoints ===\n");

  try {
    // Test 1: Get reports for transaction 48 (should be empty initially)
    console.log("1. Testing GET /api/transactions/48/reports");
    const getReportsResponse = await fetch(`${BASE_URL}/api/transactions/48/reports`, {
      headers: {
        'X-API-Key': API_KEY,
        'Content-Type': 'application/json'
      }
    });
    
    if (getReportsResponse.ok) {
      const reports = await getReportsResponse.json();
      console.log(`✓ Successfully fetched ${reports.length} reports for transaction 48`);
      console.log("Reports:", JSON.stringify(reports, null, 2));
    } else {
      console.log(`✗ Failed to fetch reports: ${getReportsResponse.status} ${getReportsResponse.statusText}`);
      const error = await getReportsResponse.text();
      console.log("Error:", error);
    }

    // Test 2: Create a new report
    console.log("\n2. Testing POST /api/transactions/48/reports");
    const reportData = {
      reportType: "document_analysis",
      reportData: {
        summary: "Test report summary",
        findings: ["Finding 1", "Finding 2"],
        riskScore: 85,
        recommendations: ["Recommendation 1", "Recommendation 2"]
      },
      senderEmail: "demo@docuai.com",
      receiverEmail: "client@example.com"
    };

    const createReportResponse = await fetch(`${BASE_URL}/api/transactions/48/reports`, {
      method: 'POST',
      headers: {
        'X-API-Key': API_KEY,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(reportData)
    });

    let createdReportId = null;
    if (createReportResponse.ok) {
      const createdReport = await createReportResponse.json();
      createdReportId = createdReport.id;
      console.log(`✓ Successfully created report with ID: ${createdReportId}`);
      console.log("Created report:", JSON.stringify(createdReport, null, 2));
    } else {
      console.log(`✗ Failed to create report: ${createReportResponse.status} ${createReportResponse.statusText}`);
      const error = await createReportResponse.text();
      console.log("Error:", error);
    }

    // Test 3: Get the specific report we just created
    if (createdReportId) {
      console.log(`\n3. Testing GET /api/reports/${createdReportId}`);
      const getReportResponse = await fetch(`${BASE_URL}/api/reports/${createdReportId}`, {
        headers: {
          'X-API-Key': API_KEY,
          'Content-Type': 'application/json'
        }
      });

      if (getReportResponse.ok) {
        const report = await getReportResponse.json();
        console.log(`✓ Successfully fetched report ${createdReportId}`);
        console.log("Report details:", JSON.stringify(report, null, 2));
      } else {
        console.log(`✗ Failed to fetch report: ${getReportResponse.status} ${getReportResponse.statusText}`);
      }

      // Test 4: Update the report
      console.log(`\n4. Testing PUT /api/reports/${createdReportId}`);
      const updateData = {
        reportData: {
          ...reportData.reportData,
          summary: "Updated test report summary",
          riskScore: 92
        }
      };

      const updateReportResponse = await fetch(`${BASE_URL}/api/reports/${createdReportId}`, {
        method: 'PUT',
        headers: {
          'X-API-Key': API_KEY,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updateData)
      });

      if (updateReportResponse.ok) {
        const updatedReport = await updateReportResponse.json();
        console.log(`✓ Successfully updated report ${createdReportId}`);
        console.log("Updated report:", JSON.stringify(updatedReport, null, 2));
      } else {
        console.log(`✗ Failed to update report: ${updateReportResponse.status} ${updateReportResponse.statusText}`);
      }

      // Test 5: Mark report as delivered
      console.log(`\n5. Testing POST /api/reports/${createdReportId}/deliver`);
      const deliverResponse = await fetch(`${BASE_URL}/api/reports/${createdReportId}/deliver`, {
        method: 'POST',
        headers: {
          'X-API-Key': API_KEY,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ receiverEmail: "updated-client@example.com" })
      });

      if (deliverResponse.ok) {
        const result = await deliverResponse.json();
        console.log(`✓ Successfully marked report ${createdReportId} as delivered`);
        console.log("Delivery result:", JSON.stringify(result, null, 2));
      } else {
        console.log(`✗ Failed to mark report as delivered: ${deliverResponse.status} ${deliverResponse.statusText}`);
      }

      // Test 6: Get all reports again to see the changes
      console.log("\n6. Testing GET /api/transactions/48/reports (after creating report)");
      const getReportsResponse2 = await fetch(`${BASE_URL}/api/transactions/48/reports`, {
        headers: {
          'X-API-Key': API_KEY,
          'Content-Type': 'application/json'
        }
      });
      
      if (getReportsResponse2.ok) {
        const reports2 = await getReportsResponse2.json();
        console.log(`✓ Successfully fetched ${reports2.length} reports for transaction 48`);
        console.log("All reports:", JSON.stringify(reports2, null, 2));
      } else {
        console.log(`✗ Failed to fetch reports: ${getReportsResponse2.status} ${getReportsResponse2.statusText}`);
      }
    }

  } catch (error) {
    console.error("Test failed with error:", error);
  }

  console.log("\n=== Reports API Testing Complete ===");
}

// Test transaction enhancement (agent names and knowledge base names)
async function testTransactionEnhancement() {
  console.log("\n=== Testing Transaction Enhancement Features ===\n");

  try {
    // Test creating a new transaction to see if agent and KB names are generated
    console.log("7. Testing transaction creation with auto-generated names");
    const transactionData = {
      name: "Test_Property_Analysis",
      transactionType: "purchase",
      propertyAddress: "123 Test St, Test City, TC 12345",
      clientEmail: "client@test.com"
    };

    const createTransactionResponse = await fetch(`${BASE_URL}/api/transactions`, {
      method: 'POST',
      headers: {
        'X-API-Key': API_KEY,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(transactionData)
    });

    if (createTransactionResponse.ok) {
      const transaction = await createTransactionResponse.json();
      console.log(`✓ Successfully created transaction with ID: ${transaction.Tranx_id}`);
      console.log("Transaction details:", JSON.stringify(transaction, null, 2));
      
      // Verify agent and knowledge base names were generated
      if (transaction.agentName && transaction.knowledgeBaseName) {
        console.log(`✓ Agent name generated: ${transaction.agentName}`);
        console.log(`✓ Knowledge base name generated: ${transaction.knowledgeBaseName}`);
      } else {
        console.log("✗ Agent or knowledge base names not generated");
      }
    } else {
      console.log(`✗ Failed to create transaction: ${createTransactionResponse.status} ${createTransactionResponse.statusText}`);
      const error = await createTransactionResponse.text();
      console.log("Error:", error);
    }

  } catch (error) {
    console.error("Transaction enhancement test failed:", error);
  }
}

// Run all tests
testReportsAPI().then(() => {
  testTransactionEnhancement();
});