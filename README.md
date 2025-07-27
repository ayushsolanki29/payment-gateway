# UPI Payment Gateway Simulator

![UPI Payment Gateway Demo](demo.gif) *Example of the payment flow*

A complete UPI payment gateway simulation built with:
- Frontend: HTML5, CSS3, JavaScript (jQuery)
- Backend: PHP
- Payment Flow: Simulates NPCI UPI specifications

## ✨ Features

| Feature | Description |
|---------|-------------|
| **Realistic Payment Flow** | Complete UPI payment journey from initiation to completion |
| **Dual Payment Options** | QR code scanning + UPI app deep linking |
| **Input Validation** | Real-time UPI ID and mobile number validation |
| **Transaction Simulation** | Configurable success rate (70% default) |
| **Responsive UI** | Works on mobile and desktop devices |

## Payment Flow
graph TD
  A[Validate UPI Format] --> B
  B[Validate Phone Number] --> C
  C[Generate Transaction ID] --> D
  D[Store Transaction]
  
## 🚀 Quick Start

### Prerequisites
- PHP 7.0+
- Web server (Apache/Nginx) or PHP built-in server

### Installation
