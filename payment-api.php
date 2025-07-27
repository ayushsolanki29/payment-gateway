<?php
header('Content-Type: application/json');
session_start();

// Handle different API actions
$action = $_GET['action'] ?? '';
$input = json_decode(file_get_contents('php://input'), true) ?? [];
$response = ['success' => false, 'message' => 'Invalid action'];

// Merchant configuration
const MERCHANT_UPI_ID = 'merchant@upi';
const MERCHANT_NAME = 'Example Merchant';
const MIN_AMOUNT = 100; // ₹1.00 (100 paise)

try {
    switch ($action) {
        case 'init_transaction':
            $response = handleInitTransaction($input);
            break;
            
        case 'verify_contact':
            $response = handleVerifyContact($input);
            break;
            
        case 'process_payment':
            $response = handleProcessPayment($input);
            break;
            
        case 'check_status':
            $response = handleCheckStatus($input);
            break;
            
        default:
            $response = ['success' => false, 'message' => 'Invalid action specified'];
    }
} catch (Exception $e) {
    $response = ['success' => false, 'message' => $e->getMessage()];
}

echo json_encode($response);
exit;

// API Handlers
function handleInitTransaction($data) {
    $amount = intval($data['amount'] ?? 0);
    
    // Validate amount (must be at least ₹1)
    if ($amount < MIN_AMOUNT) {
        return [
            'success' => false, 
            'message' => 'Amount must be at least ₹1.00 (100 paise)'
        ];
    }
    
    // Generate transaction ID
    $transactionId = 'TXN' . uniqid() . strtoupper(substr(md5(microtime()), 0, 6));
    
    // Store transaction in session (replace with database in production)
    $_SESSION['transactions'][$transactionId] = [
        'amount' => $amount,
        'status' => 'initiated',
        'created_at' => time()
    ];
    
    return ['success' => true, 'transactionId' => $transactionId];
}

function handleVerifyContact($data) {
    $upiId = trim($data['upiId'] ?? '');
    $phone = trim($data['phone'] ?? '');
    $transactionId = $data['transactionId'] ?? '';
    
    // Validate required fields
    if (empty($upiId) || empty($phone) || empty($transactionId)) {
        return ['success' => false, 'message' => 'Missing required fields'];
    }
    
    // Validate UPI ID format
    if (!preg_match('/^[\w.-]+@[\w.-]+$/', $upiId)) {
        return ['success' => false, 'message' => 'Invalid UPI ID format'];
    }
    
    // Validate phone number
    if (!preg_match('/^[0-9]{10}$/', $phone)) {
        return ['success' => false, 'message' => 'Phone number must be 10 digits'];
    }
    
    // Update transaction in session
    if (isset($_SESSION['transactions'][$transactionId])) {
        $_SESSION['transactions'][$transactionId]['upiId'] = $upiId;
        $_SESSION['transactions'][$transactionId]['phone'] = $phone;
        $_SESSION['transactions'][$transactionId]['status'] = 'verified';
    }
    
    // Set cookies for future use
    setcookie('upi_id', $upiId, time() + (86400 * 30), "/");
    setcookie('phone_number', $phone, time() + (86400 * 30), "/");
    
    return ['success' => true, 'upiId' => $upiId, 'phone' => $phone];
}

function handleProcessPayment($data) {
    $transactionId = $data['transactionId'] ?? '';
    $amount = intval($data['amount'] ?? 0);
    $upiId = $data['upiId'] ?? '';
    $phone = $data['phone'] ?? '';
    
    if (empty($transactionId) || !isset($_SESSION['transactions'][$transactionId])) {
        return ['success' => false, 'message' => 'Invalid transaction'];
    }
    
    // Generate UPI payment URL
    $paymentUrl = "upi://pay?pa=" . urlencode(MERCHANT_UPI_ID) . 
                 "&pn=" . urlencode(MERCHANT_NAME) . 
                 "&am=" . $amount . 
                 "&tn=" . $transactionId . 
                 "&cu=INR";
    
    // Update transaction status
    $_SESSION['transactions'][$transactionId]['status'] = 'processing';
    $_SESSION['transactions'][$transactionId]['payment_url'] = $paymentUrl;
    
    return [
        'success' => true,
        'upiUrl' => $paymentUrl,
        'merchantUpiId' => MERCHANT_UPI_ID,
        'redirectUrl' => 'thank-you.html'
    ];
}

function handleCheckStatus($data) {
    $transactionId = $data['transactionId'] ?? '';
    
    if (empty($transactionId) || !isset($_SESSION['transactions'][$transactionId])) {
        return ['success' => false, 'message' => 'Invalid transaction'];
    }
    
    // Simulate payment processing (2-5 seconds)
    $txn = $_SESSION['transactions'][$transactionId];
    $elapsed = time() - $txn['created_at'];
    
    if ($elapsed < 2) {
        return ['success' => true, 'paymentSuccess' => false];
    }
    
    // Simulate 70% success rate
    $paymentSuccess = (rand(1, 10) <= 7);
    
    if ($paymentSuccess) {
        $_SESSION['transactions'][$transactionId]['status'] = 'completed';
        return [
            'success' => true, 
            'paymentSuccess' => true, 
            'redirectUrl' => 'thank-you.html'
        ];
    } else {
        $_SESSION['transactions'][$transactionId]['status'] = 'failed';
        return ['success' => true, 'paymentSuccess' => false];
    }
}