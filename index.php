<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>UPI Payment Gateway</title>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    <style>
        /* Base Styles */
        :root {
            --primary-blue: #005bf2;
            --success-green: #0da800;
            --error-red: #ff3333;
            --white: #ffffff;
            --light-gray: #ebebeb;
            --medium-gray: #6d6d6d;
            --dark-gray: #333333;
            --border-gray: #f5f5f5;
            --text-dark: #000000;
            --text-light: #777777;
            --shadow: 0 4px 12px rgba(0, 0, 0, 0.1);

            /* Spacing */
            --space-xs: 0.25rem;
            --space-sm: 0.5rem;
            --space-md: 1rem;
            --space-lg: 1.5rem;
            --space-xl: 2rem;

            /* Border Radius */
            --radius-sm: 5px;
            --radius-md: 10px;
            --radius-lg: 15px;
            --radius-xl: 20px;
        }

        * {
            font-family: "Montserrat", sans-serif;
            box-sizing: border-box;
            margin: 0;
            padding: 0;
        }

        body {
            background-color: #f5f5f5;
            padding: var(--space-lg);
        }

        /* Payment Trigger Button */
        .payment-trigger-btn {
            background-color: var(--primary-blue);
            color: var(--white);
            border: none;
            padding: var(--space-md) var(--space-lg);
            border-radius: var(--radius-md);
            font-size: 1rem;
            cursor: pointer;
            display: inline-flex;
            align-items: center;
            gap: var(--space-sm);
            box-shadow: var(--shadow);
            transition: all 0.2s ease;
        }

        .payment-trigger-btn:hover {
            background-color: #0048c4;
            transform: translateY(-2px);
        }

        /* Modal Overlay */
        .payment-modal {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background-color: rgba(0, 0, 0, 0.4);
            z-index: 1000;
            display: none;
            justify-content: center;
            align-items: center;
        }

        /* Modal Content */
        .modal-content {
            background-color: var(--primary-blue);
            border-radius: var(--radius-md);
            width: 90%;
            max-width: 400px;
            color: var(--white);
            position: relative;
            padding: var(--space-lg);
            box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
        }

        .modal-header {
            text-align: center;
            margin-bottom: var(--space-lg);
            position: relative;
        }

        .close-modal {
            position: absolute;
            top: 0;
            right: 0;
            font-size: 1.5rem;
            cursor: pointer;
            color: var(--white);
        }

        /* Payment Steps */
        .payment-step {
            display: none;
        }

        .payment-step.active {
            display: block;
        }

        /* Amount Display */
        .amount-display {
            text-align: center;
            margin: var(--space-xl) 0;
        }

        .amount-display span {
            display: block;
            font-size: 0.9rem;
            margin-bottom: var(--space-xs);
        }

        .amount-display h2 {
            font-size: 2rem;
            font-weight: 700;
        }

        /* Message Box */
        .message-box {
            padding: var(--space-md);
            border-radius: var(--radius-sm);
            margin-bottom: var(--space-md);
            display: none;
        }

        .message-box.error {
            background-color: var(--error-red);
        }

        .message-box.success {
            background-color: var(--success-green);
        }

        .message-box.show {
            display: block;
        }

        /* Form Elements */
        .form-group {
            margin-bottom: var(--space-md);
        }

        .form-group label {
            display: block;
            margin-bottom: var(--space-xs);
            font-size: 0.9rem;
        }

        .input-with-icon {
            position: relative;
        }

        .input-with-icon i {
            position: absolute;
            left: var(--space-md);
            top: 50%;
            transform: translateY(-50%);
            color: var(--medium-gray);
        }

        .input-with-icon input {
            width: 100%;
            padding: var(--space-md) var(--space-md) var(--space-md) 2.5rem;
            border: 1px solid var(--border-gray);
            border-radius: var(--radius-lg);
            background: var(--white);
            font-size: 1rem;
            color: var(--text-dark);
        }

        /* Buttons */
        .primary-btn {
            background-color: var(--success-green);
            color: var(--white);
            border: none;
            width: 100%;
            padding: var(--space-md);
            border-radius: var(--radius-sm);
            font-size: 1rem;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: var(--space-sm);
            margin-top: var(--space-md);
            transition: all 0.2s ease;
        }

        .primary-btn:hover {
            background-color: #0b9200;
        }

        .primary-btn:disabled {
            background-color: var(--medium-gray);
            cursor: not-allowed;
        }

        /* Payment Options */
        .payment-header {
            text-align: center;
            margin-bottom: var(--space-lg);
        }

        .payment-header h3 {
            margin-bottom: var(--space-sm);
        }

        .timer {
            font-size: 0.9rem;
        }

        .option-tabs {
            display: flex;
            border-bottom: 1px solid rgba(255, 255, 255, 0.2);
            margin-bottom: var(--space-md);
        }

        .option-tab {
            background: none;
            border: none;
            color: var(--white);
            padding: var(--space-sm) var(--space-md);
            cursor: pointer;
            opacity: 0.7;
            transition: all 0.2s ease;
            border-bottom: 2px solid transparent;
        }

        .option-tab.active {
            opacity: 1;
            border-bottom-color: var(--white);
        }

        .option-content {
            display: none;
        }

        .option-content.active {
            display: block;
        }

        /* QR Code Section */
        .qr-container {
            text-align: center;
            margin-bottom: var(--space-lg);
        }

        .qr-container img {
            width: 150px;
            height: 150px;
            background: var(--white);
            padding: var(--space-sm);
            margin-bottom: var(--space-sm);
        }

        .qr-container p {
            font-size: 0.9rem;
        }

        /* UPI App Section */
        .upi-app-info {
            background: rgba(255, 255, 255, 0.1);
            padding: var(--space-md);
            border-radius: var(--radius-sm);
            margin-bottom: var(--space-md);
        }

        .merchant-upi,
        .payment-amount {
            display: flex;
            align-items: center;
            margin-bottom: var(--space-sm);
            gap: var(--space-sm);
        }

        .copy-btn {
            background: none;
            border: none;
            color: var(--white);
            cursor: pointer;
            margin-left: auto;
        }

        .upi-app-btn {
            margin-top: var(--space-md);
        }

        /* Payment Note */
        .payment-note {
            display: flex;
            align-items: center;
            gap: var(--space-sm);
            margin-top: var(--space-md);
            font-size: 0.9rem;
            opacity: 0.8;
        }

        /* Security Badge */
        .security-badge {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: var(--space-sm);
            margin-top: var(--space-xl);
            font-size: 0.8rem;
            opacity: 0.8;
        }

        .security-badge img {
            width: 20px;
        }
    </style>
</head>

<body>
    <!-- Payment Trigger Button -->
    <button class="payment-trigger-btn" id="paymentTrigger">
        <i class="fas fa-lock"></i> Pay Now
    </button>

    <!-- Payment Modal -->
    <div id="paymentModal" class="payment-modal">
        <div class="modal-content">
            <div class="modal-header">
                <h3 class="merchant-name">Merchant Name</h3>
                <span class="close-modal">&times;</span>
            </div>

            <div class="payment-flow">
                <!-- Step 1: Contact Details -->
                <div id="contactStep" class="payment-step active">
                    <div class="amount-display">
                        <span>Total Amount</span>
                        <h2 id="paymentAmount">₹0</h2>
                    </div>

                    <div id="messageBox" class="message-box">
                        <p id="messageText"></p>
                    </div>

                    <div class="form-group">
                        <label for="upiId">UPI ID</label>
                        <div class="input-with-icon">
                            <i class="fas fa-at"></i>
                            <input type="text" id="upiId" placeholder="yourname@upi"
                                value="<?= isset($_COOKIE['upi_id']) ? htmlspecialchars($_COOKIE['upi_id']) : '' ?>">
                        </div>
                    </div>

                    <div class="form-group">
                        <label for="phoneNumber">Mobile Number</label>
                        <div class="input-with-icon">
                            <i class="fas fa-mobile-alt"></i>
                            <input type="tel" id="phoneNumber" placeholder="9876543210"
                                value="<?= isset($_COOKIE['phone_number']) ? htmlspecialchars($_COOKIE['phone_number']) : '' ?>">
                        </div>
                    </div>

                    <button id="proceedToPay" class="primary-btn">
                        <span>Proceed to Payment</span>
                        <i class="fas fa-arrow-right"></i>
                    </button>

                    <div class="security-badge">
                        <img src="images/secured.png" alt="Secured Payment">
                        <span>100% Secure Payments</span>
                    </div>
                </div>

                <!-- Step 2: Payment Options -->
                <div id="paymentStep" class="payment-step">
                    <div class="payment-header">
                        <h3>Complete Your Payment</h3>
                        <p class="timer">Time remaining: <span id="paymentTimer">180</span>s</p>
                    </div>

                    <div class="payment-options">
                        <div class="option-tabs">
                            <button class="option-tab active" data-tab="upi-qr">UPI QR</button>
                            <button class="option-tab" data-tab="upi-app">UPI App</button>
                        </div>

                        <div class="option-content active" id="upi-qr">
                            <div class="qr-container">
                                <img id="upiQrCode" src="images/qr.gif" alt="UPI QR Code">
                                <p>Scan this QR code with any UPI app</p>
                            </div>
                        </div>

                        <div class="option-content" id="upi-app">
                            <div class="upi-app-info">
                                <p>Pay directly via your UPI app</p>
                                <div class="merchant-upi">
                                    <span>UPI ID:</span>
                                    <strong id="merchantUpiId">loading...</strong>
                                    <button class="copy-btn" data-target="merchantUpiId">
                                        <i class="far fa-copy"></i>
                                    </button>
                                </div>
                                <div class="payment-amount">
                                    <span>Amount:</span>
                                    <strong id="displayAmount">₹0</strong>
                                </div>
                            </div>
                            <button id="openUpiApp" class="primary-btn upi-app-btn">
                                <i class="fas fa-external-link-alt"></i> Open UPI App
                            </button>
                        </div>
                    </div>

                    <div class="payment-note">
                        <i class="fas fa-info-circle"></i>
                        <p>Do not close this window until payment is complete</p>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <script src="https://code.jquery.com/jquery-3.7.1.min.js"></script>
        <script src="payment-gateway.js"></script>
</body>

</html>