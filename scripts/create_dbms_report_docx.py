import docx
from docx.shared import Inches, Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT, WD_ALIGN_VERTICAL
from docx.oxml import parse_xml, OxmlElement
from docx.oxml.ns import nsdecls, qn
import os

def create_report():
    doc = docx.Document()

    # Page Margins
    for section in doc.sections:
        section.top_margin = Inches(0.8)
        section.bottom_margin = Inches(0.8)
        section.left_margin = Inches(0.8)
        section.right_margin = Inches(0.8)

    # Color Palette
    COLOR_PRIMARY = RGBColor(11, 9, 8)       # Deep Obsidian
    COLOR_AMBER = RGBColor(220, 120, 10)     # Molten Gold / Saffron
    COLOR_CRIMSON = RGBColor(210, 30, 50)    # Tandoori Crimson
    COLOR_TEAL = RGBColor(20, 140, 130)      # Mint Chutney Emerald
    COLOR_GRAY = RGBColor(90, 90, 90)        # Muted Gray

    # Helper: Set Cell Shading
    def set_cell_shading(cell, color_hex):
        shading_xml = f'<w:shd {nsdecls("w")} w:fill="{color_hex}"/>'
        cell._tc.get_or_add_tcPr().append(parse_xml(shading_xml))

    # Helper: Set Cell Margins (padding)
    def set_cell_margins(cell, top=100, bottom=100, left=150, right=150):
        tcPr = cell._tc.get_or_add_tcPr()
        tcMar = OxmlElement('w:tcMar')
        for m, val in [('top', top), ('bottom', bottom), ('left', left), ('right', right)]:
            node = OxmlElement(f'w:{m}')
            node.set(qn('w:w'), str(val))
            node.set(qn('w:type'), 'dxa')
            tcMar.append(node)
        tcPr.append(tcMar)

    # Helper: Add Heading 1 with accent
    def add_h1(text):
        p = doc.add_paragraph()
        p.paragraph_format.space_before = Pt(16)
        p.paragraph_format.space_after = Pt(4)
        run = p.add_run(text)
        run.font.name = 'Arial'
        run.font.size = Pt(15)
        run.font.bold = True
        run.font.color.rgb = COLOR_AMBER
        return p

    def add_h2(text):
        p = doc.add_paragraph()
        p.paragraph_format.space_before = Pt(12)
        p.paragraph_format.space_after = Pt(3)
        run = p.add_run(text)
        run.font.name = 'Arial'
        run.font.size = Pt(12)
        run.font.bold = True
        run.font.color.rgb = COLOR_TEAL
        return p

    def add_body(text, bold_prefix="", italic=False):
        p = doc.add_paragraph()
        p.paragraph_format.space_after = Pt(4)
        p.paragraph_format.line_spacing = 1.15
        if bold_prefix:
            b_run = p.add_run(bold_prefix)
            b_run.font.name = 'Calibri'
            b_run.font.size = Pt(10.5)
            b_run.font.bold = True
        run = p.add_run(text)
        run.font.name = 'Calibri'
        run.font.size = Pt(10.5)
        run.font.italic = italic
        return p

    def add_callout(title, body):
        table = doc.add_table(rows=1, cols=1)
        table.alignment = WD_TABLE_ALIGNMENT.CENTER
        cell = table.cell(0, 0)
        set_cell_shading(cell, "F9F8F6")
        set_cell_margins(cell, top=140, bottom=140, left=180, right=180)

        # Left border orange
        tcPr = cell._tc.get_or_add_tcPr()
        tcBorders = parse_xml(f'<w:tcBorders {nsdecls("w")}><w:left w:val="single" w:sz="24" w:space="0" w:color="FF9F1C"/><w:top w:val="none"/><w:right w:val="none"/><w:bottom w:val="none"/></w:tcBorders>')
        tcPr.append(tcBorders)

        p = cell.paragraphs[0]
        p.paragraph_format.space_after = Pt(2)
        r_title = p.add_run(f"📌 {title}\n")
        r_title.font.name = 'Arial'
        r_title.font.size = Pt(10.5)
        r_title.font.bold = True
        r_title.font.color.rgb = COLOR_AMBER

        r_body = p.add_run(body)
        r_body.font.name = 'Calibri'
        r_body.font.size = Pt(10)
        doc.add_paragraph().paragraph_format.space_after = Pt(4)

    # -------------------------------------------------------------
    # TITLE & HEADER
    # -------------------------------------------------------------
    title_p = doc.add_paragraph()
    title_p.paragraph_format.space_before = Pt(10)
    title_p.paragraph_format.space_after = Pt(2)
    run_title = title_p.add_run("CRAVING CLOCK: CAMPUS MESS DBMS ARCHITECTURE")
    run_title.font.name = 'Arial Black'
    run_title.font.size = Pt(20)
    run_title.font.color.rgb = COLOR_AMBER

    sub_p = doc.add_paragraph()
    sub_p.paragraph_format.space_after = Pt(12)
    run_sub = sub_p.add_run("Comprehensive Mapping of Database Management System (DBMS) Concepts Across Application Modules\nVishwakarma Institute of Technology (VIT Pune) Academic Ecosystem")
    run_sub.font.name = 'Arial'
    run_sub.font.size = Pt(11)
    run_sub.font.color.rgb = COLOR_GRAY

    # Meta banner
    meta_table = doc.add_table(rows=1, cols=3)
    meta_table.alignment = WD_TABLE_ALIGNMENT.CENTER
    meta_cells = meta_table.rows[0].cells
    for c in meta_cells:
        set_cell_shading(c, "1E1916")
        set_cell_margins(c, 80, 80, 100, 100)
    
    meta_cells[0].paragraphs[0].add_run("SYSTEM: MySQL 8.0 / InnoDB").font.color.rgb = RGBColor(255, 159, 28)
    meta_cells[1].paragraphs[0].add_run("PROJECT: Craving Clock 2.0").font.color.rgb = RGBColor(46, 196, 182)
    meta_cells[2].paragraphs[0].add_run("TARGET: VIT Pune Campuses").font.color.rgb = RGBColor(255, 255, 255)
    for c in meta_cells:
        c.paragraphs[0].runs[0].font.name = 'Arial'
        c.paragraphs[0].runs[0].font.size = Pt(9)
        c.paragraphs[0].runs[0].font.bold = True

    doc.add_paragraph().paragraph_format.space_after = Pt(10)

    # -------------------------------------------------------------
    # SECTION 1: EXECUTIVE SUMMARY & ARCHITECTURAL MOTIVATION
    # -------------------------------------------------------------
    add_h1("1. Executive Summary & Core Architectural Separation")
    add_body(
        "University students around campus areas (specifically at Vishwakarma Institute of Technology, Pune—including Bibwewadi, Upper Indira Nagar, and Kondhwa campuses) "
        "frequently struggle with finding daily meals due to a fundamental disconnect: students do not know what daily specialty is cooking or whether plates have sold out, "
        "leading to roaming, overcrowding, and unpredictable expenses. Traditional food ordering systems treat menus as static item catalogs, which fails in the dynamic "
        "university mess environment where menus change twice daily, plate counts are constrained to kitchen handi capacity, and prices fluctuate based on peak meal windows."
    )
    add_body(
        "Craving Clock solves this via strict Relational 3NF Normalization by decomposing static dish offerings from transient daily availability:",
        "Architectural Decoupling: "
    )

    add_callout(
        "Relational Decomposition Principle",
        "• MENU_ITEMS (Permanent Catalog): Represents invariant master metadata (item_id, vendor_id, name, category, is_veg, base_price, description).\n"
        "• DAILY_AVAILABILITY (Fluctuating Daily State): Represents transient time-windowed availability (record_id, item_id, date, meal_slot, daily_price, stock_qty, special_note).\n"
        "This separation eliminates update anomalies, avoids duplicating dish catalogs daily, and enables high-speed atomic transactions and dynamic price surge adjustments without altering base records."
    )

    # -------------------------------------------------------------
    # SECTION 2: MASTER MAPPING MATRIX
    # -------------------------------------------------------------
    add_h1("2. Master Architecture Matrix: Website Modules vs. DBMS Concepts")
    add_body("The table below provides a comprehensive map correlating every major screen, button, and subsystem in the Craving Clock application with its underlying Database Management System mechanism and implementation file.")

    matrix_headers = ["Website Module / UI Component", "DBMS Concept & Mechanism", "Database Object / SQL Syntax", "Real-World System Benefit"]
    matrix_data = [
        [
            "Interactive 3D Craving Clock Platter & Meal Dial",
            "Temporal Query Scoping & Dynamic Projection",
            "SELECT ... FROM DAILY_AVAILABILITY WHERE date = CURDATE() AND meal_slot = :slot",
            "Filters thousands of records down to the exact active university meal slot without scanning historical archives."
        ],
        [
            "Campus Mess & Dish Explorer (Student View)",
            "Single-Table Structural View Abstraction",
            "CREATE VIEW Live_Menu_Customer_View (DAILY_AVAILABILITY with stock_qty > 0)",
            "Hides vendor cost margins and private notes; guarantees students never see sold-out plates (stock_qty = 0)."
        ],
        [
            "3D Perspective Cards & Slot-Machine Urgency Tickers",
            "Derived Mathematical Attributes & Bounded Urgency Tiers",
            "CASE WHEN stock_qty <= 5 THEN 'CRITICAL' ... END in Dynamic_Pricing_Audit_View",
            "Computes urgency thresholds in SQL; powers slot-machine transitions for High Stock, Filling Fast, and Last Few Plates."
        ],
        [
            "Atomic Dish Checkout Modal ('Confirm Order')",
            "ACID Transactions & Pessimistic Exclusive Row-Locks",
            "START TRANSACTION;\nSELECT ... FOR UPDATE;\nUPDATE stock_qty;\nCOMMIT;",
            "Guarantees ZERO over-ordering. Prevents race conditions when two students attempt to book the last available plate concurrently."
        ],
        [
            "Campus Promo Codes (VITIAN20, SAI30, EXAMFEAST)",
            "Referential Integrity & Conditional Business Logic",
            "FOREIGN KEY (vendor_id) REFERENCES VENDORS; CHECK (min_order <= total)",
            "Enforces mess-specific promotional validity and order thresholds at the database engine level."
        ],
        [
            "Kitchen Live Token Queue & Dispatch Stepper",
            "State Machine Transition & Cascade Triggers",
            "AFTER UPDATE ON DELIVERY_TRACKING -> UPDATE ORDERS.order_status = 'Completed'",
            "Automates kitchen logistics. Marking delivery 'Delivered' automatically marks order completed and frees the delivery partner."
        ],
        [
            "Dynamic Pricing Surge Engine (Batch Surge Modal)",
            "Stored Procedures with CURSOR & Boundary Clamping",
            "sp_VendorBatchDynamicPriceAdjust with CURSOR, LEAST(base * 2.0, GREATEST(base * 0.5, new_price))",
            "Applies peak-hour pricing math across low-stock dishes while mathematically ensuring prices never exceed 2.0x base price."
        ],
        [
            "End-of-Meal Flash Clearance Modal",
            "Bulk Inventory Liquidation Stored Procedure",
            "sp_VendorDailyEndMealFlashSale (Applies discount_percent to remaining plates)",
            "Enables mess owners to clear excess stock before kitchen closing time, eliminating campus food waste."
        ],
        [
            "Plate Stock Stepper (+ / - Stepper in Vendor Center)",
            "Integrity Constraint & Custom Signal Triggers",
            "BEFORE UPDATE ON DAILY_AVAILABILITY -> IF stock < 0 SIGNAL SQLSTATE '45000'",
            "Enforces physical plate constraints. Rejects any attempt to decrease stock below 0 with an atomic rollback."
        ],
        [
            "Mess Relocation Button ('Test Relocation')",
            "Audit Trail & Temporal Location Tracking Trigger",
            "AFTER UPDATE ON VENDORS -> IF OLD.city <> NEW.city THEN INSERT INTO vendor_city_trace",
            "Maintains full historical trace of vendor migrations across Pune municipal zones (Bibwewadi to PCMC, etc.)."
        ],
        [
            "Student Identity & Digital Smart Card Modal",
            "Aggregation Stored Procedure & Loyalty Classification",
            "sp_CalculateStudentLoyaltyAndTier (Evaluates lifetime spend and loyalty_points)",
            "Classifies students into PLATINUM, GOLD, SILVER, or BRONZE tiers and returns eligible percentage discounts."
        ],
        [
            "Mess Review & Rating Modal",
            "Incremental Aggregate Recalculation Trigger",
            "AFTER INSERT ON REVIEWS -> UPDATE VENDORS.rating = (SELECT AVG(rating))",
            "Maintains high read performance: eliminates expensive AVG() scans during student browsing by updating rating incrementally."
        ],
        [
            "Horizontal Campus Zone Shard Router",
            "Horizontal Table Partitioning & Partition Pruning",
            "PARTITION BY LIST COLUMNS(area_zone) (p_bibwewadi, p_kondhwa, p_indira, p_katraj)",
            "Routes queries directly to specific campus nodes; achieves up to 75% I/O reduction through partition pruning."
        ],
        [
            "Vertical Schema Decomposition Panel",
            "Vertical Partitioning & 3NF Schema Decomposition",
            "CUSTOMERS split into Customer_Core_Identity and Customer_Profile_Extended",
            "Optimizes RAM cache by keeping compact auth identity in memory while offloading heavy address texts to disk."
        ],
        [
            "Semijoin & Anti-Semijoin Visualizer",
            "Relational Algebra Optimizations (LooseScan/FirstMatch)",
            "SEMIJOIN (EXISTS) and ANTI-SEMIJOIN (NOT EXISTS)",
            "Eliminates duplicate rows without expensive temporary table filesorts; identifies dormant students with zero orders."
        ]
    ]

    table = doc.add_table(rows=len(matrix_data) + 1, cols=4)
    table.alignment = WD_TABLE_ALIGNMENT.CENTER
    hdr_cells = table.rows[0].cells
    for i, h in enumerate(matrix_headers):
        hdr_cells[i].text = h
        set_cell_shading(hdr_cells[i], "0B0908")
        set_cell_margins(hdr_cells[i], 100, 100, 100, 100)
        p = hdr_cells[i].paragraphs[0]
        p.runs[0].font.name = 'Arial'
        p.runs[0].font.size = Pt(9.5)
        p.runs[0].font.bold = True
        p.runs[0].font.color.rgb = RGBColor(255, 159, 28)

    for row_idx, row_values in enumerate(matrix_data):
        row_cells = table.rows[row_idx + 1].cells
        bg_color = "F9F9FB" if row_idx % 2 == 0 else "FFFFFF"
        for col_idx, val in enumerate(row_values):
            row_cells[col_idx].text = val
            set_cell_shading(row_cells[col_idx], bg_color)
            set_cell_margins(row_cells[col_idx], 80, 80, 80, 80)
            p = row_cells[col_idx].paragraphs[0]
            if len(p.runs) > 0:
                p.runs[0].font.name = 'Calibri'
                p.runs[0].font.size = Pt(9)
                if col_idx == 0:
                    p.runs[0].font.bold = True
                elif col_idx == 2:
                    p.runs[0].font.name = 'Consolas'
                    p.runs[0].font.size = Pt(8)
                    p.runs[0].font.color.rgb = RGBColor(160, 50, 20)

    doc.add_paragraph().paragraph_format.space_after = Pt(12)

    # -------------------------------------------------------------
    # SECTION 3: DEEP DIVE INTO EACH APPLICATION SUBSYSTEM
    # -------------------------------------------------------------
    add_h1("3. Detailed Exploration: How Each Application Subsystem Employs DBMS Concepts")

    # Part 1
    add_h2("3.1 Interactive 3D 'Craving Clock' Hero Platter & Active Meal Dial")
    add_body(
        "Located at the top of the Student Explorer View, the interactive 3D WebGL scene displays an orbital dial marking four meal windows: "
        "Breakfast (07:30–10:30), Lunch (12:00–15:00), Evening Snacks (16:30–18:30), and Dinner (19:30–22:30). "
        "Selecting or clicking any meal marker triggers spring physics camera interpolation and dynamically updates the relational filter."
    )
    add_callout(
        "DBMS Concepts in Action",
        "1. Temporal Composite Query Scoping: The UI maps the user's selected slot to the composite predicate: WHERE date = CURDATE() AND meal_slot = :selectedSlot. This leverages the composite B-Tree index idx_daily_slot_date (date, meal_slot), converting an O(N) full table scan into an O(log N) index range scan.\n"
        "2. Relational Projection: Only attributes required by the 3D HUD (stock count, slot pricing) are projected, keeping the WebGL frame loop operating at 60 FPS without memory bottlenecks."
    )

    # Part 2
    add_h2("3.2 Campus Mess Explorer & 3D Perspective Tilt Dish Cards")
    add_body(
        "Students explore messes partitioned by Pune campus zones (Bibwewadi, Upper Indira Nagar, Kondhwa, Katraj). "
        "Each daily dish displays a slot-machine dynamic price ticker and real-time inventory urgency badge: "
        "High Stock (>20 plates in Mint Emerald), Filling Fast (5–20 plates in Saffron Amber), and Last Few Plates (<5 plates in pulsing Crimson)."
    )
    add_callout(
        "DBMS Concepts in Action",
        "1. Live_Menu_Customer_View Abstraction: Students never query DAILY_AVAILABILITY directly. Instead, they interact with the view definition:\n"
        "   CREATE OR REPLACE VIEW Live_Menu_Customer_View AS\n"
        "   SELECT record_id, item_id, date, meal_slot, daily_price, stock_qty, special_note\n"
        "   FROM DAILY_AVAILABILITY WHERE date = CURDATE() AND stock_qty > 0;\n"
        "This encapsulates data access and guarantees that out-of-stock items (stock_qty = 0) are excluded from the result set.\n"
        "2. Dynamic_Pricing_Audit_View: Calculates real-time variance against catalog pricing:\n"
        "   price_delta = (daily_price - base_price)\n"
        "   surge_percentage = ROUND(((daily_price - base_price) / base_price) * 100, 1)\n"
        "This derived calculation informs the student whether they are paying peak surge or getting an off-peak discount."
    )

    # Part 3
    add_h2("3.3 Atomic Dish Checkout Modal (Dine-In Tokens vs. Tiffin Delivery)")
    add_body(
        "Clicking 'Book Plate / Tiffin Token' opens the ordering modal. Students select quantity, service mode (Dine-In Token vs Tiffin Delivery), "
        "apply localized promo codes (e.g. VITIAN20), select settlement methods (UPI, Campus Wallet, Cash at Mess, Card), and confirm the order."
    )
    add_callout(
        "DBMS Concepts in Action: Zero-Oversell ACID Transaction",
        "The checkout process is executed via Stored Procedure sp_PlaceAtomicOrderWithStockDeduction using InnoDB strict locking:\n"
        "1. Row-Level Exclusive Lock (SELECT ... FOR UPDATE): Locks the specific DAILY_AVAILABILITY row (record_id = :p_record_id). Any other student transaction attempting to book the same dish is forced to wait in lock queue.\n"
        "2. Concurrency Stock Validation: IF current_stock < requested_qty THEN ROLLBACK; LEAVE proc_block; END IF;\n"
        "3. Promo Code Referential Integrity: Validates PROMOTIONS table ensuring promo_code is active, belongs to vendor_id, and satisfies min_order threshold.\n"
        "4. Atomic Multi-Table Mutation: Deducts stock_qty, inserts into ORDERS, inserts detail lines in ORDER_DETAILS, logs transaction in PAYMENTS, and commits atomically.\n"
        "5. Automated Loyalty Trigger: AFTER INSERT ON ORDERS fires trg_award_student_loyalty, automatically crediting 1 loyalty point per 20 INR spent."
    )

    # Part 4
    add_h2("3.4 Real-Time Kitchen & Dynamic Pricing Command Center (Vendor View)")
    add_body(
        "Mess owners at Annapurna Mess, Sai Krupa, etc., use this operational dashboard to track daily revenue, "
        "adjust dynamic prices with increment/decrement steppers, modify live plate inventory, launch batch surges, and broadcast flash sales."
    )
    add_callout(
        "DBMS Concepts in Action: Stored Procedures & Triggers",
        "1. Dynamic Pricing Cursor (sp_VendorBatchDynamicPriceAdjust): Uses an open-fetch-close SQL CURSOR to iterate over all dishes where stock_qty <= threshold and applies a surge factor (+15%, +20%) with strict bounding clamps (0.5x <= new_price <= 2.0x base_price).\n"
        "2. Food Waste Clearance (sp_VendorDailyEndMealFlashSale): Executes batch price liquidation on remaining plates nearing kitchen closing time.\n"
        "3. Integrity Constraint Guard Trigger (trg_prevent_negative_stock):\n"
        "   BEFORE UPDATE ON DAILY_AVAILABILITY FOR EACH ROW\n"
        "   IF NEW.stock_qty < 0 THEN SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Plate stock quantity cannot be negative'; END IF;\n"
        "If a vendor clicks '-' below zero, the database engine aborts the transaction with SQLSTATE 45000.\n"
        "4. Audit & Trace Triggers:\n"
        "   • trg_vendor_after_update_city_trace: Captures mess relocations in vendor_city_trace.\n"
        "   • trg_vendor_before_delete_cold_retention: Archives mess metadata into vendor_cold_retention_log before deletion."
    )

    # Part 5
    add_h2("3.5 Live Logistics Dispatch & ETA Tracking System")
    add_body(
        "For students ordering 'Tiffin Delivery', the system generates a live tracking record with delivery partner assignment, "
        "real-time ETA countdown, and simulated status progression (Confirmed -> Preparing -> Out for Delivery -> Delivered)."
    )
    add_callout(
        "DBMS Concepts in Action",
        "1. Multi-Table Dispatch View (Tiffin_Delivery_Dispatch_View): Joins 5 tables (ORDERS, CUSTOMERS, VENDORS, DELIVERY_TRACKING, DELIVERY_AGENTS) with left-outer joins for unassigned delivery partners.\n"
        "2. Workflow State Trigger (trg_delivery_auto_assign_completion):\n"
        "   AFTER UPDATE ON DELIVERY_TRACKING FOR EACH ROW\n"
        "   IF NEW.delivery_status = 'Delivered' AND OLD.delivery_status <> 'Delivered' THEN\n"
        "       UPDATE ORDERS SET order_status = 'Completed' WHERE order_id = NEW.order_id;\n"
        "       UPDATE DELIVERY_AGENTS SET is_available = TRUE WHERE agent_id = NEW.agent_id;\n"
        "   END IF;\n"
        "This orchestrates cascading status updates without requiring manual application-layer coordination."
    )

    # Part 6
    add_h2("3.6 Student Profile, VIT Smart Card & Loyalty Club")
    add_body(
        "Students can inspect their VIT smart card identity (Aarav Deshmukh, REGD: VIT-AIML-D-13) and loyalty status. "
        "The system executes an analytical procedure calculating lifetime spend and assigning tier benefits."
    )
    add_callout(
        "DBMS Concepts in Action: sp_CalculateStudentLoyaltyAndTier",
        "This procedure aggregates customer transactions across the ORDERS table:\n"
        "   SELECT COALESCE(SUM(final_price), 0.00) INTO v_spend FROM ORDERS WHERE cust_id = :cust_id AND order_status IN ('Confirmed', 'Completed');\n"
        "   IF v_pts >= 500 OR v_spend >= 2500 THEN SET p_tier = 'PLATINUM', p_eligible_discount = 25.00;\n"
        "   ELSEIF v_pts >= 200 OR v_spend >= 1000 THEN SET p_tier = 'GOLD', p_eligible_discount = 15.00;\n"
        "   ELSEIF v_pts >= 50 OR v_spend >= 300 THEN SET p_tier = 'SILVER', p_eligible_discount = 10.00;\n"
        "   ELSE SET p_tier = 'BRONZE', p_eligible_discount = 5.00; END IF;\n"
        "Encapsulates business loyalty logic directly inside the database catalog."
    )

    # Part 7
    add_h2("3.7 Live DBMS Architecture & SQL Telemetry Inspector Drawer")
    add_body(
        "Built specifically for professors and evaluators, this drawer provides real-time observability into the relational database engine. "
        "Every user interaction logs the parameterized SQL statement, execution time (in ms), lock status, and affected rows."
    )
    add_callout(
        "DBMS Concepts in Action: Advanced Evaluator Testbenches",
        "1. Concurrency Race Simulation Lab: Runs two concurrent simulated threads racing for the last 2 plates of Kondhwa Biryani. Shows Thread 1 acquire EXCLUSIVE ROW LOCK, deduct stock, and Thread 2 get rejected with zero-oversell ROLLBACK.\n"
        "2. Horizontal Sharding Visualizer: Simulates campus zone partitioning (Shard A Bibwewadi, Shard B Indira Nagar, Shard C Kondhwa, Shard D Katraj). Demonstrates partition pruning eliminating 3 out of 4 shards, cutting query I/O by 75%.\n"
        "3. Vertical Normalization Decomposition: Shows splitting CUSTOMERS into hot in-memory identity (cust_id, regd_no, phone, state) and cold storage (course, address, loyalty history).\n"
        "4. Semijoin & Anti-Semijoin Query Optimizer: Compares SEMIJOIN (EXISTS FirstMatch strategy) to naive inner join + DISTINCT, and ANTI-SEMIJOIN (NOT EXISTS) to detect dormant student accounts without NULL-check joins.\n"
        "5. Interactive SQL Console: Direct SQL console allowing custom query execution against the relational dataset with instant tabular output."
    )

    # -------------------------------------------------------------
    # SECTION 4: COMPLETE 10-ENTITY EER RELATIONAL BLUEPRINT
    # -------------------------------------------------------------
    add_h1("4. Complete Relational Database Schema (EER Blueprint)")
    add_body("Below is the formal relational schema specifications implemented in schema.sql:")

    schema_data = [
        ["VENDORS", "vendor_id (PK), name, phone (UQ), city, area_zone, rating (CHECK 0-5), is_open, created_at", "Mess owner profile and campus zone classification"],
        ["PROMOTIONS", "promo_id (PK), vendor_id (FK->VENDORS ON DELETE CASCADE), code (UQ), discount_amount, min_order, is_active", "Localized promo discounts with min order constraint"],
        ["MENU_ITEMS", "item_id (PK), vendor_id (FK->VENDORS ON DELETE CASCADE), name, category (ENUM), is_veg, base_price, description", "Permanent dish master catalog"],
        ["DAILY_AVAILABILITY", "record_id (PK), item_id (FK->MENU_ITEMS ON DELETE CASCADE), date, meal_slot (ENUM), daily_price (CHECK >0), stock_qty (CHECK >=0), special_note", "Dynamic daily inventory, prices and plate counts (UNIQUE: item_id, date, meal_slot)"],
        ["CUSTOMERS", "cust_id (PK), regd_no (UQ), name, contact, phone (UQ), course, address, city, loyalty_points, state (ENUM)", "Student master record with university registration numbers"],
        ["REVIEWS", "review_id (PK), customer_id (FK->CUSTOMERS), vendor_id (FK->VENDORS), rating (CHECK 1-5), comment, created_at", "Customer ratings triggering automatic vendor average recalculation"],
        ["ORDERS", "order_id (PK), cust_id (FK->CUSTOMERS), vendor_id (FK->VENDORS), order_mode (ENUM), final_price, order_status (ENUM), created_at", "Student orders and state machine tokens"],
        ["ORDER_DETAILS", "detail_id (PK), order_id (FK->ORDERS ON DELETE CASCADE), record_id (FK->DAILY_AVAILABILITY), quantity (CHECK >0), unit_price", "Atomic line items linking orders to daily dishes"],
        ["PAYMENTS", "payment_id (PK), order_id (FK->ORDERS UQ), amount, payment_method (ENUM), payment_status (ENUM), paid_at", "Financial settlement records with 1:1 constraint"],
        ["DELIVERY_AGENTS", "agent_id (PK), name, phone, is_available", "Campus fleet logistics dispatch agents"],
        ["DELIVERY_TRACKING", "track_id (PK), order_id (FK->ORDERS UQ), agent_id (FK->DELIVERY_AGENTS SET NULL), payment_id (FK), delivery_status, eta_minutes", "Active delivery tracking and ETA calculation"],
        ["vendor_audit", "audit_id (PK), vendor_id, action_type, vendor_name, logged_at", "Audit table for trg_vendor_after_insert_audit"],
        ["vendor_city_trace", "trace_id (PK), vendor_id, old_city, new_city, changed_at", "Audit table for trg_vendor_after_update_city_trace"],
        ["vendor_cold_retention_log", "archive_id (PK), vendor_id, name, phone, city, deleted_at", "Archive retention table for trg_vendor_before_delete_cold_retention"]
    ]

    schema_table = doc.add_table(rows=len(schema_data) + 1, cols=3)
    schema_table.alignment = WD_TABLE_ALIGNMENT.CENTER
    s_hdr = schema_table.rows[0].cells
    s_hdr[0].text = "Table Name"
    s_hdr[1].text = "Attributes & Relational Constraints"
    s_hdr[2].text = "Functional Purpose"
    for c in s_hdr:
        set_cell_shading(c, "0B0908")
        set_cell_margins(c, 100, 100, 100, 100)
        p = c.paragraphs[0]
        p.runs[0].font.name = 'Arial'
        p.runs[0].font.size = Pt(9.5)
        p.runs[0].font.bold = True
        p.runs[0].font.color.rgb = RGBColor(255, 159, 28)

    for r_idx, r_val in enumerate(schema_data):
        row_cells = schema_table.rows[r_idx + 1].cells
        bg = "F9F9FB" if r_idx % 2 == 0 else "FFFFFF"
        for c_idx, val in enumerate(r_val):
            row_cells[c_idx].text = val
            set_cell_shading(row_cells[c_idx], bg)
            set_cell_margins(row_cells[c_idx], 80, 80, 80, 80)
            p = row_cells[c_idx].paragraphs[0]
            if len(p.runs) > 0:
                p.runs[0].font.name = 'Calibri'
                p.runs[0].font.size = Pt(9)
                if c_idx == 0:
                    p.runs[0].font.bold = True
                elif c_idx == 1:
                    p.runs[0].font.name = 'Consolas'
                    p.runs[0].font.size = Pt(8)

    doc.add_paragraph().paragraph_format.space_after = Pt(12)

    # -------------------------------------------------------------
    # SECTION 5: CONCLUSION & ACADEMIC DEFENSE NOTES
    # -------------------------------------------------------------
    add_h1("5. Academic Conclusion & Course Project Defense Notes")
    add_body(
        "The Craving Clock application proves how modern WebGL interactive 3D frontends can be rigorously coupled with relational "
        "database engine principles. Rather than relying on naive client-side calculations, all business rules—from atomic zero-oversell "
        "concurrency locks and dynamic pricing surge curves to automated audit retention triggers and campus zone partition pruning—are "
        "enforced directly within the relational database schema."
    )
    add_body(
        "For course evaluation, professors and evaluators can verify the full implementation via:\n"
        "1. The live interactive UI at http://localhost:5173/ with the built-in 'DBMS Architecture & SQL Telemetry Inspector' drawer.\n"
        "2. The SQL scripts in /database/schema.sql, /database/dbms_objects.sql, and /database/seed_data.sql ready for native MySQL 8.0 execution.\n"
        "3. The interactive concurrency race bench proving that concurrent student checkouts never result in negative plate stock."
    )

    # Save document
    output_filename = "Craving_Clock_DBMS_Architecture_Report.docx"
    doc.save(output_filename)
    print(f"Report successfully generated at: {os.path.abspath(output_filename)}")

    # Also save a copy to public/database for direct in-browser download
    public_copy = os.path.join("public", "database", output_filename)
    doc.save(public_copy)
    print(f"Public download copy generated at: {os.path.abspath(public_copy)}")

if __name__ == '__main__':
    create_report()
