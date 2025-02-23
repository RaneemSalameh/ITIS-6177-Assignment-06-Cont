const express = require('express');
const app = express();
const port = 3000;
const mariadb = require('mariadb');
const bodyParser = require('body-parser');
const { body, validationResult } = require('express-validator');
const swaggerUi = require('swagger-ui-express');
const swaggerJsdoc = require('swagger-jsdoc');
const pool = mariadb.createPool({
    host: 'localhost',
    user: 'root',
    password: 'root',
    database: 'sample',
    port: 3306,
    connectionLimit: 5
});

app.use(bodyParser.json());

const swaggerOptions = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Sample API',
            version: '1.0.0',
            description: 'A simple Express API',
        },
        servers: [
            {
                url: 'http://localhost:3000',
                description: 'Development server',
            },
        ],
    },
    apis: ['./server.js'],
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));


/**
 * @openapi
 * /agents:
 *   get:
 *     summary: Returns a list of agents
 *     responses:
 *       200:
 *         description: A JSON array of agents
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   AGENT_CODE:
 *                     type: string
 *                     description: The agent's code
 *                   AGENT_NAME:
 *                     type: string
 *                     description: The agent's name
 *                   WORKING_AREA:
 *                     type: string
 *                     description: The area where the agent works
 *                   COMMISSION:
 *                     type: number
 *                     format: float
 *                     description: Commission percentage
 *                   PHONE_NO:
 *                     type: string
 *                     description: The phone number of the agent
 *                   COUNTRY:
 *                     type: string
 *                     description: The country of the agent
 */

app.get('/agents', async (req, res) => {
    let conn;
    try {
        conn = await pool.getConnection();
        const rows = await conn.query('SELECT * FROM agents');
        res.json(rows);
    } finally {
        if (conn) conn.release();
    }
});



/**
 * @openapi
 * /company:
 *   get:
 *     summary: Returns a list of companies
 *     responses:
 *       200:
 *         description: A JSON array of companies
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   COMPANY_ID:
 *                     type: string
 *                     description: The unique identifier for the company
 *                   COMPANY_NAME:
 *                     type: string
 *                     description: The name of the company
 *                   COMPANY_CITY:
 *                     type: string
 *                     description: The city where the company is located
 */
app.get('/company', async (req, res) => {
    let conn;
    try {
        conn = await pool.getConnection();
        const rows = await conn.query('SELECT * FROM company');
        res.json(rows);
    } finally {
        if (conn) conn.release();
    }
});

/**
 * @openapi
 * /customer:
 *   get:
 *     summary: Returns a list of customers
 *     responses:
 *       200:
 *         description: A JSON array of customers
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   CUST_CODE:
 *                     type: string
 *                     description: The unique identifier for the customer
 *                   CUST_NAME:
 *                     type: string
 *                     description: The name of the customer
 *                   CUST_CITY:
 *                     type: string
 *                     description: The city of the customer
 *                   
 */
app.get('/customer', async (req, res) => {
    let conn;
    try {
        conn = await pool.getConnection();
        const rows = await conn.query('SELECT * FROM customer');
        res.json(rows);
    } finally {
        if (conn) conn.release();
    }
});

/**
 * @openapi
 * /orders:
 *   get:
 *     summary: Returns a list of orders
 *     responses:
 *       200:
 *         description: A JSON array of orders
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   ORD_NUM:
 *                     type: string
 *                     description: The order number
 *                   ORD_AMOUNT:
 *                     type: number
 *                     format: float
 *                     description: The amount of the order
 *                   ADVANCE_AMOUNT:
 *                     type: number
 *                     format: float
 *                     description: The advance amount paid for the order
 *                   
 */
app.get('/orders', async (req, res) => {
    let conn;
    try {
        conn = await pool.getConnection();
        const rows = await conn.query('SELECT * FROM orders');
        res.json(rows);
    } finally {
        if (conn) conn.release();
    }
});


/**
 * @openapi
 * /agents:
 *   post:
 *     summary: Add a new agent
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - AGENT_CODE
 *               - AGENT_NAME
 *             properties:
 *               AGENT_CODE:
 *                 type: string
 *                 description: The agent's unique code
 *               AGENT_NAME:
 *                 type: string
 *                 description: The agent's name
 *               WORKING_AREA:
 *                 type: string
 *                 description: The area where the agent works
 *               COMMISSION:
 *                 type: number
 *                 format: float
 *                 description: Commission percentage of the agent
 *               PHONE_NO:
 *                 type: string
 *                 description: The agent's phone number
 *               COUNTRY:
 *                 type: string
 *                 description: The country of the agent
 *     responses:
 *       200:
 *         description: Agent added successfully
 *       400:
 *         description: Invalid input
 */
app.post('/agents', [
    body('AGENT_CODE').trim().escape().isLength({ min: 1 }).withMessage('AGENT_CODE is required'),
    body('AGENT_NAME').trim().escape().isLength({ min: 1 }).withMessage('AGENT_NAME is required'),
    body('WORKING_AREA').trim().escape(),
    body('COMMISSION').toFloat(),
    body('PHONE_NO').trim().escape(),
    body('COUNTRY').trim().escape()
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    let conn;
    try {
        conn = await pool.getConnection();
        const { AGENT_CODE, AGENT_NAME, WORKING_AREA, COMMISSION, PHONE_NO, COUNTRY } = req.body;
        const result = await conn.query("INSERT INTO agents (AGENT_CODE, AGENT_NAME, WORKING_AREA, COMMISSION, PHONE_NO, COUNTRY) VALUES (?, ?, ?, ?, ?, ?)", [AGENT_CODE, AGENT_NAME, WORKING_AREA, COMMISSION, PHONE_NO, COUNTRY]);
        res.json({ success: true, message: 'Agent added', result: result });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    } finally {
        if (conn) conn.release();
    }
});

/**
 * @openapi
 * /company:
 *   post:
 *     summary: Add a new company
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - COMPANY_ID
 *               - COMPANY_NAME
 *             properties:
 *               COMPANY_ID:
 *                 type: string
 *                 description: The company's unique identifier
 *               COMPANY_NAME:
 *                 type: string
 *                 description: The name of the company
 *               COMPANY_CITY:
 *                 type: string
 *                 description: The city where the company is located
 *     responses:
 *       200:
 *         description: Company added successfully
 *       400:
 *         description: Invalid input
 */
app.post('/company', [
    body('COMPANY_ID').trim().escape().isLength({ min: 1 }).withMessage('COMPANY_ID is required'),
    body('COMPANY_NAME').trim().escape().isLength({ min: 1 }).withMessage('COMPANY_NAME is required'),
    body('COMPANY_CITY').trim().escape()
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    let conn;
    try {
        conn = await pool.getConnection();
        const { COMPANY_ID, COMPANY_NAME, COMPANY_CITY } = req.body;
        const result = await conn.query("INSERT INTO company (COMPANY_ID, COMPANY_NAME, COMPANY_CITY) VALUES (?, ?, ?)", [COMPANY_ID, COMPANY_NAME, COMPANY_CITY]);
        res.json({ success: true, message: 'Company added', result: result });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    } finally {
        if (conn) conn.release();
    }
});



/**
 * @openapi
 * /customer:
 *   post:
 *     summary: Add a new customer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - CUST_CODE
 *               - CUST_NAME
 *             properties:
 *               CUST_CODE:
 *                 type: string
 *                 description: The customer's unique code
 *               CUST_NAME:
 *                 type: string
 *                 description: The customer's name
 *               CUST_CITY:
 *                 type: string
 *                 description: The city of the customer
 *               WORKING_AREA:
 *                 type: string
 *                 description: Area where the customer resides
 *               CUST_COUNTRY:
 *                 type: string
 *                 description: Country of the customer
 *               GRADE:
 *                 type: integer
 *                 description: Grade of the customer
 *               OPENING_AMT:
 *                 type: number
 *                 format: float
 *                 description: Opening amount
 *               RECEIVE_AMT:
 *                 type: number
 *                 format: float
 *                 description: Amount received
 *               PAYMENT_AMT:
 *                 type: number
 *                 format: float
 *                 description: Payment amount
 *               OUTSTANDING_AMT:
 *                 type: number
 *                 format: float
 *                 description: Outstanding amount
 *               PHONE_NO:
 *                 type: string
 *                 description: Phone number of the customer
 *               AGENT_CODE:
 *                 type: string
 *                 description: Agent code associated with the customer
 *     responses:
 *       200:
 *         description: Customer added successfully
 *       400:
 *         description: Invalid input
 */
app.post('/customer', [
    body('CUST_CODE').trim().escape().isLength({ min: 1 }).withMessage('CUST_CODE is required'),
    body('CUST_NAME').trim().escape().isLength({ min: 1 }).withMessage('CUST_NAME is required'),
    body('CUST_CITY').trim().escape(),
    body('WORKING_AREA').trim().escape(),
    body('CUST_COUNTRY').trim().escape(),
    body('GRADE').isNumeric().withMessage('GRADE must be a number'),
    body('OPENING_AMT').isFloat().withMessage('OPENING_AMT must be a number'),
    body('RECEIVE_AMT').isFloat().withMessage('RECEIVE_AMT must be a number'),
    body('PAYMENT_AMT').isFloat().withMessage('PAYMENT_AMT must be a number'),
    body('OUTSTANDING_AMT').isFloat().withMessage('OUTSTANDING_AMT must be a number'),
    body('PHONE_NO').trim().escape(),
    body('AGENT_CODE').trim().escape()
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    let conn;
    try {
        conn = await pool.getConnection();
        const { CUST_CODE, CUST_NAME, CUST_CITY, WORKING_AREA, CUST_COUNTRY, GRADE, OPENING_AMT, RECEIVE_AMT, PAYMENT_AMT, OUTSTANDING_AMT, PHONE_NO, AGENT_CODE } = req.body;
        const result = await conn.query("INSERT INTO customer (CUST_CODE, CUST_NAME, CUST_CITY, WORKING_AREA, CUST_COUNTRY, GRADE, OPENING_AMT, RECEIVE_AMT, PAYMENT_AMT, OUTSTANDING_AMT, PHONE_NO, AGENT_CODE) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)", [CUST_CODE, CUST_NAME, CUST_CITY, WORKING_AREA, CUST_COUNTRY, GRADE, OPENING_AMT, RECEIVE_AMT, PAYMENT_AMT, OUTSTANDING_AMT, PHONE_NO, AGENT_CODE]);
        res.json({ success: true, message: 'Customer added', result: result });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    } finally {
        if (conn) conn.release();
    }
});



/**
 * @openapi
 * /orders:
 *   post:
 *     summary: Add a new order
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - ORD_NUM
 *             properties:
 *               ORD_NUM:
 *                 type: string
 *                 description: The order number
 *               ORD_AMOUNT:
 *                 type: number
 *                 format: float
 *                 description: Total amount of the order
 *               ADVANCE_AMOUNT:
 *                 type: number
 *                 format: float
 *                 description: Advance amount paid
 *               ORD_DATE:
 *                 type: string
 *                 format: date
 *                 description: Date of the order
 *               CUST_CODE:
 *                 type: string
 *                 description: Customer code
 *               AGENT_CODE:
 *                 type: string
 *                 description: Agent code
 *               ORD_DESCRIPTION:
 *                 type: string
 *                 description: Description of the order
 *     responses:
 *       200:
 *         description: Order added successfully
 *       400:
 *         description: Invalid input
 */
app.post('/orders', [
    body('ORD_NUM').trim().escape().isLength({ min: 1 }).withMessage('ORD_NUM is required'),
    body('ORD_AMOUNT').isFloat().withMessage('ORD_AMOUNT must be a number'),
    body('ADVANCE_AMOUNT').isFloat().withMessage('ADVANCE_AMOUNT must be a number'),
    body('ORD_DATE').isDate().withMessage('ORD_DATE must be a valid date'),
    body('CUST_CODE').trim().escape(),
    body('AGENT_CODE').trim().escape(),
    body('ORD_DESCRIPTION').trim().escape()
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    let conn;
    try {
        conn = await pool.getConnection();
        const { ORD_NUM, ORD_AMOUNT, ADVANCE_AMOUNT, ORD_DATE, CUST_CODE, AGENT_CODE, ORD_DESCRIPTION } = req.body;
        const result = await conn.query("INSERT INTO orders (ORD_NUM, ORD_AMOUNT, ADVANCE_AMOUNT, ORD_DATE, CUST_CODE, AGENT_CODE, ORD_DESCRIPTION) VALUES (?, ?, ?, ?, ?, ?, ?)", [ORD_NUM, ORD_AMOUNT, ADVANCE_AMOUNT, ORD_DATE, CUST_CODE, AGENT_CODE, ORD_DESCRIPTION]);
        res.json({ success: true, message: 'Order added', result: result });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    } finally {
        if (conn) conn.release();
    }
});




/**
 * @openapi
 * /agents/{code}:
 *   patch:
 *     summary: Updates an agent
 *     parameters:
 *       - in: path
 *         name: code
 *         required: true
 *         schema:
 *           type: string
 *         description: Agent code
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               AGENT_NAME:
 *                 type: string
 *               WORKING_AREA:
 *                 type: string
 *               COMMISSION:
 *                 type: number
 *                 format: float
 *               PHONE_NO:
 *                 type: string
 *               COUNTRY:
 *                 type: string
 *     responses:
 *       200:
 *         description: Agent updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 result:
 *                   type: object
 *       400:
 *         description: Validation error
 *       500:
 *         description: Server error
 */
app.patch('/agents/:code', [
    body('AGENT_NAME').optional().trim().escape(),
    body('WORKING_AREA').optional().trim().escape(),
    body('COMMISSION').optional().toFloat(),
    body('PHONE_NO').optional().trim().escape(),
    body('COUNTRY').optional().trim().escape()
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    let conn;
    try {
        conn = await pool.getConnection();
        const updates = req.body;
        const params = [updates, req.params.code];
        const result = await conn.query("UPDATE agents SET ? WHERE AGENT_CODE = ?", params);
        res.json({ success: true, message: 'Agent updated', result: result });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    } finally {
        if (conn) conn.release();
    }
});


/**
 * @openapi
 * /company/{id}:
 *   patch:
 *     summary: Updates a company
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Company ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               COMPANY_NAME:
 *                 type: string
 *               COMPANY_CITY:
 *                 type: string
 *     responses:
 *       200:
 *         description: Company updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 result:
 *                   type: object
 *       400:
 *         description: Validation error
 *       500:
 *         description: Server error
 */

app.patch('/company/:id', [
    body('COMPANY_NAME').optional().trim().escape(),
    body('COMPANY_CITY').optional().trim().escape()
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    let conn;
    try {
        conn = await pool.getConnection();
        const updates = req.body;
        const result = await conn.query("UPDATE company SET ? WHERE COMPANY_ID = ?", [updates, req.params.id]);
        res.json({ success: true, message: 'Company updated', result: result });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    } finally {
        if (conn) conn.release();
    }
});


/**
 * @openapi
 * /customer/{code}:
 *   patch:
 *     summary: Updates a customer
 *     parameters:
 *       - in: path
 *         name: code
 *         required: true
 *         schema:
 *           type: string
 *         description: Customer code
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               CUST_NAME:
 *                 type: string
 *               CUST_CITY:
 *                 type: string
 *               WORKING_AREA:
 *                 type: string
 *               CUST_COUNTRY:
 *                 type: string
 *               GRADE:
 *                 type: integer
 *               OPENING_AMT:
 *                 type: number
 *                 format: float
 *               RECEIVE_AMT:
 *                 type: number
 *                 format: float
 *               PAYMENT_AMT:
 *                 type: number
 *                 format: float
 *               OUTSTANDING_AMT:
 *                 type: number
 *                 format: float
 *               PHONE_NO:
 *                 type: string
 *               AGENT_CODE:
 *                 type: string
 *     responses:
 *       200:
 *         description: Customer updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 result:
 *                   type: object
 *       400:
 *         description: Validation error
 *       500:
 *         description: Server error
 */

app.patch('/customer/:code', [
    body('CUST_NAME').optional().trim().escape(),
    body('CUST_CITY').optional().trim().escape(),
    body('WORKING_AREA').optional().trim().escape(),
    body('CUST_COUNTRY').optional().trim().escape(),
    body('GRADE').optional().isNumeric(),
    body('OPENING_AMT').optional().isFloat(),
    body('RECEIVE_AMT').optional().isFloat(),
    body('PAYMENT_AMT').optional().isFloat(),
    body('OUTSTANDING_AMT').optional().isFloat(),
    body('PHONE_NO').optional().trim().escape(),
    body('AGENT_CODE').optional().trim().escape()
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    let conn;
    try {
        conn = await pool.getConnection();
        const updates = req.body;
        const result = await conn.query("UPDATE customer SET ? WHERE CUST_CODE = ?", [updates, req.params.code]);
        res.json({ success: true, message: 'Customer updated', result: result });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    } finally {
        if (conn) conn.release();
    }
});


/**
 * @openapi
 * /orders/{ordNum}:
 *   patch:
 *     summary: Updates an order
 *     parameters:
 *       - in: path
 *         name: ordNum
 *         required: true
 *         schema:
 *           type: string
 *         description: Order number
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               ORD_AMOUNT:
 *                 type: number
 *                 format: float
 *               ADVANCE_AMOUNT:
 *                 type: number
 *                 format: float
 *               ORD_DATE:
 *                 type: string
 *                 format: date
 *               CUST_CODE:
 *                 type: string
 *               AGENT_CODE:
 *                 type: string
 *               ORD_DESCRIPTION:
 *                 type: string
 *     responses:
 *       200:
 *         description: Order updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 result:
 *                   type: object
 *       400:
 *         description: Validation error
 *       500:
 *         description: Server error
 */

app.patch('/orders/:ordNum', [
    body('ORD_AMOUNT').optional().isFloat(),
    body('ADVANCE_AMOUNT').optional().isFloat(),
    body('ORD_DATE').optional().isDate(),
    body('CUST_CODE').optional().trim().escape(),
    body('AGENT_CODE').optional().trim().escape(),
    body('ORD_DESCRIPTION').optional().trim().escape()
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    let conn;
    try {
        conn = await pool.getConnection();
        const updates = req.body;
        const result = await conn.query("UPDATE orders SET ? WHERE ORD_NUM = ?", [updates, req.params.ordNum]);
        res.json({ success: true, message: 'Order updated', result: result });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    } finally {
        if (conn) conn.release();
    }
});



/**
 * @openapi
 * /agents/{code}:
 *   put:
 *     summary: Fully updates an agent's information
 *     parameters:
 *       - in: path
 *         name: code
 *         required: true
 *         schema:
 *           type: string
 *         description: Agent code
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               AGENT_NAME:
 *                 type: string
 *               WORKING_AREA:
 *                 type: string
 *               COMMISSION:
 *                 type: number
 *                 format: float
 *               PHONE_NO:
 *                 type: string
 *               COUNTRY:
 *                 type: string
 *     responses:
 *       200:
 *         description: Agent information fully updated
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 result:
 *                   type: object
 *       400:
 *         description: Input validation error
 *       500:
 *         description: Server error
 */

app.put('/agents/:code', [
    body('AGENT_NAME').trim().escape(),
    body('WORKING_AREA').trim().escape(),
    body('COMMISSION').toFloat(),
    body('PHONE_NO').trim().escape(),
    body('COUNTRY').trim().escape()
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    let conn;
    try {
        conn = await pool.getConnection();
        const { AGENT_NAME, WORKING_AREA, COMMISSION, PHONE_NO, COUNTRY } = req.body;
        const result = await conn.query("UPDATE agents SET AGENT_NAME = ?, WORKING_AREA = ?, COMMISSION = ?, PHONE_NO = ?, COUNTRY = ? WHERE AGENT_CODE = ?", [AGENT_NAME, WORKING_AREA, COMMISSION, PHONE_NO, COUNTRY, req.params.code]);
        res.json({ success: true, message: 'Agent fully updated', result: result });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    } finally {
        if (conn) conn.release();
    }
});


/**
 * @openapi
 * /company/{id}:
 *   put:
 *     summary: Fully updates a company's information
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Company ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               COMPANY_NAME:
 *                 type: string
 *               COMPANY_CITY:
 *                 type: string
 *     responses:
 *       200:
 *         description: Company information fully updated
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 result:
 *                   type: object
 *       400:
 *         description: Input validation error
 *       500:
 *         description: Server error
 */

app.put('/company/:id', [
    body('COMPANY_NAME').trim().escape(),
    body('COMPANY_CITY').trim().escape()
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    let conn;
    try {
        conn = await pool.getConnection();
        const { COMPANY_NAME, COMPANY_CITY } = req.body;
        const result = await conn.query("UPDATE company SET COMPANY_NAME = ?, COMPANY_CITY = ? WHERE COMPANY_ID = ?", [COMPANY_NAME, COMPANY_CITY, req.params.id]);
        res.json({ success: true, message: 'Company fully updated', result: result });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    } finally {
        if (conn) conn.release();
    }
});

/**
 * @openapi
 * /customer/{code}:
 *   put:
 *     summary: Fully updates a customer's information
 *     parameters:
 *       - in: path
 *         name: code
 *         required: true
 *         schema:
 *           type: string
 *         description: Customer code
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               CUST_NAME:
 *                 type: string
 *               CUST_CITY:
 *                 type: string
 *               WORKING_AREA:
 *                 type: string
 *               CUST_COUNTRY:
 *                 type: string
 *               GRADE:
 *                 type: integer
 *               OPENING_AMT:
 *                 type: number
 *                 format: float
 *               RECEIVE_AMT:
 *                 type: number
 *                 format: float
 *               PAYMENT_AMT:
 *                 type: number
 *                 format: float
 *               OUTSTANDING_AMT:
 *                 type: number
 *                 format: float
 *               PHONE_NO:
 *                 type: string
 *               AGENT_CODE:
 *                 type: string
 *     responses:
 *       200:
 *         description: Customer information fully updated
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 result:
 *                   type: object
 *       400:
 *         description: Input validation error
 *       500:
 *         description: Server error
 */

app.put('/customer/:code', [
    body('CUST_NAME').trim().escape(),
    body('CUST_CITY').trim().escape(),
    body('WORKING_AREA').trim().escape(),
    body('CUST_COUNTRY').trim().escape(),
    body('GRADE').isNumeric(),
    body('OPENING_AMT').isFloat(),
    body('RECEIVE_AMT').isFloat(),
    body('PAYMENT_AMT').isFloat(),
    body('OUTSTANDING_AMT').isFloat(),
    body('PHONE_NO').trim().escape(),
    body('AGENT_CODE').trim().escape()
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    let conn;
    try {
        conn = await pool.getConnection();
        const { CUST_NAME, CUST_CITY, WORKING_AREA, CUST_COUNTRY, GRADE, OPENING_AMT, RECEIVE_AMT, PAYMENT_AMT, OUTSTANDING_AMT, PHONE_NO, AGENT_CODE } = req.body;
        const result = await conn.query("UPDATE customer SET CUST_NAME = ?, CUST_CITY = ?, WORKING_AREA = ?, CUST_COUNTRY = ?, GRADE = ?, OPENING_AMT = ?, RECEIVE_AMT = ?, PAYMENT_AMT = ?, OUTSTANDING_AMT = ?, PHONE_NO = ?, AGENT_CODE = ? WHERE CUST_CODE = ?", [CUST_NAME, CUST_CITY, WORKING_AREA, CUST_COUNTRY, GRADE, OPENING_AMT, RECEIVE_AMT, PAYMENT_AMT, OUTSTANDING_AMT, PHONE_NO, AGENT_CODE, req.params.code]);
        res.json({ success: true, message: 'Customer fully updated', result: result });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    } finally {
        if (conn) conn.release();
    }
});

/**
 * @openapi
 * /orders/{ordNum}:
 *   put:
 *     summary: Fully updates an order
 *     parameters:
 *       - in: path
 *         name: ordNum
 *         required: true
 *         schema:
 *           type: string
 *         description: Order Number
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               ORD_AMOUNT:
 *                 type: number
 *                 format: float
 *               ADVANCE_AMOUNT:
 *                 type: number
 *                 format: float
 *               ORD_DATE:
 *                 type: string
 *                 format: date
 *               CUST_CODE:
 *                 type: string
 *               AGENT_CODE:
 *                 type: string
 *               ORD_DESCRIPTION:
 *                 type: string
 *     responses:
 *       200:
 *         description: Order fully updated
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 result:
 *                   type: object
 *       400:
 *         description: Input validation error
 *       500:
 *         description: Server error
 */

app.put('/orders/:ordNum', [
    body('ORD_AMOUNT').isFloat(),
    body('ADVANCE_AMOUNT').isFloat(),
    body('ORD_DATE').isDate(),
    body('CUST_CODE').trim().escape(),
    body('AGENT_CODE').trim().escape(),
    body('ORD_DESCRIPTION').trim().escape()
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    let conn;
    try {
        conn = await pool.getConnection();  // Corrected 'awaiting' to 'await' here
        const { ORD_AMOUNT, ADVANCE_AMOUNT, ORD_DATE, CUST_CODE, AGENT_CODE, ORD_DESCRIPTION } = req.body;
        const result = await conn.query("UPDATE orders SET ORD_AMOUNT = ?, ADVANCE_AMOUNT = ?, ORD_DATE = ?, CUST_CODE = ?, AGENT_CODE = ?, ORD_DESCRIPTION = ? WHERE ORD_NUM = ?", [ORD_AMOUNT, ADVANCE_AMOUNT, ORD_DATE, CUST_CODE, AGENT_CODE, ORD_DESCRIPTION, req.params.ordNum]);
        res.json({ success: true, message: 'Order fully updated', result: result });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    } finally {
        if (conn) conn.release();
    }
});



/**
 * @openapi
 * /agents/{code}:
 *   delete:
 *     summary: Deletes an agent
 *     parameters:
 *       - in: path
 *         name: code
 *         required: true
 *         schema:
 *           type: string
 *         description: Agent code
 *     responses:
 *       200:
 *         description: Agent deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 result:
 *                   type: object
 *       500:
 *         description: Server error
 */

app.delete('/agents/:code', async (req, res) => {
    let conn;
    try {
        conn = await pool.getConnection();
        const result = await conn.query("DELETE FROM agents WHERE AGENT_CODE = ?", [req.params.code]);
        res.json({ success: true, message: 'Agent deleted', result: result });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    } finally {
        if (conn) conn.release();
    }
});


/**
 * @openapi
 * /company/{id}:
 *   delete:
 *     summary: Deletes a company
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Company ID
 *     responses:
 *       200:
 *         description: Company deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 result:
 *                   type: object
 *       500:
 *         description: Server error
 */

app.delete('/company/:id', async (req, res) => {
    let conn;
    try {
        conn = await pool.getConnection();
        const result = await conn.query("DELETE FROM company WHERE COMPANY_ID = ?", [req.params.id]);
        res.json({ success: true, message: 'Company deleted', result: result });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    } finally {
        if (conn) conn.release();
    }
});


/**
 * @openapi
 * /customer/{code}:
 *   delete:
 *     summary: Deletes a customer
 *     parameters:
 *       - in: path
 *         name: code
 *         required: true
 *         schema:
 *           type: string
 *         description: Customer code
 *     responses:
 *       200:
 *         description: Customer deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 result:
 *                   type: object
 *       500:
 *         description: Server error
 */

app.delete('/customer/:code', async (req, res) => {
    let conn;
    try {
        conn = await pool.getConnection();
        const result = await conn.query("DELETE FROM customer WHERE CUST_CODE = ?", [req.params.code]);
        res.json({ success: true, message: 'Customer deleted', result: result });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    } finally {
        if (conn) conn.release();
    }
});



app.delete('/orders/:ordNum', async (req, res) => {
    let conn;
    try {
        conn = await pool.getConnection();
        const result = await conn.query("DELETE FROM orders WHERE ORD_NUM = ?", [req.params.ordNum]);
        res.json({ success: true, message: 'Order deleted', result: result });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    } finally {
        if (conn) conn.release();
    }
});




app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`);
});



