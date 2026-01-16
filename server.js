const express = require('express');
require('dotenv').config();
const path = require('path');
const cors = require('cors');
const axios = require('axios');
const dns = require('dns');
const app = express();
const {connectDB} = require('./database/db');
const session = require('express-session');

// Force IPv4 for DNS resolution to avoid IPv6 connection issues
dns.setDefaultResultOrder('ipv4first');


const MongoStore = require('connect-mongo');

// Middleware
app.use(cors());
app.use(session({
  secret: 'secret',
  store: MongoStore.create({ mongoUrl: process.env.MONGODB_URI}),
  resave: false,
  saveUninitialized: false
}));

app.set('view engine', 'ejs');
app.set('views',path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());
connectDB();
const port = process.env.PORT
const {User} = require('./database/schema');

// n8n webhook URL for chatbot
// const N8N_WEBHOOK_URL = 'https://n8n.srv1162962.hstgr.cloud/webhook-test/chat-bot';
const N8N_WEBHOOK_URL = 'https://n8n.srv1162962.hstgr.cloud/webhook/chat-bot';

// Store conversation context (in production, use a database)
const conversationContext = new Map();

// Retry function for webhook calls
async function callWebhookWithRetry(url, payload, maxRetries = 3) {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            console.log(`Attempting webhook call (attempt ${attempt}/${maxRetries})...`);
            const response = await axios.post(url, payload, {
                headers: {
                    'Content-Type': 'application/json',
                },
                timeout: 30000, // Reduced from 100s to 30s
                family: 4 // Force IPv4
            });
            console.log('Webhook call successful');
            return response;
        } catch (error) {
            console.error(`Attempt ${attempt} failed:`, error.code || error.message);
            
            // Don't retry on certain errors
            if (error.response && error.response.status < 500) {
                throw error; // Client errors shouldn't be retried
            }
            
            // If this was the last attempt, throw the error
            if (attempt === maxRetries) {
                throw error;
            }
            
            // Wait before retrying (exponential backoff)
            const delay = Math.min(1000 * Math.pow(2, attempt - 1), 5000);
            console.log(`Waiting ${delay}ms before retry...`);
            await new Promise(resolve => setTimeout(resolve, delay));
        }
    }
}

// Chatbot API endpoint
app.post('/api/chat', async (req, res) => {
    try {
        const { message, sessionId = 'default' } = req.body;
        
        if (!message) {
            return res.status(400).json({ error: 'Message is required' });
        }

        // Get or create conversation context
        let context = conversationContext.get(sessionId) || {
            history: [],
            userPreferences: {}
        };

        // Prepare comprehensive data for n8n webhook
        const n8nPayload = {
            message: message,
            sessionId: sessionId,
            context: {
                history: context.history,
                userPreferences: context.userPreferences
            },
            timestamp: new Date().toISOString()
        };

        // Send full context to n8n webhook with retry logic
        const n8nResponse = await callWebhookWithRetry(N8N_WEBHOOK_URL, n8nPayload);

        // Extract response from n8n - handle different response formats
        let botReply;
        if (n8nResponse.data) {
            // Check various possible response formats from n8n
            botReply = n8nResponse.data.reply || 
                      n8nResponse.data.response || 
                      n8nResponse.data.output || 
                      n8nResponse.data.text ||
                      (typeof n8nResponse.data === 'string' ? n8nResponse.data : null);
        }
        
        // Fallback if no valid response found
        if (!botReply) {
            botReply = 'I received your message but need more context to provide a helpful response about engineering admissions.';
        }

        // Update conversation context with the new exchange
        context.history.push({
            user: message,
            bot: botReply,
            timestamp: new Date().toISOString()
        });

        // Keep only last 10 messages in history
        if (context.history.length > 10) {
            context.history = context.history.slice(-10);
        }

        conversationContext.set(sessionId, context);

        res.json({
            reply: botReply,
            sessionId: sessionId,
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        console.error('Error processing chat message:', error);
        
        // Fallback responses for engineering admission queries
        const fallbackResponses = [
            "I'm having trouble accessing the admission database right now. However, I can help you with general queries about engineering colleges, cutoffs, and admission processes. What specific information are you looking for?",
            "It seems I'm experiencing some technical difficulties. Could you please rephrase your admission-related question? I'm here to help with college predictions, cutoffs, and guidance.",
            "I apologize, but I'm unable to fetch the latest information at the moment. You can still use our college predictor, cutoff tools, or ask me about general admission guidance. How can I assist you?"
        ];
        
        const randomResponse = fallbackResponses[Math.floor(Math.random() * fallbackResponses.length)];
        
        res.json({
            reply: randomResponse,
            error: true
        });
    }
});

// Health check endpoint for chatbot
app.get('/api/health', async (req, res) => {
    let webhookStatus = 'unknown';
    
    // Check if n8n webhook is reachable
    try {
        await axios.get(N8N_WEBHOOK_URL.replace('/webhook/', '/webhook-test/'), { 
            timeout: 5000,
            family: 4,
            validateStatus: () => true // Accept any status code
        });
        webhookStatus = 'reachable';
    } catch (error) {
        webhookStatus = `unreachable: ${error.code || error.message}`;
    }
    
    res.json({ 
        status: 'OK', 
        timestamp: new Date().toISOString(),
        service: 'EngiMate Engineering Admission Chatbot API',
        webhookStatus: webhookStatus,
        webhookUrl: N8N_WEBHOOK_URL
    });
});

// Get conversation history
app.get('/api/conversation/:sessionId', (req, res) => {
    const { sessionId } = req.params;
    const context = conversationContext.get(sessionId);
    
    if (!context) {
        return res.status(404).json({ error: 'Conversation not found' });
    }
    
    res.json({
        sessionId,
        history: context.history,
        preferences: context.userPreferences
    });
});

// Clear conversation history
app.delete('/api/conversation/:sessionId', (req, res) => {
    const { sessionId } = req.params;
    conversationContext.delete(sessionId);
    
    res.json({ 
        message: 'Conversation cleared successfully',
        sessionId 
    });
});

app.get('/',(req,res)=>{
  res.render('pcm');
});


const pcmRoutes = require('./routes/pcmroute'); 
app.use('/pcm',pcmRoutes);

const collegePredictorPCMRoutes = require('./routes/collegePredictorPCMroute'); 
app.use('/collegePredictorPCM',collegePredictorPCMRoutes);


const collegePagePCMRoutes = require('./routes/collegePagePCMroute'); 
app.use('/collegePagePCM',collegePagePCMRoutes);

const prefernceListPCMRoutes = require('./routes/prefernceListPCMroute'); 
app.use('/prefernceListPCM',prefernceListPCMRoutes);


const branchwiseCutoffPCMRoutes = require('./routes/branchwiseCutoffPCMroute'); 
app.use('/branchwiseCutoffPCM',branchwiseCutoffPCMRoutes);

app.get('/api/activate', (req, res) => {
  res.json({ message: 'Hello from the server!' });
});

app.listen(port,()=>{
    console.log('server listing at port 9000');
})

