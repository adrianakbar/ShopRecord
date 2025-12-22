# AI Quick Add Backend - Setup Guide

## Setup API Key

1. **Get Google AI API Key:**
   - Visit: https://aistudio.google.com/apikey
   - Create or copy your API key

2. **Add to .env.local:**
   ```bash
   GOOGLE_AI_API_KEY=your_api_key_here
   ```

3. **Restart development server:**
   ```bash
   npm run dev
   ```

## API Endpoints

### 1. POST /api/ai/parse
Parse natural language expense input using Gemini AI.

**Request:**
```json
{
  "text": "beli dada ayam mentah 19 rb kemarin"
}
```

**Response:**
```json
{
  "success": true,
  "expenses": [
    {
      "item": "Dada Ayam Mentah",
      "amount": 19000,
      "category": "Groceries",
      "categoryId": "uuid-here",
      "date": "2025-12-21",
      "confidence": 95
    }
  ],
  "originalText": "beli dada ayam mentah 19 rb kemarin",
  "processingTimeMs": 1250
}
```

### 2. GET /api/ai/parse
Test AI connection status.

**Response:**
```json
{
  "status": "connected",
  "apiKeyConfigured": true,
  "model": "gemini-1.5-flash"
}
```

## Testing

### Test Connection:
```bash
curl http://localhost:3000/api/ai/parse | jq
```

### Test Parsing (Single Transaction):
```bash
curl -X POST http://localhost:3000/api/ai/parse \
  -H "Content-Type: application/json" \
  -d '{"text": "beli dada ayam mentah 19 rb kemarin"}' \
  | jq
```

### Test Parsing (Multiple Transactions):
```bash
curl -X POST http://localhost:3000/api/ai/parse \
  -H "Content-Type: application/json" \
  -d '{"text": "makan siang 35rb, kopi 15k"}' \
  | jq
```

### Test Complex Input:
```bash
curl -X POST http://localhost:3000/api/ai/parse \
  -H "Content-Type: application/json" \
  -d '{"text": "kemarin beli sayuran 25rb sama daging 45k, terus hari ini bensin 50rb"}' \
  | jq
```

## Features

✅ **Natural Language Parsing** - Mendukung bahasa Indonesia  
✅ **Multi-Transaction** - Parse multiple expenses dalam satu input  
✅ **Smart Category Detection** - Auto categorize berdasarkan context  
✅ **Flexible Date Parsing** - "kemarin", "2 hari lalu", "minggu lalu"  
✅ **Price Format Support** - "19rb", "19k", "19.000", "1jt", "1,5jt"  
✅ **Confidence Score** - Tingkat kepercayaan hasil parsing (0-100)  
✅ **Logging** - Semua parsing dicatat di `ai_parsing_logs` table  
✅ **Category Mapping** - Auto match dengan categories di database  

## Supported Categories

1. Food & Dining - Makanan, restaurant, makan siang/malam
2. Groceries - Belanja, pasar, supermarket, bahan makanan
3. Transportation - Transport, ojek, uber, bensin, parkir
4. Utilities - Listrik, air, internet, pulsa
5. Entertainment - Hiburan, bioskop, netflix, game
6. Shopping - Belanja barang, fashion, elektronik
7. Healthcare - Kesehatan, obat, dokter, rumah sakit
8. Coffee & Cafe - Kopi, cafe, starbucks

## Example Inputs

| Input | Parsed Result |
|-------|--------------|
| "beli dada ayam mentah 19 rb kemarin" | Item: Dada Ayam Mentah, Amount: 19000, Category: Groceries, Date: Yesterday |
| "makan siang 35rb, kopi 15k" | 2 transactions: Makan Siang (35k, Food) + Kopi (15k, Cafe) |
| "bensin 50rb hari ini" | Item: Bensin, Amount: 50000, Category: Transportation, Date: Today |
| "listrik bulan ini 150rb" | Item: Listrik, Amount: 150000, Category: Utilities |
| "netflix 55k minggu lalu" | Item: Netflix, Amount: 55000, Category: Entertainment |

## Error Handling

API akan return error jika:
- API key tidak dikonfigurasi
- Text input kosong
- Gagal connect ke Gemini API
- Response dari AI tidak valid JSON

## Performance

- Average processing time: 1-2 seconds
- Model: gemini-1.5-flash (fast & cost-effective)
- All requests logged with processing time

## Database Logging

Setiap parsing request dicatat di table `ai_parsing_logs`:
- User ID
- Input text
- Parsed result
- Success status
- Error message (if any)
- Processing time in milliseconds
- Timestamp

Query log:
```sql
SELECT * FROM ai_parsing_logs 
WHERE user_id = 'your-user-id' 
ORDER BY created_at DESC 
LIMIT 10;
```
