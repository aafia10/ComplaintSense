import os
import sys
import random
from datetime import datetime, timedelta

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, BASE_DIR)
sys.path.insert(0, os.path.join(BASE_DIR, "backend"))

from app.database.session import SessionLocal, engine, Base
from app.models import Workspace, Ticket, KnowledgeDocument, ComplaintCluster
from app.services.ticket_service import process_ticket_nlp
from scripts.train_classifier import main as train_models
from scripts.evaluate_models import evaluate as eval_models

WORKSPACES = [
    {
        "id": "shopease",
        "name": "ShopEase",
        "industry": "E-commerce",
        "description": "Leading multi-category retail e-commerce platform offering electronics, fashion, and home goods with same-day and express delivery.",
        "categories": ["Billing & Refund", "Delivery & Logistics", "Product Defect", "Account & Login", "Legal & Compliance", "General Inquiry"],
        "departments": ["Logistics", "Finance", "Quality Assurance", "Customer Support", "Legal & Compliance"]
    },
    {
        "id": "clouddesk",
        "name": "CloudDesk",
        "industry": "SaaS",
        "description": "B2B enterprise collaboration and workspace productivity platform serving over 5,000 corporate clients globally.",
        "categories": ["Account & Login", "Billing & Refund", "Technical Support", "General Inquiry", "Legal & Compliance"],
        "departments": ["Engineering", "Account Security", "Finance", "Customer Support", "Compliance"]
    },
    {
        "id": "quickship",
        "name": "QuickShip",
        "industry": "Logistics",
        "description": "Nationwide express courier, multimodal freight distribution, and last-mile surface delivery network.",
        "categories": ["Delivery & Logistics", "Billing & Refund", "Product Defect", "Legal & Compliance", "General Inquiry"],
        "departments": ["Logistics", "Operations", "Finance", "Customer Support", "Claims"]
    },
    {
        "id": "connecttel",
        "name": "ConnectTel",
        "industry": "Telecommunications",
        "description": "National telecom carrier providing 4G/5G mobile cellular networks, high-speed fiber broadband, and enterprise enterprise connectivity.",
        "categories": ["Technical Support", "Billing & Refund", "Account & Login", "Legal & Compliance", "General Inquiry"],
        "departments": ["Network Engineering", "Billing Operations", "Technical Support", "Legal & Regulatory", "Customer Care"]
    }
]

CUSTOMERS = [
    ("Aisha Sharma", "aisha.sharma@example.com"),
    ("Rajesh Kumar", "rajesh.k@example.com"),
    ("Priya Nair", "priya.nair@example.com"),
    ("Vikram Singh", "vikram.singh@example.com"),
    ("Ananya Patel", "ananya.p@example.com"),
    ("Rohan Mehta", "rohan.mehta@example.com"),
    ("Sneha Kulkarni", "sneha.k@example.com"),
    ("Arjun Verma", "arjun.v@example.com"),
    ("Pooja Iyer", "pooja.iyer@example.com"),
    ("Aditya Roy", "aditya.roy@example.com"),
    ("Neha Deshmukh", "neha.d@example.com"),
    ("Sanjay Gupta", "sanjay.gupta@example.com"),
    ("Kavita Rao", "kavita.rao@example.com"),
    ("Manoj Joshi", "manoj.joshi@example.com"),
    ("Divya Menon", "divya.menon@example.com")
]

# ShopEase Complaints Corpus (60 items) - includes significant Mumbai / SpeedFast Logistics cluster
SHOPEASE_COMPLAINTS = [
    # Emerging Cluster: SpeedFast Logistics / Mumbai Delivery Delays (18 items, concentrated recently)
    ("Delivery delayed for order #ORD19281 in Mumbai", "My package #ORD19281 was supposed to arrive yesterday in Mumbai. The courier tracking has been stuck at the Mumbai sorting hub for 3 days with SpeedFast Logistics. Why is Express Delivery taking five days?", 2, "open"),
    ("SpeedFast delivery delay again in Mumbai", "This is the second time my Express delivery with SpeedFast Logistics has been delayed in Mumbai. I paid extra for 24-hour delivery! I need my parcel today ASAP.", 3, "open"),
    ("Consignment stuck at Mumbai sorting facility", "Order #ORD28491 still hasn't arrived. SpeedFast Logistics status shows 'In Transit - Exception' at Mumbai hub since Monday. Please escalate this immediately.", 1, "open"),
    ("Express Delivery taking a week in Mumbai", "Why is Express Delivery taking five days to deliver to Mumbai? Extremely slow courier service from SpeedFast Logistics. Order #ORD33910 needs urgent dispatch.", 4, "open"),
    ("Package stuck with delivery partner SpeedFast", "My order #ORD10294 has been stuck with the delivery partner SpeedFast Logistics since Monday. Tracking hasn't updated for 48 hours in Mumbai. Where is my package?", 2, "open"),
    ("Delivery van never arrived in Mumbai", "SpeedFast Logistics delivery driver marked customer unavailable without calling! I was home all day in Mumbai waiting for order #ORD55192. Deliver today without delay.", 5, "open"),
    ("Urgent birthday gift delayed by SpeedFast", "I ordered a gift for my daughter with order #ORD99182. Expected yesterday in Mumbai. SpeedFast Logistics customer care has no clue where the parcel is.", 3, "open"),
    ("Still waiting for order #ORD77123 in Mumbai", "SpeedFast Logistics tracking shows out for delivery in Mumbai for 3 consecutive days. Nobody has shown up. Terrible logistics coordination.", 6, "open"),
    ("Third time delivery delayed in Mumbai Western line", "Order #ORD88291 is delayed again. Every time SpeedFast Logistics handles my delivery in Mumbai, it is delayed by at least 4 to 6 days. I demand an explanation.", 2, "open"),
    ("Package not delivered before deadline", "I explicitly ordered with Express Delivery for an office event in Mumbai. Order #ORD66431 is late and SpeedFast Logistics has not delivered yet. Urgent assistance required.", 4, "escalated"),
    ("Delivery partner SpeedFast ignoring calls in Mumbai", "Driver phone number provided in SMS is switched off. Consignment #ORD44129 stuck in Mumbai sorting office since Friday. Please track order immediately.", 1, "open"),
    ("Late shipment of iPhone 15 in Mumbai", "Ordered iPhone 15 Pro order #ORD38291 worth ₹1,29,900. Delivery partner SpeedFast Logistics has delayed it by 4 days in Mumbai. I am anxious about theft or damage.", 3, "escalated"),
    ("SpeedFast delay in Andheri Mumbai", "Consignment #ORD51920 to Mumbai has been held at the local distribution depot. Status says 'Hub Congestion'. Please deliver immediately.", 5, "open"),
    ("Mumbai parcel delay - urgent medicine", "Order #ORD91823 contains critical medical supplies. SpeedFast Logistics failed to deliver in Mumbai on the promised date. Need package today.", 1, "open"),
    ("Delivery date postponed three times in Mumbai", "SpeedFast Logistics keeps rescheduling my delivery date for order #ORD74219. Was supposed to arrive on 12th in Mumbai, now says 18th.", 7, "open"),
    ("Consignment #ORD62910 not moving in Mumbai", "Tracking history has been frozen at SpeedFast Logistics Central Mumbai hub. Customer support had promised delivery by noon today.", 4, "open"),
    ("Delayed package delivery in South Mumbai", "Order #ORD83912 has not arrived. Express delivery guarantee has failed. Why partner with SpeedFast Logistics when they cannot meet deadlines?", 3, "open"),
    ("SpeedFast courier delay again", "Another shipment #ORD49182 delayed in Mumbai. Already contacted support twice with still no response. Deliver my order ASAP.", 2, "open"),

    # Billing & Refund (14 items)
    ("Charged twice for order #ORD9941", "I was charged twice for order #ORD9941. An extra ₹2,499 was deducted from my HDFC bank account via UPI. Please refund the duplicate payment immediately.", 8, "open"),
    ("Refund not credited after return pickup", "Returned the defective shoes order #ORD82910 two weeks ago. Courier picked it up on 5th, but refund of ₹3,499 is still not credited to my card.", 14, "in_progress"),
    ("Payment deducted but order failed", "Payment of ₹4,999 was deducted from my account, but website showed 'Payment Gateway Error' and no order ID was generated. Please refund or create order.", 10, "open"),
    ("Partial refund received instead of full amount", "Returned complete apparel set order #ORD22918, but only ₹1,200 was refunded instead of the full ₹2,400 invoice amount. Refund the remaining balance.", 18, "open"),
    ("Unauthorized double debit on credit card", "Check invoice INV-8821. My card was charged twice on checkout for ₹8,500. Need immediate refund reversal.", 12, "escalated"),
    ("Refund timeline exceeded 7 business days", "ShopEase refund policy states 5-7 days. It has been 12 business days since return #ORD44190 was approved. Where is my money?", 20, "in_progress"),
    ("Promo discount code not applied on billing", "Applied coupon SAVE500 during checkout, but full ₹3,200 was billed to my card. Please refund the ₹500 discount difference.", 25, "resolved"),
    ("Cancellation refund pending for order #ORD71928", "I cancelled order #ORD71928 within 15 minutes of placing it. The money was deducted but refund has not reached my UPI account.", 15, "resolved"),
    ("Overcharged shipping fee on invoice", "Express delivery was advertised as free for orders above ₹1,000, yet ₹250 shipping fee was billed on order #ORD31920. Refund shipping charges.", 22, "resolved"),
    ("Money deducted twice during flash sale", "Payment gateway timed out during checkout, resulting in two debits of ₹1,899 on my Axis bank card for order #ORD66291. Reverse one charge.", 11, "in_progress"),
    ("Refund credited to wallet instead of bank account", "I explicitly requested refund to my source bank account for return #ORD99218. It was credited as store credits instead. Transfer to bank.", 28, "open"),
    ("Invoice shows incorrect GST breakdown", "Need correct business tax invoice with GST registration number for order #ORD88271 for company accounting.", 30, "resolved"),
    ("Cash on Delivery refund process delay", "Courier took the return package for order #ORD11209, but direct bank transfer has not arrived after 10 days.", 16, "in_progress"),
    ("Double deduction on Google Pay checkout", "Transaction failed first time on screen, retried, and both attempts debited ₹2,100 from my bank account for order #ORD38102.", 9, "open"),

    # Product Defect (14 items)
    ("Shattered smartphone screen on delivery", "My order #ORD77123 for Samsung Galaxy arrived with a completely shattered display. Box was damaged in transit. I want an immediate replacement.", 6, "open"),
    ("Right earbud not working out of box", "Brand new Boat Earbuds order #ORD99182 arrived today. The right earbud does not turn on or charge. Please replace with a functional unit.", 9, "open"),
    ("Wrong size and color received", "Ordered blue Nike Running Shoes size 9 (order #ORD55219). Received red shoes size 7! Send replacement immediately.", 15, "open"),
    ("Scratches on laptop body and broken seal", "Received MacBook Air order #ORD88319. The security seal was broken and there are visible scratches. This is not a new item. Replace immediately.", 12, "escalated"),
    ("Smartwatch battery dead within 2 hours", "Order #ORD66281 smartwatch drains battery in 2 hours and touchscreen freezes constantly. Defective unit, request replacement.", 21, "open"),
    ("Received counterfeit perfume bottle", "The fragrance received in order #ORD38192 is clearly duplicate and diluted. Packaging print is blurry. This is illegal and defective.", 17, "escalated"),
    ("Food processor motor sparked and smoked", "First time turning on mixer grinder order #ORD99102, sparks flew and smoke came out. Hazardous and defective hardware. Need replacement or refund.", 8, "escalated"),
    ("Damaged zipper on leather jacket", "Order #ORD44102 arrived with a broken zipper and loose stitching. Please schedule doorstep replacement.", 24, "resolved"),
    ("Dead pixels on 4K Smart TV", "The 55-inch Smart TV order #ORD77291 has multiple vertical green lines and dead pixels on the upper panel. Send technical technician or replace.", 13, "in_progress"),
    ("Keyboard keys stuck and missing spacebar spring", "Mechanical keyboard order #ORD19280 has non-functioning spacebar and stuck key switches. Defective batch.", 26, "resolved"),
    ("Missing charging cable and manual in sealed box", "Received wireless speaker order #ORD33819 without the USB-C charger and user manual that were supposed to be included.", 29, "resolved"),
    ("Wrong model sent for microwave oven", "Ordered 28L convection microwave, received 20L solo microwave for order #ORD90182. Rectify this shipment immediately.", 19, "open"),
    ("Cracked ceramic dinnerware set", "Three plates in the 24-piece dinner set order #ORD66192 were smashed to pieces upon opening the parcel. Replace broken items.", 11, "open"),
    ("Camera lens has internal fungus and scratch", "Professional DSLR lens order #ORD88129 arrived with scratches on front optic element. Urgent replacement required.", 7, "escalated"),

    # Account & Login (7 items)
    ("Cannot reset password for account", "Clicking 'Forgot Password' sends no reset email to my address. Cannot login to track my ongoing orders.", 18, "open"),
    ("Account locked after entering password", "My account is locked saying too many attempts. Please unlock my user profile so I can make purchases.", 25, "resolved"),
    ("Unable to update mobile number in profile", "OTP verification fails when attempting to update primary phone number for delivery SMS notifications.", 32, "resolved"),
    ("Suspicious login attempt notification", "Received an email saying login from unauthorized location. Please lock my account and verify active orders.", 14, "open"),
    ("2FA verification code never arrives", "SMS OTP for two-factor authentication is not received on my phone. Cannot access my order history.", 22, "resolved"),
    ("Duplicate account created with same email", "Accidentally created second profile, now my reward points and active orders are split. Please merge accounts.", 35, "resolved"),
    ("App crashes every time I open cart", "ShopEase mobile app crashes immediately when navigating to checkout cart. Cannot place order.", 20, "resolved"),

    # Legal & Compliance (7 items)
    ("Filing consumer court complaint for missing refund", "If my refund of ₹14,500 for order #ORD99182 is not processed within 24 hours, I am filing a petition with the National Consumer Disputes Redressal Commission.", 5, "escalated"),
    ("Legal notice for deceptive trade practice", "My lawyer is drafting a formal legal notice regarding undelivered high-value electronics order #ORD77291. SpeedFast Logistics and ShopEase are both liable.", 3, "escalated"),
    ("FIR will be lodged for transit theft", "Order #ORD88192 was marked delivered but empty envelope was dropped. Courier driver stole the phone. Lodging police complaint today.", 4, "escalated"),
    ("Notice from advocate regarding consumer protection act", "Advocate has issued legal notice for non-fulfillment of warranty service on defective appliance order #ORD55192.", 16, "escalated"),
    ("Regulatory grievance filed with National Consumer Helpline", "Registered complaint #NCH-88291 against ShopEase for ignoring repeated refund requests.", 10, "escalated"),
    ("Violation of legal tender and payment rules", "Filing formal complaint with Reserve Bank of India ombudsman regarding unreturned failed UPI deductions.", 8, "escalated"),
    ("Fraudulent transaction dispute filed with bank", "My credit card company has initiated chargeback investigation for disputed transaction order #ORD19280.", 12, "escalated")
]

# CloudDesk Complaints Corpus (55 items)
CLOUDDESK_COMPLAINTS = [
    # Technical & Outage
    ("API returning 504 Gateway Timeout during export", "Our automated reporting cron jobs are failing with 504 Gateway Timeout on /v1/analytics/export. Production pipeline blocked.", 3, "open"),
    ("Dashboard blank white screen in Chrome v124", "Since the update yesterday, all users in our organization see a blank screen on the main dashboard. Console log shows unhandled TypeError.", 2, "open"),
    ("Webhook delivery failing silently", "Webhooks configured for customer ticket updates have stopped firing. No retry logs or error notifications generated in developer settings.", 4, "open"),
    ("Database sync timeout on enterprise workspace", "Data synchronization between workspace members is delayed by up to 2 hours. Edits are overwriting each other.", 6, "open"),
    ("SSO login failure with Okta SAML", "Entire engineering team cannot log into CloudDesk via Okta SSO. Error 403: 'Invalid SAML assertion audience'.", 1, "escalated"),
    ("System latency severe in Europe region", "Page load times have degraded to 12 seconds per click for our London office. Platform is nearly unusable.", 5, "open"),
    ("File upload size restriction bug", "Enterprise plan advertises 500MB attachment limits, but uploads over 50MB fail with 'Payload Too Large'.", 8, "resolved"),
    ("Scheduled automations skipping trigger events", "Our workflow automations did not execute at 09:00 UTC today. Missed 40 client SLAs.", 7, "open"),
    ("Export to CSV contains corrupted character encoding", "Exporting reports with non-ASCII text produces broken Unicode glyphs. Fix UTF-8 encoding in export module.", 15, "resolved"),
    ("Audit log search times out after 60 seconds", "Compliance audit requires downloading activity logs, but querying 90 days of history causes server timeout.", 11, "in_progress"),
    ("Role-based permissions not enforcing read-only", "Users assigned 'Viewer' role are able to edit project settings. Major security vulnerability.", 4, "escalated"),
    ("Mobile responsive layout broken on iPad Safari", "Sidebar navigation overlaps editor pane on tablet screens. Unusable for field technicians.", 19, "resolved"),
    ("Redis cache connection drop during peak hours", "Our private tenant instances are experiencing intermittent cache drops. Sessions resetting without warning.", 3, "open"),
    ("GraphQL API mutation returning internal server error", "Mutation `updateTeamSettings` crashes with code 500. Cannot invite external collaborators.", 5, "open"),
    ("Data retention policy deleted active audit logs", "Retention job incorrectly wiped 30 days of required audit trail. Immediate database recovery needed.", 2, "escalated"),
    ("PDF export renders distorted tables and overlapping fonts", "Client quarterly deliverables exported from CloudDesk look unformatted and unprofessional.", 9, "in_progress"),
    ("Zapier integration disconnecting every 24 hours", "The Zapier authentication token is invalidated daily, halting our CRM lead ingestion.", 12, "open"),
    ("Elasticsearch indexing delay of over 4 hours", "Newly created documents and comments do not appear in global workspace search.", 7, "open"),

    # Billing & Subscription
    ("Charged for cancelled subscription renewal", "We cancelled our Enterprise Workspace subscription on August 10th. Our corporate Amex was still billed $1,200 on September 1st.", 5, "escalated"),
    ("Double charge on invoice #INV-2024-991", "Our credit card was charged twice on September 15th for monthly seat additions. Please reverse duplicate $450 charge.", 8, "open"),
    ("Need updated VAT invoice with company tax ID", "Invoice #INV-2024-884 does not display our EU VAT number. Need corrected reverse-charge invoice for tax filing.", 14, "resolved"),
    ("Prorated refund not credited after user seat reduction", "We removed 15 inactive seats midway through billing period. Prorated balance was not credited to our account.", 21, "resolved"),
    ("Automatic downgrade warning despite valid card on file", "System sent email warning of account suspension although our corporate Visa card has sufficient funds and no decline.", 6, "open"),
    ("Inability to update billing address in portal", "Billing address form resets upon submitting. Cannot update registered company address for annual invoice.", 24, "resolved"),
    ("Overcharged for API overage calls", "Our tier includes 100,000 monthly API calls. Usage metrics show 78,000, but invoice includes $200 overage fee.", 13, "in_progress"),
    ("Requesting annual invoice for prepayment", "Please generate official PO invoice for 50 Enterprise seats for annual wire transfer.", 28, "resolved"),
    ("Disputed charge for discontinued add-on module", "We decommissioned the advanced analytics module 2 months ago, yet $350 recurring charge is still billed.", 10, "open"),
    ("Stripe payment processing failure on renewal", "Card was charged but CloudDesk status still shows payment overdue. Reconcile transaction.", 4, "open"),
    ("Currency conversion discrepancy on overseas billing", "Invoice billed in EUR charged at arbitrary exchange rate resulting in 15% surcharge.", 16, "resolved"),
    ("ACH payment settled but account remains restricted", "Direct debit of $4,500 cleared our bank 5 days ago. Why is our workspace still in payment grace mode?", 3, "escalated"),
    ("Unable to download consolidated annual tax receipt", "Finance team needs consolidated statement for FY2024-25 audit. Button throws error 500.", 22, "resolved"),

    # Account & Access
    ("MFA authenticator reset required for admin", "Lead IT administrator lost mobile phone with Google Authenticator. Need emergency break-glass account recovery.", 2, "escalated"),
    ("Account locked after password rotation policy", "After quarterly password change prompt, system locked my profile. Need admin unlock.", 9, "resolved"),
    ("Invitation links to new team members expire instantly", "Team members clicking join link receive 'Invitation Expired' even within 10 minutes of issuance.", 12, "open"),
    ("Unable to transfer workspace ownership", "Current workspace owner has left the company. Need ownership transferred to current department director.", 16, "in_progress"),
    ("Session termination every 10 minutes", "User sessions are forcibly logged out every 10 minutes during active typing. Major productivity disruption.", 7, "open"),
    ("SCIM user provisioning deactivating active employees", "Automated Azure AD SCIM sync accidentally deactivated 12 senior executives.", 1, "escalated"),
    ("Password reset email sent to deleted secondary email", "Account recovery sends reset tokens to old address despite primary email being updated.", 14, "in_progress"),
    ("IP whitelist blocking remote employees", "Configured IP CIDR block is rejecting valid VPN connections from our engineering branch.", 8, "open"),
    ("Two-factor backup recovery codes not generating", "When setting up security keys, the modal hangs on step 3 without generating emergency recovery codes.", 17, "resolved"),
    ("Google OAuth login looping back to signin page", "Clicking 'Sign in with Google' refreshes the login screen without completing authentication.", 6, "open"),

    # Legal & Compliance
    ("GDPR Data Deletion request not acknowledged", "Submitted formal GDPR Right to be Forgotten request 30 days ago. Personal data still appears in workspace archives.", 4, "escalated"),
    ("Legal notice regarding SLA uptime breach", "CloudDesk guaranteed 99.9% uptime. System was down for 18 hours in August. Filing claim for contract service credits.", 10, "escalated"),
    ("SOC2 compliance report download request", "Our security auditors require your current SOC 2 Type II compliance audit report under NDA.", 18, "resolved"),
    ("HIPAA Business Associate Agreement (BAA) signing", "Need countersigned BAA from CloudDesk legal team before storing healthcare patient records.", 25, "in_progress"),
    ("Breach notification timeline clarification", "Our legal counsel demands formal incident postmortem for the unannounced 4-hour database outage on September 12.", 8, "escalated"),
    ("Notice of dispute under Master Services Agreement", "Filing arbitration claim for recurring data corruption in document collaboration module.", 6, "escalated"),

    # General & Feature Requests
    ("How to configure custom domain with SSL certificate", "Need documentation and DNS CNAME settings for mapping our subdomain to CloudDesk workspace.", 15, "resolved"),
    ("Requesting roadmap update for Dark Mode in mobile app", "When will dark mode be released for iOS and Android apps? High demand across our staff.", 30, "resolved"),
    ("Inquiry about enterprise volume licensing discounts", "Our company is expanding from 100 to 500 seats. What tiered discounts are available?", 20, "resolved"),
    ("Does CloudDesk support multi-region data residency?", "We need data stored exclusively within Frankfurt (EU) servers to comply with local regulations.", 12, "resolved")
]

# QuickShip Complaints Corpus (55 items)
QUICKSHIP_COMPLAINTS = [
    # Delayed Shipments
    ("Consignment #QS-99182 delayed by 6 days", "Waybill #QS-99182 was booked for Express Air Cargo from Delhi to Bangalore. Still not arrived after 6 days. Where is the cargo?", 3, "open"),
    ("Shipment stuck at regional sorting depot", "Consignment note #QS-44102 has shown no checkpoint scans for 72 hours at the Hyderabad hub. Client is demanding delivery.", 2, "open"),
    ("Delivery attempted marked falsely", "Driver marked recipient unavailable at 8 PM for waybill #QS-88219. Our warehouse has 24/7 security receiving. Driver lied.", 4, "open"),
    ("Perishable cargo spoiled due to transit delay", "Refrigerated consignment #QS-33190 was held up for 4 days due to truck breakdown. Entire stock of biological samples ruined.", 5, "escalated"),
    ("Guaranteed morning delivery failed", "Paid ₹1,800 premium for guaranteed 10:30 AM delivery for legal documents #QS-77182. Arrived at 6 PM. Refund difference.", 8, "resolved"),
    ("Waybill #QS-55120 not updated on live GPS portal", "GPS tracking link provided in consignment note shows error 404. We cannot locate our commercial freight.", 6, "open"),
    ("Driver demanded cash payment for prepaid shipment", "Prepaid parcel #QS-22819 driver refused to hand over cargo without demanding ₹300 cash handling fee. Extortion.", 1, "escalated"),
    ("Shipment held at customs without notification", "Consignment #QS-66190 held at export customs for 5 days. QuickShip failed to notify us of required documentation.", 11, "in_progress"),
    ("Heavy freight pallet stuck at Kolkata transit yard", "Consignment note #QS-10291 pallet has not departed the inter-state yard for 8 days. Client penalty invoked.", 3, "open"),
    ("Courier tracking showing opposite direction movement", "Parcel intended for Pune is now scanned in Jaipur depot according to tracking status for #QS-88319.", 4, "open"),
    ("Inter-city trailer accident delay not communicated", "Shipment #QS-44910 was delayed due to highway breakdown. No update given to consignor for 48 hours.", 7, "in_progress"),
    ("Sunday delivery promise broken for commercial event", "Special weekend delivery surcharge was paid for parcel #QS-77291. Consignment was left at destination hub.", 2, "open"),
    ("Consignment note lost by local delivery boy", "Waybill slip for #QS-38102 was lost by delivery courier, delaying handover and billing verification.", 5, "open"),
    ("Air freight cargo offloaded without notice", "Express air cargo #QS-66291 was offloaded at Delhi terminal. No revised flight manifest provided.", 6, "in_progress"),

    # Damaged Packages
    ("Outer shipping carton crushed and contents broken", "Delivered parcel #QS-88129 was completely flattened under heavy cargo. Industrial glass instruments shattered.", 4, "escalated"),
    ("Water damage on bulk textile consignment", "Pallet shipment #QS-90182 was left in open rain at depot. All fabric rolls water-logged and destroyed.", 7, "escalated"),
    ("Proof of Delivery signed by unknown person", "Waybill #QS-38192 shows delivered with forged signature. Recipient never received package.", 3, "escalated"),
    ("Torn packaging and missing inventory", "Carton #QS-77291 arrived resealed with generic brown tape. 5 units of electronic components missing from inner box.", 6, "escalated"),
    ("Fragile sticker ignored on ceramic shipment", "Consignment #QS-29182 marked 'Fragile Glassware' was thrown over the gate. Complete breakage.", 5, "escalated"),
    ("Forklift puncture through wooden crate", "Wooden crate for #QS-88219 arrived with forklift tine puncture through high-precision machine parts.", 2, "escalated"),
    ("Chemical leak from adjacent drum damaged cargo", "Corrosive solvent leaking from adjacent container in trailer ruined our paper packaging cargo #QS-55102.", 8, "escalated"),
    ("Tampered security seal on bonded cargo", "Bonded container seal on truck #QS-99102 was severed prior to warehouse delivery. Inspection required.", 1, "escalated"),

    # Address & Rerouting
    ("Requested address change ignored", "Submitted address correction for shipment #QS-19283 24 hours prior to dispatch. Driver still attempted old address.", 9, "open"),
    ("Delivered to completely wrong warehouse", "Cargo #QS-44829 delivered to Plot 12 instead of Plot 120. Receiver has rejected goods.", 5, "in_progress"),
    ("Pin code misrouting causing 400km diversion", "Package #QS-88201 with Bangalore pin code was incorrectly routed to Chennai distribution center.", 12, "open"),
    ("Driver unable to find verified address in Ahmedabad", "Delivery agent refuses to call recipient phone number and marks 'Incomplete Address' for #QS-66102.", 4, "open"),
    ("Re-delivery reschedule link broken on portal", "SMS link to reschedule delivery for parcel #QS-33910 leads to a 404 page.", 8, "resolved"),
    ("Delivery boy dropped parcel at security guard without OTP", "Valuable laptop shipment #QS-88190 left unattended at society main gate without recipient sign-off.", 3, "open"),

    # Billing & Legal
    ("Overcharged volumetric weight calculation", "QuickShip invoiced parcel #QS-38190 for 12 kg volumetric weight. Actual physical package dimensions equate to 4 kg.", 14, "resolved"),
    ("Notice for compensation claim under Carriage by Road Act", "Filing formal claim of ₹50,000 for lost insured freight #QS-77192. Tracer period exceeded 14 days.", 8, "escalated"),
    ("Demurrage fees charged despite hub delay on QuickShip end", "Charged ₹3,500 holding fees when delay was caused by QuickShip unloading cranes.", 10, "open"),
    ("Invoice billed at standard rate instead of contracted discount", "Monthly billing statement ignores 20% enterprise freight discount agreed in vendor agreement.", 16, "resolved"),
    ("Legal notice for non-settlement of transit damage claim", "Advocate notice served for refusal to honor marine transit insurance claim for damaged consignment #QS-44129.", 5, "escalated"),
    ("Unreturned Cash on Delivery remittance to merchant", "Collected ₹85,000 in COD payments from our buyers but QuickShip has not remitted to our corporate bank account.", 2, "escalated"),
    ("Duplicate fuel surcharge applied on invoice", "Invoice #QS-INV-882 contains duplicate line items for diesel price adjustment surcharge.", 18, "resolved")
]

# ConnectTel Complaints Corpus (55 items)
CONNECTTEL_COMPLAINTS = [
    # Network & Signal
    ("Zero mobile network signal in Sector 62", "For the past 48 hours, ConnectTel SIM has zero reception in Sector 62. Emergency calls only. Network tower degraded.", 2, "open"),
    ("Broadband fiber LOS red light blinking", "ConnectTel optical fiber broadband has been dead since yesterday. Red LOS light blinking on router. Need field technician.", 1, "open"),
    ("Continuous call drops on 5G network", "Every phone call drops within 45 seconds on ConnectTel 5G. VoLTE registration keeps failing on handset.", 3, "open"),
    ("Internet speed throttled to 256 Kbps on unlimited plan", "Subscribed to 100 Mbps fiber plan. Speed test shows 0.3 Mbps download speed. Blatant bandwidth throttling.", 5, "open"),
    ("Frequent disconnections during remote work hours", "Fiber connection disconnects every 20 minutes from 10 AM to 5 PM. Cannot attend Zoom meetings.", 4, "open"),
    ("Network down across entire neighborhood", "All ConnectTel subscribers in our apartment complex have lost voice and data connectivity since morning.", 1, "open"),
    ("4G data not working despite active data pack", "Signal bars show full 4G LTE, but mobile data cannot establish DNS connection. Phone number #TEL-44192.", 6, "open"),
    ("High ping and jitter making online gaming unplayable", "Broadband latency spikes from 20ms to 450ms every evening on ConnectTel fiber node.", 8, "open"),
    ("Outdoor cellular tower installation causing vibration", "Recently erected rooftop cellular antenna is causing wall cracks and noise vibrations.", 12, "in_progress"),
    ("No signal coverage inside residential basement", "Need indoor VoWiFi support or booster installation for residential complex in Pune.", 15, "resolved"),
    ("Fiber line snapped due to municipal road digging", "Underground optical fiber line severed by JCB contractor outside our building.", 2, "open"),

    # Billing & Recharge
    ("Prepaid recharge of ₹799 debited but pack not active", "Recharged phone number #TEL-98210 via UPI. ₹799 deducted from bank account, but plan status says expired.", 3, "open"),
    ("Disputed international roaming charges on postpaid bill", "Postpaid invoice #TEL-INV-992 includes ₹4,500 for data roaming. I never left domestic coverage area.", 6, "escalated"),
    ("Automatic VAS deduction of ₹99 without consent", "ConnectTel deducted ₹99 for 'Caller Tunes' service that I never subscribed to. Stop and refund.", 9, "resolved"),
    ("Postpaid bill charged twice via autopay", "Autopay deducted bill amount twice on the 15th from my HDFC account. Reverse duplicate charge of ₹1,199.", 8, "open"),
    ("Security deposit not refunded after disconnection", "Surrendered postpaid connection and fiber router 45 days ago. Refund of ₹2,000 security deposit is pending.", 16, "in_progress"),
    ("Data pack expired prematurely before 28 days", "Recharge voucher stated 28-day validity. Connection stopped working on day 18.", 11, "in_progress"),
    ("Paper bill delivery fee charged on e-bill account", "Opted for paperless email billing, yet ₹50 paper statement surcharge is added every month.", 14, "resolved"),
    ("Overbilled for additional broadband data topup", "Billed ₹500 for 50GB booster that was never credited to fiber account balance.", 7, "open"),
    ("Annual plan payment deducted but monthly plan activated", "Paid ₹2,999 for annual 365-day recharge. System only activated 30-day base plan.", 4, "escalated"),

    # Account & SIM
    ("eSIM QR code activation email not received", "Requested physical to eSIM migration. Did not receive QR activation code on registered email.", 4, "open"),
    ("SIM blocked without prior notification", "My primary business SIM was deactivated today without any warning. Cannot receive bank OTPs.", 2, "escalated"),
    ("Mobile Number Portability (MNP) UPC code delayed", "Sent PORT request to 1900 three times. ConnectTel is deliberately blocking the porting code.", 5, "open"),
    ("Biometric re-verification rejected at branch", "ConnectTel store executive refused to process KYC update saying fingerprint scanner is offline.", 10, "open"),
    ("Family add-on number not linking to primary plan", "Added secondary mobile connection to corporate postpaid family plan. Add-on line still billed standalone.", 13, "resolved"),
    ("Caller ID display showing incorrect owner name", "Outbound calls display previous subscriber's name instead of registered company name.", 18, "resolved"),

    # Legal & Regulatory
    ("Filing complaint with Telecom Regulatory Authority (TRAI)", "Lodging official grievance with TRAI regarding unapproved VAS debits and unresolved network blackout.", 4, "escalated"),
    ("Consumer court petition for loss of remote employment", "Broadband downtime of 6 consecutive days caused termination of remote consulting contract. Seeking compensation.", 7, "escalated"),
    ("Legal notice for non-refund of enterprise security deposit", "Advocate notice issued for ₹25,000 corporate PRI line deposit withheld for 6 months.", 15, "escalated"),
    ("Formal complaint with Department of Telecommunications (DoT)", "Lodging regulatory grievance regarding deceptive 5G marketing claims and persistent coverage dead-zones.", 10, "escalated")
]

def seed_database():
    print("Initializing database tables...")
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    print("\n1. Seeding Workspaces...")
    for ws_data in WORKSPACES:
        ws = db.query(Workspace).filter(Workspace.id == ws_data["id"]).first()
        if not ws:
            ws = Workspace(
                id=ws_data["id"],
                name=ws_data["name"],
                industry=ws_data["industry"],
                description=ws_data["description"],
                categories=ws_data["categories"],
                departments=ws_data["departments"]
            )
            db.add(ws)
            print(f"  + Created workspace: {ws_data['name']} ({ws_data['industry']})")
        else:
            ws.categories = ws_data["categories"]
            ws.departments = ws_data["departments"]
    db.commit()

    print("\n2. Training & Evaluating Base NLP Classifiers...")
    train_models()
    eval_models()

    print("\n3. Seeding Realistic Complaints & Running Core NLP Pipeline...")
    workspace_corpora = [
        ("shopease", SHOPEASE_COMPLAINTS),
        ("clouddesk", CLOUDDESK_COMPLAINTS),
        ("quickship", QUICKSHIP_COMPLAINTS),
        ("connecttel", CONNECTTEL_COMPLAINTS)
    ]

    total_seeded = 0
    now = datetime.utcnow()

    for ws_id, corpus in workspace_corpora:
        print(f"\nProcessing {len(corpus)} complaints for workspace [{ws_id}] through NLP pipeline...")
        # Clear existing tickets for clean demo seed
        existing_tickets = db.query(Ticket).filter(Ticket.workspace_id == ws_id).all()
        for et in existing_tickets:
            db.delete(et)
        db.commit()

        for idx, item in enumerate(corpus):
            subj, msg, days_ago, initial_status = item
            cust_name, cust_email = random.choice(CUSTOMERS)
            created_time = now - timedelta(days=days_ago, hours=random.randint(1, 12), minutes=random.randint(1, 50))
            
            t_id = f"{ws_id[:3].upper()}-{1000 + idx}"

            ticket = Ticket(
                id=t_id,
                workspace_id=ws_id,
                customer_name=cust_name,
                customer_email=cust_email,
                subject=subj,
                message=msg,
                created_at=created_time,
                status=initial_status
            )
            db.add(ticket)
            db.commit()
            db.refresh(ticket)

            # Run actual NLP pipeline!
            process_ticket_nlp(db, ticket)
            total_seeded += 1
            if (idx + 1) % 15 == 0 or (idx + 1) == len(corpus):
                print(f"  -> Seeded & analyzed {idx + 1}/{len(corpus)} complaints for {ws_id}")

    print(f"\nSuccessfully seeded and analyzed {total_seeded} total complaints across 4 companies!")
    db.close()

if __name__ == "__main__":
    seed_database()
