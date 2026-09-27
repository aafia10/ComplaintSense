import os
import sys

# Add project root and backend to path
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, os.path.join(BASE_DIR, "backend"))

from app.nlp.classification import train_and_save_classifiers

# Realistic training corpus covering all 7 standard categories
TRAINING_DATA = [
    # Billing & Refund
    ("I was charged twice for order #ORD9941. Please refund the extra ₹2,499 deducted from my bank account.", "Billing & Refund"),
    ("My payment failed at checkout but ₹4,500 was debited from my HDFC credit card. Need immediate refund.", "Billing & Refund"),
    ("I requested a refund 10 days ago for my returned shoes, but still haven't received my money back.", "Billing & Refund"),
    ("Why was my credit card billed for an automatic annual renewal without prior notice? Cancel and refund immediately.", "Billing & Refund"),
    ("Unauthorized billing on my monthly subscription invoice. Overcharged by $50 this billing cycle.", "Billing & Refund"),
    ("Double charge on invoice INV-2024-88. Please reverse the duplicate deduction immediately.", "Billing & Refund"),
    ("I returned the defective laptop 2 weeks ago, tracking shows delivered to hub, but refund is still not credited.", "Billing & Refund"),
    ("Charged for enterprise add-on seats that were never activated. Fix this billing error and issue credit.", "Billing & Refund"),
    ("My prepaid mobile recharge of ₹799 failed on UPI but money was debited from Paytm. Refund my money.", "Billing & Refund"),
    ("Unexpected roaming charges on my monthly postpaid bill. I never activated international roaming.", "Billing & Refund"),
    ("Return pickup completed 5 days ago. Where is my refund? Please credit my bank account.", "Billing & Refund"),
    ("Payment gateway timeout occurred during Diwali sale, amount deducted twice. Initiate reversal ASAP.", "Billing & Refund"),
    ("Invoice shows tax calculation error and incorrect GST breakdown. Need revised invoice and overcharge refund.", "Billing & Refund"),
    ("I cancelled order #ORD8821 within 10 minutes of ordering, but refund has not been initiated.", "Billing & Refund"),
    ("The subscription price increased without informing me, and my card was billed higher. Refund the difference.", "Billing & Refund"),

    # Delivery & Logistics
    ("My package #ORD19281 was supposed to arrive yesterday in Mumbai. Still no delivery updates.", "Delivery & Logistics"),
    ("This is the second time my Express delivery with SpeedFast Logistics has been delayed in Mumbai.", "Delivery & Logistics"),
    ("Order #ORD28491 still hasn't arrived. Courier tracking has been stuck at Mumbai sorting facility for 4 days.", "Delivery & Logistics"),
    ("Why is Express Delivery taking five days to deliver to Mumbai? Extremely slow courier service.", "Delivery & Logistics"),
    ("My order has been stuck with the delivery partner SpeedFast since Monday. Need package today.", "Delivery & Logistics"),
    ("Consignment note #QS-98129 delayed by 5 days. Delivery agent marked customer unavailable without calling.", "Delivery & Logistics"),
    ("Package delivered to wrong address! Driver left my parcel in the lobby without taking OTP or signature.", "Delivery & Logistics"),
    ("SpeedFast Logistics delivery van never arrived. Tracking falsely says delivery attempted at 6 PM.", "Delivery & Logistics"),
    ("Tracking status shows 'Out for Delivery' for 3 days continuously in Mumbai hub. Where is my package?", "Delivery & Logistics"),
    ("Urgent medicine order delayed by delivery partner. I need this package immediately in Delhi.", "Delivery & Logistics"),
    ("Waybill #QS-44821 lost in transit. No GPS scans for past 72 hours between Pune and Mumbai distribution centers.", "Delivery & Logistics"),
    ("Courier driver was rude and refused to deliver to the 4th floor. Order marked rejected unfairly.", "Delivery & Logistics"),
    ("Package arrived 8 days late and delivery box was completely crushed. SpeedFast delivery service is terrible.", "Delivery & Logistics"),
    ("Shipment scheduled for guaranteed morning delivery hasn't shown up. Need immediate status update.", "Delivery & Logistics"),
    ("Delivery partner SpeedFast Logistics constantly delays parcels in Mumbai western suburbs.", "Delivery & Logistics"),

    # Product Defect
    ("The smartphone arrived with a completely shattered screen. Order #ORD77123 was damaged inside the box.", "Product Defect"),
    ("Brand new wireless earbuds stop working after 10 minutes. Right earbud has zero audio output.", "Product Defect"),
    ("Received the completely wrong product! Ordered a blue leather jacket size L, got a cheap nylon shirt.", "Product Defect"),
    ("Laptop keyboard keys are stuck and spacebar is unresponsive right out of the sealed box.", "Product Defect"),
    ("The mixer grinder motor sparked and started smoking on first use. Defective and dangerous hardware.", "Product Defect"),
    ("Smartwatch touch screen is unresponsive and battery drains from 100% to 0% in under two hours.", "Product Defect"),
    ("Product arrived with visible scratches and seal was already broken. Looks like a refurbished unit.", "Product Defect"),
    ("The shoes sent to me are counterfeit and poor quality. Stitching came undone within two days of wearing.", "Product Defect"),
    ("Television panel has dead pixels and vertical green lines across the display. Send a replacement unit.", "Product Defect"),
    ("Received expired health supplements. Manufacturing date is 2022. Gross safety negligence.", "Product Defect"),
    ("Air conditioner is leaking water inside the room and compressor makes unbearable rattling noises.", "Product Defect"),
    ("Mechanical keyboard LED backlights are dead on half the keys. Defective batch.", "Product Defect"),

    # Account & Login
    ("Cannot login to my account. Password reset email is never delivered to my corporate address.", "Account & Login"),
    ("Account locked after 3 attempts. I need access to my workspace urgently for client presentations.", "Account & Login"),
    ("Lost my 2FA phone authenticator device. Need backup recovery code or admin MFA reset.", "Account & Login"),
    ("SSO integration with Okta throwing error 403. Entire marketing department cannot log in.", "Account & Login"),
    ("Someone unauthorized seems to have accessed my account from an unknown IP address. Please lock and verify.", "Account & Login"),
    ("Unable to change primary email address in profile settings. Verification link is expired.", "Account & Login"),
    ("Invitation link to join team workspace is broken and says 'token invalid'. Please resend invite.", "Account & Login"),
    ("Biometric login on mobile app crashes immediately on launch. Cannot access my account.", "Account & Login"),
    ("Forgot security questions and cannot reset password. Please unlock my user profile.", "Account & Login"),
    ("Session expires every 5 minutes forcing repeated re-login. Frustrating authentication bug.", "Account & Login"),

    # Technical Support
    ("API returning 504 Gateway Timeout on endpoints /v1/reports during bulk export requests.", "Technical Support"),
    ("Dashboard shows blank white screen in Google Chrome version 124. Console displays unhandled syntax error.", "Technical Support"),
    ("Broadband fiber optic connection has been completely down for 24 hours. Red LOS light blinking on router.", "Technical Support"),
    ("Continuous call drops and zero 5G mobile signal in our office complex. Telemetry tower degraded.", "Technical Support"),
    ("Data synchronization between mobile app and web dashboard is failing. Recent changes are lost.", "Technical Support"),
    ("Database export webhook fails with socket connection timeout. Our automated pipeline is broken.", "Technical Support"),
    ("System latency has spiked to over 8 seconds per page load. Platform is barely usable for our staff.", "Technical Support"),
    ("Mobile hotspot feature disconnected every few minutes. Internet disconnects during video conferences.", "Technical Support"),
    ("Scheduled cron jobs are skipping executions without generating failure logs or alerts.", "Technical Support"),
    ("Micro-outage in cloud region us-east causing intermittent 500 internal server errors across our microservices.", "Technical Support"),

    # Legal & Compliance
    ("If my refund is not processed within 24 hours, I am filing an official complaint with the Consumer Court.", "Legal & Compliance"),
    ("I am serving a formal legal notice through my lawyer for deceptive trade practices and breach of contract.", "Legal & Compliance"),
    ("Will lodge an FIR with cyber crime police regarding unauthorized deductions and fraud.", "Legal & Compliance"),
    ("This gross negligence violates consumer protection laws. My advocate is preparing a litigation filing.", "Legal & Compliance"),
    ("I demand full arbitration under our commercial enterprise contract terms. Legal counsel is CC'd.", "Legal & Compliance"),
    ("Filing a complaint with regulatory authorities (TRAI / Consumer Disputes Redressal Forum).", "Legal & Compliance"),
    ("Selling counterfeit and expired merchandise is a criminal offense under safety compliance acts.", "Legal & Compliance"),
    ("Legal notice will be sent to your registered corporate headquarters if delivery is not fulfilled today.", "Legal & Compliance"),

    # General Inquiry
    ("Can you please explain the difference between the Starter and Professional subscription plans?", "General Inquiry"),
    ("What are the international shipping rates and estimated transit times to Singapore and Dubai?", "General Inquiry"),
    ("Do you offer student or non-profit discounts on annual billing commitments?", "General Inquiry"),
    ("How do I update my GST registration number for future invoices?", "General Inquiry"),
    ("What is your standard return and exchange window for electronics purchased during festive sales?", "General Inquiry"),
    ("Are API rate limits configurable for enterprise tier accounts?", "General Inquiry"),
    ("Where can I find the user manual and warranty card for order #ORD99182?", "General Inquiry")
]

def main():
    print(f"Training NLP classifiers on {len(TRAINING_DATA)} real complaint examples...")
    X = [t[0] for t in TRAINING_DATA]
    y = [t[1] for t in TRAINING_DATA]

    result = train_and_save_classifiers(X, y)
    print(f"Training completed successfully! Saved models to {os.path.join(BASE_DIR, 'models')}")
    print(f"Trained models: Naive Bayes, Logistic Regression, Linear SVM across {len(result['classes'])} classes.")

if __name__ == "__main__":
    main()
